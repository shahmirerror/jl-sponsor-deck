import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Card from '../../components/Card';
import SectionLabel from '../../components/SectionLabel';
import Button from '../../components/Button';
import RequestIntakeWidget from '../../components/RequestIntakeWidget';
import { accountDirectoryHelpers, portalDashboardHelpers } from '../../lib/supabaseHelpers';
import { ArrowRight, AlertTriangle, BadgeDollarSign, Boxes, ClipboardList, LayoutGrid, Plus, Sparkles, Users } from 'lucide-react';

const Dashboard = ({ user }) => {
    const router = useRouter();
    const [kpis, setKpis] = useState({
        openRequests: 0,
        budgetPending: 0,
        priorityOpenRequests: 0,
        priorityPendingAmount: 0,
        priorityShare: 0,
        assetsAwaitingReview: 0,
        inventoryItems: 0,
    });
    const [activity, setActivity] = useState([]);
    const [directoryStats, setDirectoryStats] = useState(null);

    useEffect(() => {
        let active = true;

        const loadDashboard = async () => {
            try {
                const [summary, directorySummary] = await Promise.all([
                    portalDashboardHelpers.getAdminDashboardData(),
                    accountDirectoryHelpers.getSummary(),
                ]);

                if (active) {
                    setKpis(summary?.kpis || {
                        openRequests: 0,
                        budgetPending: 0,
                        priorityOpenRequests: 0,
                        priorityPendingAmount: 0,
                        priorityShare: 0,
                        assetsAwaitingReview: 0,
                        inventoryItems: 0,
                    });
                    setActivity(summary?.recentActivity || []);
                }

                if (active) {
                    if (directorySummary?.data) {
                        setDirectoryStats(directorySummary.data);
                    } else {
                        setDirectoryStats({
                            total: 0,
                            admins: 0,
                            sponsors: 0,
                            active: 0,
                            disabled: 0,
                            adminShare: 0,
                            sponsorShare: 0,
                            activeRate: 0,
                        });
                    }
                }
            } catch {
                if (active) {
                    setKpis({
                        openRequests: 0,
                        budgetPending: 0,
                        priorityOpenRequests: 0,
                        priorityPendingAmount: 0,
                        priorityShare: 0,
                        assetsAwaitingReview: 0,
                        inventoryItems: 0,
                    });
                    setActivity([]);
                    setDirectoryStats({
                        total: 0,
                        admins: 0,
                        sponsors: 0,
                        active: 0,
                        disabled: 0,
                        adminShare: 0,
                        sponsorShare: 0,
                        activeRate: 0,
                    });
                }
            }
        };

        loadDashboard();

        return () => {
            active = false;
        };
    }, [user]);

    const fmt = (value) => `Rs. ${Number(value).toLocaleString('en-IN')}`;

    const kpiCards = [
        {
            label: 'Priority Queue',
            value: kpis.priorityOpenRequests || 0,
            color: '#f97316',
            icon: <AlertTriangle size={18} />,
            tone: 'rgba(249,115,22,0.14)',
            ring: 'rgba(249,115,22,0.24)',
            note: `${kpis.priorityShare || 0}% of open requests are high or urgent`,
            meta: fmt(kpis.priorityPendingAmount || 0),
        },
        {
            label: 'Assets Awaiting Review',
            value: kpis.assetsAwaitingReview,
            color: 'var(--text-primary)',
            icon: <Boxes size={18} />,
            tone: 'rgba(59,130,246,0.12)',
            ring: 'rgba(59,130,246,0.22)',
            note: 'Uploads and proofs in review',
        },
        {
            label: 'Inventory Items Logged',
            value: kpis.inventoryItems,
            color: 'var(--success)',
            icon: <Sparkles size={18} />,
            tone: 'rgba(34,197,94,0.12)',
            ring: 'rgba(34,197,94,0.24)',
            note: 'Tracked in the live registry',
        },
    ];

    const kpiCards2 = [
        {
            label: 'Budget Pending',
            value: fmt(kpis.budgetPending),
            color: 'var(--warning)',
            icon: <BadgeDollarSign size={18} />,
            tone: 'rgba(245,158,11,0.14)',
            ring: 'rgba(245,158,11,0.24)',
            note: 'Funds queued for approval',
        },
        {
            label: 'Open Requests',
            value: kpis.openRequests,
            color: 'var(--accent-gold)',
            icon: <ClipboardList size={18} />,
            tone: 'rgba(201,168,76,0.14)',
            ring: 'rgba(201,168,76,0.24)',
            note: 'Requests waiting on action',
        }
    ];

    const renderKpiCard = (kpi) => (
        <Card
            key={kpi.label}
            className="kpi-card"
            style={{
                padding: '22px',
                cursor: 'pointer',
                transition: 'transform 0.2s ease, border-color 0.2s ease',
                position: 'relative',
                overflow: 'hidden',
                background: `linear-gradient(180deg, ${kpi.tone}, rgba(255,255,255,0.02) 90%)`,
                border: `1px solid ${kpi.ring}`,
                minHeight: '170px',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '14px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(0,0,0,0.18)',
                    border: `1px solid ${kpi.ring}`,
                    color: kpi.color,
                    boxShadow: `0 0 0 1px ${kpi.tone}`,
                }}>
                    {kpi.icon}
                </div>
                <div className="label" style={{ color: 'var(--text-muted)', letterSpacing: '0.08em' }}>Live</div>
            </div>
            <div className="label" style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>{kpi.label}</div>
            <div className="data-figure kpi-value" style={{ color: kpi.color, fontSize: '2.1rem', lineHeight: 1.05 }}>{kpi.value}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '999px', background: kpi.color, boxShadow: `0 0 0 4px ${kpi.tone}` }} />
                <span>{kpi.note}</span>
            </div>
            {kpi.meta ? (
                <div style={{ marginTop: '10px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                    {kpi.meta} pending in priority work
                </div>
            ) : null}
        </Card>
    );

    return (
        <div className="portal-dashboard">
            <SectionLabel text="Overview" />
            <h2 className="mb-8 mt-2">Operations Command Center</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', maxWidth: '720px' }}>
                A single view of team requests, event budget movement, documentation, and inventory status across the Jinnah League workflow.
            </p>

            <div className="kpi-grid mb-12" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px' }}>
                {kpiCards2.map(renderKpiCard)}
            </div>

            <div className="kpi-grid mb-12" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px' }}>
                {kpiCards.map(renderKpiCard)}
            </div>

            <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '32px' }}>
                <Card>
                    <h4 className="mb-4">Priority Queue</h4>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '14px' }}>
                        <div className="data-figure" style={{ fontSize: '2.4rem', color: 'var(--accent-gold)' }}>{kpis.priorityOpenRequests || 0}</div>
                        <div style={{ color: 'var(--text-secondary)' }}>open high/urgent requests</div>
                    </div>
                    <div style={{ background: 'var(--border)', height: '12px', width: '100%', borderRadius: '999px', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.max(0, Math.min(100, kpis.priorityShare || 0))}%`, background: 'linear-gradient(90deg, #f97316, var(--accent-gold))', height: '100%' }}></div>
                    </div>
                    <div className="mt-2 data-figure" style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        <span>{kpis.priorityShare || 0}% of open requests</span>
                        <span>{fmt(kpis.priorityPendingAmount || 0)} pending</span>
                    </div>
                </Card>
                <Card>
                    <h4 className="mb-4">Recent Activity</h4>
                    <ul className="activity-feed" style={{ listStyle: 'none', padding: 0 }}>
                        {activity.map((item, idx) => (
                            <li key={idx} className="mb-2" style={{ paddingBottom: '12px', borderBottom: idx < activity.length - 1 ? '1px solid var(--border)' : 'none' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.timestamp}</span>
                                    <span style={{ fontSize: '0.7rem', background: 'var(--border)', padding: '2px 8px', borderRadius: '3px', color: 'var(--text-secondary)' }}>{item.type}</span>
                                </div>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{item.description}</p>
                            </li>
                        ))}
                        {activity.length === 0 && (
                            <li style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No recent activity from database yet.</li>
                        )}
                    </ul>
                </Card>
            </div>

            <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '32px', marginTop: '32px' }}>
                <Card>
                    <h4 className="mb-4">Quick Actions</h4>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>Jump into the most common workflows without digging through the portal.</p>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <Button onClick={() => router.push('/portal/task-board')} startIcon={<ArrowRight size={16} />}>Open Task Board</Button>
                        <Button variant="outline" onClick={() => router.push('/portal/budget')} startIcon={<Plus size={16} />}>New Budget Request</Button>
                    </div>
                </Card>
                <Card>
                    <h4 className="mb-4">Compliance Snapshot</h4>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>Minutes uploaded: <strong style={{ color: 'var(--text-primary)' }}>9 / 11</strong></p>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>Inventory tagged: <strong style={{ color: 'var(--text-primary)' }}>42 / 45</strong></p>
                    <p style={{ color: 'var(--text-secondary)' }}>Outstanding approvals: <strong style={{ color: 'var(--text-primary)' }}>3</strong></p>
                </Card>
            </div>

            <div style={{ marginTop: '32px' }}>
                <RequestIntakeWidget />
            </div>

            <div style={{ marginTop: '32px' }}>
                <Card style={{ padding: '24px', borderTop: '2px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: '16px', flexWrap: 'wrap' }}>
                        <div>
                            <h4 style={{ marginBottom: '4px' }}>User Management</h4>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Live admin and sponsor account directory</p>
                        </div>
                        <Button onClick={() => router.push('/portal/users')} style={{ whiteSpace: 'nowrap' }} startIcon={<ArrowRight size={16} />}>
                            Open Directory
                        </Button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '12px' }}>
                        {directoryStats ? [
                            { label: 'Total Accounts', value: directoryStats.total, icon: <LayoutGrid size={16} />, tint: 'rgba(59,130,246,0.12)', note: `${directoryStats.admins || 0} admins, ${directoryStats.sponsors || 0} sponsors` },
                            { label: 'Admin Share', value: `${directoryStats.adminShare || 0}%`, icon: <Users size={16} />, tint: 'rgba(201,168,76,0.12)', note: `${directoryStats.admins || 0} of ${directoryStats.total || 0}` },
                            { label: 'Sponsor Share', value: `${directoryStats.sponsorShare || 0}%`, icon: <Sparkles size={16} />, tint: 'rgba(34,197,94,0.12)', note: `${directoryStats.sponsors || 0} of ${directoryStats.total || 0}` },
                            { label: 'Active Rate', value: `${directoryStats.activeRate || 0}%`, icon: <ArrowRight size={16} />, tint: 'rgba(245,158,11,0.12)', note: `${directoryStats.active || 0} active / ${directoryStats.disabled || 0} disabled` },
                        ].map((metric) => (
                            <div key={metric.label} style={{ background: `linear-gradient(180deg, ${metric.tint}, rgba(255,255,255,0.02) 92%)`, border: '1px solid var(--border)', padding: '16px', borderRadius: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                    <div className="label" style={{ color: 'var(--text-secondary)' }}>{metric.label}</div>
                                    <div style={{ width: '30px', height: '30px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }}>
                                        {metric.icon}
                                    </div>
                                </div>
                                <div style={{ fontSize: '1.7rem', fontWeight: 700, color: 'var(--accent-gold)', lineHeight: 1 }}>{metric.value}</div>
                                {metric.note ? (
                                    <div style={{ marginTop: '8px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{metric.note}</div>
                                ) : null}
                            </div>
                        )) : (
                            <div style={{ gridColumn: '1 / -1', color: 'var(--text-secondary)' }}>Loading directory summary...</div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
