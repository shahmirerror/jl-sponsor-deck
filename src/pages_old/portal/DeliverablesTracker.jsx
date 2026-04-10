import React, { useEffect, useMemo, useState } from 'react';
import Card from '../../components/Card';
import SectionLabel from '../../components/SectionLabel';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import { sponsorHelpers, sponsorPortalHelpers } from '../../lib/supabaseHelpers';

const STATUS_OPTIONS = ['Pending', 'In Progress', 'Completed'];

const toDisplayDate = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(date);
};

const normalizeSponsor = (row) => {
    const email = String(row?.contact_email || row?.email || '').trim().toLowerCase();
    if (!email) {
        return null;
    }

    return {
        id: row?.id || email,
        name: row?.name || row?.company_name || row?.organization || email,
        tier: row?.tier || 'N/A',
        email,
    };
};

const DeliverablesTracker = ({ user }) => {
    const [sponsors, setSponsors] = useState([]);
    const [selectedSponsorEmail, setSelectedSponsorEmail] = useState('');
    const [deliverables, setDeliverables] = useState([]);
    const [pendingStatuses, setPendingStatuses] = useState({});
    const [isLoadingSponsors, setIsLoadingSponsors] = useState(true);
    const [isLoadingDeliverables, setIsLoadingDeliverables] = useState(false);
    const [confirmingId, setConfirmingId] = useState('');
    const [syncError, setSyncError] = useState('');
    const [syncMessage, setSyncMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [pendingConfirmation, setPendingConfirmation] = useState(null);

    useEffect(() => {
        let active = true;

        const loadSponsors = async () => {
            setIsLoadingSponsors(true);
            const { data, error } = await sponsorHelpers.getSponsors();

            if (!active) {
                return;
            }

            if (error) {
                setSponsors([]);
                setSelectedSponsorEmail('');
                setSyncError(`Unable to load sponsors: ${error.message || 'database query failed.'}`);
                setIsLoadingSponsors(false);
                return;
            }

            const mapped = (data || [])
                .map(normalizeSponsor)
                .filter(Boolean)
                .sort((a, b) => a.name.localeCompare(b.name));

            setSponsors(mapped);
            setSelectedSponsorEmail((prev) => {
                if (prev && mapped.some((item) => item.email === prev)) {
                    return prev;
                }
                return mapped[0]?.email || '';
            });
            setSyncError('');
            setIsLoadingSponsors(false);
        };

        loadSponsors();

        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        let active = true;

        const loadDeliverables = async () => {
            if (!selectedSponsorEmail) {
                setDeliverables([]);
                setPendingStatuses({});
                return;
            }

            setIsLoadingDeliverables(true);
            const result = await sponsorPortalHelpers.getDeliverablesByEmail(selectedSponsorEmail);

            if (!active) {
                return;
            }

            if (result?.error) {
                setDeliverables([]);
                setPendingStatuses({});
                setSyncError(`Unable to load deliverables: ${result.error.message || 'database query failed.'}`);
                setIsLoadingDeliverables(false);
                return;
            }

            const rows = result.data || [];
            const nextPendingStatuses = rows.reduce((acc, row) => {
                acc[row.id] = row.status || 'Pending';
                return acc;
            }, {});

            setDeliverables(rows);
            setPendingStatuses(nextPendingStatuses);
            setSyncError('');
            setIsLoadingDeliverables(false);
        };

        loadDeliverables();

        return () => {
            active = false;
        };
    }, [selectedSponsorEmail]);

    const selectedSponsor = useMemo(
        () => sponsors.find((item) => item.email === selectedSponsorEmail) || null,
        [sponsors, selectedSponsorEmail]
    );

    const visibleDeliverables = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        return deliverables.filter((row) => {
            const matchesStatus = statusFilter === 'All' || row.status === statusFilter;
            const matchesQuery = !query
                || String(row.title || '').toLowerCase().includes(query)
                || String(row.tier || '').toLowerCase().includes(query);

            return matchesStatus && matchesQuery;
        });
    }, [deliverables, searchQuery, statusFilter]);

    const handleStatusSelection = (deliverableId, nextStatus) => {
        setPendingStatuses((prev) => ({
            ...prev,
            [deliverableId]: nextStatus,
        }));
    };

    const confirmStatusUpdate = async (row) => {
        if (!selectedSponsorEmail) {
            return;
        }

        const nextStatus = pendingStatuses[row.id] || row.status || 'Pending';
        const actor = user?.name || user?.email || 'Admin';
        setPendingConfirmation({ row, nextStatus, actor });
    };

    const executeConfirmation = async () => {
        if (!pendingConfirmation?.row) {
            return;
        }

        const { row, nextStatus, actor } = pendingConfirmation;
        setConfirmingId(row.id);
        setSyncMessage('');
        const confirmedAt = new Date().toISOString();

        const result = await sponsorPortalHelpers.updateDeliverableByEmail(selectedSponsorEmail, row.id, {
            status: nextStatus,
            confirmedBy: actor,
            confirmedAt,
        });

        setConfirmingId('');
        setPendingConfirmation(null);

        if (result?.error) {
            setSyncError(`Unable to confirm status update: ${result.error.message || 'database update failed.'}`);
            return;
        }

        const updated = result?.data;
        if (!updated) {
            setSyncError('Status update completed but no row was returned.');
            return;
        }

        setDeliverables((prev) => prev.map((item) => (item.id === row.id ? updated : item)));
        setPendingStatuses((prev) => ({ ...prev, [row.id]: updated.status || nextStatus }));
        setSyncError('');
        setSyncMessage(`Status confirmed for "${updated.title}" as ${updated.status}.`);
    };

    const statusCount = (value) => deliverables.filter((item) => item.status === value).length;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap', marginBottom: '28px' }}>
                <div>
                    <SectionLabel text="Sponsor Operations" />
                    <h2 className="mt-2">Deliverables Status Confirmation</h2>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '8px', maxWidth: '760px' }}>
                        Sponsors submit deliverable requests from their portal. Admins validate progress here and confirm every status update so fulfillment records remain accurate.
                    </p>
                </div>
                <Card style={{ padding: '12px 14px', minWidth: '240px' }}>
                    <div className="label" style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>Confirmed By</div>
                    <div style={{ fontWeight: 600 }}>{user?.name || user?.email || 'Admin'}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: '6px' }}>
                        Sponsor submissions are database-backed.
                    </div>
                </Card>
            </div>

            {syncError && (
                <Card style={{ padding: '12px 14px', marginBottom: '16px', borderColor: 'rgba(220,38,38,0.35)' }}>
                    <p style={{ margin: 0, color: 'var(--danger)' }}>{syncError}</p>
                </Card>
            )}

            {!syncError && syncMessage && (
                <Card style={{ padding: '12px 14px', marginBottom: '16px', borderColor: 'rgba(34,197,94,0.35)' }}>
                    <p style={{ margin: 0, color: 'var(--success)' }}>{syncMessage}</p>
                </Card>
            )}

            <Card style={{ padding: '16px', marginBottom: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 1fr) minmax(200px, 1fr) minmax(180px, 1fr)', gap: '12px', alignItems: 'end' }}>
                    <div>
                        <label className="label" style={{ color: 'var(--text-muted)' }}>Sponsor</label>
                        <select
                            value={selectedSponsorEmail}
                            onChange={(event) => setSelectedSponsorEmail(event.target.value)}
                            disabled={isLoadingSponsors || sponsors.length === 0}
                            style={{ width: '100%', marginTop: '8px' }}
                        >
                            {sponsors.map((item) => (
                                <option key={item.email} value={item.email}>{item.name} ({item.tier})</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="label" style={{ color: 'var(--text-muted)' }}>Search Deliverables</label>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            placeholder="Search by title or tier"
                            style={{ width: '100%', marginTop: '8px' }}
                        />
                    </div>
                    <div>
                        <label className="label" style={{ color: 'var(--text-muted)' }}>Status Filter</label>
                        <select
                            value={statusFilter}
                            onChange={(event) => setStatusFilter(event.target.value)}
                            style={{ width: '100%', marginTop: '8px' }}
                        >
                            <option value="All">All</option>
                            {STATUS_OPTIONS.map((status) => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {selectedSponsor && (
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '16px' }}>
                        <span className="status-pill" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>Total: {deliverables.length}</span>
                        <span className="status-pill" style={{ borderColor: 'rgba(59,130,246,0.35)', color: 'var(--info)' }}>Pending: {statusCount('Pending')}</span>
                        <span className="status-pill" style={{ borderColor: 'rgba(245,158,11,0.35)', color: 'var(--warning)' }}>In Progress: {statusCount('In Progress')}</span>
                        <span className="status-pill" style={{ borderColor: 'rgba(34,197,94,0.35)', color: 'var(--success)' }}>Completed: {statusCount('Completed')}</span>
                    </div>
                )}
            </Card>

            <Card style={{ padding: '0' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '780px' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                <th style={{ textAlign: 'left', padding: '14px 16px' }}>Deliverable</th>
                                <th style={{ textAlign: 'left', padding: '14px 16px' }}>Tier</th>
                                <th style={{ textAlign: 'left', padding: '14px 16px' }}>Requested On</th>
                                <th style={{ textAlign: 'left', padding: '14px 16px' }}>Due Date</th>
                                <th style={{ textAlign: 'left', padding: '14px 16px' }}>Current Status</th>
                                <th style={{ textAlign: 'left', padding: '14px 16px' }}>Last Confirmation</th>
                                <th style={{ textAlign: 'left', padding: '14px 16px' }}>Admin Confirmation</th>
                            </tr>
                        </thead>
                        <tbody>
                            {!selectedSponsorEmail && !isLoadingSponsors && (
                                <tr>
                                    <td colSpan={7} style={{ padding: '16px', color: 'var(--text-secondary)' }}>
                                        No sponsor account available with an email address.
                                    </td>
                                </tr>
                            )}

                            {(isLoadingSponsors || isLoadingDeliverables) && (
                                <tr>
                                    <td colSpan={7} style={{ padding: '16px', color: 'var(--text-secondary)' }}>
                                        Loading deliverables...
                                    </td>
                                </tr>
                            )}

                            {!isLoadingSponsors && !isLoadingDeliverables && selectedSponsorEmail && visibleDeliverables.length === 0 && (
                                <tr>
                                    <td colSpan={7} style={{ padding: '16px', color: 'var(--text-secondary)' }}>
                                        No deliverables match the current filters.
                                    </td>
                                </tr>
                            )}

                            {!isLoadingSponsors && !isLoadingDeliverables && visibleDeliverables.map((row, index) => {
                                const selectedValue = pendingStatuses[row.id] || row.status || 'Pending';
                                const options = STATUS_OPTIONS.includes(selectedValue) ? STATUS_OPTIONS : [...STATUS_OPTIONS, selectedValue];
                                const isBusy = confirmingId === row.id;

                                return (
                                    <tr key={row.id || `${row.title}-${index}`} style={{ borderBottom: index < visibleDeliverables.length - 1 ? '1px solid var(--border)' : 'none' }}>
                                        <td style={{ padding: '14px 16px', fontWeight: 600 }}>{row.title || 'Untitled deliverable'}</td>
                                        <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{row.tier || '-'}</td>
                                        <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{toDisplayDate(row.requestedOn)}</td>
                                        <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{toDisplayDate(row.dueDate)}</td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <span className="status-pill" style={{ borderColor: 'var(--border)' }}>{row.status || 'Pending'}</span>
                                        </td>
                                        <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                                            {row.confirmedBy ? `${row.confirmedBy} · ${toDisplayDate(row.confirmedAt)}` : 'Not confirmed yet'}
                                        </td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                                <select
                                                    value={selectedValue}
                                                    onChange={(event) => handleStatusSelection(row.id, event.target.value)}
                                                    disabled={isBusy}
                                                    style={{ minWidth: '150px' }}
                                                >
                                                    {options.map((status) => (
                                                        <option key={status} value={status}>{status}</option>
                                                    ))}
                                                </select>
                                                <Button
                                                    onClick={() => confirmStatusUpdate(row)}
                                                    disabled={isBusy}
                                                >
                                                    {isBusy ? 'Saving...' : 'Confirm Status'}
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Modal
                open={Boolean(pendingConfirmation)}
                title="Confirm Deliverable Status"
                onClose={() => setPendingConfirmation(null)}
                footer={[
                    <Button key="cancel" variant="outline" onClick={() => setPendingConfirmation(null)}>Cancel</Button>,
                    <Button key="confirm" onClick={executeConfirmation}>Confirm</Button>,
                ]}
            >
                <p style={{ marginTop: 0, color: 'var(--text-secondary)' }}>
                    Confirm "{pendingConfirmation?.row?.title}" as "{pendingConfirmation?.nextStatus}" for {pendingConfirmation?.actor}?
                </p>
                <p style={{ marginBottom: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    This will be recorded in the database as an admin confirmation.
                </p>
            </Modal>
        </div>
    );
};

export default DeliverablesTracker;
