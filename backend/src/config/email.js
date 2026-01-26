const nodemailer = require('nodemailer');
const { Resend } = require('resend');
require('dotenv').config();

// Use Resend if API key is provided (recommended for cloud deployments)
const useResend = !!process.env.RESEND_API_KEY;
const resend = useResend ? new Resend(process.env.RESEND_API_KEY) : null;

// Fallback to SMTP if no Resend key
const smtpPort = parseInt(process.env.SMTP_PORT) || 465;
const transporter = !useResend ? nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'mail.cteamglobal.com',
  port: smtpPort,
  secure: smtpPort === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
}) : null;

const sendEmail = async ({ to, subject, html }) => {
  const from = process.env.EMAIL_FROM || 'C-Team Soporte <soporte@cteamglobal.com>';

  try {
    if (useResend) {
      // Use Resend API
      const { data, error } = await resend.emails.send({
        from,
        to: Array.isArray(to) ? to : [to],
        subject,
        html
      });

      if (error) {
        throw new Error(error.message);
      }

      console.log('Email sent via Resend:', data.id);
      return { messageId: data.id };
    } else {
      // Use SMTP
      const info = await transporter.sendMail({
        from,
        to,
        subject,
        html
      });
      console.log('Email sent via SMTP:', info.messageId);
      return info;
    }
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = { sendEmail };
