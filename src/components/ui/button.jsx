import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Button styles use inline style objects keyed by variant/size
// since this project uses CSS custom properties, not Tailwind.

const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    whiteSpace: 'nowrap',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontWeight: 500,
    fontFamily: 'DM Sans, sans-serif',
    cursor: 'pointer',
    border: 'none',
    transition: 'background 0.2s, color 0.2s, border-color 0.2s, opacity 0.2s',
    textDecoration: 'none',
    outline: 'none',
};

const variantStyles = {
    default: {
        background: 'var(--accent-gold)',
        color: '#080B10',
    },
    destructive: {
        background: 'var(--danger)',
        color: '#fff',
    },
    outline: {
        background: 'transparent',
        color: 'var(--text-primary)',
        border: '1px solid var(--border)',
    },
    secondary: {
        background: 'var(--bg-card)',
        color: 'var(--text-secondary)',
        border: '1px solid var(--border)',
    },
    ghost: {
        background: 'transparent',
        color: 'var(--text-primary)',
    },
    link: {
        background: 'transparent',
        color: 'var(--accent-gold)',
        textDecoration: 'underline',
        textUnderlineOffset: '4px',
    },
};

const sizeStyles = {
    default: { height: '40px', padding: '0 16px' },
    sm: { height: '36px', padding: '0 12px', borderRadius: '6px' },
    lg: { height: '44px', padding: '0 32px', borderRadius: '6px' },
    icon: { height: '40px', width: '40px', padding: 0 },
};

const Button = React.forwardRef(
    ({ className, variant = 'default', size = 'default', asChild = false, style, ...props }, ref) => {
        const Comp = asChild ? Slot : 'button';
        const combinedStyle = {
            ...baseStyle,
            ...variantStyles[variant] || variantStyles.default,
            ...sizeStyles[size] || sizeStyles.default,
            ...style,
        };
        return (
            <Comp
                ref={ref}
                style={combinedStyle}
                {...props}
            />
        );
    }
);

Button.displayName = 'Button';

export { Button };
