import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Check } from 'lucide-react';
import SectionLabel from '../components/SectionLabel';
import Card from '../components/Card';
import ImagePlaceholder from '../components/ImagePlaceholder';
import { GlowingEffectDemo } from '../components/ui/GlowingEffectDemo';
import { ContainerScroll } from '../components/ui/container-scroll-animation';

const boothElite = '/booths/booth_elite.png';
const boothExecutive = '/booths/booth_executive.png';
const boothCorporate = '/booths/booth_corporate.png';
const boothStandard = '/booths/booth_standard.png';

const whyExhibit = [
    { title: 'High-Potential Talent Pool', body: 'Access over 1,500 undergraduate and postgraduate students (ages 18–25) from Computer Science, Engineering, and Design disciplines.' },
    { title: 'Targeted Engagement', body: 'Connect with digitally savvy, brand-conscious Gen Z attendees who are actively seeking innovation and career pathways.' },
    { title: 'Proven Performance', body: 'Partner with an organization capable of generating nearly 500K digital views, ensuring your on-site presence is amplified by massive online reach.' },
    { title: 'Recruitment Ready', body: 'An ideal opportunity for HR teams to conduct initial screenings and collect CVs from top-performing competitive programmers and gamers.' },
];

const boothTiers = [
    {
        type: 'Elite Brand Pavilion', tier: 'Title / Co-Title Sponsor', color: 'var(--accent-gold)',
        perks: ['Prime entrance hall / lobby placement', '6 company banners in high-traffic zones', 'Keynote & speaking slot opportunity', 'Maximum footfall brand dominance', 'Full media coverage on-site'],
        img: null, // Will be replaced below
        badge: 'Most Premium',
    },
    {
        type: 'Premium Executive Suite', tier: 'Platinum Sponsor', color: 'var(--text-secondary)',
        perks: ['Logo on all team shirts & ambassador apparel', '6 strategically placed banners', 'Full on-site media coverage', '6 VIP invites to all ceremonies', 'Logo on all event posters'],
        img: null,
    },
    {
        type: 'Corporate Hub', tier: 'Gold Sponsor', color: '#cd7f32',
        perks: ['4 company banners in key areas', 'Logo on all event posters', 'Product placement in gift bags', '4 VIP invites', 'Verbal mention at ceremonies'],
        img: null,
    },
    {
        type: 'Standard Tech Stall', tier: 'Silver Sponsor', color: 'var(--text-muted)',
        perks: ['1 company banner at your stall', 'Logo in Guide Book', 'Dedicated media coverage', '2 VIP invites', 'Verbal mention at ceremonies'],
        img: null,
    },
];

const skills = [
    { skill: 'MERN Stack / Web Dev', pct: 35 },
    { skill: 'C++ / Competitive Programming', pct: 20 },
    { skill: 'Python / Data Science', pct: 18 },
    { skill: 'UI/UX & Graphic Design', pct: 12 },
    { skill: 'Mobile Development', pct: 10 },
    { skill: 'Cybersecurity', pct: 5 },
];

const features = [
    { title: 'CV Drop Zones', desc: 'Dedicated areas at each booth for student CV submissions, collected and organized by your HR team on-site.' },
    { title: 'Product Activation', desc: 'Interactive zones where attendees can experience your software or hardware firsthand, driving hands-on brand engagement.' },
    { title: 'Branded Giveaways', desc: 'Sponsors are encouraged to provide branded merchandise at their booths to solidify long-term brand recall among students.' },
    { title: 'Tech Talk Integration', desc: 'Selected sponsors can host short sessions highlighting industry advancements, positioning your brand as a thought leader.' },
];

const CareerFair = () => (
    <div className="career-page pt-nav">
        {/* Hero */}
        <section className="section-padding" style={{ paddingBottom: '48px' }}>
            <div className="container">
                <SectionLabel text="Career Fair" />
                <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    Connect with Pakistan's Next Generation of Tech Talent
                </motion.h1>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                    style={{ color: 'var(--text-secondary)', maxWidth: '640px', marginTop: '16px', fontSize: '1.1rem' }}>
                    The ACM MAJU Career Fair is a dedicated recruitment and networking ecosystem designed to bridge the gap between classroom theory and industry leadership.
                </motion.p>
            </div>
        </section>

        {/* Stats */}
        <section style={{ background: 'var(--bg-secondary)', padding: '64px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
            <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', textAlign: 'center' }}>
                {[
                    { value: '1,500+', label: 'Students Attending' },
                    { value: '488.7K', label: 'Digital Views Generated' },
                    { value: '18–25', label: 'Age Range of Attendees' },
                    { value: '2', label: 'Days of Recruitment' },
                ].map((s, i) => (
                    <motion.div key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                        <div className="data-figure" style={{ color: 'var(--accent-gold)', fontSize: 'clamp(1.8rem,3vw,2.5rem)', display: 'block', marginBottom: '8px' }}>{s.value}</div>
                        <div className="label">{s.label}</div>
                    </motion.div>
                ))}
            </div>
        </section>

        {/* Scroll Animation */}
        <ContainerScroll
            titleComponent={
                <>
                    <div className="label" style={{ marginBottom: '16px', display: 'block' }}>Career Fair '26</div>
                    <h2 style={{ color: 'var(--text-primary)', marginBottom: '12px', fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>
                        Meet 1,500+ students ready to<br />
                        <span style={{ color: 'var(--accent-gold)', fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2.5rem, 6vw, 5rem)', fontWeight: 700, lineHeight: 1 }}>
                            Join Your Team
                        </span>
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto', lineHeight: 1.7 }}>
                        CS, Engineering &amp; Design graduates · CV drops · Live interviews
                    </p>
                </>
            }
        >
            <img
                src="/sponsorship-deck/events/DSC_1031.JPG"
                alt="Career fair and event"
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', borderRadius: '12px' }}
                draggable={false}
                loading="eager"
            />
        </ContainerScroll>

        {/* Why Exhibit */}
        <section className="section-padding">
            <div className="container">
                <SectionLabel text="Why Exhibit" />
                <h2 style={{ marginTop: '8px', marginBottom: '40px' }}>Four Reasons to Be There</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px,1fr))', gap: '24px' }}>
                    {whyExhibit.map((w, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                            <Card>
                                <h4 style={{ color: 'var(--accent-gold)', marginBottom: '12px' }}>{w.title}</h4>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{w.body}</p>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>

        {/* Glowing Sponsor Benefits Grid */}
        <section className="section-padding" style={{ paddingTop: '0' }}>
            <div className="container">
                <SectionLabel text="Sponsor Highlights" />
                <h2 style={{ marginTop: '8px', marginBottom: '40px' }}>What Your Sponsorship Unlocks</h2>
                <GlowingEffectDemo />
            </div>
        </section>

        {/* Booth Tiers — 3D Visual Cards */}
        <section className="section-padding" style={{ background: 'var(--bg-secondary)' }}>
            <div className="container">
                <SectionLabel text="Exhibition Space" />
                <h2 style={{ marginTop: '8px', marginBottom: '16px' }}>Booth Tiers & 3D Layouts</h2>
                <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', marginBottom: '48px' }}>
                    Every sponsorship tier comes with a dedicated exhibition booth. Choose your tier and claim your space at Pakistan's premier university tech event.
                </p>
                <div className="booth-tiers-grid">
                    {[
                        { ...boothTiers[0], img: boothElite },
                        { ...boothTiers[1], img: boothExecutive },
                        { ...boothTiers[2], img: boothCorporate },
                        { ...boothTiers[3], img: boothStandard },
                    ].map((b, i) => (
                        <motion.div
                            key={i}
                            className="booth-card"
                            style={{ borderTop: `3px solid ${b.color}` }}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                        >
                            {b.badge && (
                                <div className="booth-badge" style={{ background: b.color, color: '#080b10' }}>{b.badge}</div>
                            )}
                            <div className="booth-image-wrap">
                                <img src={b.img} alt={b.type} className="booth-3d-img" loading="lazy" />
                                <div className="booth-label">
                                    <span>{b.type}</span>
                                </div>
                            </div>
                            <div className="booth-info">
                                <div className="label" style={{ color: b.color, marginBottom: '6px', fontSize: '0.7rem' }}>{b.tier}</div>
                                <h3 style={{ marginBottom: '16px' }}>{b.type}</h3>
                                <ul className="booth-perks">
                                    {b.perks.map((p, j) => (
                                        <li key={j}>
                                            <Check size={13} style={{ color: b.color, flexShrink: 0, marginTop: '2px' }} />
                                            {p}
                                        </li>
                                    ))}
                                </ul>
                                <Link href={`/contact?tier=${b.tier.split(' ')[0].toLowerCase()}`} className="btn btn-outline" style={{ marginTop: '20px', display: 'block', textAlign: 'center', fontSize: '0.8rem' }}>
                                    Claim This Booth →
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>

        {/* Recruitment Features */}
        <section className="section-padding">
            <div className="container">
                <SectionLabel text="Activation" />
                <h2 style={{ marginTop: '8px', marginBottom: '40px' }}>Recruitment & Activation Features</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px,1fr))', gap: '24px' }}>
                    {features.map((f, i) => (
                        <Card key={i}><h4 style={{ marginBottom: '10px' }}>{f.title}</h4><p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{f.desc}</p></Card>
                    ))}
                </div>

                {/* Skills Grid */}
                <div style={{ marginTop: '64px' }}>
                    <SectionLabel text="Student Talent Profile" />
                    <h2 style={{ marginTop: '8px', marginBottom: '32px' }}>Who You'll Meet</h2>
                    <div className="skills-grid">
                        {skills.map((s, i) => (
                            <motion.div key={i} className="skill-bar-item" initial={{ opacity: 0, scaleX: 0 }} whileInView={{ opacity: 1, scaleX: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '0.9rem' }}>{s.skill}</span>
                                    <span className="data-figure" style={{ color: 'var(--accent-gold)', fontSize: '0.9rem' }}>{s.pct}%</span>
                                </div>
                                <div style={{ height: '6px', background: 'var(--border)', borderRadius: '3px' }}>
                                    <motion.div
                                        style={{ height: '100%', background: 'var(--accent-gold)', borderRadius: '3px', width: `${s.pct}%` }}
                                        initial={{ width: 0 }} whileInView={{ width: `${s.pct}%` }} viewport={{ once: true }} transition={{ delay: i * 0.08 + 0.2, duration: 0.6 }}
                                    />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                    <div className="student-breakdown" style={{ marginTop: '32px', display: 'flex', flexWrap: 'wrap', gap: '32px' }}>
                        {[
                            ['75%', 'Undergraduate'], ['25%', 'Postgraduate'],
                            ['MAJU, NED, FAST, IBA, SZABIST', 'Universities Represented'],
                            ['Class of 2026, 2027 & 2028', 'Graduating Years'],
                        ].map(([val, label], i) => (
                            <div key={i}><div className="data-figure" style={{ color: 'var(--accent-gold)', fontSize: '1.25rem' }}>{val}</div><div className="label" style={{ marginTop: '4px' }}>{label}</div></div>
                        ))}
                    </div>
                </div>
            </div>
        </section>

        {/* Footer CTA */}
        <section style={{ background: 'linear-gradient(to right, var(--bg-card), var(--bg-secondary))', borderTop: '3px solid var(--accent-gold)', padding: '80px 0', textAlign: 'center' }}>
            <div className="container">
                <h2>Ready to Meet Your Next Hire?</h2>
                <p style={{ color: 'var(--text-secondary)', marginTop: '16px', marginBottom: '40px', maxWidth: '520px', margin: '16px auto 40px' }}>
                    Reserve your booth today and connect with Pakistan's most ambitious tech graduates.
                </p>
                <Link href="/contact?sector=career-fair" className="btn btn-primary">Book a Booth</Link>
            </div>
        </section>
    </div>
);

export default CareerFair;
