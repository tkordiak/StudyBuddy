import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "localhost",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendMagicLinkEmail(email: string, token: string) {
  // Use the correct deployment URL for production
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? "https://study-buddy-TomaszKordiak.replit.app"
    : process.env.REPLIT_DEV_DOMAIN 
      ? `https://${process.env.REPLIT_DEV_DOMAIN}`
      : "http://localhost:5000";
      
  const magicLink = `${baseUrl}/auth/verify?token=${token}`;
  
  // Log the magic link for debugging
  console.log(`Magic link for ${email}: ${magicLink}`);

  const mailOptions = {
    from: process.env.EMAIL_FROM || "noreply@tailoredapply.app",
    to: email,
    subject: "Sign in to TailoredApply",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563EB;">Welcome to TailoredApply</h1>
        <p>Click the link below to sign in to your account:</p>
        <a href="${magicLink}" style="display: inline-block; background-color: #2563EB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 16px 0;">
          Sign In to TailoredApply
        </a>
        <p>This link will expire in 15 minutes.</p>
        <p>If you didn't request this email, you can safely ignore it.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}
