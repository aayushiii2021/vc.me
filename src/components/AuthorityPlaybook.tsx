import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowUpRight,
  Check,
  Copy,
  Headphones,
  Lightbulb,
  Megaphone,
  Newspaper,
  Quote,
  Sparkles,
  Target,
  Youtube,
  Zap,
} from 'lucide-react';
import LinkedInPost from './LinkedInPost';
import OutreachCard from './OutreachCard';
import Logo from './Logo';
import { authorityActions, founder, nextStep, outreachTargets } from '../lib/playbook-data';
import { useSequentialReveal, useStreamingText } from '../lib/use-streaming-text';

interface Props {
  onComplete: () => void;
}

type Phase =
  | 'init'
  | 'diagnose'
  | 'actions'
  | 'post'
  | 'outreach'
  | 'done';

const phaseLabel: Record<Phase, string> = {
  init: 'Analyzing your story',
  diagnose: 'Naming your market conversation',
  actions: 'Drafting your 3 priority moves',
  post: 'Composing your LinkedIn post',
  outreach: 'Finding 25 places to be featured',
  done: 'Authority playbook ready',
};

export default function AuthorityPlaybook({ onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>('init');

  useEffect(() => {
    const t1 = window.setTimeout(() => setPhase('diagnose'), 250);
    return () => window.clearTimeout(t1);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <GenerationHeader phase={phase} />
      {phase !== 'init' && (
        <DiagnosisCard onDone={() => setPhase('actions')} />
      )}
      {phaseIs(phase, ['actions', 'post', 'outreach', 'done']) && (
        <ActionsSection onDone={() => setPhase('post')} />
      )}
      {phaseIs(phase, ['post', 'outreach', 'done']) && (
        <PostSection onDone={() => setPhase('outreach')} />
      )}
      {phaseIs(phase, ['outreach', 'done']) && (
        <OutreachSection
          onDone={() => {
            setPhase('done');
            onComplete();
          }}
        />
      )}
      {phase === 'done' && <NextStepCard />}
    </div>
  );
}

function phaseIs(current: Phase, list: Phase[]) {
  return list.includes(current);
}

function GenerationHeader({ phase }: { phase: Phase }) {
  const isDone = phase === 'done';
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '14px 16px',
        background: isDone ? '#ECFDF5' : 'var(--yc-surface)',
        border: `1px solid ${isDone ? '#A7F3D0' : 'var(--yc-border)'}`,
        borderRadius: 12,
        color: isDone ? '#065F46' : 'var(--yc-text)',
        fontSize: 14,
        fontWeight: 600,
      }}
    >
      {isDone ? (
        <Check size={18} style={{ color: '#16A34A' }} />
      ) : (
        <Sparkles size={18} style={{ color: '#FF6600' }} className="vc-pulse" />
      )}
      <span style={{ flex: 1 }}>{phaseLabel[phase]}…</span>
      {!isDone && (
        <span
          aria-hidden
          style={{
            width: 14,
            height: 14,
            borderRadius: '50%',
            border: '2px solid #FF6600',
            borderRightColor: 'transparent',
            animation: 'vcSpin 0.9s linear infinite',
          }}
        />
      )}
      <style>{`
        @keyframes vcSpin { to { transform: rotate(360deg); } }
        @keyframes vcPulse { 0%,100% { opacity: 1; } 50% { opacity: 0.45; } }
        .vc-pulse { animation: vcPulse 1.2s ease-in-out infinite; }
      `}</style>
    </div>
  );
}

function DiagnosisCard({ onDone }: { onDone: () => void }) {
  const intro = 'Sarah noticed one clear market conversation you should own:';
  const { displayed: introOut, isDone: introDone } = useStreamingText(intro, {
    charsPerSecond: 600,
  });
  const { displayed: quoteOut, isDone: quoteDone } = useStreamingText(founder.diagnosis, {
    charsPerSecond: 400,
    enabled: introDone,
    onDone,
  });

  return (
    <section
      style={{
        background: '#ffffff',
        border: '1px solid var(--yc-border)',
        borderRadius: 16,
        padding: 28,
      }}
    >
      <SectionLabel icon={<Lightbulb size={14} />} text="Diagnosis" />
      <p
        style={{
          fontSize: 14,
          color: 'var(--yc-text-muted)',
          margin: '10px 0 18px',
          lineHeight: 1.55,
          minHeight: 22,
        }}
      >
        {introOut}
        {!introDone && <Caret />}
      </p>
      <blockquote
        style={{
          margin: 0,
          padding: '20px 22px',
          borderLeft: '3px solid var(--yc-orange)',
          background: 'var(--yc-surface)',
          borderRadius: '0 12px 12px 0',
          fontFamily: 'var(--font-serif)',
          fontSize: 22,
          lineHeight: 1.35,
          fontStyle: 'italic',
          color: 'var(--yc-text)',
          minHeight: 80,
        }}
      >
        <Quote
          size={18}
          style={{ color: 'var(--yc-orange)', marginRight: 8, verticalAlign: -3 }}
        />
        {quoteOut}
        {!quoteDone && introDone && <Caret />}
      </blockquote>
    </section>
  );
}

function ActionsSection({ onDone }: { onDone: () => void }) {
  const revealed = useSequentialReveal(authorityActions.length, 200);
  const firedRef = useRef(false);

  useEffect(() => {
    if (revealed >= authorityActions.length && !firedRef.current) {
      firedRef.current = true;
      const t = window.setTimeout(onDone, 150);
      return () => window.clearTimeout(t);
    }
  }, [revealed, onDone]);

  return (
    <section
      style={{
        background: '#ffffff',
        border: '1px solid var(--yc-border)',
        borderRadius: 16,
        padding: 28,
      }}
    >
      <SectionLabel icon={<Target size={14} />} text="Do these 3 things" />
      <p style={{ margin: '8px 0 20px', fontSize: 14, color: 'var(--yc-text-muted)' }}>
        In order. Start at the top.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {authorityActions.map((action, i) => (
          <ActionCard key={action.id} action={action} index={i} revealed={i < revealed} />
        ))}
      </div>
    </section>
  );
}

function ActionCard({
  action,
  index,
  revealed,
}: {
  action: (typeof authorityActions)[number];
  index: number;
  revealed: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* noop */
    }
  };

  return (
    <div
      style={{
        border: '1px solid var(--yc-border)',
        borderRadius: 12,
        padding: 18,
        background: 'var(--yc-bg)',
        opacity: revealed ? 1 : 0,
        transform: revealed ? 'translateY(0)' : 'translateY(8px)',
        transition: 'opacity 0.4s ease, transform 0.4s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: 'var(--yc-orange)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 14,
            flexShrink: 0,
          }}
        >
          {index + 1}
        </div>
        <div style={{ flex: 1 }}>
          <h4
            style={{
              margin: 0,
              fontFamily: 'var(--font-serif)',
              fontSize: 20,
              fontWeight: 500,
              letterSpacing: '-0.01em',
            }}
          >
            {action.label}
          </h4>
          <p
            style={{
              margin: '6px 0 0',
              color: 'var(--yc-text-muted)',
              fontSize: 14,
              lineHeight: 1.55,
            }}
          >
            {action.rationale}
          </p>

          {action.before && action.after && (
            <div
              style={{
                marginTop: 14,
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 10,
              }}
            >
              <DiffBlock label="Before" value={action.before} tone="muted" />
              <DiffBlock label="After" value={action.after} tone="primary" />
              <button
                type="button"
                onClick={() => copy(action.after!)}
                style={{
                  gridColumn: '1 / -1',
                  alignSelf: 'flex-start',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '7px 12px',
                  borderRadius: 999,
                  border: '1px solid var(--yc-border)',
                  background: copied ? '#ECFDF5' : '#fff',
                  color: copied ? '#15803d' : 'var(--yc-text)',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied headline' : 'Copy new headline'}
              </button>
            </div>
          )}

          {action.bullets && (
            <ul
              style={{
                margin: '12px 0 0',
                padding: '0 0 0 18px',
                fontSize: 14,
                lineHeight: 1.7,
                color: 'var(--yc-text)',
              }}
            >
              {action.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function DiffBlock({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: 'muted' | 'primary';
}) {
  const isPrimary = tone === 'primary';
  return (
    <div
      style={{
        border: `1px solid ${isPrimary ? 'var(--yc-orange)' : 'var(--yc-border)'}`,
        background: isPrimary ? '#FFF1E3' : '#fff',
        borderRadius: 10,
        padding: '12px 14px',
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 1.4,
          textTransform: 'uppercase',
          color: isPrimary ? 'var(--yc-orange)' : 'var(--yc-text-muted)',
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 14, color: 'var(--yc-text)', lineHeight: 1.45 }}>{value}</div>
    </div>
  );
}

function PostSection({ onDone }: { onDone: () => void }) {
  return (
    <section
      style={{
        background: '#ffffff',
        border: '1px solid var(--yc-border)',
        borderRadius: 16,
        padding: 28,
      }}
    >
      <SectionLabel icon={<Megaphone size={14} />} text="Ready-to-post" />
      <p style={{ margin: '8px 0 18px', fontSize: 14, color: 'var(--yc-text-muted)' }}>
        Drop this on LinkedIn today. Copy is below — image is already mocked.
      </p>
      <LinkedInPost startDelay={120} onDone={onDone} />
    </section>
  );
}

function OutreachSection({ onDone }: { onDone: () => void }) {
  const revealed = useSequentialReveal(outreachTargets.length, 28);
  const firedRef = useRef(false);

  useEffect(() => {
    if (revealed >= outreachTargets.length && !firedRef.current) {
      firedRef.current = true;
      const t = window.setTimeout(onDone, 200);
      return () => window.clearTimeout(t);
    }
  }, [revealed, onDone]);

  const counts = useMemo(() => {
    const acc = { podcast: 0, youtube: 0, newsletter_blog: 0 };
    outreachTargets.forEach((t) => {
      acc[t.type] += 1;
    });
    return acc;
  }, []);

  return (
    <section
      style={{
        background: '#ffffff',
        border: '1px solid var(--yc-border)',
        borderRadius: 16,
        padding: 28,
      }}
    >
      <SectionLabel icon={<Zap size={14} />} text="Where to be featured" />
      <p style={{ margin: '8px 0 8px', fontSize: 14, color: 'var(--yc-text-muted)' }}>
        Hand-matched to your story. Each card has a custom pitch you can copy.
      </p>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          marginBottom: 20,
          fontSize: 12,
          color: 'var(--yc-text-muted)',
        }}
      >
        <Tag>{counts.podcast} podcasts</Tag>
        <Tag>{counts.youtube} YouTube shows</Tag>
        <Tag>{counts.newsletter_blog} newsletters</Tag>
      </div>
      <QuickApplyList revealed={revealed} />
      <div
        style={{
          marginTop: 28,
          paddingTop: 24,
          borderTop: '1px solid var(--yc-border)',
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 1.2,
            textTransform: 'uppercase',
            color: 'var(--yc-text-muted)',
            marginBottom: 14,
          }}
        >
          Deep dive — full pitch tips and contact paths
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 14,
          }}
        >
          {outreachTargets.map((target, i) => (
            <OutreachCard
              key={target.id}
              target={target}
              index={i}
              revealed={i < revealed}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function extractAuthorityDomain(target: typeof outreachTargets[number]): string | undefined {
  const candidate = target.website || target.channel_url;
  if (!candidate) return undefined;
  try {
    return new URL(candidate).hostname.replace(/^www\./, '');
  } catch {
    return undefined;
  }
}

function QuickApplyList({ revealed }: { revealed: number }) {
  const groups = useMemo(() => {
    const order: Array<{ type: typeof outreachTargets[number]['type']; label: string; icon: React.ReactNode; accent: string }> = [
      { type: 'podcast', label: 'Podcasts', icon: <Headphones size={13} />, accent: '#FF6600' },
      { type: 'youtube', label: 'YouTube channels', icon: <Youtube size={13} />, accent: '#DC2626' },
      { type: 'newsletter_blog', label: 'Newsletters', icon: <Newspaper size={13} />, accent: '#2563EB' },
    ];
    return order.map((g) => ({
      ...g,
      items: outreachTargets.filter((t) => t.type === g.type),
    }));
  }, []);

  let globalIndex = 0;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 14,
      }}
    >
      {groups.map((group) => (
        <div
          key={group.type}
          style={{
            border: '1px solid var(--yc-border)',
            borderRadius: 12,
            overflow: 'hidden',
            background: 'var(--yc-bg)',
          }}
        >
          <div
            style={{
              padding: '10px 14px',
              borderBottom: '1px solid var(--yc-border)',
              background: 'var(--yc-surface)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 1.2,
              textTransform: 'uppercase',
            }}
          >
            <span style={{ color: group.accent, display: 'inline-flex' }}>{group.icon}</span>
            {group.label}
            <span
              style={{
                marginLeft: 'auto',
                color: 'var(--yc-text-muted)',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: 0,
              }}
            >
              {group.items.length}
            </span>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {group.items.map((target) => {
              const idx = globalIndex++;
              const isVisible = idx < revealed;
              const url = target.website || target.channel_url || '#';
              return (
                <li
                  key={target.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 14px',
                    borderTop: '1px solid var(--yc-border)',
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? 'translateY(0)' : 'translateY(4px)',
                    transition: 'opacity 0.3s ease, transform 0.3s ease',
                  }}
                >
                  <Logo
                    src={target.logo}
                    domain={extractAuthorityDomain(target)}
                    fallbackLabel={target.name}
                    alt={target.name}
                    size={26}
                    fallbackColor={group.accent}
                  />
                  <span
                    style={{
                      flex: 1,
                      fontSize: 13,
                      color: 'var(--yc-text)',
                      fontWeight: 500,
                      minWidth: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {target.name}
                  </span>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '4px 10px',
                      borderRadius: 999,
                      background: '#fff',
                      border: '1px solid var(--yc-border)',
                      color: 'var(--yc-text)',
                      fontSize: 11.5,
                      fontWeight: 600,
                      textDecoration: 'none',
                    }}
                  >
                    Apply
                    <ArrowUpRight size={11} />
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

function NextStepCard() {
  return (
    <section
      style={{
        background: 'linear-gradient(135deg, #FF6600, #FF884D)',
        color: '#fff',
        border: 'none',
        borderRadius: 16,
        padding: 28,
        boxShadow: '0 20px 40px -20px rgba(255, 102, 0, 0.5)',
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '3px 10px',
          background: 'rgba(255,255,255,0.18)',
          borderRadius: 999,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 1.4,
          textTransform: 'uppercase',
        }}
      >
        Next step
      </div>
      <h3
        style={{
          margin: '12px 0 0',
          fontFamily: 'var(--font-serif)',
          fontWeight: 500,
          fontSize: 28,
          lineHeight: 1.2,
          letterSpacing: '-0.01em',
        }}
      >
        {nextStep}
      </h3>
    </section>
  );
}

function SectionLabel({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        color: 'var(--yc-orange)',
      }}
    >
      {icon}
      {text}
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 10px',
        background: 'var(--yc-surface)',
        border: '1px solid var(--yc-border)',
        borderRadius: 999,
        color: 'var(--yc-text)',
        fontWeight: 600,
      }}
    >
      {children}
    </span>
  );
}

function Caret() {
  return (
    <span
      aria-hidden
      style={{
        display: 'inline-block',
        width: 7,
        height: '1em',
        marginLeft: 2,
        background: 'var(--yc-orange)',
        verticalAlign: -2,
        animation: 'caretBlink 0.9s steps(2,start) infinite',
      }}
    />
  );
}
