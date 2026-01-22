<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 via-primary-900 to-gray-900 text-white p-8">
    <!-- Header -->
    <div class="text-center mb-12">
      <div class="flex items-center justify-center gap-4 mb-4">
        <svg class="w-16 h-16 text-primary-400" viewBox="0 0 100 100" fill="currentColor">
          <rect width="100" height="100" rx="20" fill="currentColor"/>
          <path d="M25 35h50v5H25zM25 45h50v5H25zM25 55h30v5H25zM65 50l15 15-15 15" stroke="white" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <h1 class="text-5xl font-bold bg-gradient-to-r from-primary-400 to-blue-400 bg-clip-text text-transparent">
          C-Team Ranking
        </h1>
      </div>
      <p class="text-gray-400 text-xl">Ranking de agentes en tiempo real</p>
      <p class="text-gray-500 text-sm mt-2">Actualizado: {{ lastUpdate }}</p>
    </div>

    <!-- Podium for top 3 -->
    <div class="flex justify-center items-end gap-4 mb-12" v-if="ranking.length > 0">
      <!-- Second place -->
      <div v-if="ranking[1]" class="text-center transform hover:scale-105 transition-transform">
        <div class="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-4xl font-bold shadow-lg shadow-gray-500/30">
          {{ getInitials(ranking[1]?.name) }}
        </div>
        <div class="bg-gray-800/50 rounded-xl p-4 backdrop-blur border border-gray-700">
          <p class="text-3xl mb-2">🥈</p>
          <p class="font-semibold text-lg">{{ ranking[1]?.name }}</p>
          <p class="text-gray-400">{{ ranking[1]?.resolvedCount }} tickets</p>
          <div v-if="ranking[1]?.avgSatisfaction" class="mt-2 text-yellow-400">
            ★ {{ ranking[1]?.avgSatisfaction }}
          </div>
        </div>
      </div>

      <!-- First place -->
      <div v-if="ranking[0]" class="text-center transform hover:scale-105 transition-transform -mt-8">
        <div class="w-40 h-40 mx-auto mb-4 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-5xl font-bold shadow-lg shadow-yellow-500/30 ring-4 ring-yellow-400/50">
          {{ getInitials(ranking[0]?.name) }}
        </div>
        <div class="bg-yellow-500/10 rounded-xl p-6 backdrop-blur border border-yellow-500/30">
          <p class="text-5xl mb-2">🥇</p>
          <p class="font-bold text-2xl">{{ ranking[0]?.name }}</p>
          <p class="text-yellow-300 text-lg">{{ ranking[0]?.resolvedCount }} tickets</p>
          <div v-if="ranking[0]?.avgSatisfaction" class="mt-2 text-yellow-400 text-xl">
            ★ {{ ranking[0]?.avgSatisfaction }}
          </div>
          <div v-if="ranking[0]?.slaCompliance" class="mt-1 text-green-400 text-sm">
            {{ ranking[0]?.slaCompliance }}% SLA
          </div>
        </div>
      </div>

      <!-- Third place -->
      <div v-if="ranking[2]" class="text-center transform hover:scale-105 transition-transform">
        <div class="w-28 h-28 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-600 to-orange-700 flex items-center justify-center text-3xl font-bold shadow-lg shadow-orange-500/30">
          {{ getInitials(ranking[2]?.name) }}
        </div>
        <div class="bg-gray-800/50 rounded-xl p-4 backdrop-blur border border-gray-700">
          <p class="text-3xl mb-2">🥉</p>
          <p class="font-semibold text-lg">{{ ranking[2]?.name }}</p>
          <p class="text-gray-400">{{ ranking[2]?.resolvedCount }} tickets</p>
          <div v-if="ranking[2]?.avgSatisfaction" class="mt-2 text-yellow-400">
            ★ {{ ranking[2]?.avgSatisfaction }}
          </div>
        </div>
      </div>
    </div>

    <!-- Rest of ranking -->
    <div class="max-w-4xl mx-auto" v-if="ranking.length > 3">
      <div class="bg-gray-800/30 rounded-2xl backdrop-blur border border-gray-700 overflow-hidden">
        <div
          v-for="agent in ranking.slice(3)"
          :key="agent.id"
          class="flex items-center gap-6 p-6 border-b border-gray-700/50 last:border-0 hover:bg-gray-700/30 transition-colors"
        >
          <div class="text-3xl font-bold text-gray-500 w-12 text-center">
            {{ agent.rank }}
          </div>
          <div class="w-16 h-16 rounded-full bg-primary-600/30 flex items-center justify-center text-xl font-bold text-primary-300">
            {{ getInitials(agent.name) }}
          </div>
          <div class="flex-1">
            <p class="font-semibold text-xl">{{ agent.name }}</p>
            <p class="text-gray-400">{{ agent.resolvedCount }} tickets resueltos</p>
          </div>
          <div class="text-right">
            <div v-if="agent.avgSatisfaction" class="text-yellow-400 text-lg">
              ★ {{ agent.avgSatisfaction }}
            </div>
            <div v-if="agent.slaCompliance" class="text-sm text-gray-400">
              {{ agent.slaCompliance }}% SLA
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="ranking.length === 0 && !loading" class="text-center text-gray-500 py-24">
      <p class="text-2xl">Sin datos de ranking todavia</p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-24">
      <svg class="w-16 h-16 animate-spin text-primary-500" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
      </svg>
    </div>

    <!-- Footer -->
    <div class="fixed bottom-4 left-0 right-0 text-center text-gray-600 text-sm">
      Actualizado automaticamente cada 30 segundos
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import api from '@/services/api'

const ranking = ref([])
const loading = ref(true)
const lastUpdate = ref('')
let refreshInterval = null

function getInitials(name) {
  return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'
}

function formatTime() {
  return new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
}

async function loadRanking() {
  try {
    const { data } = await api.get('/tickets/public/ranking')
    ranking.value = data.ranking
    lastUpdate.value = formatTime()
  } catch (err) {
    console.error('Error loading ranking:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadRanking()
  // Auto refresh every 30 seconds
  refreshInterval = setInterval(loadRanking, 30000)
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
</script>
