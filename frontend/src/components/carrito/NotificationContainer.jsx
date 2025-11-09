import useNotificationStore from '../../store/notificationStore'
import Notification from './Notification'

const NotificationContainer = () => {
  const { notifications, removeNotification } = useNotificationStore()

  return (
    <div className="notification-container">
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          message={notification.message}
          type={notification.type}
          duration={notification.duration}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  )
}

export default NotificationContainer