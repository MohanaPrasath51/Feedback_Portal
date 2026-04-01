import React from 'react';

const MediaViewer = ({ media, onClose }) => {
  if (!media) return null;

  const isImage = media.contentType?.startsWith('image/');

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = media.url;
    link.download = media.filename || 'evidence';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <div style={styles.info}>
            <span style={styles.filename}>{media.filename || 'Evidence'}</span>
            <span style={styles.type}>{media.contentType?.toUpperCase()}</span>
          </div>
          <div style={styles.actions}>
            <button style={styles.actionBtn} onClick={handleDownload} title="Download">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </button>
            <button style={styles.closeBtn} onClick={onClose}>&times;</button>
          </div>
        </div>
        <div style={styles.content}>
          {isImage ? (
            <img src={media.url} alt="Evidence" style={styles.image} />
          ) : (
            <div style={styles.filePlaceholder}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary)', marginBottom: '1.5rem' }}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              <p style={{ fontWeight: 600, color: 'var(--text-1)' }}>File Preview Unavailable</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-3)', marginTop: '0.5rem' }}>This match type cannot be previewed directly.</p>
              <button 
                style={{ ...styles.actionBtn, background: 'var(--primary)', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '12px', marginTop: '1.5rem', border: 'none', fontWeight: 700 }}
                onClick={handleDownload}
              >
                Download to View
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    padding: '2rem',
  },
  modal: {
    backgroundColor: 'var(--surface)',
    borderRadius: '24px',
    border: '1px solid var(--border)',
    width: '100%',
    maxWidth: '1000px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.25rem 2rem',
    borderBottom: '1px solid var(--border)',
    background: 'var(--surface-2)',
  },
  info: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  filename: {
    fontSize: '1rem',
    fontWeight: 800,
    color: 'var(--text-1)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  type: {
    fontSize: '0.7rem',
    fontWeight: 800,
    color: 'var(--text-3)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  actionBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-2)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    padding: '0.5rem',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-3)',
    fontSize: '2rem',
    lineHeight: 1,
    cursor: 'pointer',
    padding: '0 0.5rem',
    marginLeft: '0.5rem',
  },
  content: {
    flex: 1,
    overflow: 'auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    background: '#000',
  },
  image: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
    borderRadius: '8px',
  },
  filePlaceholder: {
    textAlign: 'center',
    background: 'var(--surface)',
    padding: '4rem',
    borderRadius: '24px',
    border: '1px solid var(--border)',
    width: '100%',
    maxWidth: '500px',
  }
};

export default MediaViewer;
