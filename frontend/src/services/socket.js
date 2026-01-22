import { io } from 'socket.io-client'
import { ref } from 'vue'

class SocketService {
  constructor() {
    this.socket = null
    this.connected = ref(false)
  }

  connect(token = null) {
    if (this.socket?.connected) return

    // Production Socket URL - hardcoded for Railway deployment
    const socketUrl = import.meta.env.VITE_API_URL?.replace('/api', '') ||
      (import.meta.env.PROD ? 'https://ticketera-piola-production.up.railway.app' : undefined)

    this.socket = io(socketUrl, {
      auth: token ? { token } : {},
      transports: ['websocket', 'polling']
    })

    this.socket.on('connect', () => {
      console.log('Socket connected')
      this.connected.value = true
    })

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected')
      this.connected.value = false
    })

    this.socket.on('error', (error) => {
      console.error('Socket error:', error)
    })
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.connected.value = false
    }
  }

  joinTicket(ticketId, accessToken = null) {
    if (this.socket) {
      this.socket.emit('join_ticket', { ticketId, accessToken })
    }
  }

  leaveTicket(ticketId) {
    if (this.socket) {
      this.socket.emit('leave_ticket', { ticketId })
    }
  }

  startTyping(ticketId, name) {
    if (this.socket) {
      this.socket.emit('typing_start', { ticketId, name })
    }
  }

  stopTyping(ticketId, name) {
    if (this.socket) {
      this.socket.emit('typing_stop', { ticketId, name })
    }
  }

  onNewMessage(callback) {
    if (this.socket) {
      this.socket.on('new_message', callback)
    }
  }

  onUserTyping(callback) {
    if (this.socket) {
      this.socket.on('user_typing', callback)
    }
  }

  onNotification(callback) {
    if (this.socket) {
      this.socket.on('notification', callback)
    }
  }

  off(event) {
    if (this.socket) {
      this.socket.off(event)
    }
  }
}

export default new SocketService()
