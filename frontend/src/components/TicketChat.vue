<template>
  <div class="flex flex-col h-full bg-background-secondary/50 backdrop-blur-sm rounded-xl border border-border">
    <!-- Chat header -->
    <div class="flex items-center justify-between px-4 py-3 border-b border-border">
      <h3 class="font-semibold text-white">Conversacion</h3>
      <span v-if="typingUser" class="text-sm text-gray-500 italic">
        {{ typingUser }} esta escribiendo...
      </span>
    </div>

    <!-- Messages -->
    <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-4">
      <div
        v-for="message in messages"
        :key="message.id"
        class="flex"
        :class="isOwnMessage(message) ? 'justify-end' : 'justify-start'"
      >
        <div
          class="max-w-[70%] rounded-lg px-4 py-2"
          :class="[
            isOwnMessage(message)
              ? 'bg-primary-500 text-white'
              : message.isInternal
                ? 'bg-yellow-500/20 text-yellow-200 border border-yellow-500/30'
                : 'bg-surface text-gray-200'
          ]"
        >
          <!-- Sender name -->
          <p class="text-xs font-medium mb-1 flex items-center gap-2" :class="isOwnMessage(message) ? 'text-primary-100' : 'text-gray-400'">
            <template v-if="isOwnMessage(message)">
              Tú
            </template>
            <template v-else>
              <!-- Agent/Staff message -->
              <span class="flex items-center gap-1.5">
                <svg class="w-3.5 h-3.5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
                </svg>
                {{ message.user?.name || message.senderName || 'Soporte' }}
                <span class="px-1.5 py-0.5 text-[10px] bg-green-500/20 text-green-400 rounded-full font-medium">
                  Soporte
                </span>
              </span>
            </template>
            <span v-if="message.isInternal" class="ml-1 text-yellow-400">(Nota interna)</span>
          </p>

          <!-- Content -->
          <p class="whitespace-pre-wrap break-words">{{ message.content }}</p>

          <!-- Time -->
          <p class="text-xs mt-1" :class="isOwnMessage(message) ? 'text-primary-200' : 'text-gray-500'">
            {{ formatTime(message.createdAt) }}
          </p>
        </div>
      </div>

      <div v-if="messages.length === 0" class="text-center text-gray-500 py-8">
        No hay mensajes aun
      </div>
    </div>

    <!-- Input -->
    <div class="border-t border-border p-4">
      <!-- Internal note toggle (staff only) -->
      <div v-if="isStaff" class="flex items-center gap-2 mb-2">
        <label class="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
          <input
            type="checkbox"
            v-model="isInternal"
            class="rounded border-border text-primary-500 focus:ring-primary-500/50"
          />
          <span>Nota interna (no visible para el cliente)</span>
        </label>
      </div>

      <div class="flex gap-2">
        <textarea
          v-model="newMessage"
          @keydown.enter.exact.prevent="sendMessage"
          @input="handleTyping"
          placeholder="Escribe tu mensaje..."
          rows="2"
          class="flex-1 resize-none rounded-lg bg-surface border border-border text-white px-3 py-2 focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
        />
        <button
          @click="sendMessage"
          :disabled="!newMessage.trim() || sending"
          class="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <svg v-if="sending" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
          </svg>
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import api from '@/services/api'
import socketService from '@/services/socket'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({
  ticketId: {
    type: [Number, String],
    required: true
  },
  accessToken: {
    type: String,
    default: null
  },
  ticketNumber: {
    type: String,
    default: null
  },
  clientName: {
    type: String,
    default: ''
  }
})

const authStore = useAuthStore()
const messagesContainer = ref(null)
const messages = ref([])
const newMessage = ref('')
const isInternal = ref(false)
const sending = ref(false)
const typingUser = ref(null)
const typingTimeout = ref(null)

const isStaff = ref(!!authStore.user && ['admin', 'agent'].includes(authStore.user.role))

async function fetchMessages() {
  try {
    let params = {}
    if (props.accessToken) {
      params.token = props.accessToken
    } else if (props.ticketNumber) {
      params.ticketNumber = props.ticketNumber
    }
    const { data } = await api.get(`/messages/${props.ticketId}`, { params })
    messages.value = data.messages
    scrollToBottom()
  } catch (error) {
    console.error('Error fetching messages:', error)
  }
}

async function sendMessage() {
  if (!newMessage.value.trim() || sending.value) return

  sending.value = true

  try {
    let endpoint = '/messages'
    if (props.accessToken) {
      endpoint += `?token=${props.accessToken}`
    } else if (props.ticketNumber) {
      endpoint += `?ticketNumber=${props.ticketNumber}`
    }
    const payload = {
      ticketId: props.ticketId,
      content: newMessage.value.trim(),
      isInternal: isStaff.value && isInternal.value
    }

    const { data } = await api.post(endpoint, payload)

    // Message will be added via socket, but add immediately for responsiveness
    if (!messages.value.find(m => m.id === data.message.id)) {
      messages.value.push(data.message)
    }

    newMessage.value = ''
    isInternal.value = false
    scrollToBottom()

    // Stop typing indicator
    socketService.stopTyping(props.ticketId, props.clientName || authStore.user?.name)
  } catch (error) {
    console.error('Error sending message:', error)
    alert('Error al enviar mensaje')
  } finally {
    sending.value = false
  }
}

function handleTyping() {
  const name = props.clientName || authStore.user?.name || 'Usuario'

  socketService.startTyping(props.ticketId, name)

  // Clear existing timeout
  if (typingTimeout.value) {
    clearTimeout(typingTimeout.value)
  }

  // Stop typing after 2 seconds of inactivity
  typingTimeout.value = setTimeout(() => {
    socketService.stopTyping(props.ticketId, name)
  }, 2000)
}

function isOwnMessage(message) {
  // Staff viewing: check if message was sent by current staff user
  if (authStore.user) {
    return message.userId === authStore.user.id
  }
  // Client viewing (public access): all client messages are "own" messages
  // since the client is viewing their own ticket
  if (props.accessToken || props.ticketNumber) {
    return message.senderType === 'client'
  }
  return false
}

function formatTime(date) {
  return new Date(date).toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

function handleNewMessage(data) {
  if (data.ticketId === Number(props.ticketId)) {
    if (!messages.value.find(m => m.id === data.message.id)) {
      messages.value.push(data.message)
      scrollToBottom()
    }
  }
}

function handleUserTyping(data) {
  if (data.ticketId === Number(props.ticketId)) {
    const currentName = props.clientName || authStore.user?.name
    if (data.name !== currentName) {
      if (data.isTyping) {
        typingUser.value = data.name
      } else {
        typingUser.value = null
      }
    }
  }
}

onMounted(() => {
  fetchMessages()

  // Connect socket and join room
  socketService.connect(authStore.token)
  socketService.joinTicket(props.ticketId, props.accessToken || props.ticketNumber)

  // Listen for events
  socketService.onNewMessage(handleNewMessage)
  socketService.onUserTyping(handleUserTyping)
})

onUnmounted(() => {
  socketService.leaveTicket(props.ticketId)
  socketService.off('new_message')
  socketService.off('user_typing')

  if (typingTimeout.value) {
    clearTimeout(typingTimeout.value)
  }
})

watch(() => props.ticketId, () => {
  fetchMessages()
  socketService.joinTicket(props.ticketId, props.accessToken || props.ticketNumber)
})
</script>
