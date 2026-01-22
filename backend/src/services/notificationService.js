const { Notification, User } = require('../models');

class NotificationService {
  constructor() {
    this.io = null;
  }

  setIO(io) {
    this.io = io;
  }

  async create({ userId, ticketId, type, title, message }) {
    const notification = await Notification.create({
      userId,
      ticketId,
      type,
      title,
      message
    });

    // Emit real-time notification
    if (this.io) {
      this.io.to(`user_${userId}`).emit('notification', {
        id: notification.id,
        type,
        title,
        message,
        ticketId,
        createdAt: notification.createdAt
      });
    }

    return notification;
  }

  async notifyTicketCreated(ticket) {
    // Notify all admins and agents
    const staffUsers = await User.findAll({
      where: { role: ['admin', 'agent'], isActive: true }
    });

    for (const user of staffUsers) {
      await this.create({
        userId: user.id,
        ticketId: ticket.id,
        type: 'ticket_created',
        title: 'Nuevo ticket',
        message: `${ticket.clientName} creó el ticket ${ticket.ticketNumber}: ${ticket.title}`
      });
    }
  }

  async notifyTicketAssigned(ticket, agent) {
    await this.create({
      userId: agent.id,
      ticketId: ticket.id,
      type: 'ticket_assigned',
      title: 'Ticket asignado',
      message: `Se te asignó el ticket ${ticket.ticketNumber}: ${ticket.title}`
    });
  }

  async notifyNewMessage(ticket, message, excludeUserId) {
    // Notify assigned agent if message is from client
    if (ticket.assignedAgentId && ticket.assignedAgentId !== excludeUserId) {
      await this.create({
        userId: ticket.assignedAgentId,
        ticketId: ticket.id,
        type: 'new_message',
        title: 'Nuevo mensaje',
        message: `${message.senderName || 'Cliente'} envió un mensaje en ${ticket.ticketNumber}`
      });
    }
  }

  async notifySLAWarning(ticket, agent) {
    await this.create({
      userId: agent.id,
      ticketId: ticket.id,
      type: 'sla_warning',
      title: 'SLA por vencer',
      message: `El ticket ${ticket.ticketNumber} está próximo a vencer su SLA`
    });
  }

  async notifySLABreach(ticket, agent) {
    // Notify agent and all admins
    const admins = await User.findAll({
      where: { role: 'admin', isActive: true }
    });

    const usersToNotify = agent ? [agent, ...admins] : admins;

    for (const user of usersToNotify) {
      await this.create({
        userId: user.id,
        ticketId: ticket.id,
        type: 'sla_breach',
        title: 'SLA incumplido',
        message: `El ticket ${ticket.ticketNumber} ha superado su tiempo de SLA`
      });
    }
  }

  async getUserNotifications(userId, { limit = 20, unreadOnly = false } = {}) {
    const where = { userId };
    if (unreadOnly) {
      where.isRead = false;
    }

    return await Notification.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit
    });
  }

  async markAsRead(notificationId, userId) {
    const notification = await Notification.findOne({
      where: { id: notificationId, userId }
    });

    if (notification) {
      notification.isRead = true;
      notification.readAt = new Date();
      await notification.save();
    }

    return notification;
  }

  async markAllAsRead(userId) {
    await Notification.update(
      { isRead: true, readAt: new Date() },
      { where: { userId, isRead: false } }
    );
  }

  async getUnreadCount(userId) {
    return await Notification.count({
      where: { userId, isRead: false }
    });
  }
}

module.exports = new NotificationService();
