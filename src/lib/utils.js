import { clsx } from 'clsx';

/**
 * Combines class names, filtering out falsy values.
 * Mirrors the shadcn `cn` utility.
 */
export function cn(...inputs) {
    return clsx(inputs);
}
