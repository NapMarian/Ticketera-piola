import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'
import socketService from '@/services/socket'

export const useNotificationStore = defineStore('notifications', () => {
  const notifications = ref([])
  const unreadCount = ref(0)
  const loading = ref(false)

  async function fetchNotifications(params = {}) {
    loading.value = true
    try {
      const { data } = await api.get('/notifications', { params })
      notifications.value = data.notifications
      unreadCount.value = data.unreadCount
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al obtener notificaciones'
      }
    } finally {
      loading.value = false
    }
  }

  async function fetchUnreadCount() {
    try {
      const { data } = await api.get('/notifications/unread-count')
      unreadCount.value = data.count
      return { success: true }
    } catch (error) {
      return { success: false }
    }
  }

  async function markAsRead(id) {
    try {
      await api.put(`/notifications/${id}/read`)

      const notification = notifications.value.find(n => n.id === id)
      if (notification && !notification.isRead) {
        notification.isRead = true
        unreadCount.value = Math.max(0, unreadCount.value - 1)
      }

      return { success: true }
    } catch (error) {
      return { success: false }
    }
  }

  async function markAllAsRead() {
    try {
      await api.put('/notifications/read-all')
      notifications.value.forEach(n => n.isRead = true)
      unreadCount.value = 0
      return { success: true }
    } catch (error) {
      return { success: false }
    }
  }

  function addNotification(notification) {
    notifications.value.unshift(notification)
    unreadCount.value++
  }

  function setupSocketListener() {
    socketService.onNotification((notification) => {
      addNotification(notification)
    })
  }

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    addNotification,
    setupSocketListener
  }
})
