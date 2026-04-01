import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Icon = ({ path, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className="sidebar-item-icon">
    <path d={path} />
  </svg>
);

const ICONS = {
  dashboard: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
  pending: 'M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z M12 6v6l4 2',
  resolved: 'M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4L12 14.01l-3-3',
  inreview: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7 M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z',
  submit: 'M12 5v14 M5 12h14',
  profile: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9',
  summary: 'M18 20V10 M12 20V4 M6 20v-6',
  analytics: 'M22 12h-4l-3 9L9 3l-3 9H2',
  access: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M19 8v6 M16 11h6',
};

// Built-in nav items per role — always show even when parent passes empty navItems
const USER_NAV = [
  { key: 'dashboard', label: 'Dashboard', icon: 'dashboard', path: '/home' },
  { key: 'pending', label: 'Pending Requests', icon: 'pending', path: '/home?tab=pending' },
  { key: 'resolved', label: 'Resolved', icon: 'resolved', path: '/home?tab=resolved' },
];

// Admin nav fallback - used when admin/team visits Profile or FeedbackDetail pages
// Paths are resolved dynamically with the user's username at render time
const getAdminNav = (username) => [
  { key: 'summary', label: 'Dashboard', icon: 'summary', path: `/admin/${username}?tab=summary` },
  { key: 'analytics', label: 'Analytics', icon: 'analytics', path: `/admin/${username}?tab=analytics` },
  { key: 'pending', label: 'Awaiting', icon: 'pending', path: `/admin/${username}?tab=pending` },
  { key: 'in-review', label: 'Processing', icon: 'inreview', path: `/admin/${username}?tab=in-review` },
  { key: 'resolved', label: 'Completed', icon: 'resolved', path: `/admin/${username}?tab=resolved` },
];



const LogoIcon = ({ size = 28, color = 'white' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    <path d="M9 10h6 M9 14h3" stroke={color} strokeWidth="2" opacity="0.6" />
  </svg>
);

const NavItem = ({ label, iconKey, active, onClick, badge }) => (
  <button
    className={`sidebar-item${active ? ' active' : ''}`}
    onClick={onClick}
    type="button"
  >
    <Icon path={ICONS[iconKey] || ICONS.dashboard} />
    <span>{label}</span>
    {badge != null && badge > 0 && (
      <span className="sidebar-item-badge">{badge}</span>
    )}
  </button>
);

const Sidebar = ({ activeTab, setActiveTab, navItems, className = '', onMobileClose }) => {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const initial = (userProfile?.name || userProfile?.email || 'U').charAt(0).toUpperCase();
  const isAdminOrTeam = userProfile?.role === 'admin' || userProfile?.role === 'team';
  const homeBase = isAdminOrTeam ? `/admin/${userProfile?.username}` : '/home';

  // Fall back to built-in nav if parent passes empty array (ProfilePage, FeedbackDetailPage, etc.)
  // Users get USER_NAV; admin/team get ADMIN_NAV built with their username for correct routing
  const resolvedNavItems = (!navItems || navItems.length === 0)
    ? (isAdminOrTeam ? getAdminNav(userProfile?.username) : USER_NAV)
    : navItems;

  return (
    <aside className={`sidebar ${className}`}>
      <div className="sidebar-brand" style={{ cursor: 'pointer' }} onClick={() => {
        navigate(homeBase);
        if (onMobileClose) onMobileClose();
      }}>
        <div className="sidebar-brand-icon">
          <LogoIcon size={32} />
        </div>
        <span className="sidebar-brand-name">College Feedback System</span>
      </div>

      <nav className="sidebar-nav">
        {userProfile?.role === 'user' && (
          <button
            className="btn btn-cta sidebar-submit-btn"
            onClick={() => {
              navigate('/submit');
              if (onMobileClose) onMobileClose();
            }}
          >
            <Icon path={ICONS.submit} size={20} />
            <span>Submit Feedback</span>
          </button>
        )}

        <div className="sidebar-section-label">Navigation</div>

        {resolvedNavItems.map((item) => (
          <NavItem
            key={item.key}
            label={item.label}
            iconKey={item.icon}
            active={
              activeTab === item.key ||
              (item.path && location.pathname + location.search === item.path)
            }
            badge={item.badge}
            onClick={() => {
              if (item.path) {
                navigate(item.path);
              } else {
                setActiveTab(item.key);
              }
              if (onMobileClose) onMobileClose();
            }}
          />
        ))}

        <div className="sidebar-section-label" style={{ marginTop: '1rem' }}>Account</div>

        <NavItem
          label="Profile"
          iconKey="profile"
          active={location.pathname === '/profile'}
          onClick={() => {
            navigate('/profile');
            if (onMobileClose) onMobileClose();
          }}
        />

        <button className="sidebar-item" onClick={handleLogout} type="button">
          <Icon path={ICONS.logout} />
          <span>Logout</span>
        </button>
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          {userProfile?.profilePhoto ? (
            <img
              src={userProfile.profilePhoto}
              alt="avatar"
              className="sidebar-user-avatar"
              style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
            />
          ) : (
            <div className="sidebar-user-avatar">{initial}</div>
          )}
          <div className="sidebar-user-info">
            <div
              className="sidebar-user-name"
              style={{ cursor: 'pointer', textTransform: 'uppercase' }}
              onClick={() => {
                navigate(homeBase);
                if (onMobileClose) onMobileClose();
              }}
            >
              {userProfile?.name || userProfile?.username || 'User'}
            </div>
            <div className="sidebar-user-role">{userProfile?.role || 'user'}</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
