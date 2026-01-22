const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

const formatTicketNumber = (number) => {
  return `CT-${new Date().getFullYear()}-${String(number).padStart(5, '0')}`;
};

const getStatusLabel = (status) => {
  const labels = {
    new: 'Nuevo',
    in_progress: 'En Progreso',
    waiting: 'En Espera',
    resolved: 'Resuelto',
    closed: 'Cerrado'
  };
  return labels[status] || status;
};

const getPriorityLabel = (priority) => {
  const labels = {
    low: 'Baja',
    medium: 'Media',
    high: 'Alta',
    urgent: 'Urgente'
  };
  return labels[priority] || priority;
};

const getPriorityColor = (priority) => {
  const colors = {
    low: '#22c55e',
    medium: '#3b82f6',
    high: '#f59e0b',
    urgent: '#ef4444'
  };
  return colors[priority] || '#6b7280';
};

const getStatusColor = (status) => {
  const colors = {
    new: '#3b82f6',
    in_progress: '#f59e0b',
    waiting: '#a855f7',
    resolved: '#22c55e',
    closed: '#6b7280'
  };
  return colors[status] || '#6b7280';
};

module.exports = {
  generateToken,
  formatTicketNumber,
  getStatusLabel,
  getPriorityLabel,
  getPriorityColor,
  getStatusColor
};
