import React, { useEffect, useMemo, useState } from 'react';
import Card from '../../components/Card';
import SectionLabel from '../../components/SectionLabel';
import Button from '../../components/Button';
import { DisabledPermissionButton, PermissionReadOnlyNote } from '../../components/PermissionFeedback';
import { budgetHelpers, expenditureHelpers, sponsorHelpers, sponsorPortalHelpers, taskHelpers } from '../../lib/supabaseHelpers';
import { hasPermission } from '../../lib/permissions';

// Simple Chart Components (no external dependencies)
const SimpleBarChart = ({ data, title, valueFormatter = (value) => `Rs. ${(value / 1000).toFixed(0)}k` }) => {
    const maxValue = Math.max(...data.map((d) => d.value), 0);
    const safeMaxValue = maxValue > 0 ? maxValue : 1;
    return (
        <Card style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <h4 style={{ marginBottom: '16px', marginTop: 0 }}>{title}</h4>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', height: '240px', paddingBottom: '16px', flex: 1 }}>
                {data.map((item) => (
                    <div key={item.name} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end' }}>
                        <div style={{ width: '100%', height: `${(item.value / safeMaxValue) * 200}px`, background: item.color || 'var(--accent-gold)', borderRadius: '6px 6px 0 0', marginBottom: '10px', transition: 'all 0.3s ease', cursor: 'pointer' }} onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85', e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)')} onMouseLeave={(e) => (e.currentTarget.style.opacity = '1', e.currentTarget.style.boxShadow = 'none')}></div>
                        <div style={{ fontSize: '0.8rem', textAlign: 'center', color: 'var(--text-secondary)', fontWeight: '600', marginBottom: '6px' }}>{item.name}</div>
                        <div style={{ fontSize: '0.75rem', fontWeight: '600', color: item.color || 'var(--accent-gold)', textAlign: 'center', wordBreak: 'break-word' }}>{valueFormatter(item.value, item)}</div>
                    </div>
                ))}
            </div>
        </Card>
    );
};

const SimplePieChart = ({ data, title }) => {
    const total = data.reduce((sum, d) => sum + d.value, 0);
    let angle = -90;
    const slices = data.map((item) => {
        const sliceAngle = (item.value / total) * 360;
        const radius = 100;
        const startAngle = (angle * Math.PI) / 180;
        const endAngle = ((angle + sliceAngle) * Math.PI) / 180;

        const x1 = radius * Math.cos(startAngle) + 120;
        const y1 = radius * Math.sin(startAngle) + 120;
        const x2 = radius * Math.cos(endAngle) + 120;
        const y2 = radius * Math.sin(endAngle) + 120;

        const largeArc = sliceAngle > 180 ? 1 : 0;
        angle += sliceAngle;

        return { item, x1, y1, x2, y2, largeArc, angle: startAngle, data };
    });

    return (
        <Card style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <h4 style={{ marginBottom: '16px', marginTop: 0 }}>{title}</h4>
            <div style={{ display: 'flex', gap: '32px', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
                <svg width="240" height="240" viewBox="0 0 240 240" style={{ flexShrink: 0, minWidth: '240px' }}>
                    {slices.map((slice, idx) => {
                        const color = slice.item.color || ['var(--accent-gold)', 'var(--success)', 'var(--danger)', 'var(--info)', 'var(--warning)'][idx % 5];
                        const pathData = `M 120 120 L ${slice.x1} ${slice.y1} A 100 100 0 ${slice.largeArc} 1 ${slice.x2} ${slice.y2} Z`;
                        return (
                            <path key={idx} d={pathData} fill={color} stroke="var(--bg)" strokeWidth="2" style={{ cursor: 'pointer', transition: 'opacity 0.2s' }} onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')} onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')} />
                        );
                    })}
                </svg>

                <div style={{ minWidth: '200px' }}>
                    {data.map((item, idx) => (
                        <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: idx < data.length - 1 ? '14px' : 0, paddingBottom: idx < data.length - 1 ? '14px' : 0, borderBottom: idx < data.length - 1 ? '1px solid var(--border)' : 'none' }}>
                            <div style={{ width: '14px', height: '14px', background: item.color || ['var(--accent-gold)', 'var(--success)', 'var(--danger)', 'var(--info)', 'var(--warning)'][idx % 5], borderRadius: '4px', flexShrink: 0 }}></div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '2px' }}>{item.name}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{((item.value / total) * 100).toFixed(1)}%</div>
                            </div>
                            <div style={{ fontSize: '0.8rem', fontWeight: '600', color: item.color, whiteSpace: 'nowrap', textAlign: 'right' }}>Rs. {(item.value / 1000).toFixed(0)}k</div>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    );
};

const getMonthKey = (value) => {
    const d = new Date(value);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

const monthLabel = (monthKey) => {
    const [year, month] = monthKey.split('-').map(Number);
    return new Date(year, month - 1, 1).toLocaleDateString('en-US', { month: 'short' });
};

const buildMonthRange = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const months = [];

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || startDate > endDate) {
        return months;
    }

    let cursor = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const cutoff = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
    while (cursor <= cutoff) {
        months.push(getMonthKey(cursor));
        cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
    }

    return months;
};

const formatCurrency = (value) => `Rs. ${Number(value || 0).toLocaleString('en-IN')}`;
const formatSignedCurrency = (value) => {
    const numeric = Number(value || 0);
    const sign = numeric > 0 ? '+' : '';
    return `${sign}Rs. ${numeric.toLocaleString('en-IN')}`;
};

const parseKpiMetrics = (value) => {
    if (!value) {
        return { reach: 0, impressions: 0, engagement: 0, signups: 0 };
    }

    let payload = value;
    if (typeof value === 'string') {
        try {
            payload = JSON.parse(value);
        } catch {
            payload = {};
        }
    }

    return {
        reach: Number(payload?.reach || 0),
        impressions: Number(payload?.impressions || 0),
        engagement: Number(payload?.engagement || 0),
        signups: Number(payload?.signups || 0),
    };
};

const Reports = ({ user }) => {
    const isAdmin = ['Admin', 'Super Admin'].includes(user?.role);
    const canExportReports = hasPermission(user, 'Reports/Analytics', 'Export');

    const [dateRange, setDateRange] = useState({ start: '2026-01-01', end: '2026-04-30' });
    const [exportFormat, setExportFormat] = useState('csv');
    const [activeKpi, setActiveKpi] = useState('all');
    const [sponsorDirectory, setSponsorDirectory] = useState([]);
    const [sponsorDirectoryError, setSponsorDirectoryError] = useState('');
    const [selectedSponsorEmail, setSelectedSponsorEmail] = useState('');
    const [kpiForm, setKpiForm] = useState({
        title: 'Sponsor KPI Update',
        type: 'screenshot',
        proofDate: new Date().toISOString().slice(0, 10),
        reach: '',
        impressions: '',
        engagement: '',
        signups: '',
        proofUrl: '',
        notes: '',
    });
    const [kpiSnapshot, setKpiSnapshot] = useState(null);
    const [kpiEntries, setKpiEntries] = useState([]);
    const [kpiSaveMessage, setKpiSaveMessage] = useState('');
    const [kpiSaveError, setKpiSaveError] = useState('');
    const [isSavingKpi, setIsSavingKpi] = useState(false);
    const [isKpiEntriesLoading, setIsKpiEntriesLoading] = useState(false);
    const [deletingEntryId, setDeletingEntryId] = useState('');
    const [reportData, setReportData] = useState({
        monthlyBudget: [],
        categoryBreakdown: [],
        departmentReqs: [],
        txCount: 0,
        avgMonthlySpend: 0,
        highestSpendMonth: 'N/A',
        sponsorCount: 0,
        completedTasks: 0,
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let active = true;

        const loadReports = async () => {
            setIsLoading(true);

            const [budgetResult, expendituresResult, sponsorsResult, tasksResult] = await Promise.all([
                budgetHelpers.getRequests(),
                expenditureHelpers.getExpenditures({ startDate: dateRange.start, endDate: dateRange.end }),
                sponsorHelpers.getSponsors(),
                taskHelpers.getTasks(),
            ]);

            if (!active) {
                return;
            }

            const requests = budgetResult.data || [];
            const expenditures = expendituresResult.data || [];
            const sponsors = sponsorsResult.data || [];
            const tasks = tasksResult.data || [];

            setSponsorDirectory(sponsors);
            setSponsorDirectoryError(sponsorsResult.error?.message || '');
            if (!selectedSponsorEmail && sponsors.length) {
                setSelectedSponsorEmail(sponsors[0].contact_email || sponsors[0].email || '');
            }

            const monthKeys = buildMonthRange(dateRange.start, dateRange.end);
            const actualByMonth = {};
            const budgetByMonth = {};
            const categoryTotals = {};
            const deptTotals = {};

            expenditures.forEach((entry) => {
                const key = getMonthKey(entry.date);
                actualByMonth[key] = (actualByMonth[key] || 0) + Number(entry.amount || 0);
                const category = entry.category || 'Other';
                categoryTotals[category] = (categoryTotals[category] || 0) + Number(entry.amount || 0);
            });

            requests.forEach((entry) => {
                const key = getMonthKey(entry.created_at || new Date());
                budgetByMonth[key] = (budgetByMonth[key] || 0) + Number(entry.amount || 0);
                const dept = entry.category || entry.vendor || 'General';
                deptTotals[dept] = (deptTotals[dept] || 0) + Number(entry.amount || 0);
            });

            const monthlyBudget = monthKeys.map((key) => ({
                name: monthLabel(key),
                actual: actualByMonth[key] || 0,
                budgeted: budgetByMonth[key] || 0,
            }));

            const categoryBreakdown = Object.entries(categoryTotals)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 6)
                .map(([name, value], index) => ({
                    name,
                    value,
                    color: ['var(--accent-gold)', 'var(--success)', 'var(--info)', 'var(--warning)', 'var(--danger)', 'var(--accent-blue)'][index % 6],
                }));

            const departmentReqs = Object.entries(deptTotals)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 6)
                .map(([name, value], index) => ({
                    name,
                    value,
                    color: ['var(--accent-gold)', 'var(--success)', 'var(--info)', 'var(--warning)', 'var(--danger)', 'var(--accent-blue)'][index % 6],
                }));

            const highestMonth = monthlyBudget
                .slice()
                .sort((a, b) => b.actual - a.actual)[0];

            const totalActual = monthlyBudget.reduce((sum, item) => sum + item.actual, 0);

            setReportData({
                monthlyBudget,
                categoryBreakdown,
                departmentReqs,
                txCount: expenditures.length,
                avgMonthlySpend: monthKeys.length ? Math.round(totalActual / monthKeys.length) : totalActual,
                highestSpendMonth: highestMonth ? `${highestMonth.name} (Rs. ${highestMonth.actual.toLocaleString('en-IN')})` : 'N/A',
                sponsorCount: sponsors.length,
                completedTasks: tasks.filter((task) => ['completed', 'Completed'].includes(task.status)).length,
            });
            setIsLoading(false);
        };

        loadReports();
        return () => {
            active = false;
        };
    }, [dateRange.end, dateRange.start, selectedSponsorEmail]);

    useEffect(() => {
        let active = true;

        const loadKpiSnapshot = async () => {
            if (!selectedSponsorEmail) {
                if (active) {
                    setKpiSnapshot(null);
                }
                return;
            }

            const result = await sponsorPortalHelpers.getSponsorKpiSnapshotByEmail(selectedSponsorEmail);
            if (active) {
                if (result?.error) {
                    setKpiSnapshot(null);
                } else {
                    setKpiSnapshot(result.data);
                }
            }
        };

        loadKpiSnapshot();

        return () => {
            active = false;
        };
    }, [selectedSponsorEmail]);

    const monthlyBudget = reportData.monthlyBudget;
    const categoryBreakdown = reportData.categoryBreakdown;
    const departmentReqs = reportData.departmentReqs;
    const canCreateKpi = hasPermission(user, 'Reports/Analytics', 'Create');
    const canDeleteKpi = hasPermission(user, 'Reports/Analytics', 'Delete');

    const loadKpiEntries = async () => {
        if (!selectedSponsorEmail) {
            setKpiEntries([]);
            return;
        }

        setIsKpiEntriesLoading(true);
        const entriesResult = await sponsorPortalHelpers.getProofMetricEntriesByEmail(selectedSponsorEmail, 25);
        if (!entriesResult?.error) {
            setKpiEntries(entriesResult.data || []);
        } else {
            setKpiEntries([]);
        }
        setIsKpiEntriesLoading(false);
    };

    useEffect(() => {
        loadKpiEntries();
    }, [selectedSponsorEmail]);

    const reportPayload = useMemo(() => ({
        dateRange,
        totals: {
            budgeted: monthlyBudget.reduce((sum, m) => sum + m.budgeted, 0),
            actual: monthlyBudget.reduce((sum, m) => sum + m.actual, 0),
        },
        monthlyBudget,
        categoryBreakdown,
        departmentReqs,
    }), [categoryBreakdown, dateRange, departmentReqs, monthlyBudget]);

    const handleExport = async () => {
        if (!canExportReports) {
            return;
        }
        if (exportFormat === 'pdf') {
            const { jsPDF } = await import('jspdf');
            const doc = new jsPDF({ unit: 'pt', format: 'a4' });
            const left = 48;
            const right = 547;
            const bottom = 780;
            let y = 56;
            const generatedAt = new Date().toLocaleString('en-US');

            const ensureSpace = (needed = 24) => {
                if (y + needed <= bottom) {
                    return;
                }
                doc.addPage();
                y = 56;
            };

            const writeLine = (text, size = 11, weight = 'normal', spacing = 18) => {
                ensureSpace(spacing + 8);
                doc.setFont('helvetica', weight);
                doc.setFontSize(size);
                doc.text(String(text), left, y);
                y += spacing;
            };

            const drawTable = (title, columns, rows) => {
                writeLine(title, 13, 'bold', 20);

                const headerHeight = 22;
                const rowHeight = 20;
                ensureSpace(headerHeight + rowHeight + 8);

                doc.setFillColor(238, 238, 238);
                doc.rect(left, y - 14, right - left, headerHeight, 'F');

                doc.setFont('helvetica', 'bold');
                doc.setFontSize(10);
                columns.forEach((column) => {
                    doc.text(column.label, column.x, y);
                });
                y += rowHeight;

                doc.setFont('helvetica', 'normal');
                doc.setFontSize(10);
                rows.forEach((row, index) => {
                    ensureSpace(rowHeight + 8);
                    if (index % 2 === 0) {
                        doc.setFillColor(250, 250, 250);
                        doc.rect(left, y - 12, right - left, rowHeight, 'F');
                    }

                    columns.forEach((column) => {
                        const value = String(row[column.key] ?? '');
                        const text = value.length > 38 ? `${value.slice(0, 35)}...` : value;
                        doc.text(text, column.x, y);
                    });

                    y += rowHeight;
                });

                y += 8;
            };

            writeLine('Jinnah League Portal Report', 18, 'bold', 26);
            writeLine(`Range: ${dateRange.start} to ${dateRange.end}`, 11, 'normal', 18);
            writeLine(`Generated: ${generatedAt}`, 10, 'normal', 24);

            drawTable('Summary', [
                { label: 'Metric', key: 'metric', x: left + 10 },
                { label: 'Value', key: 'value', x: left + 260 },
            ], [
                { metric: 'Total Budgeted', value: formatCurrency(reportPayload.totals.budgeted) },
                { metric: 'Total Actual', value: formatCurrency(reportPayload.totals.actual) },
                { metric: 'Variance', value: formatCurrency(reportPayload.totals.budgeted - reportPayload.totals.actual) },
            ]);

            drawTable('Monthly Breakdown', [
                { label: 'Month', key: 'month', x: left + 10 },
                { label: 'Budgeted', key: 'budgeted', x: left + 180 },
                { label: 'Actual', key: 'actual', x: left + 350 },
            ], reportPayload.monthlyBudget.map((row) => ({
                month: row.name,
                budgeted: formatCurrency(row.budgeted),
                actual: formatCurrency(row.actual),
            })));

            drawTable('Category Breakdown', [
                { label: 'Category', key: 'category', x: left + 10 },
                { label: 'Amount', key: 'amount', x: left + 350 },
            ], reportPayload.categoryBreakdown.map((row) => ({
                category: row.name,
                amount: formatCurrency(row.value),
            })));

            drawTable('Department Requirements', [
                { label: 'Department', key: 'department', x: left + 10 },
                { label: 'Amount', key: 'amount', x: left + 350 },
            ], reportPayload.departmentReqs.map((row) => ({
                department: row.name,
                amount: formatCurrency(row.value),
            })));

            const pageCount = doc.getNumberOfPages();
            for (let page = 1; page <= pageCount; page += 1) {
                doc.setPage(page);
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(9);
                doc.setTextColor(120, 120, 120);
                doc.text(`Generated: ${generatedAt}`, left, 822);
                doc.text(`Page ${page} of ${pageCount}`, right, 822, { align: 'right' });
            }

            doc.setTextColor(0, 0, 0);

            doc.save(`portal-report-${dateRange.start}-to-${dateRange.end}.pdf`);
            return;
        }

        let content = '';
        let fileName = `portal-report-${dateRange.start}-to-${dateRange.end}.${exportFormat}`;
        let mimeType = 'text/plain;charset=utf-8';

        if (exportFormat === 'json') {
            content = JSON.stringify(reportPayload, null, 2);
            mimeType = 'application/json;charset=utf-8';
        } else {
            const header = 'month,budgeted,actual\n';
            const rows = monthlyBudget.map((item) => `${item.name},${item.budgeted},${item.actual}`).join('\n');
            content = `${header}${rows}`;
            mimeType = 'text/csv;charset=utf-8';
        }

        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = fileName;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        URL.revokeObjectURL(url);
    };

    const handleSaveSponsorKpi = async () => {
        setKpiSaveMessage('');
        setKpiSaveError('');

        if (!selectedSponsorEmail) {
            setKpiSaveError('Select a sponsor before saving KPI data.');
            return;
        }

        const hasAnyMetric = [kpiForm.reach, kpiForm.impressions, kpiForm.engagement, kpiForm.signups]
            .some((value) => String(value || '').trim().length > 0);

        if (!hasAnyMetric) {
            setKpiSaveError('Enter at least one KPI metric value.');
            return;
        }

        setIsSavingKpi(true);
        const saveResult = await sponsorPortalHelpers.createProofMetricByEmail(selectedSponsorEmail, {
            title: kpiForm.title,
            type: kpiForm.type,
            proofDate: kpiForm.proofDate,
            reach: kpiForm.reach,
            impressions: kpiForm.impressions,
            engagement: kpiForm.engagement,
            signups: kpiForm.signups,
            proofUrl: kpiForm.proofUrl,
            notes: kpiForm.notes,
        });

        if (saveResult?.error) {
            setKpiSaveError(saveResult.error.message || 'Unable to save KPI entry.');
            setIsSavingKpi(false);
            return;
        }

        const snapshotResult = await sponsorPortalHelpers.getSponsorKpiSnapshotByEmail(selectedSponsorEmail);
        if (!snapshotResult?.error) {
            setKpiSnapshot(snapshotResult.data);
        }
        await loadKpiEntries();

        setKpiSaveMessage('KPI entry saved to proof_of_execution and dashboard snapshot updated.');
        setKpiForm((prev) => ({
            ...prev,
            reach: '',
            impressions: '',
            engagement: '',
            signups: '',
            proofUrl: '',
            notes: '',
        }));
        setIsSavingKpi(false);
    };

    const handleDeleteKpiEntry = async (entryId) => {
        if (!entryId) {
            return;
        }

        setKpiSaveMessage('');
        setKpiSaveError('');
        setDeletingEntryId(entryId);

        const deleteResult = await sponsorPortalHelpers.deleteProofMetricEntry(entryId);
        if (deleteResult?.error) {
            setKpiSaveError(deleteResult.error.message || 'Unable to delete KPI entry.');
            setDeletingEntryId('');
            return;
        }

        await loadKpiEntries();

        const snapshotResult = await sponsorPortalHelpers.getSponsorKpiSnapshotByEmail(selectedSponsorEmail);
        if (!snapshotResult?.error) {
            setKpiSnapshot(snapshotResult.data);
        }

        setKpiSaveMessage('KPI entry deleted successfully.');
        setDeletingEntryId('');
    };

    const totalBudgeted = monthlyBudget.reduce((sum, m) => sum + m.budgeted, 0);
    const totalActual = monthlyBudget.reduce((sum, m) => sum + m.actual, 0);
    const variance = totalBudgeted - totalActual;
    const isUnderBudget = variance > 0;
    const isOverBudget = variance < 0;
    const utilizationPct = totalBudgeted > 0 ? ((totalActual / totalBudgeted) * 100).toFixed(1) : '0.0';
    const kpiCards = [
        {
            key: 'budgeted',
            label: 'Total Budgeted',
            value: `Rs. ${totalBudgeted.toLocaleString('en-IN')}`,
            icon: 'BD',
            color: 'var(--info)',
            tone: 'rgba(59,130,246,0.12)',
            border: 'rgba(59,130,246,0.28)',
            note: 'Planned allocation for this range',
        },
        {
            key: 'spent',
            label: 'Total Spent',
            value: `Rs. ${totalActual.toLocaleString('en-IN')}`,
            icon: 'SP',
            color: 'var(--danger)',
            tone: 'rgba(239,68,68,0.12)',
            border: 'rgba(239,68,68,0.28)',
            note: 'Actual expenditures posted',
        },
        {
            key: 'variance',
            label: 'Variance',
            value: formatSignedCurrency(variance),
            icon: isUnderBudget ? 'OK' : isOverBudget ? 'OV' : 'EQ',
            color: isUnderBudget ? 'var(--success)' : isOverBudget ? 'var(--danger)' : 'var(--text-primary)',
            tone: isUnderBudget ? 'rgba(34,197,94,0.12)' : isOverBudget ? 'rgba(239,68,68,0.12)' : 'rgba(148,163,184,0.12)',
            border: isUnderBudget ? 'rgba(34,197,94,0.28)' : isOverBudget ? 'rgba(239,68,68,0.28)' : 'rgba(148,163,184,0.28)',
            note: isUnderBudget ? 'Under planned budget' : isOverBudget ? 'Over planned budget' : 'On planned budget',
        },
        {
            key: 'utilization',
            label: 'Utilization',
            value: `${utilizationPct}%`,
            icon: 'UT',
            color: 'var(--accent-gold)',
            tone: 'rgba(201,168,76,0.14)',
            border: 'rgba(201,168,76,0.3)',
            note: 'Spent versus budgeted',
        },
    ];

    const primaryBarConfig = useMemo(() => {
        if (activeKpi === 'budgeted') {
            return {
                title: 'Monthly Budget Plan',
                data: monthlyBudget.map((m) => ({ name: m.name, value: m.budgeted, color: 'var(--info)' })),
                valueFormatter: (value) => `Rs. ${(value / 1000).toFixed(0)}k`,
            };
        }

        if (activeKpi === 'variance') {
            return {
                title: 'Monthly Variance (Budget - Actual)',
                data: monthlyBudget.map((m) => {
                    const signedVariance = m.budgeted - m.actual;
                    return {
                        name: m.name,
                        value: Math.abs(signedVariance),
                        signedValue: signedVariance,
                        color: signedVariance > 0 ? 'var(--success)' : signedVariance < 0 ? 'var(--danger)' : 'var(--text-muted)',
                    };
                }),
                valueFormatter: (_value, item) => formatSignedCurrency(item?.signedValue || 0),
            };
        }

        if (activeKpi === 'utilization') {
            return {
                title: 'Monthly Utilization Rate',
                data: monthlyBudget.map((m) => {
                    const pct = m.budgeted > 0 ? (m.actual / m.budgeted) * 100 : 0;
                    return {
                        name: m.name,
                        value: Number(pct.toFixed(1)),
                        color: pct > 100 ? 'var(--danger)' : pct > 85 ? 'var(--warning)' : 'var(--success)',
                    };
                }),
                valueFormatter: (value) => `${value.toFixed(1)}%`,
            };
        }

        return {
            title: 'Monthly Spending Trend',
            data: monthlyBudget.map((m) => ({ name: m.name, value: m.actual, color: 'var(--danger)' })),
            valueFormatter: (value) => `Rs. ${(value / 1000).toFixed(0)}k`,
        };
    }, [activeKpi, monthlyBudget]);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <SectionLabel text="Intelligence" />
                    <h2 className="mt-2">Financial Reports</h2>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '8px', maxWidth: '720px' }}>
                        Real-time spending analytics and budgetary insights. Track actual expenses against planned budget allocations.
                    </p>
                </div>
                {isAdmin && canExportReports && <button onClick={handleExport} style={{ padding: '10px 16px', background: 'var(--accent-gold)', color: 'black', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
                    📋 Generate Report
                </button>}
                {isAdmin && !canExportReports && (
                    <DisabledPermissionButton title="Missing permission: Reports/Analytics → Export" style={{ padding: '10px 16px' }}>
                        📋 Generate Report
                    </DisabledPermissionButton>
                )}
            </div>

            {isAdmin && !canExportReports && (
                <PermissionReadOnlyNote style={{ marginTop: '-18px' }}>
                    Report exports are disabled for your role. Ask an admin for Reports/Analytics Export permission.
                </PermissionReadOnlyNote>
            )}

            {/* Date Range Filter */}
            <Card style={{ padding: '20px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div>
                        <label className="label" style={{ marginBottom: '4px', display: 'block', fontSize: '0.8rem' }}>From</label>
                        <input type="date" value={dateRange.start} onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })} style={{ padding: '8px 12px', background: 'var(--border)', border: 'none', borderRadius: '4px', fontSize: '0.9rem' }} />
                    </div>
                    <div>
                        <label className="label" style={{ marginBottom: '4px', display: 'block', fontSize: '0.8rem' }}>To</label>
                        <input type="date" value={dateRange.end} onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })} style={{ padding: '8px 12px', background: 'var(--border)', border: 'none', borderRadius: '4px', fontSize: '0.9rem' }} />
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                    <select value={exportFormat} onChange={(e) => setExportFormat(e.target.value)} style={{ padding: '8px 12px', background: 'var(--border)', border: 'none', borderRadius: '4px' }}>
                        <option value="csv">CSV</option>
                        <option value="pdf">PDF</option>
                        <option value="json">JSON</option>
                    </select>
                    <button onClick={handleExport} disabled={!canExportReports} style={{ padding: '8px 16px', background: canExportReports ? 'var(--success)' : 'var(--border)', color: canExportReports ? 'white' : 'var(--text-secondary)', border: 'none', borderRadius: '4px', cursor: canExportReports ? 'pointer' : 'not-allowed', fontWeight: '600' }}>
                        ⬇️ Export
                    </button>
                </div>
            </Card>

            {/* Key Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
                {kpiCards.map((metric) => (
                    <Card
                        key={metric.label}
                        style={{
                            padding: '18px',
                            position: 'relative',
                            overflow: 'hidden',
                            background: `linear-gradient(180deg, ${metric.tone}, rgba(255,255,255,0.02) 88%)`,
                            border: `1px solid ${metric.border}`,
                            minHeight: '150px',
                            cursor: 'pointer',
                            boxShadow: activeKpi === metric.key ? `0 0 0 1px ${metric.border}, 0 14px 28px rgba(0,0,0,0.2)` : 'none',
                            transform: activeKpi === metric.key ? 'translateY(-2px)' : 'translateY(0)',
                            transition: 'all 0.2s ease',
                        }}
                        onClick={() => setActiveKpi((prev) => (prev === metric.key ? 'all' : metric.key))}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                            <div
                                style={{
                                    width: '34px',
                                    height: '34px',
                                    borderRadius: '10px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: 'rgba(0,0,0,0.18)',
                                    border: `1px solid ${metric.border}`,
                                    color: metric.color,
                                    fontSize: '0.68rem',
                                    fontWeight: 700,
                                    letterSpacing: '0.04em',
                                }}
                            >
                                {metric.icon}
                            </div>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Live</span>
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '8px', fontWeight: '600', letterSpacing: '0.03em' }}>{metric.label}</div>
                        <div style={{ fontSize: '1.35rem', fontWeight: '700', color: metric.color, lineHeight: 1.15 }}>{metric.value}</div>
                        <div style={{ marginTop: '12px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{metric.note}</div>
                    </Card>
                ))}
            </div>

            <p style={{ color: 'var(--text-secondary)', marginTop: '-18px', marginBottom: '24px', fontSize: '0.82rem' }}>
                Click a KPI card to focus the top chart; click again to reset.
            </p>

            {/* Charts Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                <SimpleBarChart data={primaryBarConfig.data} title={primaryBarConfig.title} valueFormatter={primaryBarConfig.valueFormatter} />
                <SimplePieChart data={categoryBreakdown} title="Budget by Category" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                <SimpleBarChart data={departmentReqs.map((d) => ({ name: d.name.substring(0, 3), value: d.value, color: d.color }))} title="Department Requirements" />
                <Card style={{ padding: '24px' }}>
                    <h4 className="mb-4">Budget vs Actual</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {monthlyBudget.map((month) => {
                            const budgetPercentage = (month.budgeted / totalBudgeted) * 100;
                            const actualPercentage = (month.actual / totalBudgeted) * 100;
                            return (
                                <div key={month.name}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                        <span style={{ fontWeight: '600' }}>{month.name}</span>
                                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                            Budget: Rs. {month.budgeted.toLocaleString('en-IN')} | Actual: Rs. {month.actual.toLocaleString('en-IN')}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', height: '20px', gap: '2px' }}>
                                        <div style={{ width: `${budgetPercentage}%`, background: 'var(--border)', borderRadius: '3px 0 0 3px' }}></div>
                                        <div style={{ width: `${actualPercentage}%`, background: 'var(--accent-gold)', borderRadius: '0 3px 3px 0' }}></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)', display: 'flex', gap: '16px', fontSize: '0.85rem' }}>
                        <div><span style={{ display: 'inline-block', width: '12px', height: '12px', background: 'var(--border)', borderRadius: '3px', marginRight: '6px' }}></span>Budgeted</div>
                        <div><span style={{ display: 'inline-block', width: '12px', height: '12px', background: 'var(--accent-gold)', borderRadius: '3px', marginRight: '6px' }}></span>Actual</div>
                    </div>
                </Card>
            </div>

            {/* Summary Stats */}
            <Card style={{ padding: '24px', marginBottom: '24px' }}>
                <h4 style={{ marginBottom: '20px', marginTop: 0 }}>Summary Statistics</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '28px' }}>
                    <div>
                        <div className="label" style={{ color: 'var(--text-secondary)', marginBottom: '14px', fontSize: '0.8rem', fontWeight: '600' }}>Period Overview</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {[
                                { label: 'Reporting Period', value: `${dateRange.start} to ${dateRange.end}` },
                                { label: 'Total Transactions', value: reportData.txCount.toLocaleString('en-IN') },
                                { label: 'Average Monthly Spend', value: `Rs. ${Math.round(reportData.avgMonthlySpend || 0).toLocaleString('en-IN')}` },
                                { label: 'Highest Spend Month', value: reportData.highestSpendMonth },
                            ].map((stat) => (
                                <div key={stat.label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{stat.label}</span>
                                    <span style={{ fontWeight: '600' }}>{stat.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <div className="label" style={{ color: 'var(--text-secondary)', marginBottom: '14px', fontSize: '0.8rem', fontWeight: '600' }}>Department Metrics</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {[
                                { dept: 'Sponsors', pct: reportData.sponsorCount, trend: reportData.sponsorCount > 0 ? '↑' : '→' },
                                { dept: 'Completed Tasks', pct: reportData.completedTasks, trend: reportData.completedTasks > 0 ? '↑' : '→' },
                                { dept: 'Budget Lines', pct: monthlyBudget.length, trend: monthlyBudget.length > 0 ? '↑' : '→' },
                                { dept: 'Top Categories', pct: categoryBreakdown.length, trend: categoryBreakdown.length > 0 ? '↑' : '→' },
                            ].map((d) => (
                                <div key={d.dept} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{d.dept}</span>
                                    <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>
                                        {d.pct}% <span style={{ marginLeft: '6px', color: d.trend === '↑' ? 'var(--success)' : d.trend === '↓' ? 'var(--danger)' : 'var(--text-secondary)' }}>{d.trend}</span>
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </Card>

            {/* Footer Note */}
            <Card style={{ padding: '16px', marginTop: '24px', background: 'var(--info)20', borderLeft: '4px solid var(--info)' }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    💡 <strong>Tip:</strong> Reports update in real-time when expenses are logged. Use the date range filter to compare periods or drill into specific months for detailed analysis.
                </div>
            </Card>

            <Card style={{ padding: '24px', marginTop: '24px' }}>
                <h4 style={{ marginTop: 0, marginBottom: '10px' }}>Sponsor KPI Manager</h4>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '18px' }}>
                    Save proof metrics from admin portal to drive sponsor dashboard KPIs with real data.
                </p>

                {!canCreateKpi && (
                    <PermissionReadOnlyNote style={{ marginBottom: '14px' }}>
                        KPI write access is disabled for your role. Ask an admin for Reports/Analytics Create permission.
                    </PermissionReadOnlyNote>
                )}

                {sponsorDirectoryError && (
                    <PermissionReadOnlyNote style={{ marginBottom: '14px' }}>
                        Unable to load sponsors for KPI manager: {sponsorDirectoryError}
                    </PermissionReadOnlyNote>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ gridColumn: 'span 2' }}>
                        <label className="label" style={{ display: 'block', marginBottom: '6px', color: 'var(--text-secondary)' }}>Sponsor</label>
                        <select
                            value={selectedSponsorEmail}
                            onChange={(e) => setSelectedSponsorEmail(e.target.value)}
                            style={{ width: '100%' }}
                        >
                            <option value="">Select sponsor</option>
                            {sponsorDirectory.map((sponsorRow) => {
                                const email = sponsorRow.contact_email || sponsorRow.email;
                                const company = sponsorRow.company_name || sponsorRow.name || 'Sponsor';
                                return <option key={email} value={email}>{company} ({email})</option>;
                            })}
                        </select>
                    </div>
                    <div>
                        <label className="label" style={{ display: 'block', marginBottom: '6px', color: 'var(--text-secondary)' }}>Proof Type</label>
                        <select
                            value={kpiForm.type}
                            onChange={(e) => setKpiForm((prev) => ({ ...prev, type: e.target.value }))}
                            style={{ width: '100%' }}
                        >
                            <option value="photo">Photo</option>
                            <option value="video">Video</option>
                            <option value="screenshot">Screenshot</option>
                            <option value="link">Link</option>
                        </select>
                    </div>
                    <div>
                        <label className="label" style={{ display: 'block', marginBottom: '6px', color: 'var(--text-secondary)' }}>Proof Date</label>
                        <input
                            type="date"
                            value={kpiForm.proofDate}
                            onChange={(e) => setKpiForm((prev) => ({ ...prev, proofDate: e.target.value }))}
                            style={{ width: '100%' }}
                        />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '12px', marginBottom: '12px' }}>
                    <div>
                        <label className="label" style={{ display: 'block', marginBottom: '6px', color: 'var(--text-secondary)' }}>Reach</label>
                        <input type="number" min="0" value={kpiForm.reach} onChange={(e) => setKpiForm((prev) => ({ ...prev, reach: e.target.value }))} style={{ width: '100%' }} />
                    </div>
                    <div>
                        <label className="label" style={{ display: 'block', marginBottom: '6px', color: 'var(--text-secondary)' }}>Impressions</label>
                        <input type="number" min="0" value={kpiForm.impressions} onChange={(e) => setKpiForm((prev) => ({ ...prev, impressions: e.target.value }))} style={{ width: '100%' }} />
                    </div>
                    <div>
                        <label className="label" style={{ display: 'block', marginBottom: '6px', color: 'var(--text-secondary)' }}>Engagement</label>
                        <input type="number" min="0" value={kpiForm.engagement} onChange={(e) => setKpiForm((prev) => ({ ...prev, engagement: e.target.value }))} style={{ width: '100%' }} />
                    </div>
                    <div>
                        <label className="label" style={{ display: 'block', marginBottom: '6px', color: 'var(--text-secondary)' }}>Signups</label>
                        <input type="number" min="0" value={kpiForm.signups} onChange={(e) => setKpiForm((prev) => ({ ...prev, signups: e.target.value }))} style={{ width: '100%' }} />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px', marginBottom: '12px' }}>
                    <div>
                        <label className="label" style={{ display: 'block', marginBottom: '6px', color: 'var(--text-secondary)' }}>Entry Title</label>
                        <input
                            type="text"
                            value={kpiForm.title}
                            onChange={(e) => setKpiForm((prev) => ({ ...prev, title: e.target.value }))}
                            style={{ width: '100%' }}
                        />
                    </div>
                    <div>
                        <label className="label" style={{ display: 'block', marginBottom: '6px', color: 'var(--text-secondary)' }}>Proof URL (optional)</label>
                        <input
                            type="text"
                            value={kpiForm.proofUrl}
                            onChange={(e) => setKpiForm((prev) => ({ ...prev, proofUrl: e.target.value }))}
                            style={{ width: '100%' }}
                        />
                    </div>
                </div>

                <div style={{ marginBottom: '14px' }}>
                    <label className="label" style={{ display: 'block', marginBottom: '6px', color: 'var(--text-secondary)' }}>Notes (optional)</label>
                    <textarea
                        value={kpiForm.notes}
                        onChange={(e) => setKpiForm((prev) => ({ ...prev, notes: e.target.value }))}
                        rows={3}
                        style={{ width: '100%' }}
                    />
                </div>

                {kpiSaveError && (
                    <div style={{ marginBottom: '12px', padding: '10px 12px', border: '1px solid rgba(239,68,68,0.35)', background: 'rgba(239,68,68,0.1)', color: 'var(--danger)' }}>
                        {kpiSaveError}
                    </div>
                )}
                {kpiSaveMessage && (
                    <div style={{ marginBottom: '12px', padding: '10px 12px', border: '1px solid rgba(34,197,94,0.35)', background: 'rgba(34,197,94,0.1)', color: 'var(--success)' }}>
                        {kpiSaveMessage}
                    </div>
                )}

                {canCreateKpi ? (
                    <Button onClick={handleSaveSponsorKpi} disabled={isSavingKpi || !selectedSponsorEmail}>
                        {isSavingKpi ? 'Saving KPI Entry...' : 'Save KPI Entry'}
                    </Button>
                ) : (
                    <DisabledPermissionButton title="Missing permission: Reports/Analytics → Create">
                        Save KPI Entry
                    </DisabledPermissionButton>
                )}

                {kpiSnapshot && (
                    <div style={{ marginTop: '18px', paddingTop: '14px', borderTop: '1px solid var(--border)' }}>
                        <div className="label" style={{ color: 'var(--text-secondary)', marginBottom: '10px' }}>Live Sponsor KPI Snapshot</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '10px' }}>
                            <div style={{ padding: '10px', border: '1px solid var(--border)' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Reach</div>
                                <div className="data-figure" style={{ color: 'var(--accent-gold)' }}>{Number(kpiSnapshot.roiMetrics.reach || 0).toLocaleString('en-US')}</div>
                            </div>
                            <div style={{ padding: '10px', border: '1px solid var(--border)' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Impressions</div>
                                <div className="data-figure" style={{ color: 'var(--success)' }}>{Number(kpiSnapshot.roiMetrics.impressions || 0).toLocaleString('en-US')}</div>
                            </div>
                            <div style={{ padding: '10px', border: '1px solid var(--border)' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Engagement</div>
                                <div className="data-figure">{Number(kpiSnapshot.roiMetrics.engagement || 0).toLocaleString('en-US')}</div>
                            </div>
                            <div style={{ padding: '10px', border: '1px solid var(--border)' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Signups</div>
                                <div className="data-figure" style={{ color: 'var(--info)' }}>{Number(kpiSnapshot.roiMetrics.signups || 0).toLocaleString('en-US')}</div>
                            </div>
                        </div>
                    </div>
                )}

                <div style={{ marginTop: '18px', paddingTop: '14px', borderTop: '1px solid var(--border)' }}>
                    <div className="label" style={{ color: 'var(--text-secondary)', marginBottom: '10px' }}>Recent KPI Entries</div>

                    {isKpiEntriesLoading && <p style={{ color: 'var(--text-secondary)' }}>Loading KPI entries...</p>}

                    {!isKpiEntriesLoading && !kpiEntries.length && (
                        <p style={{ color: 'var(--text-secondary)' }}>No KPI entries found for the selected sponsor.</p>
                    )}

                    {!isKpiEntriesLoading && kpiEntries.length > 0 && (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                        <th style={{ textAlign: 'left', padding: '10px', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>Date</th>
                                        <th style={{ textAlign: 'left', padding: '10px', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>Title</th>
                                        <th style={{ textAlign: 'left', padding: '10px', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>Type</th>
                                        <th style={{ textAlign: 'right', padding: '10px', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>Reach</th>
                                        <th style={{ textAlign: 'right', padding: '10px', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>Impr.</th>
                                        <th style={{ textAlign: 'right', padding: '10px', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>Eng.</th>
                                        <th style={{ textAlign: 'right', padding: '10px', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>Signups</th>
                                        <th style={{ textAlign: 'center', padding: '10px', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {kpiEntries.map((entry) => {
                                        const metrics = parseKpiMetrics(entry.reach_metrics);
                                        return (
                                            <tr key={entry.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                                <td style={{ padding: '10px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                                    {entry.proof_date ? new Date(entry.proof_date).toLocaleDateString('en-US') : '-'}
                                                </td>
                                                <td style={{ padding: '10px', fontSize: '0.85rem' }}>{entry.title || 'KPI Entry'}</td>
                                                <td style={{ padding: '10px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{entry.type || 'screenshot'}</td>
                                                <td style={{ padding: '10px', textAlign: 'right', fontSize: '0.85rem' }}>{Number(metrics.reach || 0).toLocaleString('en-US')}</td>
                                                <td style={{ padding: '10px', textAlign: 'right', fontSize: '0.85rem' }}>{Number(metrics.impressions || 0).toLocaleString('en-US')}</td>
                                                <td style={{ padding: '10px', textAlign: 'right', fontSize: '0.85rem' }}>{Number(metrics.engagement || 0).toLocaleString('en-US')}</td>
                                                <td style={{ padding: '10px', textAlign: 'right', fontSize: '0.85rem' }}>{Number(metrics.signups || 0).toLocaleString('en-US')}</td>
                                                <td style={{ padding: '10px', textAlign: 'center' }}>
                                                    {canDeleteKpi ? (
                                                        <button
                                                            onClick={() => handleDeleteKpiEntry(entry.id)}
                                                            disabled={deletingEntryId === entry.id}
                                                            style={{
                                                                padding: '6px 10px',
                                                                border: '1px solid rgba(239,68,68,0.45)',
                                                                background: 'rgba(239,68,68,0.12)',
                                                                color: 'var(--danger)',
                                                                cursor: deletingEntryId === entry.id ? 'not-allowed' : 'pointer',
                                                            }}
                                                        >
                                                            {deletingEntryId === entry.id ? 'Deleting...' : 'Delete'}
                                                        </button>
                                                    ) : (
                                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No delete permission</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </Card>
            {isLoading && <p style={{ color: 'var(--text-secondary)', marginTop: '12px' }}>Loading live report data...</p>}
        </div>
    );
};

export default Reports;
