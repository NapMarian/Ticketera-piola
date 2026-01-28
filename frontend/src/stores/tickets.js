import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'

export const useTicketStore = defineStore('tickets', () => {
  const tickets = ref([])
  const currentTicket = ref(null)
  const pagination = ref({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0
  })
  const loading = ref(false)
  const stats = ref(null)
  const ranking = ref([])

  async function fetchTickets(params = {}) {
    loading.value = true
    try {
      const { data } = await api.get('/tickets', { params })
      tickets.value = data.tickets
      pagination.value = data.pagination
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al obtener tickets'
      }
    } finally {
      loading.value = false
    }
  }

  async function fetchTicket(id) {
    loading.value = true
    try {
      const { data } = await api.get(`/tickets/${id}`)
      currentTicket.value = { ...data.ticket, slaStatus: data.slaStatus }
      return { success: true, ticket: currentTicket.value }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al obtener ticket'
      }
    } finally {
      loading.value = false
    }
  }

  async function fetchTicketByToken(token) {
    loading.value = true
    try {
      const { data } = await api.get(`/tickets/track/${token}`)
      currentTicket.value = { ...data.ticket, slaStatus: data.slaStatus }
      return { success: true, ticket: currentTicket.value }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Ticket no encontrado'
      }
    } finally {
      loading.value = false
    }
  }

  async function fetchTicketByTicketNumber(ticketNumber) {
    loading.value = true
    try {
      const { data } = await api.get(`/tickets/track/${ticketNumber}`)
      currentTicket.value = { ...data.ticket, slaStatus: data.slaStatus }
      return { success: true, ticket: currentTicket.value }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Ticket no encontrado'
      }
    } finally {
      loading.value = false
    }
  }

  async function createTicket(ticketData) {
    loading.value = true
    try {
      const { data } = await api.post('/tickets', ticketData)
      return {
        success: true,
        ticket: data.ticket,
        accessToken: data.accessToken
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al crear ticket'
      }
    } finally {
      loading.value = false
    }
  }

  async function updateTicket(id, updates) {
    try {
      const { data } = await api.put(`/tickets/${id}`, updates)
      currentTicket.value = { ...data.ticket, slaStatus: data.slaStatus }

      // Update in list if present
      const index = tickets.value.findIndex(t => t.id === id)
      if (index !== -1) {
        tickets.value[index] = currentTicket.value
      }

      return { success: true, ticket: currentTicket.value }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al actualizar ticket'
      }
    }
  }

  async function rateTicket(token, rating, comment) {
    try {
      await api.post(`/tickets/track/${token}/rate`, { rating, comment })
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al calificar'
      }
    }
  }

  async function rateTicketByNumber(ticketNumber, rating, comment) {
    try {
      await api.post(`/tickets/track/${ticketNumber}/rate`, { rating, comment })
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al calificar'
      }
    }
  }

  async function fetchStats(params = {}) {
    try {
      const { data } = await api.get('/tickets/stats', { params })
      stats.value = data
      return { success: true, stats: data }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al obtener estadísticas'
      }
    }
  }

  async function fetchRanking(params = {}) {
    try {
      const { data } = await api.get('/tickets/ranking', { params })
      ranking.value = data.ranking
      return { success: true, ranking: data.ranking }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al obtener ranking'
      }
    }
  }

  function clearCurrent() {
    currentTicket.value = null
  }

  return {
    tickets,
    currentTicket,
    pagination,
    loading,
    stats,
    ranking,
    fetchTickets,
    fetchTicket,
    fetchTicketByToken,
    fetchTicketByTicketNumber,
    createTicket,
    updateTicket,
    rateTicket,
    rateTicketByNumber,
    fetchStats,
    fetchRanking,
    clearCurrent
  }
})
