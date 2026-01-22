const { Client, Ticket, sequelize } = require('../models');
const { Op } = require('sequelize');

// Get all clients
const getClients = async (req, res) => {
  try {
    const { search, isActive, page = 1, limit = 50 } = req.query;

    const where = {};

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { contactPerson: { [Op.like]: `%${search}%` } }
      ];
    }

    const offset = (page - 1) * limit;

    const { rows: clients, count } = await Client.findAndCountAll({
      where,
      order: [['name', 'ASC']],
      limit: parseInt(limit),
      offset
    });

    res.json({
      clients,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({ error: 'Error al obtener clientes' });
  }
};

// Get single client
const getClient = async (req, res) => {
  try {
    const { id } = req.params;

    const client = await Client.findByPk(id, {
      include: [
        {
          model: Ticket,
          as: 'tickets',
          limit: 10,
          order: [['createdAt', 'DESC']]
        }
      ]
    });

    if (!client) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    res.json({ client });
  } catch (error) {
    console.error('Get client error:', error);
    res.status(500).json({ error: 'Error al obtener cliente' });
  }
};

// Create client
const createClient = async (req, res) => {
  try {
    const { name, email, phone, address, contactPerson, notes } = req.body;

    const client = await Client.create({
      name,
      email,
      phone,
      address,
      contactPerson,
      notes
    });

    res.status(201).json({
      message: 'Cliente creado exitosamente',
      client
    });
  } catch (error) {
    console.error('Create client error:', error);
    res.status(500).json({ error: 'Error al crear cliente' });
  }
};

// Update client
const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, contactPerson, notes, isActive } = req.body;

    const client = await Client.findByPk(id);

    if (!client) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    await client.update({
      name: name !== undefined ? name : client.name,
      email: email !== undefined ? email : client.email,
      phone: phone !== undefined ? phone : client.phone,
      address: address !== undefined ? address : client.address,
      contactPerson: contactPerson !== undefined ? contactPerson : client.contactPerson,
      notes: notes !== undefined ? notes : client.notes,
      isActive: isActive !== undefined ? isActive : client.isActive
    });

    res.json({
      message: 'Cliente actualizado',
      client
    });
  } catch (error) {
    console.error('Update client error:', error);
    res.status(500).json({ error: 'Error al actualizar cliente' });
  }
};

// Delete client (soft delete)
const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;

    const client = await Client.findByPk(id);

    if (!client) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    // Check if has tickets
    const ticketCount = await Ticket.count({ where: { clientId: id } });

    if (ticketCount > 0) {
      // Soft delete
      await client.update({ isActive: false });
      return res.json({ message: 'Cliente desactivado (tiene tickets asociados)' });
    }

    await client.destroy();
    res.json({ message: 'Cliente eliminado' });
  } catch (error) {
    console.error('Delete client error:', error);
    res.status(500).json({ error: 'Error al eliminar cliente' });
  }
};

// Get client stats
const getClientStats = async (req, res) => {
  try {
    const { id } = req.params;

    const client = await Client.findByPk(id);

    if (!client) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    const [totalTickets, openTickets, resolvedTickets, avgSatisfaction] = await Promise.all([
      Ticket.count({ where: { clientId: id } }),
      Ticket.count({ where: { clientId: id, status: ['new', 'in_progress', 'waiting'] } }),
      Ticket.count({ where: { clientId: id, status: ['resolved', 'closed'] } }),
      Ticket.findOne({
        attributes: [[sequelize.fn('AVG', sequelize.col('satisfaction_rating')), 'avg']],
        where: { clientId: id, satisfactionRating: { [Op.not]: null } }
      })
    ]);

    res.json({
      stats: {
        totalTickets,
        openTickets,
        resolvedTickets,
        avgSatisfaction: avgSatisfaction?.get('avg')
          ? parseFloat(avgSatisfaction.get('avg')).toFixed(1)
          : null
      }
    });
  } catch (error) {
    console.error('Get client stats error:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas del cliente' });
  }
};

module.exports = {
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
  getClientStats
};
