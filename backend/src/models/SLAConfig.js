const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SLAConfig = sequelize.define('SLAConfig', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  priority: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  firstResponseMinutes: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'first_response_minutes'
  },
  resolutionMinutes: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'resolution_minutes'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  }
}, {
  tableName: 'sla_configs'
});

module.exports = SLAConfig;
