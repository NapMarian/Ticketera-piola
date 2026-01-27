<template>
  <StaffLayout page-title="Feriados">
    <div class="max-w-3xl">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <p class="text-gray-500">Los feriados no se cuentan en el cálculo de SLA</p>
        </div>
        <button
          @click="showModal = true; editingId = null; resetForm()"
          class="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          + Agregar feriado
        </button>
      </div>

      <!-- Year filter -->
      <div class="mb-4">
        <select
          v-model="selectedYear"
          @change="loadHolidays"
          class="px-4 py-2 bg-surface border border-border rounded-lg text-white focus:ring-2 focus:ring-primary-500/50"
        >
          <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
        </select>
      </div>

      <!-- Calendar view -->
      <div class="bg-background-secondary/50 backdrop-blur-sm rounded-xl border border-border">
        <div v-if="holidays.length === 0" class="p-8 text-center text-gray-500">
          No hay feriados para {{ selectedYear }}
        </div>

        <div v-else class="divide-y divide-border">
          <div
            v-for="holiday in sortedHolidays"
            :key="holiday.id"
            class="p-4 flex items-center gap-4 hover:bg-surface-hover"
          >
            <div class="w-16 h-16 bg-primary-900/50 rounded-lg flex flex-col items-center justify-center">
              <span class="text-2xl font-bold text-primary-400">{{ getDay(holiday.date) }}</span>
              <span class="text-xs text-primary-500">{{ getMonth(holiday.date) }}</span>
            </div>
            <div class="flex-1">
              <h3 class="font-medium text-white">{{ holiday.name }}</h3>
              <p class="text-sm text-gray-500">
                {{ formatFullDate(holiday.date) }}
                <span v-if="holiday.isRecurring" class="ml-2 text-green-400">(Recurrente)</span>
              </p>
            </div>
            <div class="flex items-center gap-2">
              <button
                @click="editHoliday(holiday)"
                class="p-2 text-gray-400 hover:text-primary-400 transition-colors"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
              </button>
              <button
                @click="deleteHoliday(holiday.id)"
                class="p-2 text-gray-400 hover:text-red-400 transition-colors"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click.self="showModal = false"
    >
      <div class="bg-background-tertiary rounded-xl border border-border shadow-xl max-w-md w-full p-6">
        <h2 class="text-xl font-semibold text-white mb-4">
          {{ editingId ? 'Editar feriado' : 'Nuevo feriado' }}
        </h2>

        <form @submit.prevent="saveHoliday">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-400 mb-1">Fecha *</label>
            <input
              v-model="form.date"
              type="date"
              required
              class="w-full px-4 py-2 bg-surface border border-border rounded-lg text-white focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
            />
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-400 mb-1">Nombre *</label>
            <input
              v-model="form.name"
              type="text"
              required
              class="w-full px-4 py-2 bg-surface border border-border rounded-lg text-white focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
              placeholder="Ej: Día de la Independencia"
            />
          </div>

          <div class="mb-4">
            <label class="flex items-center gap-2">
              <input
                type="checkbox"
                v-model="form.isRecurring"
                class="rounded border-border bg-surface text-primary-500 focus:ring-primary-500/50"
              />
              <span class="text-sm text-gray-400">Se repite cada año</span>
            </label>
          </div>

          <div v-if="error" class="mb-4 p-3 bg-red-900/50 text-red-400 rounded-lg text-sm">
            {{ error }}
          </div>

          <div class="flex gap-3 justify-end">
            <button
              type="button"
              @click="showModal = false"
              class="px-4 py-2 bg-surface border border-border text-gray-400 rounded-lg hover:bg-surface-hover transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 transition-colors"
            >
              {{ saving ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </StaffLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import StaffLayout from '@/components/layouts/StaffLayout.vue'
import api from '@/services/api'

const currentYear = new Date().getFullYear()
const years = [currentYear - 1, currentYear, currentYear + 1, currentYear + 2]

const holidays = ref([])
const selectedYear = ref(currentYear)
const showModal = ref(false)
const editingId = ref(null)
const saving = ref(false)
const error = ref('')

const form = reactive({
  date: '',
  name: '',
  isRecurring: false
})

const sortedHolidays = computed(() => {
  return [...holidays.value].sort((a, b) => a.date.localeCompare(b.date))
})

function resetForm() {
  form.date = ''
  form.name = ''
  form.isRecurring = false
  error.value = ''
}

// Parse YYYY-MM-DD as local date (avoid timezone issues)
function parseLocalDate(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function getDay(date) {
  return parseLocalDate(date).getDate()
}

function getMonth(date) {
  return parseLocalDate(date).toLocaleDateString('es-ES', { month: 'short' }).toUpperCase()
}

function formatFullDate(date) {
  return parseLocalDate(date).toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  })
}

async function loadHolidays() {
  try {
    const { data } = await api.get('/sla/holidays', { params: { year: selectedYear.value } })
    holidays.value = data.holidays
  } catch (err) {
    console.error('Error loading holidays:', err)
  }
}

function editHoliday(holiday) {
  editingId.value = holiday.id
  form.date = holiday.date
  form.name = holiday.name
  form.isRecurring = holiday.isRecurring
  showModal.value = true
}

async function saveHoliday() {
  saving.value = true
  error.value = ''

  try {
    if (editingId.value) {
      await api.put(`/sla/holidays/${editingId.value}`, form)
    } else {
      await api.post('/sla/holidays', form)
    }

    showModal.value = false
    loadHolidays()
  } catch (err) {
    error.value = err.response?.data?.error || 'Error al guardar'
  }

  saving.value = false
}

async function deleteHoliday(id) {
  if (!confirm('¿Eliminar este feriado?')) return

  try {
    await api.delete(`/sla/holidays/${id}`)
    loadHolidays()
  } catch (err) {
    alert(err.response?.data?.error || 'Error al eliminar')
  }
}

onMounted(() => {
  loadHolidays()
})
</script>
