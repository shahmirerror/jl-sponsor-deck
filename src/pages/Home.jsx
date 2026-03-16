import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import SectionLabel from '../components/SectionLabel';
import Card from '../components/Card';

const ContainerScroll = dynamic(
    () => import('../components/ui/container-scroll-animation').then((mod) => mod.ContainerScroll),
    { ssr: false }
);

const AnimatedHero = dynamic(
    () => import('../components/ui/animated-hero').then((mod) => mod.Hero),
    { ssr: false }
);

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const stagger = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const sectors = [
    { id: 'banking', name: 'Banking & Finance' },
    { id: 'tech', name: 'Technology & IT' },
    { id: 'software', name: 'Software Houses' },
    { id: 'bpo', name: 'BPOs' },
    { id: 'property', name: 'Property & Real Estate' },
    { id: 'auto', name: 'Car Dealerships' },
    { id: 'health', name: 'Healthcare & Pharma' },
    { id: 'edu', name: 'Education & EdTech' },
    { id: 'retail', name: 'Retail & FMCG' },
    { id: 'media', name: 'Media & PR' },
];

const Home = () => (
    <div className="home-page">

        {/* ─── Hero ─── */}
        <section className="hero-section">
            <div className="hero-noise" />
            <div className="hero-gradient" />
            <AnimatedHero />
        </section>

        {/* ─── Stats Bar ─── */}
        <section className="stats-bar">
            <div className="container stats-grid">
                {[
                    { value: '2,000+', label: 'Expected Participants' },
                    { value: 'Pakistan-Wide', label: 'University Reach' },
                    { value: '2', label: 'Festival Days' },
                    { value: '8', label: 'Announced Competitions' },
                ].map((stat, i) => (
                    <motion.div
                        key={i} className="stat-item"
                        initial={{ opacity: 0, scale: 0.85 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <div className="stat-value data-figure">{stat.value}</div>
                        <div className="stat-label label">{stat.label}</div>
                    </motion.div>
                ))}
            </div>
        </section>

        {/* ─── Scroll Animation Showcase ─── */}
        <ContainerScroll
            titleComponent={
                <>
                    <div className="label" style={{ marginBottom: '16px', display: 'block' }}>ACM MAJU Jinnah League '26</div>
                    <h2 style={{ color: 'var(--text-primary)', marginBottom: '12px', fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>
                        Pakistan's Largest University<br />
                        <span style={{ color: 'var(--accent-gold)', fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2.5rem, 6vw, 5rem)', fontWeight: 700, lineHeight: 1 }}>
                            Tech & Gaming Summit
                        </span>
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', maxWidth: '540px', margin: '0 auto', lineHeight: 1.7 }}>
                        2,000+ expected participants · 8 announced competitions · registrations opening soon
                    </p>
                </>
            }
        >
            <img
                src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1400&q=80"
                alt="Jinnah League event stage"
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', borderRadius: '12px' }}
                draggable={false}
            />
        </ContainerScroll>

        {/* ─── About / Mission ─── */}
        <section className="about-section section-padding clip-diagonal">
            <div className="container about-grid">
                <motion.div
                    initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
                    className="about-text"
                >
                    <SectionLabel text="Our Mission" />
                    <motion.h2 variants={fadeUp}>Redefining Pakistani University Events</motion.h2>
                    <motion.p variants={fadeUp} style={{ marginTop: '24px', color: 'var(--text-secondary)' }}>
                        ACM MAJU is a pioneering student-run society at Mohammad Ali Jinnah University dedicated
                        to fostering innovation, technological expertise, and academic excellence. Jinnah League
                        '26 is our most ambitious flagship event yet: a two-day tech and gaming festival in
                        Karachi designed to host 2,000+ participants from universities across Pakistan.
                    </motion.p>
                    <motion.div variants={fadeUp} style={{ marginTop: '32px' }}>
                        <Link href="/about" className="btn btn-outline">Meet Our Team</Link>
                    </motion.div>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }} transition={{ duration: 0.8 }}
                    className="about-graphic"
                >
                    <div className="geometric-shape" />
                </motion.div>
            </div>
        </section>

        {/* ─── Sector Preview ─── */}
        <section className="sector-preview section-padding">
            <div className="container">
                <SectionLabel text="Industries" />
                <h2 style={{ marginBottom: '12px', marginTop: '8px' }}>Tailored For Your Sector</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '48px', maxWidth: '520px' }}>
                    We approach sponsors across every major industry — find your sector and discover the
                    tailored value we bring to your brand.
                </p>
                <div className="sector-grid">
                    {sectors.map((sector, i) => (
                        <motion.div
                            key={sector.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-40px' }}
                            transition={{ delay: i * 0.05 }}
                        >
                            <Link href={`/sectors#${sector.id}`}>
                                <Card className="sector-card">
                                    <h4>{sector.name}</h4>
                                    <p className="label" style={{ marginTop: '16px' }}>Learn More →</p>
                                </Card>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>

        {/* ─── Tier Teaser ─── */}
        <section className="tiers-teaser section-padding" style={{ background: 'var(--bg-secondary)' }}>
            <div className="container" style={{ textAlign: 'center' }}>
                <SectionLabel text="Sponsorship Packages" />
                <h2 style={{ marginTop: '8px', marginBottom: '16px' }}>Partner At Your Level</h2>
                <p style={{ color: 'var(--text-secondary)', maxWidth: '520px', margin: '0 auto 48px' }}>
                    From Silver to Title Sponsor — every tier is designed to deliver measurable brand impact
                    among 2,000+ ambitious participants.
                </p>
                <div className="tier-teaser-grid">
                    {[
                        { name: 'Silver', price: 'Rs. 1,50,000' },
                        { name: 'Gold', price: 'Rs. 2,00,000' },
                        { name: 'Platinum', price: 'Rs. 4,50,000' },
                        { name: 'Co-Title', price: 'Rs. 7,00,000' },
                        { name: 'Title', price: 'Rs. 10,00,000' },
                    ].map((tier, i) => (
                        <motion.div
                            key={tier.name}
                            className={`teaser-card ${tier.name === 'Title' ? 'featured' : ''}`}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.08 }}
                        >
                            <div className="teaser-name label">{tier.name}</div>
                            <div className="teaser-price data-figure">{tier.price}</div>
                        </motion.div>
                    ))}
                </div>
                <div style={{ marginTop: '48px' }}>
                    <Link href="/tiers" className="btn btn-primary">View Full Packages</Link>
                </div>
            </div>
        </section>

        {/* ─── Sponsor Strip ─── */}
        <div className="home-sponsor-divider" />
        <section className="home-sponsor-section">
            <p className="home-sponsor-label">TRUSTED BY LEADING ORGANIZATIONS</p>
            <div className="home-sponsor-strip">
                <div className="home-sponsor-track">
                    {[
                        { src: '/sponsorship-deck/sponsors/PTV_Sports Media Partner.png', alt: 'PTV Sports' },
                        { src: '/sponsorship-deck/sponsors/nift-landscape.png', alt: 'NIFT ePay' },
                        { src: '/sponsorship-deck/sponsors/skills-360-landscape.png', alt: 'Skills 360' },
                        { src: '/sponsorship-deck/sponsors/maju.png', alt: 'MAJU' },
                        { src: '/sponsorship-deck/sponsors/probyte-landscape.png', alt: 'Probyte' },
                        { src: '/sponsorship-deck/sponsors/delivery-devs-landscape.png', alt: 'Delivery Devs' },
                        { src: '/sponsorship-deck/sponsors/24 news hd.jpg', alt: '24 News HD' },
                        { src: '/sponsorship-deck/sponsors/dunya news.jpg', alt: 'Dunya News' },
                        { src: '/sponsorship-deck/sponsors/dubai islamic bank.png', alt: 'Dubai Islamic Bank' },
                        { src: '/sponsorship-deck/sponsors/gtv news.jfif', alt: 'GTV News' },
                        { src: '/sponsorship-deck/sponsors/inspedium-corporation-landscape.png', alt: 'Inspedium Corp' },
                        { src: '/sponsorship-deck/sponsors/matz-solutions-landscape.png', alt: 'Matz Solution' },
                        { src: '/sponsorship-deck/sponsors/aksiq.jfif', alt: 'Aksiq' },
                        /* duplicated set for seamless loop */
                        { src: '/sponsorship-deck/sponsors/PTV_Sports Media Partner.png', alt: 'PTV Sports' },
                        { src: '/sponsorship-deck/sponsors/nift-landscape.png', alt: 'NIFT ePay' },
                        { src: '/sponsorship-deck/sponsors/skills-360-landscape.png', alt: 'Skills 360' },
                        { src: '/sponsorship-deck/sponsors/maju.png', alt: 'MAJU' },
                        { src: '/sponsorship-deck/sponsors/probyte-landscape.png', alt: 'Probyte' },
                        { src: '/sponsorship-deck/sponsors/delivery-devs-landscape.png', alt: 'Delivery Devs' },
                        { src: '/sponsorship-deck/sponsors/24 news hd.jpg', alt: '24 News HD' },
                        { src: '/sponsorship-deck/sponsors/dunya news.jpg', alt: 'Dunya News' },
                        { src: '/sponsorship-deck/sponsors/dubai islamic bank.png', alt: 'Dubai Islamic Bank' },
                        { src: '/sponsorship-deck/sponsors/gtv news.jfif', alt: 'GTV News' },
                        { src: '/sponsorship-deck/sponsors/inspedium-corporation-landscape.png', alt: 'Inspedium Corp' },
                        { src: '/sponsorship-deck/sponsors/matz-solutions-landscape.png', alt: 'Matz Solution' },
                        { src: '/sponsorship-deck/sponsors/aksiq.jfif', alt: 'Aksiq' },
                    ].map((logo, i) => (
                        <div key={i} className="home-sponsor-item">
                            <img src={logo.src} alt={logo.alt} className="logo-img" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
        <div className="home-sponsor-divider" />

        {/* ─── CTA Banner ─── */}
        <section className="cta-banner section-padding">
            <div className="container" style={{ textAlign: 'center' }}>
                <SectionLabel text="Get Involved" />
                <h2 style={{ marginTop: '8px' }}>Ready to be part of something bigger?</h2>
                <p style={{ color: 'var(--text-secondary)', marginTop: '16px', marginBottom: '40px' }}>
                    Partner with leading organizations investing in Pakistan's future tech talent.
                </p>
                <Link href="/contact" className="btn btn-primary">Become a Sponsor</Link>
            </div>
        </section>

    </div>
);

export default Home;
