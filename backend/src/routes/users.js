const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

// Get agents (for assignment dropdown)
router.get('/agents',
  authenticate,
  authorize('admin', 'agent'),
  userController.getAgents
);

// Get all users (admin only)
router.get('/',
  authenticate,
  authorize('admin'),
  userController.getUsers
);

// Get single user
router.get('/:id',
  authenticate,
  authorize('admin'),
  userController.getUser
);

// Create user (admin only)
router.post('/',
  authenticate,
  authorize('admin'),
  [
    body('email').isEmail().withMessage('Email inválido'),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('name').trim().notEmpty().withMessage('El nombre es requerido'),
    body('role').isIn(['admin', 'agent', 'client']).withMessage('Rol inválido')
  ],
  validate,
  userController.createUser
);

// Update user (admin only)
router.put('/:id',
  authenticate,
  authorize('admin'),
  [
    body('email').optional().isEmail().withMessage('Email inválido'),
    body('name').optional().trim().notEmpty().withMessage('El nombre no puede estar vacío'),
    body('role').optional().isIn(['admin', 'agent', 'client']).withMessage('Rol inválido')
  ],
  validate,
  userController.updateUser
);

// Delete user (admin only)
router.delete('/:id',
  authenticate,
  authorize('admin'),
  userController.deleteUser
);

module.exports = router;
