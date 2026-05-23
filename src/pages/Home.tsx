import { Link } from 'react-router';
import { ArrowRight, TrendingUp, Shield, DollarSign } from 'lucide-react';

export default function Home() {
  return (
    <div
      style={{
        background: 'var(--yc-bg)',
        minHeight: '100vh',
        color: 'var(--yc-text)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <main
        style={{
          flex: 1,
          maxWidth: 1100,
          width: '100%',
          margin: '0 auto',
          padding: '96px 24px 64px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        <span
          style={{
            marginBottom: 40,
            fontFamily: 'var(--font-serif)',
            fontWeight: 600,
            fontSize: 28,
            letterSpacing: '-0.02em',
            color: 'var(--yc-orange)',
            lineHeight: 1,
          }}
        >
          vc.me
        </span>

        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(44px, 7vw, 88px)',
            fontWeight: 500,
            lineHeight: 1.04,
            letterSpacing: '-0.02em',
            maxWidth: 980,
            margin: 0,
          }}
        >
          First-time founders become{' '}
          <em
            style={{
              fontStyle: 'italic',
              fontWeight: 500,
              color: 'var(--yc-orange)',
            }}
          >
            fundable
          </em>{' '}
          in three questions.
        </h1>

        <p
          style={{
            marginTop: 28,
            fontSize: 'clamp(17px, 1.4vw, 20px)',
            lineHeight: 1.55,
            color: 'var(--yc-text-muted)',
            maxWidth: 680,
          }}
        >
          No network, no investors, no customers yet? Answer three voice questions and we'll score
          your <strong style={{ color: 'var(--yc-text)', fontWeight: 600 }}>Traction</strong>,{' '}
          <strong style={{ color: 'var(--yc-text)', fontWeight: 600 }}>Authority</strong>, and{' '}
          <strong style={{ color: 'var(--yc-text)', fontWeight: 600 }}>Funding</strong> readiness —
          then tell you exactly what to do next.
        </p>

        <div
          style={{
            marginTop: 40,
            display: 'flex',
            gap: 14,
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <Link to="/quiz" className="yc-btn-primary">
            Take the quiz
            <ArrowRight size={18} />
          </Link>
          <a
            href="#how-it-works"
            className="yc-btn-secondary"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            How it works
          </a>
        </div>

        <p
          style={{
            marginTop: 18,
            fontSize: 13,
            color: 'var(--yc-text-muted)',
          }}
        >
          Free · Takes 5 minutes · No signup
        </p>
      </main>

      <section
        id="how-it-works"
        style={{
          background: 'var(--yc-surface)',
          borderTop: '1px solid var(--yc-border)',
          padding: '80px 24px',
        }}
      >
        <div
          style={{
            maxWidth: 1080,
            margin: '0 auto',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(28px, 3.6vw, 44px)',
                fontWeight: 500,
                lineHeight: 1.1,
                letterSpacing: '-0.01em',
                margin: 0,
              }}
            >
              The three things every investor checks.
            </h2>
            <p
              style={{
                marginTop: 14,
                fontSize: 16,
                color: 'var(--yc-text-muted)',
                maxWidth: 580,
                marginInline: 'auto',
              }}
            >
              We score each one and tell you the highest-leverage next move for a first-time
              founder.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 20,
            }}
          >
            {[
              {
                icon: <TrendingUp size={22} />,
                title: 'Traction',
                lede: 'Proof people want it.',
                body: 'Even without revenue: pilots, waitlists, repeat usage, qualitative signal. We tell you the smallest credible proof to chase next.',
              },
              {
                icon: <Shield size={22} />,
                title: 'Authority',
                lede: 'Why you, not anyone else.',
                body: 'Founder-market fit when you don\'t have a track record yet — domain depth, lived problem, the asymmetric thing only you can see.',
              },
              {
                icon: <DollarSign size={22} />,
                title: 'Funding',
                lede: 'Capital plan that holds up.',
                body: 'How much, what for, what it unlocks. We translate "I need money" into a 12-month milestone plan an investor will fund.',
              },
            ].map((item) => (
              <div
                key={item.title}
                style={{
                  background: 'var(--yc-bg)',
                  border: '1px solid var(--yc-border)',
                  borderRadius: 14,
                  padding: 28,
                }}
              >
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: 'rgba(255, 102, 0, 0.1)',
                    color: 'var(--yc-orange)',
                    marginBottom: 18,
                  }}
                >
                  {item.icon}
                </div>
                <h3
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 24,
                    fontWeight: 500,
                    margin: 0,
                    letterSpacing: '-0.01em',
                  }}
                >
                  {item.title}
                </h3>
                <p
                  style={{
                    margin: '6px 0 14px',
                    fontStyle: 'italic',
                    fontFamily: 'var(--font-serif)',
                    fontSize: 17,
                    color: 'var(--yc-text-muted)',
                  }}
                >
                  {item.lede}
                </p>
                <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.6 }}>{item.body}</p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 56 }}>
            <Link to="/quiz" className="yc-btn-orange">
              Start your three-question quiz
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
