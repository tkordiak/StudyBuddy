import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { storage } from "./storage";
import { User } from "@shared/schema";
import { randomBytes } from "crypto";
import { sendMagicLinkEmail } from "./services/email";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "default-secret-change-in-production",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));

  // Magic link request endpoint
  app.post("/api/auth/request-magic-link", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      // Generate magic link token
      const token = randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      // Save magic link
      await storage.createMagicLink(email, token, expiresAt);

      // Send email (in development, log to console)
      if (process.env.NODE_ENV === "development") {
        console.log(`Magic link for ${email}: ${process.env.BASE_URL || "http://localhost:5000"}/auth/verify?token=${token}`);
      } else {
        await sendMagicLinkEmail(email, token);
      }

      res.json({ message: "Magic link sent to your email" });
    } catch (error) {
      console.error("Magic link request error:", error);
      res.status(500).json({ error: "Failed to send magic link" });
    }
  });

  // Magic link verification via GET (for email clicks)
  app.get("/auth/verify", async (req, res) => {
    try {
      const { token } = req.query;

      if (!token) {
        return res.redirect("/#/auth?error=missing-token");
      }

      const magicLink = await storage.getMagicLinkByToken(token as string);

      if (!magicLink) {
        return res.redirect("/#/auth?error=invalid-token");
      }

      if (magicLink.used) {
        return res.redirect("/#/auth?error=token-used");
      }

      if (new Date() > magicLink.expiresAt) {
        return res.redirect("/#/auth?error=token-expired");
      }

      // Mark token as used
      await storage.markMagicLinkUsed(token as string);

      // Find or create user
      let user = await storage.getUserByEmail(magicLink.email);
      if (!user) {
        user = await storage.createUser({ email: magicLink.email });
      }

      // Set user session and save it
      req.session.userId = user.id;
      
      // Force session save before redirect
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.redirect("/#/auth?error=session-failed");
        }
        // Redirect to dashboard after session is saved
        res.redirect("/#/dashboard");
      });
    } catch (error) {
      console.error("Magic link verification error:", error);
      res.redirect("/#/auth?error=verification-failed");
    }
  });

  // Magic link verification endpoint (for API calls)
  app.post("/api/auth/verify-magic-link", async (req, res) => {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({ error: "Token is required" });
      }

      const magicLink = await storage.getMagicLinkByToken(token);

      if (!magicLink) {
        return res.status(400).json({ error: "Invalid token" });
      }

      if (magicLink.used) {
        return res.status(400).json({ error: "Token already used" });
      }

      if (new Date() > magicLink.expiresAt) {
        return res.status(400).json({ error: "Token expired" });
      }

      // Mark token as used
      await storage.markMagicLinkUsed(token);

      // Find or create user
      let user = await storage.getUserByEmail(magicLink.email);
      if (!user) {
        user = await storage.createUser({ email: magicLink.email });
      }

      // Set user session
      req.session.userId = user.id;

      res.json(user);
    } catch (error) {
      console.error("Magic link verification error:", error);
      res.status(500).json({ error: "Failed to verify magic link" });
    }
  });

  // Get current user endpoint
  app.get("/api/user", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    res.json(user);
  });

  // Logout endpoint
  app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });
}

export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
}

export async function loadUser(req: Request, res: Response, next: NextFunction) {
  if (req.session.userId) {
    const user = await storage.getUser(req.session.userId);
    if (user) {
      req.user = user;
    }
  }
  next();
}
