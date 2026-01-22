const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const ticketController = require('../controllers/ticketController');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');

// Create ticket (public)
router.post('/',
  optionalAuth,
  [
    body('title').trim().notEmpty().withMessage('El título es requerido'),
    body('description').trim().notEmpty().withMessage('La descripción es requerida'),
    body('clientName').trim().notEmpty().withMessage('El nombre es requerido'),
    body('clientEmail').isEmail().withMessage('Email inválido'),
    body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Prioridad inválida')
  ],
  validate,
  ticketController.createTicket
);

// Get ticket by access token (public)
router.get('/track/:token', ticketController.getTicketByToken);

// Rate ticket (public)
router.post('/track/:token/rate',
  [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Calificacion debe ser entre 1 y 5')
  ],
  validate,
  ticketController.rateTicket
);

// Public ranking for TV display (no auth required)
router.get('/public/ranking', ticketController.getAgentRanking);

// Get all tickets (staff only)
router.get('/',
  authenticate,
  authorize('admin', 'agent'),
  ticketController.getTickets
);

// Get ticket stats (staff only)
router.get('/stats',
  authenticate,
  authorize('admin', 'agent'),
  ticketController.getTicketStats
);

// Get agent ranking (staff only)
router.get('/ranking',
  authenticate,
  authorize('admin', 'agent'),
  ticketController.getAgentRanking
);

// Get single ticket (staff only)
router.get('/:id',
  authenticate,
  authorize('admin', 'agent'),
  ticketController.getTicket
);

// Update ticket (staff only)
router.put('/:id',
  authenticate,
  authorize('admin', 'agent'),
  [
    body('status').optional().isIn(['new', 'in_progress', 'waiting', 'resolved', 'closed']).withMessage('Estado inválido'),
    body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Prioridad inválida')
  ],
  validate,
  ticketController.updateTicket
);

module.exports = router;
