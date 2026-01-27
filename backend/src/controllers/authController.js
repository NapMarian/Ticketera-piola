const { User } = require('../models');
const { generateToken } = require('../utils/helpers');
const fs = require('fs');
const path = require('path');

const register = async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    // Only admins can create other admins or agents
    let userRole = 'client';
    if (req.user && req.user.role === 'admin') {
      userRole = role || 'client';
    }

    const user = await User.create({
      email,
      password,
      name,
      role: userRole
    });

    const token = generateToken(user.id);

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      user: user.toJSON(),
      token
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: 'Usuario inactivo' });
    }

    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = generateToken(user.id);

    res.json({
      message: 'Login exitoso',
      user: user.toJSON(),
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
};

const getProfile = async (req, res) => {
  try {
    res.json({ user: req.user.toJSON() });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, avatar } = req.body;

    await req.user.update({ name, avatar });

    res.json({
      message: 'Perfil actualizado',
      user: req.user.toJSON()
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Error al actualizar perfil' });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const isValidPassword = await req.user.validatePassword(currentPassword);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Contraseña actual incorrecta' });
    }

    req.user.password = newPassword;
    await req.user.save();

    res.json({ message: 'Contraseña actualizada exitosamente' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Error al cambiar contraseña' });
  }
};

const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se ha subido ninguna imagen' });
    }

    // Delete old avatar if exists
    if (req.user.avatar) {
      const oldAvatarPath = path.join(__dirname, '../../uploads/avatars', path.basename(req.user.avatar));
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    // Save new avatar path
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    await req.user.update({ avatar: avatarUrl });

    res.json({
      message: 'Avatar actualizado',
      avatar: avatarUrl,
      user: req.user.toJSON()
    });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({ error: 'Error al subir avatar' });
  }
};

const deleteAvatar = async (req, res) => {
  try {
    if (req.user.avatar) {
      const avatarPath = path.join(__dirname, '../../uploads/avatars', path.basename(req.user.avatar));
      if (fs.existsSync(avatarPath)) {
        fs.unlinkSync(avatarPath);
      }
      await req.user.update({ avatar: null });
    }

    res.json({
      message: 'Avatar eliminado',
      user: req.user.toJSON()
    });
  } catch (error) {
    console.error('Delete avatar error:', error);
    res.status(500).json({ error: 'Error al eliminar avatar' });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  uploadAvatar,
  deleteAvatar
};
