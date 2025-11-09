import { useState, useEffect } from 'react'
import './Notification.css'

const Notification = ({ message, type = 'success', duration = 1000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => {
        onClose()
      }, 300) // Tiempo para la animación de salida
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  if (!isVisible) return null

  return (
    <div className={`notification ${type} ${isVisible ? 'show' : 'hide'}`}>
      <div className="notification-content">
        <span className="notification-icon">
          {type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}
        </span>
        <span className="notification-message">{message}</span>
        <button 
          className="notification-close"
          onClick={() => {
            setIsVisible(false)
            setTimeout(onClose, 300)
          }}
        >
          ✕
        </button>
      </div>
    </div>
  )
}

export default Notification