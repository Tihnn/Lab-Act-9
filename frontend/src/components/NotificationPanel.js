import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './NotificationPanel.css';

function NotificationPanel({ userId, userType }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    if (userId) {
      loadNotifications();
      loadUnreadCount();
      
      // Poll for new notifications every 30 seconds
      const interval = setInterval(() => {
        loadNotifications();
        loadUnreadCount();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const loadNotifications = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/api/status/user/${userId}`);
      if (response.data.success) {
        setNotifications(response.data.data || []);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/api/status/unread/${userId}`);
      if (response.data.success) {
        setUnreadCount(response.data.data || 0);
      }
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await axios.put(`http://localhost:3001/api/status/${notificationId}/read`);
      await loadNotifications();
      await loadUnreadCount();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="notification-panel-container" ref={panelRef}>
      <div className="notification-icon" onClick={handleToggle}>
        🔔
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </div>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <span className="unread-count">{unreadCount} new</span>
            )}
          </div>
          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="no-notifications">
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${notification.isRead ? 'read' : 'unread'}`}
                  onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
                >
                  <div className="notification-content">
                    <p className="notification-description">{notification.description}</p>
                    <span className="notification-time">{formatTime(notification.createdAt)}</span>
                  </div>
                  {!notification.isRead && <div className="unread-dot"></div>}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationPanel;
