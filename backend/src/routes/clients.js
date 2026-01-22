const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const clientController = require('../controllers/clientController');
const { authenticate, authorize } = require('../middleware/auth');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Datos inválidos',
      details: errors.array().map(err => ({ field: err.path, message: err.msg }))
    });
  }
  next();
};

// All routes require authentication
router.use(authenticate);

// Get all clients (agents and admins)
router.get('/', authorize('admin', 'agent'), clientController.getClients);

// Get single client
router.get('/:id', authorize('admin', 'agent'), clientController.getClient);

// Get client stats
router.get('/:id/stats', authorize('admin', 'agent'), clientController.getClientStats);

// Create client (admin only)
router.post('/',
  authorize('admin'),
  [
    body('name').notEmpty().withMessage('El nombre es requerido'),
    body('email').optional().isEmail().withMessage('Email inválido')
  ],
  validate,
  clientController.createClient
);

// Update client (admin only)
router.put('/:id', authorize('admin'), clientController.updateClient);

// Delete client (admin only)
router.delete('/:id', authorize('admin'), clientController.deleteClient);

module.exports = router;
