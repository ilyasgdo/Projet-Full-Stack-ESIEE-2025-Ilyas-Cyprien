import { ref } from 'vue'

// État global des notifications
const notifications = ref([])
let notificationId = 0

export const useNotifications = () => {
  return {
    notifications: notifications.value,
    addNotification,
    removeNotification,
    clearAll
  }
}

export const addNotification = (message, type = 'info', duration = 5000) => {
  const id = ++notificationId
  const notification = {
    id,
    message,
    type, // 'success', 'error', 'warning', 'info'
    timestamp: Date.now(),
    duration
  }
  
  notifications.value.push(notification)
  
  // Auto-suppression après la durée spécifiée
  if (duration > 0) {
    setTimeout(() => {
      removeNotification(id)
    }, duration)
  }
  
  return id
}

export const removeNotification = (id) => {
  const index = notifications.value.findIndex(n => n.id === id)
  if (index > -1) {
    notifications.value.splice(index, 1)
  }
}

export const clearAll = () => {
  notifications.value.splice(0)
}

// Méthodes de convenance
export const notifySuccess = (message, duration = 4000) => {
  return addNotification(message, 'success', duration)
}

export const notifyError = (message, duration = 6000) => {
  return addNotification(message, 'error', duration)
}

export const notifyWarning = (message, duration = 5000) => {
  return addNotification(message, 'warning', duration)
}

export const notifyInfo = (message, duration = 4000) => {
  return addNotification(message, 'info', duration)
}

// Gestion spécifique des erreurs API
export const handleApiError = (error, defaultMessage = 'Une erreur est survenue') => {
  let message = defaultMessage
  
  if (error.userMessage) {
    message = error.userMessage
  } else if (error.response?.data?.error) {
    message = error.response.data.error
  } else if (error.message) {
    message = error.message
  }
  
  return notifyError(message)
}

export default {
  useNotifications,
  addNotification,
  removeNotification,
  clearAll,
  notifySuccess,
  notifyError,
  notifyWarning,
  notifyInfo,
  // Aliases for convenience used across views
  success: notifySuccess,
  error: notifyError,
  warning: notifyWarning,
  info: notifyInfo,
  handleApiError
}