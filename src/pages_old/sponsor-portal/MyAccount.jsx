import React, { useEffect, useState } from 'react';
import Card from '../../components/Card';
import SectionLabel from '../../components/SectionLabel';

const isStrongPassword = (password) => {
    const value = String(password || '');
    return value.length >= 8
        && /[a-z]/.test(value)
        && /[A-Z]/.test(value)
        && /\d/.test(value)
        && /[^A-Za-z0-9]/.test(value);
};

const evaluatePasswordStrength = (password) => {
    const value = String(password || '');
    const score = [
        value.length >= 8,
        /[a-z]/.test(value),
        /[A-Z]/.test(value),
        /\d/.test(value),
        /[^A-Za-z0-9]/.test(value),
    ].filter(Boolean).length;

    if (!value.length) {
        return { label: 'Enter a new password', width: '0%', color: 'var(--text-muted)' };
    }

    if (score <= 2) {
        return { label: 'Weak', width: '33%', color: 'var(--danger)' };
    }

    if (score <= 4) {
        return { label: 'Medium', width: '66%', color: 'var(--warning)' };
    }

    return { label: 'Strong', width: '100%', color: 'var(--success)' };
};

const getPasswordChecklist = (password) => {
    const value = String(password || '');
    return [
        { label: 'At least 8 characters', passed: value.length >= 8 },
        { label: 'At least one lowercase letter', passed: /[a-z]/.test(value) },
        { label: 'At least one uppercase letter', passed: /[A-Z]/.test(value) },
        { label: 'At least one number', passed: /\d/.test(value) },
        { label: 'At least one symbol', passed: /[^A-Za-z0-9]/.test(value) },
    ];
};

const MyAccount = ({ sponsor, accountActions }) => {
    const [profileName, setProfileName] = useState(sponsor?.contactName || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isSavingName, setIsSavingName] = useState(false);
    const [isSavingPassword, setIsSavingPassword] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const passwordStrength = evaluatePasswordStrength(newPassword);
    const passwordChecklist = getPasswordChecklist(newPassword);

    useEffect(() => {
        setProfileName(sponsor?.contactName || '');
    }, [sponsor?.contactName]);

    const clearFeedback = () => {
        setMessage('');
        setError('');
    };

    const handleSaveName = async (e) => {
        e.preventDefault();
        clearFeedback();

        const trimmed = String(profileName || '').trim();
        if (!trimmed) {
            setError('Profile name cannot be empty.');
            return;
        }

        try {
            setIsSavingName(true);
            await accountActions.updateMyAccount({ name: trimmed });
            setMessage('Profile name updated successfully.');
        } catch (err) {
            setError(err?.message || 'Could not update profile name.');
        } finally {
            setIsSavingName(false);
        }
    };

    const handleSavePassword = async (e) => {
        e.preventDefault();
        clearFeedback();

        if (!currentPassword || !newPassword || !confirmPassword) {
            setError('Please fill all password fields.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('New password and confirm password do not match.');
            return;
        }

        if (!isStrongPassword(newPassword)) {
            setError('New password must be 8+ characters and include uppercase, lowercase, number, and symbol.');
            return;
        }

        try {
            setIsSavingPassword(true);
            await accountActions.updateMyAccount({
                currentPassword,
                newPassword,
            });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setMessage('Password updated successfully.');
        } catch (err) {
            setError(err?.message || 'Could not update password.');
        } finally {
            setIsSavingPassword(false);
        }
    };

    return (
        <div>
            <div style={{ marginBottom: '20px' }}>
                <SectionLabel text="My Account" />
                <h2 className="mt-2">Profile & Security</h2>
                <p style={{ color: 'var(--text-secondary)', marginTop: '8px', maxWidth: '720px' }}>
                    Keep your sponsor contact profile current and protect your account credentials.
                </p>
            </div>

            {message && (
                <Card style={{ padding: '12px 14px', marginBottom: '14px', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.35)', color: 'var(--success)' }}>
                    {message}
                </Card>
            )}

            {error && (
                <Card style={{ padding: '12px 14px', marginBottom: '14px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)', color: 'var(--danger)' }}>
                    {error}
                </Card>
            )}

            <Card style={{ padding: '22px', marginBottom: '16px' }}>
                <h4 style={{ marginBottom: '12px' }}>Profile</h4>
                <form onSubmit={handleSaveName}>
                    <label className="label" style={{ display: 'block', marginBottom: '8px' }}>Contact Name</label>
                    <input
                        type="text"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        style={{ width: '100%', padding: '10px', background: 'var(--border)', border: 'none', borderRadius: '6px', marginBottom: '10px' }}
                        placeholder="Primary contact name"
                    />
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '14px' }}>
                        Signed in as {sponsor?.email}
                    </div>
                    <button
                        type="submit"
                        disabled={isSavingName}
                        style={{ padding: '10px 14px', background: 'var(--accent-gold)', color: 'black', border: 'none', borderRadius: '6px', cursor: isSavingName ? 'not-allowed' : 'pointer', fontWeight: '700', opacity: isSavingName ? 0.7 : 1 }}
                    >
                        {isSavingName ? 'Saving...' : 'Save Name'}
                    </button>
                </form>
            </Card>

            <Card style={{ padding: '22px' }}>
                <h4 style={{ marginBottom: '12px' }}>Password</h4>
                <form onSubmit={handleSavePassword}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                        <div>
                            <label className="label" style={{ display: 'block', marginBottom: '8px' }}>Current Password</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px' }}>
                                <input
                                    type={showCurrentPassword ? 'text' : 'password'}
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    style={{ width: '100%', padding: '10px', background: 'var(--border)', border: 'none', borderRadius: '6px' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrentPassword((prev) => !prev)}
                                    style={{ padding: '10px 12px', background: 'var(--border)', border: 'none', borderRadius: '6px', cursor: 'pointer', color: 'var(--text-secondary)', minWidth: '74px' }}
                                >
                                    {showCurrentPassword ? 'Hide' : 'Show'}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="label" style={{ display: 'block', marginBottom: '8px' }}>New Password</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px' }}>
                                <input
                                    type={showNewPassword ? 'text' : 'password'}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    style={{ width: '100%', padding: '10px', background: 'var(--border)', border: 'none', borderRadius: '6px' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword((prev) => !prev)}
                                    style={{ padding: '10px 12px', background: 'var(--border)', border: 'none', borderRadius: '6px', cursor: 'pointer', color: 'var(--text-secondary)', minWidth: '74px' }}
                                >
                                    {showNewPassword ? 'Hide' : 'Show'}
                                </button>
                            </div>
                        </div>
                    </div>
                    <div style={{ marginTop: '14px', maxWidth: '360px' }}>
                        <label className="label" style={{ display: 'block', marginBottom: '8px' }}>Confirm New Password</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px' }}>
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                style={{ width: '100%', padding: '10px', background: 'var(--border)', border: 'none', borderRadius: '6px' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword((prev) => !prev)}
                                style={{ padding: '10px 12px', background: 'var(--border)', border: 'none', borderRadius: '6px', cursor: 'pointer', color: 'var(--text-secondary)', minWidth: '74px' }}
                            >
                                {showConfirmPassword ? 'Hide' : 'Show'}
                            </button>
                        </div>
                    </div>
                    <div style={{ marginTop: '12px', maxWidth: '360px' }}>
                        <div style={{ height: '8px', borderRadius: '999px', background: 'var(--border)', overflow: 'hidden' }}>
                            <div
                                style={{
                                    height: '100%',
                                    width: passwordStrength.width,
                                    background: passwordStrength.color,
                                    transition: 'all 0.2s ease',
                                }}
                            />
                        </div>
                        <div style={{ marginTop: '6px', fontSize: '0.78rem', color: passwordStrength.color }}>
                            Strength: {passwordStrength.label}
                        </div>
                    </div>
                    <div style={{ marginTop: '10px', maxWidth: '420px', display: 'grid', gap: '6px' }}>
                        {passwordChecklist.map((rule) => (
                            <div key={rule.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: rule.passed ? 'var(--success)' : 'var(--text-secondary)', fontSize: '0.78rem' }}>
                                <span
                                    aria-hidden="true"
                                    style={{
                                        width: '8px',
                                        height: '8px',
                                        borderRadius: '999px',
                                        background: rule.passed ? 'var(--success)' : 'var(--text-muted)',
                                        flexShrink: 0,
                                    }}
                                />
                                <span>{rule.label}</span>
                            </div>
                        ))}
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: '10px', marginBottom: '14px' }}>
                        Password must be 8+ characters and include uppercase, lowercase, number, and symbol.
                    </div>
                    <button
                        type="submit"
                        disabled={isSavingPassword}
                        style={{ padding: '10px 14px', background: 'var(--success)', color: 'white', border: 'none', borderRadius: '6px', cursor: isSavingPassword ? 'not-allowed' : 'pointer', fontWeight: '700', opacity: isSavingPassword ? 0.7 : 1 }}
                    >
                        {isSavingPassword ? 'Updating...' : 'Update Password'}
                    </button>
                </form>
            </Card>
        </div>
    );
};

export default MyAccount;
