import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const Partners = () => (
    <div className="partners-page">

        {/* ─── Hero ─── */}
        <section className="partners-hero">
            <motion.div initial="hidden" animate="visible" variants={fadeUp}>
                <p className="partners-hero-label">JINNAH LEAGUE &apos;24</p>
                <h1>Current Sponsors &amp; Partners</h1>
                <p className="partners-hero-sub">
                    The organizations standing behind Jinnah League &apos;24 — proud partners committed to
                    empowering Pakistan&apos;s next generation of tech talent.
                </p>
            </motion.div>
        </section>

        {/* ─── Media Partner Section ─── */}
        <section className="media-partner-section">

            <div className="media-partner-top-label">
                <span>OFFICIAL MEDIA PARTNER</span>
            </div>

            <motion.div
                className="media-partner-card"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
            >
                {/* Logo */}
                <img
                    src="/sponsorship-deck/sponsors/PTV_Sports Media Partner.png"
                    alt="PTV Sports"
                    className="mp-logo"
                />

                {/* Company Name */}
                <p className="mp-name">PTV Sports</p>

                {/* Badge */}
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <span className="mp-badge">MEDIA PARTNER</span>
                </div>

                {/* Divider */}
                <div className="mp-divider" />

                {/* Description */}
                <p className="mp-description">
                    PTV Sports joins Jinnah League &apos;24 as our Official Media Partner — bringing
                    unmatched broadcast reach and digital coverage to Pakistan&apos;s premier student
                    tech summit.
                </p>

                {/* Stat Chips */}
                <div className="mp-stats">
                    <span className="mp-stat-chip">National Broadcast Reach</span>
                    <span className="mp-stat-chip">Digital Platform Coverage</span>
                </div>
            </motion.div>

            {/* Coming Soon */}
            <motion.div
                className="partners-coming-soon"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.35 }}
            >
                <p>More partnerships are being finalized.</p>
                <Link href="/contact" className="btn-partner-outline">
                    Become a Partner
                </Link>
            </motion.div>
        </section>

        {/* ─── Bottom CTA ─── */}
        <section className="partners-cta">
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
                <h2>Want Your Brand Here?</h2>
                <p>Sponsorship opportunities across all tiers are still open for Jinnah League &apos;24.</p>
                <Link href="/tiers" className="btn btn-primary">View Sponsorship Packages</Link>
            </motion.div>
        </section>

    </div>
);

export default Partners;
