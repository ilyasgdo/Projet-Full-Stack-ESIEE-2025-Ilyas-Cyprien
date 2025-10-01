import { describe, it, expect, vi, beforeEach } from 'vitest'
import NotificationService, { 
  addNotification, 
  removeNotification, 
  clearAll,
  notifySuccess,
  notifyError,
  notifyWarning,
  notifyInfo,
  handleApiError,
  useNotifications
} from '@/services/NotificationService'

describe('NotificationService', () => {
  beforeEach(() => {
    // Clear all notifications before each test
    clearAll()
  })

  describe('addNotification', () => {
    it('adds notification to the list', () => {
      addNotification('Test message', 'success')
      
      const { notifications } = useNotifications()
      expect(notifications).toHaveLength(1)
      expect(notifications[0]).toMatchObject({
        message: 'Test message',
        type: 'success'
      })
    })

    it('generates unique id for each notification', () => {
      addNotification('Message 1', 'info')
      addNotification('Message 2', 'warning')
      
      const { notifications } = useNotifications()
      expect(notifications[0].id).not.toBe(notifications[1].id)
    })

    it('defaults to info type when no type is provided', () => {
      addNotification('Test message')
      
      const { notifications } = useNotifications()
      expect(notifications[0].type).toBe('info')
    })

    it('auto-removes notification after timeout', async () => {
      vi.useFakeTimers()
      
      addNotification('Test message', 'success', 1000)
      const { notifications } = useNotifications()
      expect(notifications).toHaveLength(1)
      
      vi.advanceTimersByTime(1000)
      expect(notifications).toHaveLength(0)
      
      vi.useRealTimers()
    })
  })

  describe('removeNotification', () => {
    it('removes notification by id', () => {
      const id1 = addNotification('Message 1', 'info')
      const id2 = addNotification('Message 2', 'warning')
      
      const { notifications } = useNotifications()
      expect(notifications).toHaveLength(2)
      
      removeNotification(id1)
      
      expect(notifications).toHaveLength(1)
      expect(notifications[0].id).toBe(id2)
    })

    it('does nothing when id does not exist', () => {
      addNotification('Test message', 'info')
      const { notifications } = useNotifications()
      const originalLength = notifications.length
      
      removeNotification('non-existent-id')
      
      expect(notifications).toHaveLength(originalLength)
    })
  })

  describe('notifySuccess', () => {
    it('shows success notification', () => {
      notifySuccess('Success message')
      
      const { notifications } = useNotifications()
      expect(notifications[0]).toMatchObject({
        message: 'Success message',
        type: 'success'
      })
    })
  })

  describe('notifyError', () => {
    it('shows error notification', () => {
      notifyError('Error message')
      
      const { notifications } = useNotifications()
      expect(notifications[0]).toMatchObject({
        message: 'Error message',
        type: 'error'
      })
    })
  })

  describe('notifyWarning', () => {
    it('shows warning notification', () => {
      notifyWarning('Warning message')
      
      const { notifications } = useNotifications()
      expect(notifications[0]).toMatchObject({
        message: 'Warning message',
        type: 'warning'
      })
    })
  })

  describe('notifyInfo', () => {
    it('shows info notification', () => {
      notifyInfo('Info message')
      
      const { notifications } = useNotifications()
      expect(notifications[0]).toMatchObject({
        message: 'Info message',
        type: 'info'
      })
    })
  })

  describe('handleApiError', () => {
    it('handles error with userMessage', () => {
      const error = {
        userMessage: 'Custom user message'
      }
      
      handleApiError(error)
      
      const { notifications } = useNotifications()
      expect(notifications[0]).toMatchObject({
        message: 'Custom user message',
        type: 'error'
      })
    })

    it('handles axios error with response data', () => {
      const axiosError = {
        response: {
          data: {
            error: 'API Error Message'
          },
          status: 400
        }
      }
      
      handleApiError(axiosError)
      
      const { notifications } = useNotifications()
      expect(notifications[0]).toMatchObject({
        message: 'API Error Message',
        type: 'error'
      })
    })

    it('handles error with message property', () => {
      const error = {
        message: 'Generic error message'
      }
      
      handleApiError(error)
      
      const { notifications } = useNotifications()
      expect(notifications[0]).toMatchObject({
        message: 'Generic error message',
        type: 'error'
      })
    })

    it('handles unknown error with default message', () => {
      const unknownError = {}
      
      handleApiError(unknownError)
      
      const { notifications } = useNotifications()
      expect(notifications[0]).toMatchObject({
        message: 'Une erreur est survenue',
        type: 'error'
      })
    })

    it('uses custom default message', () => {
      const unknownError = {}
      
      handleApiError(unknownError, 'Custom default message')
      
      const { notifications } = useNotifications()
      expect(notifications[0]).toMatchObject({
        message: 'Custom default message',
        type: 'error'
      })
    })
  })

  describe('clearAll', () => {
    it('clears all notifications', () => {
      addNotification('Message 1', 'info')
      addNotification('Message 2', 'warning')
      
      const { notifications } = useNotifications()
      expect(notifications).toHaveLength(2)
      
      clearAll()
      
      expect(notifications).toHaveLength(0)
    })
  })
})