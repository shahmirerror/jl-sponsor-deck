import React from 'react';
import Link from 'next/link';
import { Instagram, Linkedin, Facebook, Youtube } from 'lucide-react';

const Footer = () => {
    const year = new Date().getFullYear();

    return (
        <footer className="site-footer">
            {/* ─── ROW 1: Main Body ─── */}
            <div className="footer-body">
                <div className="container footer-grid-4">

                    {/* Column 1 — Brand */}
                    <div className="footer-col">
                        <Link href="/" className="footer-brand-logo">
                            <img
                                src="/sponsorship-deck/misc/acm-logo-transparent.png"
                                alt="ACM MAJU"
                                className="footer-brand-img"
                                loading="lazy"
                            />
                        </Link>
                        <p className="footer-tagline">
                            Pakistan&apos;s premier inter-university tech and gaming festival. Bigger. Bolder. Better.
                        </p>
                        <div className="footer-socials">
                            <a href="https://www.instagram.com/acmmaju" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="footer-social-icon">
                                <Instagram size={20} />
                            </a>
                            <a href="https://www.linkedin.com/company/acmmaju" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="footer-social-icon">
                                <Linkedin size={20} />
                            </a>
                            <a href="https://www.facebook.com/AcmMajuStudentChapter" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="footer-social-icon">
                                <Facebook size={20} />
                            </a>
                            <a href="https://www.youtube.com/@acmmaju" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="footer-social-icon">
                                <Youtube size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Column 2 — Navigation */}
                    <div className="footer-col">
                        <h4 className="footer-col-heading">Quick Links</h4>
                        <ul className="footer-links">
                            <li><Link href="/">Home</Link></li>
                            <li><Link href="/about">About Us</Link></li>
                            <li><a href="https://www.jinnahleague.com/jl26" target="_blank" rel="noopener noreferrer">JL&apos;26</a></li>
                            <li><Link href="/tiers">Sponsorship Tiers</Link></li>
                            <li><Link href="/sectors">Sectors</Link></li>
                            <li><Link href="/events">Legacy</Link></li>
                        </ul>
                    </div>

                    {/* Column 3 — Resources */}
                    <div className="footer-col">
                        <h4 className="footer-col-heading">Resources</h4>
                        <ul className="footer-links">
                            <li><Link href="/career-fair">Career Fair</Link></li>
                            <li><Link href="/previous-sponsors">Sponsor History</Link></li>
                            <li><Link href="/social-insights">Social Media Insights</Link></li>
                            <li><a href="https://www.jinnahleague.com/media" target="_blank" rel="noopener noreferrer">Media &amp; Press</a></li>
                        </ul>
                    </div>

                    {/* Column 4 — Contact + Map */}
                    <div className="footer-col">
                        <h4 className="footer-col-heading">Get In Touch</h4>
                        <div className="footer-contact-items">
                            <div className="footer-contact-item">
                                <span className="footer-contact-label">Email</span>
                                <a href="mailto:acm@jinnah.edu" className="footer-contact-value">acm@jinnah.edu</a>
                            </div>
                            <div className="footer-contact-item">
                                <span className="footer-contact-label">Phone</span>
                                <span className="footer-contact-value">+92 349 0833806</span>
                            </div>
                        </div>

                        {/* Map */}
                        {/* <div className="footer-map-block">
                            <div className="footer-map-label">Find Us</div>
                            <iframe
                                title="Mohammad Ali Jinnah University"
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3619.538534614766!2d67.06472397463376!3d24.86721534417737!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3eb33f0b8a7dc987%3A0x5a6b35e9574d3741!2sMohammad%20Ali%20Jinnah%20University%20Karachi!5e0!3m2!1sen!2spk!4v1709500000000!5m2!1sen!2spk"
                                width="100%"
                                height="180"
                                style={{ border: 0, borderTop: '1px solid #1E2D40', display: 'block' }}
                                allowFullScreen=""
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            />
                        </div> */}

                        <Link href="/contact" className="footer-cta-btn">Become a Sponsor</Link>
                    </div>

                </div>
            </div>

            {/* ─── ROW 2: Divider ─── */}
            <div className="footer-divider" />

            {/* ─── ROW 3: Bottom Bar ─── */}
            <div className="footer-bottom-bar">
                <div className="container footer-bottom-inner">
                    <span className="footer-bottom-copy">
                        &copy; {year} ACM MAJU Jinnah League. All rights reserved.
                    </span>
                    <span className="footer-bottom-uni">
                        Mohammad Ali Jinnah University, Karachi
                    </span>
                    <span className="footer-bottom-credit">
                        <Link href="/terms" className="footer-credit-link">Terms</Link>
                        {' '}•{' '}
                        <Link href="/privacy" className="footer-credit-link">Privacy</Link>
                    </span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
