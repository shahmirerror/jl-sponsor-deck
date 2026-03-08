import React, { useState } from 'react';
import Card from '../../components/Card';
import SectionLabel from '../../components/SectionLabel';
import Button from '../../components/Button';

const mockSponsors = [
    { id: 1, name: 'AcroCorp', sector: 'Technology Partners', tier: 'Gold', amount: '$15,000', status: 'paid', date: '2026-02-25' },
    { id: 2, name: 'FinTrust', sector: 'Banking & Finance', tier: 'Platinum', amount: '$35,000', status: 'pending', date: '2026-02-26' },
    { id: 3, name: 'DataServe', sector: 'Technology Partners', tier: 'Silver', amount: '$5,000', status: 'overdue', date: '2026-01-15' },
    { id: 4, name: 'BuildRight', sector: 'Property & Real Estate', tier: 'Gold', amount: '$15,000', status: 'paid', date: '2026-02-10' },
];

const SponsorsTable = () => {
    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <SectionLabel text="Directory" />
                    <h2 className="mt-2">Sponsors</h2>
                </div>
                <Button>+ Add Sponsor</Button>
            </div>

            <Card style={{ padding: 0, overflow: 'hidden' }}>
                <div className="portal-table-container">
                    <table className="portal-table">
                        <thead>
                            <tr>
                                <th>Company Name</th>
                                <th>Sector</th>
                                <th>Tier</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Commit Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mockSponsors.map(sponsor => (
                                <tr key={sponsor.id}>
                                    <td style={{ fontWeight: 600 }}>{sponsor.name}</td>
                                    <td style={{ color: 'var(--text-secondary)' }}>{sponsor.sector}</td>
                                    <td>{sponsor.tier}</td>
                                    <td className="data-figure">{sponsor.amount}</td>
                                    <td>
                                        <span className={`status-badge status-${sponsor.status}`}>
                                            {sponsor.status}
                                        </span>
                                    </td>
                                    <td className="data-figure" style={{ fontSize: '0.875rem' }}>{sponsor.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default SponsorsTable;
