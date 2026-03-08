import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import PortalLayout from './portal/PortalLayout';
import Dashboard from './portal/Dashboard';
import SponsorsTable from './portal/SponsorsTable';
import BudgetTracker from './portal/BudgetTracker';
import Expenditures from './portal/Expenditures';
import Reports from './portal/Reports';
import Settings from './portal/Settings';
import Button from '../components/Button';
import './Portal.css';

/* Hard-coded credentials from Section J1 */
const USERS = {
    'fa24bscs0113@maju.edu.pk': { password: 'acmjl26!PR', name: 'Abdul Rafay', role: 'Admin' },
    'fa22bscs0159@maju.edu.pk': { password: 'acmjl26!SG', name: 'Shahmir Sindhu', role: 'Admin' },
    'fa22bscs0174@maju.edu.pk': { password: 'acmjl26!TR', name: 'Atta Ur Rehman', role: 'Admin' },
    'fa23bece0042@maju.edu.pk': { password: 'acmjl26!EM', name: 'Love Maheshwari', role: 'Editor' },
    'fa24bsbt0018@maju.edu.pk': { password: 'acmjl26!MK', name: 'Muzna Moin', role: 'Editor' },
    'fa24bscs0044@maju.edu.pk': { password: 'acmjl26!SM', name: 'Mahnoor Sohail', role: 'Editor' },
    'sp24bscs0099@maju.edu.pk': { password: 'acmjl26!CC', name: 'Areeba Kalwar', role: 'Editor' },
    'fa22bscs0173@maju.edu.pk': { password: 'acmjl26!GD', name: 'Syed Abdul Sami', role: 'Editor' },
};

const Portal = () => {
    const stored = localStorage.getItem('adminAuth');
    const [user, setUser] = useState(stored ? JSON.parse(stored) : null);
    const [email, setEmail] = useState('');
    const [pw, setPw] = useState('');
    const [err, setErr] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        const u = USERS[email.toLowerCase().trim()];
        if (u && u.password === pw) {
            const authUser = { email, ...u };
            localStorage.setItem('adminAuth', JSON.stringify(authUser));
            setUser(authUser);
            navigate('/portal/dashboard');
        } else {
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

    return (
        <PortalLayout onLogout={logout} user={user}>
            <Routes>
                <Route path="/" element={<Dashboard user={user} />} />
                <Route path="/dashboard" element={<Dashboard user={user} />} />
                <Route path="/sponsors" element={<SponsorsTable user={user} />} />
                <Route path="/budget" element={<BudgetTracker user={user} />} />
                <Route path="/expenditures" element={<Expenditures user={user} />} />
                <Route path="/reports" element={<Reports user={user} />} />
                <Route path="/settings" element={<Settings user={user} />} />
            </Routes>
        </PortalLayout>
    );
};

export default Portal;
