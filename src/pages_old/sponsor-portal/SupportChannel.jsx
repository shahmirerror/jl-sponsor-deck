import React, { useEffect, useState } from 'react';
import Card from '../../components/Card';
import SectionLabel from '../../components/SectionLabel';
import { sponsorPortalHelpers } from '../../lib/supabaseHelpers';

const SupportChannel = ({ sponsor }) => {
    const [messages, setMessages] = useState([]);

    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [syncError, setSyncError] = useState('');

    useEffect(() => {
        let active = true;

        const loadMessages = async () => {
            if (!sponsor?.email) {
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            try {
                const liveResult = await sponsorPortalHelpers.getSupportMessagesByEmail(sponsor.email);
                if (liveResult?.error) {
                    throw liveResult.error;
                }

                if (active) {
                    setMessages(liveResult.data || []);
                    setSyncError('');
                }
            } catch (error) {
                if (active) {
                    setMessages([]);
                    setSyncError(error?.message || 'Unable to load support messages from database.');
                }
            } finally {
                if (active) {
                    setIsLoading(false);
                }
            }
        };

        loadMessages();

        return () => {
            active = false;
        };
    }, [sponsor?.email]);

    const handleSendMessage = async () => {
        if (!newMessage.trim()) {
            return;
        }

        try {
            const liveResult = await sponsorPortalHelpers.sendSupportMessageByEmail(sponsor.email, newMessage.trim());
            if (liveResult?.error) {
                throw liveResult.error;
            }
            setMessages((prev) => [...prev, liveResult.data]);
            setNewMessage('');
            setSyncError('');
        } catch (error) {
            setSyncError(error?.message || 'Unable to send support message.');
        }
    };

    return (
        <div>
            <div style={{ marginBottom: '32px' }}>
                <SectionLabel text="Support" />
                <h2 className="mt-2">Direct Support Channel</h2>
                <p style={{ color: 'var(--text-secondary)', marginTop: '8px', maxWidth: '720px' }}>
                    Quick messaging with our PR and Marketing team for urgent changes, special requests, or clarifications about your sponsored deliverables.
                </p>
            </div>

            {isLoading && <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>Loading support messages...</p>}
            {syncError && <p style={{ color: 'var(--danger)', marginBottom: '16px' }}>{syncError}</p>}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '32px' }}>
                {/* Main Chat Area */}
                <Card style={{ display: 'flex', flexDirection: 'column', height: '600px' }}>
                    <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {messages.map((msg) => (
                                <div key={msg.id} style={{
                                    display: 'flex',
                                    justifyContent: msg.isUser ? 'flex-end' : 'flex-start',
                                    alignItems: 'flex-end',
                                    gap: '8px',
                                }}>
                                    {!msg.isUser && (
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '50%',
                                            background: 'var(--border)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '0.8rem',
                                        }}>👤</div>
                                    )}
                                    <div>
                                        <div style={{
                                            fontSize: '0.8rem',
                                            color: 'var(--text-secondary)',
                                            marginBottom: '4px',
                                            textAlign: msg.isUser ? 'right' : 'left',
                                        }}>
                                            {msg.from} • {msg.timestamp}
                                        </div>
                                        <div style={{
                                            background: msg.isUser ? 'var(--accent-gold)' : 'var(--border)',
                                            color: msg.isUser ? 'black' : 'var(--text-primary)',
                                            padding: '12px 16px',
                                            borderRadius: '8px',
                                            maxWidth: '400px',
                                            wordWrap: 'break-word',
                                        }}>
                                            {msg.message}
                                        </div>
                                    </div>
                                    {msg.isUser && (
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '50%',
                                            background: 'var(--accent-gold)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '0.8rem',
                                        }}>🏢</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Input Area */}
                    <div style={{
                        borderTop: '1px solid var(--border)',
                        paddingTop: '16px',
                        display: 'flex',
                        gap: '8px',
                    }}>
                        <input
                            type="text"
                            placeholder="Type your message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    handleSendMessage();
                                }
                            }}
                            style={{
                                flex: 1,
                                padding: '10px 12px',
                                background: 'var(--border)',
                                border: 'none',
                                borderRadius: '6px',
                                color: 'var(--text-primary)',
                                fontSize: '0.9rem',
                            }}
                        />
                        <button
                            onClick={handleSendMessage}
                            style={{
                                padding: '10px 16px',
                                background: 'var(--accent-gold)',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                color: 'black',
                                fontWeight: '600',
                                fontSize: '0.85rem',
                            }}
                        >
                            Send
                        </button>
                    </div>
                </Card>

                {/* Sidebar */}
                <div>
                    <Card style={{ marginBottom: '24px' }}>
                        <h5 style={{ marginBottom: '12px' }}>Contact Team</h5>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {[
                                { name: 'PR Head', role: 'Media Relations', status: 'Online' },
                                { name: 'Marketing Lead', role: 'Campaign Manager', status: 'Online' },
                                { name: 'Creative Team', role: 'Social Content', status: 'Away' },
                            ].map((contact) => (
                                <div key={contact.name} style={{ paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                        <span style={{
                                            width: '8px',
                                            height: '8px',
                                            borderRadius: '50%',
                                            background: contact.status === 'Online' ? 'var(--success)' : 'var(--text-secondary)',
                                        }}></span>
                                        <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>{contact.name}</span>
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{contact.role}</div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card>
                        <h5 style={{ marginBottom: '12px' }}>Response Times</h5>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                            <div style={{ marginBottom: '8px' }}>
                                <strong style={{ color: 'var(--text-primary)' }}>Monday-Friday</strong><br/>
                                9:00 AM - 5:00 PM
                            </div>
                            <div style={{ marginBottom: '8px' }}>
                                <strong style={{ color: 'var(--text-primary)' }}>Response Time</strong><br/>
                                Usually within 2 hours
                            </div>
                            <div>
                                <strong style={{ color: 'var(--text-primary)' }}>Urgent Issues</strong><br/>
                                Contact PR Head directly
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default SupportChannel;
