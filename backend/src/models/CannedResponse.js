const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CannedResponse = sequelize.define('CannedResponse', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  shortcut: {
    type: DataTypes.STRING(50),
    allowNull: true,
    unique: true
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
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'created_by',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  isGlobal: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_global'
  }
}, {
  tableName: 'canned_responses'
});

module.exports = CannedResponse;
