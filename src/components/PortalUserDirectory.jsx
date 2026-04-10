import React, { useEffect, useMemo, useState } from 'react';
import Card from './Card';
import Button from './Button';
import Modal from './Modal';
import { Plus, Save, ShieldCheck, SquarePen, Trash2, UserPlus, X } from 'lucide-react';
import { portalUserStore } from '../lib/portalUserStore';
import { accountDirectoryHelpers, supabaseStatus } from '../lib/supabaseHelpers';

const createEmptyForm = (kind) => (
    kind === 'sponsor'
        ? {
            kind: 'sponsor',
            id: '',
            email: '',
            password: '',
            company: '',
            tier: 'Gold',
            committed: '',
            contactName: '',
            status: 'active',
        }
        : {
            kind: 'admin',
            id: '',
            email: '',
            password: '',
            name: '',
            role: 'Editor',
            department: '',
            title: '',
            status: 'active',
        }
);

const PortalUserDirectory = ({ mode = 'all' }) => {
    const sponsorOnly = mode === 'sponsor';
    const [scope, setScope] = useState(sponsorOnly ? 'sponsor' : 'all');
    const [query, setQuery] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState(createEmptyForm(sponsorOnly ? 'sponsor' : 'admin'));
    const [isClient, setIsClient] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [dataSource, setDataSource] = useState('loading');
    const [users, setUsers] = useState([]);
    const [noticeMessage, setNoticeMessage] = useState('');
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [passwordTarget, setPasswordTarget] = useState(null);
    const [passwordValue, setPasswordValue] = useState('');

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (sponsorOnly) {
            setScope('sponsor');
            setFormData((prev) => (prev.kind === 'sponsor' ? prev : createEmptyForm('sponsor')));
        }
    }, [sponsorOnly]);

    useEffect(() => {
        if (!isClient) {
            return;
        }
        let active = true;

        const loadDirectory = async () => {
            setIsLoading(true);

            try {
                if (supabaseStatus.configured) {
                    const { data, error } = await accountDirectoryHelpers.getAllAccounts();
                    if (!error && active) {
                        setUsers(data || []);
                        setDataSource('supabase');
                        return;
                    }
                }

                if (active) {
                    setUsers(portalUserStore.getAllUsers());
                    setDataSource('local');
                }
            } finally {
                if (active) {
                    setIsLoading(false);
                }
            }
        };

        loadDirectory();

        return () => {
            active = false;
        };
    }, [isClient]);

    const filteredUsers = useMemo(() => {
        const normalized = query.trim().toLowerCase();
        return users.filter((user) => {
            if (scope !== 'all' && user.kind !== scope) {
                return false;
            }

            if (!normalized) {
                return true;
            }

            const searchable = [user.email, user.name, user.company, user.role, user.tier, user.department, user.title, user.contactName]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();

            return searchable.includes(normalized);
        });
    }, [users, query, scope]);

    const stats = useMemo(() => ({
        admins: users.filter((user) => user.kind === 'admin').length,
        sponsors: users.filter((user) => user.kind === 'sponsor').length,
        active: users.filter((user) => user.status === 'active').length,
        disabled: users.filter((user) => user.status !== 'active').length,
    }), [users]);

    const editingLabel = editingUser?.kind === 'sponsor' ? 'Sponsor Access' : 'Team Member';

    const loadDirectory = async (forceLocal = false) => {
        if (!isClient) {
            return;
        }

        setIsLoading(true);
        try {
            if (!forceLocal && supabaseStatus.configured) {
                const { data, error } = await accountDirectoryHelpers.getAllAccounts();
                if (!error) {
                    setUsers(data || []);
                    setDataSource('supabase');
                    return;
                }
            }

            setUsers(portalUserStore.getAllUsers());
            setDataSource('local');
        } finally {
            setIsLoading(false);
        }
    };

    const saveUser = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.email?.trim()) {
            setNoticeMessage('Email is required');
            return;
        }

        if (formData.kind === 'sponsor') {
            if (!formData.company?.trim()) {
                setNoticeMessage('Company name is required');
                return;
            }
            if (!formData.contactName?.trim()) {
                setNoticeMessage('Contact name is required');
                return;
            }
        } else {
            if (!formData.name?.trim()) {
                setNoticeMessage('Name is required');
                return;
            }
        }

        const trimmedPassword = formData.password.trim();
        const nextPassword = trimmedPassword || editingUser?.password || '';

        if (!editingUser && formData.kind === 'admin' && !nextPassword) {
            setNoticeMessage('Password is required for new accounts');
            return;
        }

        const persistLocally = () => {
            if (formData.kind === 'sponsor') {
                portalUserStore.upsertSponsor({
                    id: formData.id,
                    email: formData.email,
                    password: nextPassword,
                    company: formData.company,
                    tier: formData.tier,
                    committed: formData.committed,
                    contactName: formData.contactName,
                    status: formData.status,
                });
            } else {
                portalUserStore.upsertAdmin({
                    id: formData.id,
                    email: formData.email,
                    password: nextPassword,
                    name: formData.name,
                    role: formData.role,
                    department: formData.department,
                    title: formData.title,
                    status: formData.status,
                });
            }
        };

        try {
            if (supabaseStatus.configured) {
                const result = formData.kind === 'sponsor'
                    ? await accountDirectoryHelpers.saveSponsor({
                        id: formData.id,
                        email: formData.email,
                        password: trimmedPassword,
                        company: formData.company,
                        tier: formData.tier,
                        committed: formData.committed,
                        contactName: formData.contactName,
                        status: formData.status,
                    }, {
                        mode: editingUser ? 'edit' : 'create',
                        originalId: editingUser?.id,
                        originalEmail: editingUser?.email,
                    })
                    : await accountDirectoryHelpers.saveTeamMember({
                        id: formData.id,
                        email: formData.email,
                        password: trimmedPassword,
                        name: formData.name,
                        role: formData.role,
                        department: formData.department,
                        title: formData.title,
                        status: formData.status,
                    }, { mode: editingUser ? 'edit' : 'create' });

                if (!result.error) {
                    setEditingUser(null);
                    setShowForm(false);
                    setFormData(createEmptyForm(formData.kind));
                    await loadDirectory();
                    return;
                } else {
                    setNoticeMessage(`Failed to save: ${result.error.message || 'Unknown error'}`);
                }
            }

            persistLocally();
            setEditingUser(null);
            setShowForm(false);
            setFormData(createEmptyForm(formData.kind));
            await loadDirectory(true);
        } catch (error) {
            console.error('Failed to save portal account', error);
            setNoticeMessage('Error saving account: ' + error.message);
        }
    };

    const startAdd = (kind) => {
        setEditingUser(null);
        setFormData(createEmptyForm(kind));
        setShowForm(true);
    };

    const startEdit = (user) => {
        setEditingUser(user);
        setShowForm(true);
        setFormData(
            user.kind === 'sponsor'
                ? {
                    kind: 'sponsor',
                    id: user.id,
                    email: user.email,
                    password: user.password || '',
                    company: user.company || '',
                    tier: user.tier || 'Gold',
                    committed: String(user.committed || ''),
                    contactName: user.contactName || '',
                    status: user.status || 'active',
                }
                : {
                    kind: 'admin',
                    id: user.id,
                    email: user.email,
                    password: '',
                    name: user.name || '',
                    role: user.role || 'Editor',
                    department: user.department || '',
                    title: user.title || '',
                    status: user.status || 'active',
                }
        );
    };

    const deleteUser = async (user) => {
        setDeleteTarget(user);
    };

    const toggleStatus = async (user) => {
        const nextStatus = user.status === 'active' ? 'disabled' : 'active';

        if (supabaseStatus.configured) {
            const result = user.kind === 'sponsor'
                ? await accountDirectoryHelpers.setSponsorStatus(user.email, nextStatus)
                : await accountDirectoryHelpers.setTeamMemberStatus(user.email, nextStatus);

            if (!result.error) {
                await loadDirectory();
                return;
            }
        }

        portalUserStore.setStatus(user.kind, user.email, nextStatus);
        await loadDirectory(true);
    };

    const resetPassword = async (user) => {
        setPasswordTarget(user);
        setPasswordValue('');
    };

    const confirmDeleteUser = async () => {
        if (!deleteTarget) {
            return;
        }

        const user = deleteTarget;

        if (supabaseStatus.configured) {
            const result = user.kind === 'sponsor'
                ? await accountDirectoryHelpers.deleteSponsor(user.email, user.id)
                : await accountDirectoryHelpers.deleteTeamMember(user.email);

            if (!result.error) {
                setDeleteTarget(null);
                await loadDirectory();
                return;
            }
        }

        portalUserStore.deleteUser(user.kind, user.email);
        setDeleteTarget(null);
        await loadDirectory(true);
    };

    const confirmPasswordReset = async () => {
        if (!passwordTarget) {
            return;
        }

        const nextPassword = String(passwordValue || '').trim();
        if (!nextPassword) {
            setNoticeMessage('Password is required');
            return;
        }

        if (supabaseStatus.configured) {
            const result = passwordTarget.kind === 'sponsor'
                ? await accountDirectoryHelpers.resetSponsorPassword(passwordTarget.email, nextPassword.trim())
                : await accountDirectoryHelpers.resetTeamMemberPassword(passwordTarget.email, nextPassword.trim());

            if (!result.error) {
                setPasswordTarget(null);
                await loadDirectory();
                return;
            }
        }

        portalUserStore.resetPassword(passwordTarget.kind, passwordTarget.email, nextPassword.trim());
        setPasswordTarget(null);
        await loadDirectory(true);
    };

    if (!isClient || isLoading) {
        return (
            <Card style={{ padding: '24px' }}>
                <p style={{ color: 'var(--text-secondary)' }}>Loading portal directory...</p>
            </Card>
        );
    }

    return (
        <Card style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
                <div>
                    <h4 style={{ marginBottom: '6px' }}>{sponsorOnly ? 'Sponsor Access Directory' : 'Portal Directory'}</h4>
                    <p style={{ color: 'var(--text-secondary)', maxWidth: '780px' }}>
                        {sponsorOnly
                            ? 'Add, edit, disable, and remove sponsor portal access from one place. When Supabase is available, changes are written there first and the browser store is used only as a fallback.'
                            : 'Add, edit, disable, and remove team members and sponsor portal access from one place. When Supabase is available, changes are written there first and the browser store is used only as a fallback.'}
                    </p>
                    <p className="label" style={{ color: dataSource === 'supabase' ? 'var(--success)' : 'var(--warning)', marginTop: '8px' }}>
                        {dataSource === 'supabase' ? 'Database-backed directory active' : 'Local fallback directory active'}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {!sponsorOnly && <Button onClick={() => startAdd('admin')} startIcon={<UserPlus size={16} />}>Add Team Member</Button>}
                    <Button onClick={() => startAdd('sponsor')} startIcon={<ShieldCheck size={16} />}>Add Sponsor Access</Button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: sponsorOnly ? 'repeat(2, minmax(0, 1fr))' : 'repeat(3, minmax(0, 1fr))', gap: '16px', marginBottom: '24px' }}>
                {!sponsorOnly && (
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', padding: '16px' }}>
                        <div className="label" style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>Team Members</div>
                        <div style={{ color: 'var(--accent-gold)', fontSize: '1.8rem', fontWeight: 700 }}>{stats.admins}</div>
                    </div>
                )}
                
            </div>

            {showForm && <form onSubmit={saveUser} style={{ display: 'grid', gap: '16px', marginBottom: '24px' }}>
                {!sponsorOnly && (
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input type="radio" checked={formData.kind === 'admin'} onChange={() => setFormData(createEmptyForm('admin'))} /> Admin
                        </label>
                        <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input type="radio" checked={formData.kind === 'sponsor'} onChange={() => setFormData(createEmptyForm('sponsor'))} /> Sponsor
                        </label>
                    </div>
                )}

                {formData.kind === 'admin' ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px' }}>
                        <input placeholder="Full name" value={formData.name} onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))} required />
                        <input placeholder="University email" type="email" value={formData.email} onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))} required />
                        <input placeholder={editingUser ? 'Password (leave blank to keep current)' : 'Password'} value={formData.password} onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))} required={!editingUser} />
                        <select value={formData.role} onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}>
                            <option>Super Admin</option>
                            <option>Admin</option>
                            <option>Editor</option>
                            <option>Viewer</option>
                        </select>
                        <input placeholder="Department" value={formData.department} onChange={(e) => setFormData((prev) => ({ ...prev, department: e.target.value }))} required />
                        <input placeholder="Title" value={formData.title} onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))} required />
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px' }}>
                        <input placeholder="Company name" value={formData.company} onChange={(e) => setFormData((prev) => ({ ...prev, company: e.target.value }))} required />
                        <input placeholder="Sponsor email" type="email" value={formData.email} onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))} required />
                        <input placeholder={editingUser ? 'Password (optional, leave blank to keep current)' : 'Password (optional)'} value={formData.password} onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))} required={false} />
                        <select value={formData.tier} onChange={(e) => setFormData((prev) => ({ ...prev, tier: e.target.value }))}>
                            <option>Bronze</option>
                            <option>Silver</option>
                            <option>Gold</option>
                            <option>Platinum</option>
                        </select>
                        <input placeholder="Committed amount" type="number" value={formData.committed} onChange={(e) => setFormData((prev) => ({ ...prev, committed: e.target.value }))} required />
                        <input placeholder="Primary contact name" value={formData.contactName} onChange={(e) => setFormData((prev) => ({ ...prev, contactName: e.target.value }))} />
                    </div>
                )}

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <select value={formData.status} onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}>
                        <option value="active">active</option>
                        <option value="disabled">disabled</option>
                    </select>
                    <Button type="submit" startIcon={editingUser ? <Save size={16} /> : <Plus size={16} />}>{editingUser ? `Save ${editingLabel}` : `Create ${formData.kind === 'sponsor' ? 'Sponsor Access' : 'Team Member'}`}</Button>
                    <button type="button" onClick={() => { setEditingUser(null); setShowForm(false); setFormData(createEmptyForm(formData.kind)); }} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', padding: '10px 14px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}><X size={14} />{editingUser ? 'Cancel Edit' : 'Cancel'}</button>
                </div>
            </form>}

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
                
                <input placeholder="Search users" value={query} onChange={(e) => setQuery(e.target.value)} style={{ marginLeft: 'auto', minWidth: '240px' }} />
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid var(--border)' }}>
                            <th style={{ textAlign: 'left', padding: '12px' }}>User</th>
                            <th style={{ textAlign: 'left', padding: '12px' }}>Type</th>
                                <th style={{ textAlign: 'left', padding: '12px' }}>Tier</th>
                                <th style={{ textAlign: 'left', padding: '12px' }}>Access</th>
                            <th style={{ textAlign: 'left', padding: '12px' }}>Email</th>
                            <th style={{ textAlign: 'left', padding: '12px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((user) => (
                            <tr key={`${user.kind}:${user.email}`} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '12px' }}>
                                    <div style={{ fontWeight: 600 }}>{user.kind === 'sponsor' ? user.company : user.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{user.kind === 'sponsor' ? user.contactName || 'Sponsor account' : user.title}</div>
                                </td>
                                <td style={{ padding: '12px' }}>
                                    <span className="label" style={{ color: user.kind === 'sponsor' ? 'var(--accent-blue)' : 'var(--accent-gold)' }}>{user.kind}</span>
                                </td>
                                <td style={{ padding: '12px' }}>{user.kind === 'sponsor' ? user.tier : user.role}</td>
                                <td style={{ padding: '12px' }}>{user.status === 'active' ? 'Active' : 'Disabled'}</td>
                                <td style={{ padding: '12px' }}>{user.email}</td>
                                <td style={{ padding: '12px' }}>
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        <button type="button" onClick={() => startEdit(user)} style={{ background: 'var(--border)', border: 'none', padding: '6px 10px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}><SquarePen size={13} />{user.kind === 'sponsor' ? 'Edit Access' : 'Edit Member'}</button>
                                        <button type="button" onClick={() => resetPassword(user)} style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', color: 'var(--accent-blue)', padding: '6px 10px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>{user.kind === 'sponsor' ? <ShieldCheck size={13} /> : <Save size={13} />}{user.kind === 'sponsor' ? 'Reset Access' : 'Reset Password'}</button>
                                        <button type="button" onClick={() => toggleStatus(user)} style={{ background: user.status === 'active' ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)', border: '1px solid var(--border)', color: user.status === 'active' ? 'var(--danger)' : 'var(--success)', padding: '6px 10px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>{user.status === 'active' ? <X size={13} /> : <Plus size={13} />}{user.status === 'active' ? 'Disable Access' : 'Enable Access'}</button>
                                        <button type="button" onClick={() => deleteUser(user)} style={{ background: 'rgba(239,68,68,0.14)', border: '1px solid rgba(239,68,68,0.24)', color: 'var(--danger)', padding: '6px 10px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>{user.kind === 'sponsor' ? 'Remove Sponsor' : 'Remove Member'}<Trash2 size={13} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal
                open={Boolean(noticeMessage)}
                title="Notice"
                onClose={() => setNoticeMessage('')}
                footer={[
                    <Button key="ok" onClick={() => setNoticeMessage('')}>OK</Button>,
                ]}
            >
                <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{noticeMessage}</p>
            </Modal>

            <Modal
                open={Boolean(deleteTarget)}
                title="Delete Account"
                onClose={() => setDeleteTarget(null)}
                footer={[
                    <Button key="cancel" variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>,
                    <Button key="delete" onClick={confirmDeleteUser}>Delete</Button>,
                ]}
            >
                <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                    Delete {deleteTarget?.kind === 'sponsor' ? deleteTarget.company : deleteTarget?.name}? This cannot be undone.
                </p>
            </Modal>

            <Modal
                open={Boolean(passwordTarget)}
                title="Reset Password"
                onClose={() => setPasswordTarget(null)}
                footer={[
                    <Button key="cancel" variant="outline" onClick={() => setPasswordTarget(null)}>Cancel</Button>,
                    <Button key="save" onClick={confirmPasswordReset}>Save</Button>,
                ]}
            >
                <p style={{ marginTop: 0, color: 'var(--text-secondary)' }}>
                    New password for {passwordTarget?.email}
                </p>
                <input
                    type="text"
                    value={passwordValue}
                    onChange={(event) => setPasswordValue(event.target.value)}
                    placeholder="Enter new password"
                    style={{ width: '100%' }}
                />
            </Modal>
        </Card>
    );
};

export default PortalUserDirectory;
