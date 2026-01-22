<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center py-12 px-4">
    <div class="max-w-md w-full">
      <!-- Logo -->
      <div class="text-center mb-8">
        <router-link to="/" class="inline-flex items-center gap-2">
          <svg class="w-12 h-12 text-white" viewBox="0 0 100 100" fill="currentColor">
            <rect width="100" height="100" rx="20" fill="currentColor"/>
            <path d="M25 35h50v5H25zM25 45h50v5H25zM25 55h30v5H25zM65 50l15 15-15 15" stroke="#6366f1" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span class="text-3xl font-bold text-white">C-Team</span>
        </router-link>
        <p class="mt-2 text-white/70">Panel de administración</p>
      </div>

      <!-- Login form -->
      <div class="bg-white rounded-xl shadow-xl p-8">
        <h1 class="text-2xl font-bold text-gray-800 mb-6 text-center">Iniciar sesión</h1>

        <form @submit.prevent="handleLogin">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              v-model="email"
              type="email"
              required
              autofocus
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="tu@cteamglobal.com"
            />
          </div>

          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input
              v-model="password"
              type="password"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          <!-- Error -->
          <div v-if="error" class="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {{ error }}
          </div>

          <button
            type="submit"
            :disabled="authStore.loading"
            class="w-full py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            <span v-if="authStore.loading" class="flex items-center justify-center gap-2">
              <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              Iniciando sesión...
            </span>
            <span v-else>Ingresar</span>
          </button>
        </form>

        <div class="mt-6 text-center">
          <router-link to="/" class="text-gray-500 hover:text-gray-700 text-sm">
            &larr; Volver al inicio
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const error = ref('')

async function handleLogin() {
  error.value = ''

  const result = await authStore.login(email.value, password.value)

  if (result.success) {
    const redirect = route.query.redirect || '/dashboard'
    router.push(redirect)
  } else {
    error.value = result.error
  }
}
</script>
