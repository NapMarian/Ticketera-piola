<template>
  <div class="flex flex-wrap items-center gap-3">
    <!-- Preset selector -->
    <div class="relative">
      <select
        v-model="selectedPreset"
        @change="applyPreset"
        class="px-3 py-2 bg-surface border border-border rounded-lg text-white text-sm focus:ring-2 focus:ring-primary-500/50 focus:border-transparent appearance-none pr-8 min-w-[160px]"
      >
        <option value="this_month">Este mes</option>
        <option value="last_month">Mes anterior</option>
        <option value="last_3_months">Últimos 3 meses</option>
        <option value="last_6_months">Últimos 6 meses</option>
        <option value="this_year">Este año</option>
        <option value="last_year">Año anterior</option>
        <option value="custom">Personalizado</option>
      </select>
      <svg class="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
      </svg>
    </div>

    <!-- Custom date inputs (shown when preset is 'custom') -->
    <template v-if="selectedPreset === 'custom'">
      <div class="flex items-center gap-2">
        <input
          type="date"
          v-model="customStartDate"
          @change="applyCustomDates"
          class="px-3 py-2 bg-surface border border-border rounded-lg text-white text-sm focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
        />
        <span class="text-gray-400">a</span>
        <input
          type="date"
          v-model="customEndDate"
          @change="applyCustomDates"
          class="px-3 py-2 bg-surface border border-border rounded-lg text-white text-sm focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
        />
      </div>
    </template>

    <!-- Comparison toggle -->
    <div v-if="showComparison" class="flex items-center gap-2">
      <span class="text-gray-400 text-sm">Comparar con:</span>
      <select
        v-model="comparisonMode"
        @change="emitChange"
        class="px-3 py-2 bg-surface border border-border rounded-lg text-white text-sm focus:ring-2 focus:ring-primary-500/50 focus:border-transparent appearance-none pr-8"
      >
        <option value="none">Sin comparación</option>
        <option value="previous_period">Período anterior</option>
        <option value="same_period_last_year">Mismo período año anterior</option>
      </select>
    </div>

    <!-- Current range display -->
    <div class="text-sm text-gray-400 ml-2">
      <span class="text-gray-500">Mostrando:</span>
      {{ formatDateRange(startDate, endDate) }}
      <template v-if="comparisonMode !== 'none' && comparisonStartDate">
        <span class="text-primary-400 ml-2">vs</span>
        {{ formatDateRange(comparisonStartDate, comparisonEndDate) }}
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

const props = defineProps({
  showComparison: {
    type: Boolean,
    default: true
  },
  initialPreset: {
    type: String,
    default: 'this_month'
  }
})

const emit = defineEmits(['change'])

const selectedPreset = ref(props.initialPreset)
const comparisonMode = ref('none')
const customStartDate = ref('')
const customEndDate = ref('')

const startDate = ref(null)
const endDate = ref(null)
const comparisonStartDate = ref(null)
const comparisonEndDate = ref(null)

function getPresetDates(preset) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  switch (preset) {
    case 'this_month': {
      const start = new Date(today.getFullYear(), today.getMonth(), 1)
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      return { start, end }
    }
    case 'last_month': {
      const start = new Date(today.getFullYear(), today.getMonth() - 1, 1)
      const end = new Date(today.getFullYear(), today.getMonth(), 0)
      return { start, end }
    }
    case 'last_3_months': {
      const start = new Date(today.getFullYear(), today.getMonth() - 2, 1)
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      return { start, end }
    }
    case 'last_6_months': {
      const start = new Date(today.getFullYear(), today.getMonth() - 5, 1)
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      return { start, end }
    }
    case 'this_year': {
      const start = new Date(today.getFullYear(), 0, 1)
      const end = new Date(today.getFullYear(), 11, 31)
      return { start, end }
    }
    case 'last_year': {
      const start = new Date(today.getFullYear() - 1, 0, 1)
      const end = new Date(today.getFullYear() - 1, 11, 31)
      return { start, end }
    }
    default:
      return { start: today, end: today }
  }
}

function getComparisonDates(start, end, mode) {
  if (mode === 'none') return { start: null, end: null }

  const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1

  if (mode === 'previous_period') {
    const compEnd = new Date(start)
    compEnd.setDate(compEnd.getDate() - 1)
    const compStart = new Date(compEnd)
    compStart.setDate(compStart.getDate() - daysDiff + 1)
    return { start: compStart, end: compEnd }
  }

  if (mode === 'same_period_last_year') {
    const compStart = new Date(start)
    compStart.setFullYear(compStart.getFullYear() - 1)
    const compEnd = new Date(end)
    compEnd.setFullYear(compEnd.getFullYear() - 1)
    return { start: compStart, end: compEnd }
  }

  return { start: null, end: null }
}

function formatDate(date) {
  if (!date) return ''
  return date.toISOString().split('T')[0]
}

function formatDateRange(start, end) {
  if (!start || !end) return ''
  const options = { day: '2-digit', month: 'short' }
  const startStr = start.toLocaleDateString('es-ES', options)
  const endStr = end.toLocaleDateString('es-ES', { ...options, year: 'numeric' })
  return `${startStr} - ${endStr}`
}

function applyPreset() {
  if (selectedPreset.value === 'custom') {
    // Initialize custom dates with current range
    customStartDate.value = formatDate(startDate.value)
    customEndDate.value = formatDate(endDate.value)
    return
  }

  const { start, end } = getPresetDates(selectedPreset.value)
  startDate.value = start
  endDate.value = end
  emitChange()
}

function applyCustomDates() {
  if (customStartDate.value && customEndDate.value) {
    startDate.value = new Date(customStartDate.value)
    endDate.value = new Date(customEndDate.value)
    emitChange()
  }
}

function emitChange() {
  const comparison = getComparisonDates(startDate.value, endDate.value, comparisonMode.value)
  comparisonStartDate.value = comparison.start
  comparisonEndDate.value = comparison.end

  emit('change', {
    startDate: formatDate(startDate.value),
    endDate: formatDate(endDate.value),
    comparisonStartDate: comparison.start ? formatDate(comparison.start) : null,
    comparisonEndDate: comparison.end ? formatDate(comparison.end) : null,
    preset: selectedPreset.value,
    comparisonMode: comparisonMode.value
  })
}

onMounted(() => {
  applyPreset()
})
</script>
