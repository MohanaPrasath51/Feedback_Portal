import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import api from '../api/axios';
import '../css/HomePage.css';

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { key: 'pending', label: 'Pending Requests', icon: 'pending' },
  { key: 'resolved', label: 'Resolved', icon: 'resolved' },
];

const Icon = ({ d, size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
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

const FeedbackCard = ({ item, onView }) => (
  <div className="feedback-card active-item-card premium-hover" onClick={onView} style={{ cursor: 'pointer' }}>
    <div className="feedback-card-title">{item.title}</div>
    <div className="feedback-card-desc">{item.description}</div>
    <div className="feedback-card-footer">
      <StatusBadge status={item.status} />
      <span className="card-click-hint" style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '600' }}>Review Details →</span>
    </div>
  </div>
);

const ResolvedFeedbackCard = ({ item, onView }) => {
  const resolvedDate = item.resolvedAt ? new Date(item.resolvedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently';
  const resolverName = item.resolvedBy?.department || item.resolvedBy?.name || 'Administrator';

  return (
    <div className="result-card premium-hover" onClick={onView} style={{ cursor: 'pointer' }}>
      <div className="result-card-badge">
        <Icon d="M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4L12 14.01l-3-3" size={14} />
        Resolved
      </div>
      <div className="feedback-card-title">{item.title}</div>

      {item.adminResponse && (
        <div className="official-response-preview">
          <Icon d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" size={14} className="response-icon" />
          <p className="response-text">"{item.adminResponse.substring(0, 120)}{item.adminResponse.length > 120 ? '...' : ''}"</p>
        </div>
      )}

      <div className="feedback-card-footer resolved-footer">
        <div className="resolution-meta">
          <span className="meta-info">Closed by <strong>{resolverName}</strong></span>
          <span className="meta-dot">·</span>
          <span className="meta-info">{resolvedDate}</span>
        </div>
      </div>
    </div>
  );
};

const HomePage = () => {
  const { userProfile } = useAuth();
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'dashboard';
  const setActiveTab = (tab) => setSearchParams({ tab });
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/feedback')
      .then(({ data }) => setFeedbackList(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const pendingList = useMemo(() => feedbackList.filter((f) => f.status === 'pending' || f.status === 'in-review'), [feedbackList]);
  const resolvedList = useMemo(() => feedbackList.filter((f) => f.status === 'resolved'), [feedbackList]);
  const recentThree = useMemo(() => [...feedbackList].slice(0, 3), [feedbackList]);

  const navItems = NAV_ITEMS.map((item) => ({
    ...item,
    badge: item.key === 'pending' ? pendingList.length || undefined : undefined,
  }));

  const renderList = (items) => {
    if (!items.length) {
      return (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Icon d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" size={48} />
          </div>
          <p>No feedback in this category yet.</p>
        </div>
      );
    }
    const isResolvedView = items.every(f => f.status === 'resolved');
    return (
      <div className={`feedback-grid ${isResolvedView ? 'resolved-grid' : ''}`}>
        {items.map((item) => (
          item.status === 'resolved' ? (
            <ResolvedFeedbackCard
              key={item._id}
              item={item}
              onView={() => navigate(`/feedback/${item._id}`)}
            />
          ) : (
            <FeedbackCard
              key={item._id}
              item={item}
              onView={() => navigate(`/feedback/${item._id}`)}
            />
          )
        ))}
      </div>
    );
  };

  const renderContent = () => {
    if (loading) return <div className="spinner" />;

    if (activeTab === 'pending') {
      return (
        <div className="page-view-wrapper">
          <div className="page-header">
            <h1 className="page-title">Pending Requests</h1>
            <p className="page-subtitle">{pendingList.length} item{pendingList.length !== 1 ? 's' : ''} awaiting action</p>
          </div>
          {renderList(pendingList)}
        </div>
      );
    }

    if (activeTab === 'resolved') {
      return (
        <div className="page-view-wrapper">
          <div className="page-header">
            <h1 className="page-title">Resolved History</h1>
            <p className="page-subtitle">Timeline of successfully addressed submissions.</p>
          </div>
          {renderList(resolvedList)}
        </div>
      );
    }

    const firstName = userProfile?.name?.split(' ')[0] || 'Contributor';
    return (
      <div className="page-view-wrapper">
        <div className="welcome-banner-row">
          <div className="welcome-text-block">
            <h1 className="welcome-title">Hello, {firstName} 👋</h1>
            <p className="welcome-subtitle">Here's your feedback activity at a glance.</p>
          </div>
        </div>

        <div className="stat-grid dashboard-stats">
          <div className="stat-card">
            <div className="stat-icon-bg primary">
              <Icon d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8" size={20} />
            </div>
            <div className="stat-info">
              <span className="stat-label">Total Submissions</span>
              <span className="stat-value">{feedbackList.length}</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon-bg warning">
              <Icon d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01" size={20} />
            </div>
            <div className="stat-info">
              <span className="stat-label">Pending Review</span>
              <span className="stat-value">{pendingList.length}</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon-bg success">
              <Icon d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z M9 12l2 2 4-4" size={20} />
            </div>
            <div className="stat-info">
              <span className="stat-label">Resolved Items</span>
              <span className="stat-value">{resolvedList.length}</span>
            </div>
          </div>
        </div>

        <div className="section-header-row">
          <h2 className="section-title">Recent Activity</h2>
          {feedbackList.length > 3 && (
            <span style={{ fontSize: '0.90rem', color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              View all history
            </span>
          )}
        </div>
        {renderList(recentThree)}
      </div>
    );
  };

  const pageTitle = activeTab === 'dashboard' ? 'Dashboard' : activeTab === 'pending' ? 'Pending Requests' : 'Resolved';

  return (
    <DashboardLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      navItems={navItems}
      title={pageTitle}
      topbarActions={
        activeTab === 'dashboard' && (
          <div className="user-profile-trigger" onClick={() => navigate('/profile')}>
            <img
              src={userProfile?.profilePhoto || "https://i.pinimg.com/736x/b2/a0/29/b2a029a6c2757e9d1a0b3bbce2407c08.jpg"}
              alt="Profile"
              className="topbar-avatar"
            />
          </div>
        )
      }
    >
      {renderContent()}

    </DashboardLayout>
  );
};

export default HomePage;
