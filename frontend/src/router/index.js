import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  // Public routes
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/public/Home.vue')
  },
  {
    path: '/new-ticket',
    name: 'new-ticket',
    component: () => import('@/views/public/NewTicket.vue')
  },
  {
    path: '/ticket/:token',
    name: 'track-ticket',
    component: () => import('@/views/public/TrackTicket.vue')
  },
  {
    path: '/ticket/:token/rate/:rating',
    name: 'rate-ticket',
    component: () => import('@/views/public/RateTicket.vue')
  },
  {
    path: '/ranking',
    name: 'public-ranking',
    component: () => import('@/views/public/RankingTV.vue')
  },

  // Auth routes
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/auth/Login.vue'),
    meta: { guest: true }
  },

  // Staff routes
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/views/staff/Dashboard.vue'),
    meta: { requiresAuth: true, roles: ['admin', 'agent'] }
  },
  {
    path: '/tickets',
    name: 'tickets',
    component: () => import('@/views/staff/TicketList.vue'),
    meta: { requiresAuth: true, roles: ['admin', 'agent'] }
  },
  {
    path: '/tickets/new',
    name: 'staff-new-ticket',
    component: () => import('@/views/staff/NewTicket.vue'),
    meta: { requiresAuth: true, roles: ['admin', 'agent'] }
  },
  {
    path: '/tickets/:id',
    name: 'ticket-detail',
    component: () => import('@/views/staff/TicketDetail.vue'),
    meta: { requiresAuth: true, roles: ['admin', 'agent'] }
  },

  // Admin routes
  {
    path: '/admin/users',
    name: 'admin-users',
    component: () => import('@/views/admin/Users.vue'),
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/admin/categories',
    name: 'admin-categories',
    component: () => import('@/views/admin/Categories.vue'),
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/admin/sla',
    name: 'admin-sla',
    component: () => import('@/views/admin/SLAConfig.vue'),
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/admin/holidays',
    name: 'admin-holidays',
    component: () => import('@/views/admin/Holidays.vue'),
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/admin/clients',
    name: 'admin-clients',
    component: () => import('@/views/admin/Clients.vue'),
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/canned-responses',
    name: 'canned-responses',
    component: () => import('@/views/staff/CannedResponses.vue'),
    meta: { requiresAuth: true, roles: ['admin', 'agent'] }
  },
  {
    path: '/staff/ranking',
    name: 'staff-ranking',
    component: () => import('@/views/staff/Ranking.vue'),
    meta: { requiresAuth: true, roles: ['admin', 'agent'] }
  },

  // 404
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // Check if route requires auth
  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      return next({ name: 'login', query: { redirect: to.fullPath } })
    }

    // Check role access
    if (to.meta.roles && !to.meta.roles.includes(authStore.user?.role)) {
      return next({ name: 'dashboard' })
    }
  }

  // Redirect logged in users away from guest pages
  if (to.meta.guest && authStore.isAuthenticated) {
    return next({ name: 'dashboard' })
  }

  next()
})

export default router
