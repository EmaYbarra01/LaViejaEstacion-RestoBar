import { create } from 'zustand'

const useCartStore = create((set, get) => ({
  // Estado inicial
  items: [],
  total: 0,

  // Acciones
  addItem: (product, showNotification = null) => {
    const { items } = get()
    const existingItem = items.find(item => item.id === product.id)

    if (existingItem) {
      set({
        items: items.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      })
      if (showNotification) {
        showNotification(`Se agregó una unidad más de ${product.name}`, 'success')
      }
    } else {
      set({
        items: [...items, { ...product, quantity: 1 }]
      })
      if (showNotification) {
        showNotification(`${product.name} agregado al carrito`, 'success')
      }
    }

    // Recalcular total
    get().calculateTotal()
  },

  removeItem: (productId, showNotification = null) => {
    const { items } = get()
    const removedItem = items.find(item => item.id === productId)
    
    set({
      items: items.filter(item => item.id !== productId)
    })
    
    if (showNotification && removedItem) {
      showNotification(`${removedItem.name} eliminado del carrito`, 'info')
    }
    
    get().calculateTotal()
  },

  updateQuantity: (productId, quantity) => {
    const { items } = get()
    if (quantity <= 0) {
      get().removeItem(productId)
      return
    }

    set({
      items: items.map(item =>
        item.id === productId
          ? { ...item, quantity }
          : item
      )
    })
    get().calculateTotal()
  },

  clearCart: (showNotification = null) => {
    set({
      items: [],
      total: 0
    })
    
    if (showNotification) {
      showNotification('Carrito vaciado', 'info')
    }
  },

  calculateTotal: () => {
    const { items } = get()
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    set({ total })
  },

  getItemsCount: () => {
    const { items } = get()
    return items.reduce((count, item) => count + item.quantity, 0)
  }
}))

export default useCartStore