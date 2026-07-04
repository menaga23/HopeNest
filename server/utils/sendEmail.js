const nodemailer = require('nodemailer');

/**
 * Utility function to send confirmation emails.
 * Falls back to console logs in development if credentials are empty.
 */
const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const hasCredentials = process.env.EMAIL_USER && process.env.EMAIL_PASS;
    
    if (!hasCredentials) {
      console.log("\n✉️  [HopeNest Mock Email]");
      console.log(`TO:      ${to}`);
      console.log(`SUBJECT: ${subject}`);
      console.log(`CONTENT: ${text}`);
      console.log("-----------------------------------------\n");
      return { success: true, mock: true };
    }

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"HopeNest" <noreply@hopenest.org>',
      to,
      subject,
      text,
      html
    });

    console.log(`✉️ Email successfully dispatched to ${to} (MessageId: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Email dispatch failed:", error.message);
    return { success: false, error: error.message };
  }
};

module.exports = sendEmail;
