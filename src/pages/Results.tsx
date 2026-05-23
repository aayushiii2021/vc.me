import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { TrendingUp, Shield, DollarSign, Volume2, RotateCcw, Share2 } from 'lucide-react';
import YCTopbar from '../components/YCTopbar';
import { createLocalAnalysis, type DimensionKey, type FounderAnalysis } from '../lib/founder-analysis';
import { clearAll, loadAnalysis } from '../lib/analysis-store';

const dimensionMeta: Record<DimensionKey, { icon: React.ReactNode }> = {
  traction: { icon: <TrendingUp size={18} /> },
  authority: { icon: <Shield size={18} /> },
  funding: { icon: <DollarSign size={18} /> },
};

export default function Results() {
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState<FounderAnalysis | null>(() => loadAnalysis());
  const [activeTab, setActiveTab] = useState<DimensionKey>('traction');

  useEffect(() => {
    if (!analysis) {
      setAnalysis(createLocalAnalysis('No interview submitted yet — preview only'));
    }
  }, [analysis]);

  const speakSummary = useCallback((data: FounderAnalysis) => {
    if (!window.speechSynthesis) return;
    const entries = Object.entries(data.dimensions) as Array<
      [DimensionKey, FounderAnalysis['dimensions'][DimensionKey]]
    >;
    const weakest = entries.reduce((lowest, current) =>
      current[1].score < lowest[1].score ? current : lowest
    )[1];
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(
      `Sarah's readout. Your overall score is ${data.overallScore} out of 100. ${data.summary} Your weakest area is ${weakest.title}, scoring ${weakest.score}. Start there: ${weakest.tips[0]}.`
    );
    utterance.rate = 0.92;
    window.speechSynthesis.speak(utterance);
  }, []);

  if (!analysis) {
    return (
      <div style={{ background: '#fff', minHeight: '100vh' }}>
        <YCTopbar />
        <main className="yc-container" style={{ padding: '40px 16px' }}>
          Loading…
        </main>
      </div>
    );
  }

  const dimensionEntries = (Object.keys(analysis.dimensions) as DimensionKey[]).map((key) => ({
    key,
    ...analysis.dimensions[key],
  }));
  const activeInsight = dimensionEntries.find((d) => d.key === activeTab) || dimensionEntries[0];

  const sourceLabel =
    analysis.source === 'gmi'
      ? 'GMI Cloud Analysis'
      : analysis.source === 'backend'
        ? 'VC.me API Analysis'
        : 'Local Sarah Analysis';

  const handleReset = () => {
    clearAll();
    navigate('/quiz');
  };

  return (
    <div style={{ background: '#fff', minHeight: '100vh', color: '#000' }}>
      <YCTopbar />

      <main className="yc-container" style={{ padding: '32px 16px 80px' }}>
        <div style={{ marginBottom: 24 }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: '#FF6600',
              letterSpacing: 2,
              textTransform: 'uppercase',
            }}
          >
            {sourceLabel}
          </span>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginTop: 6 }}>
            What you're missing
          </h1>
        </div>

        {/* Overall score panel */}
        <section
          className="yc-card"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(180px, 240px) 1fr',
            gap: 24,
            alignItems: 'center',
            marginBottom: 24,
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: 140,
                height: 140,
                margin: '0 auto',
                borderRadius: '50%',
                border: '4px solid #FF6600',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ fontSize: 40, fontWeight: 800, color: '#FF6600', lineHeight: 1 }}>
                {analysis.overallScore}
              </span>
              <span style={{ fontSize: 12, color: 'var(--yc-text-muted)' }}>/ 100</span>
            </div>
            <div
              style={{
                marginTop: 10,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 2,
                textTransform: 'uppercase',
                color: 'var(--yc-text-muted)',
              }}
            >
              Overall readiness
            </div>
          </div>
          <div>
            <p style={{ fontSize: 15, lineHeight: 1.6 }}>{analysis.summary}</p>
            <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button onClick={() => speakSummary(analysis)} className="yc-btn-secondary">
                <Volume2 size={16} />
                Replay Sarah
              </button>
              <button onClick={handleReset} className="yc-btn-secondary">
                <RotateCcw size={16} />
                Run another interview
              </button>
              <button className="yc-btn-primary">
                <Share2 size={16} />
                Share readout
              </button>
            </div>
          </div>
        </section>

        {/* Dimension tabs */}
        <section className="yc-card sarah-dashboard" style={{ padding: 0 }}>
          <div
            className="sarah-dashboard-tabs"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              borderBottom: '1px solid var(--yc-border)',
            }}
          >
            {dimensionEntries.map((data, idx) => {
              const isActive = activeTab === data.key;
              return (
                <button
                  key={data.key}
                  onClick={() => setActiveTab(data.key)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    minHeight: 56,
                    border: 'none',
                    borderRight: idx === 2 ? 'none' : '1px solid var(--yc-border)',
                    background: isActive ? '#FFF4EC' : '#fff',
                    color: '#000',
                    fontSize: 14,
                    fontWeight: isActive ? 800 : 600,
                    cursor: 'pointer',
                    fontFamily: 'Verdana, Geneva, sans-serif',
                  }}
                >
                  <span style={{ color: '#FF6600' }}>{dimensionMeta[data.key].icon}</span>
                  {data.title}
                  <span style={{ color: '#FF6600' }}>{data.score}</span>
                </button>
              );
            })}
          </div>

          <div
            className="sarah-dashboard-panel"
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(160px, 0.35fr) minmax(0, 0.65fr)',
              gap: 24,
              padding: 24,
            }}
          >
            <div>
              <div
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  border: '4px solid #FF6600',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span style={{ color: '#FF6600', fontSize: 28, fontWeight: 800 }}>
                  {activeInsight.score}
                </span>
                <span style={{ color: 'var(--yc-text-muted)', fontSize: 11 }}>/ 100</span>
              </div>
              <h3 style={{ marginTop: 14, fontSize: 18, fontWeight: 700 }}>
                {activeInsight.subtitle}
              </h3>
            </div>

            <div>
              <p style={{ fontSize: 14, lineHeight: 1.7 }}>{activeInsight.description}</p>
              <div
                style={{
                  marginTop: 20,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 1.4,
                  textTransform: 'uppercase',
                  color: 'var(--yc-text-muted)',
                }}
              >
                What to change next
              </div>
              <ol
                style={{
                  marginTop: 10,
                  paddingLeft: 20,
                  display: 'grid',
                  gap: 8,
                  fontSize: 14,
                  lineHeight: 1.55,
                }}
              >
                {activeInsight.tips.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <div style={{ marginTop: 32, textAlign: 'center' }}>
          <Link to="/quiz" style={{ color: '#FF6600', textDecoration: 'underline', fontSize: 13 }}>
            Retake the quiz →
          </Link>
        </div>
      </main>

      <footer style={{ borderTop: '1px solid var(--yc-border)', padding: '16px 0', marginTop: 40 }}>
        <div
          className="yc-container"
          style={{ fontSize: 12, color: 'var(--yc-text-muted)', textAlign: 'center' }}
        >
          Not financial advice. Sarah is an AI coach for founder readiness.
        </div>
      </footer>
    </div>
  );
}
