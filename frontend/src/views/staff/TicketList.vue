<template>
  <StaffLayout page-title="Tickets">
    <!-- Header with New Ticket button -->
    <div class="flex justify-between items-center mb-6">
      <div></div>
      <router-link
        to="/tickets/new"
        class="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
        </svg>
        Nuevo Ticket
      </router-link>
    </div>

    <!-- Filters -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-4 mb-6">
      <div class="flex flex-wrap gap-4">
        <!-- Search -->
        <div class="flex-1 min-w-[200px]">
          <input
            v-model="filters.search"
            type="text"
            placeholder="Buscar por número, título, cliente..."
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            @input="debouncedSearch"
          />
        </div>

        <!-- Status filter -->
        <select
          v-model="filters.status"
          @change="loadTickets"
          class="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="">Todos los estados</option>
          <option value="new">Nuevo</option>
          <option value="in_progress">En Progreso</option>
          <option value="waiting">En Espera</option>
          <option value="resolved">Resuelto</option>
          <option value="closed">Cerrado</option>
        </select>

        <!-- Priority filter -->
        <select
          v-model="filters.priority"
          @change="loadTickets"
          class="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="">Todas las prioridades</option>
          <option value="urgent">Urgente</option>
          <option value="high">Alta</option>
          <option value="medium">Media</option>
          <option value="low">Baja</option>
        </select>

        <!-- Clear filters -->
        <button
          v-if="hasFilters"
          @click="clearFilters"
          class="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
        >
          Limpiar filtros
        </button>
      </div>
    </div>

    <!-- Tickets table -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
      <!-- Loading -->
      <div v-if="ticketStore.loading" class="p-8 text-center">
        <svg class="w-10 h-10 animate-spin text-primary-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
        </svg>
        <p class="text-gray-600 dark:text-gray-400">Cargando tickets...</p>
      </div>

      <!-- Empty state -->
      <div v-else-if="tickets.length === 0" class="p-8 text-center">
        <svg class="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/>
        </svg>
        <p class="text-gray-500 dark:text-gray-400">No se encontraron tickets</p>
      </div>

      <!-- Table -->
      <table v-else class="w-full">
        <thead class="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Ticket</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Cliente</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Estado</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Prioridad</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Agente</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">SLA</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase">Fecha</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
          <tr
            v-for="ticket in tickets"
            :key="ticket.id"
            @click="goToTicket(ticket.id)"
            class="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
          >
            <td class="px-4 py-4">
              <div>
                <p class="font-medium text-gray-800 dark:text-white">{{ ticket.ticketNumber }}</p>
                <p class="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">{{ ticket.title }}</p>
              </div>
            </td>
            <td class="px-4 py-4">
              <div>
                <p class="text-gray-800 dark:text-white">{{ ticket.clientName }}</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">{{ ticket.clientCompany || ticket.clientEmail }}</p>
              </div>
            </td>
            <td class="px-4 py-4">
              <span
                class="px-2 py-1 rounded-full text-xs font-medium"
                :class="getStatusClass(ticket.status)"
              >
                {{ getStatusLabel(ticket.status) }}
              </span>
            </td>
            <td class="px-4 py-4">
              <span
                class="px-2 py-1 rounded-full text-xs font-medium"
                :class="getPriorityClass(ticket.priority)"
              >
                {{ getPriorityLabel(ticket.priority) }}
              </span>
            </td>
            <td class="px-4 py-4">
              <div v-if="ticket.agent" class="flex items-center gap-2">
                <div class="w-7 h-7 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center text-xs font-medium">
                  {{ getInitials(ticket.agent.name) }}
                </div>
                <span class="text-sm text-gray-700 dark:text-gray-300">{{ ticket.agent.name }}</span>
              </div>
              <span v-else class="text-sm text-gray-400 dark:text-gray-500">Sin asignar</span>
            </td>
            <td class="px-4 py-4">
              <span
                v-if="ticket.slaStatus"
                class="px-2 py-1 rounded text-xs font-medium"
                :style="{ backgroundColor: ticket.slaStatus.color + '20', color: ticket.slaStatus.color }"
              >
                {{ ticket.slaStatus.label }}
              </span>
            </td>
            <td class="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
              {{ timeAgo(ticket.createdAt) }}
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div v-if="pagination.totalPages > 1" class="px-4 py-3 border-t dark:border-gray-700 flex items-center justify-between">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Mostrando {{ (pagination.page - 1) * pagination.limit + 1 }} -
          {{ Math.min(pagination.page * pagination.limit, pagination.total) }} de {{ pagination.total }}
        </p>
        <div class="flex gap-2">
          <button
            @click="changePage(pagination.page - 1)"
            :disabled="pagination.page === 1"
            class="px-3 py-1 border dark:border-gray-600 rounded text-sm text-gray-700 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Anterior
          </button>
          <button
            @click="changePage(pagination.page + 1)"
            :disabled="pagination.page === pagination.totalPages"
            class="px-3 py-1 border dark:border-gray-600 rounded text-sm text-gray-700 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  </StaffLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import StaffLayout from '@/components/layouts/StaffLayout.vue'
import { useTicketStore } from '@/stores/tickets'
import { useHelpers } from '@/composables/useHelpers'

const router = useRouter()
const ticketStore = useTicketStore()
const { getStatusLabel, getPriorityLabel, getStatusClass, getPriorityClass, timeAgo } = useHelpers()

const filters = ref({
  search: '',
  status: '',
  priority: ''
})

const tickets = computed(() => ticketStore.tickets)
const pagination = computed(() => ticketStore.pagination)

const hasFilters = computed(() => {
  return filters.value.search || filters.value.status || filters.value.priority
})

let searchTimeout = null

function debouncedSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    loadTickets()
  }, 300)
}

function loadTickets(page = 1) {
  ticketStore.fetchTickets({
    page,
    search: filters.value.search || undefined,
    status: filters.value.status || undefined,
    priority: filters.value.priority || undefined
  })
}

function changePage(page) {
  loadTickets(page)
}

function clearFilters() {
  filters.value = { search: '', status: '', priority: '' }
  loadTickets()
}

function goToTicket(id) {
  router.push(`/tickets/${id}`)
}

function getInitials(name) {
  return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'
}

onMounted(() => {
  loadTickets()
})
</script>
