const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const messageController = require('../controllers/messageController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');

// Send message (staff or client via token)
router.post('/',
  optionalAuth,
  [
    body('content').trim().notEmpty().withMessage('El mensaje es requerido')
  ],
  validate,
  messageController.sendMessage
);

// Get messages for ticket
router.get('/:ticketId',
  optionalAuth,
  messageController.getMessages
);

module.exports = router;
