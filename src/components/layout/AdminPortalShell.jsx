import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Button from '../Button';
import PortalLayout from '../../pages_old/portal/PortalLayout';
import { portalUserStore } from '../../lib/portalUserStore';
import { supabaseStatus } from '../../lib/supabaseHelpers';

const isStrongPassword = (password) => {
    const value = String(password || '');
    return value.length >= 8
        && /[a-z]/.test(value)
        && /[A-Z]/.test(value)
        && /\d/.test(value)
        && /[^A-Za-z0-9]/.test(value);
};

const AdminPortalShell = ({ renderPage }) => {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [email, setEmail] = useState('');
    const [pw, setPw] = useState('');
    const [err, setErr] = useState('');

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        try {
            const stored = localStorage.getItem('adminAuth');
            const parsed = stored ? JSON.parse(stored) : null;
            if (parsed?.email) {
                const activeAccount = portalUserStore.getUser('admin', parsed.email);
                if (activeAccount && activeAccount.status === 'active') {
                    setUser({ ...parsed, ...activeAccount });
                    return;
                }
            }
            setUser(null);
        } catch {
            setUser(null);
        }
    }, []);

    const handleLogin = (e) => {
        e.preventDefault();
        try {
            const account = portalUserStore.authenticate('admin', email, pw);
            const authUser = { email: account.email, ...account };
            localStorage.setItem('adminAuth', JSON.stringify(authUser));
            setUser(authUser);
            router.push('/portal/dashboard');
            return;
        } catch {
            // Error message is set below for invalid credentials.
        }

        setErr('Invalid credentials. Contact your system administrator.');
    };

    const logout = () => {
        localStorage.removeItem('adminAuth');
        setUser(null);
        router.push('/portal');
    };

    const updateMyAccount = async ({ name, currentPassword, newPassword }) => {
        if (!user?.email) {
            throw new Error('No active session found. Please sign in again.');
        }

        const patch = {};
        const trimmedName = String(name || '').trim();
        const nextPassword = String(newPassword || '').trim();

        if (trimmedName) {
            patch.name = trimmedName;
        }

        if (nextPassword) {
            const current = String(currentPassword || '');
            if (!current) {
                throw new Error('Current password is required to set a new password.');
            }

            portalUserStore.authenticate('admin', user.email, current);

            if (!isStrongPassword(nextPassword)) {
                throw new Error('New password must be 8+ characters and include uppercase, lowercase, number, and symbol.');
            }

            patch.password = nextPassword;
        }

        if (!Object.keys(patch).length) {
            throw new Error('Nothing to update.');
        }

        const updated = portalUserStore.updateUser('admin', user.email, patch);
        if (!updated) {
            throw new Error('Unable to update account right now.');
        }

        const authUser = { email: updated.email, ...updated };
        localStorage.setItem('adminAuth', JSON.stringify(authUser));
        setUser(authUser);
        return authUser;
    };

    const accountActions = useMemo(() => ({
        updateMyAccount,
    }), [user]);

    if (!user) {
        return (
            <div className="portal-login-screen">
                <div className="login-card card">
                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <h2 style={{ fontFamily: 'Cormorant Garamond', color: 'var(--accent-gold)' }}>ACM<span>.</span>MAJU</h2>
                        <p className="label" style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Jinnah League '26 — Internal Portal</p>
                    </div>
                    {err && <p style={{ color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '16px' }}>{err}</p>}
                    <form onSubmit={handleLogin}>
                        <div className="form-group" style={{ marginBottom: '16px' }}>
                            <label className="label">University Email</label>
                            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', marginTop: '8px' }} placeholder="xx00xxxx0000@maju.edu.pk" />
                        </div>
                        <div className="form-group" style={{ marginBottom: '28px' }}>
                            <label className="label">Password</label>
                            <input type="password" required value={pw} onChange={(e) => setPw(e.target.value)} style={{ width: '100%', marginTop: '8px' }} />
                        </div>
                        <Button type="submit" style={{ width: '100%' }}>Secure Login</Button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <>
            {(() => {
                const isConfigured = Boolean(supabaseStatus.configured);
                return (
            <div
                style={{
                    position: 'fixed',
                    top: '12px',
                    right: '12px',
                    zIndex: 1200,
                    padding: '6px 10px',
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    letterSpacing: '0.02em',
                    border: isConfigured ? '1px solid rgba(34,197,94,0.35)' : '1px solid rgba(245,158,11,0.35)',
                    background: isConfigured ? 'rgba(34,197,94,0.14)' : 'rgba(245,158,11,0.14)',
                    color: isConfigured ? 'var(--success)' : 'var(--warning)',
                }}
                title={isConfigured ? 'Supabase connected.' : 'Supabase configuration missing in this runtime.'}
            >
                {isConfigured ? 'DB: CONNECTED' : 'DB: CONFIG MISSING'}
            </div>
                );
            })()}
            <PortalLayout onLogout={logout} user={user}>{renderPage(user, accountActions)}</PortalLayout>
        </>
    );
};

export default AdminPortalShell;