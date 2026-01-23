<template>
  <div
    class="absolute right-0 mt-2 w-80 bg-background-tertiary rounded-xl border border-border z-50 overflow-hidden"
    v-click-outside="() => $emit('close')"
  >
    <div class="flex items-center justify-between px-4 py-3 border-b border-border">
      <h3 class="font-semibold text-white">Notificaciones</h3>
      <button
        v-if="store.unreadCount > 0"
        @click="store.markAllAsRead()"
        class="text-sm text-primary-500 hover:text-primary-400"
      >
        Marcar todas como leídas
      </button>
    </div>

    <div class="max-h-96 overflow-y-auto">
      <div
        v-if="store.notifications.length === 0"
        class="px-4 py-8 text-center text-gray-500"
      >
        No hay notificaciones
      </div>

      <div
        v-for="notification in store.notifications"
        :key="notification.id"
        class="px-4 py-3 border-b border-border hover:bg-surface-hover cursor-pointer transition-colors"
        :class="{ 'bg-primary-500/10': !notification.isRead }"
        @click="handleClick(notification)"
      >
        <div class="flex items-start gap-3">
          <div
            class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            :class="getIconClass(notification.type)"
          >
            <component :is="getIcon(notification.type)" class="w-4 h-4" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-medium text-white text-sm">{{ notification.title }}</p>
            <p class="text-sm text-gray-400 truncate">{{ notification.message }}</p>
            <p class="text-xs text-gray-500 mt-1">{{ formatTime(notification.createdAt) }}</p>
          </div>
          <div
            v-if="!notification.isRead"
            class="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-2"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { h } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '@/stores/notifications'

const emit = defineEmits(['close'])
const router = useRouter()
const store = useNotificationStore()

// Simple click outside directive
const vClickOutside = {
  mounted(el, binding) {
    el._clickOutside = (event) => {
      if (!el.contains(event.target)) {
        binding.value()
      }
    }
    setTimeout(() => {
      document.addEventListener('click', el._clickOutside)
    }, 0)
  },
  unmounted(el) {
    document.removeEventListener('click', el._clickOutside)
  }
}

function getIconClass(type) {
  const classes = {
    ticket_created: 'bg-blue-500/20 text-blue-400',
    ticket_assigned: 'bg-green-500/20 text-green-400',
    new_message: 'bg-purple-500/20 text-purple-400',
    sla_warning: 'bg-orange-500/20 text-orange-400',
    sla_breach: 'bg-red-500/20 text-red-400',
    ticket_resolved: 'bg-green-500/20 text-green-400'
  }
  return classes[type] || 'bg-surface text-gray-400'
}

function getIcon(type) {
  const TicketIcon = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z' })
  ])

  const MessageIcon = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' })
  ])

  const ClockIcon = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' })
  ])

  const icons = {
    ticket_created: TicketIcon,
    ticket_assigned: TicketIcon,
    new_message: MessageIcon,
    sla_warning: ClockIcon,
    sla_breach: ClockIcon,
    ticket_resolved: TicketIcon
  }

  return icons[type] || TicketIcon
}

function formatTime(date) {
  const now = new Date()
  const d = new Date(date)
  const diff = now - d
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Ahora'
  if (minutes < 60) return `Hace ${minutes}m`
  if (hours < 24) return `Hace ${hours}h`
  if (days < 7) return `Hace ${days}d`

  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

async function handleClick(notification) {
  if (!notification.isRead) {
    await store.markAsRead(notification.id)
  }

  if (notification.ticketId) {
    router.push(`/tickets/${notification.ticketId}`)
    emit('close')
  }
}
</script>
