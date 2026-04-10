import React, { useEffect, useMemo, useState } from 'react';
import Card from '../../components/Card';
import SectionLabel from '../../components/SectionLabel';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import { DisabledPermissionButton, PermissionReadOnlyNote } from '../../components/PermissionFeedback';
import PortalUserDirectory from '../../components/PortalUserDirectory';
import { PermissionsMatrix, PREDEFINED_ROLES } from '../../components/UserManagementWidget';
import { inventoryHelpers, portalSettingsHelpers } from '../../lib/supabaseHelpers';
import { portalUserStore } from '../../lib/portalUserStore';
import { hasPermission } from '../../lib/permissions';
import { Pencil, Shield, Trash2, UserCog } from 'lucide-react';

const ALL_USERS = [
    { id: 1, name: 'Abdul Rafay', title: 'Finance Lead', email: 'abdul@jinnah.org', role: 'Admin', department: 'Finance' },
    { id: 2, name: 'Sara Khan', title: 'Marketing Manager', email: 'sara@jinnah.org', role: 'Editor', department: 'Marketing' },
    { id: 3, name: 'Ahmed Ali', title: 'Operations', email: 'ahmed@jinnah.org', role: 'Editor', department: 'Operations' },
    { id: 4, name: 'Fatima Hassan', title: 'Partnerships', email: 'fatima@jinnah.org', role: 'Viewer', department: 'Partnerships' },
    { id: 5, name: 'Hassan Malik', title: 'Technology', email: 'hassan@jinnah.org', role: 'Editor', department: 'Technology' },
    { id: 6, name: 'Zainab Noor', title: 'Events', email: 'zainab@jinnah.org', role: 'Viewer', department: 'Events' },
    { id: 7, name: 'Mohammad Usman', title: 'Sponsorships', email: 'usman@jinnah.org', role: 'Editor', department: 'Sponsorship' },
    { id: 8, name: 'Hina Saeed', title: 'Communications', email: 'hina@jinnah.org', role: 'Viewer', department: 'Communications' },
];

const INVENTORY_CATEGORIES = ['Equipment', 'Supplies', 'Software Licenses', 'Furniture', 'Other'];
const isUuidLike = (value) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ''));
const hasPersistedId = (id) => isUuidLike(id);
const currentYear = new Date().getFullYear();

const mapInventoryRow = (row, fallbackId) => ({
    id: row.id || fallbackId,
    name: row.item_name || row.name,
    category: row.category || 'Other',
    owner: row.owner || '',
    quantity: Number(row.quantity || 0),
    location: row.location || '',
    status: row.status || 'Active',
    notes: row.notes || '',
});

const clonePermissions = (permissions) => JSON.parse(JSON.stringify(permissions || {}));

const resolveRolePermissions = (role) => clonePermissions(PREDEFINED_ROLES[role]?.permissions || PREDEFINED_ROLES.Viewer.permissions);

const Settings = ({ user }) => {
    const isAdmin = ['Admin', 'Super Admin'].includes(user?.role);
    const canReadSettings = hasPermission(user, 'Settings', 'Read');
    const canCreateSettings = hasPermission(user, 'Settings', 'Create');
    const canUpdateSettings = hasPermission(user, 'Settings', 'Update');
    const canDeleteSettings = hasPermission(user, 'Settings', 'Delete');
    const canReadUsers = hasPermission(user, 'User Management', 'Read');
    const canCreateUsers = hasPermission(user, 'User Management', 'Create');
    const canUpdateUsers = hasPermission(user, 'User Management', 'Update');
    const canDeleteUsers = hasPermission(user, 'User Management', 'Delete');
    const canManageInventory = canCreateSettings || canUpdateSettings || canDeleteSettings;
    const canManageUsers = canCreateUsers || canUpdateUsers || canDeleteUsers;

    // State Management
    const [inventory, setInventory] = useState([]);
    const [showInventoryForm, setShowInventoryForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [showRoleModal, setShowRoleModal] = useState(null);
    const [newRole, setNewRole] = useState('');
    const [showPermissionModalFor, setShowPermissionModalFor] = useState('');
    const [permissionTarget, setPermissionTarget] = useState(null);
    const [tempPermissions, setTempPermissions] = useState(null);
    const [showUserForm, setShowUserForm] = useState(false);
    const [editingUserEmail, setEditingUserEmail] = useState('');
    const [userFormData, setUserFormData] = useState({ name: '', title: '', email: '', department: '', role: 'Editor', status: 'active', password: '' });
    const [userSearch, setUserSearch] = useState('');
    const [userRoleFilter, setUserRoleFilter] = useState('All');
    const [userDepartmentFilter, setUserDepartmentFilter] = useState('All');
    const [userSort, setUserSort] = useState({ key: 'name', direction: 'asc' });
    const [formData, setFormData] = useState({ name: '', category: 'Equipment', owner: '', quantity: '', location: '', status: 'Active', notes: '' });
    const [orgSettings, setOrgSettings] = useState({ orgName: 'Jinnah League', eventYear: currentYear, totalBudget: 0 });
    const [orgSettingsError, setOrgSettingsError] = useState('');
    const [isSavingOrgSettings, setIsSavingOrgSettings] = useState(false);
    const [showOrgEdit, setShowOrgEdit] = useState(false);
    const [activeAccessTab, setActiveAccessTab] = useState('team');
    const [isLoadingInventory, setIsLoadingInventory] = useState(true);
    const [userRefreshTick, setUserRefreshTick] = useState(0);
    const [deleteInventoryTarget, setDeleteInventoryTarget] = useState(null);
    const [deleteUserTarget, setDeleteUserTarget] = useState(null);
    const [noticeMessage, setNoticeMessage] = useState('');

    const teamUsers = useMemo(() => {
        const admins = portalUserStore.getAdmins();
        if (!admins.length) {
            return ALL_USERS;
        }

        return admins.map((account, index) => ({
            id: account.id || `admin-${index}`,
            name: account.name || account.email,
            title: account.title || 'Team Member',
            email: account.email,
            role: account.role || 'Viewer',
            department: account.department || 'General',
            customPermissions: account.customPermissions || null,
        }));
    }, [userRefreshTick]);

    const availableRoleFilters = useMemo(() => {
        const roles = Array.from(new Set(teamUsers.map((member) => member.role).filter(Boolean)));
        return ['All', ...roles];
    }, [teamUsers]);

    const availableDepartmentFilters = useMemo(() => {
        const departments = Array.from(new Set(teamUsers.map((member) => member.department).filter(Boolean)));
        return ['All', ...departments];
    }, [teamUsers]);

    const filteredTeamUsers = useMemo(() => {
        const query = userSearch.trim().toLowerCase();

        return teamUsers.filter((member) => {
            const matchesSearch = !query ||
                String(member.name || '').toLowerCase().includes(query) ||
                String(member.email || '').toLowerCase().includes(query) ||
                String(member.title || '').toLowerCase().includes(query);

            const matchesRole = userRoleFilter === 'All' || member.role === userRoleFilter;
            const matchesDepartment = userDepartmentFilter === 'All' || member.department === userDepartmentFilter;

            return matchesSearch && matchesRole && matchesDepartment;
        });
    }, [teamUsers, userSearch, userRoleFilter, userDepartmentFilter]);

    const sortedTeamUsers = useMemo(() => {
        const list = [...filteredTeamUsers];
        const directionFactor = userSort.direction === 'asc' ? 1 : -1;

        list.sort((a, b) => {
            const left = String(a?.[userSort.key] || '').toLowerCase();
            const right = String(b?.[userSort.key] || '').toLowerCase();

            if (left < right) return -1 * directionFactor;
            if (left > right) return 1 * directionFactor;
            return 0;
        });

        return list;
    }, [filteredTeamUsers, userSort]);

    const toggleUserSort = (key) => {
        setUserSort((prev) => {
            if (prev.key === key) {
                return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
            }
            return { key, direction: 'asc' };
        });
    };

    const renderSortArrow = (key) => {
        if (userSort.key !== key) return '↕';
        return userSort.direction === 'asc' ? '↑' : '↓';
    };

    useEffect(() => {
        let active = true;

        const loadInventory = async () => {
            setIsLoadingInventory(true);
            const { data, error } = await inventoryHelpers.getItems();
            if (!active) {
                return;
            }

            if (!error && data?.length) {
                setInventory(data.map((row, index) => mapInventoryRow(row, `loaded-${index}`)));
            } else {
                setInventory([]);
            }

            setIsLoadingInventory(false);
        };

        loadInventory();
        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        let active = true;

        const loadOrgSettings = async () => {
            const { data, error } = await portalSettingsHelpers.getSettings();
            if (!active) {
                return;
            }

            if (error) {
                setOrgSettingsError(`Organization settings sync failed: ${error.message || 'check portal_settings table and policies.'}`);
                return;
            }

            if (data) {
                setOrgSettings({
                    orgName: data.orgName || 'Jinnah League',
                    eventYear: Number(data.eventYear || currentYear),
                    totalBudget: Number(data.totalBudget || 0),
                });
            }
            setOrgSettingsError('');
        };

        loadOrgSettings();
        return () => {
            active = false;
        };
    }, []);

    // Inventory CRUD
    const handleAddItem = async (e) => {
        e.preventDefault();
        if (editingId && !canUpdateSettings) return;
        if (!editingId && !canCreateSettings) return;
        if (!formData.name || !formData.owner || !formData.quantity) return;

        const payload = {
            item_name: formData.name,
            category: formData.category,
            owner: formData.owner,
            quantity: parseInt(formData.quantity, 10),
            location: formData.location,
            status: formData.status,
            notes: formData.notes,
            updated_at: new Date().toISOString(),
        };

        if (editingId) {
            if (hasPersistedId(editingId)) {
                const { data, error } = await inventoryHelpers.updateItem(editingId, payload);
                if (!error && data?.[0]) {
                    setInventory(inventory.map((item) => (item.id === editingId ? mapInventoryRow(data[0], editingId) : item)));
                }
            } else {
                setInventory(inventory.map((item) => (item.id === editingId ? { ...item, ...formData, quantity: parseInt(formData.quantity, 10) } : item)));
            }
            setEditingId(null);
        } else {
            const { data, error } = await inventoryHelpers.addItem(payload);
            if (!error && data?.[0]) {
                setInventory([mapInventoryRow(data[0], `created-${Date.now()}`), ...inventory]);
            }
        }

        setFormData({ name: '', category: 'Equipment', owner: '', quantity: '', location: '', status: 'Active', notes: '' });
        setShowInventoryForm(false);
    };

    const handleEditItem = (item) => {
        setEditingId(item.id);
        setFormData({ ...item, quantity: item.quantity.toString() });
        setShowInventoryForm(true);
    };

    const handleDeleteItem = async (id) => {
        if (!canDeleteSettings) return;
        setDeleteInventoryTarget(id);
    };

    const handleChangeRole = (userId, role) => {
        if (!canUpdateUsers) {
            return;
        }
        const member = teamUsers.find((entry) => entry.id === userId);
        if (member?.email) {
            portalUserStore.updateUser('admin', member.email, { role, customPermissions: null });
            setUserRefreshTick((value) => value + 1);
        }

        setShowRoleModal(null);
    };

    const openPermissionEditor = (member) => {
        if (!canUpdateUsers) {
            return;
        }
        setPermissionTarget(member);
        setTempPermissions(member.customPermissions ? clonePermissions(member.customPermissions) : resolveRolePermissions(member.role));
        setShowPermissionModalFor(member.id);
    };

    const closePermissionEditor = () => {
        setShowPermissionModalFor('');
        setPermissionTarget(null);
        setTempPermissions(null);
    };

    const handlePermissionChange = (module, operation, value) => {
        setTempPermissions((prev) => ({
            ...prev,
            [module]: {
                ...(prev?.[module] || {}),
                [operation]: value,
            },
        }));
    };

    const saveCustomPermissions = () => {
        if (!canUpdateUsers) {
            return;
        }
        if (!permissionTarget?.email || !tempPermissions) {
            return;
        }

        portalUserStore.updateUser('admin', permissionTarget.email, { customPermissions: tempPermissions });
        setUserRefreshTick((value) => value + 1);
        closePermissionEditor();
    };

    const resetPermissionsToRoleDefault = () => {
        if (!permissionTarget) {
            return;
        }

        setTempPermissions(resolveRolePermissions(permissionTarget.role));
    };

    const openCreateUserForm = () => {
        setEditingUserEmail('');
        setUserFormData({ name: '', title: '', email: '', department: '', role: 'Editor', status: 'active', password: '' });
        setShowUserForm(true);
    };

    const openEditUserForm = (member) => {
        setEditingUserEmail(member.email);
        setUserFormData({
            name: member.name || '',
            title: member.title || '',
            email: member.email || '',
            department: member.department || '',
            role: member.role || 'Editor',
            status: 'active',
            password: '',
        });
        setShowUserForm(true);
    };

    const closeUserForm = () => {
        setShowUserForm(false);
        setEditingUserEmail('');
        setUserFormData({ name: '', title: '', email: '', department: '', role: 'Editor', status: 'active', password: '' });
    };

    const handleSaveUser = (e) => {
        e.preventDefault();

        if (editingUserEmail && !canUpdateUsers) {
            return;
        }

        if (!editingUserEmail && !canCreateUsers) {
            return;
        }

        if (!userFormData.name.trim() || !userFormData.email.trim()) {
            return;
        }

        const normalizedEmail = String(userFormData.email || '').trim().toLowerCase();
        const payload = {
            name: userFormData.name.trim(),
            title: userFormData.title.trim(),
            email: normalizedEmail,
            department: userFormData.department.trim(),
            role: userFormData.role,
            status: userFormData.status,
        };

        if (editingUserEmail) {
            const patch = { ...payload };
            if (userFormData.password.trim()) {
                patch.password = userFormData.password;
            }
            portalUserStore.updateUser('admin', editingUserEmail, patch);
        } else {
            portalUserStore.upsertAdmin({
                ...payload,
                password: userFormData.password.trim() || 'changeme123!',
            });
        }

        setUserRefreshTick((value) => value + 1);
        closeUserForm();
    };

    const handleDeleteUser = (member) => {
        if (!canDeleteUsers) {
            return;
        }

        const targetEmail = String(member?.email || '').trim().toLowerCase();
        const activeEmail = String(user?.email || '').trim().toLowerCase();
        if (!targetEmail) {
            return;
        }

        if (targetEmail === activeEmail) {
            setNoticeMessage('You cannot delete the currently logged-in admin account.');
            return;
        }

        setDeleteUserTarget({ email: targetEmail, label: member.name || member.email });
    };

    const confirmDeleteInventory = async () => {
        if (!deleteInventoryTarget) {
            return;
        }

        if (hasPersistedId(deleteInventoryTarget)) {
            await inventoryHelpers.deleteItem(deleteInventoryTarget);
        }

        setInventory(inventory.filter((item) => item.id !== deleteInventoryTarget));
        setDeleteInventoryTarget(null);
    };

    const confirmDeleteUser = () => {
        if (!deleteUserTarget?.email) {
            return;
        }

        portalUserStore.deleteUser('admin', deleteUserTarget.email);
        setUserRefreshTick((value) => value + 1);
        setDeleteUserTarget(null);
    };

    const handleSaveOrgSettings = async (e) => {
        e.preventDefault();
        setIsSavingOrgSettings(true);

        const payload = {
            orgName: String(orgSettings.orgName || '').trim() || 'Jinnah League',
            eventYear: Number(orgSettings.eventYear || currentYear),
            totalBudget: Number(orgSettings.totalBudget || 0),
        };

        const { data, error } = await portalSettingsHelpers.saveSettings(payload);
        if (error) {
            setOrgSettingsError(`Organization settings save failed: ${error.message || 'database rejected the update.'}`);
            setIsSavingOrgSettings(false);
            return;
        }

        if (data) {
            setOrgSettings({
                orgName: data.orgName || 'Jinnah League',
                eventYear: Number(data.eventYear || currentYear),
                totalBudget: Number(data.totalBudget || 0),
            });
        }

        setOrgSettingsError('');
        setShowOrgEdit(false);
        setIsSavingOrgSettings(false);
    };

    const activeItems = inventory.filter((i) => i.status === 'Active').length;
    const totalItems = inventory.reduce((sum, i) => sum + i.quantity, 0);

    if (!canReadSettings && !canReadUsers) {
        return (
            <Card style={{ padding: '22px' }}>
                <h4 style={{ marginBottom: '10px' }}>Access Restricted</h4>
                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>You do not have permission to view Inventory & Access settings.</p>
            </Card>
        );
    }

    return (
        <div>
            <div>
                <SectionLabel text="Configuration" />
                <h2 className="mt-2">Portal Settings</h2>
                <p style={{ color: 'var(--text-secondary)', marginTop: '8px', maxWidth: '720px' }}>
                    Manage team access, inventory tracking, and organizational settings.
                </p>
            </div>

            {orgSettingsError ? (
                <Card style={{ padding: '12px 14px', marginTop: '12px', marginBottom: '14px', border: '1px solid rgba(239,68,68,0.35)', background: 'rgba(239,68,68,0.12)', color: 'var(--danger)' }}>
                    {orgSettingsError}
                </Card>
            ) : null}

            <Modal
                open={Boolean(deleteInventoryTarget)}
                title="Delete Inventory Item"
                onClose={() => setDeleteInventoryTarget(null)}
                footer={[
                    <Button key="cancel" variant="outline" onClick={() => setDeleteInventoryTarget(null)}>Cancel</Button>,
                    <Button key="delete" onClick={confirmDeleteInventory}>Delete</Button>,
                ]}
            >
                <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                    Delete this inventory item? This cannot be undone.
                </p>
            </Modal>

            <Modal
                open={Boolean(deleteUserTarget)}
                title="Delete Admin User"
                onClose={() => setDeleteUserTarget(null)}
                footer={[
                    <Button key="cancel" variant="outline" onClick={() => setDeleteUserTarget(null)}>Cancel</Button>,
                    <Button key="delete" onClick={confirmDeleteUser}>Delete</Button>,
                ]}
            >
                <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                    Delete admin user {deleteUserTarget?.label}? This cannot be undone.
                </p>
            </Modal>

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

            {/* Organization Settings */}
            {isAdmin && canUpdateSettings && (
                <Card style={{ padding: '24px', marginBottom: '28px', background: 'linear-gradient(135deg, var(--accent-gold)10, var(--accent-gold)05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <h4 className="mb-4">Organization Information</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '24px' }}>
                                <div>
                                    <div className="label" style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>Organization</div>
                                    <div style={{ fontWeight: '600', fontSize: '1.05rem' }}>{orgSettings.orgName}</div>
                                </div>
                                <div>
                                    <div className="label" style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>Event Year</div>
                                    <div style={{ fontWeight: '600', fontSize: '1.05rem' }}>{orgSettings.eventYear}</div>
                                </div>
                                <div>
                                    <div className="label" style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>Total Budget</div>
                                    <div style={{ fontWeight: '600', fontSize: '1.05rem' }}>
                                        Rs. {Number(orgSettings.totalBudget || 0).toLocaleString('en-IN')}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setShowOrgEdit(!showOrgEdit)} style={{ padding: '8px 16px', background: 'var(--accent-gold)', color: 'black', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
                            ✎ Edit
                        </button>
                    </div>

                    {showOrgEdit && (
                        <form onSubmit={handleSaveOrgSettings} style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                                <div>
                                    <label className="label" style={{ marginBottom: '8px', display: 'block' }}>Organization Name</label>
                                    <input type="text" value={orgSettings.orgName} onChange={(e) => setOrgSettings({ ...orgSettings, orgName: e.target.value })} style={{ width: '100%', padding: '10px', background: 'var(--border)', border: 'none', borderRadius: '6px' }} />
                                </div>
                                <div>
                                    <label className="label" style={{ marginBottom: '8px', display: 'block' }}>Event Year</label>
                                    <input type="number" value={orgSettings.eventYear} onChange={(e) => setOrgSettings({ ...orgSettings, eventYear: Number(e.target.value || currentYear) })} style={{ width: '100%', padding: '10px', background: 'var(--border)', border: 'none', borderRadius: '6px' }} />
                                </div>
                                <div>
                                    <label className="label" style={{ marginBottom: '8px', display: 'block' }}>Total Budget</label>
                                    <input type="number" min="0" value={orgSettings.totalBudget} onChange={(e) => setOrgSettings({ ...orgSettings, totalBudget: Number(e.target.value || 0) })} style={{ width: '100%', padding: '10px', background: 'var(--border)', border: 'none', borderRadius: '6px' }} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button type="submit" disabled={isSavingOrgSettings} style={{ padding: '10px 16px', background: 'var(--success)', color: 'white', border: 'none', borderRadius: '6px', cursor: isSavingOrgSettings ? 'not-allowed' : 'pointer', fontWeight: '600', opacity: isSavingOrgSettings ? 0.7 : 1 }}>
                                    {isSavingOrgSettings ? 'Saving...' : 'Save Changes'}
                                </button>
                                <button type="button" onClick={() => setShowOrgEdit(false)} style={{ padding: '10px 16px', background: 'var(--border)', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </Card>
            )}

            {/* Inventory Section */}
            {canReadSettings && (
            <div style={{ marginBottom: '28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <SectionLabel text="Assets & Resources" />
                    {isAdmin && canCreateSettings && <button onClick={() => { setEditingId(null); setFormData({ name: '', category: 'Equipment', owner: '', quantity: '', location: '', status: 'Active', notes: '' }); setShowInventoryForm(!showInventoryForm); }} style={{ padding: '8px 16px', background: 'var(--accent-gold)', color: 'black', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
                        + Add Item
                    </button>}
                    {isAdmin && !canCreateSettings && <DisabledPermissionButton title="Missing permission: Settings → Create" style={{ padding: '8px 16px' }}>+ Add Item</DisabledPermissionButton>}
                </div>

                {isAdmin && !canManageInventory && (
                    <PermissionReadOnlyNote style={{ marginBottom: '12px' }}>
                        Inventory is view-only for your role. You need Settings Create/Update/Delete permissions to manage items.
                    </PermissionReadOnlyNote>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
                    {[
                        { label: 'Total Items', value: totalItems, icon: '📦' },
                        { label: 'Active', value: activeItems, icon: '✓', color: 'var(--success)' },
                        { label: 'Categories', value: INVENTORY_CATEGORIES.length, icon: '🏷️' },
                    ].map((stat) => (
                        <Card key={stat.label} style={{ padding: '16px', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{stat.icon}</div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '4px' }}>{stat.label}</div>
                            <div style={{ fontWeight: '600', fontSize: '1.3rem', color: stat.color || 'var(--accent-gold)' }}>{stat.value}</div>
                        </Card>
                    ))}
                </div>

                {/* Add/Edit Form */}
                {showInventoryForm && isAdmin && canManageInventory && (
                    <Card style={{ padding: '24px', marginBottom: '20px' }}>
                        <h4 className="mb-4">{editingId ? 'Edit Item' : 'Add Inventory Item'}</h4>
                        <form onSubmit={handleAddItem}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                <div>
                                    <label className="label" style={{ marginBottom: '8px', display: 'block' }}>Item Name *</label>
                                    <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Projectors" style={{ width: '100%', padding: '10px', background: 'var(--border)', border: 'none', borderRadius: '6px' }} />
                                </div>
                                <div>
                                    <label className="label" style={{ marginBottom: '8px', display: 'block' }}>Category</label>
                                    <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} style={{ width: '100%', padding: '10px', background: 'var(--border)', border: 'none', borderRadius: '6px' }}>
                                        {INVENTORY_CATEGORIES.map((cat) => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="label" style={{ marginBottom: '8px', display: 'block' }}>Owner *</label>
                                    <select required value={formData.owner} onChange={(e) => setFormData({ ...formData, owner: e.target.value })} style={{ width: '100%', padding: '10px', background: 'var(--border)', border: 'none', borderRadius: '6px' }}>
                                        <option value="">Select owner...</option>
                                        {teamUsers.map((u) => (
                                            <option key={u.id} value={u.name}>{u.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="label" style={{ marginBottom: '8px', display: 'block' }}>Quantity *</label>
                                    <input type="number" required value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} placeholder="5" style={{ width: '100%', padding: '10px', background: 'var(--border)', border: 'none', borderRadius: '6px' }} />
                                </div>
                                <div>
                                    <label className="label" style={{ marginBottom: '8px', display: 'block' }}>Location</label>
                                    <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="Storage A, Office 1, etc." style={{ width: '100%', padding: '10px', background: 'var(--border)', border: 'none', borderRadius: '6px' }} />
                                </div>
                                <div>
                                    <label className="label" style={{ marginBottom: '8px', display: 'block' }}>Status</label>
                                    <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} style={{ width: '100%', padding: '10px', background: 'var(--border)', border: 'none', borderRadius: '6px' }}>
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                        <option value="Maintenance">Maintenance</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="label" style={{ marginBottom: '8px', display: 'block' }}>Notes</label>
                                <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Additional details..." style={{ width: '100%', padding: '10px', background: 'var(--border)', border: 'none', borderRadius: '6px', minHeight: '60px', resize: 'vertical' }} />
                            </div>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                                <button type="submit" style={{ padding: '10px 16px', background: 'var(--success)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
                                    {editingId ? 'Save Changes' : 'Add Item'}
                                </button>
                                <button type="button" onClick={() => { setShowInventoryForm(false); setEditingId(null); }} style={{ padding: '10px 16px', background: 'var(--border)', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </Card>
                )}

                {/* Inventory Table */}
                <Card style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--border)' }}>
                                    <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600' }}>Item</th>
                                    <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600' }}>Category</th>
                                    <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600' }}>Owner</th>
                                    <th style={{ textAlign: 'center', padding: '12px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600' }}>Qty</th>
                                    <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600' }}>Location</th>
                                    <th style={{ textAlign: 'center', padding: '12px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600' }}>Status</th>
                                    {isAdmin && canManageInventory && <th style={{ textAlign: 'center', padding: '12px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600' }}>Actions</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {inventory.map((item, idx) => (
                                    <tr key={item.id} style={{ borderBottom: idx < inventory.length - 1 ? '1px solid var(--border)' : 'none' }}>
                                        <td style={{ padding: '12px' }}>
                                            <div style={{ fontWeight: '600', marginBottom: '2px' }}>{item.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item.notes}</div>
                                        </td>
                                        <td style={{ padding: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{item.category}</td>
                                        <td style={{ padding: '12px' }}>
                                            <div style={{ fontSize: '0.9rem', fontWeight: '500' }}>{item.owner}</div>
                                        </td>
                                        <td style={{ padding: '12px', textAlign: 'center', fontWeight: '600' }}>{item.quantity}</td>
                                        <td style={{ padding: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{item.location || '—'}</td>
                                        <td style={{ padding: '12px', textAlign: 'center' }}>
                                            <span style={{ display: 'inline-block', padding: '4px 8px', borderRadius: '3px', fontSize: '0.75rem', fontWeight: '600', background: item.status === 'Active' ? 'var(--success)20' : 'var(--danger)20', color: item.status === 'Active' ? 'var(--success)' : 'var(--danger)' }}>
                                                {item.status}
                                            </span>
                                        </td>
                                        {isAdmin && canManageInventory && (
                                            <td style={{ padding: '12px', textAlign: 'center' }}>
                                                <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                                    {canUpdateSettings && <button title="Edit" aria-label="Edit" onClick={() => handleEditItem(item)} style={{ width: '28px', height: '28px', background: 'var(--border)', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <Pencil size={14} />
                                                    </button>}
                                                    {canDeleteSettings && <button title="Delete" aria-label="Delete" onClick={() => handleDeleteItem(item.id)} style={{ width: '28px', height: '28px', background: 'var(--danger)20', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', color: 'var(--danger)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <Trash2 size={14} />
                                                    </button>}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                                {isLoadingInventory && (
                                    <tr>
                                        <td colSpan={isAdmin && canManageInventory ? 7 : 6} style={{ padding: '12px', color: 'var(--text-secondary)' }}>Loading inventory...</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
            )}

            {/* Team Access Control */}
            {canReadUsers && (
            <div>
                <Card style={{ padding: '16px', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
                        <button
                            type="button"
                            onClick={() => setActiveAccessTab('team')}
                            aria-pressed={activeAccessTab === 'team'}
                            style={{
                                padding: '10px 14px',
                                borderRadius: '999px',
                                border: 'none',
                                cursor: 'pointer',
                                fontWeight: '700',
                                background: activeAccessTab === 'team' ? 'var(--accent-gold)' : 'var(--border)',
                                color: activeAccessTab === 'team' ? 'black' : 'var(--text-primary)',
                            }}
                        >
                            Team Management
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveAccessTab('sponsor')}
                            aria-pressed={activeAccessTab === 'sponsor'}
                            style={{
                                padding: '10px 14px',
                                borderRadius: '999px',
                                border: 'none',
                                cursor: 'pointer',
                                fontWeight: '700',
                                background: activeAccessTab === 'sponsor' ? 'var(--accent-gold)' : 'var(--border)',
                                color: activeAccessTab === 'sponsor' ? 'black' : 'var(--text-primary)',
                            }}
                        >
                            Sponsor Access
                        </button>
                    </div>

                    {activeAccessTab === 'team' ? (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <SectionLabel text="Team Management" />
                                {isAdmin && canCreateUsers && (
                                    <button
                                        onClick={openCreateUserForm}
                                        style={{ padding: '8px 16px', background: 'var(--accent-gold)', color: 'black', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                                    >
                                        + Add User
                                    </button>
                                )}
                                {isAdmin && !canCreateUsers && (
                                    <DisabledPermissionButton title="Missing permission: User Management → Create" style={{ padding: '8px 16px' }}>+ Add User</DisabledPermissionButton>
                                )}
                            </div>

                            {isAdmin && !canManageUsers && (
                                <PermissionReadOnlyNote style={{ marginBottom: '12px' }}>
                                    User management is view-only for your role. You need User Management Create/Update/Delete permissions.
                                </PermissionReadOnlyNote>
                            )}

                            {showUserForm && isAdmin && canManageUsers && (
                                <Card style={{ padding: '24px', marginBottom: '16px' }}>
                                    <h4 className="mb-4">{editingUserEmail ? 'Edit Team Member' : 'Create Team Member'}</h4>
                                    <form onSubmit={handleSaveUser}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                            <div>
                                                <label className="label" style={{ marginBottom: '8px', display: 'block' }}>Full Name *</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={userFormData.name}
                                                    onChange={(e) => setUserFormData((prev) => ({ ...prev, name: e.target.value }))}
                                                    style={{ width: '100%', padding: '10px', background: 'var(--border)', border: 'none', borderRadius: '6px' }}
                                                />
                                            </div>
                                            <div>
                                                <label className="label" style={{ marginBottom: '8px', display: 'block' }}>Email *</label>
                                                <input
                                                    type="email"
                                                    required
                                                    value={userFormData.email}
                                                    onChange={(e) => setUserFormData((prev) => ({ ...prev, email: e.target.value }))}
                                                    style={{ width: '100%', padding: '10px', background: 'var(--border)', border: 'none', borderRadius: '6px' }}
                                                />
                                            </div>
                                            <div>
                                                <label className="label" style={{ marginBottom: '8px', display: 'block' }}>Title</label>
                                                <input
                                                    type="text"
                                                    value={userFormData.title}
                                                    onChange={(e) => setUserFormData((prev) => ({ ...prev, title: e.target.value }))}
                                                    style={{ width: '100%', padding: '10px', background: 'var(--border)', border: 'none', borderRadius: '6px' }}
                                                />
                                            </div>
                                            <div>
                                                <label className="label" style={{ marginBottom: '8px', display: 'block' }}>Department</label>
                                                <input
                                                    type="text"
                                                    value={userFormData.department}
                                                    onChange={(e) => setUserFormData((prev) => ({ ...prev, department: e.target.value }))}
                                                    style={{ width: '100%', padding: '10px', background: 'var(--border)', border: 'none', borderRadius: '6px' }}
                                                />
                                            </div>
                                            <div>
                                                <label className="label" style={{ marginBottom: '8px', display: 'block' }}>Role</label>
                                                <select
                                                    value={userFormData.role}
                                                    onChange={(e) => setUserFormData((prev) => ({ ...prev, role: e.target.value }))}
                                                    style={{ width: '100%', padding: '10px', background: 'var(--border)', border: 'none', borderRadius: '6px' }}
                                                >
                                                    {['Super Admin', 'Admin', 'Editor', 'Viewer'].map((role) => (
                                                        <option key={role} value={role}>{role}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="label" style={{ marginBottom: '8px', display: 'block' }}>Status</label>
                                                <select
                                                    value={userFormData.status}
                                                    onChange={(e) => setUserFormData((prev) => ({ ...prev, status: e.target.value }))}
                                                    style={{ width: '100%', padding: '10px', background: 'var(--border)', border: 'none', borderRadius: '6px' }}
                                                >
                                                    <option value="active">Active</option>
                                                    <option value="disabled">Disabled</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="label" style={{ marginBottom: '8px', display: 'block' }}>
                                                {editingUserEmail ? 'New Password (optional)' : 'Password (optional, default: changeme123!)'}
                                            </label>
                                            <input
                                                type="text"
                                                value={userFormData.password}
                                                onChange={(e) => setUserFormData((prev) => ({ ...prev, password: e.target.value }))}
                                                style={{ width: '100%', padding: '10px', background: 'var(--border)', border: 'none', borderRadius: '6px' }}
                                            />
                                        </div>
                                        <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                                            <button type="submit" style={{ padding: '10px 16px', background: 'var(--success)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
                                                {editingUserEmail ? 'Save User' : 'Create User'}
                                            </button>
                                            <button type="button" onClick={closeUserForm} style={{ padding: '10px 16px', background: 'var(--border)', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                </Card>
                            )}

                            <Card style={{ padding: '16px', marginBottom: '12px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 0.7fr 0.7fr', gap: '12px' }}>
                                    <input
                                        type="text"
                                        value={userSearch}
                                        onChange={(e) => setUserSearch(e.target.value)}
                                        placeholder="Search by name, email, or title"
                                        style={{ width: '100%', padding: '10px', background: 'var(--border)', border: 'none', borderRadius: '6px' }}
                                    />
                                    <select
                                        value={userRoleFilter}
                                        onChange={(e) => setUserRoleFilter(e.target.value)}
                                        style={{ width: '100%', padding: '10px', background: 'var(--border)', border: 'none', borderRadius: '6px' }}
                                    >
                                        {availableRoleFilters.map((role) => (
                                            <option key={role} value={role}>{role}</option>
                                        ))}
                                    </select>
                                    <select
                                        value={userDepartmentFilter}
                                        onChange={(e) => setUserDepartmentFilter(e.target.value)}
                                        style={{ width: '100%', padding: '10px', background: 'var(--border)', border: 'none', borderRadius: '6px' }}
                                    >
                                        {availableDepartmentFilters.map((department) => (
                                            <option key={department} value={department}>{department}</option>
                                        ))}
                                    </select>
                                </div>
                                <div style={{ marginTop: '10px', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                                    Showing {sortedTeamUsers.length} of {teamUsers.length} users
                                </div>
                            </Card>

                            <Card style={{ padding: 0, overflow: 'hidden' }}>
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '2px solid var(--border)' }}>
                                                <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600' }}>
                                                    <button onClick={() => toggleUserSort('name')} style={{ all: 'unset', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                                                        Name {renderSortArrow('name')}
                                                    </button>
                                                </th>
                                                <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600' }}>Title</th>
                                                <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600' }}>
                                                    <button onClick={() => toggleUserSort('department')} style={{ all: 'unset', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                                                        Department {renderSortArrow('department')}
                                                    </button>
                                                </th>
                                                <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600' }}>
                                                    <button onClick={() => toggleUserSort('role')} style={{ all: 'unset', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                                                        Access Level {renderSortArrow('role')}
                                                    </button>
                                                </th>
                                                <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600' }}>Email</th>
                                                {isAdmin && canManageUsers && <th style={{ textAlign: 'center', padding: '12px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600' }}>Actions</th>}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sortedTeamUsers.map((member, idx) => (
                                                <tr key={member.id} style={{ borderBottom: idx < sortedTeamUsers.length - 1 ? '1px solid var(--border)' : 'none' }}>
                                                    <td style={{ padding: '12px', fontWeight: '600' }}>{member.name}</td>
                                                    <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{member.title}</td>
                                                    <td style={{ padding: '12px' }}>
                                                        <span style={{ display: 'inline-block', background: 'var(--border)', padding: '4px 10px', borderRadius: '3px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                            {member.department}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '12px' }}>
                                                        <span style={{ display: 'inline-block', background: ['Admin', 'Super Admin'].includes(member.role) ? 'var(--danger)20' : member.role === 'Editor' ? 'var(--accent-gold)20' : 'var(--border)', padding: '4px 10px', borderRadius: '3px', fontSize: '0.8rem', color: ['Admin', 'Super Admin'].includes(member.role) ? 'var(--danger)' : member.role === 'Editor' ? 'var(--accent-gold)' : 'var(--text-secondary)', fontWeight: '600' }}>
                                                            {member.role}
                                                        </span>
                                                        {member.customPermissions && (
                                                            <span style={{ display: 'inline-block', marginLeft: '6px', background: 'rgba(59,130,246,0.12)', color: 'var(--accent-blue)', padding: '4px 8px', borderRadius: '3px', fontSize: '0.72rem', fontWeight: '600' }}>
                                                                Custom
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td style={{ padding: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{member.email}</td>
                                                    {isAdmin && canManageUsers && (
                                                        <td style={{ padding: '12px', textAlign: 'center' }}>
                                                            <div style={{ display: 'inline-flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
                                                                {canUpdateUsers && <button title="Edit user" aria-label="Edit user" onClick={() => openEditUserForm(member)} style={{ width: '28px', height: '28px', background: 'var(--border)', border: 'none', borderRadius: '4px', cursor: 'pointer', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                    <Pencil size={14} />
                                                                </button>}
                                                                {canUpdateUsers && <button title="Change role" aria-label="Change role" onClick={() => setShowRoleModal(member.id)} style={{ width: '28px', height: '28px', background: 'var(--border)', border: 'none', borderRadius: '4px', cursor: 'pointer', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                    <UserCog size={14} />
                                                                </button>}
                                                                {canUpdateUsers && <button title="Edit permissions" aria-label="Edit permissions" onClick={() => openPermissionEditor(member)} style={{ width: '28px', height: '28px', background: 'rgba(59,130,246,0.12)', border: 'none', borderRadius: '4px', cursor: 'pointer', color: 'var(--accent-blue)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                    <Shield size={14} />
                                                                </button>}
                                                                {canDeleteUsers && <button title="Delete user" aria-label="Delete user" onClick={() => handleDeleteUser(member)} style={{ width: '28px', height: '28px', background: 'var(--danger)20', border: 'none', borderRadius: '4px', cursor: 'pointer', color: 'var(--danger)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                    <Trash2 size={14} />
                                                                </button>}
                                                            </div>

                                                            {showRoleModal === member.id && (
                                                                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                                                                    <Card style={{ padding: '32px', maxWidth: '400px' }}>
                                                                        <h4 className="mb-4">Change Role for {member.name}</h4>
                                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                                                                            {['Admin', 'Editor', 'Viewer'].map((role) => (
                                                                                <button key={role} onClick={() => { setNewRole(role); handleChangeRole(member.id, role); }} style={{ padding: '12px', background: role === member.role ? 'var(--accent-gold)' : 'var(--border)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', color: role === member.role ? 'black' : 'var(--text-primary)', transition: 'all 0.2s' }}>
                                                                                    {role}
                                                                                </button>
                                                                            ))}
                                                                        </div>
                                                                        <button onClick={() => setShowRoleModal(null)} style={{ width: '100%', padding: '10px', background: 'var(--border)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
                                                                            Close
                                                                        </button>
                                                                    </Card>
                                                                </div>
                                                            )}
                                                        </td>
                                                    )}
                                                </tr>
                                            ))}
                                            {sortedTeamUsers.length === 0 && (
                                                <tr>
                                                    <td colSpan={isAdmin && canManageUsers ? 6 : 5} style={{ padding: '14px', color: 'var(--text-secondary)' }}>
                                                        No users match the current filters.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        </>
                    ) : (
                        <>
                            <PortalUserDirectory mode="sponsor" />
                        </>
                    )}
                </Card>

                {showPermissionModalFor && permissionTarget && tempPermissions && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '18px' }}>
                        <Card style={{ padding: '22px', width: 'min(1100px, 95vw)', maxHeight: '90vh', overflowY: 'auto' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '14px' }}>
                                <div>
                                    <h4 style={{ marginBottom: '4px' }}>Permissions: {permissionTarget.name}</h4>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
                                        Role: {permissionTarget.role}. Saving creates/updates custom permissions for this user.
                                    </p>
                                </div>
                                <button onClick={closePermissionEditor} style={{ padding: '8px 10px', background: 'var(--border)', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Close</button>
                            </div>

                            <PermissionsMatrix permissions={tempPermissions} onPermissionChange={handlePermissionChange} />

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
                                <button onClick={resetPermissionsToRoleDefault} style={{ padding: '10px 14px', background: 'rgba(245,158,11,0.12)', color: 'var(--warning)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '6px', cursor: 'pointer' }}>
                                    Reset To Role Default
                                </button>
                                <button onClick={saveCustomPermissions} style={{ padding: '10px 14px', background: 'var(--success)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
                                    Save Permissions
                                </button>
                            </div>
                        </Card>
                    </div>
                )}
            </div>
            )}
        </div>
    );
};

export default Settings;
