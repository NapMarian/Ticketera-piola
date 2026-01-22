const jwt = require('jsonwebtoken');
const { User, Ticket } = require('../models');

const setupSocketHandlers = (io) => {
  // Authentication middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.userId);

        if (user && user.isActive) {
          socket.user = user;
          socket.userId = user.id;
        }
      }

      // Allow connection even without auth (for clients tracking via token)
      next();
    } catch (error) {
      // Allow connection but without user context
      next();
    }
  });

  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    // Join user's personal room for notifications
    if (socket.userId) {
      socket.join(`user_${socket.userId}`);
      console.log(`User ${socket.userId} joined their notification room`);
    }

    // Join ticket room (for chat)
    socket.on('join_ticket', async (data) => {
      const { ticketId, accessToken } = data;

      let canJoin = false;

      if (socket.user && ['admin', 'agent'].includes(socket.user.role)) {
        // Staff can join any ticket room
        canJoin = true;
      } else if (accessToken) {
        // Client can join with valid access token
        const ticket = await Ticket.findOne({
          where: { id: ticketId, accessToken }
        });
        canJoin = !!ticket;
      }

      if (canJoin) {
        socket.join(`ticket_${ticketId}`);
        socket.currentTicketId = ticketId;
        console.log(`Socket ${socket.id} joined ticket_${ticketId}`);

        socket.emit('joined_ticket', { ticketId });
      } else {
        socket.emit('error', { message: 'No autorizado para ver este ticket' });
      }
    });

    // Leave ticket room
    socket.on('leave_ticket', (data) => {
      const { ticketId } = data;
      socket.leave(`ticket_${ticketId}`);
      socket.currentTicketId = null;
      console.log(`Socket ${socket.id} left ticket_${ticketId}`);
    });

    // Typing indicator
    socket.on('typing_start', (data) => {
      const { ticketId, name } = data;

      socket.to(`ticket_${ticketId}`).emit('user_typing', {
        ticketId,
        name: socket.user?.name || name,
        isTyping: true
      });
    });

    socket.on('typing_stop', (data) => {
      const { ticketId, name } = data;

      socket.to(`ticket_${ticketId}`).emit('user_typing', {
        ticketId,
        name: socket.user?.name || name,
        isTyping: false
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);

      // Notify ticket room if user was in one
      if (socket.currentTicketId) {
        socket.to(`ticket_${socket.currentTicketId}`).emit('user_typing', {
          ticketId: socket.currentTicketId,
          name: socket.user?.name || 'Usuario',
          isTyping: false
        });
      }
    });
  });

  return io;
};

module.exports = setupSocketHandlers;
