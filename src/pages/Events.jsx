import React from 'react';
import { motion } from 'framer-motion';
import SectionLabel from '../components/SectionLabel';
import { ContainerScroll } from '../components/ui/container-scroll-animation';

// Past full events — Jinnah League editions
// Available: 1.png, 2.png, 3.png, 4.png, DSC_0880.JPG, DSC_1031.JPG (from JL24 Highlights)
const events = [
    {
        name: "Jinnah League '24", year: '2024', attendees: '1,059', sponsors: 'PKR 270K',
        highlight: 'National reach with 9 competitions, a food festival, and a PKR 270,000 prize pool.',
        photo: '/sponsorship-deck/events/DSC_0880.JPG',
        side: 'right',
    },
    {
        name: "Jinnah League '23", year: '2023', attendees: '585', sponsors: 'PKR 150K',
        highlight: 'Expanded to an inter-university format across Karachi with 11 competitions.',
        photo: '/sponsorship-deck/events/2.png',
        side: 'left',
    },
    {
        name: "Jinnah League '22", year: '2022', attendees: '156', sponsors: 'PKR 40K',
        highlight: "The founding edition: MAJU's first gaming festival with 4 tournaments.",
        photo: '/sponsorship-deck/events/3.png',
        side: 'right',
    },
];

// Sub-events — student week activities
// Available from student-week: DSC_0180(ACMFiesta), DSC_0536..DSC_0582(Survival), DSC_2338(ACMFiesta2)
const subEvents = [
    {
        name: 'Survival League',
        desc: 'High-stakes tournaments for Counter Strike 2, Valorant, and EA FC 25.',
        day: 'Day 1 & 2',
        photo: '/sponsorship-deck/student-week/DSC_0536.JPG',
        side: 'right',
    },
    {
        name: 'Final Boss Challenge 2.0',
        desc: 'Event held at the very start of Spring Semester with 5+ competitions.',
        day: 'Day 1',
        photo: '/sponsorship-deck/student-week/DSC_0570.JPG',
        side: 'left',
    },
    {
        name: 'Final Boss Challenge',
        desc: 'Event held at the very start of Fall Semester with 5+ competitions.',
        day: 'Day 2',
        photo: '/sponsorship-deck/student-week/DSC_0582.JPG',
        side: 'right',
    },
    {
        name: 'ACM Fiesta',
        desc: 'Event held at the very start of Spring Semester in 2024 with 5+ competitions.',
        day: 'Day 2',
        photo: '/sponsorship-deck/student-week/DSC_0180.JPG',
        side: 'left',
    },
];

const cumulativeStats = [
    { value: '1,800', label: 'Total Participants' },
    { value: 'PKR 460K', label: 'Total Prize Pool' },
    { value: '24', label: 'Total Competitions' },
    { value: 'Nationwide', label: 'Event Reach' },
];

const Events = () => (
    <div className="events-page pt-nav">
        {/* Hero */}
        <section className="section-padding" style={{ paddingBottom: '48px' }}>
            <div className="container">
                <SectionLabel text="Legacy" />
                <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    A Legacy of Innovation and Excellence
                </motion.h1>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                    style={{ color: 'var(--text-secondary)', maxWidth: '640px', marginTop: '16px', fontSize: '1.1rem' }}>
                    Each year, ACM MAJU delivers one of Karachi's most anticipated student-run tech summits, consistently scaling our reach and ambition to bridge the gap between academic theory and industry reality.
                </motion.p>
            </div>
        </section>

        {/* Scroll Animation */}
        <ContainerScroll
            titleComponent={
                <>
                    <div className="label" style={{ marginBottom: '16px', display: 'block' }}>Our Legacy</div>
                    <h2 style={{ color: 'var(--text-primary)', marginBottom: '12px', fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>
                        Three editions. One<br />
                        <span style={{ color: 'var(--accent-gold)', fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2.5rem, 6vw, 5rem)', fontWeight: 700, lineHeight: 1 }}>
                            Relentless Mission
                        </span>
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto', lineHeight: 1.7 }}>
                        1,800 participants · PKR 460K total prize pool · Nationwide growth
                    </p>
                </>
            }
        >
            <img
                src="/sponsorship-deck/events/DSC_1031.JPG"
                alt="Jinnah League event crowd"
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', borderRadius: '12px' }}
                draggable={false}
                loading="eager"
            />
        </ContainerScroll>

        {/* Past Events Timeline */}
        <section className="section-padding" style={{ paddingTop: 0 }}>
            <div className="container">
                <h3 className="section-sub-h3">Annual Events</h3>
                <div className="events-timeline">
                    {events.map((ev, i) => (
                        <motion.div
                            key={ev.name}
                            className={`event-row ${ev.side === 'left' ? 'photo-left' : 'photo-right'}`}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                        >
                            {/* Event Photo with hover + gradient overlay + year badge */}
                            <div className="event-photo-wrap img-container">
                                <img
                                    src={ev.photo}
                                    alt={ev.name}
                                    className="event-img"
                                    loading="lazy"
                                />
                                <div className="event-gradient-overlay" />
                                <div className="event-year-badge">{ev.year}</div>
                            </div>
                            <div className="event-info">
                                <div className="label event-year">{ev.year}</div>
                                <h2 style={{ marginBottom: '12px' }}>{ev.name}</h2>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>{ev.highlight}</p>
                                <div className="event-meta-grid" style={{ marginTop: '24px' }}>
                                    <div><div className="data-figure" style={{ color: 'var(--accent-gold)', fontSize: '1.5rem' }}>{ev.attendees}</div><div className="label">Attendees</div></div>
                                    <div><div className="data-figure" style={{ color: 'var(--accent-gold)', fontSize: '1.5rem' }}>{ev.sponsors}</div><div className="label">Prize Pool</div></div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>

        {/* Sub Events */}
        <section className="section-padding" style={{ background: 'var(--bg-secondary)' }}>
            <div className="container">
                <SectionLabel text="Events in Past Years" />
                <h2 style={{ marginBottom: '48px', marginTop: '8px' }}>Key Competitions & Socials</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '48px', maxWidth: '560px', marginTop: '-32px' }}>Key competitions and socials held during our two-day summits.</p>
                <div className="sub-events-timeline">
                    {subEvents.map((ev, i) => (
                        <motion.div
                            key={ev.name}
                            className={`sub-event-row ${ev.side === 'left' ? 'photo-left' : 'photo-right'}`}
                            initial={{ opacity: 0, x: ev.side === 'left' ? -30 : 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <div className="sub-event-photo-wrap img-container">
                                <img
                                    src={ev.photo}
                                    alt={ev.name}
                                    className="sub-event-img"
                                    loading="lazy"
                                />
                                <div className="event-gradient-overlay" />
                            </div>
                            <div className="sub-event-info">
                                <div className="label" style={{ marginBottom: '8px' }}>{ev.day}</div>
                                <h3>{ev.name}</h3>
                                <p style={{ color: 'var(--text-secondary)', marginTop: '12px' }}>{ev.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>

        {/* Cumulative Stats */}
        <section className="stats-bar" style={{ padding: '64px 0' }}>
            <div className="container stats-grid">
                {cumulativeStats.map((s, i) => (
                    <motion.div key={i} className="stat-item" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                        <span className="data-figure stat-value">{s.value}</span>
                        <span className="label stat-label">{s.label}</span>
                    </motion.div>
                ))}
            </div>
        </section>
    </div>
);

export default Events;
