import { useState } from 'react';
import api from '../api/axios';

const RequestAccessModal = ({ isOpen, onClose }) => {
  const [form, setForm] = useState({ name: '', email: '', reason: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const { data } = await api.post('/access-requests', form);
      setMessage({ type: 'success', text: 'Request submitted successfully! We will get back to you soon.' });
      setForm({ name: '', email: '', reason: '' });
      setTimeout(() => {
        onClose();
        setMessage({ type: '', text: '' });
      }, 3000);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to submit request. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={ms.overlay} onClick={onClose}>
      <div style={ms.modal} onClick={(e) => e.stopPropagation()}>
        <div style={ms.header}>
          <h2 style={ms.title}>Request Access</h2>
          <button style={ms.closeBtn} onClick={onClose}>&times;</button>
        </div>
        
        <p style={ms.sub}>Apply for an account on the Digital Feedback Portal.</p>

        {message.text && (
          <div style={{
            ...ms.alert,
            backgroundColor: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            borderColor: message.type === 'success' ? '#10b981' : '#ef4444',
            color: message.type === 'success' ? '#10b981' : '#ef4444',
          }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} style={ms.form}>
          <div style={ms.group}>
            <label style={ms.label}>Full Name</label>
            <input
              type="text"
              required
              style={ms.input}
              placeholder="Your Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div style={ms.group}>
            <label style={ms.label}>Work Email</label>
            <input
              type="email"
              required
              style={ms.input}
              placeholder="name@company.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div style={ms.group}>
            <label style={ms.label}>Reason for Access (Optional)</label>
            <textarea
              style={{ ...ms.input, height: '100px', resize: 'none' }}
              placeholder="Tell us why you'd like to join..."
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...ms.submitBtn,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      </div>
    </div>
  );
};

const ms = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modal: {
    backgroundColor: '#0f172a',
    borderRadius: '24px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    width: '100%',
    maxWidth: '500px',
    padding: '2rem',
    position: 'relative',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 800,
    color: '#fff',
    margin: 0,
  },
  sub: {
    color: '#94a3b8',
    fontSize: '0.9rem',
    marginBottom: '2rem',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    fontSize: '2rem',
    lineHeight: 1,
    cursor: 'pointer',
    padding: '0 5px',
  },
  alert: {
    padding: '1rem',
    borderRadius: '12px',
    border: '1px solid',
    marginBottom: '1.5rem',
    fontSize: '0.9rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  group: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.85rem',
    fontWeight: 600,
    color: '#94a3b8',
  },
  input: {
    backgroundColor: '#1e293b',
    border: '1.5px solid #334155',
    borderRadius: '12px',
    padding: '0.75rem 1rem',
    color: '#fff',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  submitBtn: {
    backgroundColor: '#10b981',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    padding: '0.875rem',
    fontSize: '1rem',
    fontWeight: 700,
    marginTop: '0.5rem',
    transition: 'all 0.2s',
  },
};

export default RequestAccessModal;
