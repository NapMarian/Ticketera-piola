const nodemailer = require('nodemailer');
require('dotenv').config();

// Check which email provider to use
const useResend = !!process.env.RESEND_API_KEY;

let resend = null;
let transporter = null;

// Initialize Resend if API key is provided
if (useResend) {
  const { Resend } = require('resend');
  resend = new Resend(process.env.RESEND_API_KEY);
  console.log('📧 Email: Using Resend API');
} else {
  // Initialize SMTP transporter
  const smtpHost = process.env.SMTP_HOST || 'mail.cteamglobal.com';
  const smtpPort = parseInt(process.env.SMTP_PORT) || 465;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (smtpUser && smtpPass) {
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass
      },
      tls: {
        rejectUnauthorized: false
      }
    });
    console.log(`📧 Email: Using SMTP (${smtpHost}:${smtpPort})`);
  } else {
    console.warn('⚠️ Email: No SMTP credentials configured. Emails will not be sent.');
  }
}

const sendEmail = async ({ to, subject, html }) => {
  const from = process.env.EMAIL_FROM || 'C-Team Soporte <soporte@cteamglobal.com>';

  // Log email attempt
  console.log(`📤 Sending email to: ${to}`);
  console.log(`   Subject: ${subject}`);
  console.log(`   From: ${from}`);
  console.log(`   Provider: ${useResend ? 'Resend' : 'SMTP'}`);

  try {
    if (useResend && resend) {
      // Use Resend API
      const { data, error } = await resend.emails.send({
        from,
        to: Array.isArray(to) ? to : [to],
        subject,
        html
      });

      if (error) {
        console.error('❌ Resend error:', error);
        throw new Error(error.message);
      }

      console.log('✅ Email sent via Resend:', data.id);
      return { messageId: data.id };
    } else if (transporter) {
      // Use SMTP
      const info = await transporter.sendMail({
        from,
        to,
        subject,
        html
      });
      console.log('✅ Email sent via SMTP:', info.messageId);
      return info;
    } else {
      console.warn('⚠️ Email not sent: No email provider configured');
      return { messageId: null, warning: 'No email provider configured' };
    }
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    // Don't throw - let the app continue even if email fails
    return { error: error.message };
  }
};

// Test SMTP connection on startup (only in development)
if (transporter && process.env.NODE_ENV === 'development') {
  transporter.verify((error, success) => {
    if (error) {
      console.error('❌ SMTP connection failed:', error.message);
    } else {
      console.log('✅ SMTP connection verified');
    }
  });
}

module.exports = { sendEmail };
