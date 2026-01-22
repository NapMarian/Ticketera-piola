# C-Team Ticketera

Sistema de gestión de tickets profesional desarrollado para C-Team Global.

## Características

- **Formulario público de tickets** - Clientes pueden crear tickets sin necesidad de cuenta
- **Chat en tiempo real** - Comunicación entre agentes y clientes con WebSockets
- **Sistema de SLA** - Tiempos de respuesta y resolución con exclusión de feriados
- **Dashboard con métricas** - Gráficos, estadísticas y ranking de agentes
- **Notificaciones** - Email y en tiempo real en la aplicación
- **Gestión completa** - Estados, prioridades, derivación, historial de cambios

## Stack Tecnológico

- **Frontend:** Vue.js 3, Vite, Pinia, TailwindCSS, Chart.js
- **Backend:** Node.js, Express, Socket.io
- **Base de datos:** MySQL con Sequelize ORM
- **Email:** Nodemailer

## Requisitos

- Node.js 18+
- MySQL 8.0+
- npm o yarn

## Instalación

### 1. Clonar y configurar

```bash
# Clonar el repositorio
cd "Ticketera piola"

# Crear base de datos MySQL
mysql -u root -p
CREATE DATABASE cteam_ticketera;
exit;
```

### 2. Configurar Backend

```bash
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales
```

Editar el archivo `.env`:

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=cteam_ticketera
DB_USER=root
DB_PASSWORD=tu_password

# JWT
JWT_SECRET=genera-una-clave-segura-aqui

# Email (SMTP de tu dominio)
SMTP_HOST=smtp.cteamglobal.com
SMTP_PORT=587
SMTP_USER=ticketera@cteamglobal.com
SMTP_PASS=tu_password_email
EMAIL_FROM=C-Team Ticketera <ticketera@cteamglobal.com>

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### 3. Configurar Frontend

```bash
cd ../frontend

# Instalar dependencias
npm install
```

### 4. Iniciar la aplicación

En dos terminales separadas:

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

La aplicación estará disponible en:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000

## Credenciales por defecto

Al iniciar por primera vez, se crea automáticamente:

- **Email:** admin@cteamglobal.com
- **Password:** admin123

**¡Cambiar la contraseña inmediatamente en producción!**

## Estructura del Proyecto

```
ticketera/
├── backend/
│   ├── src/
│   │   ├── config/         # Configuración DB, email
│   │   ├── controllers/    # Lógica de endpoints
│   │   ├── middleware/     # Auth, validación
│   │   ├── models/         # Modelos Sequelize
│   │   ├── routes/         # Rutas API
│   │   ├── services/       # SLA, email, notificaciones
│   │   └── socket/         # WebSocket handlers
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/     # Componentes Vue
│   │   ├── views/          # Páginas
│   │   ├── stores/         # Pinia stores
│   │   ├── services/       # API, socket
│   │   ├── composables/    # Vue composables
│   │   └── router/         # Vue Router
│   └── package.json
│
└── README.md
```

## API Endpoints Principales

### Públicos
- `POST /api/tickets` - Crear ticket
- `GET /api/tickets/track/:token` - Ver ticket por token
- `GET /api/categories` - Listar categorías

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/profile` - Obtener perfil

### Tickets (requiere auth)
- `GET /api/tickets` - Listar tickets
- `GET /api/tickets/:id` - Ver ticket
- `PUT /api/tickets/:id` - Actualizar ticket
- `GET /api/tickets/stats` - Estadísticas
- `GET /api/tickets/ranking` - Ranking de agentes

### Mensajes
- `POST /api/messages` - Enviar mensaje
- `GET /api/messages/:ticketId` - Obtener mensajes

### Admin
- `GET /api/users` - Listar usuarios
- `POST /api/users` - Crear usuario
- `GET /api/sla/configs` - Config SLA
- `GET /api/sla/holidays` - Feriados

## Producción

Para desplegar en producción:

```bash
# Build frontend
cd frontend
npm run build

# El contenido de dist/ se puede servir con nginx

# Backend
cd backend
NODE_ENV=production npm start
```

## Soporte

Desarrollado por C-Team Global - 2024
