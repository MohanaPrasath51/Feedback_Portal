import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import FeedbackForm from '../components/FeedbackForm';
import '../css/SubmitFeedbackPage.css';

const Icon = ({ d, size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d={d} />
  </svg>
);

const SubmitFeedbackPage = () => {
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);

  const handleSuccess = () => {
    setSuccess(true);
    setTimeout(() => navigate('/home'), 2500);
  };

  return (
    <DashboardLayout
      activeTab="__submit__"
      setActiveTab={() => {}}
      navItems={[]}
      title="Create Submission"
      topbarActions={
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/home')}>
          <Icon d="M19 12H5M12 19l-7-7 7-7" size={14} />
          Back to Dashboard
        </button>
      }
    >
      <div className="submit-page-container">
        <div className="submit-page-content">
          <div className="page-header">
            <div className="page-header-with-icon">
              <div className="submission-icon-wrapper">
                <Icon d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" size={24} />
              </div>
              <div>
                <h1 className="page-title">Submit Feedback</h1>
                <p className="page-subtitle">Your insights help us improve the experience for everyone.</p>
              </div>
            </div>
          </div>

          <div className="submit-grid">
            <div className="submit-form-column">
              <div className="card submission-card">
                {success ? (
                  <div className="submission-success">
                    <div className="success-anim-wrapper">
                      <div className="success-check-icon">✓</div>
                    </div>
                    <h2 className="success-title">Feedback Received!</h2>
                    <p className="success-message">
                      Thank you for your valuable input. We've received your submission and our team will review it shortly.
                    </p>
                    <div className="success-loader">
                      <div className="success-loader-bar"></div>
                    </div>
                    <p className="success-redirect">Redirecting to dashboard...</p>
                  </div>
                ) : (
                  <FeedbackForm onSuccess={handleSuccess} />
                )}
              </div>
            </div>

            <div className="submit-info-column">
              <div className="info-section">
                <h3 className="info-section-title">
                  <Icon d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" size={16} />
                  Submission Tips
                </h3>
                <ul className="info-list">
                  <li>
                    <strong>Be Specific:</strong> Clear descriptions help us understand the issue or suggestion faster.
                  </li>
                  <li>
                    <strong>Categorize:</strong> Choosing the right category ensures your feedback reaches the right team.
                  </li>
                  <li>
                    <strong>Priority:</strong> Set priority based on how much this affects your workflow.
                  </li>
                </ul>
              </div>

              <div className="info-section alternate">
                <h3 className="info-section-title">
                  <Icon d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" size={16} />
                  What happens next?
                </h3>
                <p className="info-text">
                  Once submitted, our team will review your feedback. You can track the status of your submission directly from your dashboard.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>


    </DashboardLayout>
  );
};

export default SubmitFeedbackPage;
