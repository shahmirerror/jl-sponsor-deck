import React, { useEffect, useMemo, useState } from 'react';
import Card from './Card';
import Button from './Button';
import { CheckCircle2, ClipboardPlus, Send, Trash2, X } from 'lucide-react';
import { budgetHelpers } from '../lib/supabaseHelpers';

const REQUEST_CATEGORIES = ['Budget', 'Vendor', 'Event Logistics', 'Other'];
const REQUEST_PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];
const REQUEST_STATUSES = ['Pending', 'Review', 'In Progress', 'Completed'];
const STATUS_COLORS = {
    Pending: 'rgba(245, 158, 11, 0.1)',
    Review: 'rgba(59, 130, 246, 0.1)',
    'In Progress': 'rgba(168, 85, 247, 0.1)',
    Completed: 'rgba(34, 197, 94, 0.1)',
};
const STATUS_TEXT_COLORS = {
    Pending: '#F59E0B',
    Review: '#3B82F6',
    'In Progress': '#a855f7',
    Completed: '#22C55E',
};

const mapRequestRow = (row, fallbackId) => ({
    id: row.id || fallbackId,
    title: row.title || row.purpose || 'Untitled request',
    description: row.description || '',
    category: row.category || 'Budget',
    priority: row.priority || 'Medium',
    amount: row.amount !== null && row.amount !== undefined ? Number(row.amount) : null,
    department: row.department || '',
    dueDate: row.dueDate || row.due_date || 'This week',
    status: row.status || 'Pending',
    createdAt: row.createdAt || row.created_at || new Date(),
    updatedAt: row.updatedAt || row.updated_at || null,
    attachments: row.attachments || [],
});

const isUuidLike = (value) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ''));

const defaultFormData = {
    title: '',
    description: '',
    category: 'Budget',
    priority: 'Medium',
    amount: '',
    department: '',
    dueDate: 'This week',
};

const RequestIntakeWidget = () => {
    const [requests, setRequests] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [activeFilter, setActiveFilter] = useState('All');
    const [editingRequestId, setEditingRequestId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [syncError, setSyncError] = useState('');
    const [formData, setFormData] = useState(defaultFormData);

    useEffect(() => {
        let active = true;

        const loadRequests = async () => {
            setIsLoading(true);
            try {
                const { data, error } = await budgetHelpers.getRequests();
                if (active) {
                    if (!error) {
                        setRequests((data || []).map((row, index) => mapRequestRow(row, `loaded-${index}`)));
                        setSyncError('');
                    } else {
                        setRequests([]);
                        setSyncError(`Request sync failed: ${error.message || 'database unavailable or rejected query.'}`);
                    }
                }
            } finally {
                if (active) {
                    setIsLoading(false);
                }
            }
        };

        loadRequests();

        return () => {
            active = false;
        };
    }, []);

    const sortedRequests = useMemo(() => {
        return [...requests].sort((left, right) => {
            const leftDate = new Date(left.createdAt || left.created_at || 0).getTime();
            const rightDate = new Date(right.createdAt || right.created_at || 0).getTime();
            return rightDate - leftDate;
        });
    }, [requests]);

    const clearForm = () => {
        setFormData(defaultFormData);
        setEditingRequestId(null);
        setShowForm(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title.trim() || !formData.description.trim() || !formData.department.trim()) {
            return;
        }

        const payload = {
            title: formData.title.trim(),
            description: formData.description.trim(),
            category: formData.category,
            priority: formData.priority,
            amount: formData.amount ? Number(formData.amount) : null,
            department: formData.department.trim(),
            dueDate: formData.dueDate,
            status: editingRequestId ? requests.find((request) => request.id === editingRequestId)?.status || 'Pending' : 'Pending',
            updated_at: new Date().toISOString(),
        };

        if (editingRequestId) {
            const nextRequest = {
                id: editingRequestId,
                ...payload,
                attachments: requests.find((request) => request.id === editingRequestId)?.attachments || [],
                createdAt: requests.find((request) => request.id === editingRequestId)?.createdAt || new Date(),
            };

            if (isUuidLike(editingRequestId)) {
                const { data, error } = await budgetHelpers.updateRequest(editingRequestId, payload);
                if (!error && data?.[0]) {
                    const mapped = mapRequestRow(data[0], editingRequestId);
                    setRequests((prev) => prev.map((request) => (request.id === editingRequestId ? mapped : request)));
                    setSyncError('');
                    clearForm();
                    return;
                }

                if (error) {
                    setSyncError(`Request update failed: ${error.message || 'database rejected the update.'}`);
                    return;
                }
            }

            setRequests((prev) => prev.map((request) => (request.id === editingRequestId ? nextRequest : request)));
            clearForm();
            return;
        }

        const { data, error } = await budgetHelpers.createRequest(payload);
        if (!error && data?.[0]) {
            setRequests((prev) => [mapRequestRow(data[0], `created-${Date.now()}`), ...prev]);
            setSyncError('');
            clearForm();
            return;
        }

        setSyncError(`Request create failed: ${error?.message || 'database rejected the insert.'}`);
    };

    const startEdit = (request) => {
        setEditingRequestId(request.id);
        setFormData({
            title: request.title || '',
            description: request.description || '',
            category: request.category || 'Budget',
            priority: request.priority || 'Medium',
            amount: request.amount !== null && request.amount !== undefined ? String(request.amount) : '',
            department: request.department || '',
            dueDate: request.dueDate || 'This week',
        });
        setShowForm(true);
    };

    const cancelEdit = () => {
        clearForm();
    };

    const updateRequestStatus = (requestId, newStatus) => {
        const nextStatus = newStatus;

        if (isUuidLike(requestId)) {
            const request = requests.find((item) => item.id === requestId);
            const updates = {
                status: nextStatus,
                updated_at: new Date().toISOString(),
            };

            if (request?.title) {
                budgetHelpers.updateRequest(requestId, updates).catch(() => {});
            }
        }

        setRequests((prev) => prev.map((r) => (r.id === requestId ? { ...r, status: nextStatus, updatedAt: new Date().toISOString() } : r)));
    };

    const deleteRequest = async (requestId) => {
        if (isUuidLike(requestId)) {
            const { error } = await budgetHelpers.deleteRequest(requestId);
            if (error) {
                setSyncError(`Request delete failed: ${error.message || 'database rejected the delete.'}`);
                return;
            }
        }

        setRequests((prev) => prev.filter((r) => r.id !== requestId));
    };

    const filteredRequests = activeFilter === 'All' ? sortedRequests : sortedRequests.filter((r) => r.status === activeFilter);

    const getNextStatus = (currentStatus) => {
        const statusIndex = REQUEST_STATUSES.indexOf(currentStatus);
        return statusIndex < REQUEST_STATUSES.length - 1 ? REQUEST_STATUSES[statusIndex + 1] : null;
    };

    return (
        <Card style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h4 style={{ marginBottom: '4px' }}>Request Intake</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Submit and track budget, vendor, and logistics requests</p>
                </div>
                <Button
                    onClick={() => setShowForm(!showForm)}
                    style={{ whiteSpace: 'nowrap' }}
                    startIcon={showForm ? <X size={16} /> : <ClipboardPlus size={16} />}
                >
                    {showForm ? 'Cancel' : 'New Request'}
                </Button>
            </div>

            {syncError ? (
                <div style={{ marginBottom: '12px', padding: '10px 12px', border: '1px solid rgba(239,68,68,0.35)', background: 'rgba(239,68,68,0.12)', color: 'var(--danger)', fontSize: '0.85rem' }}>
                    {syncError}
                </div>
            ) : null}

            {showForm && (
                <form
                    onSubmit={handleSubmit}
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
                            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '4px' }}>Title</label>
                            <input
                                type="text"
                                placeholder="Request title"
                                value={formData.title}
                                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                                required
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '4px' }}>Category</label>
                            <select value={formData.category} onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}>
                                {REQUEST_CATEGORIES.map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '4px' }}>Description</label>
                        <textarea
                            placeholder="Detailed description of the request"
                            value={formData.description}
                            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                            required
                            style={{ minHeight: '80px', resize: 'vertical' }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '12px' }}>
                        <div>
                            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '4px' }}>Priority</label>
                            <select value={formData.priority} onChange={(e) => setFormData((prev) => ({ ...prev, priority: e.target.value }))}>
                                {REQUEST_PRIORITIES.map((pri) => (
                                    <option key={pri} value={pri}>{pri}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '4px' }}>Amount (Rs.)</label>
                            <input
                                type="number"
                                placeholder="0"
                                value={formData.amount}
                                onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '4px' }}>Department</label>
                            <input
                                type="text"
                                placeholder="Your dept"
                                value={formData.department}
                                onChange={(e) => setFormData((prev) => ({ ...prev, department: e.target.value }))}
                                required
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '4px' }}>Due Date</label>
                            <select value={formData.dueDate} onChange={(e) => setFormData((prev) => ({ ...prev, dueDate: e.target.value }))}>
                                <option>Today</option>
                                <option>This week</option>
                                <option>Next week</option>
                                <option>Later</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <button
                            type="button"
                            onClick={cancelEdit}
                            style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', padding: '10px 14px', cursor: 'pointer', borderRadius: '3px' }}
                        >
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                <X size={14} />
                                {editingRequestId ? 'Cancel Edit' : 'Cancel'}
                            </span>
                        </button>
                        <Button type="submit" startIcon={<Send size={16} />}>{editingRequestId ? 'Save Changes' : 'Submit Request'}</Button>
                    </div>
                </form>
            )}

            {/* Status Filter Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                {['All', ...REQUEST_STATUSES].map((status) => (
                    <button
                        key={status}
                        onClick={() => setActiveFilter(status)}
                        style={{
                            padding: '6px 12px',
                            borderRadius: '3px',
                            border: activeFilter === status ? `1px solid var(--accent-gold)` : '1px solid var(--border)',
                            background: activeFilter === status ? 'rgba(201, 168, 76, 0.1)' : 'transparent',
                            color: activeFilter === status ? 'var(--accent-gold)' : 'var(--text-secondary)',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            transition: 'all 0.2s',
                        }}
                    >
                        {status}
                    </button>
                ))}
            </div>

            {/* Requests List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {isLoading && (
                    <div style={{ padding: '24px', color: 'var(--text-secondary)' }}>Loading requests...</div>
                )}
                {filteredRequests.length === 0 ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        📭 No {activeFilter !== 'All' ? `${activeFilter.toLowerCase()} ` : ''}requests yet
                    </div>
                ) : (
                    filteredRequests.map((request) => (
                        <div
                            key={request.id}
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
                                    <div style={{ fontWeight: 600, marginBottom: '4px', fontSize: '0.95rem' }}>{request.title}</div>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '6px' }}>{request.description}</div>
                                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                        <span style={{ background: 'rgba(201, 168, 76, 0.1)', color: 'var(--accent-gold)', padding: '2px 6px', borderRadius: '3px', fontSize: '0.75rem' }}>
                                            {request.category}
                                        </span>
                                        <span style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', padding: '2px 6px', borderRadius: '3px', fontSize: '0.75rem' }}>
                                            {request.priority}
                                        </span>
                                        {request.amount && (
                                            <span style={{ background: 'rgba(34, 197, 94, 0.1)', color: 'var(--success)', padding: '2px 6px', borderRadius: '3px', fontSize: '0.75rem' }}>
                                                Rs. {request.amount.toLocaleString('en-IN')}
                                            </span>
                                        )}
                                        <span style={{ color: 'var(--text-secondary)', padding: '2px 6px', fontSize: '0.75rem' }}>
                                            {request.department}
                                        </span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-start', whiteSpace: 'nowrap' }}>
                                    <div
                                        style={{
                                            background: STATUS_COLORS[request.status],
                                            color: STATUS_TEXT_COLORS[request.status],
                                            padding: '4px 8px',
                                            borderRadius: '3px',
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                        }}
                                    >
                                        {request.status}
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div style={{ display: 'flex', gap: '6px', marginTop: '10px', flexWrap: 'wrap' }}>
                                <button
                                    type="button"
                                    onClick={() => startEdit(request)}
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
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                        <Send size={13} />
                                        Edit
                                    </span>
                                </button>
                                {getNextStatus(request.status) && (
                                    <button
                                        type="button"
                                        onClick={() => updateRequestStatus(request.id, getNextStatus(request.status))}
                                        style={{
                                            background: 'rgba(34,197,94,0.1)',
                                            border: '1px solid rgba(34,197,94,0.3)',
                                            color: 'var(--success)',
                                            padding: '4px 8px',
                                            fontSize: '0.7rem',
                                            cursor: 'pointer',
                                            borderRadius: '3px',
                                        }}
                                    >
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                            <CheckCircle2 size={13} />
                                            {getNextStatus(request.status) === 'Completed' ? 'Complete' : getNextStatus(request.status)}
                                        </span>
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => deleteRequest(request.id)}
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
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                        <Trash2 size={13} />
                                        Delete
                                    </span>
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </Card>
    );
};

export default RequestIntakeWidget;
