import { useState, useEffect, useRef, useCallback } from 'react';
import { Routes, Route } from 'react-router';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TrendingUp, Shield, DollarSign, RotateCcw, Share2, ArrowDown, Sparkles, Volume2 } from 'lucide-react';
import ManifestoOrb from './sections/ManifestoOrb';
import VoiceInterview from './sections/VoiceInterview';
import { analyzeFounder, createLocalAnalysis, type DimensionKey, type FounderAnalysis } from './lib/founder-analysis';

gsap.registerPlugin(ScrollTrigger);

function Home() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<DimensionKey>('traction');
  const [analysisResult, setAnalysisResult] = useState<FounderAnalysis>(() =>
    createLocalAnalysis('Startup idea submitted')
  );
  const heroRef = useRef<HTMLDivElement>(null);
  const analysisRef = useRef<HTMLDivElement>(null);
  const verdictRef = useRef<HTMLDivElement>(null);
  const scrollTriggersRef = useRef<ScrollTrigger[]>([]);
  const spokenAnalysisRef = useRef('');

  // Handle scroll progress for ManifestoOrb
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const heroHeight = window.innerHeight;
      const progress = Math.min(scrollY / heroHeight, 1);
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Clean up ScrollTriggers
  useEffect(() => {
    return () => {
      scrollTriggersRef.current.forEach((st) => st.kill());
      scrollTriggersRef.current = [];
    };
  }, []);

  const handleStartAnalysis = useCallback(async (idea: string) => {
    const submittedIdea = idea.trim() || 'Startup idea submitted';
    setShowAnalysis(true);
    setIsAnalyzing(true);

    // Animate to analysis section
    setTimeout(() => {
      if (analysisRef.current) {
        analysisRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);

    const result = await analyzeFounder(submittedIdea);
    setAnalysisResult(result);
    setActiveTab('traction');
    setIsAnalyzing(false);
  }, []);

  const handleReset = useCallback(() => {
    setShowAnalysis(false);
    setAnalysisResult(createLocalAnalysis('Startup idea submitted'));
    setIsAnalyzing(false);
    setActiveTab('traction');
    setScrollProgress(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const speakSarahSummary = useCallback((analysis: FounderAnalysis) => {
    if (!window.speechSynthesis) return;

    const dimensionEntries = Object.entries(analysis.dimensions) as Array<
      [DimensionKey, FounderAnalysis['dimensions'][DimensionKey]]
    >;
    const weakest = dimensionEntries.reduce((lowest, current) =>
      current[1].score < lowest[1].score ? current : lowest
    )[1];

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(
      `Sarah's readout. Your overall score is ${analysis.overallScore} out of 100. ${analysis.summary} Your weakest area is ${weakest.title}, scoring ${weakest.score}. Start there: ${weakest.tips[0]}.`
    );
    utterance.rate = 0.92;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  }, []);

  useEffect(() => {
    if (isAnalyzing || !showAnalysis) return;
    const signature = `${analysisResult.idea}-${analysisResult.overallScore}`;
    if (spokenAnalysisRef.current === signature) return;
    spokenAnalysisRef.current = signature;
    speakSarahSummary(analysisResult);
  }, [analysisResult, isAnalyzing, showAnalysis, speakSarahSummary]);

  // Sarah's messages
  const sarahMessages = [
    {
      type: 'sarah',
      text: isAnalyzing
        ? `I'm scoring your voice interview now. I'm looking for proof across Traction, Authority, and Funding.`
        : `I finished listening to your founder interview. The transcript gives me enough to score where you are today.`,
    },
    {
      type: 'sarah',
      text:
        analysisResult.source === 'backend'
          ? "Backend connected. I've evaluated your Traction, Authority, and Funding potential with the VC.me analysis API."
          : "I'm using Sarah's local analysis fallback. I've evaluated your Traction, Authority, and Funding potential, and here's the honest breakdown:",
    },
  ];

  // Analysis data for Traction, Authority, Funding
  const analysisData = [
    {
      key: 'traction' as const,
      ...analysisResult.dimensions.traction,
      color: '#a855f7',
      icon: <TrendingUp size={20} />,
    },
    {
      key: 'authority' as const,
      ...analysisResult.dimensions.authority,
      color: '#7c3aed',
      icon: <Shield size={20} />,
    },
    {
      key: 'funding' as const,
      ...analysisResult.dimensions.funding,
      color: '#c084fc',
      icon: <DollarSign size={20} />,
    },
  ];
  const activeInsight = analysisData.find((data) => data.key === activeTab) || analysisData[0];

  return (
    <div style={{ background: '#020617', minHeight: '100vh' }}>
      {/* ===== HERO SECTION ===== */}
      <section
        ref={heroRef}
        style={{
          position: 'relative',
          height: '200vh',
          background: '#020617',
        }}
      >
        {/* Sticky hero content */}
        <div
          style={{
            position: 'sticky',
            top: 0,
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {/* ManifestoOrb Background */}
          <ManifestoOrb scrollProgress={scrollProgress} />

          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 2,
              background:
                'linear-gradient(180deg, rgba(2, 6, 23, 0.78) 0%, rgba(2, 6, 23, 0.56) 48%, rgba(2, 6, 23, 0.88) 100%)',
              pointerEvents: 'none',
            }}
          />

          {/* Top Nav */}
          <nav
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '24px 40px',
              zIndex: 12,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '20px',
                fontWeight: 700,
                color: '#f8fafc',
              }}
            >
              <Sparkles size={20} style={{ color: '#a855f7' }} />
              <span>theAI.vc</span>
            </div>
            <button
              style={{
                fontSize: '14px',
                color: '#64748b',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              Already have an account? <span style={{ color: '#a855f7' }}>Sign in</span>
            </button>
          </nav>

          {/* Hero Content */}
          <div
            style={{
              position: 'relative',
              zIndex: 12,
              textAlign: 'center',
              maxWidth: '920px',
              padding: '0 24px',
              marginTop: '15vh',
            }}
          >
            <h1
              style={{
                fontSize: 'clamp(36px, 5vw, 64px)',
                fontWeight: 700,
                color: '#ffffff',
                lineHeight: 1.1,
                marginBottom: '20px',
                letterSpacing: '0',
                textShadow: '0 3px 28px rgba(0, 0, 0, 0.8)',
              }}
            >
              Talk to Sarah. Find the proof your startup is missing.
            </h1>
            <p
              style={{
                fontSize: '18px',
                color: '#dbeafe',
                marginBottom: '32px',
                lineHeight: 1.6,
                textShadow: '0 2px 16px rgba(0, 0, 0, 0.7)',
              }}
            >
              Answer three voice questions. Sarah scores your Traction, Authority, and Funding readiness.
            </p>
            <button
              onClick={() => {
                const ideaSection = document.getElementById('idea-chamber');
                ideaSection?.scrollIntoView({ behavior: 'smooth' });
              }}
              style={{
                padding: '16px 48px',
                background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
                color: '#fff',
                border: 'none',
                borderRadius: '9999px',
                fontSize: '18px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 0 30px rgba(168, 85, 247, 0.3)',
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.transform = 'scale(1.05)';
                (e.target as HTMLButtonElement).style.boxShadow = '0 0 40px rgba(168, 85, 247, 0.5)';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.transform = 'scale(1)';
                (e.target as HTMLButtonElement).style.boxShadow = '0 0 30px rgba(168, 85, 247, 0.3)';
              }}
            >
              Start voice interview
            </button>
          </div>

          {/* Scroll indicator */}
          <div
            style={{
              position: 'absolute',
              bottom: '40px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              zIndex: 10,
              opacity: 1 - scrollProgress * 2,
              transition: 'opacity 0.3s ease',
            }}
          >
            <span style={{ fontSize: '12px', color: '#64748b', letterSpacing: '2px' }}>
              SCROLL
            </span>
            <ArrowDown size={16} style={{ color: '#64748b' }} />
          </div>
        </div>
      </section>

      {/* ===== IDEA CHAMBER SECTION ===== */}
      <section
        id="idea-chamber"
        style={{
          position: 'relative',
          minHeight: '100vh',
          background: '#020617',
          zIndex: 5,
        }}
      >
        <VoiceInterview onStartAnalysis={handleStartAnalysis} />
      </section>

      {/* ===== ROAST ANALYSIS SECTION ===== */}
      {showAnalysis && (
        <section
          ref={analysisRef}
          style={{
            position: 'relative',
            padding: '120px 24px',
            maxWidth: '1200px',
            margin: '0 auto',
          }}
        >
          {/* Sarah Chat Header */}
          <div
            style={{
              marginBottom: '64px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            {sarahMessages.map((msg, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '16px',
                  maxWidth: '700px',
                }}
              >
                <img
                  src="/sarah-avatar.jpg"
                  alt="Sarah"
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    border: '2px solid #a855f7',
                    objectFit: 'cover',
                    flexShrink: 0,
                  }}
                />
                <div
                  style={{
                    background: 'rgba(15, 23, 42, 0.8)',
                    borderRadius: '16px',
                    padding: '16px 20px',
                    border: '1px solid rgba(168, 85, 247, 0.15)',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <p
                    style={{
                      fontSize: '15px',
                      color: '#e2e8f0',
                      lineHeight: 1.6,
                    }}
                  >
                    {msg.text}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Analysis Title */}
          <div style={{ marginBottom: '48px', textAlign: 'center' }}>
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: analysisResult.source === 'backend' ? '#22c55e' : '#a855f7',
                  letterSpacing: '3px',
                  textTransform: 'uppercase',
                }}
              >
              {analysisResult.source === 'backend' ? 'Backend Analysis Connected' : 'Local Sarah Analysis'}
            </span>
            <h2
              style={{
                fontSize: 'clamp(32px, 4vw, 48px)',
                fontWeight: 700,
                color: '#f8fafc',
                marginTop: '12px',
                letterSpacing: '-0.02em',
              }}
            >
              What You're Missing
            </h2>
          </div>

          <div
            className="sarah-dashboard"
            style={{
              border: '1px solid rgba(168, 85, 247, 0.18)',
              borderRadius: '8px',
              background: 'rgba(15, 23, 42, 0.68)',
              backdropFilter: 'blur(20px)',
              overflow: 'hidden',
            }}
          >
            <div
              className="sarah-dashboard-tabs"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                borderBottom: '1px solid rgba(148, 163, 184, 0.14)',
              }}
            >
              {analysisData.map((data) => {
                const isActive = activeTab === data.key;

                return (
                  <button
                    key={data.key}
                    onClick={() => setActiveTab(data.key)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      minHeight: '72px',
                      border: 'none',
                      borderRight: data.key === 'funding' ? 'none' : '1px solid rgba(148, 163, 184, 0.14)',
                      background: isActive ? `${data.color}18` : 'rgba(2, 6, 23, 0.2)',
                      color: isActive ? '#f8fafc' : '#94a3b8',
                      fontSize: '15px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    <span style={{ color: data.color }}>{data.icon}</span>
                    {data.title}
                    <span style={{ color: data.color }}>{data.score}</span>
                  </button>
                );
              })}
            </div>

            <div
              className="sarah-dashboard-panel"
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(180px, 0.35fr) minmax(0, 0.65fr)',
                gap: '32px',
                padding: '36px',
              }}
            >
              <div>
                <div
                  style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    border: `4px solid ${activeInsight.color}`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 0 28px ${activeInsight.color}40`,
                  }}
                >
                  <span style={{ color: activeInsight.color, fontSize: '36px', fontWeight: 800 }}>
                    {activeInsight.score}
                  </span>
                  <span style={{ color: '#64748b', fontSize: '12px' }}>/ 100</span>
                </div>
                <h3 style={{ color: '#f8fafc', fontSize: '30px', marginTop: '24px' }}>
                  {activeInsight.subtitle}
                </h3>
                <button
                  onClick={() => speakSarahSummary(analysisResult)}
                  style={{
                    marginTop: '18px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '11px 14px',
                    borderRadius: '8px',
                    border: '1px solid rgba(148, 163, 184, 0.22)',
                    background: 'rgba(2, 6, 23, 0.48)',
                    color: '#e2e8f0',
                    cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 700,
                  }}
                >
                  <Volume2 size={17} />
                  Replay Sarah
                </button>
              </div>

              <div>
                <p style={{ color: '#cbd5e1', fontSize: '17px', lineHeight: 1.75 }}>
                  {activeInsight.description}
                </p>
                <div
                  style={{
                    marginTop: '28px',
                    color: '#64748b',
                    fontSize: '13px',
                    fontWeight: 700,
                    letterSpacing: '1.4px',
                    textTransform: 'uppercase',
                  }}
                >
                  What to change next
                </div>
                <div style={{ display: 'grid', gap: '12px', marginTop: '14px' }}>
                  {activeInsight.tips.map((tip, index) => (
                    <div
                      key={tip}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '28px 1fr',
                        gap: '12px',
                        alignItems: 'start',
                        padding: '14px 16px',
                        borderRadius: '8px',
                        background: 'rgba(2, 6, 23, 0.46)',
                        border: `1px solid ${activeInsight.color}18`,
                        color: '#e2e8f0',
                        lineHeight: 1.55,
                      }}
                    >
                      <span style={{ color: activeInsight.color, fontWeight: 800 }}>{index + 1}</span>
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Overall Score */}
          <div
            style={{
              marginTop: '80px',
              textAlign: 'center',
              padding: '48px',
              background: 'rgba(15, 23, 42, 0.6)',
              backdropFilter: 'blur(20px)',
              borderRadius: '24px',
              border: '1px solid rgba(168, 85, 247, 0.15)',
            }}
          >
            <span
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: '#64748b',
                letterSpacing: '2px',
                textTransform: 'uppercase',
              }}
            >
              Overall Investment Readiness
            </span>
            <div
              style={{
                marginTop: '16px',
                fontSize: '72px',
                fontWeight: 800,
                background: 'linear-gradient(135deg, #a855f7, #f9a8d4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: 1,
              }}
            >
              {isAnalyzing ? '...' : analysisResult.overallScore}
              <span
                style={{
                  fontSize: '24px',
                  color: '#64748b',
                  WebkitTextFillColor: '#64748b',
                }}
              >
                /100
              </span>
            </div>
            <p
              style={{
                marginTop: '16px',
                fontSize: '16px',
                color: '#94a3b8',
                maxWidth: '500px',
                margin: '16px auto 0',
                lineHeight: 1.6,
              }}
            >
              {analysisResult.summary}
            </p>
          </div>
        </section>
      )}

      {/* ===== THE VERDICT SECTION ===== */}
      <section
        ref={verdictRef}
        style={{
          padding: '200px 24px',
          maxWidth: '1200px',
          margin: '0 auto',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            marginBottom: '48px',
            fontSize: 'clamp(36px, 5vw, 64px)',
            fontWeight: 700,
            color: '#f8fafc',
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
          }}
        >
          Sarah has spoken.
          <br />
          <span style={{ color: '#a855f7' }}>Your next milestone is clearer.</span>
          <br />
          Now tighten the proof.
        </div>

        <div
          style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={handleReset}
            style={{
              padding: '16px 36px',
              background: '#f8fafc',
              color: '#020617',
              border: 'none',
              borderRadius: '9999px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.transform = 'scale(1.05)';
              (e.target as HTMLButtonElement).style.boxShadow = '0 0 30px rgba(248, 250, 252, 0.2)';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.transform = 'scale(1)';
              (e.target as HTMLButtonElement).style.boxShadow = 'none';
            }}
          >
            <RotateCcw size={18} />
            Run Another Interview
          </button>
          <button
            style={{
              padding: '16px 36px',
              background: 'transparent',
              color: '#f8fafc',
              border: '1px solid rgba(248, 250, 252, 0.3)',
              borderRadius: '9999px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.transform = 'scale(1.05)';
              (e.target as HTMLButtonElement).style.borderColor = '#a855f7';
              (e.target as HTMLButtonElement).style.boxShadow = '0 0 20px rgba(168, 85, 247, 0.2)';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.transform = 'scale(1)';
              (e.target as HTMLButtonElement).style.borderColor = 'rgba(248, 250, 252, 0.3)';
              (e.target as HTMLButtonElement).style.boxShadow = 'none';
            }}
          >
            <Share2 size={18} />
            Share Sarah's Readout
          </button>
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: '120px',
            paddingTop: '40px',
            borderTop: '1px solid rgba(100, 116, 139, 0.2)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '16px',
              fontWeight: 600,
              color: '#f8fafc',
            }}
          >
            <Sparkles size={16} style={{ color: '#a855f7' }} />
            <span>theAI.vc</span>
          </div>
          <p style={{ fontSize: '13px', color: '#475569' }}>
            Not financial advice. Sarah is an AI coach for founder readiness.
          </p>
        </div>
      </section>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
    </Routes>
  );
}
