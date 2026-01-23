<template>
  <div class="min-h-screen bg-background-primary flex items-center justify-center py-12 px-4">
    <div class="max-w-md w-full">
      <!-- Logo -->
      <div class="text-center mb-8">
        <router-link to="/" class="inline-block">
          <img
            src="/logo-letra-blanca-sin-fondo-scaled-e1755635743469-2048x1210.png"
            alt="C-Team"
            class="h-12 w-auto mx-auto"
          />
        </router-link>
        <p class="mt-3 text-gray-500">Panel de administracion</p>
      </div>

      <!-- Login form -->
      <div class="bg-background-secondary rounded-xl border border-border p-8">
        <h1 class="text-xl font-semibold text-white mb-6 text-center">Iniciar sesion</h1>

        <form @submit.prevent="handleLogin">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-400 mb-2">Email</label>
            <input
              v-model="email"
              type="email"
              required
              autofocus
              class="w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-colors"
              placeholder="tu@cteamglobal.com"
            />
          </div>

          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-400 mb-2">Contrasena</label>
            <input
              v-model="password"
              type="password"
              required
              class="w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <!-- Error -->
          <div v-if="error" class="mb-4 p-3 bg-error-bg border border-error/30 text-error-light rounded-lg text-sm">
            {{ error }}
          </div>

          <button
            type="submit"
            :disabled="authStore.loading"
            class="w-full py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 disabled:opacity-50 transition-colors"
          >
            <span v-if="authStore.loading" class="flex items-center justify-center gap-2">
              <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              Iniciando sesion...
            </span>
            <span v-else>Ingresar</span>
          </button>
        </form>

        <div class="mt-6 text-center">
          <router-link to="/" class="text-gray-500 hover:text-gray-400 text-sm transition-colors">
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
