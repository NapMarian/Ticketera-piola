<template>
  <div class="min-h-screen bg-background-primary py-12 px-4">
    <div class="max-w-2xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-8">
        <router-link to="/" class="inline-flex items-center gap-2 mb-6">
          <img
            src="/logo-letra-blanca-sin-fondo-scaled-e1755635743469-2048x1210.png"
            alt="C-Team"
            class="h-10 w-auto"
          />
        </router-link>
        <h1 class="text-3xl font-bold text-white mb-2">Crear nuevo ticket</h1>
        <p class="text-gray-400">Completa el formulario y te responderemos lo antes posible</p>
      </div>

      <!-- Success state -->
      <div v-if="success" class="bg-background-secondary/50 backdrop-blur-sm rounded-xl border border-border p-8 text-center">
        <div class="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <h2 class="text-2xl font-semibold text-white mb-2">¡Ticket creado!</h2>
        <p class="text-gray-400 mb-4">
          Tu número de ticket es: <strong class="text-primary-500">{{ createdTicket?.ticketNumber }}</strong>
        </p>
        <p class="text-gray-400 mb-6">
          Hemos enviado un email a <strong class="text-white">{{ form.clientEmail }}</strong> con los detalles y un enlace para seguir tu ticket.
        </p>
        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <router-link
            :to="`/ticket/${createdAccessToken}`"
            class="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Ver mi ticket
          </router-link>
          <router-link
            to="/"
            class="px-6 py-3 border border-border text-gray-400 rounded-lg hover:bg-surface-hover transition-colors"
          >
            Volver al inicio
          </router-link>
        </div>
      </div>

      <!-- Form -->
      <form v-else @submit.prevent="submitTicket" class="bg-background-secondary/50 backdrop-blur-sm rounded-xl border border-border p-6 lg:p-8">
        <!-- Contact info -->
        <div class="mb-8">
          <h2 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <svg class="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
            Información de contacto
          </h2>

          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-1">Nombre *</label>
              <input
                v-model="form.firstName"
                type="text"
                required
                class="w-full px-4 py-2 bg-surface border border-border rounded-lg text-white focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                placeholder="Tu nombre"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-1">Apellido *</label>
              <input
                v-model="form.lastName"
                type="text"
                required
                class="w-full px-4 py-2 bg-surface border border-border rounded-lg text-white focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                placeholder="Tu apellido"
              />
            </div>
          </div>

          <div class="grid md:grid-cols-2 gap-4 mt-4">
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-1">Email *</label>
              <input
                v-model="form.clientEmail"
                type="email"
                required
                class="w-full px-4 py-2 bg-surface border border-border rounded-lg text-white focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                placeholder="tu@email.com"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-1">Empresa</label>
              <input
                v-model="form.clientCompany"
                type="text"
                class="w-full px-4 py-2 bg-surface border border-border rounded-lg text-white focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                placeholder="Nombre de tu empresa"
              />
            </div>
          </div>
        </div>

        <!-- Ticket info -->
        <div class="mb-8">
          <h2 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <svg class="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/>
            </svg>
            Detalle del ticket
          </h2>

          <div class="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-1">Categoría *</label>
              <select
                v-model="form.categoryId"
                required
                class="w-full px-4 py-2 bg-surface border border-border rounded-lg text-white focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
              >
                <option value="">Selecciona una categoría</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                  {{ cat.name }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-1">Prioridad</label>
              <select
                v-model="form.priority"
                class="w-full px-4 py-2 bg-surface border border-border rounded-lg text-white focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-400 mb-1">Asunto *</label>
            <input
              v-model="form.title"
              type="text"
              required
              class="w-full px-4 py-2 bg-surface border border-border rounded-lg text-white focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
              placeholder="Resumen breve del problema"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-400 mb-1">Descripción *</label>
            <textarea
              v-model="form.description"
              required
              rows="5"
              class="w-full px-4 py-2 bg-surface border border-border rounded-lg text-white focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
              placeholder="Describe tu problema o consulta con el mayor detalle posible..."
            />
          </div>
        </div>

        <!-- Error message -->
        <div v-if="error" class="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400">
          {{ error }}
        </div>

        <!-- Submit -->
        <div class="flex items-center justify-between pt-4 border-t border-border">
          <router-link to="/" class="text-gray-400 hover:text-white">
            &larr; Volver
          </router-link>
          <button
            type="submit"
            :disabled="loading"
            class="px-8 py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 disabled:opacity-50 transition-colors"
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
