import React from 'react';
import { motion } from 'framer-motion';
import SectionLabel from '../components/SectionLabel';
import { ContainerScroll } from '../components/ui/container-scroll-animation';

const sponsors = [
    { name: 'Matz Solutions', sector: 'Cloud & Software Solutions', year: '2023', tier: 'Gold', logo: '/sponsorship-deck/sponsors/matz-solutions.png' },
    { name: 'AKSiQ', sector: 'RegTech & AI Solutions', year: '2023', tier: 'Silver', logo: '/sponsorship-deck/sponsors/aksiq.jfif' },
    { name: 'Dubai Islamic Bank', sector: 'Islamic Banking', year: '2023', tier: 'Silver', logo: '/sponsorship-deck/sponsors/dubai islamic bank.png' },
    { name: 'NIFT', sector: 'Fintech & Payment Infrastructure', year: '2023', tier: 'Silver', logo: '/sponsorship-deck/sponsors/nift.png' },
    { name: 'Skills 360', sector: 'Professional Education & Training', year: '2024', tier: 'Gold', logo: '/sponsorship-deck/sponsors/skills-360.png' },
    { name: 'ProByte', sector: 'IT Solutions & Cybersecurity', year: '2024', tier: 'Gold', logo: '/sponsorship-deck/sponsors/probyte.png' },
    { name: 'Delivery Devs', sector: 'Software Development & DevOps', year: '2024', tier: 'Silver', logo: '/sponsorship-deck/sponsors/delivery-devs.png' },
    { name: 'Inspedium Corporation', sector: 'Cloud Hosting & IT Services', year: '2024', tier: 'Bronze', logo: '/sponsorship-deck/sponsors/inspedium-corporation.png' },
];

const tierColor = {
    Platinum: 'var(--text-secondary)',
    Gold: 'var(--accent-gold)',
    Silver: 'var(--accent-blue)',
    Bronze: 'var(--success)',
    'Esports Partner': 'var(--accent-blue)',
    'F&B Partner': 'var(--success)',
    'Media Partner': '#9b59b6',
};

const PreviousSponsors = () => (
    <div className="sponsors-page pt-nav">
        <section className="section-padding" style={{ paddingBottom: '48px' }}>
            <div className="container">
                <SectionLabel text="Alumni Sponsors" />
                <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                    Trusted By Pakistan's Leading Organizations
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                    style={{ color: 'var(--text-secondary)', maxWidth: '640px', marginTop: '16px', fontSize: '1.1rem' }}
                >
                    We proudly recognize our previous partners whose support has been instrumental in making past ACM events successful and unforgettable. These organizations share our vision of fostering innovation and empowering the next generation of tech and gaming leaders.
                </motion.p>
            </div>
        </section>

        {/* Scroll Animation */}
        <ContainerScroll
            titleComponent={
                <>
                    <div className="label" style={{ marginBottom: '16px', display: 'block' }}>Our Partners</div>
                    <h2 style={{ color: 'var(--text-primary)', marginBottom: '12px', fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>
                        Organizations that<br />
                        <span style={{ color: 'var(--accent-gold)', fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2.5rem, 6vw, 5rem)', fontWeight: 700, lineHeight: 1 }}>
                            Believed in Us
                        </span>
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto', lineHeight: 1.7 }}>
                        From banking and tech to gaming and education — Pakistan's best brands trust ACM MAJU.
                    </p>
                </>
            }
        >
            <img
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1400&q=80"
                alt="Corporate partnership"
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', borderRadius: '12px' }}
                draggable={false}
                loading="eager"
            />
        </ContainerScroll>

        <section className="section-padding" style={{ paddingTop: 0 }}>
            <div className="container">
                <div className="sponsors-grid">
                    {sponsors.map((s, i) => (
                        <motion.div
                            key={s.name}
                            className="sponsor-card"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.05 }}
                        >
                            <div className="sponsor-logo-wrap img-container">
                                <img
                                    src={s.logo}
                                    alt={`${s.name} logo`}
                                    className="sponsor-logo-img"
                                    loading="lazy"
                                />
                            </div>
                            <div className="sponsor-info">
                                <h4 className="sponsor-name">{s.name}</h4>
                                <div className="sponsor-meta">
                                    <span className="label" style={{ color: tierColor[s.tier] || 'var(--text-secondary)' }}>{s.tier}</span>
                                    <span className="label" style={{ color: 'var(--text-muted)' }}>{s.year}</span>
                                </div>
                                <p className="sponsor-sector">{s.sector}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    </div>
);

export default PreviousSponsors;
