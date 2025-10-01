<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      <TransitionGroup name="notification" tag="div">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          :class="getNotificationClasses(notification.type)"
          class="p-4 rounded-lg shadow-lg border flex items-start gap-3 min-w-0"
        >
          <!-- Icon -->
          <div class="flex-shrink-0 mt-0.5">
            <CheckCircle v-if="notification.type === 'success'" class="h-5 w-5 text-green-600" />
            <XCircle v-else-if="notification.type === 'error'" class="h-5 w-5 text-red-600" />
            <AlertTriangle v-else-if="notification.type === 'warning'" class="h-5 w-5 text-yellow-600" />
            <Info v-else class="h-5 w-5 text-blue-600" />
          </div>
          
          <!-- Message -->
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium break-words">{{ notification.message }}</p>
          </div>
          
          <!-- Close button -->
          <button
            @click="removeNotification(notification.id)"
            class="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X class="h-4 w-4" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-vue-next'
import { useNotifications, removeNotification } from '@/services/NotificationService'

const { notifications: notificationsList } = useNotifications()

const notifications = computed(() => notificationsList)

const getNotificationClasses = (type) => {
  const baseClasses = 'bg-white border-l-4'
  
  switch (type) {
    case 'success':
      return `${baseClasses} border-l-green-500 text-green-800`
    case 'error':
      return `${baseClasses} border-l-red-500 text-red-800`
    case 'warning':
      return `${baseClasses} border-l-yellow-500 text-yellow-800`
    case 'info':
    default:
      return `${baseClasses} border-l-blue-500 text-blue-800`
  }
}
</script>

<style scoped>
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.notification-move {
  transition: transform 0.3s ease;
}
</style>