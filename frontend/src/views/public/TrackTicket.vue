<template>
  <div class="min-h-screen bg-background-primary">
    <!-- Header -->
    <header class="bg-background-secondary/50 backdrop-blur-sm border-b border-border">
      <div class="container mx-auto px-4 py-4">
        <router-link to="/" class="flex items-center gap-2 w-fit">
          <img
            src="/logo-letra-blanca-sin-fondo-scaled-e1755635743469-2048x1210.png"
            alt="C-Team"
            class="h-8 w-auto"
          />
        </router-link>
      </div>
    </header>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-24">
      <div class="text-center">
        <svg class="w-12 h-12 animate-spin text-primary-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
        </svg>
        <p class="text-gray-400">Cargando ticket...</p>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="container mx-auto px-4 py-24">
      <div class="max-w-md mx-auto text-center">
        <div class="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-white mb-2">Ticket no encontrado</h1>
        <p class="text-gray-400 mb-6">El enlace que utilizaste no es válido o ha expirado.</p>
        <router-link to="/" class="text-primary-500 hover:text-primary-400">
          &larr; Volver al inicio
        </router-link>
      </div>
    </div>

    <!-- Ticket content -->
    <main v-else-if="ticket" class="container mx-auto px-4 py-8">
      <div class="max-w-6xl mx-auto">
        <!-- Ticket header -->
        <div class="bg-background-secondary/50 backdrop-blur-sm rounded-xl border border-border p-6 mb-6">
          <div class="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div>
              <div class="flex items-center gap-3 mb-2">
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

            <!-- SLA Status -->
            <div
              v-if="ticket.slaStatus"
              class="px-4 py-2 rounded-lg text-sm font-medium"
              :style="{ backgroundColor: ticket.slaStatus.color + '20', color: ticket.slaStatus.color }"
            >
              {{ ticket.slaStatus.label }}
            </div>
          </div>

          <div class="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <p class="text-gray-500">Creado por</p>
              <p class="font-medium text-white">{{ ticket.clientName }}</p>
            </div>
            <div>
              <p class="text-gray-500">Agente asignado</p>
              <p class="font-medium text-white">
                {{ ticket.agent?.name || 'Sin asignar' }}
              </p>
            </div>
            <div>
              <p class="text-gray-500">Fecha de creación</p>
              <p class="font-medium text-white">{{ formatDateTime(ticket.createdAt) }}</p>
            </div>
          </div>
        </div>

        <!-- Content grid -->
        <div class="grid lg:grid-cols-3 gap-6">
          <!-- Description & History -->
          <div class="lg:col-span-1 space-y-6">
            <!-- Description -->
            <div class="bg-background-secondary/50 backdrop-blur-sm rounded-xl border border-border p-6">
              <h2 class="font-semibold text-white mb-3">Descripción</h2>
              <p class="text-gray-400 whitespace-pre-wrap">{{ ticket.description }}</p>
            </div>

            <!-- History -->
            <div class="bg-background-secondary/50 backdrop-blur-sm rounded-xl border border-border p-6">
              <h2 class="font-semibold text-white mb-3">Historial</h2>
              <div class="space-y-3">
                <div
                  v-for="entry in ticket.history"
                  :key="entry.id"
                  class="flex gap-3 text-sm"
                >
                  <div class="w-2 h-2 bg-primary-400 rounded-full mt-1.5 flex-shrink-0" />
                  <div>
                    <p class="text-gray-300">{{ getHistoryText(entry) }}</p>
                    <p class="text-gray-500 text-xs">{{ formatDateTime(entry.createdAt) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Chat -->
          <div class="lg:col-span-2 h-[600px]">
            <TicketChat
              :ticket-id="ticket.id"
              :access-token="token"
              :client-name="ticket.clientName"
            />
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useTicketStore } from '@/stores/tickets'
import { useHelpers } from '@/composables/useHelpers'
import TicketChat from '@/components/TicketChat.vue'

const route = useRoute()
const ticketStore = useTicketStore()
const { getStatusLabel, getPriorityLabel, getStatusClass, getPriorityClass, formatDateTime } = useHelpers()

const token = ref(route.params.token)
const ticket = ref(null)
const loading = ref(true)
const error = ref(false)

function getHistoryText(entry) {
  const texts = {
    created: 'Ticket creado',
    status_changed: `Estado cambiado de ${getStatusLabel(entry.oldValue)} a ${getStatusLabel(entry.newValue)}`,
    priority_changed: `Prioridad cambiada de ${getPriorityLabel(entry.oldValue)} a ${getPriorityLabel(entry.newValue)}`,
    assigned: `Asignado a ${entry.newValue}`,
    transferred: `Transferido a otro agente`,
    resolved: 'Ticket resuelto',
    closed: 'Ticket cerrado',
    reopened: 'Ticket reabierto'
  }
  return texts[entry.action] || entry.action
}

onMounted(async () => {
  const result = await ticketStore.fetchTicketByToken(token.value)

  if (result.success) {
    ticket.value = result.ticket
  } else {
    error.value = true
  }

  loading.value = false
})
</script>
