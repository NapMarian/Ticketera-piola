const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WorkSchedule = sequelize.define('WorkSchedule', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  dayOfWeek: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'day_of_week',
    validate: {
      min: 0,
      max: 6
    }
  },
  startTime: {
    type: DataTypes.TIME,
    allowNull: true,
    field: 'start_time'
  },
  endTime: {
    type: DataTypes.TIME,
    allowNull: true,
    field: 'end_time'
  },
  isWorkingDay: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_working_day'
  }
}, {
  tableName: 'work_schedules',
  indexes: [
    {
      unique: true,
      fields: ['day_of_week']
    }
  ]
});

module.exports = WorkSchedule;
