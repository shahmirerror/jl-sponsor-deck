import React from 'react';
import { Shield, UserX } from 'lucide-react';

const ALL_USERS = [
    { name: 'Abdul Rafay', role: 'Admin', title: 'Director of PR & Sponsorships', email: 'fa24bscs0113@maju.edu.pk' },
    { name: 'Shahmir Sindhu', role: 'Admin', title: 'President / Secretary General', email: 'fa22bscs0159@maju.edu.pk' },
    { name: 'Atta Ur Rehman', role: 'Admin', title: 'Treasurer', email: 'fa22bscs0174@maju.edu.pk' },
    { name: 'Love Maheshwari', role: 'Editor', title: 'Director of Event Management', email: 'fa23bece0042@maju.edu.pk' },
    { name: 'Muzna Moin', role: 'Editor', title: 'Director of Marketing', email: 'fa24bsbt0018@maju.edu.pk' },
    { name: 'Mahnoor Sohail', role: 'Editor', title: 'Director of Social Media', email: 'fa24bscs0044@maju.edu.pk' },
    { name: 'Areeba Kalwar', role: 'Editor', title: 'Director of Code Club', email: 'sp24bscs0099@maju.edu.pk' },
    { name: 'Syed Abdul Sami', role: 'Editor', title: 'Director of Gamerz Den', email: 'fa22bscs0173@maju.edu.pk' },
];

const Settings = ({ user }) => {
    const isAdmin = user?.role === 'Admin';
    return (
        <div>
            <h2 style={{ marginBottom: '8px' }}>Portal Settings</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
                Manage team access and portal configuration. {!isAdmin && <span style={{ color: 'var(--warning)' }}>(Admin access required to make changes)</span>}
            </p>

            {/* Org info */}
            <div className="card" style={{ padding: '28px', marginBottom: '32px', borderTop: '3px solid var(--accent-gold)' }}>
                <h4 style={{ marginBottom: '20px' }}>Organization</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                        <label className="label" style={{ display: 'block', marginBottom: '8px' }}>Organization Name</label>
                        <input type="text" defaultValue="ACM MAJU — Jinnah League '26" disabled={!isAdmin} style={{ width: '100%', background: !isAdmin ? 'var(--bg-primary)' : undefined }} />
                    </div>
                    <div>
                        <label className="label" style={{ display: 'block', marginBottom: '8px' }}>Event Year</label>
                        <input type="text" defaultValue="2026" disabled={!isAdmin} style={{ width: '100%', background: !isAdmin ? 'var(--bg-primary)' : undefined }} />
                    </div>
                </div>
                {isAdmin && <button className="btn btn-primary" style={{ marginTop: '20px' }}>Save Changes</button>}
            </div>

            {/* Team user table */}
            <h4 style={{ marginBottom: '16px' }}>Portal Team Members</h4>
            <div className="portal-table-container" style={{ marginBottom: '32px' }}>
                <table className="portal-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Title</th>
                            <th>Email</th>
                            <th>Access Level</th>
                            {isAdmin && <th>Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {ALL_USERS.map((u, i) => (
                            <tr key={i} style={{ background: u.email === user.email ? 'rgba(201,168,76,0.05)' : '' }}>
                                <td><strong>{u.name}</strong> {u.email === user.email && <span style={{ color: 'var(--accent-gold)', fontSize: '0.7rem' }}>(You)</span>}</td>
                                <td style={{ color: 'var(--text-secondary)' }}>{u.title}</td>
                                <td style={{ fontFamily: 'JetBrains Mono', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.email}</td>
                                <td>
                                    <span className={`status-badge ${u.role === 'Admin' ? 'badge-paid' : 'badge-pending'}`}>{u.role}</span>
                                </td>
                                {isAdmin && (
                                    <td>
                                        {u.email !== user.email && (
                                            <button style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)', padding: '4px 12px', cursor: 'pointer', fontSize: '0.75rem' }}>
                                                Change Role
                                            </button>
                                        )}
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isAdmin && (
                <div className="card" style={{ padding: '24px', borderTop: '3px solid var(--border)' }}>
                    <h4 style={{ marginBottom: '4px' }}>Access Level Definitions</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                            <Shield size={18} style={{ color: 'var(--accent-gold)', flexShrink: 0, marginTop: '2px' }} />
                            <div><strong>Admin</strong><p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '2px' }}>Full access: add/edit/delete all data, manage users, configure settings</p></div>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                            <UserX size={18} style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: '2px' }} />
                            <div><strong>Editor</strong><p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '2px' }}>Can add sponsors, input invoices, log expenditures, update payment status</p></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;
