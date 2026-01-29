# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

C-Team Ticketera is a professional ticket management system with real-time chat, SLA tracking, and agent rankings. It's a full-stack application with a Vue.js frontend and Node.js/Express backend.

## Development Commands

```bash
# Backend (from /backend directory)
npm run dev          # Start backend with nodemon on port 3000
npm start            # Production start

# Frontend (from /frontend directory)
npm run dev          # Start Vite dev server on port 5173
npm run build        # Production build
npm run preview      # Preview production build
```

Both servers need to run simultaneously. The frontend proxies `/api` and `/socket.io` to the backend via Vite config.

## Architecture

### Backend (`/backend/src`)
- **Express + Socket.io** server with JWT authentication
- **Sequelize ORM** supporting MySQL, PostgreSQL, and SQLite
- Database auto-syncs on startup; creates default admin user (`admin@cteamglobal.com` / `admin123`)

Key patterns:
- Controllers handle business logic (`/controllers/*.js`)
- Routes define API endpoints (`/routes/*.js`)
- Models define Sequelize schemas with relationships (`/models/index.js` centralizes relations)
- Services handle SLA calculations, email, and notifications (`/services/*.js`)
- Socket handlers manage real-time chat (`/socket/chatHandler.js`)

### Frontend (`/frontend/src`)
- **Vue 3** with Composition API and `<script setup>`
- **Pinia** for state management (`/stores/*.js`)
- **Vue Router** with role-based guards (`admin`, `agent` roles)
- **TailwindCSS** with custom dark theme (see `tailwind.config.js` for color tokens)
- **vue-i18n** for Spanish/English localization (`/i18n/locales/*.json`)

Key patterns:
- Views organized by access level: `/views/public`, `/views/staff`, `/views/admin`, `/views/auth`
- Single layout component: `StaffLayout.vue` wraps all authenticated views
- API calls via Axios instance with auth interceptor (`/services/api.js`)
- Real-time updates via Socket.io client (`/services/socket.js`)
- Reusable composables in `/composables` (e.g., `useHelpers.js` for status/priority labels)

### Data Flow
1. Public users create tickets via `/new-ticket` (no auth required)
2. Tickets are tracked by ticket number (format: `CT-YYYY-NNNNN`)
3. Staff manage tickets via dashboard with real-time chat
4. SLA times exclude holidays and non-working hours

### Key Models & Relationships
```
User (admin/agent) ──┬── Ticket (assignedAgentId)
                     └── Message, TicketHistory, Notification
Category ──── Ticket, CannedResponse
Client ──── Ticket (company relationship)
Ticket ──── Message, TicketHistory, Notification
SLAConfig ──── Priority-based response/resolution times
Holiday, WorkSchedule ──── Excluded from SLA calculations
```

## Environment Configuration

Backend requires `.env` with:
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` (or `DATABASE_URL`)
- `JWT_SECRET`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`
- `FRONTEND_URL` for CORS and email links

Frontend uses:
- `VITE_API_URL` (optional, defaults to proxy in dev or Railway URL in prod)

## i18n

Translations are in `/frontend/src/i18n/locales/{en,es}.json`. When adding UI text:
1. Add key to both locale files
2. Use `const { t } = useI18n()` in component
3. Replace hardcoded text with `{{ t('key.path') }}`

## UI Conventions

- Dark theme with cyan (`primary-500`) and purple (`accent-500`) accents
- Status colors: new (blue), in_progress (yellow), waiting (orange), resolved (green), closed (gray)
- Priority colors: low (gray), medium (blue), high (orange), urgent (red)
- Use existing Tailwind color tokens from `tailwind.config.js`
