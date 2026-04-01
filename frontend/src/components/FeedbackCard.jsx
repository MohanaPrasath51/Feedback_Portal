import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { useAuth } from '../context/AuthContext';

const priorityColors = {
  low: { bg: '#F0FDF4', color: '#166534' },
  medium: { bg: '#FFFBEB', color: '#92400E' },
  high: { bg: '#FFF1F2', color: '#9F1239' },
};

const categoryColors = {
  suggestion: '#EFF6FF',
  complaint: '#FFF7ED',
  general: '#F5F3FF',
};

const FeedbackCard = ({ feedback }) => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const isAdminOrTeam = userProfile?.role === 'admin' || userProfile?.role === 'team';

  const handleClick = () => {
    if (isAdminOrTeam) {
      navigate(`/admin/${userProfile?.username || 'user'}/feedback/${feedback._id}`);
    } else {
      navigate(`/feedback/${feedback._id}`);
    }
  };

  const priority = priorityColors[feedback.priority] || priorityColors.medium;
  const catBg = categoryColors[feedback.category] || '#F9FAFB';

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  return (
    <div
      onClick={handleClick}
      style={{
        background: '#fff',
        border: '1px solid #E5E7EB',
        borderRadius: 12,
        padding: '1.25rem 1.5rem',
        cursor: 'pointer',
        transition: 'transform 0.15s, box-shadow 0.15s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)';
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#111827', margin: 0 }}>
              {feedback.title}
            </h3>
            {feedback.attachments?.length > 0 && (
              <span style={{ fontSize: '0.9rem', color: '#6366F1', display: 'flex', alignItems: 'center' }} title={`${feedback.attachments.length} attachments`}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" transform="rotate(45)">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                </svg>
              </span>
            )}
            {feedback.duplicateCount > 0 && (
              <span style={{ padding: '0.2rem 0.5rem', borderRadius: '1rem', backgroundColor: '#FEF3C7', color: '#D97706', fontSize: '0.75rem', fontWeight: 600, border: '1px solid #FCD34D' }}>
                🔥 Reported by {feedback.duplicateCount + 1} users
              </span>
            )}
            {feedback.isDuplicate && (
              <span style={{ padding: '0.2rem 0.5rem', borderRadius: '1rem', backgroundColor: '#E0E7FF', color: '#4338CA', fontSize: '0.75rem', fontWeight: 600, border: '1px solid #C7D2FE' }}>
                🔗 Merged Issue
              </span>
            )}
          </div>
          <p style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '0.75rem', lineHeight: 1.5, margin: 0, paddingBottom: '0.75rem' }}>
            {feedback.description.length > 120
              ? feedback.description.slice(0, 120) + '...'
              : feedback.description}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ padding: '0.2rem 0.6rem', borderRadius: 6, background: catBg, fontSize: '0.78rem', fontWeight: 600, textTransform: 'capitalize', color: '#374151' }}>
              {feedback.category}
            </span>
            <span style={{ padding: '0.2rem 0.6rem', borderRadius: 6, background: priority.bg, fontSize: '0.78rem', fontWeight: 600, color: priority.color, textTransform: 'capitalize' }}>
              {feedback.priority} priority
            </span>
            {isAdminOrTeam && feedback.submittedBy && (
              <span style={{ fontSize: '0.78rem', color: '#6B7280' }}>
                by {feedback.submittedBy.name || feedback.submittedBy.email}
              </span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
          <StatusBadge status={feedback.status} />
          <span style={{ fontSize: '0.75rem', color: '#9CA3AF', whiteSpace: 'nowrap' }}>
            {formatDate(feedback.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default FeedbackCard;
