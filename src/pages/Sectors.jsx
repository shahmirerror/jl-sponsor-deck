import React, { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Card from '../components/Card';
import SectionLabel from '../components/SectionLabel';
import './SectorsBase.css';

const sectorsData = [
    {
        id: 'banking', name: 'Banking & Finance',
        pitch: 'Financial institutions gain direct access to over 1,000 future account holders and graduates entering the workforce who are actively seeking digital banking solutions and professional financial products.',
        benefits: [
            'Exclusive branding at high-stakes award ceremonies where cash prizes are distributed to winners.',
            'Direct recruitment pipeline through a dedicated presence at our on-site career fair.',
            'Association with a reputable, high-energy event that builds trust and long-term loyalty with Gen Z.',
        ],
    },
    {
        id: 'tech', name: 'Technology & IT Partners',
        pitch: 'Position your brand at the heart of Pakistan\'s tech evolution by powering the infrastructure and hardware that fuels nine epic competitions.',
        benefits: [
            'Hands-on product demonstration opportunities with a digitally savvy audience of 1,000+ tech enthusiasts.',
            'Priority access to top-tier technical talent at the career fair for specialized IT roles.',
            'Brand integration into tech talks that highlight advancements in the computing landscape.',
        ],
    },
    {
        id: 'software', name: 'Software Houses',
        pitch: 'Connect with the next generation of developers and engineers by sponsoring elite coding challenges like "Full Stack Frenzy" and "Code in the Dark."',
        benefits: [
            'Exclusive naming rights or branding for specific software-based competitions.',
            'Direct talent scouting at the career fair to identify proficient full-stack and competitive programmers.',
            'Full-page feature in the ACM MAJU magazine, highly regarded in the IT community.',
        ],
    },
    {
        id: 'bpo', name: 'BPOs (Business Process Outsourcing)',
        pitch: 'BPOs can tap into a massive pool of multi-talented undergraduate students looking for career pathways and dynamic professional environments.',
        benefits: [
            'High-volume brand visibility through social media promotions reaching thousands of young professionals.',
            'Large-scale recruitment opportunities at the career fair to fill diverse operational and technical roles.',
            'VIP networking access to academic and student leaders during the Hi-Tea and Closing Socials.',
        ],
    },
    {
        id: 'property', name: 'Property & Real Estate',
        pitch: 'Elevate your corporate prestige by aligning with a premier inter-university event attended by high-potential youth and influential faculty members.',
        benefits: [
            'Strategic banner placement in high-traffic venue zones to establish long-term brand recall.',
            'Engagement with future high-net-worth individuals at our career fair and networking zones.',
            'Public acknowledgment during the Closing Ceremony, attended by over 1,000 participants.',
        ],
    },
    {
        id: 'auto', name: 'Car Dealerships & Automotive',
        pitch: 'Showcase your latest models to an ambitious, brand-conscious audience of students and young professionals seeking lifestyle-enhancing experiences.',
        benefits: [
            'Prime on-site activation space for vehicle displays or interactive brand booths.',
            'Brand exposure at our career fair to attract engineering and management talent for the automotive sector.',
            'Inclusion in high-production event highlight reels shared across extensive social media channels.',
        ],
    },
    {
        id: 'health', name: 'Healthcare & Pharma',
        pitch: 'Demonstrate corporate social responsibility and community support by investing in the health and future of the nation\'s student population.',
        benefits: [
            'Branded engagement zones or health-focused activation points during the two-day festival.',
            'Direct access to biomedical and management students at the career fair for recruitment.',
            'Logo placement on official team shirts and student ambassador apparel.',
        ],
    },
    {
        id: 'edu', name: 'Education & EdTech',
        pitch: 'As an educational event, Jinnah League is the perfect platform to promote advanced certifications, postgraduate programs, and learning tools.',
        benefits: [
            'Direct integration into the event\'s "tech talks" to share knowledge and foster technical awareness.',
            'Dedicated stall at the career fair to engage students seeking further education or career coaching.',
            'Advertising space in the prestigious ACM MAJU magazine distributed to the tech community.',
        ],
    },
    {
        id: 'retail', name: 'Retail & FMCG',
        pitch: 'Capture the undivided attention of over 1,000 consumers during our vibrant Food Festival and high-energy gaming tournaments.',
        benefits: [
            'Sampling and direct sales opportunities through branded stalls or product placement in attendee gift bags.',
            'Brand visibility at the career fair to attract creative, marketing, and supply chain talent.',
            'Social media "shout-outs" and "spotlights" during the event\'s peak engagement periods.',
        ],
    },
    {
        id: 'media', name: 'Media & PR',
        pitch: 'Partner with us to showcase your coverage capabilities at an event that generates nearly 500K views and exponential social media growth.',
        benefits: [
            'Co-branding opportunities on all official event posters and digital media assets.',
            'Recruitment of media and communications specialists through our on-site career fair.',
            'VIP backstage and interview access during the Closing Concert and awards ceremonies.',
        ],
    },
];

const Sectors = () => {
    const { hash } = useLocation();
    useEffect(() => {
        if (hash) {
            const el = document.getElementById(hash.substring(1));
            if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
        } else window.scrollTo(0, 0);
    }, [hash]);

    return (
        <div className="sectors-page pt-nav">
            <div className="section-padding" style={{ paddingBottom: '48px', background: 'var(--bg-primary)' }}>
                <div className="container">
                    <SectionLabel text="Industries" />
                    <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                        Find Your Industry, Make Your Impact
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                        style={{ color: 'var(--text-secondary)', maxWidth: '600px', marginTop: '16px', fontSize: '1.125rem' }}
                    >
                        We approach sponsors across every major industry — find your sector and discover the tailored value we bring to your brand through direct engagement with over 1,000 ambitious attendees.
                    </motion.p>
                </div>
            </div>

            {sectorsData.map((sector, index) => (
                <section
                    key={sector.id}
                    id={sector.id}
                    className={`sector-section section-padding ${index % 2 !== 0 ? 'bg-secondary' : ''}`}
                >
                    <div className="container">
                        <div className="sector-header" style={{ marginBottom: '40px' }}>
                            <SectionLabel text={sector.name} />
                            <h2 style={{ marginTop: '8px', marginBottom: '16px' }}>{sector.name} Partnerships</h2>
                            <p style={{ color: 'var(--text-secondary)', maxWidth: '640px', fontSize: '1.05rem' }}>{sector.pitch}</p>
                        </div>

                        <div className="grid-3 mb-8">
                            {sector.benefits.map((b, i) => (
                                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                                    <Card>
                                        <div style={{ fontSize: '1.75rem', marginBottom: '16px' }}>{['🏆', '🤝', '📈'][i]}</div>
                                        <h4 style={{ marginBottom: '12px' }}>{['Brand Impact', 'Direct Access', 'Measurable ROI'][i]}</h4>
                                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{b}</p>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>

                        <div style={{ marginTop: '32px' }}>
                            <Link to={`/contact?sector=${sector.id}`} className="btn btn-primary">Express Interest →</Link>
                        </div>
                    </div>
                </section>
            ))}
        </div>
    );
};

export default Sectors;
