const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const cannedResponseController = require('../controllers/cannedResponseController');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

// Get all canned responses
router.get('/',
  authenticate,
  authorize('admin', 'agent'),
  cannedResponseController.getCannedResponses
);

// Get single canned response
router.get('/:id',
  authenticate,
  authorize('admin', 'agent'),
  cannedResponseController.getCannedResponse
);

// Create canned response
router.post('/',
  authenticate,
  authorize('admin', 'agent'),
  [
    body('title').trim().notEmpty().withMessage('El título es requerido'),
    body('content').trim().notEmpty().withMessage('El contenido es requerido')
  ],
  validate,
  cannedResponseController.createCannedResponse
);

// Update canned response
router.put('/:id',
  authenticate,
  authorize('admin', 'agent'),
  [
    body('title').optional().trim().notEmpty().withMessage('El título no puede estar vacío'),
    body('content').optional().trim().notEmpty().withMessage('El contenido no puede estar vacío')
  ],
  validate,
  cannedResponseController.updateCannedResponse
);

// Delete canned response
router.delete('/:id',
  authenticate,
  authorize('admin', 'agent'),
  cannedResponseController.deleteCannedResponse
);

module.exports = router;
