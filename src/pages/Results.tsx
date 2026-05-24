import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, Award, BarChart3, Check, DollarSign, Lightbulb, Sparkles } from 'lucide-react';
import AuthorityPlaybook from '../components/AuthorityPlaybook';
import TractionPlaybook from '../components/TractionPlaybook';
import FundingPlaybook from '../components/FundingPlaybook';
import AdvisePlaybook from '../components/AdvisePlaybook';
import { founder } from '../lib/playbook-data';

type TabKey = 'authority' | 'traction' | 'funding' | 'advise';

interface TabDef {
  key: TabKey;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const tabs: TabDef[] = [
  {
    key: 'authority',
    label: 'Authority',
    icon: <Award size={16} />,
    description: 'How you become the credible voice for your market.',
  },
  {
    key: 'traction',
    label: 'Traction',
    icon: <BarChart3 size={16} />,
    description: 'How you find your first customers and prove demand.',
  },
  {
    key: 'funding',
    label: 'Funding',
    icon: <DollarSign size={16} />,
    description: 'Who funds you next, and exactly how to reach them.',
  },
  {
    key: 'advise',
    label: 'Advise',
    icon: <Lightbulb size={16} />,
    description: 'The week-by-week plan for the next 90 days.',
  },
];

export default function Results() {
  const initialTab = (() => {
    if (typeof window === 'undefined') return 'authority' as TabKey;
    const param = new URLSearchParams(window.location.search).get('tab');
    if (param && ['authority', 'traction', 'funding', 'advise'].includes(param)) {
      return param as TabKey;
    }
    return 'authority' as TabKey;
  })();
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);
  const [completed, setCompleted] = useState<Record<TabKey, boolean>>({
    authority: false,
    traction: false,
    funding: false,
    advise: false,
  });

  const markComplete = (key: TabKey) => {
    setCompleted((prev) => ({ ...prev, [key]: true }));
  };

  return (
    <div style={{ background: 'var(--yc-bg)', minHeight: '100vh' }}>
      {/* Top header */}
      <header
        style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--yc-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--yc-bg)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            fontFamily: 'var(--font-serif)',
            color: 'var(--yc-orange)',
            fontWeight: 600,
            fontSize: 20,
            letterSpacing: '-0.02em',
          }}
        >
          vc.me
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 13, color: 'var(--yc-text-muted)' }}>
            Playbook for{' '}
            <strong style={{ color: 'var(--yc-text)' }}>{founder.name}</strong>
          </span>
          <Link
            to="/quiz"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              color: 'var(--yc-text-muted)',
              textDecoration: 'none',
            }}
          >
            <ArrowLeft size={14} />
            Retake
          </Link>
        </div>
      </header>

      <main className="yc-container" style={{ padding: '32px 16px 96px' }}>
        {/* Hero */}
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 12px',
              background: 'rgba(255,102,0,0.1)',
              color: 'var(--yc-orange)',
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 1.2,
              textTransform: 'uppercase',
              marginBottom: 10,
            }}
          >
            <Sparkles size={12} />
            Generating live
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(32px, 4.4vw, 48px)',
              fontWeight: 500,
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              margin: 0,
            }}
          >
            {founder.name}'s founder playbook
          </h1>
          <p
            style={{
              marginTop: 8,
              fontSize: 15,
              color: 'var(--yc-text-muted)',
              maxWidth: 540,
            }}
          >
            4 dimensions, scored against your story. Click any tab to jump straight in.
          </p>
        </div>

        {/* Tabs */}
        <div
          role="tablist"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 8,
            marginBottom: 24,
          }}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            const isComplete = completed[tab.key];
            return (
              <button
                key={tab.key}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  textAlign: 'left',
                  padding: '14px 16px',
                  borderRadius: 12,
                  border: isActive
                    ? '1.5px solid var(--yc-orange)'
                    : '1.5px solid var(--yc-border)',
                  background: isActive ? '#FFF1E3' : '#fff',
                  color: 'var(--yc-text)',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'background 0.15s ease, border-color 0.15s ease',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                >
                  <span style={{ color: isActive ? 'var(--yc-orange)' : 'inherit' }}>
                    {tab.icon}
                  </span>
                  {tab.label}
                  <span style={{ marginLeft: 'auto', display: 'inline-flex' }}>
                    {isComplete ? (
                      <Check size={14} style={{ color: '#16A34A' }} />
                    ) : (
                      <span
                        aria-hidden
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          border: '2px solid var(--yc-orange)',
                          borderRightColor: 'transparent',
                          animation: 'vcSpin2 0.9s linear infinite',
                        }}
                      />
                    )}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: 'var(--yc-text-muted)',
                    marginTop: 4,
                    lineHeight: 1.4,
                  }}
                >
                  {tab.description}
                </div>
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div role="tabpanel">
          {activeTab === 'authority' && (
            <AuthorityPlaybook onComplete={() => markComplete('authority')} />
          )}
          {activeTab === 'traction' && (
            <TractionPlaybook onComplete={() => markComplete('traction')} />
          )}
          {activeTab === 'funding' && (
            <FundingPlaybook onComplete={() => markComplete('funding')} />
          )}
          {activeTab === 'advise' && (
            <AdvisePlaybook onComplete={() => markComplete('advise')} />
          )}
        </div>
      </main>

      <style>{`
        @keyframes vcSpin2 { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

function PlaceholderPlaybook({
  tabKey,
  title,
  subtitle,
  onComplete,
}: {
  tabKey: TabKey;
  title: string;
  subtitle: string;
  onComplete: () => void;
}) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => {
      setReady(true);
      onComplete();
    }, 2400);
    return () => window.clearTimeout(t);
  }, [tabKey, onComplete]);

  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid var(--yc-border)',
        borderRadius: 16,
        padding: 40,
        textAlign: 'center',
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 14px',
          background: 'var(--yc-surface)',
          border: '1px solid var(--yc-border)',
          borderRadius: 999,
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: 1.2,
          textTransform: 'uppercase',
          color: 'var(--yc-text-muted)',
        }}
      >
        <Sparkles size={12} style={{ color: 'var(--yc-orange)' }} />
        {ready ? 'Draft ready' : 'Generating'}
      </div>
      <h2
        style={{
          marginTop: 16,
          fontFamily: 'var(--font-serif)',
          fontSize: 32,
          fontWeight: 500,
          letterSpacing: '-0.01em',
        }}
      >
        {title}
      </h2>
      <p
        style={{
          marginTop: 8,
          fontSize: 15,
          color: 'var(--yc-text-muted)',
          maxWidth: 480,
          marginInline: 'auto',
        }}
      >
        {subtitle}
      </p>
      <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'stretch', maxWidth: 520, marginInline: 'auto' }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              height: 14,
              borderRadius: 6,
              background: 'linear-gradient(90deg, var(--yc-surface), #EFE7D6, var(--yc-surface))',
              backgroundSize: '200% 100%',
              animation: `vcShimmer 1.6s linear infinite`,
              animationDelay: `${i * 0.2}s`,
              opacity: 0.6 - i * 0.1,
            }}
          />
        ))}
      </div>
      <p style={{ marginTop: 28, fontSize: 13, color: 'var(--yc-text-muted)' }}>
        Full breakdown lands next. We started with Authority because your story leans there.
      </p>
      <style>{`
        @keyframes vcShimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
