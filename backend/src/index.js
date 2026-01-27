require('dotenv').config();

const express = require('express');
const cors = require('cors');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const { syncDatabase } = require('./models');
const notificationService = require('./services/notificationService');
const setupSocketHandlers = require('./socket/chatHandler');

// Routes
const authRoutes = require('./routes/auth');
const ticketRoutes = require('./routes/tickets');
const messageRoutes = require('./routes/messages');
const userRoutes = require('./routes/users');
const categoryRoutes = require('./routes/categories');
const slaRoutes = require('./routes/sla');
const notificationRoutes = require('./routes/notifications');
const cannedResponseRoutes = require('./routes/cannedResponses');
const clientRoutes = require('./routes/clients');

const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads/avatars');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = express();
const server = http.createServer(app);

// CORS origin configuration
const corsOrigin = process.env.CORS_ORIGIN || process.env.FRONTEND_URL || 'http://localhost:5173';
const allowedOrigins = corsOrigin.split(',').map(o => o.trim());

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc)
    if (!origin) return callback(null, true);
    // Allow if origin matches any allowed origin or is a railway.app domain
    if (allowedOrigins.includes(origin) || origin.endsWith('.railway.app')) {
      return callback(null, true);
    }
    callback(null, true); // Allow all in production for demo purposes
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
};

// Socket.io setup
const io = new Server(server, {
  cors: corsOptions
});

// Setup socket handlers
setupSocketHandlers(io);

// Make io available to controllers
app.set('io', io);

// Set io for notification service
notificationService.setIO(io);

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploads) with proper headers
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  setHeaders: (res, filePath) => {
    // Set CORS headers for static files
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// Request logging in development
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/sla', slaRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/canned-responses', cannedResponseRoutes);
app.use('/api/clients', clientRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint no encontrado' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { details: err.message })
  });
});

// Start server
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Sync database
    await syncDatabase();

    // Create default admin user if none exists
    const { User } = require('./models');
    const adminCount = await User.count({ where: { role: 'admin' } });

    if (adminCount === 0) {
      await User.create({
        email: 'admin@cteamglobal.com',
        password: 'admin123',
        name: 'Administrador',
        role: 'admin'
      });
      console.log('Default admin user created: admin@cteamglobal.com / admin123');
    }

    server.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🎫 C-Team Ticketera - Backend Server                   ║
║                                                           ║
║   Server running on: http://localhost:${PORT}              ║
║   Environment: ${process.env.NODE_ENV || 'development'}                          ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
