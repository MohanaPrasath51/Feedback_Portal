import React, { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../css/NotificationCenter.css';

const Icon = ({ d, size = 18, color = "currentColor", className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d={d} />
  </svg>
);

const NotificationCenter = () => {
  const { userProfile } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchNotes = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchNotes();
    const timer = setInterval(fetchNotes, 20000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const clickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', clickOutside);
    return () => document.removeEventListener('mousedown', clickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleRead = async (id, feedbackId) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
      setIsOpen(false);

      const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'team';
      if (isAdmin) {
        navigate(`/admin/${userProfile.username}/feedback/${feedbackId}`);
      } else {
        navigate(`/feedback/${feedbackId}`);
      }
    } catch (err) { console.error(err); }
  };

  const markAll = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (err) { console.error(err); }
  };

  return (
    <div className="notification-center-wrap" ref={dropdownRef}>
      <button
        className={`note-toggle ${unreadCount > 0 ? 'pulse' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Icon d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0" size={20} />
        {unreadCount > 0 && <span className="note-badge">{unreadCount}</span>}
      </button>

      {isOpen && (
        <div className="note-dropdown shadow-premium">
          <div className="note-header">
            <h4>Activity Feed</h4>
            {unreadCount > 0 && <button onClick={markAll}>Read All</button>}
          </div>

          <div className="note-list">
            {notifications.length > 0 ? (
              notifications.map(n => (
                <div
                  key={n._id}
                  className={`note-item ${n.isRead ? '' : 'unread'}`}
                  onClick={() => handleRead(n._id, n.feedbackId)}
                >
                  <div className="note-icon-box">
                    {n.type === 'status_update' ? (
                      <Icon d="M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4L12 14.01l-3-3" color="var(--success)" size={16} />
                    ) : (
                      <Icon d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" color="var(--primary)" size={16} />
                    )}
                  </div>
                  <div className="note-body">
                    <p className="note-title">{n.title}</p>
                    <p className="note-text">{n.message}</p>
                    <span className="note-date">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  {!n.isRead && <div className="note-dot"></div>}
                </div>
              ))
            ) : (
              <div className="note-empty">Nothing new here.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
