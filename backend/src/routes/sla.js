const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const slaController = require('../controllers/slaController');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

// === SLA Configs ===

// Get all SLA configs
router.get('/configs',
  authenticate,
  authorize('admin', 'agent'),
  slaController.getSLAConfigs
);

// Update SLA config (admin only)
router.put('/configs/:id',
  authenticate,
  authorize('admin'),
  [
    body('firstResponseHours').optional().isInt({ min: 1 }).withMessage('Horas de primera respuesta inválidas'),
    body('resolutionHours').optional().isInt({ min: 1 }).withMessage('Horas de resolución inválidas')
  ],
  validate,
  slaController.updateSLAConfig
);

// === Holidays ===

// Get holidays
router.get('/holidays',
  authenticate,
  authorize('admin', 'agent'),
  slaController.getHolidays
);

// Create holiday (admin only)
router.post('/holidays',
  authenticate,
  authorize('admin'),
  [
    body('date').isDate().withMessage('Fecha inválida'),
    body('name').trim().notEmpty().withMessage('El nombre es requerido')
  ],
  validate,
  slaController.createHoliday
);

// Update holiday (admin only)
router.put('/holidays/:id',
  authenticate,
  authorize('admin'),
  [
    body('date').optional().isDate().withMessage('Fecha inválida'),
    body('name').optional().trim().notEmpty().withMessage('El nombre no puede estar vacío')
  ],
  validate,
  slaController.updateHoliday
);

// Delete holiday (admin only)
router.delete('/holidays/:id',
  authenticate,
  authorize('admin'),
  slaController.deleteHoliday
);

// === Work Schedule ===

// Get work schedule
router.get('/schedule',
  authenticate,
  authorize('admin', 'agent'),
  slaController.getWorkSchedule
);

// Update work schedule (admin only)
router.put('/schedule/:id',
  authenticate,
  authorize('admin'),
  [
    body('startTime').optional(),
    body('endTime').optional(),
    body('isWorkingDay').optional().isBoolean().withMessage('isWorkingDay debe ser booleano')
  ],
  validate,
  slaController.updateWorkSchedule
);

module.exports = router;
