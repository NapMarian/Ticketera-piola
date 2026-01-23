const sequelize = require('../config/database');
const User = require('./User');
const Category = require('./Category');
const Client = require('./Client');
const Ticket = require('./Ticket');
const Message = require('./Message');
const TicketHistory = require('./TicketHistory');
const SLAConfig = require('./SLAConfig');
const Holiday = require('./Holiday');
const WorkSchedule = require('./WorkSchedule');
const Notification = require('./Notification');
const CannedResponse = require('./CannedResponse');

// User - Ticket relations
User.hasMany(Ticket, { foreignKey: 'userId', as: 'tickets' });
Ticket.belongsTo(User, { foreignKey: 'userId', as: 'client' });

User.hasMany(Ticket, { foreignKey: 'assignedAgentId', as: 'assignedTickets' });
Ticket.belongsTo(User, { foreignKey: 'assignedAgentId', as: 'agent' });

// Category - Ticket relations
Category.hasMany(Ticket, { foreignKey: 'categoryId', as: 'tickets' });
Ticket.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

// Client - Ticket relations
Client.hasMany(Ticket, { foreignKey: 'clientId', as: 'tickets' });
Ticket.belongsTo(Client, { foreignKey: 'clientId', as: 'company' });

// Ticket - Message relations
Ticket.hasMany(Message, { foreignKey: 'ticketId', as: 'messages' });
Message.belongsTo(Ticket, { foreignKey: 'ticketId', as: 'ticket' });

// User - Message relations
User.hasMany(Message, { foreignKey: 'userId', as: 'messages' });
Message.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Ticket - History relations
Ticket.hasMany(TicketHistory, { foreignKey: 'ticketId', as: 'history' });
TicketHistory.belongsTo(Ticket, { foreignKey: 'ticketId', as: 'ticket' });

User.hasMany(TicketHistory, { foreignKey: 'userId', as: 'historyActions' });
TicketHistory.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User - Notification relations
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Ticket.hasMany(Notification, { foreignKey: 'ticketId', as: 'notifications' });
Notification.belongsTo(Ticket, { foreignKey: 'ticketId', as: 'ticket' });

// Category - CannedResponse relations
Category.hasMany(CannedResponse, { foreignKey: 'categoryId', as: 'cannedResponses' });
CannedResponse.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

User.hasMany(CannedResponse, { foreignKey: 'createdBy', as: 'cannedResponses' });
CannedResponse.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

// Sync database
const syncDatabase = async (force = false) => {
  try {
    // Use alter: true to update schema without losing data (works for both SQLite and PostgreSQL)
    await sequelize.sync({ force, alter: !force });
    console.log('Database synchronized successfully');

    // Create default SLA configs if they don't exist
    const slaCount = await SLAConfig.count();
    if (slaCount === 0) {
      await SLAConfig.bulkCreate([
        { priority: 'urgent', firstResponseHours: 1, resolutionHours: 4 },
        { priority: 'high', firstResponseHours: 4, resolutionHours: 24 },
        { priority: 'medium', firstResponseHours: 8, resolutionHours: 48 },
        { priority: 'low', firstResponseHours: 24, resolutionHours: 72 }
      ]);
      console.log('Default SLA configs created');
    }

    // Create default work schedule if it doesn't exist
    const scheduleCount = await WorkSchedule.count();
    if (scheduleCount === 0) {
      await WorkSchedule.bulkCreate([
        { dayOfWeek: 0, isWorkingDay: false, startTime: null, endTime: null }, // Sunday
        { dayOfWeek: 1, isWorkingDay: true, startTime: '09:00', endTime: '18:00' },
        { dayOfWeek: 2, isWorkingDay: true, startTime: '09:00', endTime: '18:00' },
        { dayOfWeek: 3, isWorkingDay: true, startTime: '09:00', endTime: '18:00' },
        { dayOfWeek: 4, isWorkingDay: true, startTime: '09:00', endTime: '18:00' },
        { dayOfWeek: 5, isWorkingDay: true, startTime: '09:00', endTime: '18:00' },
        { dayOfWeek: 6, isWorkingDay: false, startTime: null, endTime: null }  // Saturday
      ]);
      console.log('Default work schedule created');
    }

    // Create default categories if they don't exist
    const categoryCount = await Category.count();
    if (categoryCount === 0) {
      await Category.bulkCreate([
        { name: 'Soporte Técnico', description: 'Problemas técnicos y errores', defaultPriority: 'high', color: '#ef4444' },
        { name: 'Consulta General', description: 'Preguntas generales', defaultPriority: 'medium', color: '#3b82f6' },
        { name: 'Facturación', description: 'Temas de facturación y pagos', defaultPriority: 'medium', color: '#22c55e' },
        { name: 'Solicitud de Funcionalidad', description: 'Nuevas funcionalidades', defaultPriority: 'low', color: '#a855f7' },
        { name: 'Otro', description: 'Otros temas', defaultPriority: 'low', color: '#6b7280' }
      ]);
      console.log('Default categories created');
    }

  } catch (error) {
    console.error('Error synchronizing database:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  User,
  Category,
  Client,
  Ticket,
  Message,
  TicketHistory,
  SLAConfig,
  Holiday,
  WorkSchedule,
  Notification,
  CannedResponse,
  syncDatabase
};
