import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'
import socketService from '@/services/socket'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(null)
  const loading = ref(false)

  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isAgent = computed(() => ['admin', 'agent'].includes(user.value?.role))

  function checkAuth() {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')

    if (savedToken && savedUser) {
      token.value = savedToken
      user.value = JSON.parse(savedUser)
      socketService.connect(savedToken)
    }
  }

  async function login(email, password) {
    loading.value = true
    try {
      const { data } = await api.post('/auth/login', { email, password })

      token.value = data.token
      user.value = data.user

      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))

      socketService.connect(data.token)

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al iniciar sesión'
      }
    } finally {
      loading.value = false
    }
  }

  async function register(userData) {
    loading.value = true
    try {
      const { data } = await api.post('/auth/register', userData)

      token.value = data.token
      user.value = data.user

      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))

      socketService.connect(data.token)

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al registrar'
      }
    } finally {
      loading.value = false
    }
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    socketService.disconnect()
  }

  async function updateProfile(profileData) {
    try {
      const { data } = await api.put('/auth/profile', profileData)
      user.value = data.user
      localStorage.setItem('user', JSON.stringify(data.user))
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al actualizar perfil'
      }
    }
  }

  async function changePassword(currentPassword, newPassword) {
    try {
      await api.put('/auth/password', { currentPassword, newPassword })
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al cambiar contraseña'
      }
    }
  }

  async function uploadAvatar(file) {
    try {
      const formData = new FormData()
      formData.append('avatar', file)

      const { data } = await api.post('/auth/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      user.value = data.user
      localStorage.setItem('user', JSON.stringify(data.user))
      return { success: true, avatar: data.avatar }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al subir avatar'
      }
    }
  }

  async function deleteAvatar() {
    try {
      const { data } = await api.delete('/auth/avatar')
      user.value = data.user
      localStorage.setItem('user', JSON.stringify(data.user))
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al eliminar avatar'
      }
    }
  }

  // Get full avatar URL
  function getAvatarUrl(avatarPath) {
    if (!avatarPath) return null
    // If it's already a full URL, return as is
    if (avatarPath.startsWith('http')) return avatarPath
    // Otherwise, prepend the API base URL
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') ||
      (import.meta.env.PROD ? 'https://ticketera-piola-production.up.railway.app' : '')
    return `${baseUrl}${avatarPath}`
  }

  return {
    user,
    token,
    loading,
    isAuthenticated,
    isAdmin,
    isAgent,
    checkAuth,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    uploadAvatar,
    deleteAvatar,
    getAvatarUrl
  }
})
