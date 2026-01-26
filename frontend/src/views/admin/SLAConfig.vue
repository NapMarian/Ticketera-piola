<template>
  <StaffLayout page-title="Configuracion SLA">
    <div class="max-w-3xl">
      <p class="text-gray-500 mb-6">
        Define los tiempos de respuesta y resolucion por prioridad
      </p>

      <!-- SLA Configs -->
      <div class="bg-background-secondary/50 backdrop-blur-sm rounded-xl border border-border mb-8">
        <div class="px-5 py-4 border-b border-border">
          <h2 class="font-medium text-white">Tiempos por Prioridad</h2>
        </div>
        <div class="divide-y divide-border">
          <div
            v-for="config in slaConfigs"
            :key="config.id"
            class="px-5 py-4 flex items-center gap-6"
          >
            <div class="w-24">
              <span
                class="px-3 py-1 rounded-full text-xs font-medium"
                :class="getPriorityClass(config.priority)"
              >
                {{ getPriorityLabel(config.priority) }}
              </span>
            </div>
            <div class="flex-1 grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs text-gray-500 mb-1.5">Primera respuesta</label>
                <div class="flex items-center gap-2">
                  <input
                    v-model.number="config.firstResponseMinutes"
                    type="number"
                    min="1"
                    class="w-20 px-3 py-1.5 bg-surface border border-border rounded-lg text-white text-center focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                    @change="updateConfig(config)"
                  />
                  <span class="text-sm text-gray-500">min</span>
                </div>
              </div>
              <div>
                <label class="block text-xs text-gray-500 mb-1.5">Resolucion</label>
                <div class="flex items-center gap-2">
                  <input
                    v-model.number="config.resolutionMinutes"
                    type="number"
                    min="1"
                    class="w-20 px-3 py-1.5 bg-surface border border-border rounded-lg text-white text-center focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                    @change="updateConfig(config)"
                  />
                  <span class="text-sm text-gray-500">min</span>
                </div>
              </div>
            </div>
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                v-model="config.isActive"
                @change="updateConfig(config)"
                class="w-4 h-4 rounded border-border bg-surface text-primary-500 focus:ring-primary-500/50 focus:ring-offset-0"
              />
              <span class="text-sm text-gray-400">Activo</span>
            </label>
          </div>
        </div>
      </div>

      <!-- Work Schedule -->
      <div class="bg-background-secondary/50 backdrop-blur-sm rounded-xl border border-border">
        <div class="px-5 py-4 border-b border-border">
          <h2 class="font-medium text-white">Horario Laboral</h2>
          <p class="text-sm text-gray-500 mt-0.5">Los SLAs solo cuentan tiempo en horario laboral</p>
        </div>
        <div class="divide-y divide-border">
          <div
            v-for="day in workSchedule"
            :key="day.id"
            class="px-5 py-4 flex items-center gap-6"
          >
            <div class="w-32">
              <span class="font-medium text-white">{{ getDayName(day.dayOfWeek) }}</span>
            </div>
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                v-model="day.isWorkingDay"
                @change="updateSchedule(day)"
                class="w-4 h-4 rounded border-border bg-surface text-primary-500 focus:ring-primary-500/50 focus:ring-offset-0"
              />
              <span class="text-sm text-gray-400">Dia laboral</span>
            </label>
            <div v-if="day.isWorkingDay" class="flex items-center gap-2">
              <input
                v-model="day.startTime"
                type="time"
                class="px-3 py-1.5 bg-surface border border-border rounded-lg text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                @change="updateSchedule(day)"
              />
              <span class="text-gray-500">-</span>
              <input
                v-model="day.endTime"
                type="time"
                class="px-3 py-1.5 bg-surface border border-border rounded-lg text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500"
                @change="updateSchedule(day)"
              />
            </div>
            <span v-else class="text-sm text-gray-600">No laboral</span>
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
      firstResponseMinutes: config.firstResponseMinutes,
      resolutionMinutes: config.resolutionMinutes,
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
