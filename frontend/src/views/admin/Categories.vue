<template>
  <StaffLayout page-title="Categorías">
    <div class="max-w-3xl">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <p class="text-gray-500">Organiza los tickets por categoría</p>
        <button
          @click="showModal = true; editingId = null; resetForm()"
          class="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          + Nueva categoría
        </button>
      </div>

      <!-- List -->
      <div class="bg-background-secondary/50 backdrop-blur-sm rounded-xl border border-border divide-y divide-border">
        <div
          v-for="category in categories"
          :key="category.id"
          class="p-4 flex items-center gap-4 hover:bg-surface-hover"
        >
          <div
            class="w-4 h-4 rounded-full"
            :style="{ backgroundColor: category.color }"
          />
          <div class="flex-1">
            <h3 class="font-medium text-white">{{ category.name }}</h3>
            <p class="text-sm text-gray-500">{{ category.description || 'Sin descripción' }}</p>
          </div>
          <span
            class="px-2 py-1 rounded text-xs"
            :class="category.isActive ? 'bg-green-900/50 text-green-300' : 'bg-gray-800 text-gray-400'"
          >
            {{ category.isActive ? 'Activa' : 'Inactiva' }}
          </span>
          <div class="flex items-center gap-2">
            <button
              @click="editCategory(category)"
              class="p-2 text-gray-400 hover:text-primary-400 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
            </button>
            <button
              @click="deleteCategory(category)"
              class="p-2 text-gray-400 hover:text-red-400 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
          </div>
        </div>

        <div v-if="categories.length === 0" class="p-8 text-center text-gray-500">
          No hay categorías
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
      <div class="bg-background-tertiary rounded-xl border border-border shadow-xl max-w-md w-full p-6">
        <h2 class="text-xl font-semibold text-white mb-4">
          {{ editingId ? 'Editar categoría' : 'Nueva categoría' }}
        </h2>

        <form @submit.prevent="saveCategory">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-400 mb-1">Nombre *</label>
            <input
              v-model="form.name"
              type="text"
              required
              class="w-full px-4 py-2 bg-surface border border-border rounded-lg text-white focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
            />
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-400 mb-1">Descripción</label>
            <textarea
              v-model="form.description"
              rows="2"
              class="w-full px-4 py-2 bg-surface border border-border rounded-lg text-white focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
            />
          </div>

          <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-1">Color</label>
              <input
                v-model="form.color"
                type="color"
                class="w-full h-10 rounded-lg border border-border cursor-pointer bg-surface"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-1">Prioridad default</label>
              <select
                v-model="form.defaultPriority"
                class="w-full px-4 py-2 bg-surface border border-border rounded-lg text-white focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>
          </div>

          <div v-if="editingId" class="mb-4">
            <label class="flex items-center gap-2">
              <input
                type="checkbox"
                v-model="form.isActive"
                class="rounded border-border bg-surface text-primary-500 focus:ring-primary-500/50"
              />
              <span class="text-sm text-gray-400">Categoría activa</span>
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
import { ref, reactive, onMounted } from 'vue'
import StaffLayout from '@/components/layouts/StaffLayout.vue'
import api from '@/services/api'

const categories = ref([])
const showModal = ref(false)
const backdropMouseDown = ref(false)
const editingId = ref(null)
const saving = ref(false)
const error = ref('')

const form = reactive({
  name: '',
  description: '',
  color: '#6366f1',
  defaultPriority: 'medium',
  isActive: true
})

function resetForm() {
  form.name = ''
  form.description = ''
  form.color = '#6366f1'
  form.defaultPriority = 'medium'
  form.isActive = true
  error.value = ''
}

async function loadCategories() {
  try {
    const { data } = await api.get('/categories')
    categories.value = data.categories
  } catch (err) {
    console.error('Error loading categories:', err)
  }
}

function editCategory(category) {
  editingId.value = category.id
  form.name = category.name
  form.description = category.description || ''
  form.color = category.color
  form.defaultPriority = category.defaultPriority
  form.isActive = category.isActive
  showModal.value = true
}

async function saveCategory() {
  saving.value = true
  error.value = ''

  try {
    if (editingId.value) {
      await api.put(`/categories/${editingId.value}`, form)
    } else {
      await api.post('/categories', form)
    }

    showModal.value = false
    loadCategories()
  } catch (err) {
    error.value = err.response?.data?.error || 'Error al guardar'
  }

  saving.value = false
}

async function deleteCategory(category) {
  if (!confirm(`¿Eliminar la categoría "${category.name}"?`)) return

  try {
    await api.delete(`/categories/${category.id}`)
    loadCategories()
  } catch (err) {
    alert(err.response?.data?.error || 'Error al eliminar')
  }
}

onMounted(() => {
  loadCategories()
})
</script>
