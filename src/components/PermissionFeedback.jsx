import React from 'react';

const baseDisabledButtonStyle = {
    padding: '10px 14px',
    background: 'var(--border)',
    color: 'var(--text-secondary)',
    border: 'none',
    borderRadius: '6px',
    cursor: 'not-allowed',
    opacity: 0.65,
    fontWeight: '600',
};

const baseReadOnlyNoteStyle = {
    color: 'var(--text-secondary)',
    fontSize: '0.82rem',
    marginBottom: '14px',
};

export const DisabledPermissionButton = ({ title, style = {}, children }) => (
    <button type="button" disabled title={title} style={{ ...baseDisabledButtonStyle, ...style }}>
        {children}
    </button>
);

export const PermissionReadOnlyNote = ({ style = {}, children }) => (
    <p style={{ ...baseReadOnlyNoteStyle, ...style }}>
        {children}
    </p>
);
