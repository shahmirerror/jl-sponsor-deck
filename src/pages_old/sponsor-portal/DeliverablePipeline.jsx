import React, { useEffect, useState } from 'react';
import Card from '../../components/Card';
import SectionLabel from '../../components/SectionLabel';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import { sponsorPortalHelpers } from '../../lib/supabaseHelpers';

const STATUS_OPTIONS = ['Pending', 'In Progress', 'Completed'];

const DeliverablePipeline = ({ sponsor }) => {
    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [syncError, setSyncError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [dueStartDate, setDueStartDate] = useState('');
    const [dueEndDate, setDueEndDate] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'dueDate', direction: 'asc' });
    const [showTaskForm, setShowTaskForm] = useState(false);
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [isSavingTask, setIsSavingTask] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [taskFormData, setTaskFormData] = useState({
        title: '',
        dueDate: new Date().toISOString().slice(0, 10),
        tier: sponsor?.tier || 'All',
    });

    useEffect(() => {
        let active = true;

        const loadTasks = async () => {
            if (!sponsor?.email) {
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            try {
                const liveResult = await sponsorPortalHelpers.getDeliverablesByEmail(sponsor.email);
                if (liveResult?.error) {
                    throw liveResult.error;
                }

                if (active) {
                    setTasks(liveResult.data || []);
                    setSyncError('');
                }
            } catch (error) {
                if (active) {
                    setTasks([]);
                    setSyncError(error?.message || 'Unable to load deliverables from database.');
                }
            } finally {
                if (active) {
                    setIsLoading(false);
                }
            }
        };

        loadTasks();

        return () => {
            active = false;
        };
    }, [sponsor?.email]);

    const resetTaskForm = () => {
        setTaskFormData({
            title: '',
            dueDate: new Date().toISOString().slice(0, 10),
            tier: sponsor?.tier || 'All',
        });
        setEditingTaskId(null);
    };

    const openCreateTaskForm = () => {
        resetTaskForm();
        setShowTaskForm(true);
    };

    const closeTaskForm = () => {
        setShowTaskForm(false);
        resetTaskForm();
    };

    const handleEditRequest = (task) => {
        setEditingTaskId(task.id);
        setTaskFormData({
            title: task.title || '',
            dueDate: task.dueDate || new Date().toISOString().slice(0, 10),
            tier: task.tier || sponsor?.tier || 'All',
        });
        setShowTaskForm(true);
    };

    const handleTaskFormSubmit = async (event) => {
        event.preventDefault();

        const trimmedTitle = String(taskFormData.title || '').trim();
        const trimmedDueDate = String(taskFormData.dueDate || '').trim();
        if (!trimmedTitle) {
            setSyncError('Deliverable title is required.');
            return;
        }

        if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmedDueDate)) {
            setSyncError('Please provide a valid due date in YYYY-MM-DD format.');
            return;
        }

        setIsSavingTask(true);

        try {
            if (editingTaskId) {
                const liveResult = await sponsorPortalHelpers.updateDeliverableByEmail(sponsor.email, editingTaskId, {
                    title: trimmedTitle,
                    dueDate: trimmedDueDate,
                    tier: taskFormData.tier || sponsor?.tier || 'All',
                });

                if (liveResult?.error) {
                    throw liveResult.error;
                }

                setTasks((prev) => prev.map((item) => (item.id === editingTaskId ? liveResult.data : item)));
            } else {
                const liveResult = await sponsorPortalHelpers.createDeliverableRequestByEmail(sponsor.email, {
                    title: trimmedTitle,
                    dueDate: trimmedDueDate,
                    tier: taskFormData.tier || sponsor?.tier || 'All',
                });

                if (liveResult?.error) {
                    throw liveResult.error;
                }

                setTasks((prev) => [liveResult.data, ...prev]);
            }

            setSyncError('');
            closeTaskForm();
        } catch (error) {
            setSyncError(error?.message || 'Unable to save deliverable request.');
        } finally {
            setIsSavingTask(false);
        }
    };

    const handleDeleteRequest = async (task) => {
        setDeleteTarget(task);
    };

    const confirmDeleteRequest = async () => {
        if (!deleteTarget) {
            return;
        }

        try {
            const liveResult = await sponsorPortalHelpers.deleteDeliverableByEmail(sponsor.email, deleteTarget.id);
            if (liveResult?.error) {
                throw liveResult.error;
            }

            setTasks((prev) => prev.filter((item) => item.id !== deleteTarget.id));
            setSyncError('');
        } catch (error) {
            setSyncError(error?.message || 'Unable to delete deliverable request.');
        } finally {
            setDeleteTarget(null);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Completed':
                return 'var(--success)';
            case 'In Progress':
                return 'var(--warning)';
            case 'Pending':
                return 'var(--info)';
            default:
                return 'var(--text-secondary)';
        }
    };

    const normalizedQuery = searchQuery.trim().toLowerCase();
    const filteredTasks = tasks.filter((task) => {
        const matchesSearch = !normalizedQuery
            || String(task.title || '').toLowerCase().includes(normalizedQuery)
            || String(task.tier || '').toLowerCase().includes(normalizedQuery);

        const matchesStatus = statusFilter === 'All' || task.status === statusFilter;

        const dueDate = String(task.dueDate || '');
        const matchesStartDate = !dueStartDate || (dueDate && dueDate >= dueStartDate);
        const matchesEndDate = !dueEndDate || (dueDate && dueDate <= dueEndDate);

        return matchesSearch && matchesStatus && matchesStartDate && matchesEndDate;
    });

    const sortedTasks = [...filteredTasks].sort((left, right) => {
        const getComparableValue = (task, key) => {
            if (key === 'dueDate') {
                return String(task.dueDate || '9999-12-31');
            }
            if (key === 'requestedOn') {
                return String(task.requestedOn || '0000-01-01');
            }
            if (key === 'status') {
                return String(task.status || '').toLowerCase();
            }
            if (key === 'tier') {
                return String(task.tier || '').toLowerCase();
            }
            return String(task.title || '').toLowerCase();
        };

        const leftValue = getComparableValue(left, sortConfig.key);
        const rightValue = getComparableValue(right, sortConfig.key);

        if (leftValue < rightValue) {
            return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (leftValue > rightValue) {
            return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
    });

    const toggleSort = (key) => {
        setSortConfig((prev) => {
            if (prev.key === key) {
                return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
            }
            return { key, direction: 'asc' };
        });
    };

    const renderSortArrow = (key) => {
        if (sortConfig.key !== key) {
            return '↕';
        }
        return sortConfig.direction === 'asc' ? '↑' : '↓';
    };

    const formatConfirmationLabel = (task) => {
        if (!task?.confirmedBy) {
            return 'Pending admin confirmation';
        }

        return `${task.confirmedBy}${task.confirmedAtLabel ? ` · ${task.confirmedAtLabel}` : ''}`;
    };

    const clearFilters = () => {
        setSearchQuery('');
        setStatusFilter('All');
        setDueStartDate('');
        setDueEndDate('');
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap', marginBottom: '32px' }}>
                <div>
                    <SectionLabel text="Deliverables" />
                    <h2 className="mt-2">Task Request Pipeline</h2>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '8px', maxWidth: '720px' }}>
                        Submit specific marketing needs and track the status of your deliverables. See what has been completed and what's coming up.
                    </p>
                </div>
                <Button onClick={openCreateTaskForm}>Request New Task</Button>
            </div>

            {isLoading && <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>Loading deliverables...</p>}
            {syncError && <p style={{ color: 'var(--danger)', marginBottom: '16px' }}>{syncError}</p>}

            {showTaskForm && (
                <Card style={{ marginBottom: '18px' }}>
                    <h4 style={{ marginBottom: '14px' }}>{editingTaskId ? 'Edit Deliverable Request' : 'New Deliverable Request'}</h4>
                    <form onSubmit={handleTaskFormSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                            <div>
                                <label className="label" style={{ marginBottom: '6px', display: 'block' }}>Title</label>
                                <input
                                    type="text"
                                    value={taskFormData.title}
                                    onChange={(event) => setTaskFormData((prev) => ({ ...prev, title: event.target.value }))}
                                    required
                                    style={{ width: '100%' }}
                                />
                            </div>
                            <div>
                                <label className="label" style={{ marginBottom: '6px', display: 'block' }}>Due Date</label>
                                <input
                                    type="date"
                                    value={taskFormData.dueDate}
                                    onChange={(event) => setTaskFormData((prev) => ({ ...prev, dueDate: event.target.value }))}
                                    required
                                    style={{ width: '100%' }}
                                />
                            </div>
                            <div>
                                <label className="label" style={{ marginBottom: '6px', display: 'block' }}>Tier</label>
                                <input
                                    type="text"
                                    value={taskFormData.tier}
                                    onChange={(event) => setTaskFormData((prev) => ({ ...prev, tier: event.target.value }))}
                                    style={{ width: '100%' }}
                                />
                            </div>
                        </div>
                        <div style={{ marginTop: '14px', display: 'flex', gap: '10px' }}>
                            <Button type="submit" disabled={isSavingTask}>
                                {isSavingTask ? 'Saving...' : (editingTaskId ? 'Save Changes' : 'Create Request')}
                            </Button>
                            <button
                                type="button"
                                onClick={closeTaskForm}
                                style={{ padding: '9px 13px', borderRadius: '4px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </Card>
            )}

            <Card style={{ marginBottom: '18px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '10px', alignItems: 'end' }}>
                    <div>
                        <label className="label" style={{ marginBottom: '6px', display: 'block' }}>Search</label>
                        <input
                            type="text"
                            placeholder="Title or tier"
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            style={{ width: '100%' }}
                        />
                    </div>
                    <div>
                        <label className="label" style={{ marginBottom: '6px', display: 'block' }}>Status</label>
                        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} style={{ width: '100%' }}>
                            <option value="All">All</option>
                            {STATUS_OPTIONS.map((statusOption) => (
                                <option key={statusOption} value={statusOption}>{statusOption}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="label" style={{ marginBottom: '6px', display: 'block' }}>Due From</label>
                        <input type="date" value={dueStartDate} onChange={(event) => setDueStartDate(event.target.value)} style={{ width: '100%' }} />
                    </div>
                    <div>
                        <label className="label" style={{ marginBottom: '6px', display: 'block' }}>Due To</label>
                        <input type="date" value={dueEndDate} onChange={(event) => setDueEndDate(event.target.value)} style={{ width: '100%' }} />
                    </div>
                    <div>
                        <button
                            type="button"
                            onClick={clearFilters}
                            style={{ width: '100%', padding: '10px 12px', borderRadius: '4px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            </Card>

            <Card>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid var(--border)' }}>
                                <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600' }}>
                                    <button type="button" onClick={() => toggleSort('title')} style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, fontWeight: 'inherit' }}>
                                        Deliverable {renderSortArrow('title')}
                                    </button>
                                </th>
                                <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600' }}>
                                    <button type="button" onClick={() => toggleSort('status')} style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, fontWeight: 'inherit' }}>
                                        Status {renderSortArrow('status')}
                                    </button>
                                </th>
                                <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600' }}>
                                    Confirmation
                                </th>
                                <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600' }}>
                                    <button type="button" onClick={() => toggleSort('dueDate')} style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, fontWeight: 'inherit' }}>
                                        Due Date {renderSortArrow('dueDate')}
                                    </button>
                                </th>
                                <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600' }}>
                                    <button type="button" onClick={() => toggleSort('requestedOn')} style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, fontWeight: 'inherit' }}>
                                        Requested {renderSortArrow('requestedOn')}
                                    </button>
                                </th>
                                <th style={{ textAlign: 'center', padding: '12px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600' }}>
                                    <button type="button" onClick={() => toggleSort('tier')} style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, fontWeight: 'inherit' }}>
                                        Tier {renderSortArrow('tier')}
                                    </button>
                                </th>
                                <th style={{ textAlign: 'center', padding: '12px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTasks.length === 0 && !isLoading ? (
                                <tr>
                                    <td colSpan={7} style={{ padding: '20px 12px', color: 'var(--text-secondary)', textAlign: 'center' }}>
                                        No deliverables match the current filters.
                                    </td>
                                </tr>
                            ) : null}
                            {sortedTasks.map((task, idx) => (
                                <tr key={task.id} style={{ borderBottom: idx < sortedTasks.length - 1 ? '1px solid var(--border)' : 'none' }}>
                                    <td style={{ padding: '16px 12px' }}>
                                        <div style={{ fontWeight: '500' }}>{task.title}</div>
                                    </td>
                                    <td style={{ padding: '16px 12px' }}>
                                        <span
                                            style={{
                                                display: 'inline-block',
                                                padding: '6px 10px',
                                                borderRadius: '4px',
                                                border: '1px solid var(--border)',
                                                background: `${getStatusColor(task.status)}20`,
                                                color: getStatusColor(task.status),
                                                fontWeight: '600',
                                            }}
                                        >
                                            {task.status}
                                        </span>
                                        <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                                            Updated by admin confirmation.
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 12px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{task.dueDateLabel || task.dueDate}</td>
                                    <td style={{ padding: '16px 12px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{task.requestedOnLabel || task.requestedOn}</td>
                                    <td style={{ padding: '16px 12px', textAlign: 'center', fontSize: '0.85rem' }}>
                                        <span style={{
                                            display: 'inline-block',
                                            padding: '2px 8px',
                                            background: 'var(--border)',
                                            borderRadius: '3px',
                                            color: 'var(--text-secondary)',
                                        }}>
                                            {task.tier}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px 12px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                        <div style={{ fontWeight: 600, color: task.confirmedBy ? 'var(--text)' : 'var(--warning)' }}>
                                            {formatConfirmationLabel(task)}
                                        </div>
                                        {task.confirmedBy && (
                                            <div style={{ marginTop: '4px', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                                                Recorded by the admin portal.
                                            </div>
                                        )}
                                    </td>
                                    <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                                            <button
                                                type="button"
                                                onClick={() => handleEditRequest(task)}
                                                style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteRequest(task)}
                                                style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid rgba(239,68,68,0.35)', background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', cursor: 'pointer' }}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Card style={{ marginTop: '32px' }}>
                <h4 className="mb-4">Tier Breakdown</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                    <div>
                        <div className="label">Bronze - 6 Deliverables</div>
                        <ul style={{ listStyle: 'none', padding: '12px 0 0 0', fontSize: '0.9rem' }}>
                            <li style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>✓ Logo on website</li>
                            <li style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>✓ Newsletter mention</li>
                        </ul>
                    </div>
                    <div>
                        <div className="label">Silver - 8 Deliverables</div>
                        <ul style={{ listStyle: 'none', padding: '12px 0 0 0', fontSize: '0.9rem' }}>
                            <li style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>✓ All Bronze benefits</li>
                            <li style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>✓ Social media feature</li>
                        </ul>
                    </div>
                    <div>
                        <div className="label">Gold - 10 Deliverables</div>
                        <ul style={{ listStyle: 'none', padding: '12px 0 0 0', fontSize: '0.9rem' }}>
                            <li style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>✓ All Silver benefits</li>
                            <li style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>✓ VIP passes (2x)</li>
                        </ul>
                    </div>
                    <div>
                        <div className="label">Platinum - 12 Deliverables</div>
                        <ul style={{ listStyle: 'none', padding: '12px 0 0 0', fontSize: '0.9rem' }}>
                            <li style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>✓ All Gold benefits</li>
                            <li style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>✓ Custom social reel</li>
                        </ul>
                    </div>
                </div>
            </Card>

            <Modal
                open={Boolean(deleteTarget)}
                title="Delete Deliverable"
                onClose={() => setDeleteTarget(null)}
                footer={[
                    <Button key="cancel" variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>,
                    <Button key="delete" onClick={confirmDeleteRequest}>Delete</Button>,
                ]}
            >
                <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                    Delete deliverable "{deleteTarget?.title}"? This cannot be undone.
                </p>
            </Modal>
        </div>
    );
};

export default DeliverablePipeline;
