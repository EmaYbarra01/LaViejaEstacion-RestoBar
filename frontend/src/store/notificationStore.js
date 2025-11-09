import { create } from 'zustand'

const useNotificationStore = create((set, get) => ({
  notifications: [],

  addNotification: (message, type = 'success', duration = 3000) => {
    const id = Date.now()
    const notification = {
      id,
      message,
      type,
      duration
    }

    set((state) => ({
      notifications: [...state.notifications, notification]
    }))

    return id
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter(notification => notification.id !== id)
    }))
  },

  clearAllNotifications: () => {
    set({ notifications: [] })
  }
}))

export default useNotificationStore