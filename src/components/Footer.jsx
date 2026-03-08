import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Linkedin, Facebook } from 'lucide-react';
import './Footer.css';

const Footer = () => {
    const year = new Date().getFullYear();

    return (
        <footer className="site-footer">
            {/* ─── ROW 1: Main Body ─── */}
            <div className="footer-body">
                <div className="container footer-grid-4">

                    {/* Column 1 — Brand */}
                    <div className="footer-col">
                        <Link to="/" className="footer-brand-logo">
                            <span className="footer-acm">ACM</span>
                            <span className="footer-dot">·</span>
                            <span className="footer-maju">MAJU</span>
                        </Link>
                        <p className="footer-tagline">
                            Elite sponsorship management for Pakistan's premier university competition &amp; concert.
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
                        </div>
                    </div>

                    {/* Column 2 — Navigation */}
                    <div className="footer-col">
                        <h4 className="footer-col-heading">Navigation</h4>
                        <ul className="footer-links">
                            <li><Link to="/">Home</Link></li>
                            <li><Link to="/about">About Us</Link></li>
                            <li><Link to="/tiers">Sponsorship Tiers</Link></li>
                            <li><Link to="/sectors">Sectors</Link></li>
                            <li><Link to="/career-fair">Career Fair</Link></li>
                            <li><Link to="/contact">Contact</Link></li>
                        </ul>
                    </div>

                    {/* Column 3 — Resources */}
                    <div className="footer-col">
                        <h4 className="footer-col-heading">Resources</h4>
                        <ul className="footer-links">
                            <li><Link to="/previous-sponsors">Previous Sponsors</Link></li>
                            <li><Link to="/events">Previous Events</Link></li>
                            <li><Link to="/social-insights">Social Media Insights</Link></li>
                            <li><Link to="/portal">Sponsor Portal</Link></li>
                            <li><Link to="/sponsor-portal">Partner Portal</Link></li>
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
                        <div className="footer-map-block">
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
                        </div>

                        <Link to="/contact" className="footer-cta-btn">Become a Sponsor</Link>
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
                        Designed &amp; Developed by{' '}
                        <a
                            href="https://www.linkedin.com/in/rafay-hakeem/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="footer-credit-link"
                        >
                            Abdul Rafay
                        </a>
                    </span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
