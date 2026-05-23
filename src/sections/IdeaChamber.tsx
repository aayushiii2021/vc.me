import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { Upload, Link, FileText } from 'lucide-react';

interface IdeaChamberProps {
  onStartAnalysis: (idea: string) => void;
}

export default function IdeaChamber({ onStartAnalysis }: IdeaChamberProps) {
  const chamberRef = useRef<HTMLDivElement>(null);
  const orbRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [showUpload, setShowUpload] = useState(true);
  const [ideaText, setIdeaText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const masterTlRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    if (!chamberRef.current || !orbRef.current) return;

    gsap.set('.idea-wrapper', { transformStyle: 'preserve-3d' });
    gsap.set('.idea-orb', {
      transformStyle: 'preserve-3d',
      transformOrigin: '50% 50%',
      rotationY: -50,
      rotationX: -20,
      rotationZ: -10,
    });

    const rotateTl = gsap.timeline({ repeat: -1 });
    rotateTl.to('.orb-ring-1', { rotationY: 360, rotationX: 360, duration: 16, ease: 'none' });
    rotateTl.to('.orb-ring-2', { rotationX: 360, rotationZ: 360, duration: 24, ease: 'none' }, 0);
    rotateTl.to('.orb-ring-3', { rotationZ: 360, duration: 12, ease: 'none' }, 0);

    const masterTl = gsap.timeline();
    masterTl.to('.idea-chamber-container', { opacity: 1, duration: 1.5, ease: 'power2.out' });
    masterTl.add(rotateTl, 0);
    masterTl.fromTo('.idea-orb', { scale: 0.6 }, { scale: 1, duration: 2.5, ease: 'expo.out' }, 0);
    masterTl.fromTo('.idea-orb', { opacity: 0 }, { opacity: 1, duration: 1.5, ease: 'power2.out' }, 0);
    masterTl.fromTo(
      '.idea-btn',
      { scale: 0.5, opacity: 0 },
      { scale: 1, opacity: 1, duration: 1.5, ease: 'elastic.out(1, 0.5)' },
      '-=1'
    );

    masterTlRef.current = masterTl;

    return () => {
      masterTl.kill();
      rotateTl.kill();
    };
  }, []);

  const handleStartClick = useCallback(() => {
    if (!chamberRef.current) return;

    const zoomTl = gsap.timeline();
    zoomTl.to('.idea-chamber-container', { scale: 150, duration: 2, ease: 'power3.inOut' });
    zoomTl.to(
      '.idea-chamber-container',
      { opacity: 0, duration: 1.5, ease: 'power2.inOut' },
      '-=1.2'
    );
    zoomTl.call(() => {
      gsap.set('.idea-chamber-container', { display: 'none' });
      setShowUpload(true);
    });
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      onStartAnalysis(ideaText || 'Pitch deck uploaded');
    },
    [ideaText, onStartAnalysis]
  );

  const handleSubmit = useCallback(() => {
    onStartAnalysis(ideaText || 'Startup idea submitted');
  }, [ideaText, onStartAnalysis]);

  return (
    <div
      style={{
        perspective: '1200px',
        transformStyle: 'preserve-3d',
        width: '100%',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      {/* Idea Chamber Orb */}
      <div
        ref={chamberRef}
        className="idea-chamber-container"
        style={{
          opacity: 0,
          position: 'absolute',
          width: '100%',
          height: '100%',
          display: showUpload ? 'none' : 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          className="idea-wrapper"
          style={{
            position: 'relative',
            width: '500px',
            height: '500px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            ref={orbRef}
            className="idea-orb"
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Orb Ring 1 */}
            <div
              className="orb orb-ring-1"
              style={{
                border: '2px solid #a855f7',
                boxShadow: '0 0 100px rgba(168, 85, 247, 0.3), inset 0 0 100px rgba(168, 85, 247, 0.1)',
                pointerEvents: 'none',
              }}
            />
            {/* Orb Ring 2 */}
            <div
              className="orb orb-ring-2"
              style={{
                border: '2px solid rgba(168, 85, 247, 0.3)',
                width: '350px',
                height: '350px',
                pointerEvents: 'none',
              }}
            />
            {/* Orb Ring 3 */}
            <div
              className="orb orb-ring-3"
              style={{
                border: '2px solid rgba(168, 85, 247, 0.15)',
                width: '120px',
                height: '120px',
                pointerEvents: 'none',
              }}
            />
            {/* Center Button */}
            <button
              ref={btnRef}
              onClick={handleStartClick}
              className="idea-btn"
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                padding: '16px 40px',
                background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
                color: '#fff',
                border: 'none',
                borderRadius: '9999px',
                fontSize: '18px',
                fontWeight: 600,
                cursor: 'pointer',
                zIndex: 10,
                boxShadow: '0 0 40px rgba(168, 85, 247, 0.5), 0 0 80px rgba(168, 85, 247, 0.2)',
                fontFamily: 'Inter, sans-serif',
                letterSpacing: '2px',
              }}
            >
              START HERE
            </button>
          </div>
        </div>
      </div>

      {/* Upload Interface */}
      {showUpload && (
        <div
          className="upload-interface"
          style={{
            display: 'flex',
            opacity: 1,
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            maxWidth: '700px',
            padding: '0 24px',
            gap: '32px',
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                marginBottom: '16px',
              }}
            >
              <img
                src="/sarah-avatar.jpg"
                alt="Sarah"
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  border: '2px solid #a855f7',
                  objectFit: 'cover',
                }}
              />
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#a855f7',
                  letterSpacing: '2px',
                }}
              >
                SARAH IS READY
              </span>
            </div>
            <h2
              style={{
                fontSize: '32px',
                fontWeight: 700,
                color: '#f8fafc',
                marginBottom: '8px',
              }}
            >
              Pitch Me Your Idea
            </h2>
            <p style={{ fontSize: '16px', color: '#64748b', lineHeight: 1.6 }}>
              I'll roast it gently. Then tell you exactly what you're missing.
            </p>
          </div>

          {/* Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{
              width: '100%',
              padding: '60px 40px',
              borderRadius: '24px',
              border: isDragging
                ? '2px dashed #a855f7'
                : '2px dashed rgba(168, 85, 247, 0.3)',
              background: isDragging
                ? 'rgba(168, 85, 247, 0.1)'
                : 'rgba(15, 23, 42, 0.6)',
              backdropFilter: 'blur(20px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
            }}
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <input
              id="file-input"
              type="file"
              accept=".pdf,.ppt,.pptx"
              style={{ display: 'none' }}
              onChange={() => handleSubmit()}
            />
            <Upload
              size={48}
              style={{ color: isDragging ? '#a855f7' : '#64748b' }}
            />
            <p
              style={{
                fontSize: '16px',
                color: '#94a3b8',
                textAlign: 'center',
              }}
            >
              Drag & drop your pitch deck, or click to browse
            </p>
          </div>

          {/* OR Divider */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              width: '100%',
            }}
          >
            <div
              style={{
                flex: 1,
                height: '1px',
                background: 'linear-gradient(90deg, transparent, rgba(168, 85, 247, 0.3))',
              }}
            />
            <span style={{ fontSize: '14px', color: '#64748b' }}>OR</span>
            <div
              style={{
                flex: 1,
                height: '1px',
                background: 'linear-gradient(90deg, rgba(168, 85, 247, 0.3), transparent)',
              }}
            />
          </div>

          {/* Text Input */}
          <div style={{ width: '100%' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px 24px',
                borderRadius: '9999px',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                background: 'rgba(15, 23, 42, 0.8)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <Link size={20} style={{ color: '#64748b', flexShrink: 0 }} />
              <input
                type="text"
                value={ideaText}
                onChange={(e) => setIdeaText(e.target.value)}
                placeholder="Describe your startup idea in one sentence..."
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#f8fafc',
                  fontSize: '15px',
                  fontFamily: 'Inter, sans-serif',
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSubmit();
                }}
              />
              <button
                onClick={handleSubmit}
                style={{
                  padding: '10px 24px',
                  background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '9999px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLButtonElement).style.transform = 'scale(1.05)';
                  (e.target as HTMLButtonElement).style.boxShadow = '0 0 20px rgba(168, 85, 247, 0.4)';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.transform = 'scale(1)';
                  (e.target as HTMLButtonElement).style.boxShadow = 'none';
                }}
              >
                Pitch
              </button>
            </div>
          </div>

          {/* Hint */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '13px',
              color: '#475569',
            }}
          >
            <FileText size={14} />
            <span>Sarah accepts PDF, PPT, and broken dreams.</span>
          </div>

          {/* Quick example chips */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              justifyContent: 'center',
            }}
          >
            {[
              'AI-powered fitness app',
              'B2B SaaS for HR',
              'Marketplace for creatives',
              'Fintech for Gen Z',
            ].map((example) => (
              <button
                key={example}
                onClick={() => {
                  setIdeaText(example);
                }}
                style={{
                  padding: '8px 16px',
                  borderRadius: '9999px',
                  border: '1px solid rgba(168, 85, 247, 0.2)',
                  background: 'rgba(168, 85, 247, 0.05)',
                  color: '#94a3b8',
                  fontSize: '13px',
                  cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLButtonElement).style.borderColor = '#a855f7';
                  (e.target as HTMLButtonElement).style.color = '#a855f7';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.borderColor = 'rgba(168, 85, 247, 0.2)';
                  (e.target as HTMLButtonElement).style.color = '#94a3b8';
                }}
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
