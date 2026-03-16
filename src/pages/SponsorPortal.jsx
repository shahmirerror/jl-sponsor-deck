import React, { useState } from 'react';
import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { LayoutDashboard, FileText, LogOut, CheckSquare, Image, CalendarDays } from 'lucide-react';
import ImagePlaceholder from '../components/ImagePlaceholder';

/* ── Mock sponsor accounts ── */
const SPONSORS = {
    'sponsor@dubaiislamicbank.com': { password: 'dib2026', name: 'Dubai Islamic Bank', tier: 'Platinum', committed: 450000, received: 450000, status: 'Paid', startDate: '2026-01-10', contact: { name: 'Abdul Rafay', title: 'Director PR', email: 'acm@jinnah.edu', whatsapp: '+923490833806' } },
    'sponsor@inspedium.com': { password: 'insp2026', name: 'Inspedium', tier: 'Gold', committed: 200000, received: 200000, status: 'Paid', startDate: '2026-01-20', contact: { name: 'Abdul Rafay', title: 'Director PR', email: 'acm@jinnah.edu', whatsapp: '+923490833806' } },
    'sponsor@demo.com': { password: 'demo123', name: 'Demo Company', tier: 'Gold', committed: 200000, received: 100000, status: 'Partial', startDate: '2026-02-01', contact: { name: 'Abdul Rafay', title: 'Director PR', email: 'acm@jinnah.edu', whatsapp: '+923490833806' } },
};

/* ── Root auth gate (proper useState) ── */
const SponsorPortal = () => {
    const router = useRouter();
    const [sponsor, setSponsor] = useState(null);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        try {
            const stored = localStorage.getItem('sponsor_auth');
            setSponsor(stored ? JSON.parse(stored) : null);
        } catch {
            setSponsor(null);
        }
    }, []);

    const handleLogin = (sponsorData) => {
        localStorage.setItem('sponsor_auth', JSON.stringify(sponsorData));
        setSponsor(sponsorData);
        router.push('/sponsor-portal/dashboard');
    };

    const handleLogout = () => {
        localStorage.removeItem('sponsor_auth');
        setSponsor(null);
        router.push('/sponsor-portal');
    };

    useEffect(() => {
        if (sponsor && router.pathname === '/sponsor-portal') {
            router.replace('/sponsor-portal/dashboard');
        }
    }, [sponsor, router]);

    if (!sponsor) {
        return <SponsorLogin onLogin={handleLogin} />;
    }

    const currentPath = router.pathname;

    const renderSponsorPage = () => {
        switch (currentPath) {
            case '/sponsor-portal/dashboard':
                return <SponsorOverview sponsor={sponsor} />;
            case '/sponsor-portal/deliverables':
                return <SponsorDeliverables sponsor={sponsor} />;
            case '/sponsor-portal/documents':
                return <SponsorDocuments />;
            case '/sponsor-portal/social-proof':
                return <SponsorSocialProof />;
            case '/sponsor-portal/event-info':
                return <SponsorEventInfo />;
            case '/sponsor-portal':
                return null;
            default:
                return <SponsorOverview sponsor={sponsor} />;
        }
    };

    return (
        <SponsorLayout sponsor={sponsor} onLogout={handleLogout} currentPath={currentPath}>
            {renderSponsorPage()}
        </SponsorLayout>
    );
};

/* ── Login screen ── */
function SponsorLogin({ onLogin }) {
    const [email, setEmail] = useState('');
    const [pw, setPw] = useState('');
    const [err, setErr] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        const s = SPONSORS[email.toLowerCase().trim()];
        if (s && s.password === pw) {
            onLogin({ email: email.toLowerCase().trim(), ...s });
        } else {
            setErr('Invalid credentials. Contact your ACM MAJU partnership manager.');
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', padding: '20px' }}>
            <div style={{ width: '100%', maxWidth: '440px' }}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div style={{ fontFamily: 'Cormorant Garamond', fontSize: '2.2rem', color: 'var(--accent-gold)', fontWeight: 700, lineHeight: 1 }}>
                        ACM<span style={{ color: 'var(--accent-gold-light)' }}>.</span>MAJU
                    </div>
                    <div style={{ fontFamily: 'Syne', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-muted)', marginTop: '6px' }}>
                        Sponsor Partner Hub — Jinnah League '26
                    </div>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '14px', fontSize: '0.9rem' }}>
                        Your partnership dashboard: fully transparent.
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderTop: '3px solid var(--accent-gold)', padding: '40px 44px' }}>
                    {err && (
                        <div style={{ background: 'rgba(255,80,80,0.08)', border: '1px solid var(--danger)', padding: '12px 16px', marginBottom: '20px', color: 'var(--danger)', fontSize: '0.85rem' }}>
                            {err}
                        </div>
                    )}
                    <div style={{ marginBottom: '20px' }}>
                        <label className="label" style={{ display: 'block', marginBottom: '8px' }}>Partner Email</label>
                        <input
                            type="email" value={email} required
                            onChange={e => setEmail(e.target.value)}
                            placeholder="yourname@company.com"
                            style={{ width: '100%' }}
                        />
                    </div>
                    <div style={{ marginBottom: '32px' }}>
                        <label className="label" style={{ display: 'block', marginBottom: '8px' }}>Password</label>
                        <input
                            type="password" value={pw} required
                            onChange={e => setPw(e.target.value)}
                            style={{ width: '100%' }}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px' }}>
                        Access Partner Hub
                    </button>
                </form>

                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                        Credentials are provided by the ACM MAJU partnership team.
                    </p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '4px' }}>
                        Demo: <code style={{ color: 'var(--accent-gold)', background: 'rgba(201,168,76,0.1)', padding: '2px 6px' }}>sponsor@demo.com</code> / <code style={{ color: 'var(--accent-gold)', background: 'rgba(201,168,76,0.1)', padding: '2px 6px' }}>demo123</code>
                    </p>
                </div>
            </div>
        </div>
    );
}

/* ── Layout shell ── */
function SponsorLayout({ sponsor, onLogout, children, currentPath }) {
    const nav = [
        { href: '/sponsor-portal/dashboard', icon: <LayoutDashboard size={18} />, label: 'Partnership Overview' },
        { href: '/sponsor-portal/deliverables', icon: <CheckSquare size={18} />, label: 'Deliverables' },
        { href: '/sponsor-portal/documents', icon: <FileText size={18} />, label: 'Documents' },
        { href: '/sponsor-portal/social-proof', icon: <Image size={18} />, label: 'Social Proof' },
        { href: '/sponsor-portal/event-info', icon: <CalendarDays size={18} />, label: 'Event Info' },
    ];

    return (
        <div className="portal-layout">
            <aside className="portal-sidebar">
                <div className="sidebar-header">
                    <div style={{ fontFamily: 'Cormorant Garamond', fontSize: '1.5rem', color: 'var(--accent-gold)', fontWeight: 700 }}>
                        ACM<span style={{ opacity: 0.7 }}>.</span>MAJU
                    </div>
                    <div className="label" style={{ color: 'var(--text-muted)', fontSize: '0.6rem', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        Partner Hub
                    </div>
                    <div style={{ marginTop: '14px', padding: '10px 12px', background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '2px' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '2px' }}>{sponsor.name}</div>
                        <div className="label" style={{ color: 'var(--accent-gold)', fontSize: '0.65rem' }}>{sponsor.tier} Sponsor</div>
                    </div>
                </div>
                <nav className="sidebar-nav">
                    {nav.map(n => (
                        <Link
                            key={n.href}
                            href={n.href}
                            className={`nav-item ${currentPath === n.href ? 'active' : ''}`}
                        >
                            {n.icon} {n.label}
                        </Link>
                    ))}
                </nav>
                <div className="sidebar-footer">
                    <button className="logout-btn" onClick={onLogout}>
                        <LogOut size={18} /> Sign Out
                    </button>
                </div>
            </aside>
            <main className="portal-main">
                <header className="portal-topbar">
                    <div className="breadcrumbs label">
                        Jinnah League '26 — <span style={{ color: 'var(--text-secondary)' }}>Sponsor Portal</span>
                    </div>
                    <div className="user-profile label">{sponsor.name}</div>
                </header>
                <div className="portal-content">{children}</div>
            </main>
        </div>
    );
}

/* ── Tab 1: Partnership Overview ── */
function SponsorOverview({ sponsor }) {
    const statusColor = { Paid: 'var(--success)', Partial: 'var(--warning)', Pending: 'var(--text-muted)', Overdue: 'var(--danger)' };
    const remaining = sponsor.committed - sponsor.received;
    return (
        <div>
            <h2 style={{ marginBottom: '8px' }}>My Partnership Overview</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '0.9rem' }}>
                Welcome back! Here's a real-time view of your Jinnah League '26 sponsorship status.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px,1fr))', gap: '20px', marginBottom: '32px' }}>
                {[
                    { label: 'Sponsorship Tier', value: sponsor.tier, color: 'var(--accent-gold)' },
                    { label: 'Amount Committed', value: `Rs. ${sponsor.committed.toLocaleString('en-IN')}`, color: 'var(--text-primary)' },
                    { label: 'Amount Received', value: `Rs. ${sponsor.received.toLocaleString('en-IN')}`, color: 'var(--success)' },
                    { label: 'Remaining Balance', value: `Rs. ${remaining.toLocaleString('en-IN')}`, color: remaining > 0 ? 'var(--warning)' : 'var(--success)' },
                    { label: 'Payment Status', value: sponsor.status, color: statusColor[sponsor.status] || 'var(--text-muted)' },
                    { label: 'Partner Since', value: new Date(sponsor.startDate).toLocaleDateString('en-PK', { month: 'long', day: 'numeric', year: 'numeric' }), color: 'var(--text-secondary)' },
                ].map((k, i) => (
                    <div key={i} className="card" style={{ padding: '24px 20px' }}>
                        <div className="label" style={{ marginBottom: '10px', color: 'var(--text-muted)' }}>{k.label}</div>
                        <div className="data-figure" style={{ color: k.color, fontSize: '1.1rem' }}>{k.value}</div>
                    </div>
                ))}
            </div>
            <div className="card" style={{ padding: '28px' }}>
                <div className="label" style={{ marginBottom: '16px', color: 'var(--text-muted)' }}>Your Partnership Manager</div>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <ImagePlaceholder label="CONTACT_PHOTO" width="56px" height="56px" />
                    <div>
                        <strong style={{ fontSize: '1rem' }}>{sponsor.contact.name}</strong>
                        <div className="label" style={{ color: 'var(--accent-gold)', fontSize: '0.65rem', marginTop: '2px' }}>{sponsor.contact.title}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{sponsor.contact.email}</div>
                        <a href={`https://wa.me/${sponsor.contact.whatsapp}`} target="_blank" rel="noopener noreferrer"
                            style={{ color: '#25d366', fontSize: '0.8rem', marginTop: '6px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            💬 WhatsApp
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ── Tab 2: Deliverables ── */
function SponsorDeliverables({ sponsor }) {
    const base = [
        { item: 'Partnership announced on social media', status: 'Done' },
        { item: 'Logo added to official event website', status: 'Pending' },
        { item: 'Logo on Guide Book', status: 'Pending' },
        { item: 'Dedicated Shield / Award', status: 'Pending' },
        { item: 'Verbal mention at Opening Ceremony', status: 'Pending' },
        { item: 'Verbal mention at Closing Ceremony', status: 'Pending' },
        { item: 'Media coverage during event proceedings', status: 'Pending' },
    ];
    const gold = [
        { item: 'Logo on Apparel (team shirts & ambassadors)', status: 'Pending' },
        { item: 'Gift bag integration (pamphlets + product)', status: 'Pending' },
        { item: 'Logo on All Event Posters', status: 'Pending' },
        { item: '6 VIP Invites (Opening, Closing, Hi-Tea)', status: 'Pending' },
        { item: '6 Company Banners placed in venue', status: 'Pending' },
    ];
    const platinum = [
        { item: 'Category Exclusivity (no competitors)', status: 'Pending' },
        { item: 'Magazine — Full Sponsor Coverage Page', status: 'Pending' },
    ];
    const extras = sponsor.tier === 'Silver' ? [] : sponsor.tier === 'Platinum' ? [...gold, ...platinum] : gold;
    const deliverables = [...base, ...extras];
    const done = deliverables.filter(d => d.status === 'Done').length;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <h2>My Deliverables Checklist</h2>
                <div style={{ textAlign: 'right' }}>
                    <div className="data-figure" style={{ color: 'var(--accent-gold)', fontSize: '1.5rem' }}>{done}/{deliverables.length}</div>
                    <div className="label" style={{ color: 'var(--text-muted)' }}>Completed</div>
                </div>
            </div>
            <div className="portal-table-container">
                <table className="portal-table">
                    <thead><tr><th>#</th><th>Deliverable</th><th style={{ textAlign: 'center' }}>Status</th></tr></thead>
                    <tbody>
                        {deliverables.map((d, i) => (
                            <tr key={i}>
                                <td style={{ color: 'var(--text-muted)', width: '40px' }}>{i + 1}</td>
                                <td>{d.item}</td>
                                <td style={{ textAlign: 'center' }}>
                                    <span style={{
                                        color: d.status === 'Done' ? 'var(--success)' : 'var(--text-muted)',
                                        fontFamily: 'JetBrains Mono', fontSize: '0.75rem',
                                        background: d.status === 'Done' ? 'rgba(74,222,128,0.08)' : 'rgba(255,255,255,0.04)',
                                        padding: '3px 10px', display: 'inline-block'
                                    }}>
                                        {d.status === 'Done' ? '✓ Done' : '○ Pending'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

/* ── Tab 3: Documents ── */
function SponsorDocuments() {
    const docs = [
        { type: 'Sponsorship Agreement / MOU', desc: 'Signed agreement between your organization and ACM MAJU' },
        { type: 'Invoice', desc: 'Official invoice for the agreed sponsorship amount' },
        { type: 'Payment Receipt / Proof of Payment', desc: 'Bank receipt or confirmation of transferred funds' },
        { type: 'Event Brochure (PDF)', desc: 'Full sponsorship deck with all tiers and event details' },
        { type: 'Post-Event Summary Report', desc: 'Analytics and reach report after event completion' },
    ];
    return (
        <div>
            <h2 style={{ marginBottom: '8px' }}>Documents & Invoices</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '28px' }}>
                Secure document repository for your partnership. Files are uploaded by the ACM MAJU team.
            </p>
            <div className="portal-table-container">
                <table className="portal-table">
                    <thead><tr><th>Document</th><th>Description</th><th>Status</th></tr></thead>
                    <tbody>
                        {docs.map((d, i) => (
                            <tr key={i}>
                                <td><strong style={{ fontSize: '0.9rem' }}>{d.type}</strong></td>
                                <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{d.desc}</td>
                                <td>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontStyle: 'italic' }}>
                                        Not yet uploaded
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

/* ── Tab 4: Social Proof ── */
function SponsorSocialProof() {
    return (
        <div>
            <h2 style={{ marginBottom: '8px' }}>Social Media Proof</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '28px' }}>
                All posts, stories, and reels featuring your brand will be documented here with direct links and reach metrics.
            </p>
            <div className="card" style={{ padding: '64px', textAlign: 'center', border: '1px dashed var(--border)' }}>
                <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>📱</div>
                <h4 style={{ color: 'var(--text-muted)', marginBottom: '8px' }}>Gallery coming soon</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    The ACM MAJU social media team will populate this section with proof of all published content featuring your brand — including post screenshots, story impressions, and reel view counts.
                </p>
            </div>
        </div>
    );
}

/* ── Tab 5: Event Info ── */
function SponsorEventInfo() {
    const info = [
        { label: 'Event Name', value: "Jinnah League '26" },
        { label: 'Event Dates', value: 'To be announced — 2026 (Spring Semester)' },
        { label: 'Venue', value: 'Mohammad Ali Jinnah University' },
        { label: 'Venue Address', value: 'PECHS Block 6, Karachi, Pakistan' },
        { label: 'Expected Footfall', value: '1,000 – 1,500 participants per day' },
        { label: 'Booth / Banner Setup', value: '8:00 AM on Day 1 (arrive early for prime placement)' },
        { label: 'On-site Contact', value: 'Abdul Rafay — +92 349 0833806' },
        { label: 'Secondary Contact', value: 'Shahmir Sindhu — +92 310 3504444' },
        { label: 'Official Email', value: 'acm@jinnah.edu' },
        { label: 'Dress Code', value: 'Business Casual / Corporate' },
        { label: 'Parking', value: 'Available on campus — refer to venue map (to be shared)' },
        { label: 'Special Instructions', value: 'Please carry your company ID and this partnership confirmation email for venue entry.' },
    ];
    return (
        <div>
            <h2 style={{ marginBottom: '8px' }}>Event Day Information</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '28px' }}>
                Everything you need to know to make the most of your Jinnah League '26 presence.
            </p>
            <div className="card" style={{ padding: '32px 40px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                    {info.map((item, i) => (
                        <div key={i} style={{
                            display: 'grid', gridTemplateColumns: '220px 1fr', gap: '20px',
                            padding: '16px 0', borderBottom: i < info.length - 1 ? '1px solid var(--border)' : 'none'
                        }}>
                            <div className="label" style={{ color: 'var(--text-muted)', paddingTop: '2px' }}>{item.label}</div>
                            <div style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>{item.value}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default SponsorPortal;
