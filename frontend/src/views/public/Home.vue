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
        <div class="flex items-center gap-3">
          <LanguageSelector />
          <router-link
            to="/login"
            class="px-5 py-2.5 bg-surface hover:bg-surface-hover text-white border border-border rounded-lg transition-colors font-medium"
          >
            {{ t('home.login') }}
          </router-link>
        </div>
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
          {{ t('home.supportCenter') }} <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400">{{ t('home.support') }}</span>
        </h1>
        <p class="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
          {{ t('home.heroText') }}
        </p>

        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <router-link
            to="/new-ticket"
            class="group px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl hover:from-primary-400 hover:to-primary-500 transition-all shadow-lg shadow-primary-500/25 flex items-center justify-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            {{ t('home.newTicket') }}
          </router-link>
          <button
            @click="openModal"
            class="px-8 py-4 bg-surface hover:bg-surface-hover text-white font-semibold rounded-xl border border-border transition-colors flex items-center justify-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            {{ t('home.trackMyTicket') }}
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
          <h3 class="text-lg font-semibold text-white mb-2">{{ t('home.fastResponse') }}</h3>
          <p class="text-gray-400 text-sm">{{ t('home.fastResponseDesc') }}</p>
        </div>

        <div class="bg-background-secondary/50 backdrop-blur-sm rounded-xl border border-border p-6 text-center hover:border-accent-500/50 transition-colors">
          <div class="w-14 h-14 bg-accent-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg class="w-7 h-7 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-white mb-2">{{ t('home.liveChat') }}</h3>
          <p class="text-gray-400 text-sm">{{ t('home.liveChatDesc') }}</p>
        </div>

        <div class="bg-background-secondary/50 backdrop-blur-sm rounded-xl border border-border p-6 text-center hover:border-green-500/50 transition-colors">
          <div class="w-14 h-14 bg-green-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg class="w-7 h-7 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-white mb-2">{{ t('home.easyTracking') }}</h3>
          <p class="text-gray-400 text-sm">{{ t('home.easyTrackingDesc') }}</p>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="container mx-auto px-4 py-8 text-center">
      <p class="text-gray-600 text-sm">&copy; {{ new Date().getFullYear() }} C-Team Global. {{ t('home.copyright') }}</p>
    </footer>

    <!-- Track ticket modal -->
    <div
      v-if="showTrackModal"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      @click.self="closeModal"
    >
      <div class="bg-background-tertiary rounded-xl border border-border shadow-2xl max-w-md w-full p-6">
        <h2 class="text-xl font-semibold text-white mb-2">{{ t('home.trackModalTitle') }}</h2>
        <p class="text-gray-400 mb-4">
          {{ t('home.trackModalDesc') }}
        </p>

        <div class="mb-4">
          <label class="block text-sm text-gray-400 mb-2">{{ t('home.ticketNumberLabel') }}</label>
          <input
            ref="trackInputRef"
            v-model="trackInput"
            type="text"
            :placeholder="t('home.ticketNumberPlaceholder')"
            class="w-full px-4 py-3 bg-surface border border-border rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500/50 focus:border-transparent text-lg tracking-wide"
            @keyup.enter="trackTicket"
          />
          <p class="text-xs text-gray-500 mt-2">
            {{ t('home.ticketNumberHint') }}
          </p>
        </div>

        <div class="flex gap-3">
          <button
            @click="closeModal"
            class="flex-1 px-4 py-3 border border-border text-gray-400 rounded-lg hover:bg-surface-hover transition-colors"
          >
            {{ t('common.cancel') }}
          </button>
          <button
            @click="trackTicket"
            :disabled="!trackInput.trim() || searching"
            class="flex-1 px-4 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <svg v-if="searching" class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ searching ? t('public.searching') : t('home.viewMyTicket') }}
          </button>
        </div>

        <p v-if="trackError" class="mt-3 text-red-400 text-sm text-center">{{ trackError }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useTicketStore } from '@/stores/tickets'
import LanguageSelector from '@/components/LanguageSelector.vue'

const { t } = useI18n({ useScope: 'global' })
const router = useRouter()
const ticketStore = useTicketStore()

const showTrackModal = ref(false)
const trackInput = ref('')
const trackError = ref('')
const searching = ref(false)
const trackInputRef = ref(null)

function closeModal() {
  showTrackModal.value = false
  trackInput.value = ''
  trackError.value = ''
}

async function trackTicket() {
  if (!trackInput.value.trim() || searching.value) return

  trackError.value = ''
  searching.value = true

  let ticketNumber = trackInput.value.trim().toUpperCase()

  // Extract ticket number from URL if full URL provided
  if (ticketNumber.includes('/TICKET/')) {
    const match = ticketNumber.match(/\/TICKET\/(CT-\d{4}-\d+)/i)
    if (match) {
      ticketNumber = match[1]
    }
  }

  // If user entered just the number without CT- prefix, add it
  if (ticketNumber.match(/^\d{4}-\d+$/)) {
    ticketNumber = `CT-${ticketNumber}`
  }

  // Validate ticket number format
  if (!ticketNumber.match(/^CT-\d{4}-\d+$/)) {
    trackError.value = t('home.invalidFormat')
    searching.value = false
    return
  }

  // Verify ticket exists
  const result = await ticketStore.fetchTicketByTicketNumber(ticketNumber)

  if (result.success) {
    closeModal()
    router.push(`/ticket/${ticketNumber}`)
  } else {
    trackError.value = t('home.ticketNotFoundError')
  }

  searching.value = false
}

// Auto-focus input when modal opens
function openModal() {
  showTrackModal.value = true
  nextTick(() => {
    trackInputRef.value?.focus()
  })
}
</script>
