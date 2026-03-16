import React from 'react';
import { motion } from 'framer-motion';
import { Instagram, Linkedin, Facebook } from 'lucide-react';
import SectionLabel from '../components/SectionLabel';
import Card from '../components/Card';
import { ContainerScroll } from '../components/ui/container-scroll-animation';

// Real social media screenshot previews
const socialPreviews = [
    { src: '/sponsorship-deck/social/Screenshot 2026-03-05 022456.png', alt: 'ACM MAJU Instagram post — Final Boss Challenge 2.0' },
];

const platforms = [
    { icon: <Instagram size={28} />, name: 'Instagram', handle: '@acmmaju', link: 'https://www.instagram.com/acmmaju', followers: '242 (New)', reach: '488.7K (90-day)', engagement: '16.2%', color: '#E1306C' },
    { icon: <Linkedin size={28} />, name: 'LinkedIn', handle: 'ACM MAJU Student Chapter', link: 'https://www.linkedin.com/company/acmmaju', followers: '500+', reach: '200+/post', engagement: '45%', color: '#0077B5' },
    { icon: <Facebook size={28} />, name: 'Facebook', handle: 'ACM Maju Student Chapter', link: 'https://www.facebook.com/AcmMajuStudentChapter', followers: '2K', reach: '10K/post', engagement: '8%', color: '#1877F2' },
];


const campaignMetrics = [
    { value: '488.7K', label: '90-Day Total Views' },
    { value: '606.4%', label: 'Quarterly Growth in Views' },
    { value: '4.4K', label: 'Total Content Interactions' },
    { value: '768.7%', label: 'Interaction Growth Rate' },
    { value: '54.8K', label: 'Peak Weekly Views' },
    { value: '5.7K', label: 'Profile Visits (90 days)' },
];

const contentTypes = [
    { type: 'Speaker Announcement Graphics', reach: '5.5K+' },
    { type: 'Sponsor Spotlight Posts', reach: '10.2K+' },
    { type: 'Event Highlight Reels', reach: '24K+' },
    { type: 'Behind-the-Scenes Stories', reach: '500+/story' },
];

const sponsorBenefits = [
    { title: 'Algorithm Mastery', desc: 'Benefit from our deep understanding of Instagram\'s content distribution to maximize brand reach.' },
    { title: 'Viral Potential', desc: 'Opportunity for brand inclusion in content designed to generate significant spikes in engagement.' },
    { title: 'Dedicated Growth Strategies', desc: 'We apply proven content formulas from our peak performance days to drive results for your brand.' },
    { title: 'Data-Driven Reporting', desc: 'Regular performance insights and continuous optimization based on comprehensive analytics.' },
];

const SocialInsights = () => (
    <div className="social-page pt-nav">
        <section className="section-padding" style={{ paddingBottom: '48px' }}>
            <div className="container">
                <SectionLabel text="Digital Reach" />
                <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>Our Reach, Your Platform</motion.h1>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                    style={{ color: 'var(--text-secondary)', maxWidth: '640px', marginTop: '16px', fontSize: '1.1rem' }}>
                    Sponsoring ACM MAJU puts your brand in front of a highly engaged digital community of students, professionals, and tech enthusiasts across Pakistan. Our data demonstrates a proven ability to drive significant growth and viral engagement.
                </motion.p>
            </div>
        </section>

        {/* Scroll Animation */}
        <ContainerScroll
            titleComponent={
                <>
                    <div className="label" style={{ marginBottom: '16px', display: 'block' }}>Digital Presence</div>
                    <h2 style={{ color: 'var(--text-primary)', marginBottom: '12px', fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>
                        488.7K views in<br />
                        <span style={{ color: 'var(--accent-gold)', fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2.5rem, 6vw, 5rem)', fontWeight: 700, lineHeight: 1 }}>
                            90 Days
                        </span>
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto', lineHeight: 1.7 }}>
                        Our proven content strategy turns sponsor placements into viral brand moments.
                    </p>
                </>
            }
        >
            <img
                src="/sponsorship-deck/social/Screenshot 2026-03-05 022456.png"
                alt="ACM MAJU social media performance"
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', borderRadius: '12px' }}
                draggable={false}
                loading="eager"
            />
        </ContainerScroll>

        {/* Campaign Metrics */}
        <section style={{ background: 'var(--bg-secondary)', padding: '64px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
            <div className="container">
                <div className="metrics-grid">
                    {campaignMetrics.map((m, i) => (
                        <motion.div key={i} className="metric-item" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                            <div className="data-figure metric-value">{m.value}</div>
                            <div className="label metric-label">{m.label}</div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>

        {/* Platform Cards */}
        <section className="section-padding">
            <div className="container">
                <SectionLabel text="Platforms" />
                <h2 style={{ marginBottom: '40px', marginTop: '8px' }}>Where We Connect</h2>
                <div className="platforms-grid">
                    {platforms.map((p, i) => (
                        <motion.div key={p.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                            <Card className="platform-card">
                                <div className="platform-icon" style={{ color: p.color }}>{p.icon}</div>
                                <h3 style={{ marginTop: '12px', marginBottom: '4px' }}>{p.name}</h3>
                                <a href={p.link} target="_blank" rel="noopener noreferrer" className="label" style={{ color: 'var(--accent-gold)' }}>{p.handle}</a>
                                <div className="platform-stats" style={{ marginTop: '20px' }}>
                                    <div className="pstat"><div className="data-figure">{p.followers}</div><div className="label">Followers</div></div>
                                    <div className="pstat"><div className="data-figure">{p.reach}</div><div className="label">Reach</div></div>
                                    <div className="pstat"><div className="data-figure" style={{ color: 'var(--success)' }}>{p.engagement}</div><div className="label">Engagement</div></div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Best Content Types */}
                <div style={{ marginTop: '64px' }}>
                    <SectionLabel text="Content Performance" />
                    <h2 style={{ marginBottom: '32px', marginTop: '8px' }}>What We Create</h2>
                    <div className="content-grid">
                        {contentTypes.map((c, i) => (
                            <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                                <Card>
                                    <h4>{c.type}</h4>
                                    <div className="data-figure" style={{ color: 'var(--accent-gold)', fontSize: '1.5rem', marginTop: '12px' }}>{c.reach}</div>
                                    <div className="label" style={{ marginTop: '4px', color: 'var(--text-muted)' }}>Avg Reach</div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Sponsor Social Benefits */}
                <div style={{ marginTop: '64px' }}>
                    <SectionLabel text="What Sponsors Get" />
                    <h2 style={{ marginBottom: '32px', marginTop: '8px' }}>Your Brand, Amplified</h2>
                    <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                        <Card><p style={{ color: 'var(--text-secondary)' }}>✅ Dedicated announcement post on Instagram and LinkedIn when partnership is confirmed.</p></Card>
                        <Card><p style={{ color: 'var(--text-secondary)' }}>✅ Logo featured in all event promotional reels and stories during the event week.</p></Card>
                        <Card><p style={{ color: 'var(--text-secondary)' }}>✅ Post-event thank-you reel featuring all sponsors.</p></Card>
                        <Card><p style={{ color: 'var(--text-secondary)' }}>✅ Sponsor spotlight post — reaching an average of 10.2K+ per post.</p></Card>
                    </div>
                    <div className="content-grid">
                        {sponsorBenefits.map((b, i) => (
                            <Card key={i}>
                                <h4 style={{ color: 'var(--accent-gold)', marginBottom: '12px' }}>{b.title}</h4>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{b.desc}</p>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </section>

        {/* Social Preview Grid */}
        {socialPreviews.length > 0 && (
            <section className="section-padding" style={{ background: 'var(--bg-secondary)', paddingBottom: '80px' }}>
                <div className="container">
                    <SectionLabel text="Content Previews" />
                    <h2 style={{ marginBottom: '32px', marginTop: '8px' }}>Our Content in Action</h2>
                    <div className="social-preview-grid">
                        {socialPreviews.map((item, i) => (
                            <motion.div
                                key={i}
                                className="social-preview-item img-container"
                                initial={{ opacity: 0, scale: 0.96 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.08 }}
                            >
                                <img
                                    src={item.src}
                                    alt={item.alt}
                                    className="social-preview-img"
                                    loading="lazy"
                                />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        )}
    </div>
);

export default SocialInsights;
