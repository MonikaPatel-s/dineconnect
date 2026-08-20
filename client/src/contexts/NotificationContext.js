import React, { createContext, useContext, useState, useEffect } from 'react';
import io from 'socket.io-client';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initialize socket connection
    const getSocketUrl = () => {
      if (process.env.REACT_APP_API_URL) {
        return process.env.REACT_APP_API_URL.replace('/api', '');
      }
      const hostname = window.location.hostname;
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:5001';
      }
      return 'https://dineconnect-hbyc.onrender.com';
    };

    const newSocket = io(getSocketUrl(), {
      transports: ['polling', 'websocket'], // polling first — works reliably on Render free tier
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
      timeout: 20000
    });
    
    newSocket.on('connect', () => {
      console.log('🔔 Connected to notification server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('🔔 Disconnected from notification server');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.log('🔔 Connection error:', error);
      setIsConnected(false);
    });

    // Listen for order updates
    newSocket.on('order-update', (data) => {
      console.log('📱 Order update received:', data);
      
      const getStatusMessage = (status, orderNumber) => {
        switch(status) {
          case 'placed':    return `Order #${orderNumber} placed successfully! 🎉`;
          case 'preparing': return `Order #${orderNumber} is being prepared 👨‍🍳`;
          case 'ready':     return `Order #${orderNumber} is ready! Please collect 🍽️`;
          case 'served':    return `Order #${orderNumber} has been served. Enjoy! 😊`;
          case 'canceled':  return `Order #${orderNumber} has been canceled ❌`;
          default:          return data.message || `Order #${orderNumber} updated`;
        }
      };

      addNotification({
        id: Date.now(),
        type: 'order-update',
        title: data.status ? `Order ${data.status.charAt(0).toUpperCase() + data.status.slice(1)}` : 'Order Update',
        message: getStatusMessage(data.status, data.orderNumber),
        data: data,
        timestamp: new Date(),
        read: false
      });
    });

    // Listen for rating request - show after 10 min
    newSocket.on('rating-request', (data) => {
      console.log('⭐ Rating request received:', data);
      // Store for RatingPopup to pick up
      window.__pendingRating = data;
      addNotification({
        id: Date.now(),
        type: 'rating-request',
        title: '⭐ Rate Your Experience',
        message: `How was your meal at Table ${data.tableNumber}? Please rate us!`,
        data: data,
        timestamp: new Date(),
        read: false
      });
    });

    // Listen for new order alerts (for kitchen staff)
    newSocket.on('new-order-alert', (data) => {
      console.log('🍽️ New order alert:', data);
      addNotification({
        id: Date.now(),
        type: 'new-order',
        title: 'New Order!',
        message: `New order #${data.orderNumber} from Table ${data.tableNumber}`,
        data: data,
        timestamp: new Date(),
        read: false
      });
    });

    // Listen for kitchen updates
    newSocket.on('kitchen-update', (data) => {
      console.log('👨‍🍳 Kitchen update:', data);
      addNotification({
        id: Date.now(),
        type: 'kitchen-update',
        title: 'Kitchen Update',
        message: `Order #${data.orderNumber} status: ${data.status}`,
        data: data,
        timestamp: new Date(),
        read: false
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev.slice(0, 9)]); // Keep only 10 notifications
    
    // Show browser notification if permission granted
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.type
      });
    }
  };

  const joinRoom = (role, userId, tableId = null) => {
    if (socket) {
      socket.emit('join-room', { role, userId, tableId });
      console.log(`🏠 Joined room - Role: ${role}, Table: ${tableId}`);
    }
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const value = {
    socket,
    notifications,
    isConnected,
    unreadCount,
    joinRoom,
    markAsRead,
    clearNotifications,
    requestNotificationPermission,
    addNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};