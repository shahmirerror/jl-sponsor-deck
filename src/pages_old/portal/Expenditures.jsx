import React, { useState, useEffect } from 'react';
import Card from '../../components/Card';
import SectionLabel from '../../components/SectionLabel';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import { DisabledPermissionButton, PermissionReadOnlyNote } from '../../components/PermissionFeedback';
import { budgetHelpers, expenditureHelpers, supabase } from '../../lib/supabaseHelpers';
import { hasPermission } from '../../lib/permissions';
import { Download, Eye, Pencil, PlusCircle, RefreshCcw, Save, Trash2, X } from 'lucide-react';

const CATEGORIES = ['Venue', 'Marketing', 'Technology', 'Catering', 'Transportation', 'Other'];

const mapLogRow = (row, fallbackId) => ({
    id: row.id || fallbackId,
    date: row.date,
    category: row.category || 'Other',
    amount: Number(row.amount || 0),
    description: row.description || '',
    task: row.task || '',
    receipt: Boolean(row.receipt_url),
    receipt_url: row.receipt_url || null,
    logged_by: row.logged_by || null,
});

const hasPersistedId = (id) => id && !String(id).startsWith('created-') && !String(id).startsWith('loaded-');

const Expenditures = ({ user }) => {
    const [logs, setLogs] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingExpenseId, setEditingExpenseId] = useState(null);
    const [selectedReceipt, setSelectedReceipt] = useState(null);
    const [filter, setFilter] = useState('All');
    const [formData, setFormData] = useState({ date: '', category: 'Venue', description: '', amount: '', task: '' });
    const [receipt, setReceipt] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [syncError, setSyncError] = useState('');
    const [approvedBudgetTotal, setApprovedBudgetTotal] = useState(0);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [showExportNotice, setShowExportNotice] = useState(false);

    const isAdmin = ['Admin', 'Super Admin'].includes(user?.role);
    const canCreateExpense = hasPermission(user, 'Budget Management', 'Create');
    const canUpdateExpense = hasPermission(user, 'Budget Management', 'Update');
    const canDeleteExpense = hasPermission(user, 'Budget Management', 'Delete');
    const canExportReports = hasPermission(user, 'Reports/Analytics', 'Export');
    const totalSpent = logs.reduce((sum, log) => sum + log.amount, 0);
    const fmt = (value) => `Rs. ${Number(value).toLocaleString('en-IN')}`;

    const categorySpending = CATEGORIES.map((cat) => ({
        category: cat,
        spend: logs.filter((l) => l.category === cat).reduce((sum, l) => sum + l.amount, 0),
        count: logs.filter((l) => l.category === cat).length,
    }));

    const loadLogs = async () => {
        setIsLoading(true);
        const [expenseResult, budgetResult] = await Promise.all([
            expenditureHelpers.getExpenditures(),
            budgetHelpers.getRequests({ status: 'Approved' }),
        ]);

        const { data, error } = expenseResult;

        if (error) {
            setLogs([]);
            setSyncError(`Expenditures sync failed: ${error.message || 'check Supabase policies and schema.'}`);
        } else {
            setLogs((data || []).map((row, index) => mapLogRow(row, `loaded-${index}`)));
            setSyncError('');
        }

        if (!budgetResult.error) {
            const approvedTotal = (budgetResult.data || []).reduce((sum, request) => sum + Number(request.amount || 0), 0);
            setApprovedBudgetTotal(approvedTotal);
        }

        setIsLoading(false);
    };

    useEffect(() => {
        let active = true;

        const guardedLoad = async () => {
            setIsLoading(true);
            const [expenseResult, budgetResult] = await Promise.all([
                expenditureHelpers.getExpenditures(),
                budgetHelpers.getRequests({ status: 'Approved' }),
            ]);

            const { data, error } = expenseResult;
            if (!active) {
                return;
            }

            if (error) {
                setLogs([]);
                setSyncError(`Expenditures sync failed: ${error.message || 'check Supabase policies and schema.'}`);
            } else {
                setLogs((data || []).map((row, index) => mapLogRow(row, `loaded-${index}`)));
                setSyncError('');
            }

            if (!budgetResult.error) {
                const approvedTotal = (budgetResult.data || []).reduce((sum, request) => sum + Number(request.amount || 0), 0);
                setApprovedBudgetTotal(approvedTotal);
            }

            setIsLoading(false);
        };

        guardedLoad();
        return () => {
            active = false;
        };
    }, []);

    const handleAddExpense = async (e) => {
        e.preventDefault();
        if (editingExpenseId && !canUpdateExpense) return;
        if (!editingExpenseId && !canCreateExpense) return;
        if (!formData.date || !formData.amount) return;

        const loggerEmail = (user?.email || '').trim();
        const existingLog = editingExpenseId ? logs.find((entry) => entry.id === editingExpenseId) : null;

        let resolvedLoggerId = existingLog?.logged_by || logs.find((entry) => entry?.logged_by)?.logged_by || null;
        let loggerWarning = '';

        if (loggerEmail) {
            const { data: logger, error: loggerLookupError } = await supabase
                .from('users')
                .select('id')
                .ilike('email', loggerEmail)
                .maybeSingle();

            if (loggerLookupError) {
                loggerWarning = `Could not verify logger via users.email (${loggerLookupError.message || 'lookup failed'}).`;
            }

            resolvedLoggerId = logger?.id || resolvedLoggerId;
        }

        if (!resolvedLoggerId) {
            const { data: userFallback, error: userFallbackError } = await supabase
                .from('users')
                .select('id,email,role')
                .order('created_at', { ascending: true })
                .limit(1);

            if (userFallbackError) {
                if (loggerWarning) {
                    loggerWarning = `${loggerWarning} ${userFallbackError.message || 'unable to read users table for fallback account.'}`;
                } else {
                    loggerWarning = userFallbackError.message || 'Unable to read users table for fallback account.';
                }
            }

            if (userFallback?.length) {
                resolvedLoggerId = userFallback[0].id;
                if (loggerEmail) {
                    loggerWarning = `No users.email match for ${loggerEmail}. Logged this expense under ${userFallback[0].email || 'an existing user account'} instead.`;
                }
            }
        }

        const parsedAmount = Number(formData.amount);
        if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
            setSyncError('Enter a valid positive amount before saving.');
            return;
        }

        const payload = {
            date: formData.date,
            category: formData.category,
            description: formData.description?.trim() || formData.task?.trim() || 'Expense entry',
            amount: parsedAmount,
            receipt_url: receipt ? receipt.name : null,
        };

        if (resolvedLoggerId) {
            payload.logged_by = resolvedLoggerId;
        }

        let data;
        let error;

        if (editingExpenseId && hasPersistedId(editingExpenseId)) {
            const updateResult = await expenditureHelpers.updateExpense(editingExpenseId, payload);
            data = updateResult.data;
            error = updateResult.error;
        } else if (editingExpenseId) {
            data = [{ id: editingExpenseId, ...payload, task: formData.task?.trim() || '' }];
            error = null;
        } else {
            const createResult = await expenditureHelpers.logExpense(payload);
            data = createResult.data;
            error = createResult.error;
        }

        if (error) {
            const loggerHint = !resolvedLoggerId
                ? ' Logger account could not be resolved; run EXPENDITURES_CRUD_FIX.sql or add a users row matching this portal email.'
                : '';
            const operation = editingExpenseId ? 'update' : 'create';
            const defaultReason = editingExpenseId ? 'database rejected the update' : 'database rejected the insert';
            setSyncError(`Expense ${operation} failed: ${error.message || defaultReason}.${loggerHint}`);
            return;
        }

        const newLog = data?.[0]
            ? {
                ...mapLogRow(data[0], editingExpenseId || `created-${Date.now()}`),
                task: formData.task?.trim() || data[0]?.task || '',
            }
            : {
                id: editingExpenseId || `created-${Date.now()}`,
                ...payload,
                task: formData.task?.trim() || '',
                receipt: Boolean(payload.receipt_url),
                logged_by: payload.logged_by,
            };

        setSyncError(loggerWarning);
        setLogs((prev) => {
            if (editingExpenseId) {
                return prev.map((entry) => (entry.id === editingExpenseId ? newLog : entry));
            }
            return [newLog, ...prev];
        });
        setFormData({ date: '', category: 'Venue', description: '', amount: '', task: '' });
        setReceipt(null);
        setEditingExpenseId(null);
        setShowForm(false);
    };

    const startEditExpense = (log) => {
        setEditingExpenseId(log.id);
        setFormData({
            date: log.date || '',
            category: log.category || 'Venue',
            description: log.description || '',
            amount: String(log.amount || ''),
            task: log.task || '',
        });
        setReceipt(null);
        setShowForm(true);
    };

    const cancelExpenseForm = () => {
        setShowForm(false);
        setEditingExpenseId(null);
        setReceipt(null);
        setFormData({ date: '', category: 'Venue', description: '', amount: '', task: '' });
    };

    const handleDeleteExpense = async (id) => {
        if (!canDeleteExpense) return;
        setDeleteTarget(id);
    };

    const confirmDeleteExpense = async () => {
        if (!deleteTarget) {
            return;
        }

        if (hasPersistedId(deleteTarget)) {
            const { error } = await expenditureHelpers.deleteExpense(deleteTarget);
            if (error) {
                setSyncError(`Expense delete failed: ${error.message || 'database rejected the delete'}`);
                return;
            }
        }

        setSyncError('');
        setLogs((prev) => prev.filter((l) => l.id !== deleteTarget));
        setDeleteTarget(null);
    };

    const filteredLogs = filter === 'All' ? logs : logs.filter((l) => l.category === filter);

    const variance = approvedBudgetTotal - totalSpent;
    const tasksCompleted = logs.length;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <SectionLabel text="Logbook" />
                    <h2 className="mt-2">Expenditure Tracker</h2>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '8px', maxWidth: '720px' }}>
                        Log completed tasks with receipts. Finance can audit spending and identify budget overruns in real-time.
                    </p>
                </div>
                {isAdmin && (canCreateExpense || canUpdateExpense) && (
                    <Button
                        onClick={() => setShowForm((prev) => !prev)}
                        startIcon={showForm ? <X size={16} /> : <PlusCircle size={16} />}
                    >
                        {showForm ? 'Close Form' : 'Log Expense'}
                    </Button>
                )}
                {isAdmin && !(canCreateExpense || canUpdateExpense) && (
                    <DisabledPermissionButton
                        title="Missing permission: Budget Management → Create or Update"
                        style={{ fontWeight: '400' }}
                    >
                        Log Expense
                    </DisabledPermissionButton>
                )}
            </div>

            {isAdmin && !(canCreateExpense || canUpdateExpense) && (
                <PermissionReadOnlyNote style={{ marginTop: '-18px' }}>
                    You can view expenditures but cannot add/edit entries with your current permissions.
                </PermissionReadOnlyNote>
            )}

            {syncError ? (
                <Card style={{ padding: '12px 14px', marginBottom: '16px', border: '1px solid rgba(245,158,11,0.35)', background: 'rgba(245,158,11,0.12)', color: 'var(--warning)' }}>
                    {syncError}
                </Card>
            ) : null}

            {/* Summary Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '28px' }}>
                {[
                    { label: 'Tasks completed', value: tasksCompleted, icon: '✓' },
                    { label: 'Budget spent', value: fmt(totalSpent), icon: '💰' },
                    { label: 'Variance', value: fmt(variance), icon: variance < 0 ? '⚠️' : '📈', color: variance < 0 ? 'var(--danger)' : 'var(--success)' },
                ].map((metric) => (
                    <Card key={metric.label} style={{ padding: '22px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <div className="label" style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>{metric.label}</div>
                                <div className="data-figure" style={{ color: metric.color || 'var(--accent-gold)', fontSize: '1.4rem' }}>{metric.value}</div>
                            </div>
                            <span style={{ fontSize: '1.5rem' }}>{metric.icon}</span>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Add Expense Form */}
            {showForm && isAdmin && (canCreateExpense || canUpdateExpense) && (
                <Card style={{ padding: '24px', marginBottom: '28px' }}>
                    <h4 className="mb-4">{editingExpenseId ? 'Edit Expense' : 'Log New Expense'}</h4>
                    <form onSubmit={handleAddExpense}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                            <div>
                                <label className="label" style={{ marginBottom: '8px', display: 'block' }}>Date</label>
                                <input type="date" required value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} style={{ width: '100%', padding: '10px', background: 'var(--border)', border: 'none', borderRadius: '6px' }} />
                            </div>
                            <div>
                                <label className="label" style={{ marginBottom: '8px', display: 'block' }}>Category</label>
                                <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} style={{ width: '100%', padding: '10px', background: 'var(--border)', border: 'none', borderRadius: '6px' }}>
                                    {CATEGORIES.map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="label" style={{ marginBottom: '8px', display: 'block' }}>Amount (Rs.)</label>
                                <input type="number" required value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} placeholder="50000" style={{ width: '100%', padding: '10px', background: 'var(--border)', border: 'none', borderRadius: '6px' }} />
                            </div>
                            <div>
                                <label className="label" style={{ marginBottom: '8px', display: 'block' }}>Task/Description</label>
                                <input type="text" value={formData.task} onChange={(e) => setFormData({ ...formData, task: e.target.value })} placeholder="e.g., Venue booking" style={{ width: '100%', padding: '10px', background: 'var(--border)', border: 'none', borderRadius: '6px' }} />
                            </div>
                        </div>
                        <div>
                            <label className="label" style={{ marginBottom: '8px', display: 'block' }}>Description</label>
                            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Additional details..." style={{ width: '100%', padding: '10px', background: 'var(--border)', border: 'none', borderRadius: '6px', minHeight: '80px', resize: 'vertical' }} />
                        </div>

                        {/* Receipt Upload */}
                        <div style={{ marginTop: '16px' }}>
                            <label className="label" style={{ marginBottom: '8px', display: 'block' }}>Attach Receipt (Optional)</label>
                            <div style={{ border: '2px dashed var(--border)', borderRadius: '6px', padding: '20px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent-gold)')} onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}>
                                <input type="file" accept="image/*,application/pdf" onChange={(e) => setReceipt(e.target.files?.[0])} style={{ display: 'none' }} id="receipt-upload" />
                                <label htmlFor="receipt-upload" style={{ cursor: 'pointer', display: 'block' }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📄</div>
                                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>{receipt ? receipt.name : 'Click to upload receipt'}</div>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>PDF, PNG, or JPG (Max 5MB)</div>
                                </label>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                            <Button type="submit" startIcon={<Save size={16} />}>{editingExpenseId ? 'Update Expense' : 'Save Expense'}</Button>
                            <Button type="button" variant="outline" onClick={cancelExpenseForm} startIcon={<X size={16} />}>Cancel</Button>
                        </div>
                    </form>
                </Card>
            )}

            {/* Category Breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px', marginBottom: '28px' }}>
                <Card style={{ padding: '24px' }}>
                    <h4 className="mb-4">Spending by Category</h4>
                    <div style={{ display: 'grid', gap: '16px' }}>
                        {categorySpending.filter((c) => c.spend > 0).map((row) => (
                            <div key={row.category}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span style={{ fontWeight: '500' }}>{row.category}</span>
                                    <span style={{ color: 'var(--accent-gold)', fontWeight: '600' }}>{fmt(row.spend)}</span>
                                </div>
                                <div style={{ height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ width: `${(row.spend / (totalSpent || 1)) * 100}%`, height: '100%', background: 'var(--accent-gold)', transition: 'width 0.3s' }}></div>
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{row.count} transactions</div>
                            </div>
                        ))}
                    </div>
                </Card>
                <Card style={{ padding: '24px' }}>
                    <h4 className="mb-4">Quick Actions</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <Button variant="outline" startIcon={<Download size={16} />} onClick={() => setShowExportNotice(true)} disabled={!canExportReports} title={canExportReports ? 'Export report' : 'Missing permission: Reports/Analytics → Export'}>
                            Export Report
                        </Button>
                        <Button variant="outline" startIcon={<RefreshCcw size={16} />} onClick={loadLogs}>
                            Refresh Data
                        </Button>
                    </div>
                </Card>
            </div>

            <Modal
                open={Boolean(deleteTarget)}
                title="Delete Expense"
                onClose={() => setDeleteTarget(null)}
                footer={[
                    <Button key="cancel" variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>,
                    <Button key="delete" onClick={confirmDeleteExpense}>Delete</Button>,
                ]}
            >
                <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                    Delete this expense record? This cannot be undone.
                </p>
            </Modal>

            <Modal
                open={showExportNotice}
                title="Export Report"
                onClose={() => setShowExportNotice(false)}
                footer={[
                    <Button key="ok" onClick={() => setShowExportNotice(false)}>OK</Button>,
                ]}
            >
                <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                    Export functionality coming soon.
                </p>
            </Modal>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', borderBottom: '2px solid var(--border)', paddingBottom: '12px', overflowX: 'auto' }}>
                {['All', ...CATEGORIES].map((cat) => (
                    <button key={cat} onClick={() => setFilter(cat)} style={{ padding: '8px 16px', background: filter === cat ? 'var(--accent-gold)' : 'transparent', color: filter === cat ? 'black' : 'var(--text-secondary)', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: filter === cat ? '600' : '400', whiteSpace: 'nowrap', transition: 'all 0.2s' }}>
                        {cat} {filter !== 'All' && cat !== 'All' && `(${categorySpending.find((c) => c.category === cat)?.count || 0})`}
                    </button>
                ))}
            </div>

            {/* Expenditure Table */}
            <Card style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid var(--border)' }}>
                                <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600' }}>Date</th>
                                <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600' }}>Category</th>
                                <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600' }}>Description</th>
                                <th style={{ textAlign: 'left', padding: '12px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600' }}>Task</th>
                                <th style={{ textAlign: 'right', padding: '12px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600' }}>Amount</th>
                                <th style={{ textAlign: 'center', padding: '12px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600' }}>Receipt</th>
                                {isAdmin && (canUpdateExpense || canDeleteExpense) && <th style={{ textAlign: 'center', padding: '12px', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600' }}>Action</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLogs.map((log, idx) => (
                                <tr key={log.id} style={{ borderBottom: idx < filteredLogs.length - 1 ? '1px solid var(--border)' : 'none' }}>
                                    <td style={{ padding: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{log.date}</td>
                                    <td style={{ padding: '12px' }}>
                                        <span style={{ display: 'inline-block', background: 'var(--border)', padding: '4px 10px', borderRadius: '3px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{log.category}</span>
                                    </td>
                                    <td style={{ padding: '12px' }}>{log.description || log.task}</td>
                                    <td style={{ padding: '12px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{log.task}</td>
                                    <td style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: 'var(--danger)' }}>-{fmt(log.amount)}</td>
                                    <td style={{ padding: '12px', textAlign: 'center' }}>
                                        {log.receipt ? (
                                            <button
                                                type="button"
                                                onClick={() => setSelectedReceipt(log)}
                                                title="View receipt"
                                                aria-label="View receipt"
                                                style={{ width: '30px', height: '30px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', borderRadius: '4px', cursor: 'pointer' }}
                                            >
                                                <Eye size={14} />
                                            </button>
                                        ) : (
                                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>—</span>
                                        )}
                                    </td>
                                    {isAdmin && (canUpdateExpense || canDeleteExpense) && (
                                        <td style={{ padding: '12px', textAlign: 'center' }}>
                                            <div style={{ display: 'inline-flex', gap: '8px' }}>
                                                {canUpdateExpense && (
                                                    <button
                                                        type="button"
                                                        onClick={() => startEditExpense(log)}
                                                        title="Edit"
                                                        aria-label="Edit"
                                                        style={{ width: '30px', height: '30px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', borderRadius: '4px', cursor: 'pointer' }}
                                                    >
                                                        <Pencil size={14} />
                                                    </button>
                                                )}
                                                {canDeleteExpense && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteExpense(log.id)}
                                                        title="Delete"
                                                        aria-label="Delete"
                                                        style={{ width: '30px', height: '30px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '1px solid rgba(239, 68, 68, 0.45)', color: 'var(--danger)', borderRadius: '4px', cursor: 'pointer' }}
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                            {isLoading && (
                                <tr>
                                    <td colSpan={isAdmin && (canUpdateExpense || canDeleteExpense) ? 7 : 6} style={{ padding: '12px', color: 'var(--text-secondary)' }}>Loading expenditures...</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default Expenditures;
