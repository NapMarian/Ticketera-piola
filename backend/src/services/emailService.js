const { sendEmail } = require('../config/email');
const { getStatusLabel, getPriorityLabel } = require('../utils/helpers');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const emailTemplates = {
  ticketCreated: (ticket) => ({
    subject: `[${ticket.ticketNumber}] Ticket creado: ${ticket.title}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #6366f1; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
          .ticket-info { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
          .btn { display: inline-block; background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 15px; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>C-Team Ticketera</h1>
          </div>
          <div class="content">
            <h2>¡Tu ticket ha sido creado!</h2>
            <p>Hola ${ticket.clientName},</p>
            <p>Hemos recibido tu solicitud y la estamos procesando.</p>

            <div class="ticket-info">
              <p><strong>Número de ticket:</strong> ${ticket.ticketNumber}</p>
              <p><strong>Asunto:</strong> ${ticket.title}</p>
              <p><strong>Prioridad:</strong> ${getPriorityLabel(ticket.priority)}</p>
              <p><strong>Estado:</strong> ${getStatusLabel(ticket.status)}</p>
            </div>

            <p>Puedes seguir el estado de tu ticket y comunicarte con nuestro equipo usando el siguiente enlace:</p>

            <a href="${FRONTEND_URL}/ticket/${ticket.ticketNumber}" class="btn">Ver mi ticket</a>

            <p style="margin-top: 20px; color: #6b7280; font-size: 14px;">
              Guarda este correo, ya que contiene el enlace único para acceder a tu ticket.
            </p>
          </div>
          <div class="footer">
            <p>Este es un correo automático de C-Team Ticketera.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  ticketAssigned: (ticket, agent) => ({
    subject: `[${ticket.ticketNumber}] Ticket asignado`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #6366f1; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
          .btn { display: inline-block; background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 15px; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>C-Team Ticketera</h1>
          </div>
          <div class="content">
            <h2>Tu ticket ha sido asignado</h2>
            <p>Hola ${ticket.clientName},</p>
            <p>Tu ticket <strong>${ticket.ticketNumber}</strong> ha sido asignado a <strong>${agent.name}</strong>, quien se pondrá en contacto contigo pronto.</p>

            <a href="${FRONTEND_URL}/ticket/${ticket.ticketNumber}" class="btn">Ver mi ticket</a>
          </div>
          <div class="footer">
            <p>Este es un correo automático de C-Team Ticketera.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  newMessage: (ticket, message, isClient = true) => ({
    subject: `[${ticket.ticketNumber}] Nueva respuesta en tu ticket`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #6366f1; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
          .message-box { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #6366f1; }
          .btn { display: inline-block; background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 15px; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>C-Team Ticketera</h1>
          </div>
          <div class="content">
            <h2>Nueva respuesta en tu ticket</h2>
            <p>Hola ${ticket.clientName},</p>
            <p>Hay una nueva respuesta en tu ticket <strong>${ticket.ticketNumber}</strong>:</p>

            <div class="message-box">
              <p style="color: #6b7280; font-size: 12px; margin-bottom: 10px;">
                <strong>${message.senderName || 'Agente'}</strong>
              </p>
              <p>${message.content}</p>
            </div>

            <a href="${FRONTEND_URL}/ticket/${ticket.ticketNumber}" class="btn">Responder</a>
          </div>
          <div class="footer">
            <p>Este es un correo automático de C-Team Ticketera.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  ticketResolved: (ticket) => ({
    subject: `[${ticket.ticketNumber}] Ticket resuelto`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #22c55e; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
          .rating { text-align: center; margin: 20px 0; }
          .star { font-size: 32px; cursor: pointer; color: #d1d5db; text-decoration: none; margin: 0 5px; }
          .btn { display: inline-block; background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 15px; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>¡Ticket Resuelto!</h1>
          </div>
          <div class="content">
            <h2>Tu solicitud ha sido atendida</h2>
            <p>Hola ${ticket.clientName},</p>
            <p>Nos complace informarte que tu ticket <strong>${ticket.ticketNumber}</strong> ha sido resuelto.</p>

            <p>¿Cómo calificarías la atención recibida?</p>

            <div class="rating">
              ${[1, 2, 3, 4, 5].map(i =>
                `<a href="${FRONTEND_URL}/ticket/${ticket.ticketNumber}/rate/${i}" class="star">★</a>`
              ).join('')}
            </div>

            <p style="text-align: center;">
              <a href="${FRONTEND_URL}/ticket/${ticket.ticketNumber}" class="btn">Ver ticket completo</a>
            </p>

            <p style="margin-top: 20px; color: #6b7280; font-size: 14px;">
              Si necesitas reabrir este ticket, puedes hacerlo desde el enlace anterior.
            </p>
          </div>
          <div class="footer">
            <p>Gracias por confiar en C-Team.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  slaWarning: (ticket, hoursRemaining) => ({
    subject: `⚠️ [${ticket.ticketNumber}] SLA por vencer`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f59e0b; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
          .warning-box { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 15px 0; }
          .btn { display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 15px; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Alerta SLA</h1>
          </div>
          <div class="content">
            <h2>Ticket próximo a vencer</h2>

            <div class="warning-box">
              <p><strong>Ticket:</strong> ${ticket.ticketNumber}</p>
              <p><strong>Asunto:</strong> ${ticket.title}</p>
              <p><strong>Cliente:</strong> ${ticket.clientName}</p>
              <p><strong>Tiempo restante:</strong> ${Math.round(hoursRemaining)} horas</p>
            </div>

            <p>Este ticket requiere atención inmediata para cumplir con el SLA.</p>
          </div>
          <div class="footer">
            <p>C-Team Ticketera - Sistema de alertas</p>
          </div>
        </div>
      </body>
      </html>
    `
  })
};

const sendTicketCreatedEmail = async (ticket) => {
  const template = emailTemplates.ticketCreated(ticket);
  return await sendEmail({
    to: ticket.clientEmail,
    subject: template.subject,
    html: template.html
  });
};

const sendTicketAssignedEmail = async (ticket, agent) => {
  const template = emailTemplates.ticketAssigned(ticket, agent);
  return await sendEmail({
    to: ticket.clientEmail,
    subject: template.subject,
    html: template.html
  });
};

const sendNewMessageEmail = async (ticket, message, recipientEmail) => {
  const template = emailTemplates.newMessage(ticket, message);
  return await sendEmail({
    to: recipientEmail,
    subject: template.subject,
    html: template.html
  });
};

const sendTicketResolvedEmail = async (ticket) => {
  const template = emailTemplates.ticketResolved(ticket);
  return await sendEmail({
    to: ticket.clientEmail,
    subject: template.subject,
    html: template.html
  });
};

const sendSLAWarningEmail = async (ticket, agent, hoursRemaining) => {
  const template = emailTemplates.slaWarning(ticket, hoursRemaining);
  return await sendEmail({
    to: agent.email,
    subject: template.subject,
    html: template.html
  });
};

module.exports = {
  sendTicketCreatedEmail,
  sendTicketAssignedEmail,
  sendNewMessageEmail,
  sendTicketResolvedEmail,
  sendSLAWarningEmail
};
