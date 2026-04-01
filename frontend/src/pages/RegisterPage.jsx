import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithGoogle, signUp } from '../firebase/auth';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import '../css/RegisterPage.css';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

function useFocus() {
  const [isFocused, setIsFocused] = useState(false);
  const onFocus = () => setIsFocused(true);
  const onBlur = () => setIsFocused(false);
  return { isFocused, onFocus, onBlur };
}

const LogoIcon = ({ size = 48, color = '#10b981' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    <path d="M9 10h6 M9 14h3" stroke={color} strokeWidth="2" opacity="0.6" />
  </svg>
);

const RegisterPage = () => {
  const [form, setForm] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();

  const nameFocus = useFocus();
  const userFocus = useFocus();
  const emailFocus = useFocus();
  const pwFocus = useFocus();
  const confirmFocus = useFocus();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const routeByRole = async () => {
    const data = await refreshProfile();
    navigate((data.role === 'admin' || data.role === 'team') ? `/admin/${data.username}` : '/home');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const userCred = await signUp(form.name, form.email, form.password);
      const firebaseUid = userCred.user.uid;

      await api.post('/users/register', {
        name: form.name,
        username: form.username,
        email: form.email,
        firebaseUid,
        password: form.password,
      });

      const token = await userCred.user.getIdToken();
      await routeByRole();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration failed';
      setError(msg.replace('Firebase: ', '').replace(/\(auth\/.*\)/, '').trim());
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      const result = await signInWithGoogle();
      const idToken = await result.user.getIdToken();
      await routeByRole();
    } catch (err) {
      setError('Google registration failed.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="dark">
      <div className="login-page">
        <div className="bg-orbs">
          <div className="bg-orb orb-primary" />
          <div className="bg-orb orb-secondary" />
        </div>

        <div className="content-wrapper">
          <div className="login-left left-panel">
            <div style={{ position: 'relative', zIndex: 10 }}>
              <div className="logo-icon-wrapper">
                <LogoIcon color="#10b981" />
              </div>
              <h1 className="hero-title">
                Digital <br />
                <span style={{ color: '#10b981' }}>Feedback Portal</span>
              </h1>
              <p className="hero-sub">
                Start sharing your insights and help shape better products today.
              </p>
            </div>
          </div>

          <div className="login-right right-panel">
            <div className="form-card">
              <div className="form-header">
                <div className="mobile-branding">
                  <LogoIcon color="#10b981" size={32} />
                  <h1 className="mobile-title">Digital <span>Feedback Portal</span></h1>
                </div>
                <h2 className="form-title">Create Account</h2>
                <p className="form-sub">Join the portal and start sharing your thoughts</p>
              </div>

              {error && (
                <div className="alert alert-error" style={{ marginBottom: '1.5rem', borderRadius: '12px' }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                  <label htmlFor="reg-name" className="form-label" style={{ color: nameFocus.isFocused ? '#10b981' : undefined }}>Full Name</label>
                  <div className="input-wrap" style={{ borderColor: nameFocus.isFocused ? '#10b981' : undefined }}>
                    <input
                      id="reg-name"
                      name="name"
                      autoComplete="name"
                      className="form-input"
                      placeholder="Enter your name"
                      value={form.name}
                      onChange={handleChange}
                      onFocus={nameFocus.onFocus}
                      onBlur={nameFocus.onBlur}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="reg-email" className="form-label" style={{ color: emailFocus.isFocused ? '#10b981' : undefined }}>Email Address</label>
                  <div className="input-wrap" style={{ borderColor: emailFocus.isFocused ? '#10b981' : undefined }}>
                    <input
                      id="reg-email"
                      name="email"
                      autoComplete="email"
                      type="email"
                      className="form-input"
                      placeholder="name@company.com"
                      value={form.email}
                      onChange={handleChange}
                      onFocus={emailFocus.onFocus}
                      onBlur={emailFocus.onBlur}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="reg-username" className="form-label" style={{ color: userFocus.isFocused ? '#10b981' : undefined }}>Username</label>
                  <div className="input-wrap" style={{ borderColor: userFocus.isFocused ? '#10b981' : undefined }}>
                    <input
                      id="reg-username"
                      name="username"
                      autoComplete="username"
                      className="form-input"
                      placeholder="Choose a username"
                      value={form.username}
                      onChange={handleChange}
                      onFocus={userFocus.onFocus}
                      onBlur={userFocus.onBlur}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label htmlFor="reg-password" className="form-label" style={{ color: pwFocus.isFocused ? '#10b981' : undefined }}>Password</label>
                    <div className="input-wrap" style={{ borderColor: pwFocus.isFocused ? '#10b981' : undefined }}>
                      <input
                        id="reg-password"
                        name="password"
                        autoComplete="new-password"
                        type="password"
                        className="form-input"
                        placeholder="••••••••"
                        value={form.password}
                        onChange={handleChange}
                        onFocus={pwFocus.onFocus}
                        onBlur={pwFocus.onBlur}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="reg-confirm" className="form-label" style={{ color: confirmFocus.isFocused ? '#10b981' : undefined }}>Confirm</label>
                    <div className="input-wrap" style={{ borderColor: confirmFocus.isFocused ? '#10b981' : undefined }}>
                      <input
                        id="reg-confirm"
                        name="confirmPassword"
                        autoComplete="new-password"
                        type="password"
                        className="form-input"
                        placeholder="••••••••"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        onFocus={confirmFocus.onFocus}
                        onBlur={confirmFocus.onBlur}
                        required
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-cta auth-btn-primary"
                  style={{ marginTop: '0.5rem' }}
                >
                  {loading ? 'Creating Account...' : 'Get Started'}
                </button>
              </form>

              <div className="auth-divider">
                <span className="divider-line" />
                <span className="divider-text">or join with</span>
                <span className="divider-line" />
              </div>

              <button
                onClick={handleGoogleRegister}
                disabled={googleLoading}
                className="google-btn"
              >
                <GoogleIcon />
                <span>{googleLoading ? 'Connecting...' : 'Continue with Google'}</span>
              </button>

              <p className="auth-footer-text">
                Already a member? <Link to="/login" className="auth-footer-link">Sign In</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};



export default RegisterPage;
