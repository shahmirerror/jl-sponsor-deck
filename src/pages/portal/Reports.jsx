import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Card from '../../components/Card';
import SectionLabel from '../../components/SectionLabel';
import Button from '../../components/Button';

const chartData = [
    { name: 'Nov', spend: 4000 },
    { name: 'Dec', spend: 12000 },
    { name: 'Jan', spend: 35000 },
    { name: 'Feb', spend: 85400 },
];

const Reports = () => {
    const handleExport = () => {
        alert("Downloading CSV report...");
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <SectionLabel text="Analytics" />
                    <h2 className="mt-2">Reports & Exports</h2>
                </div>
                <Button variant="outline" onClick={handleExport}>Download CSV</Button>
            </div>

            <Card className="mb-8" style={{ marginBottom: '32px' }}>
                <h4 className="mb-8" style={{ marginBottom: '32px' }}>Monthly Spend Velocity</h4>
                <div style={{ width: '100%', height: 400 }}>
                    <ResponsiveContainer>
                        <BarChart data={chartData}>
                            <XAxis dataKey="name" stroke="var(--text-muted)" fontFamily="DM Sans" />
                            <YAxis stroke="var(--text-muted)" fontFamily="JetBrains Mono" tickFormatter={(val) => `$${val / 1000}k`} />
                            <Tooltip
                                cursor={{ fill: 'var(--bg-secondary)' }}
                                contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
                                itemStyle={{ color: 'var(--accent-gold)', fontFamily: 'JetBrains Mono' }}
                            />
                            <Bar dataKey="spend" fill="var(--accent-gold)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '32px' }}>
                <Card>
                    <h4 className="mb-4">Generate Custom Report</h4>
                    <p className="mb-8" style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Select timeframe and parameters to generate a detailed PDF syllabus mapping sponsorship outcomes to exact expenditures.</p>
                    <Button>Generate PDF</Button>
                </Card>
                <Card>
                    <h4 className="mb-4">Compliance & Audit</h4>
                    <p className="mb-8" style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Download fully sanitized ledger reports stripped of internal PII for external auditor review.</p>
                    <Button variant="outline">Run Audit Export</Button>
                </Card>
            </div>
        </div>
    );
};

export default Reports;
