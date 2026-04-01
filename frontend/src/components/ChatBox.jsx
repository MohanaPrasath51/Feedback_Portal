import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import api from '../api/axios';
import '../css/ChatBox.css';

const ChatBox = ({ feedbackId, initialMessages, isResolved, currentUser }) => {
  const [messages, setMessages] = useState(initialMessages || []);
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState({}); // { socketId: { userName, role } }
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const scrollEnd = useRef(null);

  const skipNextScroll = useRef(true);

  useEffect(() => {
    setMessages(initialMessages || []);
    // Suppress scroll on initial load or parent sync
    skipNextScroll.current = true;
  }, [initialMessages]);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'https' : 'http';
    const socket = io(`${protocol}://${window.location.hostname}:5000`);
    socketRef.current = socket;

    socket.emit('join_feedback', feedbackId);

    socket.on('receive_message', (newMessage) => {
      setMessages((prev) => {
        if (prev.some(m => m._id && newMessage._id && m._id === newMessage._id)) return prev;
        return [...prev, newMessage];
      });
      // Clear typing indicator for this user if they just sent a message
      setTypingUsers((prev) => {
        const next = { ...prev };
        delete next[newMessage.senderId?._id || newMessage.senderId];
        return next;
      });
    });

    socket.on('user_typing', ({ userId, userName, role }) => {
      setTypingUsers((prev) => ({ ...prev, [userId]: { userName, role } }));
    });

    socket.on('user_stop_typing', ({ userId }) => {
      setTypingUsers((prev) => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
    });

    return () => {
      socket.emit('leave_feedback', feedbackId);
      socket.disconnect();
    };
  }, [feedbackId]);

  useEffect(() => {
    if (skipNextScroll.current) {
      skipNextScroll.current = false;
      return;
    }
    scrollEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers, skipNextScroll]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setContent(val);

    if (socketRef.current && !isResolved) {
      socketRef.current.emit('typing', {
        feedbackId,
        userName: currentUser?.name || 'User',
        role: currentUser?.role
      });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current.emit('stop_typing', feedbackId);
      }, 3000);
    }
  };

  const onSend = async (e) => {
    e.preventDefault();
    if (!content.trim() || isResolved || sending) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      socketRef.current?.emit('stop_typing', feedbackId);
    }

    setSending(true);
    try {
      const { data } = await api.post(`/feedback/${feedbackId}/messages`, { content: content.trim() });
      setMessages((prev) => {
        if (prev.some(m => m._id && data._id && m._id === data._id)) {
          return prev;
        }
        return [...prev, data];
      });
      setContent('');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Chat failed to send.');
    } finally {
      setSending(false);
    }
  };

  const getName = (m, isMe) => {
    if (isMe) return 'You';
    const senderObj = m.senderId;

    if (typeof senderObj === 'object' && senderObj !== null) {
      if (m.senderType === 'Team' || (m.senderType === 'Admin' && senderObj.role === 'team')) {
        return `${senderObj.name} (${senderObj.department || 'Agent'})`;
      } else if (m.senderType === 'Admin') {
        return `${senderObj.name} (Admin)`;
      }
      return senderObj.name;
    }

    if (m.senderType === 'Admin') return 'Platform Admin';
    if (m.senderType === 'Team') return 'Support Agent';
    return 'User';
  };

  return (
    <div className={`portal-chat ${isResolved ? 'is-closed' : ''}`}>
      <div className="chat-viewport">
        {messages.length > 0 ? (
          messages.map((m, i) => {
            const senderObj = m.senderId;
            const senderIdStr = typeof senderObj === 'object' && senderObj !== null ? senderObj._id : senderObj;
            const isMe = senderIdStr === currentUser?._id;

            return (
              <div
                key={i}
                className={`msg-bubble-wrap ${isMe ? 'sent' : 'received'}`}
              >
                <div className="msg-meta">
                  <span className="msg-sender">{getName(m, isMe)}</span>
                  <span className="msg-time">{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="msg-bubble">
                  {m.content}
                </div>
              </div>
            );
          })
        ) : (
          <div className="chat-empty">
            <p>Start a secure conversation about this case.</p>
          </div>
        )}
        {Object.keys(typingUsers).length > 0 && (
          <div className="typing-indicator-pro">
            <div className="dot-pulse" />
            <span>
              {Object.values(typingUsers).map(u => u.userName).join(', ')}
              {Object.keys(typingUsers).length > 1 ? ' are ' : ' is '} typing...
            </span>
          </div>
        )}
        <div ref={scrollEnd} />
      </div>

      {!isResolved ? (
        <form className="chat-input-bar" onSubmit={onSend}>
          <input
            id="chat-message-input"
            name="message"
            aria-label="Write a message"
            type="text"
            className="chat-field"
            placeholder="Write a message..."
            value={content}
            onChange={handleInputChange}
            disabled={sending}
          />
          <button
            type="submit"
            className="chat-send-btn-pro"
            disabled={sending || !content.trim()}
          >
            {sending ? '...' : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            )}
          </button>
        </form>
      ) : (
        <div className="chat-closed-bar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '8px' }}>
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          This case is closed. Chat history is preserved for auditing.
        </div>
      )}
    </div>
  );
};

export default ChatBox;
