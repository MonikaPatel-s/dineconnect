import React, { useState, useEffect, useRef } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import '../App.css';

const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead, clearNotifications, isConnected } = useNotification();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showDropdown]);

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    // If rating notification, open rating page
    if (notification.type === 'rating-request' && notification.data?.link) {
      window.location.href = notification.data.link;
    }
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
      case 'rating-request': return '⭐';
      case 'system': return '⚙️';
      default: return '📱';
    }
  };

  return (
    <div className="notification-bell-container" ref={dropdownRef}>
      <button 
        className={`notification-bell ${unreadCount > 0 ? 'has-notifications' : ''}`}
        onClick={() => setShowDropdown(!showDropdown)}
      >
        🔔
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {showDropdown && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            <div style={{display:'flex', gap:'8px', alignItems:'center'}}>
              {notifications.length > 0 && (
                <button 
                  className="clear-all-btn"
                  onClick={clearNotifications}
                >
                  Clear All
                </button>
              )}
              <button 
                onClick={() => setShowDropdown(false)}
                style={{
                  background:'rgba(255,255,255,0.2)',
                  border:'none',
                  cursor:'pointer',
                  fontSize:'18px',
                  color:'#fff',
                  lineHeight:1,
                  width:'28px',
                  height:'28px',
                  borderRadius:'50%',
                  display:'flex',
                  alignItems:'center',
                  justifyContent:'center',
                  flexShrink: 0
                }}
                title="Close"
              >
                ✕
              </button>
            </div>
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
              Status <span style={{
                display:'inline-block',
                width:'8px',
                height:'8px',
                borderRadius:'50%',
                background: isConnected ? '#27ae60' : '#e74c3c',
                marginLeft:'4px',
                marginRight:'4px',
                verticalAlign:'middle'
              }}></span>
              {isConnected ? 'Connected' : 'Disconnected'}
            </small>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;