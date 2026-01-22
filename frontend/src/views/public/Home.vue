<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-600 to-primary-800">
    <!-- Header -->
    <header class="container mx-auto px-4 py-6">
      <nav class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <svg class="w-10 h-10 text-white" viewBox="0 0 100 100" fill="currentColor">
            <rect width="100" height="100" rx="20" fill="currentColor"/>
            <path d="M25 35h50v5H25zM25 45h50v5H25zM25 55h30v5H25zM65 50l15 15-15 15" stroke="#0693e3" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span class="text-white font-bold text-2xl">C-Team Ticketera</span>
        </div>
        <router-link
          to="/login"
          class="px-4 py-2 text-white border border-white/30 rounded-lg hover:bg-white/10 transition-colors"
        >
          Iniciar Sesión
        </router-link>
      </nav>
    </header>

    <!-- Hero -->
    <main class="container mx-auto px-4 py-16 lg:py-24">
      <div class="max-w-3xl mx-auto text-center">
        <h1 class="text-4xl lg:text-6xl font-bold text-white mb-6">
          ¿Necesitas ayuda?
        </h1>
        <p class="text-xl text-white/80 mb-8">
          Estamos aquí para asistirte. Crea un ticket y nuestro equipo te responderá lo antes posible.
        </p>

        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <router-link
            to="/new-ticket"
            class="px-8 py-4 bg-white text-primary-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
          >
            Crear nuevo ticket
          </router-link>
          <button
            @click="showTrackModal = true"
            class="px-8 py-4 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-400 transition-colors"
          >
            Seguir mi ticket
          </button>
        </div>
      </div>

      <!-- Features -->
      <div class="mt-24 grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        <div class="bg-white/10 backdrop-blur rounded-xl p-6 text-center">
          <div class="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-white mb-2">Respuesta Rápida</h3>
          <p class="text-white/70">Nuestro equipo responde según acuerdos de SLA garantizados.</p>
        </div>

        <div class="bg-white/10 backdrop-blur rounded-xl p-6 text-center">
          <div class="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-white mb-2">Chat en Vivo</h3>
          <p class="text-white/70">Comunícate directamente con el agente asignado a tu caso.</p>
        </div>

        <div class="bg-white/10 backdrop-blur rounded-xl p-6 text-center">
          <div class="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-white mb-2">Seguimiento Fácil</h3>
          <p class="text-white/70">Sigue el estado de tu ticket con un simple enlace, sin necesidad de cuenta.</p>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="container mx-auto px-4 py-8 text-center text-white/60">
      <p>&copy; {{ new Date().getFullYear() }} C-Team Global. Todos los derechos reservados.</p>
    </footer>

    <!-- Track ticket modal -->
    <div
      v-if="showTrackModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click.self="showTrackModal = false"
    >
      <div class="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">Seguir mi ticket</h2>
        <p class="text-gray-600 mb-4">
          Ingresa el número de ticket o el enlace que recibiste por email.
        </p>
        <input
          v-model="trackInput"
          type="text"
          placeholder="CT-2024-00001 o enlace completo"
          class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent mb-4"
          @keyup.enter="trackTicket"
        />
        <div class="flex gap-3">
          <button
            @click="showTrackModal = false"
            class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            @click="trackTicket"
            :disabled="!trackInput.trim()"
            class="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            Buscar
          </button>
        </div>
        <p v-if="trackError" class="mt-3 text-red-500 text-sm">{{ trackError }}</p>
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
