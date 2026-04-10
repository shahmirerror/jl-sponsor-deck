import React from 'react';

const Button = ({ children, variant = 'primary', className = '', startIcon, endIcon, ...props }) => {
    return (
        <button className={`btn btn-${variant} ${className}`} {...props}>
            {startIcon && <span className="btn-icon" aria-hidden="true">{startIcon}</span>}
            <span className="btn-label">{children}</span>
            {endIcon && <span className="btn-icon" aria-hidden="true">{endIcon}</span>}
        </button>
    );
};

export default Button;
