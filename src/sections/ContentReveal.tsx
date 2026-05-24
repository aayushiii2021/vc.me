import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ContentRevealProps {
  title: string;
  subtitle: string;
  score: number;
  description: string;
  tips: string[];
  color: string;
  icon: React.ReactNode;
}

export default function ContentReveal({ title, subtitle, score, description, tips, color, icon }: ContentRevealProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!wrapperRef.current) return;

    const wrapper = wrapperRef.current;
    const textElements = wrapper.querySelectorAll('.reveal-text');
    const bgElement = wrapper.querySelector('.reveal-bg');

    const triggers: ScrollTrigger[] = [];

    const textAnim = gsap.fromTo(
      textElements,
      { yPercent: 120, opacity: 0 },
      {
        yPercent: 0,
        opacity: 1,
        ease: 'power2.out',
        duration: 1.2,
        scrollTrigger: {
          trigger: wrapper,
          start: 'top 80%',
          end: 'bottom 20%',
          toggleActions: 'play none none reverse',
        },
      }
    );
    if (textAnim.scrollTrigger) triggers.push(textAnim.scrollTrigger);

    if (bgElement) {
      const bgAnim = gsap.fromTo(
        bgElement,
        { xPercent: -100 },
        {
          xPercent: 100,
          ease: 'none',
          duration: 1.5,
          scrollTrigger: {
            trigger: wrapper,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );
      if (bgAnim.scrollTrigger) triggers.push(bgAnim.scrollTrigger);
    }

    return () => {
      triggers.forEach((t) => t.kill());
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      style={{
        position: 'relative',
        background: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(20px)',
        borderRadius: '16px',
        padding: '40px',
        border: `1px solid ${color}20`,
        overflow: 'hidden',
      }}
    >
      {/* Reveal background sweep */}
      <div className="reveal-bg" style={{ opacity: 0.15 }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: '24px',
          }}
        >
          <div className="reveal-text" style={{ overflow: 'hidden' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '8px',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: `${color}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: color,
                }}
              >
                {icon}
              </div>
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: color,
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                }}
              >
                {title}
              </span>
            </div>
            <h3
              style={{
                fontSize: '28px',
                fontWeight: 700,
                color: '#f8fafc',
                lineHeight: 1.2,
              }}
            >
              {subtitle}
            </h3>
          </div>

          {/* Score Circle */}
          <div
            className="reveal-text"
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              border: `3px solid ${color}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: `0 0 20px ${color}30`,
            }}
          >
            <span
              style={{
                fontSize: '24px',
                fontWeight: 700,
                color: color,
              }}
            >
              {score}
            </span>
            <span
              style={{
                fontSize: '10px',
                color: '#64748b',
                letterSpacing: '1px',
              }}
            >
              / 100
            </span>
          </div>
        </div>

        {/* Description */}
        <div className="reveal-text" style={{ marginBottom: '24px' }}>
          <p
            style={{
              fontSize: '16px',
              color: '#94a3b8',
              lineHeight: 1.7,
            }}
          >
            {description}
          </p>
        </div>

        {/* Tips */}
        <div className="reveal-text">
          <div
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: '#64748b',
              marginBottom: '12px',
              letterSpacing: '1px',
              textTransform: 'uppercase',
            }}
          >
            How to Improve
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {tips.map((tip, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '12px 16px',
                  background: 'rgba(2, 6, 23, 0.5)',
                  borderRadius: '8px',
                  border: `1px solid ${color}10`,
                }}
              >
                <span style={{ color: color, fontSize: '14px', flexShrink: 0 }}>
                  {index + 1}.
                </span>
                <span
                  style={{
                    fontSize: '14px',
                    color: '#cbd5e1',
                    lineHeight: 1.5,
                  }}
                >
                  {tip}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}