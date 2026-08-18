import React, { useState } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import '../App.css';

const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead, clearNotifications, isConnected } = useNotification();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return time.toLocaleDateString();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order-update': return '🍽️';
      case 'new-order': return '🔔';
      case 'kitchen-update': return '👨‍🍳';
      case 'system': return '⚙️';
      default: return '📱';
    }
  };

  return (
    <div className="notification-bell-container">
      <button 
        className={`notification-bell ${unreadCount > 0 ? 'has-notifications' : ''}`}
        onClick={() => setShowDropdown(!showDropdown)}
      >
        🔔
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
        <span className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
          {isConnected ? '🟢' : '🔴'}
        </span>
      </button>

      {showDropdown && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            {notifications.length > 0 && (
              <button 
                className="clear-all-btn"
                onClick={clearNotifications}
              >
                Clear All
              </button>
            )}
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="no-notifications">
                <p>No notifications yet</p>
                <small>You'll see updates here</small>
              </div>
            ) : (
              notifications.map(notification => (
                <div 
                  key={notification.id}
                  className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-icon">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="notification-content">
                    <div className="notification-title">
                      {notification.title}
                    </div>
                    <div className="notification-message">
                      {notification.message}
                    </div>
                    <div className="notification-time">
                      {formatTime(notification.timestamp)}
                    </div>
                  </div>
                  {!notification.read && (
                    <div className="unread-indicator"></div>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="notification-footer">
            <small>
              Status: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
            </small>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;