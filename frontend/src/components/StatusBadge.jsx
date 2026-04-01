const statusConfig = {
  pending: { label: 'Pending', bg: '#FEF3C7', color: '#92400E' },
  'in-review': { label: 'In Review', bg: '#DBEAFE', color: '#1E40AF' },
  resolved: { label: 'Resolved', bg: '#D1FAE5', color: '#065F46' },
};

const StatusBadge = ({ status }) => {
  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '0.25rem 0.75rem',
        borderRadius: 999,
        fontSize: '0.78rem',
        fontWeight: 600,
        background: config.bg,
        color: config.color,
        whiteSpace: 'nowrap',
      }}
    >
      {config.label}
    </span>
  );
};

export default StatusBadge;
