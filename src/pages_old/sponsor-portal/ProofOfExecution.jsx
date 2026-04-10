import React, { useEffect, useState } from 'react';
import Card from '../../components/Card';
import SectionLabel from '../../components/SectionLabel';
import { sponsorPortalHelpers } from '../../lib/supabaseHelpers';

const ProofOfExecution = ({ sponsor }) => {
    const [proofItems, setProofItems] = useState([]);
    const [summary, setSummary] = useState({ totalPlacements: 0, combinedReach: 0, mediaCoverage: '0%' });
    const [contentTypes, setContentTypes] = useState({ photo: 0, video: 0, screenshot: 0, link: 0 });
    const [metrics, setMetrics] = useState({ averageReachPerItem: 0, peakEngagement: '0', videoViews: 0, liveAttendeeImpact: '0' });
    const [isLoading, setIsLoading] = useState(true);
    const [syncError, setSyncError] = useState('');

    useEffect(() => {
        let active = true;

        const loadProof = async () => {
            if (!sponsor?.email) {
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            try {
                const liveResult = await sponsorPortalHelpers.getProofByEmail(sponsor.email);
                if (liveResult?.error) {
                    throw liveResult.error;
                }

                if (active) {
                    setProofItems(liveResult.data?.proofItems || []);
                    setSummary(liveResult.data?.summary || { totalPlacements: 0, combinedReach: 0, mediaCoverage: '0%' });
                    setContentTypes(liveResult.data?.contentTypes || { photo: 0, video: 0, screenshot: 0, link: 0 });
                    setMetrics(liveResult.data?.metrics || { averageReachPerItem: 0, peakEngagement: '0', videoViews: 0, liveAttendeeImpact: '0' });
                    setSyncError('');
                }
            } catch (error) {
                if (active) {
                    setProofItems([]);
                    setSummary({ totalPlacements: 0, combinedReach: 0, mediaCoverage: '0%' });
                    setContentTypes({ photo: 0, video: 0, screenshot: 0, link: 0 });
                    setMetrics({ averageReachPerItem: 0, peakEngagement: '0', videoViews: 0, liveAttendeeImpact: '0' });
                    setSyncError(error?.message || 'Unable to load proof-of-execution data from database.');
                }
            } finally {
                if (active) {
                    setIsLoading(false);
                }
            }
        };

        loadProof();

        return () => {
            active = false;
        };
    }, [sponsor?.email]);

    return (
        <div>
            <div style={{ marginBottom: '32px' }}>
                <SectionLabel text="Proof Gallery" />
                <h2 className="mt-2">Proof of Execution (POE)</h2>
                <p style={{ color: 'var(--text-secondary)', marginTop: '8px', maxWidth: '720px' }}>
                    Gallery of where your brand was displayed, featured, and promoted. Photos, social media screenshots, links, and reach metrics.
                </p>
            </div>

            {isLoading && <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>Loading proof gallery...</p>}
            {syncError && <p style={{ color: 'var(--danger)', marginBottom: '16px' }}>{syncError}</p>}

            {/* Summary Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '32px' }}>
                {[
                    { label: 'Total Placements', value: summary.totalPlacements, color: 'var(--accent-gold)' },
                    { label: 'Combined Reach', value: Number(summary.combinedReach || 0).toLocaleString('en-US'), color: 'var(--success)' },
                    { label: 'Media Coverage', value: summary.mediaCoverage, color: 'var(--info)' },
                ].map((stat) => (
                    <Card key={stat.label} style={{ padding: '24px' }}>
                        <div className="label" style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>{stat.label}</div>
                        <div style={{ color: stat.color, fontSize: '2rem', fontWeight: '600' }}>{stat.value}</div>
                    </Card>
                ))}
            </div>

            {/* POE Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
                {proofItems.map((item) => (
                    <Card key={item.id} style={{ overflow: 'hidden' }}>
                        <div style={{
                            background: 'var(--border)',
                            height: '180px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '16px',
                            borderRadius: '6px',
                        }}>
                            <span style={{ fontSize: '3rem' }}>
                                {item.type === 'photo' ? '📸' : item.type === 'video' ? '🎥' : item.type === 'link' ? '🔗' : '📱'}
                            </span>
                        </div>
                        <h5 style={{ marginBottom: '8px' }}>{item.title}</h5>
                        <div style={{ marginBottom: '12px' }}>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '4px' }}>
                                <span style={{ display: 'block', marginBottom: '4px' }}>📅 {item.dateLabel || item.date}</span>
                                <span style={{ display: 'block', color: 'var(--accent-gold)', fontWeight: '500' }}>📊 {item.reachLabel || item.reach}</span>
                            </p>
                        </div>
                        <button style={{
                            width: '100%',
                            padding: '10px',
                            background: 'var(--border)',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            color: 'var(--text-primary)',
                            fontSize: '0.9rem',
                            transition: 'background 0.2s',
                        }} onMouseEnter={(e) => e.target.style.background = 'var(--accent-gold)30'} onMouseLeave={(e) => e.target.style.background = 'var(--border)'}>
                            View {item.type === 'link' ? 'Link' : item.type === 'photo' ? 'Photo' : item.type === 'video' ? 'Video' : 'Screenshot'}
                        </button>
                    </Card>
                ))}
            </div>

            {/* Summary Report */}
            <Card style={{ marginTop: '32px' }}>
                <h4 className="mb-4">Execution Summary</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    <div>
                        <h5 style={{ marginBottom: '12px', color: 'var(--text-secondary)' }}>Content Types</h5>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {[
                                { label: 'Photos', count: contentTypes.photo || 0 },
                                { label: 'Videos', count: contentTypes.video || 0 },
                                { label: 'Screenshots', count: contentTypes.screenshot || 0 },
                                { label: 'Links', count: contentTypes.link || 0 },
                            ].map((item) => (
                                <li key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                                    <span>{item.label}</span>
                                    <span style={{ color: 'var(--accent-gold)', fontWeight: '600' }}>{item.count}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h5 style={{ marginBottom: '12px', color: 'var(--text-secondary)' }}>Key Metrics</h5>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {[
                                { label: 'Average Reach Per Item', value: Number(metrics.averageReachPerItem || 0).toLocaleString('en-US') },
                                { label: 'Peak Engagement', value: metrics.peakEngagement },
                                { label: 'Video Views', value: Number(metrics.videoViews || 0).toLocaleString('en-US') },
                                { label: 'Live Attendee Impact', value: metrics.liveAttendeeImpact },
                            ].map((item) => (
                                <li key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                                    <span>{item.label}</span>
                                    <span style={{ color: 'var(--success)', fontWeight: '600' }}>{item.value}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default ProofOfExecution;
