const nodemailer = require('nodemailer');
require('dotenv').config();

const smtpPort = parseInt(process.env.SMTP_PORT) || 465;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'mail.cteamglobal.com',
  port: smtpPort,
  secure: smtpPort === 465, // true for 465 (SSL), false for 587 (TLS)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  tls: {
    rejectUnauthorized: false // Allow self-signed certificates
  }
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'C-Team Ticketera <noreply@cteam.com>',
      to,
      subject,
      html
    });
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = { transporter, sendEmail };
