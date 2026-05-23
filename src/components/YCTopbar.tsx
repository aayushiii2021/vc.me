import { Link, useLocation } from 'react-router';

export default function YCTopbar() {
  const { pathname } = useLocation();

  const navItem = (to: string, label: string) => {
    const active = pathname === to;
    return (
      <Link
        to={to}
        style={{
          color: 'var(--yc-text)',
          fontWeight: active ? 700 : 500,
          fontSize: 15,
          opacity: active ? 1 : 0.75,
        }}
      >
        {label}
      </Link>
    );
  };

  return (
    <header className="yc-topbar">
      <div
        style={{
          maxWidth: 1080,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            color: 'var(--yc-orange)',
            fontWeight: 600,
            fontFamily: 'var(--font-serif)',
            fontSize: 22,
            letterSpacing: '-0.02em',
          }}
        >
          vc.me
        </Link>
        <nav style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          {navItem('/quiz', 'Quiz')}
          {navItem('/results', 'Results')}
          <Link to="/quiz" className="yc-btn-primary" style={{ padding: '8px 18px', fontSize: 14 }}>
            Start
          </Link>
        </nav>
      </div>
    </header>
  );
}
