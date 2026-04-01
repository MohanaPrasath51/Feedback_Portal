import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signIn, signInWithGoogle, signInWithCustomAuthToken } from '../firebase/auth';
import api from '../api/axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../css/LoginPage.css';

function useFocus() {
  const [isFocused, setIsFocused] = useState(false);
  const onFocus = () => setIsFocused(true);
  const onBlur = () => setIsFocused(false);
  return { isFocused, onFocus, onBlur };
}



function getStrength(pw) {
  let score = 0;
  if (!pw) return 0;
  if (pw.length > 5) score++;
  if (pw.length > 8) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}
const STRENGTH_COLORS = ['#EF4444', '#F59E0B', '#F59E0B', '#10B981', '#10B981'];
const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Strong'];

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);





const LogoIcon = ({ size = 48, color = '#10b981' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    <path d="M9 10h6 M9 14h3" stroke={color} strokeWidth="2" opacity="0.6" />
  </svg>
);

const LoginPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const { currentUser, userProfile, loading: authLoading, refreshProfile } = useAuth();

  // ── Auto-redirect if already logged in ────────────────────────────
  useEffect(() => {
    if (authLoading) return; // Wait for auth to resolve

    const jwtToken = localStorage.getItem('token');
    const jwtUser = (() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } })();

    if (userProfile) {
      // Logged in via Firebase (regular user or admin)
      const role = userProfile.role;
      navigate((role === 'admin' || role === 'team') ? `/admin/${userProfile.username}` : '/home', { replace: true });
    } else if (jwtToken && jwtUser) {
      // Logged in via Admin JWT (no Firebase session)
      navigate((jwtUser.role === 'admin' || jwtUser.role === 'team') ? `/admin/${jwtUser.username}` : '/home', { replace: true });
    }
  }, [authLoading, userProfile, navigate]);

  const idFocus = useFocus();
  const pwFocus = useFocus();

  const routeByRole = async () => {
    const data = await refreshProfile();
    // Redirect both 'admin' and 'team' roles to the admin dashboard
    navigate((data.role === 'admin' || data.role === 'team') ? `/admin/${data.username}` : '/home');
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const identifier = form.identifier.trim().toLowerCase();
      const isEmail = identifier.includes('@');

      // ── Step 1: Always try Admin collection first (email OR username) ──
      try {
        const { data } = await api.post('/admin/login', {
          identifier,
          password: form.password,
        });
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        await refreshProfile();
        navigate(
          data.user.role === 'admin' || data.user.role === 'team'
            ? `/admin/${data.user.username}`
            : '/home'
        );
        return;
      } catch (adminErr) {
        // Not found in Admin collection — continue to user login
      }

      // ── Step 2: Try User collection (supporting username or email) ──
      try {
        const { data } = await api.post('/users/login', {
          identifier,
          password: form.password,
        });
        await signInWithCustomAuthToken(data.token);
        await routeByRole();
        return;
      } catch (userErr) {
        // Fallback to direct Firebase if it looks like an email address
        if (isEmail) {
          try {
            await signIn(identifier, form.password);
            await routeByRole();
            return;
          } catch (fbErr) {
            // Both failed
          }
        }
        throw new Error(userErr.response?.data?.message || 'Invalid credentials. Please double-check your username/email and password.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Invalid credentials';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };




  const handleGoogleLogin = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      await routeByRole();
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        setError('Google sign-in was cancelled. Please try again.');
      } else {
        setError('Google Sign-In failed. Please try again.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };


  const pwStrength = getStrength(form.password);

  return (
    <div className="dark">
      <div className="login-page">
        <div className="bg-orbs">
          <div className="bg-orb orb-primary" />
          <div className="bg-orb orb-secondary" />
        </div>

        <div className="content-wrapper">
          <div className="login-left left-panel">
            <div className="logo-icon-wrapper">
              <div className="logo-badge">
                <LogoIcon color="#10b981" size={22} />
              </div>
            </div>
            <h1 className="hero-title">
              Digital
              <span className="accent">Feedback Portal</span>
            </h1>
            <p className="hero-sub">
              A smarter way to gather, manage, and act on your user's feedback.
            </p>
            <div className="feature-pills">
              <span className="feature-pill">Role-based access control</span>
              <span className="feature-pill">Real-time complaint tracking</span>
              <span className="feature-pill">Team-specific dashboards</span>
            </div>
          </div>

          <div className="login-right right-panel">
            <div className="form-card">
              <div className="form-header">
                <div className="mobile-branding">
                  <LogoIcon color="#10b981" size={32} />
                  <h1 className="mobile-title">Digital <span>Feedback Portal</span></h1>
                </div>
                <h2 className="form-title">Welcome Back</h2>
                <p className="form-sub">Securely sign in to your feedback dashboard</p>
              </div>

              {error ? (
                <div className="alert alert-error" style={{ marginBottom: '1.5rem', borderRadius: '12px' }}>
                  {error}
                </div>
              ) : null}

              <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                  <label htmlFor="login-identifier" className="form-label" style={{ color: idFocus.isFocused ? '#10b981' : '#94a3b8' }}>Email or Username</label>
                  <div className="input-wrap" style={{ borderColor: idFocus.isFocused ? '#10b981' : '#334155' }}>
                    <input
                      id="login-identifier"
                      name="identifier"
                      autoComplete="username"
                      type="text"
                      className="form-input"
                      placeholder="Enter Username or Email"
                      value={form.identifier}
                      onChange={(e) => setForm({ ...form, identifier: e.target.value })}
                      onFocus={idFocus.onFocus}
                      onBlur={idFocus.onBlur}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <label htmlFor="login-password" className="form-label" style={{ margin: 0, color: pwFocus.isFocused ? '#10b981' : '#94a3b8' }}>Password</label>
                    <a href="#" className="forgot-link">Forgot?</a>
                  </div>
                  <div className="input-wrap" style={{ borderColor: pwFocus.isFocused ? '#10b981' : '#334155' }}>
                    <input
                      id="login-password"
                      name="password"
                      autoComplete="current-password"
                      type={showPw ? 'text' : 'password'}
                      className="form-input"
                      placeholder="••••••••"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      onFocus={pwFocus.onFocus}
                      onBlur={pwFocus.onBlur}
                      required
                    />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="toggle-btn">
                      {showPw ? 'Hide' : 'Show'}
                    </button>
                  </div>

                  {form.password && (
                    <div className="strength-container">
                      <div className="strength-bar">
                        <div className="strength-fill" style={{
                          width: `${(pwStrength / 4) * 100}%`,
                          backgroundColor: STRENGTH_COLORS[pwStrength]
                        }} />
                      </div>
                      <span className="strength-label" style={{ color: STRENGTH_COLORS[pwStrength] }}>
                        {STRENGTH_LABELS[pwStrength]}
                      </span>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-cta auth-btn-primary"
                >
                  {loading ? (
                    <>
                      <span className="btn-spinner" />
                      <span>Authenticating...</span>
                    </>
                  ) : 'Sign In'}
                </button>
              </form>

              <div className="auth-divider">
                <span className="divider-line" />
                <span className="divider-text">or continue with</span>
                <span className="divider-line" />
              </div>

              <button
                onClick={handleGoogleLogin}
                disabled={googleLoading}
                className="google-btn"
              >
                <GoogleIcon />
                <span>{googleLoading ? 'Connecting...' : 'Continue with Google'}</span>
              </button>

              <p className="auth-footer-text">
                Don't have an account? <Link to="/register" className="auth-footer-link">Sign Up</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


export default LoginPage;
