<template>
  <div class="min-h-screen bg-background-primary">
    <!-- Header -->
    <header class="container mx-auto px-4 py-6">
      <nav class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <img
            src="/logo-letra-blanca-sin-fondo-scaled-e1755635743469-2048x1210.png"
            alt="C-Team"
            class="h-12 w-auto"
          />
        </div>
        <router-link
          to="/login"
          class="px-5 py-2.5 bg-surface hover:bg-surface-hover text-white border border-border rounded-lg transition-colors font-medium"
        >
          Iniciar Sesión
        </router-link>
      </nav>
    </header>

    <!-- Hero -->
    <main class="container mx-auto px-4 py-16 lg:py-24">
      <div class="max-w-4xl mx-auto text-center">
        <!-- Big Logo -->
        <div class="mb-8">
          <img
            src="/logo-letra-blanca-sin-fondo-scaled-e1755635743469-2048x1210.png"
            alt="C-Team Global"
            class="h-24 lg:h-32 w-auto mx-auto"
          />
        </div>

        <h1 class="text-4xl lg:text-6xl font-bold text-white mb-6">
          Centro de <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400">Soporte</span>
        </h1>
        <p class="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
          Estamos aquí para ayudarte. Crea un ticket y nuestro equipo te responderá lo antes posible.
        </p>

        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <router-link
            to="/new-ticket"
            class="group px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl hover:from-primary-400 hover:to-primary-500 transition-all shadow-lg shadow-primary-500/25 flex items-center justify-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Crear nuevo ticket
          </router-link>
          <button
            @click="showTrackModal = true"
            class="px-8 py-4 bg-surface hover:bg-surface-hover text-white font-semibold rounded-xl border border-border transition-colors flex items-center justify-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            Seguir mi ticket
          </button>
        </div>
      </div>

      <!-- Features -->
      <div class="mt-24 grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        <div class="bg-background-secondary/50 backdrop-blur-sm rounded-xl border border-border p-6 text-center hover:border-primary-500/50 transition-colors">
          <div class="w-14 h-14 bg-primary-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg class="w-7 h-7 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-white mb-2">Respuesta Rápida</h3>
          <p class="text-gray-400 text-sm">Nuestro equipo responde según acuerdos de SLA garantizados.</p>
        </div>

        <div class="bg-background-secondary/50 backdrop-blur-sm rounded-xl border border-border p-6 text-center hover:border-accent-500/50 transition-colors">
          <div class="w-14 h-14 bg-accent-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg class="w-7 h-7 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-white mb-2">Chat en Vivo</h3>
          <p class="text-gray-400 text-sm">Comunícate directamente con el agente asignado a tu caso.</p>
        </div>

        <div class="bg-background-secondary/50 backdrop-blur-sm rounded-xl border border-border p-6 text-center hover:border-green-500/50 transition-colors">
          <div class="w-14 h-14 bg-green-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg class="w-7 h-7 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-white mb-2">Seguimiento Fácil</h3>
          <p class="text-gray-400 text-sm">Sigue el estado de tu ticket con un simple enlace, sin cuenta.</p>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="container mx-auto px-4 py-8 text-center">
      <p class="text-gray-600 text-sm">&copy; {{ new Date().getFullYear() }} C-Team Global. Todos los derechos reservados.</p>
    </footer>

    <!-- Track ticket modal -->
    <div
      v-if="showTrackModal"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      @click.self="showTrackModal = false"
    >
      <div class="bg-background-tertiary rounded-xl border border-border shadow-2xl max-w-md w-full p-6">
        <h2 class="text-xl font-semibold text-white mb-4">Seguir mi ticket</h2>
        <p class="text-gray-400 mb-4">
          Ingresa el enlace que recibiste por email para ver tu ticket.
        </p>
        <input
          v-model="trackInput"
          type="text"
          placeholder="Pega el enlace de tu ticket aquí..."
          class="w-full px-4 py-3 bg-surface border border-border rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500/50 focus:border-transparent mb-4"
          @keyup.enter="trackTicket"
        />
        <div class="flex gap-3">
          <button
            @click="showTrackModal = false"
            class="flex-1 px-4 py-3 border border-border text-gray-400 rounded-lg hover:bg-surface-hover transition-colors"
          >
            Cancelar
          </button>
          <button
            @click="trackTicket"
            :disabled="!trackInput.trim()"
            class="flex-1 px-4 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 transition-colors font-medium"
          >
            Buscar
          </button>
        </div>
        <p v-if="trackError" class="mt-3 text-red-400 text-sm">{{ trackError }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const showTrackModal = ref(false)
const trackInput = ref('')
const trackError = ref('')

function trackTicket() {
  if (!trackInput.value.trim()) return

  trackError.value = ''
  let token = trackInput.value.trim()

  // Extract token from URL if full URL provided
  if (token.includes('/ticket/')) {
    const match = token.match(/\/ticket\/([a-f0-9-]+)/i)
    if (match) {
      token = match[1]
    }
  }

  // If it looks like a ticket number, we'd need to search - for now just try as token
  if (token.match(/^CT-\d{4}-\d+$/i)) {
    trackError.value = 'Por favor, usa el enlace completo que recibiste por email'
    return
  }

  router.push(`/ticket/${token}`)
}
</script>
