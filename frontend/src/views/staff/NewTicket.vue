<template>
  <StaffLayout page-title="Nuevo Ticket">
    <!-- Success state -->
    <div v-if="success" class="max-w-2xl mx-auto">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
        <div class="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <h2 class="text-2xl font-semibold text-gray-800 dark:text-white mb-2">Ticket creado</h2>
        <p class="text-gray-600 dark:text-gray-400 mb-4">
          Numero de ticket: <strong class="text-primary-600">{{ createdTicket?.ticketNumber }}</strong>
        </p>
        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <router-link
            :to="`/tickets/${createdTicket?.id}`"
            class="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Ver ticket
          </router-link>
          <router-link
            to="/tickets"
            class="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Volver a tickets
          </router-link>
        </div>
      </div>
    </div>

    <!-- Form -->
    <div v-else class="max-w-3xl mx-auto">
      <form @submit.prevent="submitTicket" class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 lg:p-8">
        <!-- Contact info -->
        <div class="mb-8">
          <h2 class="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
            Informacion del cliente
          </h2>

          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre completo *</label>
              <input
                v-model="form.clientName"
                type="text"
                required
                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Nombre del cliente"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email *</label>
              <input
                v-model="form.clientEmail"
                type="email"
                required
                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="email@ejemplo.com"
              />
            </div>
          </div>

          <div class="grid md:grid-cols-2 gap-4 mt-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Empresa (texto)</label>
              <input
                v-model="form.clientCompany"
                type="text"
                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Nombre de la empresa"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cliente registrado</label>
              <select
                v-model="form.clientId"
                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option :value="null">Sin asignar</option>
                <option v-for="client in clients" :key="client.id" :value="client.id">
                  {{ client.name }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- Ticket info -->
        <div class="mb-8">
          <h2 class="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/>
            </svg>
            Detalle del ticket
          </h2>

          <div class="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoria *</label>
              <select
                v-model="form.categoryId"
                required
                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Selecciona una categoria</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                  {{ cat.name }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prioridad</label>
              <select
                v-model="form.priority"
                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Asunto *</label>
            <input
              v-model="form.title"
              type="text"
              required
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Resumen breve del problema"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripcion *</label>
            <textarea
              v-model="form.description"
              required
              rows="5"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Describe el problema o consulta con el mayor detalle posible..."
            />
          </div>
        </div>

        <!-- Assignment -->
        <div class="mb-8">
          <h2 class="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
            Asignacion
          </h2>

          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Asignar a agente</label>
              <select
                v-model="form.assignedAgentId"
                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option :value="null">Sin asignar</option>
                <option v-for="agent in agents" :key="agent.id" :value="agent.id">
                  {{ agent.name }} ({{ agent.role }})
                </option>
              </select>
            </div>
            <div class="flex items-end">
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  v-model="form.assignToMe"
                  type="checkbox"
                  class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  @change="handleAssignToMe"
                />
                <span class="text-sm text-gray-700 dark:text-gray-300">Asignarme a mi</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Error message -->
        <div v-if="error" class="mb-4 p-4 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
          {{ error }}
        </div>

        <!-- Submit -->
        <div class="flex items-center justify-between pt-4 border-t dark:border-gray-700">
          <router-link to="/tickets" class="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white">
            &larr; Cancelar
          </router-link>
          <button
            type="submit"
            :disabled="loading"
            class="px-8 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            <span v-if="loading" class="flex items-center gap-2">
              <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              Creando...
            </span>
            <span v-else>Crear ticket</span>
          </button>
        </div>
      </form>
    </div>
  </StaffLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import StaffLayout from '@/components/layouts/StaffLayout.vue'
import { useTicketStore } from '@/stores/tickets'
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

const ticketStore = useTicketStore()
const authStore = useAuthStore()

const form = ref({
  clientName: '',
  clientEmail: '',
  clientCompany: '',
  clientId: null,
  categoryId: '',
  priority: 'medium',
  title: '',
  description: '',
  assignedAgentId: null,
  assignToMe: false
})

const categories = ref([])
const agents = ref([])
const clients = ref([])
const loading = ref(false)
const error = ref('')
const success = ref(false)
const createdTicket = ref(null)

onMounted(async () => {
  await Promise.all([
    loadCategories(),
    loadAgents(),
    loadClients()
  ])
})

async function loadCategories() {
  try {
    const { data } = await api.get('/categories', { params: { isActive: true } })
    categories.value = data.categories
  } catch (err) {
    console.error('Error loading categories:', err)
  }
}

async function loadAgents() {
  try {
    const { data } = await api.get('/users')
    agents.value = data.users.filter(u => u.role === 'admin' || u.role === 'agent')
  } catch (err) {
    console.error('Error loading agents:', err)
  }
}

async function loadClients() {
  try {
    const { data } = await api.get('/clients')
    clients.value = data.clients
  } catch (err) {
    console.error('Error loading clients:', err)
  }
}

function handleAssignToMe() {
  if (form.value.assignToMe) {
    form.value.assignedAgentId = authStore.user?.id
  } else {
    form.value.assignedAgentId = null
  }
}

async function submitTicket() {
  error.value = ''
  loading.value = true

  const ticketData = {
    title: form.value.title,
    description: form.value.description,
    priority: form.value.priority,
    categoryId: form.value.categoryId || null,
    clientName: form.value.clientName,
    clientEmail: form.value.clientEmail,
    clientCompany: form.value.clientCompany || null,
    clientId: form.value.clientId || null,
    assignedAgentId: form.value.assignedAgentId || null
  }

  const result = await ticketStore.createTicket(ticketData)

  if (result.success) {
    createdTicket.value = result.ticket
    success.value = true
  } else {
    error.value = result.error
  }

  loading.value = false
}
</script>
