import React from 'react';
import './ImagePlaceholder.css';

/**
 * Renders a shimmer placeholder card for any image slot.
 * @param {string} label - The placeholder label (e.g. "PHOTO_1", "LOGO_1")
 * @param {string} width - CSS width (default: '100%')
 * @param {string} height - CSS height (default: '200px')
 * @param {string} className - Extra CSS classes
 */
const ImagePlaceholder = ({ label = 'IMAGE', width = '100%', height = '200px', className = '' }) => {
    return (
        <div
            className={`img-placeholder ${className}`}
            style={{ width, height }}
            title={`Placeholder for: ${label}`}
        >
            <span className="placeholder-icon">🖼</span>
            <span className="placeholder-label">{label}</span>
        </div>
    );
};

export default ImagePlaceholder;
