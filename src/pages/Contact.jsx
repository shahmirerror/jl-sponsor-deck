import React, { useState } from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react';
import SectionLabel from '../components/SectionLabel';
import ImagePlaceholder from '../components/ImagePlaceholder';
import Button from '../components/Button';

const Contact = () => {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '', company: '', designation: '', email: '', phone: '',
        sector: '',
        tier: '',
        message: ''
    });
    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');

    useEffect(() => {
        if (!router.isReady) {
            return;
        }

        const sector = typeof router.query.sector === 'string' ? router.query.sector : '';
        const tier = typeof router.query.tier === 'string' ? router.query.tier : '';

        setFormData((prev) => ({
            ...prev,
            sector: prev.sector || sector,
            tier: prev.tier || tier,
        }));
    }, [router.isReady, router.query.sector, router.query.tier]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError('');
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.message || 'Unable to submit inquiry.');
            }

            setSubmitted(true);
        } catch (error) {
            setSubmitError(error?.message || 'Unable to submit inquiry.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const contacts = [
        { name: 'Abdul Rafay', title: 'Director of PR & Sponsorships', photo: 'CONTACT_PHOTO_1', email: 'acm@jinnah.edu', phone: '+92 349 0833806', whatsapp: '+92 349 0833806' },
        { name: 'Shahmir Sindhu', title: 'President', photo: 'CONTACT_PHOTO_2', email: 'acm@jinnah.edu', phone: '+92 310 3504444', whatsapp: '+92 310 3504444' },
    ];

    return (
        <div className="contact-page pt-nav">
            <div className="container section-padding">
                <div className="contact-grid">
                    {/* Left Info Panel */}
                    <motion.div className="contact-info" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
                        <SectionLabel text="Get In Touch" />
                        <h1 style={{ marginBottom: '24px', marginTop: '8px' }}>Start the Conversation</h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '40px' }}>
                            Whether you're ready to secure your tier or need a custom arrangement, our team is here
                            to align our platform with your brand goals.
                        </p>

                        <div className="contact-details" style={{ marginBottom: '40px' }}>
                            <div className="contact-detail-item">
                                <Mail size={18} style={{ color: 'var(--accent-gold)', flexShrink: 0 }} />
                                <div><div className="label">Email</div><p>acm@jinnah.edu</p></div>
                            </div>
                            <div className="contact-detail-item">
                                <Phone size={18} style={{ color: 'var(--accent-gold)', flexShrink: 0 }} />
                                <div><div className="label">Phone / WhatsApp</div><p>+92 349 0833806 / +92 310 3504444</p></div>
                            </div>
                            <div className="contact-detail-item">
                                <MapPin size={18} style={{ color: 'var(--accent-gold)', flexShrink: 0 }} />
                                <div><div className="label">Address</div><p>Mohammad Ali Jinnah University<br />PECHS Block 6, Karachi, Pakistan</p></div>
                            </div>
                        </div>

                        <div className="contact-persons">
                            {contacts.map((c) => (
                                <div key={c.name} className="contact-person-card card" style={{ padding: 0, overflow: 'hidden', marginBottom: '20px' }}>
                                    <div style={{ display: 'flex', gap: 0 }}>
                                        <ImagePlaceholder label={c.photo} width="80px" height="80px" />
                                        <div style={{ padding: '12px 16px', flex: 1 }}>
                                            <h4 style={{ fontSize: '0.95rem', marginBottom: '2px' }}>{c.name}</h4>
                                            <div className="label" style={{ color: 'var(--accent-gold)', fontSize: '0.65rem' }}>{c.title}</div>
                                            <a href={`https://wa.me/${c.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                                                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '6px', color: 'var(--success)', fontSize: '0.8rem' }}>
                                                <MessageCircle size={14} /> WhatsApp
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Right Form */}
                    <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
                        {submitted ? (
                            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--success)', padding: '64px 32px', textAlign: 'center' }}>
                                <h3 style={{ color: 'var(--success)', marginBottom: '16px' }}>✓ Request Received!</h3>
                                <p style={{ color: 'var(--text-secondary)' }}>A partnership director will contact you within 24 hours. Thank you for your interest in becoming a Jinnah League '26 sponsor!</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} style={{ background: 'var(--bg-card)', padding: '48px', border: '1px solid var(--border)', borderTop: '3px solid var(--accent-gold)' }}>
                                <h3 style={{ marginBottom: '32px' }}>Partnership Inquiry</h3>
                                {submitError && (
                                    <p style={{ color: '#f87171', marginBottom: '20px' }}>{submitError}</p>
                                )}
                                <div className="form-row" style={{ marginBottom: '20px' }}>
                                    <div>
                                        <label className="label">Full Name *</label>
                                        <input type="text" name="name" required style={{ width: '100%', marginTop: '8px' }} onChange={handleChange} />
                                    </div>
                                    <div>
                                        <label className="label">Company Name *</label>
                                        <input type="text" name="company" required style={{ width: '100%', marginTop: '8px' }} onChange={handleChange} />
                                    </div>
                                </div>
                                <div style={{ marginBottom: '20px' }}>
                                    <label className="label">Designation</label>
                                    <input type="text" name="designation" style={{ width: '100%', marginTop: '8px' }} onChange={handleChange} />
                                </div>
                                <div className="form-row" style={{ marginBottom: '20px' }}>
                                    <div>
                                        <label className="label">Email *</label>
                                        <input type="email" name="email" required style={{ width: '100%', marginTop: '8px' }} onChange={handleChange} />
                                    </div>
                                    <div>
                                        <label className="label">Phone</label>
                                        <input type="tel" name="phone" style={{ width: '100%', marginTop: '8px' }} onChange={handleChange} />
                                    </div>
                                </div>
                                <div className="form-row" style={{ marginBottom: '20px' }}>
                                    <div>
                                        <label className="label">Sector of Interest</label>
                                        <select name="sector" value={formData.sector} style={{ width: '100%', marginTop: '8px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} onChange={handleChange}>
                                            <option value="">Select Sector</option>
                                            {['Banking & Finance', 'Technology & IT', 'Software Houses', 'BPOs', 'Property & Real Estate', 'Car Dealerships', 'Healthcare & Pharma', 'Education & EdTech', 'Retail & FMCG', 'Media & PR'].map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="label">Sponsorship Tier</label>
                                        <select name="tier" value={formData.tier} style={{ width: '100%', marginTop: '8px', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} onChange={handleChange}>
                                            <option value="">Select Tier</option>
                                            <option value="silver">Silver — Rs. 1,50,000</option>
                                            <option value="gold">Gold — Rs. 2,00,000</option>
                                            <option value="platinum">Platinum — Rs. 4,50,000</option>
                                            <option value="cotitle">Co-Title — Rs. 7,00,000</option>
                                            <option value="title">Title Sponsor — Rs. 10,00,000</option>
                                        </select>
                                    </div>
                                </div>
                                <div style={{ marginBottom: '32px' }}>
                                    <label className="label">Message</label>
                                    <textarea name="message" rows="4" style={{ width: '100%', marginTop: '8px', resize: 'vertical' }} onChange={handleChange}></textarea>
                                </div>
                                <Button type="submit" disabled={isSubmitting} style={{ width: '100%' }}>
                                    {isSubmitting ? 'Submitting...' : 'Submit Inquiry'}
                                </Button>
                            </form>
                        )}
                    </motion.div>
                </div>
            </div>

            {/* ─── Google Map ─── */}
            <div style={{ borderTop: '1px solid var(--border)', marginTop: '0' }}>
                <div className="container" style={{ padding: '48px var(--container-padding, 24px) 64px' }}>
                    <div style={{
                        fontFamily: 'Syne, sans-serif',
                        fontWeight: 600,
                        fontSize: '0.72rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.14em',
                        color: '#C9A84C',
                        marginBottom: '12px',
                    }}>
                        Find Us
                    </div>
                    <iframe
                        title="Mohammad Ali Jinnah University, Karachi"
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3619.538534614766!2d67.06472397463376!3d24.86721534417737!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3eb33f0b8a7dc987%3A0x5a6b35e9574d3741!2sMohammad%20Ali%20Jinnah%20University%20Karachi!5e0!3m2!1sen!2spk!4v1709500000000!5m2!1sen!2spk"
                        width="100%"
                        height="320"
                        style={{
                            border: 0,
                            borderRadius: 0,
                            display: 'block',
                            outline: '1px solid #1E2D40',
                        }}
                        allowFullScreen=""
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                    />
                </div>
            </div>
        </div>
    );
};

export default Contact;
