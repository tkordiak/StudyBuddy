import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, loadUser } from "./auth";
import { generateTailoredMaterials, scrapeJobDescription } from "./services/ai";
import { parseFile, validateResumeContent } from "./services/fileParser";
import { generateDocx, generatePdf } from "./services/export";
import Stripe from "stripe";
import multer from "multer";

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY not found, Stripe functionality will be disabled');
}

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-07-30.basil",
}) : null;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and Word documents are allowed.'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);
  
  // Load user middleware
  app.use(loadUser);

  // File upload endpoint
  app.post("/api/uploads", isAuthenticated, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      console.log(`Processing file: ${req.file.originalname}, size: ${req.file.size} bytes, type: ${req.file.mimetype}`);
      
      const text = await parseFile(req.file.buffer, req.file.originalname);
      const validation = validateResumeContent(text);

      if (!validation.isValid) {
        return res.status(400).json({ error: validation.errors.join(', ') });
      }

      const upload = await storage.createUpload({
        userId: req.user!.id,
        filename: req.file.originalname,
        text,
      });

      res.json({ 
        id: upload.id,
        filename: upload.filename,
        text: upload.text,
        wordCount: text.split(/\s+/).length,
        charCount: text.length,
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Upload failed" });
    }
  });

  // Generate endpoint
  app.post("/api/generate", isAuthenticated, async (req, res) => {
    try {
      const { company, role, jobUrl, resumeText } = req.body;

      if (!company || !role || !resumeText) {
        return res.status(400).json({ error: "Company, role, and resume text are required" });
      }

      // Check user credits
      if ((req.user!.credits || 0) < 1) {
        return res.status(402).json({ error: "Insufficient credits" });
      }

      // Validate resume content
      const validation = validateResumeContent(resumeText);
      if (!validation.isValid) {
        return res.status(400).json({ error: validation.errors.join(', ') });
      }

      // Scrape job description if URL provided
      let jdExtract;
      if (jobUrl) {
        try {
          jdExtract = await scrapeJobDescription(jobUrl);
        } catch (error) {
          console.warn("Job description scraping failed:", error);
          // Continue without job description
        }
      }

      // Generate materials
      const result = await generateTailoredMaterials({
        company,
        role,
        jobUrl,
        resumeText,
        jdExtract,
      });

      // Save generation
      const generation = await storage.createGeneration({
        userId: req.user!.id,
        company,
        role,
        jobUrl,
        resumeInput: resumeText,
        jdExtract,
        tailoredResumeMd: result.tailoredResumeMd,
        coverLetterMd: result.coverLetterMd,
        tokensUsed: result.tokensUsed,
      });

      // Deduct credit
      await storage.updateUserCredits(req.user!.id, (req.user!.credits || 0) - 1);

      res.json({
        id: generation.id,
        tailoredResumeMd: result.tailoredResumeMd,
        coverLetterMd: result.coverLetterMd,
        tokensUsed: result.tokensUsed,
      });
    } catch (error) {
      console.error("Generation error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Generation failed" });
    }
  });

  // Get generation history
  app.get("/api/history", isAuthenticated, async (req, res) => {
    try {
      const generations = await storage.getGenerationsByUserId(req.user!.id);
      res.json(generations);
    } catch (error) {
      console.error("History error:", error);
      res.status(500).json({ error: "Failed to fetch history" });
    }
  });

  // Get specific generation
  app.get("/api/generation/:id", isAuthenticated, async (req, res) => {
    try {
      const generation = await storage.getGeneration(req.params.id);
      
      if (!generation || generation.userId !== req.user!.id) {
        return res.status(404).json({ error: "Generation not found" });
      }

      res.json(generation);
    } catch (error) {
      console.error("Generation fetch error:", error);
      res.status(500).json({ error: "Failed to fetch generation" });
    }
  });

  // Export endpoints
  app.post("/api/export/docx", isAuthenticated, async (req, res) => {
    try {
      const { content, title = "Document" } = req.body;
      
      if (!content) {
        return res.status(400).json({ error: "Content is required" });
      }

      const buffer = await generateDocx(content, title);
      
      res.set({
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${title}.docx"`,
        'Content-Length': buffer.length,
      });
      
      res.send(buffer);
    } catch (error) {
      console.error("DOCX export error:", error);
      res.status(500).json({ error: "Failed to generate DOCX" });
    }
  });

  app.post("/api/export/pdf", isAuthenticated, async (req, res) => {
    try {
      const { content, title = "Document" } = req.body;
      
      if (!content) {
        return res.status(400).json({ error: "Content is required" });
      }

      const buffer = await generatePdf(content, title);
      
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${title}.pdf"`,
        'Content-Length': buffer.length,
      });
      
      res.send(buffer);
    } catch (error) {
      console.error("PDF export error:", error);
      res.status(500).json({ error: "Failed to generate PDF" });
    }
  });

  // Stripe payment endpoints (only if Stripe is configured)
  if (stripe) {
    app.post("/api/create-payment-intent", isAuthenticated, async (req, res) => {
      try {
        const { amount, credits } = req.body;
        
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(amount * 100), // Convert to cents
          currency: "usd",
          metadata: {
            userId: req.user!.id,
            credits: credits.toString(),
          },
        });
        
        res.json({ clientSecret: paymentIntent.client_secret });
      } catch (error: any) {
        res.status(500).json({ error: "Error creating payment intent: " + error.message });
      }
    });

    app.post("/api/webhook/stripe", async (req, res) => {
      const sig = req.headers['stripe-signature'] as string;
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

      if (!webhookSecret) {
        return res.status(400).send('Webhook secret not configured');
      }

      try {
        const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);

        if (event.type === 'payment_intent.succeeded') {
          const paymentIntent = event.data.object as any;
          const userId = paymentIntent.metadata.userId;
          const credits = parseInt(paymentIntent.metadata.credits);

          if (userId && credits) {
            const user = await storage.getUser(userId);
            if (user) {
              await storage.updateUserCredits(userId, (user.credits || 0) + credits);
            }
          }
        }

        res.json({ received: true });
      } catch (error) {
        console.error('Stripe webhook error:', error);
        res.status(400).send('Webhook signature verification failed');
      }
    });
  }

  const httpServer = createServer(app);
  return httpServer;
}
