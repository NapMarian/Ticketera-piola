<template>
  <StaffLayout page-title="Ranking">
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <p class="text-gray-400 text-sm">Ranking de agentes en tiempo real</p>
          <p class="text-gray-500 text-xs mt-1">Actualizado: {{ lastUpdate }}</p>
        </div>
        <button
          @click="loadRanking"
          class="px-4 py-2 bg-surface hover:bg-surface-hover text-gray-300 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <svg class="w-4 h-4" :class="{ 'animate-spin': loading }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
          Actualizar
        </button>
      </div>

      <!-- Podium for top 3 -->
      <div class="flex justify-center items-end gap-4 py-8" v-if="ranking.length > 0">
        <!-- Second place -->
        <div v-if="ranking[1]" class="text-center transform hover:scale-105 transition-transform">
          <div class="w-24 h-24 mx-auto mb-3 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-3xl font-bold shadow-lg shadow-gray-500/20">
            {{ getInitials(ranking[1]?.name) }}
          </div>
          <div class="bg-background-tertiary rounded-xl p-4 border border-border min-w-[140px]">
            <p class="text-2xl mb-2">2</p>
            <p class="font-semibold text-white">{{ ranking[1]?.name }}</p>
            <p class="text-gray-400 text-sm">{{ ranking[1]?.resolvedCount }} tickets</p>
            <div v-if="ranking[1]?.avgSatisfaction" class="mt-2 text-primary-400 text-sm">
              {{ ranking[1]?.avgSatisfaction }}
            </div>
          </div>
        </div>

        <!-- First place -->
        <div v-if="ranking[0]" class="text-center transform hover:scale-105 transition-transform -mt-4">
          <div class="w-32 h-32 mx-auto mb-3 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-4xl font-bold shadow-lg shadow-primary-500/30 ring-4 ring-primary-400/30">
            {{ getInitials(ranking[0]?.name) }}
          </div>
          <div class="bg-primary-500/10 rounded-xl p-5 border border-primary-500/30 min-w-[160px]">
            <p class="text-4xl mb-2">1</p>
            <p class="font-bold text-xl text-white">{{ ranking[0]?.name }}</p>
            <p class="text-primary-300">{{ ranking[0]?.resolvedCount }} tickets</p>
            <div v-if="ranking[0]?.avgSatisfaction" class="mt-2 text-primary-400">
              {{ ranking[0]?.avgSatisfaction }}
            </div>
            <div v-if="ranking[0]?.slaCompliance" class="mt-1 text-success text-sm">
              {{ ranking[0]?.slaCompliance }}% SLA
            </div>
          </div>
        </div>

        <!-- Third place -->
        <div v-if="ranking[2]" class="text-center transform hover:scale-105 transition-transform">
          <div class="w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-br from-cteam-orange to-orange-600 flex items-center justify-center text-2xl font-bold shadow-lg shadow-orange-500/20">
            {{ getInitials(ranking[2]?.name) }}
          </div>
          <div class="bg-background-tertiary rounded-xl p-4 border border-border min-w-[130px]">
            <p class="text-2xl mb-2">3</p>
            <p class="font-semibold text-white">{{ ranking[2]?.name }}</p>
            <p class="text-gray-400 text-sm">{{ ranking[2]?.resolvedCount }} tickets</p>
            <div v-if="ranking[2]?.avgSatisfaction" class="mt-2 text-primary-400 text-sm">
              {{ ranking[2]?.avgSatisfaction }}
            </div>
          </div>
        </div>
      </div>

      <!-- Rest of ranking -->
      <div v-if="ranking.length > 3" class="bg-background-secondary rounded-xl border border-border overflow-hidden">
        <div
          v-for="agent in ranking.slice(3)"
          :key="agent.id"
          class="flex items-center gap-4 p-4 border-b border-border last:border-0 hover:bg-surface-hover transition-colors"
        >
          <div class="text-xl font-bold text-gray-500 w-10 text-center">
            {{ agent.rank }}
          </div>
          <div class="w-12 h-12 rounded-full bg-surface flex items-center justify-center text-sm font-bold text-gray-300">
            {{ getInitials(agent.name) }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-medium text-white truncate">{{ agent.name }}</p>
            <p class="text-gray-500 text-sm">{{ agent.resolvedCount }} tickets resueltos</p>
          </div>
          <div class="text-right">
            <div v-if="agent.avgSatisfaction" class="text-primary-400 text-sm">
              {{ agent.avgSatisfaction }}
            </div>
            <div v-if="agent.slaCompliance" class="text-xs text-gray-500">
              {{ agent.slaCompliance }}% SLA
            </div>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="ranking.length === 0 && !loading" class="text-center py-16">
        <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-surface flex items-center justify-center">
          <svg class="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
          </svg>
        </div>
        <p class="text-gray-400">Sin datos de ranking todavia</p>
        <p class="text-gray-500 text-sm mt-1">Los datos apareceran cuando se resuelvan tickets</p>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex items-center justify-center py-16">
        <svg class="w-10 h-10 animate-spin text-primary-500" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
        </svg>
      </div>

      <!-- Info footer -->
      <p class="text-center text-gray-600 text-xs">
        Se actualiza automaticamente cada 30 segundos
      </p>
    </div>
  </StaffLayout>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import api from '@/services/api'
import StaffLayout from '@/components/layouts/StaffLayout.vue'

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
    loading.value = true
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
  refreshInterval = setInterval(loadRanking, 30000)
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
</script>
