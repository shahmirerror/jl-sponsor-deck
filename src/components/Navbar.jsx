import { useState, useEffect } from 'react';
import { Link, useLocation, NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setMenuOpen(false);
    }, [location]);

    const navLinks = [
        { to: '/about', label: 'About' },
        { to: '/sectors', label: 'Sectors' },
        { to: '/tiers', label: 'Packages' },
        { to: '/career-fair', label: 'Career Fair' },
        { to: '/events', label: 'Events' },
        { to: '/partners', label: 'Partners' },
        { to: '/previous-sponsors', label: 'Alumni' },
        { to: '/social-insights', label: 'Reach' },
        { to: '/contact', label: 'Contact' },
    ];

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''} ${menuOpen ? 'menu-open' : ''}`}>
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    <img
                        src="/sponsorship-deck/misc/acm-logo-transparent.png"
                        alt="ACM MAJU"
                        className="navbar-logo-img"
                        loading="eager"
                    />
                </Link>

                {/* Desktop Links */}
                <ul className="navbar-links">
                    {navLinks.map(link => (
                        <li key={link.to}>
                            <NavLink to={link.to} className={({ isActive }) => isActive ? 'active' : ''}>
                                {link.label}
                            </NavLink>
                        </li>
                    ))}
                </ul>

                <div className="navbar-cta">
                    <Link to="/portal" className="btn-portal-link">Portal</Link>
                    <Link to="/contact" className="btn btn-primary">Become a Sponsor</Link>
                </div>

                {/* Hamburger */}
                <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
                    {menuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Drawer */}
            <div className={`mobile-drawer ${menuOpen ? 'open' : ''}`}>
                <ul className="mobile-links">
                    {navLinks.map(link => (
                        <li key={link.to}>
                            <Link to={link.to}>{link.label}</Link>
                        </li>
                    ))}
                </ul>
                <Link to="/contact" className="btn btn-primary mobile-cta">Become a Sponsor</Link>
            </div>
            {menuOpen && <div className="drawer-overlay" onClick={() => setMenuOpen(false)} />}
        </nav>
    );
};

export default Navbar;
