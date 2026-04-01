import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import api from '../api/axios';
import '../css/AdminFeedbackDetail.css'; // Re-using the premium admin styling
import '../css/FeedbackDetailPage.css';
import { useAuth } from '../context/AuthContext';
import ChatBox from '../components/ChatBox';
import MediaViewer from '../components/MediaViewer';

const Icon = ({ d, size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d={d} />
  </svg>
);

const StatusBadge = ({ status }) => {
  const map = {
    pending: 'badge-pending',
    'in-review': 'badge-in-review',
    resolved: 'badge-resolved',
  };
  return (
    <span className={`badge ${map[status] || 'badge-default'}`}>
      {status?.replace('-', ' ') || 'unknown'}
    </span>
  );
};

const Tag = ({ children, icon, color = 'var(--primary)', bg = 'var(--primary-light)' }) => (
  <span className="premium-tag" style={{ background: bg, color }}>
    {icon && <span className="tag-icon">{icon}</span>}
    {children}
  </span>
);

const FeedbackDetailPage = () => {
  const { userProfile } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', description: '' });
  const [error, setError] = useState('');
  const [selectedMedia, setSelectedMedia] = useState(null);

  useEffect(() => {
    fetchFeedback();
  }, [id]);

  const fetchFeedback = () => {
    api.get(`/feedback/${id}`)
      .then(({ data }) => {
        setFeedback(data);
        setForm({ title: data.title, description: data.description });
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load feedback.'))
      .finally(() => setLoading(false));
  };

  const handleUpdate = async () => {
    setSaving(true);
    setError('');
    try {
      const { data } = await api.put(`/feedback/${id}`, form);
      setFeedback(data);
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update feedback.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this feedback? This action cannot be undone.')) return;
    setSaving(true);
    try {
      await api.delete(`/feedback/${id}`);
      navigate('/home');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete feedback.');
      setSaving(false);
    }
  };

  const fmt = (d) =>
    new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const fmtFull = (d) =>
    new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <DashboardLayout
      activeTab="__detail__"
      setActiveTab={() => { }}
      navItems={[]}
      title={isEditing ? 'Editing Report' : 'Submission Summary'}
    >
      {loading && <div className="spinner" />}

      {!loading && feedback && (
        <div className="detail-page-root">
          <div className="detail-primary-layout">
            <div className="detail-column-master">
              <div className="card investigation-card">
                <div className="card-flare-top" />
                <div className="investigation-header">
                  <div className="header-text-block">
                    {isEditing ? (
                      <div className="input-field-group-pro" style={{ marginBottom: '1.5rem' }}>
                        <label htmlFor="edit-title" className="pro-field-label">Subject Headline</label>
                        <input
                          id="edit-title"
                          name="title"
                          className="pro-select"
                          value={form.title}
                          onChange={(e) => setForm({ ...form, title: e.target.value })}
                          placeholder="What is the main concern?"
                        />
                      </div>
                    ) : (
                      <>
                        <h1 className="investigation-title">{feedback.title}</h1>
                        <div className="investigation-meta">
                          <span className="meta-timestamp-pro">Reference ID: #{feedback._id.substring(19)}</span>
                          <span className="meta-divider-pro">·</span>
                          <span className="meta-timestamp-pro">Submitted {fmt(feedback.createdAt)}</span>
                        </div>
                        {feedback.isDuplicate && (
                          <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#E0E7FF', color: '#4338CA', borderRadius: '8px', border: '1px solid #C7D2FE', fontSize: '0.875rem', fontWeight: 500 }}>
                            🔗 This submission was identified as a duplicate and has been merged with an active investigation.
                          </div>
                        )}
                        {feedback.duplicateCount > 0 && (
                          <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#FEF3C7', color: '#D97706', borderRadius: '8px', border: '1px solid #FCD34D', fontSize: '0.875rem', fontWeight: 600 }}>
                            🔥 This is a major issue reported by {feedback.duplicateCount + 1} users.
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  {!isEditing && (
                    <div className="header-status-column">
                      <StatusBadge status={feedback.status} />
                    </div>
                  )}
                </div>

                <div className="investigation-tags-row">
                  {feedback.category && <Tag icon="📁">{feedback.category}</Tag>}
                  {feedback.priority && (
                    <Tag bg="var(--warning-bg)" color="#92400E" icon="⚡">{feedback.priority} priority</Tag>
                  )}
                  {feedback.department && <Tag bg="var(--primary-light)" color="var(--primary)" icon="🏢">{feedback.department}</Tag>}
                </div>

                <div className="investigation-section">
                  <label htmlFor="edit-description" className="section-label-pro" style={{ display: 'block', cursor: 'pointer' }}>
                    {isEditing ? 'Update Detailed Account' : 'Submission Narrative'}
                  </label>
                  {isEditing ? (
                    <textarea
                      id="edit-description"
                      name="description"
                      className="pro-textarea"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Provide full details of your request or issue..."
                      rows={8}
                    />
                  ) : (
                    <div className="submission-content-text">{feedback.description}</div>
                  )}
                </div>

                {feedback.status === 'resolved' && feedback.adminResponse && (
                  <div className="investigation-section official-response-section">
                    <h3 className="section-label-pro" style={{ color: 'var(--success)', fontWeight: 800 }}>
                      Official Admin Resolution
                    </h3>
                    <div className="submission-content-text" style={{ borderLeft: '4px solid var(--success)', backgroundColor: 'var(--success-bg-light, rgba(16, 185, 129, 0.05))' }}>
                      {feedback.adminResponse}
                      <div className="resolver-attribution" style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1rem', fontSize: '0.85rem', color: 'var(--text-3)' }}>
                        Resolved by <strong>{feedback.resolvedBy?.department || feedback.resolvedBy?.name || 'Administrator'}</strong> 
                        <span style={{ margin: '0 0.5rem' }}>•</span>
                        {new Date(feedback.resolvedAt || feedback.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                )}

                {feedback.attachments?.length > 0 && (
                  <div className="investigation-section">
                    <h3 className="section-label-pro">Uploaded Attachments</h3>
                    <div className="attachments-grid-pro">
                      {feedback.attachments.map((file, idx) => (
                        <div
                          key={idx}
                          role="button"
                          onClick={() => setSelectedMedia(file)}
                          className="attachment-pill-pro"
                          style={{ cursor: 'pointer' }}
                        >
                          {file.contentType?.startsWith('image/') ? (
                            <img src={file.url} alt="attachment" className="pill-img-pro" />
                          ) : (
                            <Icon d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8" size={16} />
                          )}
                          <div className="pill-info-pro">
                            <span className="pill-filename">{file.filename || `File ${idx + 1}`}</span>
                            <span className="pill-type">{file.contentType?.split('/')[1]?.toUpperCase() || 'FILE'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="investigation-section" style={{ marginTop: '2rem' }}>
                  <h3 className="section-label-pro">Interactive Support Chat</h3>
                  <ChatBox
                    feedbackId={feedback._id}
                    initialMessages={feedback.messages}
                    isResolved={feedback.status === 'resolved'}
                    currentUser={userProfile}
                  />
                </div>

                {feedback.status === 'resolved' && (
                  <div className="resolution-audit-card">
                    <div className="audit-icon"><Icon d="M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4L12 14.01l-3-3" size={20} /></div>
                    <div className="audit-text">
                      <strong>Resolution Certified</strong>
                      <span>Case marked as resolved on {fmtFull(feedback.resolvedAt || feedback.updatedAt)} by {feedback.resolvedBy?.department || feedback.resolvedBy?.name || 'Administrator'}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <aside className="detail-column-side">
              <div className="card control-panel-pro">
                <h3 className="panel-title-pro">Submission Status</h3>
                <p className="panel-desc-pro">Track the progress of your submission or manage your record.</p>

                {error && <div className="alert alert-error pro-alert-box">{error}</div>}

                <div className="control-form-pro">
                  <div className="info-log-item">
                    <span className="info-log-lbl">Current State</span>
                    <div style={{ marginTop: '0.5rem' }}>
                      <StatusBadge status={feedback.status} />
                    </div>
                  </div>

                  <div className="control-actions-pro" style={{ marginTop: '2rem' }}>
                    {isEditing ? (
                      <>
                        <button className="btn btn-cta btn-full-sh" onClick={handleUpdate} disabled={saving}>
                          {saving ? 'Syncing...' : 'Confirm Changes'}
                          <Icon d="M5 13l4 4L19 7" size={16} />
                        </button>
                        <button className="btn btn-ghost btn-full-sh" onClick={() => setIsEditing(false)} disabled={saving}>
                          Discard Changes
                        </button>
                      </>
                    ) : (
                      <>
                        {feedback.status === 'pending' ? (
                          <>
                            <button className="btn btn-primary btn-full-sh" onClick={() => setIsEditing(true)}>
                              <Icon d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" size={16} />
                              Edit Record
                            </button>
                            <button className="btn btn-danger btn-full-sh" onClick={handleDelete} disabled={saving}>
                              <Icon d="M19 7l-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v3" size={16} />
                              Delete Submission
                            </button>
                          </>
                        ) : (
                          <div className="locked-notice">
                            <Icon d="M12 11V7a4 4 0 0 1 8 0v4h1a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h1z" size={16} />
                            Submission Locked - {feedback.status === 'resolved' ? 'Case Resolved' : 'Under Investigation'}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="card-sm" style={{ marginTop: '1.5rem', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.25rem' }}>
                <h4 style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: '0.75rem' }}>Submission Integrity</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-3)', lineHeight: 1.5 }}>
                  Records are immutable once investigation begins to maintain structural data audit trails.
                </p>
              </div>
            </aside>
          </div>
        </div>
      )}

      {selectedMedia && (
        <MediaViewer media={selectedMedia} onClose={() => setSelectedMedia(null)} />
      )}
    </DashboardLayout>
  );
};

export default FeedbackDetailPage;
