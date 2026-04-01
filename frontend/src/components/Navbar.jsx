import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LogoIcon = ({ size = 28, color = '#2563EB' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    <path d="M9 10h6 M9 14h3" stroke={color} strokeWidth="2" opacity="0.6" />
  </svg>
);

const Navbar = () => {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>
        <Link to={(userProfile?.role === 'admin' || userProfile?.role === 'team') ? `/admin/${userProfile?.username || 'user'}` : '/home'} style={styles.logo}>
          <LogoIcon />
          <span>College Feedback System</span>
        </Link>

        <div style={styles.right}>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    background: '#fff',
    borderBottom: '1px solid #E5E7EB',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  inner: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '0 1.25rem',
    height: 68,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1rem',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.55rem',
    fontSize: '1rem',
    fontWeight: 700,
    color: '#111827',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
  },
  logoIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 30,
    height: 30,
    borderRadius: 8,
    background: '#2563EB',
    color: '#fff',
    fontSize: '0.76rem',
    letterSpacing: '0.03em',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  logoutBtn: {
    padding: '0.45rem 1rem',
    background: '#F3F4F6',
    color: '#374151',
    fontFamily: 'Plus Jakarta Sans, sans-serif',
    fontSize: '0.85rem',
    fontWeight: 600,
    border: '1px solid #E5E7EB',
    borderRadius: 8,
    cursor: 'pointer',
  },
};

export default Navbar;
