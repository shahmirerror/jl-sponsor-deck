import React, { useEffect, useState } from 'react';
import Card from '../../components/Card';
import SectionLabel from '../../components/SectionLabel';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import { DisabledPermissionButton, PermissionReadOnlyNote } from '../../components/PermissionFeedback';
import { budgetHelpers, portalSettingsHelpers, supabase } from '../../lib/supabaseHelpers';
import { hasPermission } from '../../lib/permissions';
import { Ban, CheckCircle2, Filter, PencilLine, PlusCircle, Send, Trash2, X } from 'lucide-react';

const fmt = (value) => `Rs. ${Number(value).toLocaleString('en-IN')}`;

const SkeletonBlock = ({ width = '100%', height = '16px', radius = '8px', style = {} }) => (
    <div
        className="img-container"
        aria-hidden="true"
        style={{
            width,
            height,
            borderRadius: radius,
            border: '1px solid rgba(255,255,255,0.04)',
            ...style,
        }}
    />
);

const summarySkeletonCards = Array.from({ length: 4 });
const queueSkeletonCards = Array.from({ length: 3 });
const tableSkeletonRows = Array.from({ length: 5 });

const hasPersistedId = (id) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(id || ''));

const mapRequestRow = (row, fallbackId) => ({
    id: row.id || fallbackId,
    purpose: row.purpose || row.title || 'Untitled Request',
    amount: Number(row.amount || 0),
    priority: row.priority || 'Medium',
    vendor: row.vendor || 'Unassigned',
    status: row.status || 'Pending',
    approvedBy: row.approved_by || row.approvedBy || null,
    rejectedBy: row.rejected_by || row.rejectedBy || null,
    rejectionReason: row.rejection_reason || row.rejectionReason || '',
    decisionAt: row.decision_at || row.updated_at || null,
});

const BudgetTracker = ({ user }) => {
    const isAdmin = ['Admin', 'Super Admin'].includes(user?.role);
    const canCreateBudget = hasPermission(user, 'Budget Management', 'Create');
    const canUpdateBudget = hasPermission(user, 'Budget Management', 'Update');
    const canDeleteBudget = hasPermission(user, 'Budget Management', 'Delete');
    const canApproveBudget = hasPermission(user, 'Budget Management', 'Approve');
    const canRejectBudget = hasPermission(user, 'Budget Management', 'Reject');
    const canTakeDecisionActions = canUpdateBudget || canApproveBudget || canRejectBudget;
    const canSeeActions = canTakeDecisionActions || canDeleteBudget;
    const [requests, setRequests] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ purpose: '', amount: '', priority: 'Medium', vendor: '' });
    const [isLoading, setIsLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('All');
    const [syncError, setSyncError] = useState('');
    const [totalBudget, setTotalBudget] = useState(0);
    const [rejectionPrompt, setRejectionPrompt] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        let active = true;

        const loadRequests = async () => {
            setIsLoading(true);
            const [requestsResult, totalBudgetResult] = await Promise.all([
                budgetHelpers.getRequests(),
                portalSettingsHelpers.getTotalBudget(),
            ]);
            if (!active) {
                return;
            }

            const { data, error } = requestsResult;
            let nextSyncError = '';

            if (!error) {
                setRequests((data || []).map((row, index) => mapRequestRow(row, `loaded-${index}`)));
            } else {
                setRequests([]);
                nextSyncError = `Budget requests sync failed: ${error.message || 'check your Supabase policies and schema.'}`;
            }

            if (!totalBudgetResult.error) {
                setTotalBudget(Number(totalBudgetResult.data || 0));
            } else {
                const budgetErrorMessage = `Total budget settings sync failed: ${totalBudgetResult.error.message || 'check portal_settings table and policies.'}`;
                nextSyncError = nextSyncError ? `${nextSyncError} ${budgetErrorMessage}` : budgetErrorMessage;
            }

            setSyncError(nextSyncError);

            setIsLoading(false);
        };

        loadRequests();
        return () => {
            active = false;
        };
    }, []);

    const approvedTotal = requests.filter((request) => request.status === 'Approved').reduce((sum, request) => sum + request.amount, 0);
    const pendingTotal = requests
        .filter((request) => ['Pending', 'In Review', 'Review'].includes(request.status))
        .reduce((sum, request) => sum + request.amount, 0);
    const rejectedCount = requests.filter((request) => request.status === 'Rejected').length;

    const handleCreateRequest = async (e) => {
        e.preventDefault();
        if (!formData.purpose.trim() || !formData.amount) {
            return;
        }

        const { data: requester, error: requesterError } = await supabase
            .from('users')
            .select('id')
            .eq('email', user?.email || '')
            .maybeSingle();

        if (requesterError || !requester?.id) {
            setSyncError(`Could not resolve requester account: ${requesterError?.message || 'no matching Supabase user found for the logged-in email'}`);
            return;
        }

        const payload = {
            requester_id: requester.id,
            title: formData.purpose.trim(),
            purpose: formData.purpose.trim(),
            amount: Number(formData.amount),
            priority: formData.priority,
            vendor: formData.vendor.trim() || 'Unassigned',
            status: 'Pending',
        };

        if (!payload.requester_id) {
            setSyncError('Missing requester id. Log in with a user account that has a valid Supabase user id.');
            return;
        }

        const { data, error } = await budgetHelpers.createRequest(payload);

        if (error) {
            setSyncError(`Budget request create failed: ${error.message || 'database rejected the insert'}`);
            return;
        }

        if (!data?.[0]) {
            setSyncError('Budget request create returned no row from database.');
            return;
        }

        const nextRequest = mapRequestRow(data[0], `created-${Date.now()}`);

        setRequests((prev) => [nextRequest, ...prev]);
        setFormData({ purpose: '', amount: '', priority: 'Medium', vendor: '' });
        setShowForm(false);
    };

    const handleStatusChange = async (id, status) => {
        if (!isAdmin) {
            return;
        }

        if (!canTakeDecisionActions) {
            return;
        }

        const actor = user?.email || user?.name || 'admin';
        const decisionAt = new Date().toISOString();

        if (status === 'Rejected') {
            setRejectionReason('');
            setRejectionPrompt({ id, actor });
            return;
        }

        if (hasPersistedId(id)) {
            let result;
            if (status === 'Approved') {
                if (!canApproveBudget) {
                    return;
                }
                result = await budgetHelpers.approveRequest(id, actor);
            } else if (status === 'Rejected') {
                if (!canRejectBudget) {
                    return;
                }
                result = await budgetHelpers.rejectRequest(id, actor, '');
            } else {
                if (!canUpdateBudget) {
                    return;
                }
                result = await budgetHelpers.updateRequest(id, {
                    status,
                    updated_at: decisionAt,
                });
            }

            if (result?.error) {
                setSyncError(`Budget request update failed: ${result.error.message || 'database rejected the update'}`);
                return;
            }
        }

        setRequests((prev) => prev.map((request) => {
            if (request.id !== id) {
                return request;
            }

            return {
                ...request,
                status,
                approvedBy: status === 'Approved' ? actor : request.approvedBy,
                rejectedBy: status === 'Rejected' ? actor : request.rejectedBy,
                rejectionReason: status === 'Rejected' ? '' : request.rejectionReason,
                decisionAt,
            };
        }));
    };

    const confirmRejection = async () => {
        if (!rejectionPrompt?.id) {
            return;
        }

        const trimmedReason = String(rejectionReason || '').trim();
        const { id, actor } = rejectionPrompt;
        const result = await budgetHelpers.rejectRequest(id, actor, trimmedReason);

        if (result?.error) {
            setSyncError(`Budget request update failed: ${result.error.message || 'database rejected the update'}`);
            return;
        }

        const decisionAt = new Date().toISOString();
        setRequests((prev) => prev.map((request) => {
            if (request.id !== id) {
                return request;
            }

            return {
                ...request,
                status: 'Rejected',
                approvedBy: request.approvedBy,
                rejectedBy: actor,
                rejectionReason: trimmedReason,
                decisionAt,
            };
        }));

        setSyncError('');
        setRejectionPrompt(null);
        setRejectionReason('');
    };

    const handleDeleteRequest = async (id) => {
        if (!isAdmin) {
            return;
        }

        if (!canDeleteBudget) {
            return;
        }

        if (hasPersistedId(id)) {
            const { error } = await budgetHelpers.deleteRequest(id);
            if (error) {
                setSyncError(`Budget request delete failed: ${error.message || 'database rejected the delete'}`);
                return;
            }
        }

        setRequests((prev) => prev.filter((request) => request.id !== id));
    };

    const filteredRequests = activeFilter === 'All'
        ? requests
        : requests.filter((request) => request.status === activeFilter);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap', marginBottom: '32px' }}>
                <div>
                    <SectionLabel text="Finance" />
                    <h2 className="mt-2">Budget Requisition System</h2>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '8px', maxWidth: '720px' }}>
                        Teams submit requests with purpose, amount, priority, and vendor details before Finance signs off.
                    </p>
                </div>
                {canCreateBudget && (
                    <Button
                        onClick={() => setShowForm((prev) => !prev)}
                        startIcon={showForm ? <X size={16} /> : <PlusCircle size={16} />}
                    >
                        {showForm ? 'Close Form' : 'Submit Request'}
                    </Button>
                )}
                {!canCreateBudget && isAdmin && (
                    <DisabledPermissionButton
                        title="Missing permission: Budget Management → Create"
                        style={{ fontWeight: '400' }}
                    >
                        Submit Request
                    </DisabledPermissionButton>
                )}
            </div>

            {!canCreateBudget && (
                <PermissionReadOnlyNote style={{ marginTop: '-18px' }}>
                    You have read-only access for creating budget requests. Ask an admin to grant Budget Management Create permission.
                </PermissionReadOnlyNote>
            )}

            {syncError ? (
                <Card style={{ padding: '12px 14px', marginBottom: '16px', border: '1px solid rgba(245,158,11,0.35)', background: 'rgba(245,158,11,0.12)', color: 'var(--warning)' }}>
                    {syncError}
                </Card>
            ) : null}

            {showForm && canCreateBudget && (
                <Card style={{ padding: '24px', marginBottom: '24px' }}>
                    <h4 style={{ marginBottom: '16px' }}>New Requisition</h4>
                    <form onSubmit={handleCreateRequest}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                            <input
                                type="text"
                                placeholder="Purpose"
                                value={formData.purpose}
                                onChange={(e) => setFormData((prev) => ({ ...prev, purpose: e.target.value }))}
                                required
                            />
                            <input
                                type="number"
                                placeholder="Amount"
                                value={formData.amount}
                                onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
                                required
                            />
                            <select value={formData.priority} onChange={(e) => setFormData((prev) => ({ ...prev, priority: e.target.value }))}>
                                <option>Low</option>
                                <option>Medium</option>
                                <option>High</option>
                            </select>
                            <input
                                type="text"
                                placeholder="Vendor"
                                value={formData.vendor}
                                onChange={(e) => setFormData((prev) => ({ ...prev, vendor: e.target.value }))}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
                            <Button type="submit" startIcon={<Send size={16} />}>
                                Queue Request
                            </Button>
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', padding: '10px 14px', cursor: 'pointer' }}
                            >
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                    <X size={14} />
                                    Cancel
                                </span>
                            </button>
                        </div>
                    </form>
                </Card>
            )}

            <Modal
                open={Boolean(rejectionPrompt)}
                title="Reject Budget Request"
                onClose={() => setRejectionPrompt(null)}
                footer={[
                    <Button key="cancel" variant="outline" onClick={() => setRejectionPrompt(null)}>Cancel</Button>,
                    <Button key="reject" onClick={confirmRejection}>Reject</Button>,
                ]}
            >
                <p style={{ marginTop: 0, color: 'var(--text-secondary)' }}>
                    Add an optional rejection reason before confirming.
                </p>
                <textarea
                    value={rejectionReason}
                    onChange={(event) => setRejectionReason(event.target.value)}
                    placeholder="Reason for rejection"
                    rows={4}
                    style={{ width: '100%', resize: 'vertical' }}
                />
            </Modal>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
                {isLoading
                    ? summarySkeletonCards.map((_, index) => (
                        <Card key={index} style={{ padding: '22px', minHeight: '106px' }}>
                            <SkeletonBlock width="58%" height="12px" style={{ marginBottom: '14px' }} />
                            <SkeletonBlock width="82%" height="28px" />
                        </Card>
                    ))
                    : [
                        { label: 'Total Budget', value: fmt(totalBudget), color: 'var(--text-primary)' },
                        { label: 'Approved', value: fmt(approvedTotal), color: 'var(--success)' },
                        { label: 'Pending Review', value: fmt(pendingTotal), color: 'var(--warning)' },
                        { label: 'Rejected Requests', value: String(rejectedCount), color: 'var(--danger)' },
                    ].map((metric) => (
                        <Card key={metric.label} style={{ padding: '22px' }}>
                            <div className="label" style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>{metric.label}</div>
                            <div className="data-figure" style={{ color: metric.color, fontSize: '1.4rem' }}>{metric.value}</div>
                        </Card>
                    ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '28px', marginBottom: '32px' }}>
                <Card style={{ padding: '24px' }}>
                    <h4 style={{ marginBottom: '18px' }}>Decision Queue</h4>
                    <div style={{ display: 'grid', gap: '14px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '12px' }}>
                            {isLoading
                                ? queueSkeletonCards.map((_, index) => (
                                    <div key={index} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', padding: '12px', borderRadius: '6px' }}>
                                        <SkeletonBlock width="64%" height="12px" style={{ marginBottom: '12px' }} />
                                        <SkeletonBlock width="42%" height="28px" />
                                    </div>
                                ))
                                : (
                                    <>
                                        <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', padding: '12px' }}>
                                            <div className="label" style={{ color: 'var(--warning)' }}>Pending / Review</div>
                                            <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{requests.filter((request) => ['Pending', 'In Review', 'Review'].includes(request.status)).length}</div>
                                        </div>
                                        <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', padding: '12px' }}>
                                            <div className="label" style={{ color: 'var(--success)' }}>Approved</div>
                                            <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{requests.filter((request) => request.status === 'Approved').length}</div>
                                        </div>
                                        <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', padding: '12px' }}>
                                            <div className="label" style={{ color: 'var(--danger)' }}>Rejected</div>
                                            <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{rejectedCount}</div>
                                        </div>
                                    </>
                                )}
                        </div>
                        <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>
                            Use the action buttons in the requisition queue to approve or reject each request. Rejected items stay in history for audit.
                        </p>
                    </div>
                </Card>
                <Card style={{ padding: '24px' }}>
                    <h4 style={{ marginBottom: '18px' }}>Approval guidance</h4>
                    <ul style={{ display: 'grid', gap: '12px', color: 'var(--text-secondary)', listStyle: 'disc', paddingLeft: '18px' }}>
                        <li>High-priority requests need finance and core team review.</li>
                        <li>Vendor names should include a contact or quotation reference.</li>
                        <li>Requests above Rs. 100k require admin approval.</li>
                        <li>Approved requests are automatically tracked in expenditure follow-up.</li>
                        <li>Rejected requests remain visible to maintain approval/denial history.</li>
                    </ul>
                </Card>
            </div>

            <h4 style={{ marginBottom: '16px' }}>Requisition queue</h4>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
                {[
                    { label: 'All', icon: <Filter size={14} /> },
                    { label: 'Pending', icon: <PencilLine size={14} /> },
                    { label: 'In Review', icon: <Filter size={14} /> },
                    { label: 'Approved', icon: <CheckCircle2 size={14} /> },
                    { label: 'Rejected', icon: <Ban size={14} /> },
                ].map(({ label, icon }) => (
                    <button
                        key={label}
                        type="button"
                        onClick={() => setActiveFilter(label)}
                        style={{
                            padding: '6px 10px',
                            borderRadius: '3px',
                            border: activeFilter === label ? '1px solid var(--accent-gold)' : '1px solid var(--border)',
                            background: activeFilter === label ? 'rgba(201,168,76,0.1)' : 'transparent',
                            color: activeFilter === label ? 'var(--accent-gold)' : 'var(--text-secondary)',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                        }}
                    >
                        {icon}
                        {label}
                    </button>
                ))}
            </div>
            <div className="portal-table-container">
                <table className="portal-table">
                    <thead>
                        <tr>
                            <th>Purpose</th>
                            <th>Amount</th>
                            <th>Priority</th>
                            <th>Vendor</th>
                            <th>Status</th>
                            <th>Decision Audit</th>
                            {isAdmin && canSeeActions && <th>Action</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            tableSkeletonRows.map((_, index) => (
                                <tr key={index}>
                                    <td><SkeletonBlock width="72%" /></td>
                                    <td><SkeletonBlock width="60%" /></td>
                                    <td><SkeletonBlock width="54%" /></td>
                                    <td><SkeletonBlock width="68%" /></td>
                                    <td><SkeletonBlock width="48%" /></td>
                                    <td><SkeletonBlock width="78%" /></td>
                                    {isAdmin && canSeeActions && <td><SkeletonBlock width="100%" height="32px" radius="4px" /></td>}
                                </tr>
                            ))
                        ) : filteredRequests.map((request) => (
                            <tr key={request.id}>
                                <td><strong>{request.purpose}</strong></td>
                                <td className="data-figure" style={{ color: 'var(--accent-gold)', fontSize: '0.9rem' }}>{fmt(request.amount)}</td>
                                <td>
                                    <span className="status-badge" style={{ background: request.priority === 'High' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)', color: request.priority === 'High' ? 'var(--danger)' : 'var(--warning)' }}>{request.priority}</span>
                                </td>
                                <td style={{ color: 'var(--text-secondary)' }}>{request.vendor}</td>
                                <td>
                                    <span
                                        className="status-badge"
                                        style={{
                                            background: request.status === 'Approved'
                                                ? 'rgba(34,197,94,0.1)'
                                                : request.status === 'Rejected'
                                                    ? 'rgba(239,68,68,0.1)'
                                                    : 'rgba(201,168,76,0.08)',
                                            color: request.status === 'Approved'
                                                ? 'var(--success)'
                                                : request.status === 'Rejected'
                                                    ? 'var(--danger)'
                                                    : 'var(--accent-gold)',
                                        }}
                                    >
                                        {request.status}
                                    </span>
                                </td>
                                <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                                    {request.status === 'Approved' && request.approvedBy && (
                                        <span>Approved by {request.approvedBy}</span>
                                    )}
                                    {request.status === 'Rejected' && (
                                        <span>
                                            Rejected{request.rejectedBy ? ` by ${request.rejectedBy}` : ''}
                                            {request.rejectionReason ? `: ${request.rejectionReason}` : ''}
                                        </span>
                                    )}
                                    {!['Approved', 'Rejected'].includes(request.status) && <span>Pending decision</span>}
                                </td>
                                {isAdmin && canSeeActions && (
                                    <td>
                                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                            {canApproveBudget && request.status !== 'Approved' && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleStatusChange(request.id, 'Approved')}
                                                    title="Approve"
                                                    aria-label="Approve"
                                                    style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', color: 'var(--success)', width: '30px', height: '30px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '0.75rem' }}
                                                >
                                                    <CheckCircle2 size={14} />
                                                </button>
                                            )}
                                            {canUpdateBudget && request.status !== 'In Review' && request.status !== 'Approved' && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleStatusChange(request.id, 'In Review')}
                                                    title="Mark In Review"
                                                    aria-label="Mark In Review"
                                                    style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', color: 'var(--warning)', width: '30px', height: '30px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '0.75rem' }}
                                                >
                                                    <PencilLine size={14} />
                                                </button>
                                            )}
                                            {canRejectBudget && request.status !== 'Rejected' && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleStatusChange(request.id, 'Rejected')}
                                                    title="Reject"
                                                    aria-label="Reject"
                                                    style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--danger)', width: '30px', height: '30px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '0.75rem' }}
                                                >
                                                    <Ban size={14} />
                                                </button>
                                            )}
                                            {canDeleteBudget && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteRequest(request.id)}
                                                    title="Delete"
                                                    aria-label="Delete"
                                                    style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--danger)', width: '30px', height: '30px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '0.75rem' }}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                        {!isLoading && filteredRequests.length === 0 && (
                            <tr>
                                <td colSpan={isAdmin && canSeeActions ? 7 : 6} style={{ color: 'var(--text-secondary)' }}>
                                    No requests in this status.
                                </td>
                            </tr>
                        )}
                        <tr style={{ background: 'rgba(201,168,76,0.08)' }}>
                            <td><strong>Total approved</strong></td>
                            <td className="data-figure" style={{ color: 'var(--accent-gold)', fontSize: '0.9rem' }}><strong>{fmt(approvedTotal)}</strong></td>
                            <td colSpan={isAdmin && canSeeActions ? 5 : 4} style={{ color: 'var(--text-secondary)' }}>Budget used on approved requests</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default BudgetTracker;
