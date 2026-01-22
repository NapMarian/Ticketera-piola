const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TicketHistory = sequelize.define('TicketHistory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  ticketId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'ticket_id',
    references: {
      model: 'tickets',
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  action: {
    type: DataTypes.STRING(30),
    allowNull: false
  },
  oldValue: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'old_value'
  },
  newValue: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'new_value'
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'ticket_history',
  updatedAt: false
});

module.exports = TicketHistory;
