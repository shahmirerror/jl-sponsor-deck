import React from 'react';
import Card from '../../components/Card';
import SectionLabel from '../../components/SectionLabel';
import Button from '../../components/Button';

const mockLogs = [
    { id: 1, date: '2026-02-24', category: 'Venue', amount: '$15,000', notes: 'Deposit for Main Hall' },
    { id: 2, date: '2026-02-23', category: 'Marketing', amount: '$4,500', notes: 'LinkedIn Ad Campaign' },
    { id: 3, date: '2026-02-20', category: 'Technology', amount: '$2,400', notes: 'Portal Hosting & Services' },
];

const Expenditures = () => {
    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <SectionLabel text="Logbook" />
                    <h2 className="mt-2">Expenditures</h2>
                </div>
                <Button>+ Log Expense</Button>
            </div>

            <Card style={{ padding: 0, overflow: 'hidden' }}>
                <div className="portal-table-container">
                    <table className="portal-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Category</th>
                                <th>Description</th>
                                <th style={{ textAlign: 'right' }}>Amount</th>
                                <th style={{ textAlign: 'center' }}>Receipt</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mockLogs.map(log => (
                                <tr key={log.id}>
                                    <td className="data-figure" style={{ fontSize: '0.875rem' }}>{log.date}</td>
                                    <td style={{ color: 'var(--text-secondary)' }}>{log.category}</td>
                                    <td>{log.notes}</td>
                                    <td className="data-figure" style={{ textAlign: 'right', color: 'var(--danger)' }}>-{log.amount}</td>
                                    <td style={{ textAlign: 'center' }}><a href="#" style={{ color: 'var(--accent-blue)', textDecoration: 'underline' }}>View</a></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default Expenditures;
