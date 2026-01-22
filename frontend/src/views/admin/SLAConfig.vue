<template>
  <StaffLayout page-title="Configuración SLA">
    <div class="max-w-3xl">
      <p class="text-gray-600 mb-6">
        Define los tiempos de respuesta y resolución por prioridad
      </p>

      <!-- SLA Configs -->
      <div class="bg-white rounded-xl shadow mb-8">
        <div class="p-4 border-b">
          <h2 class="font-semibold text-gray-800">Tiempos por Prioridad</h2>
        </div>
        <div class="divide-y">
          <div
            v-for="config in slaConfigs"
            :key="config.id"
            class="p-4 flex items-center gap-6"
          >
            <div class="w-24">
              <span
                class="px-3 py-1 rounded-full text-sm font-medium"
                :class="getPriorityClass(config.priority)"
              >
                {{ getPriorityLabel(config.priority) }}
              </span>
            </div>
            <div class="flex-1 grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs text-gray-500 mb-1">Primera respuesta</label>
                <div class="flex items-center gap-2">
                  <input
                    v-model.number="config.firstResponseHours"
                    type="number"
                    min="1"
                    class="w-20 px-3 py-1 border border-gray-300 rounded-lg text-center"
                    @change="updateConfig(config)"
                  />
                  <span class="text-sm text-gray-500">horas</span>
                </div>
              </div>
              <div>
                <label class="block text-xs text-gray-500 mb-1">Resolución</label>
                <div class="flex items-center gap-2">
                  <input
                    v-model.number="config.resolutionHours"
                    type="number"
                    min="1"
                    class="w-20 px-3 py-1 border border-gray-300 rounded-lg text-center"
                    @change="updateConfig(config)"
                  />
                  <span class="text-sm text-gray-500">horas</span>
                </div>
              </div>
            </div>
            <label class="flex items-center gap-2">
              <input
                type="checkbox"
                v-model="config.isActive"
                @change="updateConfig(config)"
                class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span class="text-sm text-gray-600">Activo</span>
            </label>
          </div>
        </div>
      </div>

      <!-- Work Schedule -->
      <div class="bg-white rounded-xl shadow">
        <div class="p-4 border-b">
          <h2 class="font-semibold text-gray-800">Horario Laboral</h2>
          <p class="text-sm text-gray-500">Los SLAs solo cuentan horas laborales</p>
        </div>
        <div class="divide-y">
          <div
            v-for="day in workSchedule"
            :key="day.id"
            class="p-4 flex items-center gap-6"
          >
            <div class="w-32">
              <span class="font-medium text-gray-800">{{ getDayName(day.dayOfWeek) }}</span>
            </div>
            <label class="flex items-center gap-2">
              <input
                type="checkbox"
                v-model="day.isWorkingDay"
                @change="updateSchedule(day)"
                class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span class="text-sm text-gray-600">Día laboral</span>
            </label>
            <div v-if="day.isWorkingDay" class="flex items-center gap-2">
              <input
                v-model="day.startTime"
                type="time"
                class="px-3 py-1 border border-gray-300 rounded-lg"
                @change="updateSchedule(day)"
              />
              <span class="text-gray-400">-</span>
              <input
                v-model="day.endTime"
                type="time"
                class="px-3 py-1 border border-gray-300 rounded-lg"
                @change="updateSchedule(day)"
              />
            </div>
            <span v-else class="text-sm text-gray-400">No laboral</span>
          </div>
        </div>
      </div>
    </div>
  </StaffLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import StaffLayout from '@/components/layouts/StaffLayout.vue'
import { useHelpers } from '@/composables/useHelpers'
import api from '@/services/api'

const { getPriorityLabel, getPriorityClass, getDayName } = useHelpers()

const slaConfigs = ref([])
const workSchedule = ref([])

async function loadData() {
  try {
    const [slaRes, scheduleRes] = await Promise.all([
      api.get('/sla/configs'),
      api.get('/sla/schedule')
    ])

    slaConfigs.value = slaRes.data.configs
    workSchedule.value = scheduleRes.data.schedule
  } catch (err) {
    console.error('Error loading SLA data:', err)
  }
}

async function updateConfig(config) {
  try {
    await api.put(`/sla/configs/${config.id}`, {
      firstResponseHours: config.firstResponseHours,
      resolutionHours: config.resolutionHours,
      isActive: config.isActive
    })
  } catch (err) {
    alert(err.response?.data?.error || 'Error al actualizar')
    loadData()
  }
}

async function updateSchedule(day) {
  try {
    await api.put(`/sla/schedule/${day.id}`, {
      isWorkingDay: day.isWorkingDay,
      startTime: day.isWorkingDay ? day.startTime : null,
      endTime: day.isWorkingDay ? day.endTime : null
    })
  } catch (err) {
    alert(err.response?.data?.error || 'Error al actualizar')
    loadData()
  }
}

onMounted(() => {
  loadData()
})
</script>
