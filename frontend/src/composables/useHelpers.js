export function useHelpers() {
  const statusLabels = {
    new: 'Nuevo',
    in_progress: 'En Progreso',
    waiting: 'En Espera',
    resolved: 'Resuelto',
    closed: 'Cerrado'
  }

  const priorityLabels = {
    low: 'Baja',
    medium: 'Media',
    high: 'Alta',
    urgent: 'Urgente'
  }

  const statusColors = {
    new: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    waiting: 'bg-purple-100 text-purple-800',
    resolved: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800'
  }

  const priorityColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800'
  }

  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

  function getStatusLabel(status) {
    return statusLabels[status] || status
  }

  function getPriorityLabel(priority) {
    return priorityLabels[priority] || priority
  }

  function getStatusClass(status) {
    return statusColors[status] || 'bg-gray-100 text-gray-800'
  }

  function getPriorityClass(priority) {
    return priorityColors[priority] || 'bg-gray-100 text-gray-800'
  }

  function getDayName(dayOfWeek) {
    return dayNames[dayOfWeek] || ''
  }

  function formatDate(date, options = {}) {
    if (!date) return '-'
    const d = new Date(date)

    const defaultOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      ...options
    }

    return d.toLocaleDateString('es-ES', defaultOptions)
  }

  function formatDateTime(date) {
    if (!date) return '-'
    const d = new Date(date)

    return d.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  function formatTime(date) {
    if (!date) return '-'
    const d = new Date(date)

    return d.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  function timeAgo(date) {
    if (!date) return ''

    const now = new Date()
    const d = new Date(date)
    const diff = now - d
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Ahora'
    if (minutes < 60) return `Hace ${minutes}m`
    if (hours < 24) return `Hace ${hours}h`
    if (days < 7) return `Hace ${days}d`
    if (days < 30) return `Hace ${Math.floor(days / 7)} semanas`

    return formatDate(date)
  }

  function formatHours(hours) {
    if (hours < 24) return `${hours}h`
    const days = Math.floor(hours / 24)
    const remainingHours = hours % 24
    if (remainingHours === 0) return `${days}d`
    return `${days}d ${remainingHours}h`
  }

  return {
    getStatusLabel,
    getPriorityLabel,
    getStatusClass,
    getPriorityClass,
    getDayName,
    formatDate,
    formatDateTime,
    formatTime,
    timeAgo,
    formatHours,
    statusLabels,
    priorityLabels
  }
}
