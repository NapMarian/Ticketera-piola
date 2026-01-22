<template>
  <StaffLayout page-title="Dashboard">
    <!-- Stats cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Tickets Abiertos</p>
            <p class="text-3xl font-bold text-gray-800 dark:text-white">{{ stats?.summary?.open || 0 }}</p>
          </div>
          <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/>
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Resueltos este mes</p>
            <p class="text-3xl font-bold text-gray-800 dark:text-white">{{ stats?.summary?.resolved || 0 }}</p>
          </div>
          <div class="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Cumplimiento SLA</p>
            <p class="text-3xl font-bold" :class="getSLAColor(stats?.sla?.compliance)">
              {{ stats?.sla?.compliance || 100 }}%
            </p>
          </div>
          <div class="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500 dark:text-gray-400">Tiempo Resp. Prom.</p>
            <p class="text-3xl font-bold text-gray-800 dark:text-white">
              {{ formatResponseTime(stats?.avgResponseTimeMinutes) }}
            </p>
          </div>
          <div class="w-12 h-12 bg-orange-100 dark:bg-orange-900/50 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts row -->
    <div class="grid lg:grid-cols-2 gap-6 mb-8">
      <!-- By Status -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <h2 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">Tickets por Estado</h2>
        <div class="h-64">
          <Doughnut v-if="statusChartData" :data="statusChartData" :options="chartOptions" />
        </div>
      </div>

      <!-- By Category -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <h2 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">Tickets por Categoría</h2>
        <div class="h-64">
          <Bar v-if="categoryChartData" :data="categoryChartData" :options="barChartOptions" />
        </div>
      </div>
    </div>

    <!-- Trend and Ranking -->
    <div class="grid lg:grid-cols-3 gap-6">
      <!-- Trend -->
      <div class="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <h2 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">Tendencia (últimos 30 días)</h2>
        <div class="h-64">
          <Line v-if="trendChartData" :data="trendChartData" :options="lineChartOptions" />
        </div>
      </div>

      <!-- Agent Ranking -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <h2 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">Ranking de Agentes</h2>
        <div class="space-y-4">
          <div
            v-for="agent in ranking"
            :key="agent.id"
            class="flex items-center gap-3"
          >
            <div class="w-8 h-8 flex items-center justify-center">
              <span
                v-if="agent.rank <= 3"
                class="text-xl"
              >
                {{ agent.rank === 1 ? '🥇' : agent.rank === 2 ? '🥈' : '🥉' }}
              </span>
              <span v-else class="text-gray-400 font-medium">{{ agent.rank }}</span>
            </div>
            <div class="w-10 h-10 bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center font-medium">
              {{ getInitials(agent.name) }}
            </div>
            <div class="flex-1">
              <p class="font-medium text-gray-800 dark:text-white">{{ agent.name }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">{{ agent.resolvedCount }} resueltos</p>
            </div>
            <div v-if="agent.avgSatisfaction" class="text-sm dark:text-gray-300">
              <span class="text-yellow-500">★</span>
              {{ agent.avgSatisfaction }}
            </div>
          </div>

          <div v-if="ranking.length === 0" class="text-center text-gray-500 dark:text-gray-400 py-4">
            Sin datos de ranking
          </div>
        </div>
      </div>
    </div>
  </StaffLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Doughnut, Bar, Line } from 'vue-chartjs'
import StaffLayout from '@/components/layouts/StaffLayout.vue'
import { useTicketStore } from '@/stores/tickets'
import { useHelpers } from '@/composables/useHelpers'

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const ticketStore = useTicketStore()
const { getStatusLabel } = useHelpers()

const stats = ref(null)
const ranking = ref([])

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom'
    }
  }
}

const barChartOptions = {
  ...chartOptions,
  indexAxis: 'y',
  plugins: {
    legend: {
      display: false
    }
  }
}

const lineChartOptions = {
  ...chartOptions,
  plugins: {
    legend: {
      display: false
    }
  },
  scales: {
    y: {
      beginAtZero: true
    }
  }
}

const statusColors = {
  new: '#3b82f6',
  in_progress: '#f59e0b',
  waiting: '#a855f7',
  resolved: '#22c55e',
  closed: '#6b7280'
}

const statusChartData = computed(() => {
  if (!stats.value?.byStatus) return null

  return {
    labels: stats.value.byStatus.map(s => getStatusLabel(s.status)),
    datasets: [{
      data: stats.value.byStatus.map(s => s.count),
      backgroundColor: stats.value.byStatus.map(s => statusColors[s.status])
    }]
  }
})

const categoryChartData = computed(() => {
  if (!stats.value?.byCategory) return null

  return {
    labels: stats.value.byCategory.map(c => c.name),
    datasets: [{
      data: stats.value.byCategory.map(c => c.count),
      backgroundColor: stats.value.byCategory.map(c => c.color || '#6366f1')
    }]
  }
})

const trendChartData = computed(() => {
  if (!stats.value?.trend) return null

  return {
    labels: stats.value.trend.map(t => {
      const d = new Date(t.date)
      return `${d.getDate()}/${d.getMonth() + 1}`
    }),
    datasets: [{
      label: 'Tickets',
      data: stats.value.trend.map(t => t.count),
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99, 102, 241, 0.1)',
      fill: true,
      tension: 0.4
    }]
  }
})

function getSLAColor(compliance) {
  if (compliance >= 90) return 'text-green-600'
  if (compliance >= 70) return 'text-yellow-600'
  return 'text-red-600'
}

function formatResponseTime(minutes) {
  if (!minutes) return '-'
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

function getInitials(name) {
  return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'
}

onMounted(async () => {
  const [statsResult, rankingResult] = await Promise.all([
    ticketStore.fetchStats(),
    ticketStore.fetchRanking()
  ])

  if (statsResult.success) {
    stats.value = statsResult.stats
  }

  if (rankingResult.success) {
    ranking.value = rankingResult.ranking
  }
})
</script>
