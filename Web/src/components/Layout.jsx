import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useSiteMotion } from '../hooks/useSiteMotion';
import { AuthModal } from './AuthModal';

const LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/shop', label: 'Shop' },
  { to: '/about', label: 'About Us' },
  { to: '/contact', label: 'Contact Us' },
  { to: '/cart', label: 'Cart' },
];

function Mark() {
  return (
    <svg className="logo-mark" viewBox="0 0 32 32" aria-hidden="true">
      <path d="M16 3 27 12.2 16 29 5 12.2Z" fill="currentColor" opacity="0.9" />
      <path d="M16 3 20.5 12.2 16 29 11.5 12.2Z" fill="#d4bc84" />
    </svg>
  );
}

export function Layout() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { count } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const homeTop = location.pathname === '/' && !scrolled && !menuOpen;

  useSiteMotion(location.pathname);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setAccountOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="site">
      <a className="skip" href="#main">Skip to content</a>
      <div className="scroll-progress" data-scroll-progress aria-hidden="true" />
      <header className={homeTop ? 'site-header is-clear' : 'site-header is-solid'}>
        <div className="header-inner">
          <Link to="/" className="logo" aria-label="SapphireSpinels home">
            <Mark />
            <span>SapphireSpinels</span>
          </Link>
          <button
            type="button"
            className="nav-toggle"
            aria-expanded={menuOpen}
            aria-controls="site-nav"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? 'Close' : 'Menu'}
          </button>
          <nav id="site-nav" className={menuOpen ? 'site-nav is-open' : 'site-nav'} aria-label="Primary">
            {LINKS.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.end} className={({ isActive }) => (isActive ? 'is-active' : undefined)}>
                {link.label}
                {link.to === '/cart' && count > 0 ? <span className="cart-count">{count}</span> : null}
              </NavLink>
            ))}
          </nav>
          <div className="header-account">
            <span className="header-rule" aria-hidden="true" />
            {user ? (
              <div className="account-menu">
                <button
                  type="button"
                  className="login-button"
                  aria-haspopup="menu"
                  aria-expanded={accountOpen}
                  onClick={() => setAccountOpen((open) => !open)}
                >
                  <span className="avatar" aria-hidden="true">{user.name.slice(0, 1).toUpperCase()}</span>
                  <span className="login-label">{user.name.split(' ')[0]}</span>
                </button>
                {accountOpen ? (
                  <div className="account-pop" role="menu">
                    <p>{user.email}</p>
                    <button type="button" role="menuitem" onClick={() => { logout(); setAccountOpen(false); }}>
                      Log out
                    </button>
                  </div>
                ) : null}
              </div>
            ) : (
              <button type="button" className="login-button" onClick={() => setAuthOpen(true)}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="8" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M5 19.2c1.4-3 3.8-4.4 7-4.4s5.6 1.4 7 4.4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
                <span className="login-label">Log in</span>
              </button>
            )}
          </div>
        </div>
      </header>
      <main id="main" className={location.pathname === '/' ? 'home-main' : 'page-main'}>
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="wrap footer-grid">
          <div>
            <p className="logo footer-logo"><Mark /> SapphireSpinels</p>
            <p>A house for Sri Lankan gemstones, with a desk in Ratnapura and a viewing room in Colombo.</p>
          </div>
          <div>
            <p className="footer-label">Visit</p>
            <p>Viewing room, Colombo 03<br />Cutting desk, Ratnapura<br />Tuesday to Saturday, 10:00–18:00</p>
          </div>
          <div>
            <p className="footer-label">Pages</p>
            <nav aria-label="Footer">
              {LINKS.map((link) => (
                <Link key={link.to} to={link.to}>{link.label}</Link>
              ))}
            </nav>
          </div>
        </div>
        <div className="wrap footer-base">
          <p>Prices in US dollars. Treatment is written on every stone.</p>
          <p>© {new Date().getFullYear()} SapphireSpinels</p>
        </div>
      </footer>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}
