const { Category, Ticket } = require('../models');
const { Op } = require('sequelize');

// Get all categories
const getCategories = async (req, res) => {
  try {
    const { isActive } = req.query;

    const where = {};
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const categories = await Category.findAll({
      where,
      order: [['name', 'ASC']]
    });

    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
};

// Get single category
const getCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    res.json({ category });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ error: 'Error al obtener categoría' });
  }
};

// Create category (admin only)
const createCategory = async (req, res) => {
  try {
    const { name, description, defaultPriority, color } = req.body;

    const existingCategory = await Category.findOne({ where: { name } });
    if (existingCategory) {
      return res.status(400).json({ error: 'Ya existe una categoría con ese nombre' });
    }

    const category = await Category.create({
      name,
      description,
      defaultPriority: defaultPriority || 'medium',
      color: color || '#6366f1'
    });

    res.status(201).json({
      message: 'Categoría creada exitosamente',
      category
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Error al crear categoría' });
  }
};

// Update category (admin only)
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, defaultPriority, color, isActive } = req.body;

    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    // Check for duplicate name
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({ where: { name } });
      if (existingCategory) {
        return res.status(400).json({ error: 'Ya existe una categoría con ese nombre' });
      }
    }

    await category.update({
      name: name || category.name,
      description: description !== undefined ? description : category.description,
      defaultPriority: defaultPriority || category.defaultPriority,
      color: color || category.color,
      isActive: isActive !== undefined ? isActive : category.isActive
    });

    res.json({
      message: 'Categoría actualizada',
      category
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ error: 'Error al actualizar categoría' });
  }
};

// Delete category (admin only)
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    // Check if category has tickets
    const ticketCount = await Ticket.count({ where: { categoryId: id } });

    if (ticketCount > 0) {
      // Deactivate instead of delete
      await category.update({ isActive: false });
      return res.json({
        message: 'Categoría desactivada (tiene tickets asociados)',
        category
      });
    }

    await category.destroy();

    res.json({ message: 'Categoría eliminada' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Error al eliminar categoría' });
  }
};

module.exports = {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
};
