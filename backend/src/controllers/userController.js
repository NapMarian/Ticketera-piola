const { User, Ticket } = require('../models');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

// Get all users (admin only)
const getUsers = async (req, res) => {
  try {
    const { role, isActive, search } = req.query;

    const where = {};

    if (role) where.role = role;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    const users = await User.findAll({
      where,
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });

    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

// Get single user
const getUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
};

// Create user (admin only)
const createUser = async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    const user = await User.create({
      email,
      password,
      name,
      role: role || 'agent'
    });

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Error al crear usuario' });
  }
};

// Update user (admin only)
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, isActive, password } = req.body;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Check if email is already taken by another user
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: 'El email ya está en uso' });
      }
    }

    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (role) updates.role = role;
    if (isActive !== undefined) updates.isActive = isActive;
    if (password) updates.password = password;

    await user.update(updates);

    res.json({
      message: 'Usuario actualizado',
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
};

// Delete user (admin only)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Don't delete users with assigned tickets, deactivate instead
    const assignedTickets = await Ticket.count({
      where: {
        assignedAgentId: id,
        status: { [Op.in]: ['new', 'in_progress', 'waiting'] }
      }
    });

    if (assignedTickets > 0) {
      await user.update({ isActive: false });
      return res.json({
        message: 'Usuario desactivado (tiene tickets asignados activos)',
        user: user.toJSON()
      });
    }

    await user.destroy();

    res.json({ message: 'Usuario eliminado' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
};

// Get agents for assignment dropdown
const getAgents = async (req, res) => {
  try {
    const agents = await User.findAll({
      where: {
        role: { [Op.in]: ['agent', 'admin'] },
        isActive: true
      },
      attributes: ['id', 'name', 'email', 'avatar', 'role']
    });

    res.json({ agents });
  } catch (error) {
    console.error('Get agents error:', error);
    res.status(500).json({ error: 'Error al obtener agentes' });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
};

// Update current user profile
const updateProfile = async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const updates = {};

    // Update name
    if (name) {
      updates.name = name;
    }

    // Update email (check if not taken)
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: 'El email ya esta en uso' });
      }
      updates.email = email;
    }

    // Update password (requires current password)
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Debe proporcionar la contrasena actual' });
      }
      const isValid = await user.validatePassword(currentPassword);
      if (!isValid) {
        return res.status(400).json({ error: 'Contrasena actual incorrecta' });
      }
      updates.password = newPassword;
    }

    await user.update(updates);

    res.json({
      message: 'Perfil actualizado',
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Error al actualizar perfil' });
  }
};

// Upload avatar
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se ha subido ninguna imagen' });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Delete old avatar if exists
    if (user.avatar) {
      const oldAvatarPath = path.join(__dirname, '../../uploads/avatars', path.basename(user.avatar));
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    // Save new avatar path
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    await user.update({ avatar: avatarUrl });

    res.json({
      message: 'Avatar actualizado',
      avatar: avatarUrl,
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({ error: 'Error al subir avatar' });
  }
};

// Delete avatar
const deleteAvatar = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (user.avatar) {
      const avatarPath = path.join(__dirname, '../../uploads/avatars', path.basename(user.avatar));
      if (fs.existsSync(avatarPath)) {
        fs.unlinkSync(avatarPath);
      }
      await user.update({ avatar: null });
    }

    res.json({
      message: 'Avatar eliminado',
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Delete avatar error:', error);
    res.status(500).json({ error: 'Error al eliminar avatar' });
  }
};

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getAgents,
  getProfile,
  updateProfile,
  uploadAvatar,
  deleteAvatar
};
