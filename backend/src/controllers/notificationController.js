const notificationService = require('../services/notificationService');

// Get user notifications
const getNotifications = async (req, res) => {
  try {
    const { limit = 20, unreadOnly = false } = req.query;

    const notifications = await notificationService.getUserNotifications(req.userId, {
      limit: parseInt(limit),
      unreadOnly: unreadOnly === 'true'
    });

    const unreadCount = await notificationService.getUnreadCount(req.userId);

    res.json({
      notifications,
      unreadCount
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Error al obtener notificaciones' });
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await notificationService.markAsRead(id, req.userId);

    if (!notification) {
      return res.status(404).json({ error: 'Notificación no encontrada' });
    }

    res.json({ message: 'Notificación marcada como leída' });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ error: 'Error al marcar notificación' });
  }
};

// Mark all as read
const markAllAsRead = async (req, res) => {
  try {
    await notificationService.markAllAsRead(req.userId);

    res.json({ message: 'Todas las notificaciones marcadas como leídas' });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({ error: 'Error al marcar notificaciones' });
  }
};

// Get unread count
const getUnreadCount = async (req, res) => {
  try {
    const count = await notificationService.getUnreadCount(req.userId);

    res.json({ count });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ error: 'Error al obtener contador' });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount
};
