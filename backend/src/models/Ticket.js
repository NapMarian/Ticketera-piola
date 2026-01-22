const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const Ticket = sequelize.define('Ticket', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  ticketNumber: {
    type: DataTypes.STRING(20),
    unique: true,
    field: 'ticket_number'
  },
  accessToken: {
    type: DataTypes.STRING(100),
    unique: true,
    field: 'access_token'
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING(20),
    defaultValue: 'new'
  },
  priority: {
    type: DataTypes.STRING(20),
    defaultValue: 'medium'
  },
  // Client info (for anonymous tickets)
  clientName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'client_name'
  },
  clientEmail: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'client_email',
    validate: {
      isEmail: true
    }
  },
  clientCompany: {
    type: DataTypes.STRING(150),
    allowNull: true,
    field: 'client_company'
  },
  // Client relation (empresa/cliente)
  clientId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'client_id',
    references: {
      model: 'clients',
      key: 'id'
    }
  },
  // Relations
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  assignedAgentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'assigned_agent_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'category_id',
    references: {
      model: 'categories',
      key: 'id'
    }
  },
  // SLA tracking
  slaDueDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'sla_due_date'
  },
  firstResponseAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'first_response_at'
  },
  resolvedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'resolved_at'
  },
  closedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'closed_at'
  },
  // Tags for extra categorization
  tags: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  // Satisfaction rating
  satisfactionRating: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'satisfaction_rating',
    validate: {
      min: 1,
      max: 5
    }
  },
  satisfactionComment: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'satisfaction_comment'
  }
}, {
  tableName: 'tickets',
  hooks: {
    beforeCreate: async (ticket) => {
      // Generate ticket number - SQLite compatible
      const year = new Date().getFullYear();
      const startOfYear = `${year}-01-01`;
      const endOfYear = `${year}-12-31`;
      const { Op } = require('sequelize');

      const count = await Ticket.count({
        where: {
          createdAt: {
            [Op.between]: [startOfYear, endOfYear]
          }
        }
      });
      ticket.ticketNumber = `CT-${year}-${String(count + 1).padStart(5, '0')}`;

      // Generate access token for anonymous tracking
      ticket.accessToken = uuidv4();
    }
  }
});

module.exports = Ticket;
