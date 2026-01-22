const { Message, Ticket, User, TicketHistory } = require('../models');
const emailService = require('../services/emailService');
const notificationService = require('../services/notificationService');

// Send message (staff or client via token)
const sendMessage = async (req, res) => {
  try {
    const { ticketId, content, isInternal = false } = req.body;
    const { token } = req.query; // For client access

    let ticket;
    let senderName;
    let senderType;
    let userId = null;

    if (token) {
      // Client sending message via access token
      ticket = await Ticket.findOne({ where: { accessToken: token } });
      if (!ticket) {
        return res.status(404).json({ error: 'Ticket no encontrado' });
      }
      senderName = ticket.clientName;
      senderType = 'client';
    } else if (req.user) {
      // Staff sending message
      ticket = await Ticket.findByPk(ticketId);
      if (!ticket) {
        return res.status(404).json({ error: 'Ticket no encontrado' });
      }
      senderName = req.user.name;
      senderType = 'agent';
      userId = req.user.id;

      // Record first response time
      if (!ticket.firstResponseAt && senderType === 'agent') {
        await ticket.update({ firstResponseAt: new Date() });
      }
    } else {
      return res.status(401).json({ error: 'No autorizado' });
    }

    const message = await Message.create({
      ticketId: ticket.id,
      userId,
      senderName,
      senderType,
      content,
      isInternal: senderType === 'agent' ? isInternal : false
    });

    // Reload with user info
    await message.reload({
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'avatar'] }]
    });

    // Send email notification (don't wait)
    if (senderType === 'agent' && !isInternal) {
      emailService.sendNewMessageEmail(ticket, message, ticket.clientEmail).catch(console.error);
    } else if (senderType === 'client' && ticket.assignedAgentId) {
      const agent = await User.findByPk(ticket.assignedAgentId);
      if (agent) {
        emailService.sendNewMessageEmail(ticket, message, agent.email).catch(console.error);
      }
    }

    // Send app notification
    notificationService.notifyNewMessage(ticket, message, userId).catch(console.error);

    // Emit to socket room
    const io = req.app.get('io');
    if (io) {
      io.to(`ticket_${ticket.id}`).emit('new_message', {
        message: message.toJSON(),
        ticketId: ticket.id
      });
    }

    res.status(201).json({ message });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Error al enviar mensaje' });
  }
};

// Get messages for a ticket
const getMessages = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { token } = req.query;
    const { includeInternal = false } = req.query;

    let ticket;

    if (token) {
      ticket = await Ticket.findOne({ where: { accessToken: token } });
    } else if (req.user) {
      ticket = await Ticket.findByPk(ticketId);
    }

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket no encontrado' });
    }

    const where = { ticketId: ticket.id };

    // Clients can't see internal messages
    if (token || !includeInternal) {
      where.isInternal = false;
    }

    const messages = await Message.findAll({
      where,
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'avatar'] }],
      order: [['createdAt', 'ASC']]
    });

    res.json({ messages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Error al obtener mensajes' });
  }
};

module.exports = {
  sendMessage,
  getMessages
};
