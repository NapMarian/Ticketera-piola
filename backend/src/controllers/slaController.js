const { SLAConfig, Holiday, WorkSchedule } = require('../models');

// Get all SLA configs
const getSLAConfigs = async (req, res) => {
  try {
    const configs = await SLAConfig.findAll({
      order: [['firstResponseMinutes', 'ASC']]
    });

    res.json({ configs });
  } catch (error) {
    console.error('Get SLA configs error:', error);
    res.status(500).json({ error: 'Error al obtener configuración SLA' });
  }
};

// Update SLA config (admin only)
const updateSLAConfig = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstResponseMinutes, resolutionMinutes, isActive } = req.body;

    const config = await SLAConfig.findByPk(id);

    if (!config) {
      return res.status(404).json({ error: 'Configuración no encontrada' });
    }

    await config.update({
      firstResponseMinutes: firstResponseMinutes !== undefined ? firstResponseMinutes : config.firstResponseMinutes,
      resolutionMinutes: resolutionMinutes !== undefined ? resolutionMinutes : config.resolutionMinutes,
      isActive: isActive !== undefined ? isActive : config.isActive
    });

    res.json({
      message: 'Configuración SLA actualizada',
      config
    });
  } catch (error) {
    console.error('Update SLA config error:', error);
    res.status(500).json({ error: 'Error al actualizar configuración SLA' });
  }
};

// Get holidays
const getHolidays = async (req, res) => {
  try {
    const { year } = req.query;

    const where = {};
    if (year) {
      where.year = year;
    }

    const holidays = await Holiday.findAll({
      where,
      order: [['date', 'ASC']]
    });

    res.json({ holidays });
  } catch (error) {
    console.error('Get holidays error:', error);
    res.status(500).json({ error: 'Error al obtener feriados' });
  }
};

// Create holiday (admin only)
const createHoliday = async (req, res) => {
  try {
    const { date, name, isRecurring } = req.body;

    const dateObj = new Date(date);
    const year = dateObj.getFullYear();

    // Check for duplicate
    const existing = await Holiday.findOne({ where: { date } });
    if (existing) {
      return res.status(400).json({ error: 'Ya existe un feriado en esa fecha' });
    }

    const holiday = await Holiday.create({
      date,
      name,
      year,
      isRecurring: isRecurring || false
    });

    res.status(201).json({
      message: 'Feriado creado exitosamente',
      holiday
    });
  } catch (error) {
    console.error('Create holiday error:', error);
    res.status(500).json({ error: 'Error al crear feriado' });
  }
};

// Update holiday (admin only)
const updateHoliday = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, name, isRecurring } = req.body;

    const holiday = await Holiday.findByPk(id);

    if (!holiday) {
      return res.status(404).json({ error: 'Feriado no encontrado' });
    }

    const updates = {};
    if (date) {
      // Ensure date is in YYYY-MM-DD format for DATEONLY
      const dateStr = typeof date === 'string' ? date.split('T')[0] : date;
      updates.date = dateStr;
      updates.year = parseInt(dateStr.split('-')[0], 10);

      // Check if another holiday exists with this date
      const existing = await Holiday.findOne({
        where: { date: dateStr }
      });
      if (existing && existing.id !== parseInt(id)) {
        return res.status(400).json({ error: 'Ya existe un feriado en esa fecha' });
      }
    }
    if (name) updates.name = name;
    if (isRecurring !== undefined) updates.isRecurring = isRecurring;

    await holiday.update(updates);

    res.json({
      message: 'Feriado actualizado',
      holiday
    });
  } catch (error) {
    console.error('Update holiday error:', error);
    res.status(500).json({ error: 'Error al actualizar feriado' });
  }
};

// Delete holiday (admin only)
const deleteHoliday = async (req, res) => {
  try {
    const { id } = req.params;

    const holiday = await Holiday.findByPk(id);

    if (!holiday) {
      return res.status(404).json({ error: 'Feriado no encontrado' });
    }

    await holiday.destroy();

    res.json({ message: 'Feriado eliminado' });
  } catch (error) {
    console.error('Delete holiday error:', error);
    res.status(500).json({ error: 'Error al eliminar feriado' });
  }
};

// Get work schedule
const getWorkSchedule = async (req, res) => {
  try {
    const schedule = await WorkSchedule.findAll({
      order: [['dayOfWeek', 'ASC']]
    });

    res.json({ schedule });
  } catch (error) {
    console.error('Get work schedule error:', error);
    res.status(500).json({ error: 'Error al obtener horario laboral' });
  }
};

// Update work schedule (admin only)
const updateWorkSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { startTime, endTime, isWorkingDay } = req.body;

    const schedule = await WorkSchedule.findByPk(id);

    if (!schedule) {
      return res.status(404).json({ error: 'Horario no encontrado' });
    }

    await schedule.update({
      startTime: isWorkingDay ? startTime : null,
      endTime: isWorkingDay ? endTime : null,
      isWorkingDay
    });

    res.json({
      message: 'Horario actualizado',
      schedule
    });
  } catch (error) {
    console.error('Update work schedule error:', error);
    res.status(500).json({ error: 'Error al actualizar horario' });
  }
};

module.exports = {
  getSLAConfigs,
  updateSLAConfig,
  getHolidays,
  createHoliday,
  updateHoliday,
  deleteHoliday,
  getWorkSchedule,
  updateWorkSchedule
};
