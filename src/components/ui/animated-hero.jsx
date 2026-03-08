import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MoveRight } from "lucide-react";
import { Link } from "react-router-dom";

/* ─── Countdown Timer Component ─── */
function CountdownTimer({ targetDate }) {
    const [timeLeft, setTimeLeft] = useState(calcTimeLeft());

    function calcTimeLeft() {
        const diff = new Date(targetDate) - new Date();
        if (diff <= 0) return null;
        return {
            days: Math.floor(diff / (1000 * 60 * 60 * 24)),
            hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((diff / (1000 * 60)) % 60),
            seconds: Math.floor((diff / 1000) % 60),
        };
    }

    useEffect(() => {
        const id = setInterval(() => setTimeLeft(calcTimeLeft()), 1000);
        return () => clearInterval(id);
    }, []);

    const pad = (n) => String(n).padStart(2, '0');

    return (
        <div className="countdown-timer" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginTop: '32px',
        }}>
            {/* Label above timer */}
            <div style={{
                fontFamily: 'Syne, sans-serif',
                fontWeight: 600,
                fontSize: '0.72rem',
                textTransform: 'uppercase',
                letterSpacing: '0.14em',
                color: '#8A95A3',
                marginBottom: '12px',
            }}>
                Jinnah League '26 Begins In
            </div>

            {timeLeft === null ? (
                <div style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontStyle: 'italic',
                    fontSize: '1.5rem',
                    color: '#C9A84C',
                    padding: '20px 40px',
                    background: 'rgba(20, 28, 40, 0.85)',
                    border: '1px solid #1E2D40',
                }}>
                    The Event Has Begun
                </div>
            ) : (
                <div style={{
                    display: 'flex',
                    alignItems: 'stretch',
                    background: 'rgba(20, 28, 40, 0.85)',
                    border: '1px solid #1E2D40',
                    borderRadius: 0,
                }}>
                    {[
                        { value: pad(timeLeft.days), label: 'DAYS' },
                        { value: pad(timeLeft.hours), label: 'HOURS' },
                        { value: pad(timeLeft.minutes), label: 'MINUTES' },
                        { value: pad(timeLeft.seconds), label: 'SECONDS' },
                    ].map((unit, i) => (
                        <>
                            <div key={unit.label} style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                padding: '20px 28px',
                                borderTop: '2px solid #C9A84C',
                            }}>
                                <span style={{
                                    fontFamily: 'JetBrains Mono, monospace',
                                    fontWeight: 700,
                                    fontSize: '2.5rem',
                                    color: '#C9A84C',
                                    lineHeight: 1,
                                    marginBottom: '6px',
                                    letterSpacing: '-0.02em',
                                }}>
                                    {unit.value}
                                </span>
                                <span style={{
                                    fontFamily: 'Syne, sans-serif',
                                    fontWeight: 600,
                                    fontSize: '0.65rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.15em',
                                    color: '#8A95A3',
                                }}>
                                    {unit.label}
                                </span>
                            </div>
                            {/* Colon separator between blocks (not after last) */}
                            {i < 3 && (
                                <div key={`sep-${i}`} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '0 4px',
                                    fontFamily: 'JetBrains Mono, monospace',
                                    fontWeight: 700,
                                    fontSize: '1.8rem',
                                    color: '#C9A84C',
                                    opacity: 0.6,
                                    paddingTop: '2px',
                                }}>
                                    :
                                </div>
                            )}
                        </>
                    ))}
                </div>
            )}
        </div>
    );
}

/* ─── Hero Component ─── */
function Hero() {
    const [titleNumber, setTitleNumber] = useState(0);
    const titles = useMemo(
        () => ["innovative", "inspiring", "nationwide", "elite", "legendary"],
        []
    );

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (titleNumber === titles.length - 1) {
                setTitleNumber(0);
            } else {
                setTitleNumber(titleNumber + 1);
            }
        }, 2000);
        return () => clearTimeout(timeoutId);
    }, [titleNumber, titles]);

    return (
        <div style={{ width: '100%', background: 'var(--bg-primary)' }}>
            <div className="container">
                <div style={{
                    display: 'flex',
                    gap: '32px',
                    padding: '80px 0 120px',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                }}>

                    {/* Launch badge */}
                    <div>
                        <button className="hero-badge-btn">
                            Read our sponsorship deck <MoveRight style={{ width: '14px', height: '14px', display: 'inline', verticalAlign: 'middle' }} />
                        </button>
                    </div>

                    {/* Headline */}
                    <div style={{ display: 'flex', gap: '16px', flexDirection: 'column' }}>
                        <h1 style={{
                            fontSize: 'clamp(2.5rem, 7vw, 5rem)',
                            maxWidth: '42rem',
                            letterSpacing: '-0.04em',
                            textAlign: 'center',
                            fontWeight: 400,
                            lineHeight: 1.1,
                            color: 'var(--text-primary)',
                            margin: 0,
                        }}>
                            <span style={{ color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif' }}>
                                Jinnah League '26 is
                            </span>
                            {/* Animated word container */}
                            <span style={{
                                position: 'relative',
                                display: 'flex',
                                width: '100%',
                                justifyContent: 'center',
                                overflow: 'hidden',
                                textAlign: 'center',
                                paddingBottom: '8px',
                                paddingTop: '4px',
                                height: 'clamp(3rem, 8vw, 6rem)',
                            }}>
                                &nbsp;
                                {titles.map((title, index) => (
                                    <motion.span
                                        key={index}
                                        style={{
                                            position: 'absolute',
                                            fontWeight: 700,
                                            fontFamily: 'Cormorant Garamond, serif',
                                            color: 'var(--accent-gold)',
                                            fontSize: 'clamp(2.5rem, 7vw, 5rem)',
                                        }}
                                        initial={{ opacity: 0, y: "-100%" }}
                                        transition={{ type: "spring", stiffness: 50 }}
                                        animate={
                                            titleNumber === index
                                                ? { y: 0, opacity: 1 }
                                                : { y: titleNumber > index ? -150 : 150, opacity: 0 }
                                        }
                                    >
                                        {title}
                                    </motion.span>
                                ))}
                            </span>
                        </h1>

                        <p style={{
                            fontSize: 'clamp(1rem, 2vw, 1.2rem)',
                            lineHeight: 1.7,
                            letterSpacing: '-0.01em',
                            color: 'var(--text-secondary)',
                            maxWidth: '42rem',
                            textAlign: 'center',
                            margin: '0 auto',
                        }}>
                            Pakistan's premier university competition &amp; concert — two days, 5,000+
                            students, 9 elite competitions. Put your brand at the centre of the next
                            generation of tech and gaming leaders.
                        </p>
                    </div>

                    {/* Single animated CTA button */}
                    <Link to="/contact" className="btn-sponsor">
                        BECOME A SPONSOR <MoveRight style={{ width: '16px', height: '16px', display: 'inline', verticalAlign: 'middle', marginLeft: '10px' }} />
                    </Link>

                    {/* Countdown Timer */}
                    <CountdownTimer targetDate="2026-04-15T09:00:00" />

                </div>
            </div>
        </div>
    );
}

export { Hero };
