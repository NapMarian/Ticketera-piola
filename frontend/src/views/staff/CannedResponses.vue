<template>
  <StaffLayout page-title="Respuestas Predefinidas">
    <div class="max-w-4xl">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <p class="text-gray-400">Crea respuestas rápidas para usar en los tickets</p>
        <button
          @click="showModal = true; editingId = null; resetForm()"
          class="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          + Nueva respuesta
        </button>
      </div>

      <!-- List -->
      <div class="bg-background-secondary/50 backdrop-blur-sm rounded-xl border border-border">
        <div v-if="loading" class="p-8 text-center">
          <svg class="w-10 h-10 animate-spin text-primary-500 mx-auto" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
          </svg>
        </div>

        <div v-else-if="responses.length === 0" class="p-8 text-center text-gray-500">
          No hay respuestas predefinidas
        </div>

        <div v-else class="divide-y divide-border">
          <div
            v-for="response in responses"
            :key="response.id"
            class="p-4 hover:bg-surface-hover transition-colors"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <h3 class="font-medium text-white">{{ response.title }}</h3>
                  <span
                    v-if="response.shortcut"
                    class="px-2 py-0.5 bg-surface text-gray-400 text-xs rounded"
                  >
                    /{{ response.shortcut }}
                  </span>
                  <span
                    v-if="response.isGlobal"
                    class="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded"
                  >
                    Global
                  </span>
                </div>
                <p class="text-sm text-gray-400 line-clamp-2">{{ response.content }}</p>
              </div>
              <div class="flex items-center gap-2 ml-4">
                <button
                  @click="editResponse(response)"
                  class="p-2 text-gray-400 hover:text-primary-500 transition-colors"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                </button>
                <button
                  @click="deleteResponse(response.id)"
                  class="p-2 text-gray-400 hover:text-red-500 transition-colors"
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
    </div>

    <!-- Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @mousedown.self="backdropMouseDown = true"
      @mouseup.self="if (backdropMouseDown) showModal = false; backdropMouseDown = false"
      @mouseup="backdropMouseDown = false"
    >
      <div class="bg-background-tertiary rounded-xl border border-border max-w-lg w-full p-6">
        <h2 class="text-xl font-semibold text-white mb-4">
          {{ editingId ? 'Editar respuesta' : 'Nueva respuesta' }}
        </h2>

        <form @submit.prevent="saveResponse">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-400 mb-1">Título *</label>
            <input
              v-model="form.title"
              type="text"
              required
              class="w-full px-4 py-2 bg-surface border border-border rounded-lg text-white focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
              placeholder="Ej: Saludo inicial"
            />
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-400 mb-1">Atajo (opcional)</label>
            <div class="flex items-center">
              <span class="px-3 py-2 bg-surface border border-r-0 border-border rounded-l-lg text-gray-500">/</span>
              <input
                v-model="form.shortcut"
                type="text"
                class="flex-1 px-4 py-2 bg-surface border border-border rounded-r-lg text-white focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
                placeholder="saludo"
              />
            </div>
            <p class="text-xs text-gray-500 mt-1">Escribe /atajo para insertar rápidamente</p>
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-400 mb-1">Contenido *</label>
            <textarea
              v-model="form.content"
              required
              rows="4"
              class="w-full px-4 py-2 bg-surface border border-border rounded-lg text-white focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
              placeholder="Escribe el contenido de la respuesta..."
            />
          </div>

          <div v-if="isAdmin" class="mb-4">
            <label class="flex items-center gap-2">
              <input
                type="checkbox"
                v-model="form.isGlobal"
                class="rounded border-border text-primary-500 focus:ring-primary-500/50"
              />
              <span class="text-sm text-gray-400">Disponible para todos los agentes</span>
            </label>
          </div>

          <div v-if="error" class="mb-4 p-3 bg-red-500/20 text-red-400 rounded-lg text-sm border border-red-500/30">
            {{ error }}
          </div>

          <div class="flex gap-3 justify-end">
            <button
              type="button"
              @click="showModal = false"
              class="px-4 py-2 border border-border text-gray-400 rounded-lg hover:bg-surface-hover transition-colors"
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
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

const authStore = useAuthStore()
const isAdmin = computed(() => authStore.isAdmin)

const responses = ref([])
const loading = ref(true)
const showModal = ref(false)
const backdropMouseDown = ref(false)
const editingId = ref(null)
const saving = ref(false)
const error = ref('')

const form = reactive({
  title: '',
  shortcut: '',
  content: '',
  isGlobal: false
})

function resetForm() {
  form.title = ''
  form.shortcut = ''
  form.content = ''
  form.isGlobal = false
  error.value = ''
}

async function loadResponses() {
  loading.value = true
  try {
    const { data } = await api.get('/canned-responses')
    responses.value = data.responses
  } catch (err) {
    console.error('Error loading responses:', err)
  }
  loading.value = false
}

function editResponse(response) {
  editingId.value = response.id
  form.title = response.title
  form.shortcut = response.shortcut || ''
  form.content = response.content
  form.isGlobal = response.isGlobal
  showModal.value = true
}

async function saveResponse() {
  saving.value = true
  error.value = ''

  try {
    const payload = {
      title: form.title,
      content: form.content,
      shortcut: form.shortcut || null,
      isGlobal: form.isGlobal
    }

    if (editingId.value) {
      await api.put(`/canned-responses/${editingId.value}`, payload)
    } else {
      await api.post('/canned-responses', payload)
    }

    showModal.value = false
    loadResponses()
  } catch (err) {
    error.value = err.response?.data?.error || 'Error al guardar'
  }

  saving.value = false
}

async function deleteResponse(id) {
  if (!confirm('¿Eliminar esta respuesta predefinida?')) return

  try {
    await api.delete(`/canned-responses/${id}`)
    loadResponses()
  } catch (err) {
    alert(err.response?.data?.error || 'Error al eliminar')
  }
}

onMounted(() => {
  loadResponses()
})
</script>
