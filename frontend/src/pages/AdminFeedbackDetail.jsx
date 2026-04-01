import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import api from '../api/axios';
import '../css/AdminFeedbackDetail.css';
import ChatBox from '../components/ChatBox';
import { useAuth } from '../context/AuthContext';
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



const AdminFeedbackDetail = () => {
  const { userProfile } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [form, setForm] = useState({
    status: '',
    adminResponse: '',
    department: '',
    title: '',
    description: '',
    category: '',
    priority: ''
  });

  const detailTitle = userProfile?.role === 'team'
    ? `${userProfile.department} Investigation`
    : 'Request Investigation';

  useEffect(() => {
    api.get(`/feedback/${id}`)
      .then(({ data }) => {
        setFeedback(data);
        setForm({
          status: data.status,
          adminResponse: data.adminResponse || '',
          department: data.department || '',
          title: data.title || '',
          description: data.description || '',
          category: data.category || '',
          priority: data.priority || ''
        });
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load feedback.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await api.put(`/feedback/${id}`, form);
      setFeedback(data);
      setToast('Changes saved successfully!');
      setTimeout(() => setToast(''), 3500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this feedback? This cannot be undone.')) return;
    try {
      await api.delete(`/feedback/${id}`);
      navigate(`/admin/${userProfile.username}`);
    } catch {
      setError('Failed to delete feedback.');
    }
  };

  const handleRequestAccess = async () => {
      try {
          await api.post(`/feedback/${id}/request-chat`);
          setToast('Chat access requested successfully!');
          setTimeout(() => setToast(''), 3000);
          // Refresh feedback to show pending state
          const { data } = await api.get(`/feedback/${id}`);
          setFeedback(data);
      } catch (err) {
          setError(err.response?.data?.message || 'Access request failed.');
      }
  };

  const handleGrantAccess = async (userId) => {
      try {
          await api.post(`/feedback/${id}/grant-chat`, { userId });
          setToast('Access granted to team member!');
          setTimeout(() => setToast(''), 3000);
          const { data } = await api.get(`/feedback/${id}`);
          setFeedback(data);
      } catch (err) {
          setError('Failed to grant access.');
      }
  };

  const fmt = (d) =>
    new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const fmtFull = (d) =>
    new Date(d).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

  return (
    <DashboardLayout
      activeTab="__detail__"
      setActiveTab={() => { }}
      navItems={[]}
      title={detailTitle}
    >
      {toast && (
        <div className="toast-notification">
          <div className="alert alert-success premium-alert">
            <Icon d="M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4L12 14.01l-3-3" size={18} />
            {toast}
          </div>
        </div>
      )}

      {loading && <div className="spinner" />}

      {!loading && feedback && (
        <div className="detail-page-root">
          <div className="detail-primary-layout">
            <div className="detail-column-master">
              <div className="card investigation-card">
                <div className="card-flare-top" />
                <div className="investigation-header">
                  <div className="header-text-block">
                    <h1 className="investigation-title">{feedback.title}</h1>
                    <div className="investigation-meta">
                      <div className="meta-user-pro">
                        <div className="avatar-mini-pro">{(feedback.submittedBy?.name || 'U').charAt(0).toUpperCase()}</div>
                        <span className="user-name-pro">{feedback.submittedBy?.name || feedback.submittedBy?.email || 'Anonymous'}</span>
                      </div>
                      <span className="meta-divider-pro">·</span>
                      <span className="meta-timestamp-pro">Received {fmt(feedback.createdAt)}</span>
                    </div>
                    {feedback.duplicateCount > 0 && (
                      <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#FEF3C7', color: '#D97706', borderRadius: '8px', border: '1px solid #FCD34D', fontSize: '0.875rem', fontWeight: 600 }}>
                        🔥 Critical issue: This problem has been reported by {feedback.duplicateCount + 1} users in total.
                      </div>
                    )}
                  </div>
                  <div className="header-status-column">
                    <StatusBadge status={feedback.status} />
                  </div>
                </div>

                <div className="investigation-tags-row">
                  {feedback.department && <Tag icon="🏢">{feedback.department}</Tag>}
                  {feedback.category && <Tag icon="📁">{feedback.category}</Tag>}
                  {feedback.priority && (
                    <Tag bg="var(--warning-bg)" color="#92400E" icon="⚡">{feedback.priority} priority</Tag>
                  )}
                </div>

                <div className="investigation-section">
                  <h3 className="section-label-pro">Detailed Submission</h3>
                  <div className="submission-content-text">{feedback.description}</div>
                </div>

                {feedback.attachments?.length > 0 && (
                  <div className="investigation-section">
                    <h3 className="section-label-pro">Attached Evidence</h3>
                    <div className="attachments-grid-pro">
                      {feedback.attachments.map((file, idx) => (
                        <div 
                          key={idx} 
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
                            <span className="pill-filename">{file.filename || `Evidence ${idx + 1}`}</span>
                            <span className="pill-type">{file.contentType?.split('/')[1]?.toUpperCase() || 'FILE'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="investigation-section">
                  <h3 className="section-label-pro">Interactive Support Chat</h3>
                  {userProfile?.role === 'admin' ? (
                      <>
                        {feedback.chatAccessRequests?.length > 0 && (
                            <div className="access-requests-banner">
                                <Icon d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" size={16} />
                                <span>{feedback.chatAccessRequests.length} Team Access Requests Pending</span>
                                <div className="grant-actions-mini">
                                    {feedback.chatAccessRequests.map(reqId => (
                                        <button key={reqId} className="btn-grant-pro" onClick={() => handleGrantAccess(reqId)}>Grant Case Access</button>
                                    ))}
                                </div>
                            </div>
                        )}
                        <ChatBox 
                          feedbackId={feedback._id} 
                          initialMessages={feedback.messages} 
                          isResolved={feedback.status === 'resolved'}
                          currentUser={userProfile}
                        />
                      </>
                  ) : userProfile?.role === 'team' ? (
                      feedback.permittedTeamMembers?.includes(userProfile._id) ? (
                        <ChatBox 
                          feedbackId={feedback._id} 
                          initialMessages={feedback.messages} 
                          isResolved={feedback.status === 'resolved'}
                          currentUser={userProfile}
                        />
                      ) : (
                        <div className="chat-restricted-box">
                            <Icon d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" size={32} className="lock-spin-pro" />
                            <p>Vault Access Restricted: This case requires active authorization from a Main Administrator before team participation is enabled.</p>
                            {feedback.chatAccessRequests?.includes(userProfile._id) ? (
                                <button className="btn-requested-pro" disabled>Access Request Pending...</button>
                            ) : (
                                <button className="btn-request-access-pro" onClick={handleRequestAccess}>Request Chat Access</button>
                            )}
                        </div>
                      )
                  ) : (
                      <ChatBox 
                        feedbackId={feedback._id} 
                        initialMessages={feedback.messages} 
                        isResolved={feedback.status === 'resolved'}
                        currentUser={userProfile}
                      />
                  )}
                </div>

                {feedback.status === 'resolved' && feedback.resolvedAt && (
                  <div className="resolution-audit-card">
                    <div className="audit-icon"><Icon d="M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4L12 14.01l-3-3" size={20} /></div>
                    <div className="audit-text">
                      <strong>Officially Resolved</strong>
                      <span>By {feedback.resolvedBy?.name || 'Administrator'} on {fmtFull(feedback.resolvedAt)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <aside className="detail-column-side">
              <div className="card control-panel-pro">
                <h3 className="panel-title-pro">Issue Resolution</h3>
                <p className="panel-desc-pro">Execute administrative actions to resolve or re-route this submission.</p>

                {error && <div className="alert alert-error pro-alert-box">{error}</div>}

                <div className="control-form-pro">
                  <div className="input-field-group-pro">
                    <label htmlFor="admin-status" className="pro-field-label">
                      <Icon d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" size={16} />
                      Operation Status
                    </label>
                    <div className="select-wrapper-pro">
                      <select
                        id="admin-status"
                        name="status"
                        className="pro-select"
                        value={form.status}
                        onChange={(e) => setForm({ ...form, status: e.target.value })}
                        disabled={feedback.status === 'resolved'}
                      >
                        <option value="pending">Awaiting Review</option>
                        <option value="in-review">Investigation Started</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </div>
                  </div>

                  {(userProfile?.role === 'admin' || userProfile?.role === 'team') && (
                    <>
                      {userProfile?.role === 'admin' && (
                        <div className="input-field-group-pro">
                          <label htmlFor="admin-dept" className="pro-field-label">
                            <Icon d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" size={16} />
                            Transfer to Department
                          </label>
                          <div className="select-wrapper-pro">
                            <select
                              id="admin-dept"
                              name="department"
                              className="pro-select"
                              value={form.department}
                              onChange={(e) => setForm({ ...form, department: e.target.value })}
                              disabled={feedback.status === 'resolved'}
                            >
                              <option value="General Support">General Support</option>
                              <option value="NMC (Internet Issues)">NMC (Internet Issues)</option>
                              <option value="Electrical Team">Electrical Team</option>
                              <option value="IT Support">IT Support</option>
                              <option value="Campus Maintenance">Campus Maintenance</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  <div className="input-field-group-pro">
                    <label htmlFor="admin-response" className="pro-field-label">
                      <Icon d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" size={16} />
                      Official Response Log
                    </label>
                    <textarea
                      id="admin-response"
                      name="adminResponse"
                      className="pro-textarea"
                      placeholder="Enter official resolution details..."
                      value={form.adminResponse}
                      onChange={(e) => setForm({ ...form, adminResponse: e.target.value })}
                      rows={6}
                      spellCheck="false"
                      data-gramm="false"
                      disabled={feedback.status === 'resolved'}
                    />
                  </div>

                  <div className="control-actions-pro">
                    {feedback.status !== 'resolved' ? (
                      <>
                        <button className="btn btn-cta btn-full-sh" onClick={handleSave} disabled={saving}>
                          {saving ? 'Processing...' : 'Sync Changes'}
                          <Icon d="M5 13l4 4L19 7" size={16} />
                        </button>
                        <button className="btn btn-danger btn-full-sh" onClick={handleDelete}>
                          <Icon d="M19 7l-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v3" size={16} />
                          Purge Record
                        </button>
                      </>
                    ) : (
                      <div className="locked-notice">
                        <Icon d="M12 11V7a4 4 0 0 1 8 0v4h1a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h1z" size={16} />
                        Case Locked - Resolved Complaints are Immutable
                      </div>
                    )}
                  </div>
                </div>
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

export default AdminFeedbackDetail;
