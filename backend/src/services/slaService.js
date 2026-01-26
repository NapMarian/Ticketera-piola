const { SLAConfig, Holiday, WorkSchedule, sequelize } = require('../models');
const { Op } = require('sequelize');

class SLAService {
  async getSLAConfig(priority) {
    return await SLAConfig.findOne({ where: { priority, isActive: true } });
  }

  async getHolidays(year) {
    return await Holiday.findAll({
      where: {
        [Op.or]: [
          { year },
          { isRecurring: true }
        ]
      }
    });
  }

  async getWorkSchedule() {
    return await WorkSchedule.findAll({ order: [['dayOfWeek', 'ASC']] });
  }

  async isHoliday(date) {
    const dateOnly = new Date(date).toISOString().split('T')[0];
    const monthDay = dateOnly.substring(5); // "MM-DD"

    // First check for exact date match
    const exactMatch = await Holiday.findOne({
      where: { date: dateOnly }
    });
    if (exactMatch) return true;

    // Then check for recurring holidays (match month-day)
    const recurringHolidays = await Holiday.findAll({
      where: { isRecurring: true }
    });

    for (const holiday of recurringHolidays) {
      const holidayDate = new Date(holiday.date).toISOString().split('T')[0];
      if (holidayDate.substring(5) === monthDay) {
        return true;
      }
    }

    return false;
  }

  async isWorkingTime(date) {
    const dayOfWeek = date.getDay();
    const schedule = await WorkSchedule.findOne({ where: { dayOfWeek } });

    if (!schedule || !schedule.isWorkingDay) {
      return false;
    }

    if (await this.isHoliday(date)) {
      return false;
    }

    const timeStr = date.toTimeString().substring(0, 5);
    return timeStr >= schedule.startTime && timeStr < schedule.endTime;
  }

  async calculateSLADueDate(priority, createdAt) {
    const slaConfig = await this.getSLAConfig(priority);
    if (!slaConfig) {
      return null;
    }

    const workSchedule = await this.getWorkSchedule();
    let remainingMinutes = slaConfig.resolutionMinutes;
    let currentDate = new Date(createdAt);

    while (remainingMinutes > 0) {
      const dayOfWeek = currentDate.getDay();
      const daySchedule = workSchedule.find(s => s.dayOfWeek === dayOfWeek);

      if (daySchedule && daySchedule.isWorkingDay && !(await this.isHoliday(currentDate))) {
        const startTime = this.parseTime(daySchedule.startTime);
        const endTime = this.parseTime(daySchedule.endTime);
        const currentTime = currentDate.getHours() * 60 + currentDate.getMinutes();

        let workStart = Math.max(currentTime, startTime);
        let availableMinutes = Math.max(0, endTime - workStart);

        if (availableMinutes >= remainingMinutes) {
          currentDate.setHours(0, 0, 0, 0);
          currentDate.setMinutes(workStart + remainingMinutes);
          return currentDate;
        }

        remainingMinutes -= availableMinutes;
      }

      currentDate.setDate(currentDate.getDate() + 1);
      currentDate.setHours(0, 0, 0, 0);
    }

    return currentDate;
  }

  parseTime(timeStr) {
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  async checkSLAStatus(ticket) {
    if (!ticket.slaDueDate) {
      return { status: 'no_sla', label: 'Sin SLA' };
    }

    const now = new Date();
    const dueDate = new Date(ticket.slaDueDate);
    const minutesRemaining = (dueDate - now) / (1000 * 60);

    if (ticket.status === 'resolved' || ticket.status === 'closed') {
      const resolvedAt = new Date(ticket.resolvedAt || ticket.closedAt);
      if (resolvedAt <= dueDate) {
        return { status: 'met', label: 'SLA Cumplido', color: '#22c55e' };
      } else {
        return { status: 'breached', label: 'SLA Incumplido', color: '#ef4444' };
      }
    }

    if (now > dueDate) {
      return { status: 'breached', label: 'SLA Vencido', color: '#ef4444' };
    }

    // Warn when 30 minutes or less remaining
    if (minutesRemaining <= 30) {
      return { status: 'warning', label: 'Por Vencer', color: '#f59e0b' };
    }

    return { status: 'on_track', label: 'En Tiempo', color: '#22c55e' };
  }
}

module.exports = new SLAService();
