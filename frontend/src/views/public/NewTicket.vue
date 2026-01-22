<template>
  <div class="min-h-screen bg-gray-50 py-12 px-4">
    <div class="max-w-2xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-8">
        <router-link to="/" class="inline-flex items-center gap-2 mb-6">
          <svg class="w-10 h-10 text-primary-600" viewBox="0 0 100 100" fill="currentColor">
            <rect width="100" height="100" rx="20" fill="currentColor"/>
            <path d="M25 35h50v5H25zM25 45h50v5H25zM25 55h30v5H25zM65 50l15 15-15 15" stroke="white" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span class="text-2xl font-bold text-gray-800">C-Team Ticketera</span>
        </router-link>
        <h1 class="text-3xl font-bold text-gray-800 mb-2">Crear nuevo ticket</h1>
        <p class="text-gray-600">Completa el formulario y te responderemos lo antes posible</p>
      </div>

      <!-- Success state -->
      <div v-if="success" class="bg-white rounded-xl shadow-lg p-8 text-center">
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <h2 class="text-2xl font-semibold text-gray-800 mb-2">¡Ticket creado!</h2>
        <p class="text-gray-600 mb-4">
          Tu número de ticket es: <strong class="text-primary-600">{{ createdTicket?.ticketNumber }}</strong>
        </p>
        <p class="text-gray-600 mb-6">
          Hemos enviado un email a <strong>{{ form.clientEmail }}</strong> con los detalles y un enlace para seguir tu ticket.
        </p>
        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <router-link
            :to="`/ticket/${createdAccessToken}`"
            class="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Ver mi ticket
          </router-link>
          <router-link
            to="/"
            class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Volver al inicio
          </router-link>
        </div>
      </div>

      <!-- Form -->
      <form v-else @submit.prevent="submitTicket" class="bg-white rounded-xl shadow-lg p-6 lg:p-8">
        <!-- Contact info -->
        <div class="mb-8">
          <h2 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
            Información de contacto
          </h2>

          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
              <input
                v-model="form.firstName"
                type="text"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Tu nombre"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Apellido *</label>
              <input
                v-model="form.lastName"
                type="text"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Tu apellido"
              />
            </div>
          </div>

          <div class="grid md:grid-cols-2 gap-4 mt-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                v-model="form.clientEmail"
                type="email"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="tu@email.com"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
              <input
                v-model="form.clientCompany"
                type="text"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Nombre de tu empresa"
              />
            </div>
          </div>
        </div>

        <!-- Ticket info -->
        <div class="mb-8">
          <h2 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <svg class="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/>
            </svg>
            Detalle del ticket
          </h2>

          <div class="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
              <select
                v-model="form.categoryId"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Selecciona una categoría</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                  {{ cat.name }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
              <select
                v-model="form.priority"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Asunto *</label>
            <input
              v-model="form.title"
              type="text"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Resumen breve del problema"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
            <textarea
              v-model="form.description"
              required
              rows="5"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Describe tu problema o consulta con el mayor detalle posible..."
            />
          </div>
        </div>

        <!-- Error message -->
        <div v-if="error" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {{ error }}
        </div>

        <!-- Submit -->
        <div class="flex items-center justify-between">
          <router-link to="/" class="text-gray-600 hover:text-gray-800">
            &larr; Volver
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
              Enviando...
            </span>
            <span v-else>Crear ticket</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'
import { useTicketStore } from '@/stores/tickets'

const ticketStore = useTicketStore()

const form = ref({
  firstName: '',
  lastName: '',
  clientEmail: '',
  clientCompany: '',
  categoryId: '',
  priority: 'medium',
  title: '',
  description: ''
})

const categories = ref([])
const loading = ref(false)
const error = ref('')
const success = ref(false)
const createdTicket = ref(null)
const createdAccessToken = ref('')

onMounted(async () => {
  try {
    const { data } = await api.get('/categories', { params: { isActive: true } })
    categories.value = data.categories
  } catch (err) {
    console.error('Error loading categories:', err)
  }
})

async function submitTicket() {
  error.value = ''
  loading.value = true

  const ticketData = {
    title: form.value.title,
    description: form.value.description,
    priority: form.value.priority,
    categoryId: form.value.categoryId || null,
    clientName: `${form.value.firstName} ${form.value.lastName}`,
    clientEmail: form.value.clientEmail,
    clientCompany: form.value.clientCompany || null
  }

  const result = await ticketStore.createTicket(ticketData)

  if (result.success) {
    createdTicket.value = result.ticket
    createdAccessToken.value = result.accessToken
    success.value = true
  } else {
    error.value = result.error
  }

  loading.value = false
}
</script>
