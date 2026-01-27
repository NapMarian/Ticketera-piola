<template>
  <StaffLayout page-title="Usuarios">
    <div class="max-w-5xl">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <p class="text-gray-500">Gestiona los usuarios del sistema</p>
        <button
          @click="showModal = true; editingId = null; resetForm()"
          class="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          + Nuevo usuario
        </button>
      </div>

      <!-- List -->
      <div class="bg-background-secondary/50 backdrop-blur-sm rounded-xl border border-border overflow-hidden">
        <table class="w-full">
          <thead class="border-b border-border">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Usuario</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Email</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Rol</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Estado</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr v-for="user in users" :key="user.id" class="hover:bg-surface-hover">
              <td class="px-4 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-primary-900 text-primary-400 rounded-full flex items-center justify-center font-medium">
                    {{ getInitials(user.name) }}
                  </div>
                  <span class="font-medium text-white">{{ user.name }}</span>
                </div>
              </td>
              <td class="px-4 py-4 text-gray-400">{{ user.email }}</td>
              <td class="px-4 py-4">
                <span
                  class="px-2 py-1 rounded-full text-xs font-medium"
                  :class="getRoleClass(user.role)"
                >
                  {{ getRoleLabel(user.role) }}
                </span>
              </td>
              <td class="px-4 py-4">
                <span
                  class="px-2 py-1 rounded-full text-xs font-medium"
                  :class="user.isActive ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'"
                >
                  {{ user.isActive ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td class="px-4 py-4">
                <div class="flex items-center gap-2">
                  <button
                    @click="editUser(user)"
                    class="p-2 text-gray-400 hover:text-primary-400 transition-colors"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                  </button>
                  <button
                    v-if="user.id !== authStore.user?.id"
                    @click="toggleActive(user)"
                    class="p-2 text-gray-400 hover:text-orange-400 transition-colors"
                    :title="user.isActive ? 'Desactivar' : 'Activar'"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
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
          {{ editingId ? 'Editar usuario' : 'Nuevo usuario' }}
        </h2>

        <form @submit.prevent="saveUser">
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
            <label class="block text-sm font-medium text-gray-400 mb-1">Email *</label>
            <input
              v-model="form.email"
              type="email"
              required
              class="w-full px-4 py-2 bg-surface border border-border rounded-lg text-white focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
            />
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-400 mb-1">
              Contraseña {{ editingId ? '(dejar vacío para no cambiar)' : '*' }}
            </label>
            <input
              v-model="form.password"
              type="password"
              :required="!editingId"
              class="w-full px-4 py-2 bg-surface border border-border rounded-lg text-white focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
            />
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-400 mb-1">Rol *</label>
            <select
              v-model="form.role"
              required
              class="w-full px-4 py-2 bg-surface border border-border rounded-lg text-white focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
            >
              <option value="agent">Agente</option>
              <option value="admin">Administrador</option>
            </select>
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
import { useAuthStore } from '@/stores/auth'
import api from '@/services/api'

const authStore = useAuthStore()

const users = ref([])
const showModal = ref(false)
const backdropMouseDown = ref(false)
const editingId = ref(null)
const saving = ref(false)
const error = ref('')

const form = reactive({
  name: '',
  email: '',
  password: '',
  role: 'agent'
})

function resetForm() {
  form.name = ''
  form.email = ''
  form.password = ''
  form.role = 'agent'
  error.value = ''
}

function getInitials(name) {
  return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'
}

function getRoleLabel(role) {
  const labels = { admin: 'Administrador', agent: 'Agente', client: 'Cliente' }
  return labels[role] || role
}

function getRoleClass(role) {
  const classes = {
    admin: 'bg-purple-900/50 text-purple-300',
    agent: 'bg-blue-900/50 text-blue-300',
    client: 'bg-gray-800 text-gray-300'
  }
  return classes[role] || 'bg-gray-800 text-gray-300'
}

async function loadUsers() {
  try {
    const { data } = await api.get('/users')
    users.value = data.users
  } catch (err) {
    console.error('Error loading users:', err)
  }
}

function editUser(user) {
  editingId.value = user.id
  form.name = user.name
  form.email = user.email
  form.password = ''
  form.role = user.role
  showModal.value = true
}

async function saveUser() {
  saving.value = true
  error.value = ''

  try {
    const payload = {
      name: form.name,
      email: form.email,
      role: form.role
    }

    if (form.password) {
      payload.password = form.password
    }

    if (editingId.value) {
      await api.put(`/users/${editingId.value}`, payload)
    } else {
      await api.post('/users', { ...payload, password: form.password })
    }

    showModal.value = false
    loadUsers()
  } catch (err) {
    error.value = err.response?.data?.error || 'Error al guardar'
  }

  saving.value = false
}

async function toggleActive(user) {
  const action = user.isActive ? 'desactivar' : 'activar'
  if (!confirm(`¿${action.charAt(0).toUpperCase() + action.slice(1)} a ${user.name}?`)) return

  try {
    await api.put(`/users/${user.id}`, { isActive: !user.isActive })
    loadUsers()
  } catch (err) {
    alert(err.response?.data?.error || 'Error al actualizar')
  }
}

onMounted(() => {
  loadUsers()
})
</script>
