import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Check, X } from 'lucide-react';
import SectionLabel from '../components/SectionLabel';
import { ContainerScroll } from '../components/ui/container-scroll-animation';
import './Tiers.css';

// Booth/tier images — using 3D renders from Sponsorship Booth Images
const tierImages = {
    silver: '/sponsorship-deck/booths/Plat1 - Edited.png',
    gold: '/sponsorship-deck/booths/Gold - Edited.png',
    platinum: '/sponsorship-deck/booths/Platinum - Edited.png',
    cotitle: '/sponsorship-deck/booths/Co Title 1 - Edited.png',
    title: '/sponsorship-deck/booths/Title 1 - Edited.png',
};

const tierBoothLabels = {
    silver: 'Standard Tech Stall',
    gold: 'Corporate Hub',
    platinum: 'Premium Executive Suite',
    cotitle: 'Elite Brand Pavilion',
    title: 'Title Branding Space',
};

const tiers = [
    {
        id: 'silver', name: 'Silver', price: 'Rs. 1,50,000',
        caption: 'Essential brand integration across digital and physical touchpoints.',
        desc: 'Perfect for organizations looking to establish a reputable presence and connect with a high-potential student audience.',
        perks: [
            'Dedicated Shield — Recognition of partnership through a dedicated award',
            'Social Media Acknowledgement — Brand features across ACM MAJU digital platforms',
            'Logo on Guide Book — Visible branding in the official event publication',
            'VIP Invites — 2 exclusive invites to the Opening Ceremony, Closing Ceremony & Hi-Tea',
            'Company Banner — 1 branded banner displayed within the venue',
            'Verbal Mention — Acknowledgement during both Opening and Closing ceremonies',
            'Media Coverage — Direct media spotlighting of the company during event proceedings',
        ],
    },
    {
        id: 'gold', name: 'Gold', price: 'Rs. 2,00,000',
        caption: 'Maximum brand dominance and high-frequency visibility.',
        desc: 'Our most comprehensive standard package for brands seeking total immersion across all event assets.',
        perks: [
            'All Silver Perks Included',
            'Logo on Apparel — Exclusive branding on official team & student ambassador shirts',
            'Premium Banner Placement — 6 banners strategically placed in high-traffic areas',
            'Enhanced VIP Access — 6 exclusive invites to all major ceremonies and Hi-Tea',
            'Gift Integration — Company pamphlets & products in official attendee gift bags',
            'Logo on All Posters — Brand featured on every physical & digital event poster',
        ],
    },
    {
        id: 'platinum', name: 'Platinum', price: 'Rs. 4,50,000',
        caption: 'Premium placement for high-impact brand activation.',
        desc: 'A strategic tier focused on deep engagement and significant on-site brand reinforcement.',
        perks: [
            'All Gold Perks Included',
            'Expanded Venue Presence — 4 company banners placed in key locations',
            'Expanded VIP Access — 4 exclusive invites to Opening, Closing & Hi-Tea',
            'Attendee Engagement — Products & promotional materials in attendee gifts',
            'Poster Visibility — Logo featured on all official event posters',
        ],
    },
    {
        id: 'cotitle', name: 'Co-Title Sponsor', price: 'Rs. 7,00,000',
        caption: 'Secondary naming rights and high-level brand association.',
        desc: 'Share the spotlight as a primary partner, ensuring your brand is synonymous with the event\'s success.',
        perks: [
            'Everything in Gold, plus:',
            'Category Exclusivity — No competitors from your sector permitted as sponsors',
            'Joint Branding — "[Brand Name] & ACM MAJU present Jinnah League \'26"',
            'Social Spotlight — Dedicated brand engagement zones within the Food Festival or Entertainment Social',
            'Magazine Feature — Dedicated full-page advertisement in the ACM MAJU Magazine',
        ],
        island: true,
    },
    {
        id: 'title', name: 'Title Sponsor', price: 'Rs. 10,00,000',
        caption: 'Ultimate event ownership and primary brand identity.',
        desc: 'The pinnacle of partnership, placing your brand at the very heart of Pakistan\'s premier university competition.',
        perks: [
            'Everything in Co-Title, plus:',
            'Primary Naming Rights — The event officially becomes the "[Your Brand] Jinnah League \'26"',
            'Keynote Opportunity — Exclusive speaking slot during Opening & Closing ceremonies',
            'Concert Branding — Primary stage branding for the high-energy entertainment finale',
            'Global Reach — Primary partner in all national press releases & media campaigns',
        ],
        island: true,
        topTier: true,
    },
];

const comparisonRows = [
    { benefit: 'Dedicated Shield / Award', silver: true, gold: true, platinum: true },
    { benefit: 'Social Media Acknowledgement', silver: true, gold: true, platinum: true },
    { benefit: 'Logo on Guide Book', silver: true, gold: true, platinum: true },
    { benefit: 'VIP Invites', silver: '2', gold: '6', platinum: '4' },
    { benefit: 'Company Banners', silver: '1', gold: '6', platinum: '4' },
    { benefit: 'Verbal Mention', silver: true, gold: true, platinum: true },
    { benefit: 'Media Coverage', silver: true, gold: true, platinum: true },
    { benefit: 'Logo on Apparel', silver: false, gold: true, platinum: true },
    { benefit: 'Gift Bag Integration', silver: false, gold: true, platinum: true },
    { benefit: 'Logo on All Posters', silver: false, gold: true, platinum: true },
    { benefit: 'Magazine — Sponsors Page', silver: true, gold: false, platinum: false },
    { benefit: 'Magazine — Partners Page', silver: false, gold: true, platinum: false },
    { benefit: 'Magazine — Competition Overview', silver: false, gold: false, platinum: true },
];

const Cell = ({ val }) => {
    if (val === true) return <span style={{ color: 'var(--success)' }}><Check size={18} /></span>;
    if (val === false) return <span style={{ color: 'var(--text-muted)' }}><X size={18} /></span>;
    return <span className="data-figure" style={{ fontSize: '0.9rem', color: 'var(--accent-gold)' }}>{val}</span>;
};

const Tiers = () => (
    <div className="tiers-page pt-nav">
        {/* Hero */}
        <section className="section-padding" style={{ paddingBottom: '48px' }}>
            <div className="container">
                <SectionLabel text="Sponsorship Packages" />
                <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                    Partner at Your Level
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
                    style={{ color: 'var(--text-secondary)', maxWidth: '600px', marginTop: '16px', fontSize: '1.125rem' }}
                >
                    Every tier is crafted to deliver measurable brand impact among 5,000+ attendees.
                    All amounts are PKR. <em style={{ color: 'var(--warning)', fontSize: '0.875rem' }}>Note: Amounts received from Shariah-compliant organizations will be allocated exclusively to Shariah-compliant expenses.</em>
                </motion.p>
            </div>
        </section>

        {/* Scroll Animation */}
        <ContainerScroll
            titleComponent={
                <>
                    <div className="label" style={{ marginBottom: '16px', display: 'block' }}>Sponsorship Impact</div>
                    <h2 style={{ color: 'var(--text-primary)', marginBottom: '12px', fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>
                        Your brand, front and<br />
                        <span style={{ color: 'var(--accent-gold)', fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2.5rem, 6vw, 5rem)', fontWeight: 700, lineHeight: 1 }}>
                            Centre Stage
                        </span>
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto', lineHeight: 1.7 }}>
                        From Silver to Title Sponsor — every tier guarantees measurable brand dominance.
                    </p>
                </>
            }
        >
            <img
                src="https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1400&q=80"
                alt="Sponsor brand activation at event"
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', borderRadius: '12px' }}
                draggable={false}
                loading="eager"
            />
        </ContainerScroll>

        {/* Standard 3 Tiers */}
        <section className="section-padding" style={{ paddingTop: 0 }}>
            <div className="container">
                <div className="tiers-3-grid">
                    {tiers.slice(0, 3).map((tier, i) => (
                        <motion.div
                            key={tier.id}
                            className={`tier-showcase-card tier-card ${tier.id === 'gold' ? 'highlighted' : ''}`}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.12 }}
                        >
                            {tier.id === 'gold' && <div className="popular-badge label">Most Popular</div>}
                            {/* Booth image with 3-layer animation */}
                            <div className="booth-image-wrap img-container">
                                <img
                                    src={tierImages[tier.id]}
                                    alt={`${tier.name} booth render`}
                                    loading="lazy"
                                />
                                <div className="booth-label">
                                    <span>{tierBoothLabels[tier.id]}</span>
                                </div>
                            </div>
                            <div className="tier-body">
                                <div className="label tier-badge">{tier.name}</div>
                                <div className="data-figure tier-price">{tier.price}</div>
                                <p className="tier-caption">{tier.caption}</p>
                                <p className="tier-desc">{tier.desc}</p>
                                <ul className="tier-perks">
                                    {tier.perks.map((p, j) => (
                                        <li key={j}><Check size={14} className="perk-icon" /> {p}</li>
                                    ))}
                                </ul>
                                <Link to={`/contact?tier=${tier.id}`} className={`btn ${tier.id === 'gold' ? 'btn-primary' : 'btn-outline'}`} style={{ width: '100%', marginTop: '24px', display: 'block', textAlign: 'center' }}>
                                    Select {tier.name}
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Comparison Table — Silver/Gold/Platinum only */}
                <div className="comparison-section">
                    <h3 className="label" style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.9rem' }}>Silver / Gold / Platinum: Full Comparison</h3>
                    <div className="portal-table-container">
                        <table className="portal-table comparison-table">
                            <thead>
                                <tr>
                                    <th>Benefit</th>
                                    <th style={{ textAlign: 'center' }}>Silver</th>
                                    <th style={{ textAlign: 'center', color: 'var(--accent-gold)' }}>Gold</th>
                                    <th style={{ textAlign: 'center' }}>Platinum</th>
                                </tr>
                            </thead>
                            <tbody>
                                {comparisonRows.map((row, i) => (
                                    <tr key={i}>
                                        <td>{row.benefit}</td>
                                        <td style={{ textAlign: 'center' }}><Cell val={row.silver} /></td>
                                        <td style={{ textAlign: 'center' }}><Cell val={row.gold} /></td>
                                        <td style={{ textAlign: 'center' }}><Cell val={row.platinum} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Premium Islands — Co-Title and Title */}
                <div className="islands-header">
                    <SectionLabel text="Premium Partnerships" />
                    <h2 style={{ marginTop: '8px', marginBottom: '16px' }}>Naming Rights Packages</h2>
                    <p style={{ color: 'var(--text-secondary)', maxWidth: '540px' }}>
                        For brands that want to own the event. These packages provide event-wide naming rights,
                        keynote slots, and unmatched brand dominance.
                    </p>
                </div>
                <div className="islands-grid">
                    {tiers.slice(3).map((tier, i) => (
                        <motion.div
                            key={tier.id}
                            className={`tier-island tier-card ${tier.topTier ? 'top-tier' : ''}`}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.15 }}
                        >
                            <div className="island-left">
                                {/* Island booth image with animation */}
                                <div className="booth-image-wrap img-container" style={{ height: '260px' }}>
                                    <img
                                        src={tierImages[tier.id]}
                                        alt={`${tier.name} booth render`}
                                        loading="lazy"
                                    />
                                    <div className="booth-label">
                                        <span>{tierBoothLabels[tier.id]}</span>
                                    </div>
                                </div>
                                <p className="tier-caption" style={{ marginTop: '12px', padding: '0 4px', fontSize: '0.85rem' }}>{tier.caption}</p>
                            </div>
                            <div className="island-right">
                                {tier.topTier && <div className="island-badge label">Pinnacle</div>}
                                <h2 className="island-name" style={{ color: tier.topTier ? 'var(--accent-gold)' : 'var(--text-primary)' }}>{tier.name}</h2>
                                <div className="data-figure island-price">{tier.price}</div>
                                <p className="tier-desc">{tier.desc}</p>
                                <ul className="tier-perks island-perks">
                                    {tier.perks.map((p, j) => (
                                        <li key={j}><Check size={14} className="perk-icon" /> {p}</li>
                                    ))}
                                </ul>
                                <Link to={`/contact?tier=${tier.id}`} className="btn btn-primary" style={{ marginTop: '24px', display: 'inline-block' }}>
                                    Inquire About {tier.name}
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>

            </div>
        </section>
    </div>
);

export default Tiers;
