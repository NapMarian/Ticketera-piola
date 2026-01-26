const { Op } = require('sequelize');
const { Ticket, User, Category, Client, Message, TicketHistory, sequelize } = require('../models');
const slaService = require('../services/slaService');
const emailService = require('../services/emailService');
const notificationService = require('../services/notificationService');

// Create ticket (public - no auth required, but staff can also use it)
const createTicket = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      title,
      description,
      priority = 'medium',
      categoryId,
      clientName,
      clientEmail,
      clientCompany,
      clientId,
      assignedAgentId
    } = req.body;

    // Calculate SLA due date
    const slaDueDate = await slaService.calculateSLADueDate(priority, new Date());

    const ticket = await Ticket.create({
      title,
      description,
      priority,
      categoryId,
      clientName,
      clientEmail,
      clientCompany,
      clientId: clientId || null,
      assignedAgentId: assignedAgentId || null,
      slaDueDate,
      userId: req.userId || null
    }, { transaction });

    // Create history entry
    await TicketHistory.create({
      ticketId: ticket.id,
      action: 'created',
      newValue: 'new',
      userId: req.userId || null
    }, { transaction });

    // If assigned to an agent, create assignment history
    if (assignedAgentId) {
      await TicketHistory.create({
        ticketId: ticket.id,
        action: 'assigned',
        newValue: String(assignedAgentId),
        userId: req.userId || null
      }, { transaction });
    }

    await transaction.commit();

    // Reload with associations
    await ticket.reload({
      include: [
        { model: Category, as: 'category' },
        { model: User, as: 'agent', attributes: ['id', 'name', 'email'] },
        { model: Client, as: 'company' }
      ]
    });

    // Send notifications (async, don't wait)
    emailService.sendTicketCreatedEmail(ticket).catch(console.error);
    notificationService.notifyTicketCreated(ticket).catch(console.error);

    // Notify assigned agent if any
    if (assignedAgentId) {
      const agent = await User.findByPk(assignedAgentId);
      if (agent) {
        emailService.sendTicketAssignedEmail(ticket, agent).catch(console.error);
        notificationService.notifyTicketAssigned(ticket, agent).catch(console.error);
      }
    }

    res.status(201).json({
      message: 'Ticket creado exitosamente',
      ticket,
      accessToken: ticket.accessToken
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Create ticket error:', error);
    res.status(500).json({ error: 'Error al crear ticket' });
  }
};

// Get ticket by access token (public)
const getTicketByToken = async (req, res) => {
  try {
    const { token } = req.params;

    const ticket = await Ticket.findOne({
      where: { accessToken: token },
      include: [
        { model: Category, as: 'category' },
        { model: User, as: 'agent', attributes: ['id', 'name', 'avatar'] },
        {
          model: Message,
          as: 'messages',
          where: { isInternal: false },
          required: false,
          include: [{ model: User, as: 'user', attributes: ['id', 'name', 'avatar'] }],
          order: [['createdAt', 'ASC']]
        },
        {
          model: TicketHistory,
          as: 'history',
          include: [{ model: User, as: 'user', attributes: ['id', 'name'] }],
          order: [['createdAt', 'DESC']]
        }
      ]
    });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket no encontrado' });
    }

    const slaStatus = await slaService.checkSLAStatus(ticket);

    res.json({ ticket, slaStatus });
  } catch (error) {
    console.error('Get ticket by token error:', error);
    res.status(500).json({ error: 'Error al obtener ticket' });
  }
};

// Get all tickets (staff only)
const getTickets = async (req, res) => {
  try {
    const {
      status,
      priority,
      categoryId,
      assignedAgentId,
      clientId,
      search,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    const where = {};

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (categoryId) where.categoryId = categoryId;
    if (clientId) where.clientId = clientId;

    // Agents only see their assigned tickets, admins see all
    if (req.user.role === 'agent') {
      where[Op.or] = [
        { assignedAgentId: req.userId },
        { assignedAgentId: null }
      ];
    } else if (assignedAgentId) {
      where.assignedAgentId = assignedAgentId;
    }

    if (search) {
      where[Op.or] = [
        { ticketNumber: { [Op.like]: `%${search}%` } },
        { title: { [Op.like]: `%${search}%` } },
        { clientName: { [Op.like]: `%${search}%` } },
        { clientEmail: { [Op.like]: `%${search}%` } },
        { clientCompany: { [Op.like]: `%${search}%` } }
      ];
    }

    const offset = (page - 1) * limit;

    const { rows: tickets, count } = await Ticket.findAndCountAll({
      where,
      include: [
        { model: Category, as: 'category' },
        { model: User, as: 'agent', attributes: ['id', 'name', 'avatar'] },
        { model: Client, as: 'company', attributes: ['id', 'name'] }
      ],
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset
    });

    // Add SLA status to each ticket
    const ticketsWithSLA = await Promise.all(
      tickets.map(async (ticket) => {
        const slaStatus = await slaService.checkSLAStatus(ticket);
        return { ...ticket.toJSON(), slaStatus };
      })
    );

    res.json({
      tickets: ticketsWithSLA,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({ error: 'Error al obtener tickets' });
  }
};

// Get single ticket (staff only)
const getTicket = async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await Ticket.findByPk(id, {
      include: [
        { model: Category, as: 'category' },
        { model: User, as: 'agent', attributes: ['id', 'name', 'email', 'avatar'] },
        { model: Client, as: 'company' },
        {
          model: Message,
          as: 'messages',
          include: [{ model: User, as: 'user', attributes: ['id', 'name', 'avatar'] }],
          order: [['createdAt', 'ASC']]
        },
        {
          model: TicketHistory,
          as: 'history',
          include: [{ model: User, as: 'user', attributes: ['id', 'name'] }],
          order: [['createdAt', 'DESC']]
        }
      ]
    });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket no encontrado' });
    }

    const slaStatus = await slaService.checkSLAStatus(ticket);

    res.json({ ticket, slaStatus });
  } catch (error) {
    console.error('Get ticket error:', error);
    res.status(500).json({ error: 'Error al obtener ticket' });
  }
};

// Update ticket
const updateTicket = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { status, priority, categoryId, assignedAgentId, clientId, tags } = req.body;

    const ticket = await Ticket.findByPk(id);

    if (!ticket) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Ticket no encontrado' });
    }

    const updates = {};
    const historyEntries = [];

    // Status change
    if (status && status !== ticket.status) {
      historyEntries.push({
        ticketId: ticket.id,
        userId: req.userId,
        action: 'status_changed',
        oldValue: ticket.status,
        newValue: status
      });

      updates.status = status;

      if (status === 'resolved' && !ticket.resolvedAt) {
        updates.resolvedAt = new Date();
      }
      if (status === 'closed' && !ticket.closedAt) {
        updates.closedAt = new Date();
      }
    }

    // Priority change
    if (priority && priority !== ticket.priority) {
      historyEntries.push({
        ticketId: ticket.id,
        userId: req.userId,
        action: 'priority_changed',
        oldValue: ticket.priority,
        newValue: priority
      });

      updates.priority = priority;

      // Recalculate SLA
      updates.slaDueDate = await slaService.calculateSLADueDate(priority, ticket.createdAt);
    }

    // Category change
    if (categoryId && categoryId !== ticket.categoryId) {
      historyEntries.push({
        ticketId: ticket.id,
        userId: req.userId,
        action: 'category_changed',
        oldValue: String(ticket.categoryId),
        newValue: String(categoryId)
      });

      updates.categoryId = categoryId;
    }

    // Assignment change
    if (assignedAgentId !== undefined && assignedAgentId !== ticket.assignedAgentId) {
      const action = ticket.assignedAgentId ? 'transferred' : 'assigned';

      historyEntries.push({
        ticketId: ticket.id,
        userId: req.userId,
        action,
        oldValue: ticket.assignedAgentId ? String(ticket.assignedAgentId) : null,
        newValue: assignedAgentId ? String(assignedAgentId) : null
      });

      updates.assignedAgentId = assignedAgentId;

      // Notify new agent
      if (assignedAgentId) {
        const agent = await User.findByPk(assignedAgentId);
        if (agent) {
          emailService.sendTicketAssignedEmail(ticket, agent).catch(console.error);
          notificationService.notifyTicketAssigned(ticket, agent).catch(console.error);
        }
      }
    }

    if (tags) {
      updates.tags = tags;
    }

    // Client change
    if (clientId !== undefined && clientId !== ticket.clientId) {
      historyEntries.push({
        ticketId: ticket.id,
        userId: req.userId,
        action: 'client_changed',
        oldValue: ticket.clientId ? String(ticket.clientId) : null,
        newValue: clientId ? String(clientId) : null
      });

      updates.clientId = clientId;
    }

    await ticket.update(updates, { transaction });

    // Create history entries
    for (const entry of historyEntries) {
      await TicketHistory.create(entry, { transaction });
    }

    await transaction.commit();

    // Reload with associations
    await ticket.reload({
      include: [
        { model: Category, as: 'category' },
        { model: User, as: 'agent', attributes: ['id', 'name', 'email', 'avatar'] },
        { model: Client, as: 'company' }
      ]
    });

    // Send resolved email if applicable
    if (updates.status === 'resolved') {
      emailService.sendTicketResolvedEmail(ticket).catch(console.error);
    }

    const slaStatus = await slaService.checkSLAStatus(ticket);

    res.json({
      message: 'Ticket actualizado',
      ticket,
      slaStatus
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Update ticket error:', error);
    res.status(500).json({ error: 'Error al actualizar ticket' });
  }
};

// Rate ticket (public)
const rateTicket = async (req, res) => {
  try {
    const { token } = req.params;
    const { rating, comment } = req.body;

    const ticket = await Ticket.findOne({ where: { accessToken: token } });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket no encontrado' });
    }

    if (ticket.status !== 'resolved' && ticket.status !== 'closed') {
      return res.status(400).json({ error: 'Solo se pueden calificar tickets resueltos' });
    }

    await ticket.update({
      satisfactionRating: rating,
      satisfactionComment: comment
    });

    res.json({ message: 'Gracias por tu calificación' });
  } catch (error) {
    console.error('Rate ticket error:', error);
    res.status(500).json({ error: 'Error al calificar ticket' });
  }
};

// Get ticket stats for dashboard
const getTicketStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate) dateFilter[Op.gte] = new Date(startDate);
    if (endDate) dateFilter[Op.lte] = new Date(endDate);

    const createdAtFilter = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};

    // Basic counts
    const [
      totalTickets,
      openTickets,
      resolvedTickets,
      closedTickets
    ] = await Promise.all([
      Ticket.count({ where: createdAtFilter }),
      Ticket.count({ where: { ...createdAtFilter, status: ['new', 'in_progress', 'waiting'] } }),
      Ticket.count({ where: { ...createdAtFilter, status: 'resolved' } }),
      Ticket.count({ where: { ...createdAtFilter, status: 'closed' } })
    ]);

    // By status
    const byStatus = await Ticket.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: createdAtFilter,
      group: ['status']
    });

    // By priority
    const byPriority = await Ticket.findAll({
      attributes: [
        'priority',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: createdAtFilter,
      group: ['priority']
    });

    // By category
    const byCategory = await Ticket.findAll({
      attributes: [
        'categoryId',
        [sequelize.fn('COUNT', sequelize.col('Ticket.id')), 'count']
      ],
      include: [{ model: Category, as: 'category', attributes: ['name', 'color'] }],
      where: createdAtFilter,
      group: ['categoryId', 'category.id']
    });

    // SLA metrics
    const resolvedWithSLA = await Ticket.findAll({
      where: {
        ...createdAtFilter,
        status: ['resolved', 'closed'],
        slaDueDate: { [Op.not]: null }
      },
      attributes: ['resolvedAt', 'slaDueDate']
    });

    let slaMet = 0;
    let slaBreached = 0;

    for (const ticket of resolvedWithSLA) {
      if (ticket.resolvedAt <= ticket.slaDueDate) {
        slaMet++;
      } else {
        slaBreached++;
      }
    }

    const slaCompliance = resolvedWithSLA.length > 0
      ? Math.round((slaMet / resolvedWithSLA.length) * 100)
      : 100;

    // Average response time (first message from agent) - Database agnostic
    const isPostgres = sequelize.getDialect() === 'postgres';

    const avgResponseQuery = isPostgres
      ? `SELECT AVG(EXTRACT(EPOCH FROM (m.created_at - t.created_at)) / 60) as avg_minutes
         FROM tickets t
         INNER JOIN messages m ON t.id = m.ticket_id
         WHERE m.sender_type = 'agent'
         AND m.id = (
           SELECT MIN(m2.id) FROM messages m2
           WHERE m2.ticket_id = t.id AND m2.sender_type = 'agent'
         )
         ${startDate ? `AND t.created_at >= '${startDate}'` : ''}
         ${endDate ? `AND t.created_at <= '${endDate}'` : ''}`
      : `SELECT AVG((julianday(m.created_at) - julianday(t.created_at)) * 24 * 60) as avg_minutes
         FROM tickets t
         INNER JOIN messages m ON t.id = m.ticket_id
         WHERE m.sender_type = 'agent'
         AND m.id = (
           SELECT MIN(m2.id) FROM messages m2
           WHERE m2.ticket_id = t.id AND m2.sender_type = 'agent'
         )
         ${startDate ? `AND t.created_at >= '${startDate}'` : ''}
         ${endDate ? `AND t.created_at <= '${endDate}'` : ''}`;

    const avgResponseTime = await sequelize.query(avgResponseQuery, { type: sequelize.QueryTypes.SELECT });

    // Tickets created over time (last 30 days) - Database agnostic
    const trendQuery = isPostgres
      ? `SELECT DATE(created_at) as date, COUNT(*) as count
         FROM tickets
         WHERE created_at >= NOW() - INTERVAL '30 days'
         GROUP BY DATE(created_at)
         ORDER BY date ASC`
      : `SELECT DATE(created_at) as date, COUNT(*) as count
         FROM tickets
         WHERE created_at >= datetime('now', '-30 days')
         GROUP BY DATE(created_at)
         ORDER BY date ASC`;

    const ticketsTrend = await sequelize.query(trendQuery, { type: sequelize.QueryTypes.SELECT });

    // Average satisfaction
    const avgSatisfaction = await Ticket.findOne({
      attributes: [[sequelize.fn('AVG', sequelize.col('satisfaction_rating')), 'avg']],
      where: {
        ...createdAtFilter,
        satisfactionRating: { [Op.not]: null }
      }
    });

    res.json({
      summary: {
        total: totalTickets,
        open: openTickets,
        resolved: resolvedTickets,
        closed: closedTickets
      },
      byStatus: byStatus.map(s => ({ status: s.status, count: parseInt(s.get('count')) })),
      byPriority: byPriority.map(p => ({ priority: p.priority, count: parseInt(p.get('count')) })),
      byCategory: byCategory.map(c => ({
        categoryId: c.categoryId,
        name: c.category?.name || 'Sin categoría',
        color: c.category?.color || '#6b7280',
        count: parseInt(c.get('count'))
      })),
      sla: {
        compliance: slaCompliance,
        met: slaMet,
        breached: slaBreached
      },
      avgResponseTimeMinutes: Math.round(avgResponseTime[0]?.avg_minutes || 0),
      avgSatisfaction: avgSatisfaction?.get('avg') ? parseFloat(avgSatisfaction.get('avg')).toFixed(1) : null,
      trend: ticketsTrend
    });
  } catch (error) {
    console.error('Get ticket stats error:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
};

// Agent ranking
const getAgentRanking = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const isPostgres = sequelize.getDialect() === 'postgres';

    let dateCondition = '';
    if (startDate) dateCondition += ` AND t.resolved_at >= '${startDate}'`;
    if (endDate) dateCondition += ` AND t.resolved_at <= '${endDate}'`;

    // Database agnostic query
    const rankingQuery = isPostgres
      ? `SELECT
          u.id,
          u.name,
          u.avatar,
          COUNT(t.id) as resolved_count,
          AVG(EXTRACT(EPOCH FROM (t.resolved_at - t.created_at)) / 3600) as avg_resolution_hours,
          AVG(t.satisfaction_rating) as avg_satisfaction,
          SUM(CASE WHEN t.resolved_at <= t.sla_due_date THEN 1 ELSE 0 END) as sla_met,
          COUNT(t.id) as total_with_sla
        FROM users u
        LEFT JOIN tickets t ON u.id = t.assigned_agent_id
          AND t.status IN ('resolved', 'closed')
          ${dateCondition}
        WHERE u.role IN ('agent', 'admin') AND u.is_active = true
        GROUP BY u.id, u.name, u.avatar
        ORDER BY resolved_count DESC`
      : `SELECT
          u.id,
          u.name,
          u.avatar,
          COUNT(t.id) as resolved_count,
          AVG((julianday(t.resolved_at) - julianday(t.created_at)) * 24) as avg_resolution_hours,
          AVG(t.satisfaction_rating) as avg_satisfaction,
          SUM(CASE WHEN t.resolved_at <= t.sla_due_date THEN 1 ELSE 0 END) as sla_met,
          COUNT(t.id) as total_with_sla
        FROM users u
        LEFT JOIN tickets t ON u.id = t.assigned_agent_id
          AND t.status IN ('resolved', 'closed')
          ${dateCondition}
        WHERE u.role IN ('agent', 'admin') AND u.is_active = 1
        GROUP BY u.id
        ORDER BY resolved_count DESC`;

    const ranking = await sequelize.query(rankingQuery, { type: sequelize.QueryTypes.SELECT });

    const formattedRanking = ranking.map((agent, index) => ({
      rank: index + 1,
      id: agent.id,
      name: agent.name,
      avatar: agent.avatar,
      resolvedCount: parseInt(agent.resolved_count) || 0,
      avgResolutionHours: agent.avg_resolution_hours ? Math.round(agent.avg_resolution_hours) : null,
      avgSatisfaction: agent.avg_satisfaction ? parseFloat(agent.avg_satisfaction).toFixed(1) : null,
      slaCompliance: agent.total_with_sla > 0
        ? Math.round((agent.sla_met / agent.total_with_sla) * 100)
        : null
    }));

    res.json({ ranking: formattedRanking });
  } catch (error) {
    console.error('Get agent ranking error:', error);
    res.status(500).json({ error: 'Error al obtener ranking' });
  }
};

module.exports = {
  createTicket,
  getTicketByToken,
  getTickets,
  getTicket,
  updateTicket,
  rateTicket,
  getTicketStats,
  getAgentRanking
};
