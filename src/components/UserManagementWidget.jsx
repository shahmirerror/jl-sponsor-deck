import React, { useState } from 'react';
import Card from './Card';
import Button from './Button';

const MODULES = ['Budget Management', 'Task Board', 'Vendor Management', 'Reports/Analytics', 'Settings', 'User Management'];
const OPERATIONS = ['Create', 'Read', 'Update', 'Delete', 'Approve', 'Reject', 'Export'];

const PREDEFINED_ROLES = {
    Admin: {
        description: 'Full system access',
        permissions: MODULES.reduce((acc, module) => {
            acc[module] = OPERATIONS.reduce((ops, op) => ({ ...ops, [op]: true }), {});
            return acc;
        }, {}),
    },
    Manager: {
        description: 'Budget approval, task oversight, reporting',
        permissions: {
            'Budget Management': { Create: true, Read: true, Update: true, Delete: false, Approve: true, Reject: true, Export: true },
            'Task Board': { Create: true, Read: true, Update: true, Delete: false, Approve: false, Reject: false, Export: true },
            'Vendor Management': { Create: true, Read: true, Update: true, Delete: false, Approve: false, Reject: false, Export: true },
            'Reports/Analytics': { Create: false, Read: true, Update: false, Delete: false, Approve: false, Reject: false, Export: true },
            'Settings': { Create: false, Read: true, Update: false, Delete: false, Approve: false, Reject: false, Export: false },
            'User Management': { Create: false, Read: true, Update: false, Delete: false, Approve: false, Reject: false, Export: false },
        },
    },
    Accountant: {
        description: 'Budget, vendor, and financial reporting',
        permissions: {
            'Budget Management': { Create: true, Read: true, Update: true, Delete: false, Approve: false, Reject: false, Export: true },
            'Task Board': { Create: false, Read: true, Update: false, Delete: false, Approve: false, Reject: false, Export: false },
            'Vendor Management': { Create: true, Read: true, Update: true, Delete: false, Approve: false, Reject: false, Export: true },
            'Reports/Analytics': { Create: false, Read: true, Update: false, Delete: false, Approve: false, Reject: false, Export: true },
            'Settings': { Create: false, Read: false, Update: false, Delete: false, Approve: false, Reject: false, Export: false },
            'User Management': { Create: false, Read: false, Update: false, Delete: false, Approve: false, Reject: false, Export: false },
        },
    },
    Lead: {
        description: 'Task coordination, limited permissions',
        permissions: {
            'Budget Management': { Create: false, Read: true, Update: false, Delete: false, Approve: false, Reject: false, Export: false },
            'Task Board': { Create: true, Read: true, Update: true, Delete: false, Approve: false, Reject: false, Export: true },
            'Vendor Management': { Create: false, Read: true, Update: false, Delete: false, Approve: false, Reject: false, Export: false },
            'Reports/Analytics': { Create: false, Read: true, Update: false, Delete: false, Approve: false, Reject: false, Export: false },
            'Settings': { Create: false, Read: false, Update: false, Delete: false, Approve: false, Reject: false, Export: false },
            'User Management': { Create: false, Read: false, Update: false, Delete: false, Approve: false, Reject: false, Export: false },
        },
    },
    Viewer: {
        description: 'Read-only access',
        permissions: MODULES.reduce((acc, module) => {
            acc[module] = OPERATIONS.reduce((ops, op) => ({ ...ops, [op]: op === 'Read' }), {});
            return acc;
        }, {}),
    },
};

const INITIAL_USERS = [
    {
        id: 1,
        name: 'Admin User',
        email: 'admin@jinnah-league.io',
        role: 'Admin',
        department: 'Management',
        customPermissions: null,
        createdAt: new Date(),
    },
    {
        id: 2,
        name: 'Sarah Khan',
        email: 'sarah@jinnah-league.io',
        role: 'Manager',
        department: 'Operations',
        customPermissions: null,
        createdAt: new Date(),
    },
];

const PermissionsMatrix = ({ permissions, onPermissionChange, readOnly = false }) => {
    return (
        <div style={{ overflowX: 'auto' }}>
            <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                background: 'var(--bg-card)',
                borderRadius: '6px',
                overflow: 'hidden',
            }}>
                <thead>
                    <tr style={{ background: 'rgba(0, 0, 0, 0.2)', borderBottom: '2px solid var(--border)' }}>
                        <th style={{ padding: '12px', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem', minWidth: '150px' }}>Module</th>
                        {OPERATIONS.map((op) => (
                            <th key={op} style={{ padding: '12px', textAlign: 'center', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.8rem' }}>{op}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {MODULES.map((module) => (
                        <tr key={module} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '12px', fontWeight: 500, fontSize: '0.9rem' }}>{module}</td>
                            {OPERATIONS.map((op) => (
                                <td key={`${module}-${op}`} style={{ padding: '12px', textAlign: 'center' }}>
                                    <input
                                        type="checkbox"
                                        checked={permissions[module]?.[op] || false}
                                        onChange={(e) => onPermissionChange(module, op, e.target.checked)}
                                        disabled={readOnly}
                                        style={{ cursor: readOnly ? 'not-allowed' : 'pointer', width: '18px', height: '18px' }}
                                    />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const UserManagementWidget = ({ compact = false }) => {
    const [users, setUsers] = useState(INITIAL_USERS);
    const [showForm, setShowForm] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [editingPermissions, setEditingPermissions] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', role: 'Viewer', department: '' });
    const [tempPermissions, setTempPermissions] = useState(null);

    const handleAddUser = (e) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.email.trim() || !formData.department.trim()) return;

        const newUser = {
            id: Math.max(...users.map((u) => u.id), 0) + 1,
            ...formData,
            customPermissions: null,
            createdAt: new Date(),
        };

        setUsers((prev) => [newUser, ...prev]);
        setFormData({ name: '', email: '', role: 'Viewer', department: '' });
        setShowForm(false);
    };

    const handleEditPermissions = (user) => {
        setSelectedUser(user);
        setTempPermissions(user.customPermissions || PREDEFINED_ROLES[user.role].permissions);
        setEditingPermissions(true);
    };

    const handleSavePermissions = () => {
        setUsers((prev) =>
            prev.map((u) =>
                u.id === selectedUser.id
                    ? { ...u, customPermissions: tempPermissions }
                    : u
            )
        );
        setEditingPermissions(false);
        setSelectedUser(null);
        setTempPermissions(null);
    };

    const handlePermissionChange = (module, operation, value) => {
        setTempPermissions((prev) => ({
            ...prev,
            [module]: { ...prev[module], [operation]: value },
        }));
    };

    const handleDeleteUser = (userId) => {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
    };

    const handleChangeRole = (userId, newRole) => {
        setUsers((prev) =>
            prev.map((u) =>
                u.id === userId
                    ? { ...u, role: newRole, customPermissions: null }
                    : u
            )
        );
    };

    const displayUsers = compact ? users.slice(0, 3) : users;

    return (
        <Card style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h4 style={{ marginBottom: '4px' }}>User & Permissions Management</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Manage team members and module access controls</p>
                </div>
                <Button onClick={() => setShowForm(!showForm)} style={{ whiteSpace: 'nowrap' }}>
                    {showForm ? '✕ Cancel' : '+ Add User'}
                </Button>
            </div>

            {showForm && (
                <form
                    onSubmit={handleAddUser}
                    style={{
                        background: 'rgba(0, 0, 0, 0.2)',
                        padding: '16px',
                        borderRadius: '6px',
                        marginBottom: '24px',
                        border: '1px solid var(--border)',
                    }}
                >
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                        <div>
                            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '4px' }}>Name</label>
                            <input
                                type="text"
                                placeholder="Full name"
                                value={formData.name}
                                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                                required
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '4px' }}>Email</label>
                            <input
                                type="email"
                                placeholder="email@jinnah-league.io"
                                value={formData.email}
                                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                                required
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                        <div>
                            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '4px' }}>Role</label>
                            <select value={formData.role} onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}>
                                {Object.keys(PREDEFINED_ROLES).map((role) => (
                                    <option key={role} value={role}>{role}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '4px' }}>Department</label>
                            <input
                                type="text"
                                placeholder="Department"
                                value={formData.department}
                                onChange={(e) => setFormData((prev) => ({ ...prev, department: e.target.value }))}
                                required
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', padding: '10px 14px', cursor: 'pointer', borderRadius: '3px' }}
                        >
                            Cancel
                        </button>
                        <Button type="submit">Add User</Button>
                    </div>
                </form>
            )}

            {editingPermissions && selectedUser && (
                <div style={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    padding: '20px',
                    borderRadius: '6px',
                    marginBottom: '24px',
                    border: '1px solid var(--border)',
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <div>
                            <h5 style={{ marginBottom: '4px' }}>Edit Permissions: {selectedUser.name}</h5>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Custom permissions (overrides {selectedUser.role} role)</p>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                onClick={() => setEditingPermissions(false)}
                                style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', padding: '8px 12px', cursor: 'pointer', borderRadius: '3px', fontSize: '0.85rem' }}
                            >
                                Cancel
                            </button>
                            <Button onClick={handleSavePermissions} style={{ padding: '8px 12px', fontSize: '0.85rem' }}>Save Permissions</Button>
                        </div>
                    </div>
                    <PermissionsMatrix permissions={tempPermissions} onPermissionChange={handlePermissionChange} />
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {displayUsers.length === 0 ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        👥 No users yet
                    </div>
                ) : (
                    displayUsers.map((user) => {
                        const hasCustomPermissions = user.customPermissions !== null;
                        return (
                            <div
                                key={user.id}
                                style={{
                                    padding: '14px',
                                    border: '1px solid var(--border)',
                                    borderRadius: '6px',
                                    background: 'rgba(255,255,255,0.02)',
                                    transition: 'all 0.2s',
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, marginBottom: '4px' }}>{user.name}</div>
                                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '6px' }}>{user.email}</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', whiteSpace: 'nowrap' }}>
                                        <select
                                            value={user.role}
                                            onChange={(e) => handleChangeRole(user.id, e.target.value)}
                                            style={{
                                                background: 'rgba(201, 168, 76, 0.1)',
                                                color: 'var(--accent-gold)',
                                                border: '1px solid rgba(201, 168, 76, 0.3)',
                                                padding: '4px 8px',
                                                fontSize: '0.8rem',
                                                borderRadius: '3px',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            {Object.keys(PREDEFINED_ROLES).map((role) => (
                                                <option key={role} value={role}>{role}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                                    <span style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', padding: '2px 6px', borderRadius: '3px', fontSize: '0.75rem' }}>
                                        {user.department}
                                    </span>
                                    {hasCustomPermissions && (
                                        <span style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-blue)', padding: '2px 6px', borderRadius: '3px', fontSize: '0.75rem' }}>
                                            Custom Permissions
                                        </span>
                                    )}
                                </div>

                                <div style={{ display: 'flex', gap: '6px' }}>
                                    <button
                                        onClick={() => handleEditPermissions(user)}
                                        style={{
                                            background: 'rgba(59,130,246,0.1)',
                                            border: '1px solid rgba(59,130,246,0.3)',
                                            color: 'var(--accent-blue)',
                                            padding: '4px 8px',
                                            fontSize: '0.7rem',
                                            cursor: 'pointer',
                                            borderRadius: '3px',
                                        }}
                                    >
                                        ⚙ Edit Permissions
                                    </button>
                                    <button
                                        onClick={() => handleDeleteUser(user.id)}
                                        style={{
                                            background: 'rgba(239,68,68,0.1)',
                                            border: '1px solid rgba(239,68,68,0.2)',
                                            color: 'var(--danger)',
                                            padding: '4px 8px',
                                            fontSize: '0.7rem',
                                            cursor: 'pointer',
                                            borderRadius: '3px',
                                            marginLeft: 'auto',
                                        }}
                                    >
                                        🗑 Delete
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {compact && users.length > 3 && (
                <div style={{ marginTop: '16px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    ... and {users.length - 3} more users
                </div>
            )}
        </Card>
    );
};

export default UserManagementWidget;
export { PermissionsMatrix, PREDEFINED_ROLES };
