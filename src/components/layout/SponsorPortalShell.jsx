import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Button from '../Button';
import { sponsorHelpers } from '../../lib/supabaseHelpers';
import { BadgeCheck, Building2, FolderOpen, Image, LayoutDashboard, LogOut, MessageSquare, ReceiptText, ShieldCheck, UserCircle2, BarChart3 } from 'lucide-react';

const SponsorPortalLayout = ({ children, onLogout, sponsor }) => {
    const router = useRouter();
    const currentPath = router.pathname;
    const isDashboardRoute = currentPath === '/sponsor-portal' || currentPath === '/sponsor-portal/dashboard';

    const navItems = [
        { label: 'Dashboard', path: '/sponsor-portal/dashboard', icon: <LayoutDashboard size={18} /> },
        { label: 'Deliverables', path: '/sponsor-portal/deliverables', icon: <ShieldCheck size={18} /> },
        { label: 'Asset Vault', path: '/sponsor-portal/documents', icon: <FolderOpen size={18} /> },
        { label: 'Financial Ledger', path: '/sponsor-portal/ledger', icon: <ReceiptText size={18} /> },
        { label: 'Proof Gallery', path: '/sponsor-portal/social-proof', icon: <Image size={18} /> },
        { label: 'Support', path: '/sponsor-portal/support', icon: <MessageSquare size={18} /> },
        { label: 'My Account', path: '/sponsor-portal/my-account', icon: <UserCircle2 size={18} /> },
    ];

    const currentSection = navItems.find((item) => item.path === currentPath || (isDashboardRoute && item.path === '/sponsor-portal/dashboard'))?.label || 'Sponsor Portal';

    const isActive = (item) => currentPath === item.path || (isDashboardRoute && item.path === '/sponsor-portal/dashboard');

    return (
        <div className="portal-layout" style={{ background: 'var(--bg-primary)' }}>
            <aside className="portal-sidebar" style={{ width: '280px' }}>
                <div className="sidebar-header">
                    <Link href="/sponsor-portal/dashboard" className="sidebar-logo" style={{ display: 'inline-flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontFamily: 'Cormorant Garamond', color: 'var(--accent-gold)', fontSize: '1.5rem', fontWeight: 700 }}>ACM<span style={{ color: 'var(--accent-gold-light)' }}>.</span>MAJU</span>
                        <span className="label" style={{ color: 'var(--text-muted)', fontSize: '0.62rem', letterSpacing: '0.12em' }}>Sponsor Portal</span>
                    </Link>

                    <div style={{ marginTop: '18px', padding: '14px 16px', background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                            <span style={{ width: '34px', height: '34px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(201,168,76,0.16)', color: 'var(--accent-gold)' }}>
                                <Building2 size={18} />
                            </span>
                            <div>
                                <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>{sponsor?.company}</div>
                                <div className="label" style={{ color: 'var(--accent-gold)', fontSize: '0.62rem', marginTop: '2px' }}>{sponsor?.tier || 'Sponsor'}</div>
                            </div>
                        </div>
                        {sponsor?.contactName && (
                            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{sponsor.contactName}</div>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px', color: 'var(--success)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                            <BadgeCheck size={14} /> Active partnership
                        </div>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <button
                            key={`${item.label}-${item.path}`}
                            onClick={() => router.push(item.path)}
                            className={`nav-item ${isActive(item) ? 'active' : ''}`}
                            style={{
                                border: 'none',
                                width: '100%',
                                background: isActive(item) ? 'rgba(201,168,76,0.08)' : 'transparent',
                                borderLeft: isActive(item) ? '3px solid var(--accent-gold)' : '3px solid transparent',
                                color: isActive(item) ? 'var(--accent-gold)' : 'var(--text-secondary)',
                                cursor: 'pointer',
                                fontSize: '0.92rem',
                                textAlign: 'left',
                            }}
                        >
                            <span style={{ marginRight: '12px', display: 'inline-flex', alignItems: 'center' }}>{item.icon}</span>
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <button
                        onClick={onLogout}
                        className="logout-btn"
                        style={{ color: 'var(--text-secondary)', width: '100%' }}
                    >
                        <LogOut size={18} /> Sign Out
                    </button>
                </div>
            </aside>

            <main className="portal-main" style={{ background: 'var(--bg-secondary)' }}>
                <header className="portal-topbar" style={{ height: '78px' }}>
                    <div>
                        <div className="label" style={{ color: 'var(--text-muted)', fontSize: '0.64rem', letterSpacing: '0.14em' }}>Jinnah League '26 — Sponsor Portal</div>
                        <div style={{ marginTop: '4px', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{currentSection}</div>
                    </div>
                    <div className="user-profile label" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px', color: 'var(--text-secondary)' }}>
                        <span style={{ color: 'var(--text-primary)', letterSpacing: '0.06em' }}>{sponsor?.contactName || sponsor?.email || 'Sponsor'}</span>
                        <span style={{ color: 'var(--accent-gold)', fontSize: '0.65rem' }}>{sponsor?.company || 'Active account'}</span>
                    </div>
                </header>
                <div className="portal-content" style={{ background: 'var(--bg-secondary)' }}>
                    {children}
                </div>
            </main>
        </div>
    );
};

const SponsorPortalShell = ({ renderPage }) => {
    const router = useRouter();
    const [sponsor, setSponsor] = useState(null);
    const [email, setEmail] = useState('');
    const [pw, setPw] = useState('');
    const [err, setErr] = useState('');
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const mapSponsor = (row) => ({
        id: row.id,
        email: row.contact_email || row.email || '',
        company: row.company_name || 'Sponsor',
        tier: row.tier || 'Gold',
        committed: Number(row.committed_amount || 0),
        contactName: row.contact_name || '',
        status: row.status || 'active',
        password: row.password_hash || '',
    });

    useEffect(() => {
        let active = true;

        const bootstrapSession = async () => {
            try {
                const raw = typeof window !== 'undefined' ? window.localStorage.getItem('sponsorAuth') : null;
                if (!raw) {
                    if (active) {
                        setSponsor(null);
                    }
                    return;
                }

                const parsed = JSON.parse(raw);
                const emailFromSession = String(parsed?.email || '').trim().toLowerCase();
                if (!emailFromSession) {
                    if (active) {
                        setSponsor(null);
                    }
                    return;
                }

                const { data, error } = await sponsorHelpers.getSponsorByEmail(emailFromSession);
                if (error || !data) {
                    if (active) {
                        setSponsor(null);
                        window.localStorage.removeItem('sponsorAuth');
                    }
                    return;
                }

                if (active) {
                    setSponsor(mapSponsor(data));
                }
            } catch {
                if (active) {
                    setSponsor(null);
                }
            } finally {
                if (active) {
                    setIsAuthLoading(false);
                }
            }
        };

        bootstrapSession();

        return () => {
            active = false;
        };
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setErr('');
        setIsSubmitting(true);

        try {
            const normalizedEmail = String(email || '').trim().toLowerCase();
            const { data, error } = await sponsorHelpers.getSponsorByEmail(normalizedEmail);
            if (error || !data) {
                throw new Error(error?.message || 'Account not found.');
            }

            if (String(data.status || 'active').toLowerCase() !== 'active') {
                throw new Error('This sponsor account is disabled. Please contact support.');
            }

            const storedPassword = String(data.password_hash || '');
            if (!storedPassword || storedPassword !== String(pw || '')) {
                throw new Error('Invalid credentials. Please contact us for access.');
            }

            const authSponsor = mapSponsor(data);
            setSponsor(authSponsor);
            if (typeof window !== 'undefined') {
                window.localStorage.setItem('sponsorAuth', JSON.stringify({ email: authSponsor.email }));
            }
            router.push('/sponsor-portal/dashboard');
        } catch (error) {
            setErr(error?.message || 'Unable to sign in right now.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const logout = async () => {
        if (typeof window !== 'undefined') {
            window.localStorage.removeItem('sponsorAuth');
        }
        setSponsor(null);
        router.push('/sponsor-portal');
    };

    const updateMyAccount = async ({ name, currentPassword, newPassword }) => {
        if (!sponsor?.email) {
            throw new Error('No active session found. Please sign in again.');
        }

        const { data: liveSponsor, error } = await sponsorHelpers.getSponsorByEmail(sponsor.email);
        if (error || !liveSponsor) {
            throw new Error(error?.message || 'Unable to load sponsor account.');
        }

        if (newPassword) {
            const existingPassword = String(liveSponsor.password_hash || '');
            if (existingPassword !== String(currentPassword || '')) {
                throw new Error('Current password is incorrect.');
            }
        }

        const updates = { updated_at: new Date().toISOString() };
        if (name && String(name).trim()) {
            updates.contact_name = String(name).trim();
        }
        if (newPassword && String(newPassword).trim()) {
            updates.password_hash = String(newPassword).trim();
        }

        const updateResult = await sponsorHelpers.updateSponsor(liveSponsor.id, updates);
        if (updateResult.error || !updateResult.data?.[0]) {
            throw new Error(updateResult.error?.message || 'Unable to save account changes.');
        }

        const updated = mapSponsor(updateResult.data[0]);
        setSponsor(updated);
        return updated;
    };

    const accountActions = useMemo(() => ({
        updateMyAccount,
    }), [sponsor]);

    if (isAuthLoading) {
        return (
            <div className="portal-login-screen">
                <div className="login-card card" style={{ textAlign: 'center', padding: '32px' }}>
                    <p style={{ color: 'var(--text-secondary)' }}>Loading sponsor portal...</p>
                </div>
            </div>
        );
    }

    if (!sponsor) {
        return (
            <div className="portal-login-screen">
                <div className="login-card card">
                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <h2 style={{ fontFamily: 'Cormorant Garamond', color: 'var(--accent-gold)' }}>ACM<span>.</span>MAJU</h2>
                        <p className="label" style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Jinnah League '26 — Sponsor Portal</p>
                    </div>
                    {err && <p style={{ color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '16px' }}>{err}</p>}
                    <form onSubmit={handleLogin}>
                        <div className="form-group" style={{ marginBottom: '16px' }}>
                            <label className="label">Company Email</label>
                            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', marginTop: '8px' }} placeholder="sponsor@company.com" />
                        </div>
                        <div className="form-group" style={{ marginBottom: '28px' }}>
                            <label className="label">Password</label>
                            <input type="password" required value={pw} onChange={(e) => setPw(e.target.value)} style={{ width: '100%', marginTop: '8px' }} />
                        </div>
                        <Button type="submit" style={{ width: '100%' }} disabled={isSubmitting}>
                            {isSubmitting ? 'Signing In...' : 'Sign In'}
                        </Button>
                    </form>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '24px', textAlign: 'center' }}>
                        Demo accounts: sponsor@aksiq.com, sponsor@gtv.com, sponsor@inspedium.com, sponsor@matz.com<br />
                        Passwords: [company]2026! (e.g., aksiq2026!)
                    </p>
                </div>
            </div>
        );
    }

    return <SponsorPortalLayout onLogout={logout} sponsor={sponsor}>{renderPage(sponsor, accountActions)}</SponsorPortalLayout>;
};

export default SponsorPortalShell;