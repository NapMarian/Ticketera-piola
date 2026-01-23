<template>
  <div class="min-h-screen bg-background-primary flex items-center justify-center py-12 px-4">
    <div class="max-w-md w-full">
      <!-- Logo -->
      <div class="text-center mb-8">
        <router-link to="/" class="inline-flex items-center gap-2">
          <img
            src="/logo-letra-blanca-sin-fondo-scaled-e1755635743469-2048x1210.png"
            alt="C-Team"
            class="h-10 w-auto"
          />
        </router-link>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="bg-background-secondary/50 backdrop-blur-sm rounded-xl border border-border p-8 text-center">
        <svg class="w-12 h-12 animate-spin text-primary-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
        </svg>
        <p class="text-gray-400">Procesando...</p>
      </div>

      <!-- Success -->
      <div v-else-if="submitted" class="bg-background-secondary/50 backdrop-blur-sm rounded-xl border border-border p-8 text-center">
        <div class="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-white mb-2">¡Gracias!</h1>
        <p class="text-gray-400 mb-6">
          Tu calificación nos ayuda a mejorar nuestro servicio.
        </p>
        <router-link
          :to="`/ticket/${token}`"
          class="text-primary-500 hover:text-primary-400"
        >
          Ver mi ticket
        </router-link>
      </div>

      <!-- Rating form -->
      <div v-else class="bg-background-secondary/50 backdrop-blur-sm rounded-xl border border-border p-8">
        <h1 class="text-2xl font-bold text-white mb-2 text-center">Califica tu experiencia</h1>
        <p class="text-gray-400 mb-6 text-center">
          ¿Cómo fue la atención que recibiste?
        </p>

        <!-- Stars -->
        <div class="flex justify-center gap-2 mb-6">
          <button
            v-for="i in 5"
            :key="i"
            @click="selectedRating = i"
            @mouseenter="hoverRating = i"
            @mouseleave="hoverRating = 0"
            class="text-4xl transition-colors"
            :class="i <= (hoverRating || selectedRating) ? 'text-yellow-400' : 'text-gray-600'"
          >
            ★
          </button>
        </div>

        <p class="text-center text-sm text-gray-500 mb-6">
          {{ ratingText }}
        </p>

        <!-- Comment -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-400 mb-1">
            Comentario (opcional)
          </label>
          <textarea
            v-model="comment"
            rows="3"
            class="w-full px-4 py-2 bg-surface border border-border rounded-lg text-white focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
            placeholder="Cuéntanos más sobre tu experiencia..."
          />
        </div>

        <!-- Error -->
        <div v-if="error" class="mb-4 p-3 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg text-sm">
          {{ error }}
        </div>

        <!-- Submit -->
        <button
          @click="submitRating"
          :disabled="!selectedRating"
          class="w-full py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 disabled:opacity-50 transition-colors"
        >
          Enviar calificación
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useTicketStore } from '@/stores/tickets'

const route = useRoute()
const ticketStore = useTicketStore()

const token = ref(route.params.token)
const initialRating = ref(parseInt(route.params.rating) || 0)

const selectedRating = ref(initialRating.value)
const hoverRating = ref(0)
const comment = ref('')
const loading = ref(false)
const submitted = ref(false)
const error = ref('')

const ratingTexts = ['', 'Muy malo', 'Malo', 'Regular', 'Bueno', 'Excelente']

const ratingText = computed(() => {
  const rating = hoverRating.value || selectedRating.value
  return ratingTexts[rating] || 'Selecciona una calificación'
})

async function submitRating() {
  if (!selectedRating.value) return

  loading.value = true
  error.value = ''

  const result = await ticketStore.rateTicket(
    token.value,
    selectedRating.value,
    comment.value || null
  )

  if (result.success) {
    submitted.value = true
  } else {
    error.value = result.error
  }

  loading.value = false
}

onMounted(() => {
  // Auto-submit if rating came from email link
  if (initialRating.value >= 1 && initialRating.value <= 5) {
    // Give user chance to add comment, don't auto-submit
  }
})
</script>
