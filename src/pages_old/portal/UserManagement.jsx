import React from 'react';
import Card from '../../components/Card';
import SectionLabel from '../../components/SectionLabel';
import { PREDEFINED_ROLES } from '../../components/UserManagementWidget';
import PortalUserDirectory from '../../components/PortalUserDirectory';

const UserManagement = ({ user }) => {
    return (
        <div className="portal-users">
            <SectionLabel text="Administration" />
            <h2 className="mb-2 mt-2">User & Permissions Management</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', maxWidth: '720px' }}>
                Manage team members, assign roles, and configure granular module permissions for budget, task coordination, vendor management, and more.
            </p>

            <PortalUserDirectory />

            {/* Role Reference Guide */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                <Card style={{ padding: '20px' }}>
                    <h5 style={{ marginBottom: '12px', color: 'var(--accent-gold)' }}>📋 Predefined Roles</h5>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px' }}>
                        Quick-start roles with preset permissions. Users can still have custom permissions applied.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {Object.entries(PREDEFINED_ROLES).map(([roleName, roleData]) => (
                            <div
                                key={roleName}
                                style={{
                                    padding: '12px',
                                    background: 'rgba(0, 0, 0, 0.2)',
                                    borderRadius: '4px',
                                    border: '1px solid var(--border)',
                                }}
                            >
                                <div style={{ fontWeight: 600, marginBottom: '4px', fontSize: '0.9rem' }}>{roleName}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{roleData.description}</div>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card style={{ padding: '20px' }}>
                    <h5 style={{ marginBottom: '12px', color: 'var(--accent-gold)' }}>🔐 Permission Scope</h5>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px' }}>
                        Permissions are enforced at the module and operation level.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '4px' }}>Modules:</div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Budget Management, Task Board, Vendor Management, Reports, Settings, User Management</div>
                        </div>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '4px' }}>Operations:</div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Create, Read, Update, Delete, Approve, Reject, Export</div>
                        </div>
                    </div>
                </Card>

                <Card style={{ padding: '20px' }}>
                    <h5 style={{ marginBottom: '12px', color: 'var(--accent-gold)' }}>⚙️ Custom Permissions</h5>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px' }}>
                        Override role defaults by clicking "Edit Permissions" on any user to apply custom permission matrices.
                    </p>
                    <div style={{ padding: '12px', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '4px', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                        <div style={{ color: 'var(--success)', fontSize: '0.8rem' }}>✓ Custom permissions take precedence over role settings</div>
                    </div>
                </Card>
            </div>

            {/* Implementation Notes */}
            <Card style={{ padding: '20px', marginTop: '32px', background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                <h5 style={{ marginBottom: '12px', color: 'var(--accent-blue)' }}>ℹ️ Implementation Status</h5>
                <ul style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', listStyle: 'none', padding: 0 }}>
                    <li style={{ marginBottom: '8px' }}>✅ User CRUD (Create, Read, Update, Delete)</li>
                    <li style={{ marginBottom: '8px' }}>✅ Predefined 5 roles with realistic permission matrices</li>
                    <li style={{ marginBottom: '8px' }}>✅ Custom permission editor with module × operation grid</li>
                    <li style={{ marginBottom: '8px' }}>🟡 Frontend: Permissions are stored in component state (session only)</li>
                    <li style={{ marginBottom: '8px' }}>🟡 Backend: Requires Supabase integration to persist users & permissions to database</li>
                    <li style={{ marginBottom: '8px' }}>🟡 Guard: Need middleware to validate permissions on protected routes/operations</li>
                </ul>
            </Card>
        </div>
    );
};

export default UserManagement;
