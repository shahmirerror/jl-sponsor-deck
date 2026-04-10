import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import PortalLayout from './portal/PortalLayout';
import Button from '../components/Button';
import { portalUserStore } from '../lib/portalUserStore';

const Dashboard = dynamic(() => import('./portal/Dashboard'));
const SponsorsTable = dynamic(() => import('./portal/SponsorsTable'));
const BudgetTracker = dynamic(() => import('./portal/BudgetTracker'));
const Expenditures = dynamic(() => import('./portal/Expenditures'));
const Reports = dynamic(() => import('./portal/Reports'), { ssr: false });
const Settings = dynamic(() => import('./portal/Settings'));

const Portal = () => {
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
            setUser(stored ? JSON.parse(stored) : null);
        } catch {
            setUser(null);
        }
    }, []);

    const handleLogin = (e) => {
        e.preventDefault();
        try {
            const u = portalUserStore.authenticate('admin', email, pw);
            const authUser = { email: u.email, ...u };
            localStorage.setItem('adminAuth', JSON.stringify(authUser));
            setUser(authUser);
            router.push('/portal/dashboard');
        } catch {
            setErr('Invalid credentials. Contact your system administrator.');
        }
    };

    const logout = () => {
        localStorage.removeItem('adminAuth');
        setUser(null);
    };

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
                            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', marginTop: '8px' }} placeholder="xx00xxxx0000@maju.edu.pk" />
                        </div>
                        <div className="form-group" style={{ marginBottom: '28px' }}>
                            <label className="label">Password</label>
                            <input type="password" required value={pw} onChange={e => setPw(e.target.value)} style={{ width: '100%', marginTop: '8px' }} />
                        </div>
                        <Button type="submit" style={{ width: '100%' }}>Secure Login</Button>
                    </form>
                </div>
            </div>
        );
    }

    const page = router.pathname;

    const renderPortalPage = () => {
        switch (page) {
            case '/portal':
            case '/portal/dashboard':
                return <Dashboard user={user} />;
            case '/portal/task-board':
            case '/portal/sponsors':
                return <SponsorsTable user={user} />;
            case '/portal/budget':
                return <BudgetTracker user={user} />;
            case '/portal/expenditures':
                return <Expenditures user={user} />;
            case '/portal/reports':
                return <Reports user={user} />;
            case '/portal/settings':
                return <Settings user={user} />;
            default:
                return <Dashboard user={user} />;
        }
    };

    return (
        <PortalLayout onLogout={logout} user={user}>
            {renderPortalPage()}
        </PortalLayout>
    );
};

export default Portal;
