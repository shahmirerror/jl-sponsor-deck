import React, { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const BUDGET_CATEGORIES = [
    { name: 'Artist & Entertainment', allocated: 800000, spent: 0 },
    { name: 'Prize Pool', allocated: 400000, spent: 0 },
    { name: 'Concert & Event Setup', allocated: 500000, spent: 0 },
    { name: 'Infrastructure (Computers & PS5)', allocated: 450000, spent: 0 },
    { name: 'Hospitality (Dinner & Tissues)', allocated: 306800, spent: 0 },
    { name: 'Marketing, Branding & Decoration', allocated: 200000, spent: 0 },
    { name: 'Gifts & Participant Swag', allocated: 78000, spent: 0 },
    { name: 'PR Operations & Travel', allocated: 50000, spent: 0 },
    { name: 'Hackathon & Technical Needs', allocated: 150000, spent: 0 },
    { name: 'Media (Camera Shoot)', allocated: 100000, spent: 0 },
    { name: 'Admin & Identity (Cards, Badges, Shields)', allocated: 60050, spent: 0 },
];

const TOTAL_BUDGET = 3094850;

const COLORS = ['#C9A84C', '#D4C17F', '#A0845C', '#8B7355', '#6B5B3E', '#9E8E6B', '#B8A578', '#7A6A4F', '#E8D5A3', '#BDA880', '#D4B896'];

const fmt = (n) => `Rs. ${Number(n).toLocaleString('en-IN')}`;

const BudgetTracker = ({ user }) => {
    const isAdmin = user?.role === 'Admin';
    const [categories, setCategories] = useState(BUDGET_CATEGORIES);
    const totalAllocated = categories.reduce((s, c) => s + c.allocated, 0);
    const totalSpent = categories.reduce((s, c) => s + c.spent, 0);

    return (
        <div>
            <h2 style={{ marginBottom: '8px' }}>Budget Tracker</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '0.9rem' }}>
                Total Event Budget: <span className="data-figure" style={{ color: 'var(--accent-gold)', fontSize: '1.1rem' }}>{fmt(TOTAL_BUDGET)}</span>
            </p>

            {/* Summary Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px', marginBottom: '40px' }}>
                {[
                    { label: 'Total Budget', val: fmt(TOTAL_BUDGET), color: 'var(--text-primary)' },
                    { label: 'Total Allocated', val: fmt(totalAllocated), color: 'var(--accent-gold)' },
                    { label: 'Total Spent', val: fmt(totalSpent), color: totalSpent > 0 ? 'var(--danger)' : 'var(--text-muted)' },
                ].map((k, i) => (
                    <div key={i} className="card" style={{ padding: '24px' }}>
                        <div className="label" style={{ marginBottom: '8px' }}>{k.label}</div>
                        <div className="data-figure" style={{ color: k.color, fontSize: '1.5rem' }}>{k.val}</div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '40px' }}>
                {/* Pie Chart */}
                <div className="card" style={{ padding: '24px' }}>
                    <h4 style={{ marginBottom: '20px' }}>Allocation Breakdown</h4>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={categories.map(c => ({ name: c.name.length > 24 ? c.name.slice(0, 22) + '…' : c.name, value: c.allocated }))}
                                cx="50%" cy="50%" outerRadius={110} dataKey="value">
                                {categories.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                            </Pie>
                            <Tooltip formatter={(v) => fmt(v)} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 0 }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Spend progress bars */}
                <div className="card" style={{ padding: '24px' }}>
                    <h4 style={{ marginBottom: '20px' }}>Per-Category Progress</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '300px', overflowY: 'auto' }}>
                        {categories.map((c, i) => (
                            <div key={i}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{c.name.length > 30 ? c.name.slice(0, 28) + '…' : c.name}</span>
                                    <span className="data-figure" style={{ color: COLORS[i % COLORS.length], fontSize: '0.78rem' }}>{fmt(c.allocated)}</span>
                                </div>
                                <div style={{ height: '5px', background: 'var(--border)', borderRadius: '3px' }}>
                                    <div style={{ height: '100%', width: `${Math.min((c.spent / c.allocated) * 100, 100)}%`, background: COLORS[i % COLORS.length], borderRadius: '3px' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Full Table */}
            <h4 style={{ marginBottom: '16px' }}>Full Budget Breakdown</h4>
            <div className="portal-table-container">
                <table className="portal-table">
                    <thead>
                        <tr>
                            <th>Category</th>
                            <th style={{ textAlign: 'right' }}>Allocated</th>
                            <th style={{ textAlign: 'right' }}>Spent</th>
                            <th style={{ textAlign: 'right' }}>Remaining</th>
                            {isAdmin && <th>Edit</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((c, i) => (
                            <tr key={i}>
                                <td>{c.name}</td>
                                <td className="data-figure" style={{ textAlign: 'right', color: 'var(--accent-gold)', fontSize: '0.9rem' }}>{fmt(c.allocated)}</td>
                                <td className="data-figure" style={{ textAlign: 'right', color: c.spent > 0 ? 'var(--danger)' : 'var(--text-muted)', fontSize: '0.9rem' }}>{fmt(c.spent)}</td>
                                <td className="data-figure" style={{ textAlign: 'right', color: 'var(--success)', fontSize: '0.9rem' }}>{fmt(c.allocated - c.spent)}</td>
                                {isAdmin && (
                                    <td>
                                        <button style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)', padding: '4px 10px', cursor: 'pointer', fontSize: '0.7rem' }}
                                            onClick={() => {
                                                const newVal = prompt(`New allocation for "${c.name}" (Rs.):`, c.allocated);
                                                if (newVal && !isNaN(Number(newVal))) setCategories(prev => prev.map((x, j) => j === i ? { ...x, allocated: Number(newVal) } : x));
                                            }}>
                                            Edit
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                        <tr style={{ background: 'rgba(201,168,76,0.08)', fontWeight: 700 }}>
                            <td><strong>TOTAL</strong></td>
                            <td className="data-figure" style={{ textAlign: 'right', color: 'var(--accent-gold)', fontSize: '0.9rem' }}><strong>{fmt(totalAllocated)}</strong></td>
                            <td className="data-figure" style={{ textAlign: 'right', color: 'var(--danger)', fontSize: '0.9rem' }}><strong>{fmt(totalSpent)}</strong></td>
                            <td className="data-figure" style={{ textAlign: 'right', color: 'var(--success)', fontSize: '0.9rem' }}><strong>{fmt(totalAllocated - totalSpent)}</strong></td>
                            {isAdmin && <td />}
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default BudgetTracker;
