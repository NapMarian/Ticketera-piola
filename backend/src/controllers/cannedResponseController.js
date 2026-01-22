const { CannedResponse, Category, User } = require('../models');
const { Op } = require('sequelize');

// Get all canned responses
const getCannedResponses = async (req, res) => {
  try {
    const { categoryId, search } = req.query;

    const where = {
      [Op.or]: [
        { isGlobal: true },
        { createdBy: req.userId }
      ]
    };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (search) {
      where[Op.and] = [
        where[Op.or],
        {
          [Op.or]: [
            { title: { [Op.like]: `%${search}%` } },
            { shortcut: { [Op.like]: `%${search}%` } },
            { content: { [Op.like]: `%${search}%` } }
          ]
        }
      ];
    }

    const responses = await CannedResponse.findAll({
      where,
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name'] },
        { model: User, as: 'creator', attributes: ['id', 'name'] }
      ],
      order: [['title', 'ASC']]
    });

    res.json({ responses });
  } catch (error) {
    console.error('Get canned responses error:', error);
    res.status(500).json({ error: 'Error al obtener respuestas predefinidas' });
  }
};

// Get single canned response
const getCannedResponse = async (req, res) => {
  try {
    const { id } = req.params;

    const response = await CannedResponse.findByPk(id, {
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name'] }
      ]
    });

    if (!response) {
      return res.status(404).json({ error: 'Respuesta no encontrada' });
    }

    res.json({ response });
  } catch (error) {
    console.error('Get canned response error:', error);
    res.status(500).json({ error: 'Error al obtener respuesta' });
  }
};

// Create canned response
const createCannedResponse = async (req, res) => {
  try {
    const { title, content, shortcut, categoryId, isGlobal } = req.body;

    // Check shortcut uniqueness
    if (shortcut) {
      const existing = await CannedResponse.findOne({ where: { shortcut } });
      if (existing) {
        return res.status(400).json({ error: 'El atajo ya existe' });
      }
    }

    // Only admins can create global responses
    const canCreateGlobal = req.user.role === 'admin';

    const response = await CannedResponse.create({
      title,
      content,
      shortcut,
      categoryId,
      createdBy: req.userId,
      isGlobal: canCreateGlobal ? (isGlobal || false) : false
    });

    await response.reload({
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name'] }
      ]
    });

    res.status(201).json({
      message: 'Respuesta predefinida creada',
      response
    });
  } catch (error) {
    console.error('Create canned response error:', error);
    res.status(500).json({ error: 'Error al crear respuesta' });
  }
};

// Update canned response
const updateCannedResponse = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, shortcut, categoryId, isGlobal } = req.body;

    const response = await CannedResponse.findByPk(id);

    if (!response) {
      return res.status(404).json({ error: 'Respuesta no encontrada' });
    }

    // Only creator or admin can update
    if (response.createdBy !== req.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No tienes permiso para editar esta respuesta' });
    }

    // Check shortcut uniqueness
    if (shortcut && shortcut !== response.shortcut) {
      const existing = await CannedResponse.findOne({ where: { shortcut } });
      if (existing) {
        return res.status(400).json({ error: 'El atajo ya existe' });
      }
    }

    const updates = {};
    if (title) updates.title = title;
    if (content) updates.content = content;
    if (shortcut !== undefined) updates.shortcut = shortcut;
    if (categoryId !== undefined) updates.categoryId = categoryId;
    if (isGlobal !== undefined && req.user.role === 'admin') {
      updates.isGlobal = isGlobal;
    }

    await response.update(updates);

    await response.reload({
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name'] }
      ]
    });

    res.json({
      message: 'Respuesta actualizada',
      response
    });
  } catch (error) {
    console.error('Update canned response error:', error);
    res.status(500).json({ error: 'Error al actualizar respuesta' });
  }
};

// Delete canned response
const deleteCannedResponse = async (req, res) => {
  try {
    const { id } = req.params;

    const response = await CannedResponse.findByPk(id);

    if (!response) {
      return res.status(404).json({ error: 'Respuesta no encontrada' });
    }

    // Only creator or admin can delete
    if (response.createdBy !== req.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No tienes permiso para eliminar esta respuesta' });
    }

    await response.destroy();

    res.json({ message: 'Respuesta eliminada' });
  } catch (error) {
    console.error('Delete canned response error:', error);
    res.status(500).json({ error: 'Error al eliminar respuesta' });
  }
};

module.exports = {
  getCannedResponses,
  getCannedResponse,
  createCannedResponse,
  updateCannedResponse,
  deleteCannedResponse
};
