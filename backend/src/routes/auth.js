const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');

// Register (public or admin creating user)
router.post('/register',
  optionalAuth,
  [
    body('email').isEmail().withMessage('Email inválido'),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('name').trim().notEmpty().withMessage('El nombre es requerido')
  ],
  validate,
  authController.register
);

// Login
router.post('/login',
  [
    body('email').isEmail().withMessage('Email inválido'),
    body('password').notEmpty().withMessage('La contraseña es requerida')
  ],
  validate,
  authController.login
);

// Get profile
router.get('/profile', authenticate, authController.getProfile);

// Update profile
router.put('/profile',
  authenticate,
  [
    body('name').optional().trim().notEmpty().withMessage('El nombre no puede estar vacío')
  ],
  validate,
  authController.updateProfile
);

// Change password
router.put('/password',
  authenticate,
  [
    body('currentPassword').notEmpty().withMessage('La contraseña actual es requerida'),
    body('newPassword').isLength({ min: 6 }).withMessage('La nueva contraseña debe tener al menos 6 caracteres')
  ],
  validate,
  authController.changePassword
);

module.exports = router;
