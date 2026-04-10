import React, { useEffect, useState } from 'react';
import Card from '../../components/Card';
import SectionLabel from '../../components/SectionLabel';
import { sponsorPortalHelpers } from '../../lib/supabaseHelpers';

const FinancialLedger = ({ sponsor }) => {
    const [ledgerEntries, setLedgerEntries] = useState([]);
    const [summary, setSummary] = useState({ committed: 0, allocated: 0, remaining: 0, utilization: 0 });
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [syncError, setSyncError] = useState('');

    useEffect(() => {
        let active = true;

        const loadLedger = async () => {
            if (!sponsor?.email) {
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            try {
                const liveResult = await sponsorPortalHelpers.getLedgerByEmail(sponsor.email);
                if (liveResult?.error) {
                    throw liveResult.error;
                }

                if (active) {
                    setLedgerEntries(liveResult.data?.ledger || []);
                    setSummary(liveResult.data?.summary || { committed: 0, allocated: 0, remaining: 0, utilization: 0 });
                    setCategories(liveResult.data?.categories || []);
                    setSyncError('');
                }
            } catch (error) {
                if (active) {
                    setLedgerEntries([]);
                    setSummary({ committed: 0, allocated: 0, remaining: 0, utilization: 0 });
                    setCategories([]);
                    setSyncError(error?.message || 'Unable to load financial ledger from database.');
                }
            } finally {
                if (active) {
                    setIsLoading(false);
                }
            }
        };

        loadLedger();

        return () => {
            active = false;
        };
    }, [sponsor?.email]);

    const fmt = (value) => `Rs. ${Number(value).toLocaleString('en-IN')}`;

    return (
        <div>
            <div style={{ marginBottom: '32px' }}>
                <SectionLabel text="Financial Tracking" />
                <h2 className="mt-2">Budget Allocation Ledger</h2>
                <p style={{ color: 'var(--text-secondary)', marginTop: '8px', maxWidth: '720px' }}>
                    Real-time view of how your sponsorship budget is allocated across different marketing activities and deliverables.
                </p>
            </div>

            {isLoading && <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>Loading financial ledger...</p>}
            {syncError && <p style={{ color: 'var(--danger)', marginBottom: '16px' }}>{syncError}</p>}

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
                {[
                    { label: 'Total Committed', value: fmt(summary.committed), color: 'var(--accent-gold)' },
                    { label: 'Allocated So Far', value: fmt(summary.allocated), color: 'var(--text-primary)' },
                    { label: 'Remaining', value: fmt(summary.remaining), color: 'var(--success)' },
                    { label: 'Utilization', value: `${summary.utilization}%`, color: 'var(--warning)' },
                ].map((metric) => (
                    <Card key={metric.label} style={{ padding: '24px' }}>
                        <div className="label" style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>{metric.label}</div>
                        <div style={{ color: metric.color, fontSize: '1.8rem', fontWeight: '600' }}>{metric.value}</div>
                    </Card>
                ))}
            </div>

            {/* Ledger Table */}
            <Card>
                <h4 className="mb-4">Full Allocation Breakdown</h4>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid var(--border)' }}>
                                <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600' }}>Date</th>
                                <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600' }}>Description</th>
                                <th style={{ textAlign: 'right', padding: '12px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600' }}>Amount</th>
                                <th style={{ textAlign: 'right', padding: '12px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600' }}>Balance</th>
                                <th style={{ textAlign: 'center', padding: '12px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600' }}>Type</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ledgerEntries.map((entry, idx) => (
                                <tr key={idx} style={{ borderBottom: idx < ledgerEntries.length - 1 ? '1px solid var(--border)' : 'none' }}>
                                    <td style={{ padding: '16px 12px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{entry.dateLabel || entry.date}</td>
                                    <td style={{ padding: '16px 12px' }}>{entry.description}</td>
                                    <td style={{
                                        padding: '16px 12px',
                                        textAlign: 'right',
                                        color: entry.type === 'commitment' ? 'var(--success)' : 'var(--text-primary)',
                                        fontWeight: entry.type === 'commitment' ? '600' : '400',
                                    }}>
                                        {entry.type === 'commitment' ? '+' : ''}{fmt(entry.amount)}
                                    </td>
                                    <td style={{
                                        padding: '16px 12px',
                                        textAlign: 'right',
                                        color: entry.balance < 500000 ? 'var(--warning)' : 'var(--accent-gold)',
                                        fontWeight: '600',
                                    }}>
                                        {fmt(entry.balance)}
                                    </td>
                                    <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                                        <span style={{
                                            display: 'inline-block',
                                            padding: '4px 10px',
                                            background: entry.type === 'commitment' ? 'var(--success)20' : 'var(--info)20',
                                            color: entry.type === 'commitment' ? 'var(--success)' : 'var(--info)',
                                            borderRadius: '4px',
                                            fontSize: '0.8rem',
                                            fontWeight: '600',
                                        }}>
                                            {entry.type === 'commitment' ? 'Commitment' : 'Allocated'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Budget Breakdown by Category */}
            <Card style={{ marginTop: '32px' }}>
                <h4 className="mb-4">Budget by Category</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                    {categories.map((item) => (
                        <div key={item.category}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ fontWeight: '500' }}>{item.category}</span>
                                <span style={{ color: 'var(--accent-gold)', fontWeight: '600' }}>{item.percentage}%</span>
                            </div>
                            <div style={{ background: 'var(--border)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{
                                    background: 'var(--accent-gold)',
                                    height: '100%',
                                    width: `${item.percentage}%`,
                                    transition: 'width 0.3s',
                                }}></div>
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                {fmt(item.amount)}
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};

export default FinancialLedger;
