<template>
  <StaffLayout page-title="Dashboard">
    <!-- Stats cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div class="bg-background-secondary/50 backdrop-blur-sm rounded-xl border border-border p-5">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">Tickets Abiertos</p>
            <p class="text-3xl font-bold text-white mt-1">{{ stats?.summary?.open || 0 }}</p>
          </div>
          <div class="w-10 h-10 bg-primary-500/20 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/>
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-background-secondary/50 backdrop-blur-sm rounded-xl border border-border p-5">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">Resueltos este mes</p>
            <p class="text-3xl font-bold text-white mt-1">{{ stats?.summary?.resolved || 0 }}</p>
          </div>
          <div class="w-10 h-10 bg-success/20 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-background-secondary/50 backdrop-blur-sm rounded-xl border border-border p-5">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">Cumplimiento SLA</p>
            <p class="text-3xl font-bold mt-1" :class="getSLAColor(stats?.sla?.compliance)">
              {{ stats?.sla?.compliance || 100 }}%
            </p>
          </div>
          <div class="w-10 h-10 bg-accent-500/20 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-background-secondary/50 backdrop-blur-sm rounded-xl border border-border p-5">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">Tiempo Resp. Prom.</p>
            <p class="text-3xl font-bold text-white mt-1">
              {{ formatResponseTime(stats?.avgResponseTimeMinutes) }}
            </p>
          </div>
          <div class="w-10 h-10 bg-cteam-orange/20 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-cteam-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts row -->
    <div class="grid lg:grid-cols-2 gap-6 mb-8">
      <!-- By Status -->
      <div class="bg-background-secondary/50 backdrop-blur-sm rounded-xl border border-border p-5">
        <h2 class="text-base font-medium text-white mb-4">Tickets por Estado</h2>
        <div class="h-64">
          <Doughnut v-if="statusChartData" :data="statusChartData" :options="chartOptions" />
        </div>
      </div>

      <!-- By Category -->
      <div class="bg-background-secondary/50 backdrop-blur-sm rounded-xl border border-border p-5">
        <h2 class="text-base font-medium text-white mb-4">Tickets por Categoria</h2>
        <div class="h-64">
          <Bar v-if="categoryChartData" :data="categoryChartData" :options="barChartOptions" />
        </div>
      </div>
    </div>

    <!-- Trend and Ranking -->
    <div class="grid lg:grid-cols-3 gap-6">
      <!-- Trend -->
      <div class="lg:col-span-2 bg-background-secondary/50 backdrop-blur-sm rounded-xl border border-border p-5">
        <h2 class="text-base font-medium text-white mb-4">Tendencia (ultimos 30 dias)</h2>
        <div class="h-64">
          <Line v-if="trendChartData" :data="trendChartData" :options="lineChartOptions" />
        </div>
      </div>

      <!-- Agent Ranking -->
      <div class="bg-background-secondary/50 backdrop-blur-sm rounded-xl border border-border p-5">
        <h2 class="text-base font-medium text-white mb-4">Ranking de Agentes</h2>
        <div class="space-y-3">
          <div
            v-for="agent in ranking"
            :key="agent.id"
            class="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-hover transition-colors"
          >
            <div class="w-7 h-7 flex items-center justify-center">
              <span
                v-if="agent.rank <= 3"
                class="text-lg"
              >
                {{ agent.rank === 1 ? '1' : agent.rank === 2 ? '2' : '3' }}
              </span>
              <span v-else class="text-gray-500 text-sm font-medium">{{ agent.rank }}</span>
            </div>
            <div class="w-9 h-9 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
              <span class="text-white text-xs font-semibold">{{ getInitials(agent.name) }}</span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-medium text-white text-sm truncate">{{ agent.name }}</p>
              <p class="text-xs text-gray-500">{{ agent.resolvedCount }} resueltos</p>
            </div>
            <div v-if="agent.avgSatisfaction" class="text-sm text-primary-400">
              {{ agent.avgSatisfaction }}
            </div>
          </div>

          <div v-if="ranking.length === 0" class="text-center text-gray-500 py-4">
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
      position: 'bottom',
      labels: {
        color: '#9ca3af'
      }
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
  },
  scales: {
    x: {
      ticks: { color: '#6b7280' },
      grid: { color: '#27272a' }
    },
    y: {
      ticks: { color: '#9ca3af' },
      grid: { color: '#27272a' }
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
    x: {
      ticks: { color: '#6b7280' },
      grid: { color: '#27272a' }
    },
    y: {
      beginAtZero: true,
      ticks: { color: '#6b7280' },
      grid: { color: '#27272a' }
    }
  }
}

const statusColors = {
  new: '#06b6d4',
  in_progress: '#f59e0b',
  waiting: '#a855f7',
  resolved: '#10b981',
  closed: '#6b7280'
}

const statusChartData = computed(() => {
  if (!stats.value?.byStatus) return null

  return {
    labels: stats.value.byStatus.map(s => getStatusLabel(s.status)),
    datasets: [{
      data: stats.value.byStatus.map(s => s.count),
      backgroundColor: stats.value.byStatus.map(s => statusColors[s.status]),
      borderWidth: 0
    }]
  }
})

const categoryChartData = computed(() => {
  if (!stats.value?.byCategory) return null

  return {
    labels: stats.value.byCategory.map(c => c.name),
    datasets: [{
      data: stats.value.byCategory.map(c => c.count),
      backgroundColor: stats.value.byCategory.map(c => c.color || '#06b6d4'),
      borderWidth: 0,
      borderRadius: 4
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
      borderColor: '#06b6d4',
      backgroundColor: 'rgba(6, 182, 212, 0.1)',
      fill: true,
      tension: 0.4,
      borderWidth: 2,
      pointRadius: 0,
      pointHoverRadius: 4
    }]
  }
})

function getSLAColor(compliance) {
  if (compliance >= 90) return 'text-success'
  if (compliance >= 70) return 'text-warning'
  return 'text-error'
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
