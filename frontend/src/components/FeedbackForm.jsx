import { useState } from 'react';
import api from '../api/axios';

const Icon = ({ d, size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d={d} />
  </svg>
);

const FeedbackForm = ({ onSuccess }) => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'general',
    priority: 'medium',
    department: 'General Support',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [attachments, setAttachments] = useState([]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = [];

    files.forEach(file => {
      if (file.size > 2 * 1024 * 1024) {
        setError(`File ${file.name} exceeds 2MB limit.`);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachments(prev => [...prev, {
          url: reader.result,
          filename: file.name,
          contentType: file.type
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (idx) => {
    setAttachments(prev => prev.filter((_, i) => i !== idx));
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.title.trim() || !form.description.trim()) {
      setError('Title and description are required.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/feedback', { ...form, attachments });
      onSuccess(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit feedback.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="premium-form">
      {error && <div className="alert alert-error">{error}</div>}

      <div className="form-group">
        <label htmlFor="title">
          <Icon d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" className="field-icon" />
          Feedback Title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          className="input-field premium-input"
          placeholder="e.g., Issue with classroom cleanliness and maintenance"
          value={form.title}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">
          <Icon d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" className="field-icon" />
          Detailed Description
        </label>
        <textarea
          id="description"
          name="description"
          className="input-field premium-input"
          placeholder="Please provide as much detail as possible..."
          value={form.description}
          onChange={handleChange}
          rows={5}
          required
          spellCheck="false"
          data-gramm="false"
        />
      </div>

      <div className="form-group">
        <label htmlFor="department">
          <Icon d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M23 21v-2a4 4 0 0 0-3-3.87 M17 11a4 4 0 1 1-3-3.87" className="field-icon" />
          Assign to Department
        </label>
        <select
          id="department"
          name="department"
          className="input-field premium-input"
          value={form.department}
          onChange={handleChange}
          required
        >
          <option value="General Support">General Support</option>
          <option value="NMC (Internet Issues)">NMC (Internet Issues)</option>
          <option value="Electrical Team">Electrical Team</option>
          <option value="IT Support">IT Support</option>
          <option value="Campus Maintenance">Campus Maintenance</option>
        </select>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="category">
            <Icon d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" className="field-icon" />
            Category
          </label>
          <select
            id="category"
            name="category"
            className="input-field premium-input"
            value={form.category}
            onChange={handleChange}
          >
            <option value="general">General Feedback</option>
            <option value="suggestion">New Suggestion</option>
            <option value="complaint">Bug or Complaint</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="priority">
            <Icon d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" className="field-icon" />
            Priority
          </label>
          <select
            id="priority"
            name="priority"
            className="input-field premium-input"
            value={form.priority}
            onChange={handleChange}
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
        </div>
      </div>

      <div className="form-group attachment-section">
        <label>
          <Icon d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" className="field-icon" />
          Evidence & Proof (Images/Files)
        </label>
        <div className="file-drop-zone">
          <input
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx"
            onChange={handleFileChange}
            id="file-upload"
            className="hidden-file-input"
          />
          <label htmlFor="file-upload" className="file-upload-label">
            <Icon d="M12 4v16m8-8H4" size={20} />
            <span>Select Proof Files</span>
          </label>
        </div>

        {attachments.length > 0 && (
          <div className="attachment-previews">
            {attachments.map((file, i) => (
              <div key={i} className="preview-card">
                {file.contentType.startsWith('image/') ? (
                  <img src={file.url} alt="preview" />
                ) : (
                  <div className="file-type-icon">DOC</div>
                )}
                <button type="button" onClick={() => removeFile(i)} className="remove-file-btn">
                  <Icon d="M18 6L6 18M6 6l12 12" size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-cta btn-full submit-cta" disabled={loading}>
          {loading ? (
            <span className="btn-loading-content">
              <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12" />
              </svg>
              Submitting...
            </span>
          ) : (
            <>
              <Icon d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" size={18} />
              Submit Feedback
            </>
          )}
        </button>
      </div>

      <style>{`
        .premium-form {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .premium-form label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.4rem;
          font-weight: 700;
          font-size: 0.875rem;
          color: var(--text-1);
        }
        .field-icon {
          color: var(--primary);
          opacity: 0.8;
          flex-shrink: 0;
        }
        .premium-input {
          transition: all 0.2s ease;
          border: 1px solid var(--border);
          background: var(--surface-2);
        }
        .premium-input:focus {
          background: var(--surface);
          border-color: var(--primary);
          box-shadow: 0 0 0 3px var(--primary-light);
          transform: translateY(-1px);
        }
        .attachment-section {
          margin-top: 0.75rem;
        }
        .file-drop-zone {
          border: 2px dashed var(--border);
          border-radius: 12px;
          padding: 1rem;
          text-align: center;
          transition: all 0.2s;
          background: var(--surface-2);
        }
        .file-drop-zone:hover {
          border-color: var(--primary);
          background: var(--primary-light);
        }
        .hidden-file-input {
          display: none;
        }
        .file-upload-label {
          cursor: pointer;
          display: flex !important;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-2);
          font-size: 0.85rem;
          margin-bottom: 0 !important;
        }
        .attachment-previews {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(72px, 1fr));
          gap: 0.65rem;
          margin-top: 0.875rem;
        }
        .preview-card {
          position: relative;
          aspect-ratio: 1;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid var(--border);
          background: var(--surface);
        }
        .preview-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .file-type-icon {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.65rem;
          font-weight: 800;
          color: var(--text-3);
        }
        .remove-file-btn {
          position: absolute;
          top: 4px;
          right: 4px;
          background: rgba(239, 68, 68, 0.9);
          color: white;
          border: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-top: 0.5rem;
        }
        .form-actions {
          margin-top: 1.25rem;
        }
        .submit-cta {
          height: 50px;
          font-size: 0.95rem;
        }
        .btn-loading-content {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        /* ── Mobile: ≤ 640px ── */
        @media (max-width: 640px) {
          .form-row {
            grid-template-columns: 1fr;
            gap: 0.5rem;
          }
          .premium-form label {
            font-size: 0.82rem;
          }
          .premium-input {
            font-size: 1rem; /* Prevent mobile zoom-in */
            padding: 0.65rem 0.75rem !important;
          }
          .submit-cta {
            height: 48px;
            font-size: 0.9rem;
          }
          .file-drop-zone {
            padding: 0.875rem;
          }
          .attachment-previews {
            grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
          }
        }
      `}</style>
    </form>
  );
};

export default FeedbackForm;
