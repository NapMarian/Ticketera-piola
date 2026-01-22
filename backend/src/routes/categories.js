const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const categoryController = require('../controllers/categoryController');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

// Get all categories (public for ticket form)
router.get('/', categoryController.getCategories);

// Get single category
router.get('/:id', categoryController.getCategory);

// Create category (admin only)
router.post('/',
  authenticate,
  authorize('admin'),
  [
    body('name').trim().notEmpty().withMessage('El nombre es requerido'),
    body('defaultPriority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Prioridad inválida')
  ],
  validate,
  categoryController.createCategory
);

// Update category (admin only)
router.put('/:id',
  authenticate,
  authorize('admin'),
  [
    body('name').optional().trim().notEmpty().withMessage('El nombre no puede estar vacío'),
    body('defaultPriority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Prioridad inválida')
  ],
  validate,
  categoryController.updateCategory
);

// Delete category (admin only)
router.delete('/:id',
  authenticate,
  authorize('admin'),
  categoryController.deleteCategory
);

module.exports = router;
