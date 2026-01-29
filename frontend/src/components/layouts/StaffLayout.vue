<template>
  <div class="min-h-screen bg-background-primary">
    <!-- Sidebar -->
    <aside
      class="fixed inset-y-0 left-0 z-50 w-64 bg-background-secondary border-r border-border transform transition-transform duration-300 lg:translate-x-0"
      :class="{ '-translate-x-full': !sidebarOpen }"
    >
      <!-- Logo -->
      <div class="flex items-center h-16 px-4 border-b border-border">
        <router-link to="/dashboard" class="flex items-center gap-3">
          <img
            src="/logo-letra-blanca-sin-fondo-scaled-e1755635743469-2048x1210.png"
            alt="C-Team"
            class="h-8 w-auto"
          />
        </router-link>
      </div>

      <!-- Navigation -->
      <nav class="mt-4 px-3">
        <router-link
          v-for="item in menuItems"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 px-3 py-2.5 mb-1 text-gray-400 rounded-lg hover:bg-surface-hover hover:text-white transition-colors"
          :class="{ 'bg-surface text-white': isActive(item.to) }"
        >
          <component :is="item.icon" class="w-5 h-5" />
          <span class="text-sm font-medium">{{ item.label }}</span>
        </router-link>

        <!-- Admin section -->
        <div v-if="authStore.isAdmin" class="mt-6 pt-4 border-t border-border">
          <p class="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">{{ t('nav.admin') }}</p>
          <router-link
            v-for="item in adminMenuItems"
            :key="item.to"
            :to="item.to"
            class="flex items-center gap-3 px-3 py-2.5 mb-1 text-gray-400 rounded-lg hover:bg-surface-hover hover:text-white transition-colors"
            :class="{ 'bg-surface text-white': isActive(item.to) }"
          >
            <component :is="item.icon" class="w-5 h-5" />
            <span class="text-sm font-medium">{{ item.label }}</span>
          </router-link>
        </div>
      </nav>
    </aside>

    <!-- Main content -->
    <div class="lg:ml-64">
      <!-- Top bar -->
      <header class="sticky top-0 z-40 bg-background-secondary/80 backdrop-blur-sm border-b border-border">
        <div class="flex items-center justify-between h-14 px-4 lg:px-6">
          <!-- Mobile menu button -->
          <button
            @click="sidebarOpen = !sidebarOpen"
            class="lg:hidden p-2 text-gray-400 hover:bg-surface-hover hover:text-white rounded-lg transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>

          <!-- Page title -->
          <h1 class="text-base font-semibold text-white">{{ pageTitle }}</h1>

          <!-- Right side -->
          <div class="flex items-center gap-2">
            <!-- Language selector -->
            <LanguageSelector />

            <!-- Notifications -->
            <div class="relative">
              <button
                @click="showNotifications = !showNotifications"
                class="relative p-2 text-gray-400 hover:bg-surface-hover hover:text-white rounded-lg transition-colors"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                </svg>
                <span
                  v-if="notificationStore.unreadCount > 0"
                  class="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center font-medium"
                >
                  {{ notificationStore.unreadCount > 9 ? '9+' : notificationStore.unreadCount }}
                </span>
              </button>

              <!-- Notifications dropdown -->
              <NotificationDropdown
                v-if="showNotifications"
                @close="showNotifications = false"
              />
            </div>

            <!-- User menu -->
            <div class="relative">
              <button
                @click="showUserMenu = !showUserMenu"
                class="flex items-center gap-2 p-1.5 text-gray-400 hover:bg-surface-hover rounded-lg transition-colors"
              >
                <div class="w-7 h-7 rounded-full flex items-center justify-center overflow-hidden"
                     :class="{ 'bg-gradient-to-br from-primary-500 to-accent-500': !userAvatarUrl }">
                  <img
                    v-if="userAvatarUrl"
                    :src="userAvatarUrl"
                    alt="Avatar"
                    class="w-full h-full object-cover"
                  />
                  <span v-else class="text-white text-xs font-semibold">{{ userInitials }}</span>
                </div>
                <span class="hidden md:block text-sm text-gray-300">{{ authStore.user?.name }}</span>
                <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>

              <!-- User dropdown -->
              <div
                v-if="showUserMenu"
                class="absolute right-0 mt-2 w-56 bg-background-tertiary rounded-lg shadow-dark-lg border border-border py-1 z-50"
              >
                <div class="px-4 py-3 border-b border-border">
                  <p class="font-medium text-white text-sm">{{ authStore.user?.name }}</p>
                  <p class="text-xs text-gray-500 mt-0.5">{{ authStore.user?.email }}</p>
                </div>
                <button
                  @click="showProfileModal = true; showUserMenu = false"
                  class="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-surface-hover transition-colors flex items-center gap-2"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                  {{ t('nav.myProfile') }}
                </button>
                <button
                  @click="logout"
                  class="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-surface-hover transition-colors flex items-center gap-2"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                  </svg>
                  {{ t('nav.logout') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- Page content -->
      <main class="p-4 lg:p-6">
        <slot />
      </main>
    </div>

    <!-- Mobile sidebar overlay -->
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
      @click="sidebarOpen = false"
    />

    <!-- Profile Modal -->
    <div
      v-if="showProfileModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @mousedown.self="backdropMouseDown = true"
      @mouseup.self="if (backdropMouseDown) showProfileModal = false; backdropMouseDown = false"
      @mouseup="backdropMouseDown = false"
    >
      <div class="bg-background-tertiary rounded-xl border border-border shadow-xl max-w-md w-full p-6">
        <h2 class="text-xl font-semibold text-white mb-6">Mi Perfil</h2>

        <!-- Avatar section -->
        <div class="flex flex-col items-center mb-6">
          <div class="relative group">
            <div class="w-24 h-24 rounded-full overflow-hidden"
                 :class="{ 'bg-gradient-to-br from-primary-500 to-accent-500': !userAvatarUrl }">
              <img
                v-if="userAvatarUrl"
                :src="userAvatarUrl"
                alt="Avatar"
                class="w-full h-full object-cover"
              />
              <div v-else class="w-full h-full flex items-center justify-center">
                <span class="text-white text-2xl font-semibold">{{ userInitials }}</span>
              </div>
            </div>
            <label class="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              <input
                type="file"
                accept="image/*"
                class="hidden"
                @change="handleAvatarUpload"
              />
            </label>
          </div>
          <p class="text-sm text-gray-500 mt-2">Click para cambiar foto</p>
          <button
            v-if="authStore.user?.avatar"
            @click="handleDeleteAvatar"
            class="mt-2 text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            Eliminar foto
          </button>
        </div>

        <!-- Profile form -->
        <form @submit.prevent="handleUpdateProfile">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-400 mb-1">Nombre</label>
            <input
              v-model="profileForm.name"
              type="text"
              class="w-full px-4 py-2 bg-surface border border-border rounded-lg text-white focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
            />
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-400 mb-1">Email</label>
            <input
              :value="authStore.user?.email"
              type="email"
              disabled
              class="w-full px-4 py-2 bg-surface/50 border border-border rounded-lg text-gray-500 cursor-not-allowed"
            />
          </div>

          <div v-if="profileError" class="mb-4 p-3 bg-red-900/50 text-red-400 rounded-lg text-sm">
            {{ profileError }}
          </div>

          <div v-if="profileSuccess" class="mb-4 p-3 bg-green-900/50 text-green-400 rounded-lg text-sm">
            {{ profileSuccess }}
          </div>

          <div class="flex gap-3 justify-end">
            <button
              type="button"
              @click="showProfileModal = false"
              class="px-4 py-2 bg-surface border border-border text-gray-400 rounded-lg hover:bg-surface-hover transition-colors"
            >
              Cerrar
            </button>
            <button
              type="submit"
              :disabled="profileSaving"
              class="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 transition-colors"
            >
              {{ profileSaving ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch, h } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notifications'
import { useThemeStore } from '@/stores/theme'
import NotificationDropdown from '@/components/NotificationDropdown.vue'
import LanguageSelector from '@/components/LanguageSelector.vue'

const { t } = useI18n({ useScope: 'global' })

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()
const themeStore = useThemeStore()

const sidebarOpen = ref(false)
const showNotifications = ref(false)
const showUserMenu = ref(false)
const showProfileModal = ref(false)
const backdropMouseDown = ref(false)
const profileSaving = ref(false)
const profileError = ref('')
const profileSuccess = ref('')

const profileForm = reactive({
  name: ''
})

// Initialize form when modal opens
watch(showProfileModal, (isOpen) => {
  if (isOpen) {
    profileForm.name = authStore.user?.name || ''
    profileError.value = ''
    profileSuccess.value = ''
  }
})

const userAvatarUrl = computed(() => {
  return authStore.getAvatarUrl(authStore.user?.avatar)
})

const props = defineProps({
  pageTitle: {
    type: String,
    default: 'Dashboard'
  }
})

// Icons as render functions
const DashboardIcon = () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' })
])

const TicketIcon = () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z' })
])

const ResponseIcon = () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' })
])

const RankingIcon = () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' })
])

const UsersIcon = () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' })
])

const CategoryIcon = () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z' })
])

const SLAIcon = () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' })
])

const CalendarIcon = () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' })
])

const BuildingIcon = () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' })
])

const menuItems = computed(() => [
  { to: '/dashboard', label: t('nav.dashboard'), icon: DashboardIcon },
  { to: '/tickets', label: t('nav.tickets'), icon: TicketIcon },
  { to: '/canned-responses', label: t('nav.responses'), icon: ResponseIcon },
  { to: '/staff/ranking', label: t('nav.ranking'), icon: RankingIcon }
])

const adminMenuItems = computed(() => [
  { to: '/admin/users', label: t('nav.users'), icon: UsersIcon },
  { to: '/admin/clients', label: t('nav.clients'), icon: BuildingIcon },
  { to: '/admin/categories', label: t('nav.categories'), icon: CategoryIcon },
  { to: '/admin/sla', label: t('nav.sla'), icon: SLAIcon },
  { to: '/admin/holidays', label: t('nav.holidays'), icon: CalendarIcon }
])

const userInitials = computed(() => {
  const name = authStore.user?.name || ''
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
})

function isActive(path) {
  return route.path === path || route.path.startsWith(path + '/')
}

function logout() {
  authStore.logout()
  router.push('/login')
}

async function handleUpdateProfile() {
  profileSaving.value = true
  profileError.value = ''
  profileSuccess.value = ''

  const result = await authStore.updateProfile({ name: profileForm.name })

  if (result.success) {
    profileSuccess.value = 'Perfil actualizado'
  } else {
    profileError.value = result.error
  }

  profileSaving.value = false
}

async function handleAvatarUpload(event) {
  const file = event.target.files?.[0]
  if (!file) return

  profileError.value = ''
  profileSuccess.value = ''

  const result = await authStore.uploadAvatar(file)

  if (result.success) {
    profileSuccess.value = 'Avatar actualizado'
  } else {
    profileError.value = result.error
  }

  // Clear the input
  event.target.value = ''
}

async function handleDeleteAvatar() {
  if (!confirm('Eliminar tu foto de perfil?')) return

  profileError.value = ''
  profileSuccess.value = ''

  const result = await authStore.deleteAvatar()

  if (result.success) {
    profileSuccess.value = 'Avatar eliminado'
  } else {
    profileError.value = result.error
  }
}

onMounted(() => {
  notificationStore.fetchNotifications()
  notificationStore.setupSocketListener()
  themeStore.init()
})
</script>
