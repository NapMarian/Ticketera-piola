<template>
  <StaffLayout :page-title="`Ticket ${ticket?.ticketNumber || ''}`">
    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-24">
      <svg class="w-10 h-10 animate-spin text-primary-500" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
      </svg>
    </div>

    <div v-else-if="ticket" class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="bg-background-secondary/50 backdrop-blur-sm rounded-xl border border-border p-6 mb-6">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <!-- Title and badges -->
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <router-link to="/tickets" class="text-gray-400 hover:text-gray-300">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                </svg>
              </router-link>
              <span class="text-sm text-gray-500">{{ ticket.ticketNumber }}</span>
              <span
                class="px-2 py-1 rounded-full text-xs font-medium"
                :class="getStatusClass(ticket.status)"
              >
                {{ getStatusLabel(ticket.status) }}
              </span>
              <span
                class="px-2 py-1 rounded-full text-xs font-medium"
                :class="getPriorityClass(ticket.priority)"
              >
                {{ getPriorityLabel(ticket.priority) }}
              </span>
            </div>
            <h1 class="text-2xl font-bold text-white">{{ ticket.title }}</h1>
          </div>

          <!-- SLA and Actions -->
          <div class="flex items-center gap-4">
            <div
              v-if="ticket.slaStatus"
              class="px-4 py-2 rounded-lg text-sm font-medium"
              :style="{ backgroundColor: ticket.slaStatus.color + '20', color: ticket.slaStatus.color }"
            >
              {{ ticket.slaStatus.label }}
            </div>
          </div>
        </div>
      </div>

      <!-- Content grid -->
      <div class="grid lg:grid-cols-3 gap-6">
        <!-- Left column: Info & Actions -->
        <div class="space-y-6">
          <!-- Client info -->
          <div class="bg-background-secondary/50 backdrop-blur-sm rounded-xl border border-border p-6">
            <h2 class="font-semibold text-white mb-4">Contacto</h2>
            <div class="space-y-3">
              <div>
                <p class="text-sm text-gray-500">Nombre</p>
                <p class="font-medium text-white">{{ ticket.clientName }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Email</p>
                <p class="text-gray-300">{{ ticket.clientEmail }}</p>
              </div>
              <div v-if="ticket.clientCompany">
                <p class="text-sm text-gray-500">Empresa (indicada)</p>
                <p class="text-gray-300">{{ ticket.clientCompany }}</p>
              </div>
              <div v-if="ticket.company" class="pt-2 border-t border-border">
                <p class="text-sm text-gray-500">Cliente Asignado</p>
                <p class="font-medium text-primary-400">{{ ticket.company.name }}</p>
                <p v-if="ticket.company.contactPerson" class="text-xs text-gray-500">
                  Contacto: {{ ticket.company.contactPerson }}
                </p>
              </div>
            </div>
          </div>

          <!-- Ticket actions -->
          <div class="bg-background-secondary/50 backdrop-blur-sm rounded-xl border border-border p-6">
            <h2 class="font-semibold text-white mb-4">Acciones</h2>

            <!-- Status -->
            <div class="mb-4">
              <label class="block text-sm text-gray-500 mb-1">Estado</label>
              <select
                v-model="editForm.status"
                @change="updateTicket('status')"
                class="w-full px-3 py-2 bg-surface border border-border rounded-lg text-white focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
              >
                <option value="new">Nuevo</option>
                <option value="in_progress">En Progreso</option>
                <option value="waiting">En Espera</option>
                <option value="resolved">Resuelto</option>
                <option value="closed">Cerrado</option>
              </select>
            </div>

            <!-- Priority -->
            <div class="mb-4">
              <label class="block text-sm text-gray-500 mb-1">Prioridad</label>
              <select
                v-model="editForm.priority"
                @change="updateTicket('priority')"
                class="w-full px-3 py-2 bg-surface border border-border rounded-lg text-white focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>

            <!-- Assigned agent -->
            <div class="mb-4">
              <label class="block text-sm text-gray-500 mb-1">Agente asignado</label>
              <select
                v-model="editForm.assignedAgentId"
                @change="updateTicket('assignedAgentId')"
                class="w-full px-3 py-2 bg-surface border border-border rounded-lg text-white focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
              >
                <option :value="null">Sin asignar</option>
                <option v-for="agent in agents" :key="agent.id" :value="agent.id">
                  {{ agent.name }}
                </option>
              </select>
            </div>

            <!-- Category -->
            <div class="mb-4">
              <label class="block text-sm text-gray-500 mb-1">Categoria</label>
              <select
                v-model="editForm.categoryId"
                @change="updateTicket('categoryId')"
                class="w-full px-3 py-2 bg-surface border border-border rounded-lg text-white focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
              >
                <option :value="null">Sin categoria</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                  {{ cat.name }}
                </option>
              </select>
            </div>

            <!-- Client (Company) -->
            <div>
              <label class="block text-sm text-gray-500 mb-1">Cliente / Empresa</label>
              <select
                v-model="editForm.clientId"
                @change="updateTicket('clientId')"
                class="w-full px-3 py-2 bg-surface border border-border rounded-lg text-white focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
              >
                <option :value="null">Sin asignar</option>
                <option v-for="client in clients" :key="client.id" :value="client.id">
                  {{ client.name }}
                </option>
              </select>
            </div>
          </div>

          <!-- Description -->
          <div class="bg-background-secondary/50 backdrop-blur-sm rounded-xl border border-border p-6">
            <h2 class="font-semibold text-white mb-3">Descripcion</h2>
            <p class="text-gray-400 whitespace-pre-wrap">{{ ticket.description }}</p>
          </div>

          <!-- History -->
          <div class="bg-background-secondary/50 backdrop-blur-sm rounded-xl border border-border p-6">
            <h2 class="font-semibold text-white mb-4">Historial</h2>
            <div class="space-y-3 max-h-64 overflow-y-auto">
              <div
                v-for="entry in ticket.history"
                :key="entry.id"
                class="flex gap-3 text-sm"
              >
                <div class="w-2 h-2 bg-primary-400 rounded-full mt-1.5 flex-shrink-0" />
                <div class="flex-1">
                  <p class="text-gray-300">
                    {{ getHistoryText(entry) }}
                    <span v-if="entry.user" class="text-gray-500">
                      por {{ entry.user.name }}
                    </span>
                  </p>
                  <p class="text-gray-500 text-xs">{{ formatDateTime(entry.createdAt) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right column: Chat -->
        <div class="lg:col-span-2 h-[700px]">
          <TicketChat :ticket-id="ticket.id" />
        </div>
      </div>
    </div>
  </StaffLayout>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import StaffLayout from '@/components/layouts/StaffLayout.vue'
import TicketChat from '@/components/TicketChat.vue'
import { useTicketStore } from '@/stores/tickets'
import { useHelpers } from '@/composables/useHelpers'
import api from '@/services/api'

const route = useRoute()
const ticketStore = useTicketStore()
const { getStatusLabel, getPriorityLabel, getStatusClass, getPriorityClass, formatDateTime } = useHelpers()

const ticket = ref(null)
const loading = ref(true)
const agents = ref([])
const categories = ref([])
const clients = ref([])

const editForm = reactive({
  status: '',
  priority: '',
  assignedAgentId: null,
  categoryId: null,
  clientId: null
})

function getHistoryText(entry) {
  const texts = {
    created: 'Ticket creado',
    status_changed: `Estado cambiado de ${getStatusLabel(entry.oldValue)} a ${getStatusLabel(entry.newValue)}`,
    priority_changed: `Prioridad cambiada de ${getPriorityLabel(entry.oldValue)} a ${getPriorityLabel(entry.newValue)}`,
    assigned: 'Ticket asignado',
    transferred: 'Ticket transferido',
    category_changed: 'Categoría cambiada',
    client_changed: 'Cliente/Empresa cambiado',
    resolved: 'Ticket resuelto',
    closed: 'Ticket cerrado',
    reopened: 'Ticket reabierto'
  }
  return texts[entry.action] || entry.action
}

async function loadTicket() {
  loading.value = true
  const result = await ticketStore.fetchTicket(route.params.id)

  if (result.success) {
    ticket.value = result.ticket
    editForm.status = ticket.value.status
    editForm.priority = ticket.value.priority
    editForm.assignedAgentId = ticket.value.assignedAgentId
    editForm.categoryId = ticket.value.categoryId
    editForm.clientId = ticket.value.clientId
  }

  loading.value = false
}

async function loadAgentsAndCategories() {
  const [agentsRes, categoriesRes, clientsRes] = await Promise.all([
    api.get('/users/agents'),
    api.get('/categories', { params: { isActive: true } }),
    api.get('/clients', { params: { isActive: true } })
  ])

  agents.value = agentsRes.data.agents
  categories.value = categoriesRes.data.categories
  clients.value = clientsRes.data.clients
}

async function updateTicket(field) {
  const updates = { [field]: editForm[field] }
  const result = await ticketStore.updateTicket(ticket.value.id, updates)

  if (result.success) {
    ticket.value = result.ticket
  }
}

onMounted(() => {
  loadTicket()
  loadAgentsAndCategories()
})

watch(() => route.params.id, () => {
  if (route.params.id) {
    loadTicket()
  }
})
</script>
