import React, { useEffect } from 'react';

const Modal = ({ open, title, children, onClose, footer, width = '520px', closeOnBackdrop = true }) => {
    useEffect(() => {
        if (!open || typeof document === 'undefined') {
            return undefined;
        }

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const handleKeyDown = (event) => {
            if (event.key === 'Escape' && onClose) {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [open, onClose]);

    if (!open) {
        return null;
    }

    return (
        <div
            role="presentation"
            onClick={closeOnBackdrop ? onClose : undefined}
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 2000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px',
                background: 'rgba(5, 10, 16, 0.72)',
                backdropFilter: 'blur(6px)',
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby={title ? 'modal-title' : undefined}
                onClick={(event) => event.stopPropagation()}
                style={{
                    width: '100%',
                    maxWidth: width,
                    background: 'var(--bg-elevated, #121826)',
                    border: '1px solid var(--border)',
                    borderRadius: '16px',
                    boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
                    overflow: 'hidden',
                }}
            >
                {title ? (
                    <div style={{ padding: '20px 22px 0 22px' }}>
                        <h4 id="modal-title" style={{ margin: 0 }}>{title}</h4>
                    </div>
                ) : null}
                <div style={{ padding: title ? '16px 22px 22px' : '22px' }}>{children}</div>
                {footer ? (
                    <div style={{ padding: '0 22px 22px', display: 'flex', justifyContent: 'flex-end', gap: '10px', flexWrap: 'wrap' }}>
                        {footer}
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default Modal;
