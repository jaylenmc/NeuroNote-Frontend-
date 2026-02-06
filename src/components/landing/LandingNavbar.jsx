import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

function LandingNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Features', href: '/#features' },
    { label: 'Terms', to: '/terms' },
    { label: 'Privacy', to: '/privacy' },
  ];

  return (
    <nav
      className={`landing-navbar ${isScrolled ? 'scrolled' : ''} ${isMobileMenuOpen ? 'mobile-open' : ''}`}
    >
      <div className="landing-navbar-inner">
        <div className="landing-navbar-flex">
          <Link to="/" className="landing-navbar-logo">
            <img
              src="/NeuroNote Logo Transparent.png"
              alt="NeuroNote"
              className="landing-navbar-logo-img"
            />
          </Link>

          <div className="landing-navbar-links">
            {navItems.map((item) => (
              item.to ? (
                <Link key={item.label} to={item.to}>{item.label}</Link>
              ) : (
                <a key={item.label} href={item.href}>{item.label}</a>
              )
            ))}
          </div>

          <div className="landing-navbar-cta">
            <Link to="/signin">
              <button type="button" className="landing-btn-ghost">
                Log In
              </button>
            </Link>
            <Link to="/signin">
              <button type="button" className="landing-btn-primary-white">
                Join Waitlist
              </button>
            </Link>
          </div>

          <button
            type="button"
            className="landing-navbar-mobile-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="landing-navbar-mobile-menu">
          {navItems.map((item) => (
            item.to ? (
              <Link
                key={item.label}
                to={item.to}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ) : (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </a>
            )
          ))}
          <div className="landing-navbar-mobile-divider" />
          <Link to="/signin" onClick={() => setIsMobileMenuOpen(false)}>
            <button type="button" className="landing-btn-ghost">
              Log In
            </button>
          </Link>
          <Link to="/signin" onClick={() => setIsMobileMenuOpen(false)}>
            <button type="button" className="landing-btn-primary-white">
              Join Waitlist
            </button>
          </Link>
        </div>
      )}
    </nav>
  );
}

export default LandingNavbar;
