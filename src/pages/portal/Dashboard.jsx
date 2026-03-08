import React from 'react';
import Card from '../../components/Card';
import SectionLabel from '../../components/SectionLabel';

const Dashboard = () => {
    return (
        <div className="portal-dashboard">
            <SectionLabel text="Overview" />
            <h2 className="mb-8 mt-2">Financial Summary</h2>

            <div className="kpi-grid mb-12" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
                <Card className="kpi-card" style={{ padding: '24px' }}>
                    <div className="label mb-2" style={{ color: 'var(--text-secondary)' }}>Total Budget</div>
                    <div className="data-figure kpi-value" style={{ color: 'var(--success)', fontSize: '2rem' }}>$250,000</div>
                </Card>
                <Card className="kpi-card" style={{ padding: '24px' }}>
                    <div className="label mb-2" style={{ color: 'var(--text-secondary)' }}>Spent</div>
                    <div className="data-figure kpi-value" style={{ color: 'var(--danger)', fontSize: '2rem' }}>$85,400</div>
                </Card>
                <Card className="kpi-card" style={{ padding: '24px' }}>
                    <div className="label mb-2" style={{ color: 'var(--text-secondary)' }}>Remaining</div>
                    <div className="data-figure kpi-value" style={{ color: 'var(--accent-gold)', fontSize: '2rem' }}>$164,600</div>
                </Card>
                <Card className="kpi-card" style={{ padding: '24px' }}>
                    <div className="label mb-2" style={{ color: 'var(--text-secondary)' }}>Active Sponsors</div>
                    <div className="data-figure kpi-value" style={{ color: 'var(--text-primary)', fontSize: '2rem' }}>14</div>
                </Card>
            </div>

            <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '32px' }}>
                <Card>
                    <h4 className="mb-4">Budget Utilization</h4>
                    <div className="progress-bar-container" style={{ background: 'var(--border)', height: '12px', width: '100%', borderRadius: '6px', overflow: 'hidden' }}>
                        <div className="progress-bar" style={{ width: '34%', background: 'var(--accent-gold)', height: '100%' }}></div>
                    </div>
                    <div className="mt-2 data-figure" style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        <span>34%</span>
                        <span>100%</span>
                    </div>
                </Card>
                <Card>
                    <h4 className="mb-4">Recent Activity</h4>
                    <ul className="activity-feed">
                        <li className="mb-2"><span style={{ color: 'var(--text-secondary)' }}>Today</span> - AcroCorp pledged Gold Tier</li>
                        <li className="mb-2"><span style={{ color: 'var(--text-secondary)' }}>Yesterday</span> - Payment received: $5,000</li>
                        <li><span style={{ color: 'var(--text-secondary)' }}>Mar 12</span> - Media package expenditure logged</li>
                    </ul>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
