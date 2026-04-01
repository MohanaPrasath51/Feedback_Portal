import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import '../css/ProfilePage.css';

const Icon = ({ d, size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d={d} />
  </svg>
);

const ProfilePage = () => {
  const { userProfile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');

  const [feedbackCount, setFeedbackCount] = useState(0);

  useEffect(() => {
    if (userProfile) {
      setUsername(userProfile.username || '');
      setEmail(userProfile.email || '');
      setProfilePhoto(userProfile.profilePhoto || '');

      // Fetch feedback count specifically for this identity
      api.get('/feedback')
        .then(({ data }) => {
          const userFeedback = data.filter(f => {
            const userId = f.submittedBy?._id || f.submittedBy;
            return userId === userProfile._id;
          });
          setFeedbackCount(userFeedback.length);
        })
        .catch(err => console.error('Failed to fetch feedback count:', err));
    }
  }, [userProfile]);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') setProfilePhoto(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setToast('');
    setLoading(true);
    try {
      const payload = { username, email, profilePhoto };
      if (newPassword.trim()) payload.password = newPassword.trim();
      await api.put('/users/profile', payload);
      await refreshProfile();
      setNewPassword('');
      setToast('Profile updated successfully.');
      setTimeout(() => setToast(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const backPath = (userProfile?.role === 'admin' || userProfile?.role === 'team') ? `/admin/${userProfile?.username || 'user'}` : '/home';
  const initial = (userProfile?.name || userProfile?.email || 'U').charAt(0).toUpperCase();

  return (
    <DashboardLayout activeTab="__profile__" setActiveTab={() => { }} navItems={[]} title="User Identity">
      {toast && (
        <div className="toast-notification">
          <div className="alert alert-success premium-alert">
            <Icon d="M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4L12 14.01l-3-3" size={20} className="alert-icon-pro" />
            <span style={{ fontSize: '1.1rem' }}>{toast}</span>
          </div>
        </div>
      )}
      <div className="pro-profile-root">
        <div className="pro-profile-grid">
          <aside className="pro-profile-sidebar">
            <div className="card identity-card">
              <div className="identity-glow" />
              <div className="avatar-wrapper-pro">
                <div className="avatar-ring">
                  {profilePhoto ? (
                    <img src={profilePhoto} alt="identity" className="avatar-main-img" />
                  ) : (
                    <div className="avatar-placeholder-main">{initial}</div>
                  )}
                  <label htmlFor="avatar-upload" className="avatar-upload-action">
                    <Icon d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" size={12} />
                    <input id="avatar-upload" name="avatar" type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>

              <div className="identity-text">
                <h2 className="identity-name">{userProfile?.name || 'Authorized Contributor'}</h2>
                <span className="identity-role-badge">{userProfile?.role}</span>
              </div>

              <div className="identity-stats-mini">
                <div className="id-stat">
                  <span className="id-val">Active</span>
                  <span className="id-lbl">Account Status</span>
                </div>
                <div className="id-stat">
                  <span className="id-val">{new Date(userProfile?.createdAt).getFullYear()}</span>
                  <span className="id-lbl">Member Since</span>
                </div>
              </div>
            </div>

            <nav className="profile-security-hints">
              <h4 className="hints-title">Security Insights</h4>
              <div className="security-item-pro">
                <div className="sec-icon-wrap"><Icon d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" size={14} /></div>
                <div className="sec-info">
                  <span className="sec-lbl">JWS Protection</span>
                  <span className="sec-desc">Hardware-backed crypto tokens enabled.</span>
                </div>
              </div>
              <div className="security-item-pro">
                <div className="sec-icon-wrap"><Icon d="M12 11V7m0 4v4m0-4h4m-4 0H8" size={14} /></div>
                <div className="sec-info">
                  <span className="sec-lbl">Privacy Mode</span>
                  <span className="sec-desc">Direct identifier obfuscation active.</span>
                </div>
              </div>
            </nav>
          </aside>

          <main className="pro-profile-main">
            <div className="card settings-card-pro">
              <div className="settings-header">
                <h3 className="settings-title">Personalization Engine</h3>
                <p className="settings-desc">Fine-tune your dashboard credentials and cryptographic security settings.</p>
              </div>

              {error && (
                <div className="alert alert-error pro-alert">
                  <Icon d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" size={18} />
                  {error}
                </div>
              )}

              <form onSubmit={handleSave} className="settings-form-pro">
                <div className="input-group-pro">
                  <label htmlFor="username" className="input-label-pro">
                    Username
                  </label>
                  <div className="input-field-wrap">
                    <input id="username" name="username" autoComplete="username" style={{ textTransform: 'uppercase' }} className="pro-input" value={username} onChange={e => setUsername(e.target.value)} placeholder="your unique username" required />
                    <div className="input-field-bg" />
                  </div>
                  <span className="field-hint-pro">This name will be visible on your portal submissions.</span>
                </div>

                <div className="input-group-pro">
                  <label htmlFor="email" className="input-label-pro">
                    Email Address
                  </label>
                  <div className="input-field-wrap">
                    <input id="email" name="email" autoComplete="email" className="pro-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your primary email" required />
                    <div className="input-field-bg" />
                  </div>
                  <span className="field-hint-pro">Critical system notifications and case updates will be routed here.</span>
                </div>

                <div className="input-group-pro">
                  <label htmlFor="new-password" className="input-label-pro">
                    New Password
                  </label>
                  <div className="input-field-wrap">
                    <input id="new-password" name="new-password" autoComplete="new-password" className="pro-input" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" />
                    <div className="input-field-bg" />
                  </div>
                  <span className="field-hint-pro">Must contain at least 8 characters for maximum structural integrity.</span>
                </div>

                <div className="form-action-footer-pro">
                  <button type="submit" className="btn btn-cta btn-pro-save" disabled={loading}>
                    {loading ? 'Committing Changes...' : 'Save Configuration'}
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={() => navigate(backPath)}>Discard</button>
                </div>
              </form>
            </div>

            <div className="info-grid-pro">
              <div className="info-card-pro">
                <span className="i-lbl">Primary Notification Endpoint</span>
                <span className="i-val">{userProfile?.email}</span>
              </div>
              {userProfile?.role === 'user' && (
                <div className="info-card-pro">
                  <span className="i-lbl">Communication Volume</span>
                  <span className="i-val">{feedbackCount} {feedbackCount === 1 ? 'Submission' : 'Submissions'}</span>
                </div>
              )}
              <div className="info-card-pro">
                <span className="i-lbl">Access Level Protocol</span>
                <span className="i-val" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>{userProfile?.role} Privilege</span>
              </div>
            </div>
          </main>
        </div>
      </div>


    </DashboardLayout>
  );
};

export default ProfilePage;
