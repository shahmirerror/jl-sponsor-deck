import React from 'react';
import { motion } from 'framer-motion';
import { Linkedin } from 'lucide-react';
import SectionLabel from '../components/SectionLabel';
import { ContainerScroll } from '../components/ui/container-scroll-animation';
import './About.css';

const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }),
};

const directors = [
    {
        name: 'Shahmir Sindhu',
        role: 'President / Secretary General',
        photo: null,
        linkedin: 'https://www.linkedin.com/in/shahmir-sindhu/',
        desc: 'Managing core operations and communications for the Jinnah League executive board.',
    },
    {
        name: 'Abdul Rafay',
        role: 'Director of PR & Sponsorships',
        photo: '/sponsorship-deck/team/Abdul Rafay Public Relations.jpeg',
        linkedin: 'https://www.linkedin.com/in/rafay-hakeem/',
        desc: 'Leading corporate outreach and brand partnerships for Pakistan\'s premier university event.',
    },
    {
        name: 'Atta Ur Rehman',
        role: 'Treasurer',
        photo: '/sponsorship-deck/team/Atta Ur Rehman Treasurar.jpeg',
        linkedin: 'https://www.linkedin.com/in/atta-ur-rehman-8b8b5632a/',
        desc: 'Ensuring financial transparency and resource management for all event festivities.',
    },
    {
        name: 'Muzna Moin',
        role: 'Director of Marketing',
        photo: '/sponsorship-deck/team/Muzna Moin Marketing.jpeg',
        linkedin: 'https://www.linkedin.com/in/muzna-moin-083281331/',
        desc: 'Designing high-impact promotional strategies to reach over 5,000+ national participants.',
    },
    {
        name: 'Mahnoor Sohail',
        role: 'Director of Social Media',
        photo: '/sponsorship-deck/team/Mahnoor Sohail Social Media.jpeg',
        linkedin: 'https://www.linkedin.com/in/mahnoor-sohail-b49913337/',
        desc: 'Amplifying digital reach and engagement across all Jinnah League social channels.',
    },
    {
        name: 'Love Maheshwari',
        role: 'Director of Event Management',
        photo: '/sponsorship-deck/team/Love Maheshwari EM.jpeg',
        linkedin: 'https://www.linkedin.com/in/love-kumar-maheshwari-90484a309/',
        desc: 'Overseeing the logistics of the two-day summit, including competitions and the food festival.',
    },
    {
        name: 'Areeba Kalwar',
        role: 'Director of Code Club',
        photo: '/sponsorship-deck/team/Areeba Kalwar Code Club.jpeg',
        linkedin: 'https://www.linkedin.com/in/reebayk/',
        desc: 'Orchestrating elite technical challenges like "Full Stack Frenzy" and "Code in the Dark".',
    },
    {
        name: 'Abdul Sami',
        role: 'Director of Gamerz Den',
        photo: '/sponsorship-deck/team/Syed Sami Gamerz Den.jpeg',
        linkedin: 'https://www.linkedin.com/in/syed-abdul-sami-ali-b30678332/',
        desc: 'Managing high-stakes e-sports tournaments featuring titles like Valorant and Tekken 8.',
    },
];

const About = () => (
    <div className="about-page pt-nav">
        {/* Header */}
        <section className="section-padding" style={{ paddingBottom: '64px' }}>
            <div className="container">
                <SectionLabel text="The Team" />
                <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                    Meet the Visionaries Behind Jinnah League '26
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }}
                    className="about-desc"
                >
                    Our executive committee is a dedicated group of student leaders at ACM MAJU driven by a mission
                    to bridge the gap between academic theory and real-world technological applications. We are
                    committed to fostering a community of innovation, excellence, and collaborative growth within
                    Pakistan's tech and gaming landscape.
                </motion.p>
            </div>
        </section>

        {/* Scroll Animation */}
        <ContainerScroll
            titleComponent={
                <>
                    <div className="label" style={{ marginBottom: '16px', display: 'block' }}>The People</div>
                    <h2 style={{ color: 'var(--text-primary)', marginBottom: '12px', fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>
                        Student leaders building<br />
                        <span style={{ color: 'var(--accent-gold)', fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2.5rem, 6vw, 5rem)', fontWeight: 700, lineHeight: 1 }}>
                            Pakistan's Future
                        </span>
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto', lineHeight: 1.7 }}>
                        8 directors. One vision. A two-day summit that bridges academia and industry.
                    </p>
                </>
            }
        >
            <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1400&q=80"
                alt="Team collaboration"
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', borderRadius: '12px' }}
                draggable={false}
                loading="eager"
            />
        </ContainerScroll>

        {/* Directors Grid */}
        <section className="section-padding" style={{ paddingTop: 0 }}>
            <div className="container">
                <div className="directors-grid">
                    {directors.map((d, i) => (
                        <motion.div
                            key={d.name}
                            className="director-card card"
                            custom={i}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: '-60px' }}
                            variants={fadeUp}
                        >
                            <div className="director-photo-wrap img-container">
                                {d.photo ? (
                                    <img
                                        src={d.photo}
                                        alt={d.name}
                                        className="director-headshot"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="director-photo-fallback">
                                        <span>{d.name.split(' ').map(n => n[0]).join('')}</span>
                                    </div>
                                )}
                                <div className="director-hover-overlay">
                                    <div className="director-hover-name">{d.name}</div>
                                    <div className="director-hover-role">{d.role}</div>
                                </div>
                            </div>
                            <div className="director-info">
                                <h3 className="director-name">{d.name}</h3>
                                <div className="label director-role" style={{ color: 'var(--accent-gold)', marginTop: '6px' }}>{d.role}</div>
                                <p className="director-desc">{d.desc}</p>
                                <a href={d.linkedin} target="_blank" rel="noopener noreferrer" className="linkedin-link">
                                    <Linkedin size={16} /> LinkedIn Profile
                                </a>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    </div>
);

export default About;
