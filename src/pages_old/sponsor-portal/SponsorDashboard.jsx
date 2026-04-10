import React, { useEffect, useState } from 'react';
import Card from '../../components/Card';
import SectionLabel from '../../components/SectionLabel';
import { portalDashboardHelpers } from '../../lib/supabaseHelpers';

const SponsorDashboard = ({ sponsor }) => {
    const [state, setState] = useState({
        roiMetrics: { reach: 0, impressions: 0, engagement: 0, signups: 0 },
        partnership: {
            tier: sponsor?.tier || 'Gold',
            committed: sponsor?.committed || 0,
            received: 0,
            spent: 0,
            remaining: 0,
            paymentStatus: 'Pending',
            partnerSince: '-',
        },
        quickStats: {
            budgetUtilization: 0,
            deliverablesCompleted: 0,
            deliverablesTotal: 0,
            pendingRequests: 0,
            documents: 0,
        },
        recentActivity: [],
    });
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState('');

    const fmtNumber = (value) => Number(value || 0).toLocaleString('en-US');

    useEffect(() => {
        let active = true;

        const loadDashboard = async () => {
            if (!sponsor?.email) {
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setLoadError('');
            try {
                const liveResult = await portalDashboardHelpers.getSponsorDashboardData(sponsor.email);
                const liveData = liveResult?.data;

                if (liveResult?.error) {
                    throw liveResult.error;
                }

                if (active && liveData) {
                    setState(liveData);
                }
            } catch {
                if (active) {
                    setLoadError('Live sponsor dashboard data could not be loaded. Please verify sponsor records in Supabase.');
                }
            }

            if (active) {
                setIsLoading(false);
            }
        };

        loadDashboard();

        return () => {
            active = false;
        };
    }, [sponsor?.email]);

    const fmt = (value) => `Rs. ${Number(value).toLocaleString('en-IN')}`;
    const roiCards = [
        {
            label: 'Social Reach',
            value: fmtNumber(state.roiMetrics.reach),
            note: 'Unique audience exposed to your brand',
            tone: 'var(--accent-gold)',
        },
        {
            label: 'Total Impressions',
            value: fmtNumber(state.roiMetrics.impressions),
            note: 'Aggregate content views across channels',
            tone: 'var(--success)',
        },
        {
            label: 'Engagements',
            value: fmtNumber(state.roiMetrics.engagement),
            note: 'Reactions, comments, shares, and clicks',
            tone: 'var(--text-primary)',
        },
        {
            label: 'Sign-ups Generated',
            value: fmtNumber(state.roiMetrics.signups),
            note: 'Attributed conversions and registrations',
            tone: 'var(--info)',
        },
    ];

    const quickStats = [
        {
            label: 'Budget Utilization',
            value: `${state.quickStats.budgetUtilization}%`,
            tone: 'var(--accent-gold)',
        },
        {
            label: 'Deliverables',
            value: `${state.quickStats.deliverablesCompleted}/${state.quickStats.deliverablesTotal}`,
            tone: 'var(--success)',
        },
        {
            label: 'Pending Requests',
            value: fmtNumber(state.quickStats.pendingRequests),
            tone: 'var(--warning)',
        },
        {
            label: 'Documents',
            value: fmtNumber(state.quickStats.documents),
            tone: 'var(--info)',
        },
    ];

    if (isLoading) {
        return <p style={{ color: 'var(--text-secondary)' }}>Loading dashboard...</p>;
    }

    return (
        <div>
            <div style={{ marginBottom: '28px' }}>
                <SectionLabel text="Welcome Back" />
                {loadError && (
                    <Card style={{ padding: '12px 14px', marginBottom: '16px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)', color: 'var(--danger)' }}>
                        {loadError}
                    </Card>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(280px, 360px)', gap: '20px', alignItems: 'stretch' }}>
                    <div>
                        <h2 className="mt-2">Campaign ROI Dashboard</h2>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '8px', maxWidth: '720px' }}>
                            Track your sponsorship ROI in real time: social reach, impressions, engagement, and conversion performance.
                        </p>
                    </div>
                    <Card style={{ padding: '20px 22px' }}>
                        <div className="label" style={{ color: 'var(--text-secondary)', marginBottom: '10px' }}>Partnership Snapshot</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>{sponsor?.company || 'Sponsor Partnership'}</div>
                        <div style={{ display: 'grid', gap: '10px', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                                <span>Tier</span>
                                <span style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>{state.partnership.tier}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                                <span>Payment Status</span>
                                <span style={{ color: 'var(--success)', fontWeight: 600 }}>{state.partnership.paymentStatus}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                                <span>Partner Since</span>
                                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{state.partnership.partnerSince}</span>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px', marginBottom: '36px' }}>
                {roiCards.map((metric) => (
                    <Card key={metric.label} style={{ padding: '22px 22px 24px' }}>
                        <div className="label" style={{ color: 'var(--text-secondary)', marginBottom: '10px' }}>{metric.label}</div>
                        <div style={{ color: metric.tone, fontSize: '2rem', fontWeight: 700, lineHeight: 1, marginBottom: '10px' }}>{metric.value}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '220px' }}>{metric.note}</div>
                    </Card>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '24px', marginBottom: '32px' }}>
                <Card style={{ padding: '26px 28px' }}>
                    <h4 className="mb-4">Partnership Overview</h4>
                    <div style={{ display: 'grid', gap: '12px' }}>
                        {[
                            ['Tier', state.partnership.tier, 'var(--accent-gold)'],
                            ['Committed', fmt(state.partnership.committed), 'var(--text-primary)'],
                            ['Received', fmt(state.partnership.received), 'var(--success)'],
                            ['Spent', fmt(state.partnership.spent), 'var(--text-primary)'],
                            ['Remaining Balance', fmt(state.partnership.remaining), 'var(--accent-gold)'],
                            ['Payment Status', state.partnership.paymentStatus, 'var(--success)'],
                            ['Partner Since', state.partnership.partnerSince, 'var(--text-primary)'],
                        ].map(([label, value, color]) => (
                            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
                                <span style={{ color, fontWeight: 600, textAlign: 'right' }}>{value}</span>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card style={{ padding: '26px 28px' }}>
                    <h4 className="mb-4">Quick Stats</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '16px' }}>
                        {quickStats.map((stat) => (
                            <div key={stat.label} style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', border: '1px solid var(--border)' }}>
                                <div className="label" style={{ color: 'var(--text-secondary)', fontSize: '0.76rem', marginBottom: '8px' }}>{stat.label}</div>
                                <div style={{ fontSize: '1.7rem', color: stat.tone, fontWeight: 700, lineHeight: 1 }}>{stat.value}</div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            <Card style={{ padding: '26px 28px' }}>
                <h4 className="mb-4">Recent Activity</h4>
                {state.recentActivity.length > 0 ? (
                    <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: '12px' }}>
                        {state.recentActivity.map((item, idx) => (
                            <li key={idx} style={{ paddingBottom: '12px', borderBottom: idx < state.recentActivity.length - 1 ? '1px solid var(--border)' : 'none' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                                    <span style={{ color: 'var(--text-primary)' }}>{item.activity}</span>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{item.date}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p style={{ color: 'var(--text-secondary)' }}>No recent activity yet.</p>
                )}
            </Card>
        </div>
    );
};

export default SponsorDashboard;
