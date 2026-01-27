<template>
  <StaffLayout page-title="Clientes">
    <div class="max-w-4xl">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <p class="text-gray-500">Administra los clientes/empresas para asignar a tickets</p>
        <button
          @click="showModal = true; editingId = null; resetForm()"
          class="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          + Nuevo cliente
        </button>
      </div>

      <!-- Search -->
      <div class="mb-4">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar cliente..."
          class="w-full md:w-80 px-4 py-2 bg-surface border border-border rounded-lg text-white focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
          @input="loadClients"
        />
      </div>

      <!-- List -->
      <div class="bg-background-secondary/50 backdrop-blur-sm rounded-xl border border-border divide-y divide-border">
        <div
          v-for="client in clients"
          :key="client.id"
          class="p-4 flex items-center gap-4 hover:bg-surface-hover"
        >
          <div class="w-10 h-10 bg-primary-900 text-primary-400 rounded-full flex items-center justify-center font-medium">
            {{ getInitials(client.name) }}
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="font-medium text-white truncate">{{ client.name }}</h3>
            <p class="text-sm text-gray-500 truncate">
              {{ client.email || 'Sin email' }}
              <span v-if="client.contactPerson"> - {{ client.contactPerson }}</span>
            </p>
          </div>
          <span
            class="px-2 py-1 rounded text-xs hidden sm:inline"
            :class="client.isActive ? 'bg-green-900/50 text-green-300' : 'bg-gray-800 text-gray-400'"
          >
            {{ client.isActive ? 'Activo' : 'Inactivo' }}
          </span>
          <div class="flex items-center gap-2">
            <button
              @click="editClient(client)"
              class="p-2 text-gray-400 hover:text-primary-400 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
            </button>
            <button
              @click="deleteClient(client)"
              class="p-2 text-gray-400 hover:text-red-400 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
          </div>
        </div>

        <div v-if="clients.length === 0" class="p-8 text-center text-gray-500">
          No hay clientes
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
      <div class="bg-background-tertiary rounded-xl border border-border shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <h2 class="text-xl font-semibold text-white mb-4">
          {{ editingId ? 'Editar cliente' : 'Nuevo cliente' }}
        </h2>

        <form @submit.prevent="saveClient">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-400 mb-1">Nombre *</label>
            <input
              v-model="form.name"
              type="text"
              required
              class="w-full px-4 py-2 bg-surface border border-border rounded-lg text-white focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
              placeholder="Nombre de la empresa"
            />
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-400 mb-1">Email</label>
            <input
              v-model="form.email"
              type="email"
              class="w-full px-4 py-2 bg-surface border border-border rounded-lg text-white focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
              placeholder="contacto@empresa.com"
            />
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-400 mb-1">Telefono</label>
            <input
              v-model="form.phone"
              type="tel"
              class="w-full px-4 py-2 bg-surface border border-border rounded-lg text-white focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
              placeholder="+54 11 1234-5678"
            />
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-400 mb-1">Persona de contacto</label>
            <input
              v-model="form.contactPerson"
              type="text"
              class="w-full px-4 py-2 bg-surface border border-border rounded-lg text-white focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
              placeholder="Nombre del contacto principal"
            />
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-400 mb-1">Direccion</label>
            <textarea
              v-model="form.address"
              rows="2"
              class="w-full px-4 py-2 bg-surface border border-border rounded-lg text-white focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
              placeholder="Direccion completa"
            />
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-400 mb-1">Notas</label>
            <textarea
              v-model="form.notes"
              rows="2"
              class="w-full px-4 py-2 bg-surface border border-border rounded-lg text-white focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
              placeholder="Notas internas sobre el cliente"
            />
          </div>

          <div v-if="editingId" class="mb-4">
            <label class="flex items-center gap-2">
              <input
                type="checkbox"
                v-model="form.isActive"
                class="rounded border-border bg-surface text-primary-500 focus:ring-primary-500/50"
              />
              <span class="text-sm text-gray-400">Cliente activo</span>
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

const clients = ref([])
const showModal = ref(false)
const backdropMouseDown = ref(false)
const editingId = ref(null)
const saving = ref(false)
const error = ref('')
const searchQuery = ref('')

const form = reactive({
  name: '',
  email: '',
  phone: '',
  address: '',
  contactPerson: '',
  notes: '',
  isActive: true
})

function getInitials(name) {
  return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'
}

function resetForm() {
  form.name = ''
  form.email = ''
  form.phone = ''
  form.address = ''
  form.contactPerson = ''
  form.notes = ''
  form.isActive = true
  error.value = ''
}

async function loadClients() {
  try {
    const params = {}
    if (searchQuery.value) params.search = searchQuery.value
    const { data } = await api.get('/clients', { params })
    clients.value = data.clients
  } catch (err) {
    console.error('Error loading clients:', err)
  }
}

function editClient(client) {
  editingId.value = client.id
  form.name = client.name
  form.email = client.email || ''
  form.phone = client.phone || ''
  form.address = client.address || ''
  form.contactPerson = client.contactPerson || ''
  form.notes = client.notes || ''
  form.isActive = client.isActive
  showModal.value = true
}

async function saveClient() {
  saving.value = true
  error.value = ''

  try {
    if (editingId.value) {
      await api.put(`/clients/${editingId.value}`, form)
    } else {
      await api.post('/clients', form)
    }

    showModal.value = false
    loadClients()
  } catch (err) {
    error.value = err.response?.data?.error || 'Error al guardar'
  }

  saving.value = false
}

async function deleteClient(client) {
  if (!confirm(`Eliminar el cliente "${client.name}"?`)) return

  try {
    await api.delete(`/clients/${client.id}`)
    loadClients()
  } catch (err) {
    alert(err.response?.data?.error || 'Error al eliminar')
  }
}

onMounted(() => {
  loadClients()
})
</script>
