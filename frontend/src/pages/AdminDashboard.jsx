import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import api from '../api/axios';
import '../css/AdminDashboard.css';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import { useAuth } from '../context/AuthContext';

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

const FeedbackCard = ({ fb, onView }) => (
  <div className="feedback-card premium-hover">
    <div className="feedback-card-title">{fb.title}</div>
    <div className="feedback-card-desc">{fb.description}</div>
    <div className="feedback-card-footer">
      <StatusBadge status={fb.status} />
      <button className="btn btn-secondary btn-sm" onClick={onView}>
        Review Submission
        <Icon d="M9 18l6-6-6-6" size={12} />
      </button>
    </div>
  </div>
);



const AdminDashboard = () => {
  const { userProfile } = useAuth();
  const [feedbackList, setFeedbackList] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, inReview: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'summary';
  const setActiveTab = (tab) => setSearchParams({ tab });
  const navigate = useNavigate();

  const dashboardTitle = userProfile?.role === 'team'
    ? `${userProfile.department} Hub`
    : 'Admin Dashboard';

  useEffect(() => {
    const loadData = async () => {
      try {
        const [feedRes, statsRes] = await Promise.all([
          api.get('/feedback'),
          api.get('/feedback/stats'),
        ]);
        // Sort feedback by date descending (already done by backend but just in case)
        setFeedbackList(feedRes.data);
        setStats(statsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const pendingList = useMemo(() => feedbackList.filter((f) => f.status === 'pending'), [feedbackList]);
  const inReviewList = useMemo(() => feedbackList.filter((f) => f.status === 'in-review'), [feedbackList]);
  const resolvedList = useMemo(() => feedbackList.filter((f) => f.status === 'resolved'), [feedbackList]);

  const navItems = [
    { key: 'summary', label: 'Dashboard', icon: 'summary' },
    { key: 'analytics', label: 'Analytics', icon: 'analytics' },
    { key: 'pending', label: 'Awaiting', icon: 'pending', badge: pendingList.length || undefined },
    { key: 'in-review', label: 'Processing', icon: 'inreview', badge: inReviewList.length || undefined },
    { key: 'resolved', label: 'Completed', icon: 'resolved' },
  ];

  const renderContent = () => {
    if (loading) return <div className="spinner" />;

    const renderAdminList = (items) => {
      if (!items.length) {
        return (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-3)', background: 'var(--surface-2)', borderRadius: '16px', border: '2px dashed var(--border)' }}>
            <Icon d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z M9 10h6 M9 14h3" size={48} />
            <p style={{ marginTop: '1rem', fontWeight: 600 }}>No feedback records available in this queue.</p>
          </div>
        );
      }
      return (
        <div className="feedback-grid">
          {items.map(fb => <FeedbackCard key={fb._id} fb={fb} onView={() => navigate(`/admin/${userProfile.username}/feedback/${fb._id}`)} />)}
        </div>
      );
    };

    if (activeTab === 'pending') return (
      <div className="admin-view-transition">
        <h2 className="view-inner-title">Pending Revision ({pendingList.length})</h2>
        {renderAdminList(pendingList)}
      </div>
    );

    if (activeTab === 'in-review') return (
      <div className="admin-view-transition">
        <h2 className="view-inner-title">Active Investigation ({inReviewList.length})</h2>
        {renderAdminList(inReviewList)}
      </div>
    );

    if (activeTab === 'resolved') return (
      <div className="admin-view-transition">
        <h2 className="view-inner-title">Resolved History ({resolvedList.length})</h2>
        {renderAdminList(resolvedList)}
      </div>
    );

    if (activeTab === 'analytics') return <AnalyticsDashboard />;

    return (
      <div className="admin-pro-dashboard">
        <div className="stat-row">
          {[
            { label: 'Overall Volume', value: stats.total, icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8', color: 'indigo' },
            { label: 'Work In Progress', value: stats.inReview, icon: 'M21 21l-4.35-4.35M16.5 10.5c0 3.31-2.69 6-6 6s-6-2.69-6-6 2.69-6 6-6 6 2.69 6 6z', color: 'blue' },
            { label: 'Closed Cases', value: stats.resolved, icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z M9 12l2 2 4-4', color: 'emerald' },
          ].map((item) => (
            <div key={item.label} className={`pro-stat-card ${item.color}`}>
              <div className="card-flare" />
              <div className="card-top">
                <span className="card-label">{item.label}</span>
                <div className="icon-badge">
                  <Icon d={item.icon} size={18} />
                </div>
              </div>
              <div className="card-value">{item.value}</div>
              <div className="card-footer-mini">Real-time statistics updated just now.</div>
            </div>
          ))}
        </div>

        <div className="dashboard-main-grid">
          <div className="activity-section">
            <div className="section-head-pro">
              <h3 className="section-title-main">Incoming Stream</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setActiveTab('pending')}>
                View Queue
                <Icon d="M9 5l7 7-7 7" size={14} />
              </button>
            </div>

            <div className="pro-table-container">
              <table className="pro-data-table">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Status</th>
                    <th>{userProfile?.role === 'admin' ? 'Department' : 'Category'}</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {feedbackList.slice(0, 6).map((fb) => (
                    <tr key={fb._id} className="pro-table-row">
                      <td className="subject-cell">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {fb.attachments?.length > 0 && <Icon d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" size={12} className="text-primary" />}
                          {fb.title}
                        </div>
                      </td>
                      <td><StatusBadge status={fb.status} /></td>
                      <td className="team-cell">{userProfile?.role === 'admin' ? fb.department : (fb.category || 'General')}</td>
                      <td className="text-right">
                        <button className="action-circle-btn" onClick={() => navigate(`/admin/${userProfile.username}/feedback/${fb._id}`)}>
                          <Icon d="M9 18l6-6-6-6" size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="aux-section">
            <div className="card admin-quick-card">
              <h4 className="quick-title">
                {userProfile?.role === 'team' ? 'Department Operations' : 'Administrative Tasks'}
              </h4>
              <div className="quick-actions-list">
                <div className="quick-item">
                  <div className="quick-icon-sm blue"><Icon d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z" size={16} /></div>
                  <div className="quick-info">
                    <span className="q-label">Generate {userProfile?.role === 'team' ? 'Dept' : 'Monthly'} Report</span>
                    <span className="q-sub">PDF/XSLX format</span>
                  </div>
                </div>
                {userProfile?.role === 'admin' ? (
                  <>
                    <div className="quick-item">
                      <div className="quick-icon-sm purple"><Icon d="M12 4.354a4 4 0 1 1 0 5.292 M15 21H3v-1a6 6 0 0 1 12 0v1z" size={16} /></div>
                      <div className="quick-info">
                        <span className="q-label">Manage Platform Users</span>
                        <span className="q-sub">View and edit user roles</span>
                      </div>
                    </div>
                    <div className="quick-item">
                      <div className="quick-icon-sm emerald"><Icon d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" size={16} /></div>
                      <div className="quick-info">
                        <span className="q-label">Portal Configuration</span>
                        <span className="q-sub">Settings and themes</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="quick-item">
                    <div className="quick-icon-sm emerald"><Icon d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" size={16} /></div>
                    <div className="quick-info">
                      <span className="q-label">Team Performance</span>
                      <span className="q-sub">View resolution metrics</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const pageTitle = navItems.find(item => item.key === activeTab)?.label || 'Dashboard';

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab} navItems={navItems} title={pageTitle}>
      <div className="admin-page-root">
        <header className="admin-hero">
          <div className="hero-content">
            <h1 className="hero-title">{dashboardTitle}</h1>
            <p className="hero-subtitle">Intelligent feedback management engine for product success.</p>
          </div>
          <div className="hero-decoration">
            <div className="deco-blob" />
          </div>
        </header>

        {renderContent()}
      </div>

    </DashboardLayout>
  );
};

export default AdminDashboard;
