import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { LayoutDashboard, ListTodo, PieChart, Receipt, FileText, ShieldCheck, Settings, UserCircle2, LogOut } from 'lucide-react';

const PortalLayout = ({ children, onLogout, user }) => {
    const isAdmin = ['Admin', 'Super Admin'].includes(user?.role);
    const router = useRouter();

    const navItems = [
        { href: '/portal/dashboard', label: 'Operations Overview', icon: <LayoutDashboard size={18} /> },
        { href: '/portal/task-board', label: 'Task Board', icon: <ListTodo size={18} /> },
        { href: '/portal/deliverables', label: 'Deliverables Tracker', icon: <ShieldCheck size={18} /> },
        { href: '/portal/budget', label: 'Budget Requests', icon: <PieChart size={18} /> },
        { href: '/portal/expenditures', label: 'Expenditure Tracker', icon: <Receipt size={18} /> },
        { href: '/portal/reports', label: 'Docs & Reports', icon: <FileText size={18} /> },
        { href: '/portal/settings', label: 'Inventory & Access', icon: <Settings size={18} /> },
        { href: '/portal/my-account', label: 'My Account', icon: <UserCircle2 size={18} /> },
    ];

    return (
        <div className="portal-layout">
            <aside className="portal-sidebar">
                <div className="sidebar-header">
                    <Link href="/" className="sidebar-logo">
                        <span style={{ fontFamily: 'Cormorant Garamond', color: 'var(--accent-gold)', fontSize: '1.5rem', fontWeight: 700 }}>ACM<span style={{ color: 'var(--accent-gold-light)' }}>.</span>MAJU</span>
                    </Link>
                    <div className="label" style={{ color: 'var(--text-muted)', fontSize: '0.6rem', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Internal Portal</div>
                    {user && (
                        <div style={{ marginTop: '12px', padding: '10px 12px', background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)' }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user.name}</div>
                            <div className="label" style={{ color: isAdmin ? 'var(--accent-gold)' : 'var(--text-muted)', fontSize: '0.65rem', marginTop: '2px' }}>{user.role}</div>
                        </div>
                    )}
                </div>
                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <Link key={item.href} href={item.href} className={`nav-item ${router.pathname === item.href ? 'active' : ''}`}>
                            {item.icon} {item.label}
                        </Link>
                    ))}
                </nav>
                <div className="sidebar-footer">
                    <button className="logout-btn" onClick={onLogout}><LogOut size={18} /> Sign Out</button>
                </div>
            </aside>
            <main className="portal-main">
                <header className="portal-topbar">
                    <div className="breadcrumbs label">Jinnah League '26 — <span style={{ color: 'var(--text-secondary)' }}>Team & Operations Portal</span></div>
                    <div className="user-profile label">{user?.name || 'Admin'}</div>
                </header>
                <div className="portal-content">{children}</div>
            </main>
        </div>
    );
};

export default PortalLayout;
