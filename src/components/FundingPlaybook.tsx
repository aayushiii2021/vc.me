import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowUpRight,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Inbox,
  Linkedin,
  Mail,
  MapPin,
  Search,
  Send,
  Sparkles,
} from 'lucide-react';
import { allStages, buildEmail, highestStage, vcs, type VcFund, type VcContact } from '../lib/vcs-data';
import { useSequentialReveal } from '../lib/use-streaming-text';
import Logo from './Logo';

interface Props {
  onComplete: () => void;
}

type Phase = 'scan' | 'match' | 'draft' | 'reveal' | 'done';

const phaseLabel: Record<Phase, string> = {
  scan: 'Scanning 250+ AI-focused funds',
  match: 'Matching to RocketRide thesis',
  draft: 'Drafting personalized intros',
  reveal: 'Surfacing your best-fit funds',
  done: 'Investor outreach ready',
};

const stageColor: Record<string, { bg: string; fg: string }> = {
  'Pre-Seed': { bg: '#FEF3C7', fg: '#92400E' },
  Seed: { bg: '#FFF1E3', fg: '#C2410C' },
  'Series A': { bg: '#DBEAFE', fg: '#1D4ED8' },
  'Series B': { bg: '#E0E7FF', fg: '#4338CA' },
  Growth: { bg: '#E9D5FF', fg: '#6B21A8' },
};

export default function FundingPlaybook({ onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>('scan');
  const [activeStage, setActiveStage] = useState('All');

  useEffect(() => {
    const t1 = window.setTimeout(() => setPhase('match'), 500);
    const t2 = window.setTimeout(() => setPhase('draft'), 1100);
    const t3 = window.setTimeout(() => setPhase('reveal'), 1600);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, []);

  const stages = useMemo(() => allStages(), []);
  const filtered = useMemo(
    () =>
      activeStage === 'All'
        ? vcs
        : vcs.filter((vc) => vc.stage.includes(activeStage)),
    [activeStage]
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <GenerationHeader phase={phase} />
      {phase !== 'scan' && phase !== 'match' && (
        <IntroCard total={vcs.length} />
      )}
      {(phase === 'reveal' || phase === 'done') && (
        <FundsTable
          vcs={filtered}
          stages={stages}
          activeStage={activeStage}
          onStageChange={setActiveStage}
          onComplete={() => {
            setPhase('done');
            onComplete();
          }}
        />
      )}
      {phase === 'done' && <NextStep />}
    </div>
  );
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
        <Search size={18} style={{ color: '#FF6600' }} className="vc-pulse" />
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
    </div>
  );
}

function IntroCard({ total }: { total: number }) {
  return (
    <section
      style={{
        background: '#fff',
        border: '1px solid var(--yc-border)',
        borderRadius: 16,
        padding: 28,
      }}
    >
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
        <Sparkles size={14} />
        Email-ready introductions
      </div>
      <h3
        style={{
          margin: '10px 0 8px',
          fontFamily: 'var(--font-serif)',
          fontSize: 26,
          fontWeight: 500,
          letterSpacing: '-0.01em',
        }}
      >
        {total} funds matched to your thesis — emails already written
      </h3>
      <p style={{ margin: 0, color: 'var(--yc-text-muted)', fontSize: 14.5, lineHeight: 1.6 }}>
        Click any row to open the cold email. Subject + body are personalized to the partner
        and the firm's published thesis. Copy, edit a sentence, send.
      </p>
    </section>
  );
}

function FundsTable({
  vcs: list,
  stages,
  activeStage,
  onStageChange,
  onComplete,
}: {
  vcs: VcFund[];
  stages: string[];
  activeStage: string;
  onStageChange: (s: string) => void;
  onComplete: () => void;
}) {
  const revealed = useSequentialReveal(list.length, 80);
  const [openId, setOpenId] = useState<number | null>(null);
  const firedRef = useRef(false);

  useEffect(() => {
    if (revealed >= list.length && !firedRef.current) {
      firedRef.current = true;
      const t = window.setTimeout(onComplete, 300);
      return () => window.clearTimeout(t);
    }
  }, [revealed, list.length, onComplete]);

  // collapse expansion when filter changes
  useEffect(() => {
    setOpenId(null);
  }, [activeStage]);

  return (
    <section
      style={{
        background: '#fff',
        border: '1px solid var(--yc-border)',
        borderRadius: 16,
        overflow: 'hidden',
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--yc-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 1.5,
              textTransform: 'uppercase',
              color: 'var(--yc-orange)',
            }}
          >
            Best-fit investor list
          </div>
          <div style={{ fontSize: 13, color: 'var(--yc-text-muted)', marginTop: 2 }}>
            <span style={{ fontWeight: 700, color: 'var(--yc-text)', fontVariantNumeric: 'tabular-nums' }}>
              {Math.min(revealed, list.length)}
            </span>
            {' / '}
            <span style={{ fontVariantNumeric: 'tabular-nums' }}>{list.length}</span>{' '}
            with drafted emails
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {stages.map((stage) => {
            const active = stage === activeStage;
            return (
              <button
                key={stage}
                type="button"
                onClick={() => onStageChange(stage)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 999,
                  border: active ? '1px solid var(--yc-orange)' : '1px solid var(--yc-border)',
                  background: active ? '#FFF1E3' : '#fff',
                  color: active ? 'var(--yc-orange)' : 'var(--yc-text)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {stage}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table header */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '52px minmax(220px, 1.4fr) minmax(180px, 1fr) 110px minmax(240px, 1.6fr) 120px',
          gap: 16,
          padding: '12px 20px',
          background: 'var(--yc-surface)',
          borderBottom: '1px solid var(--yc-border)',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 1.2,
          textTransform: 'uppercase',
          color: 'var(--yc-text-muted)',
        }}
      >
        <span />
        <span>Fund</span>
        <span>Stage · Check</span>
        <span>Stage fit</span>
        <span>Why this one</span>
        <span style={{ textAlign: 'right' }}>Email</span>
      </div>

      <div>
        {list.map((vc, i) => (
          <FundRow
            key={vc.id}
            vc={vc}
            isRevealed={i < revealed}
            isLast={i === list.length - 1}
            isOpen={openId === vc.id}
            onToggle={() => setOpenId((prev) => (prev === vc.id ? null : vc.id))}
          />
        ))}
        {revealed < list.length && <ScanningRow />}
      </div>
    </section>
  );
}

function FundRow({
  vc,
  isRevealed,
  isLast,
  isOpen,
  onToggle,
}: {
  vc: VcFund;
  isRevealed: boolean;
  isLast: boolean;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const topStage = highestStage(vc);
  const stageMeta = stageColor[topStage] || { bg: 'var(--yc-surface)', fg: 'var(--yc-text-muted)' };
  const [selectedContact, setSelectedContact] = useState<VcContact>(vc.contacts[0]);
  const email = useMemo(() => buildEmail(vc, selectedContact), [vc, selectedContact]);

  return (
    <div
      style={{
        borderBottom: isLast ? 'none' : '1px solid var(--yc-border)',
        opacity: isRevealed ? 1 : 0,
        transform: isRevealed ? 'translateY(0)' : 'translateY(6px)',
        transition: 'opacity 0.35s ease, transform 0.35s ease',
        background: isOpen ? 'var(--yc-surface)' : 'transparent',
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        style={{
          display: 'grid',
          gridTemplateColumns: '52px minmax(220px, 1.4fr) minmax(180px, 1fr) 110px minmax(240px, 1.6fr) 120px',
          gap: 16,
          padding: '16px 20px',
          width: '100%',
          alignItems: 'center',
          border: 'none',
          background: 'transparent',
          color: 'var(--yc-text)',
          textAlign: 'left',
          cursor: 'pointer',
          fontFamily: 'var(--font-sans)',
        }}
      >
        <Logo
          src={vc.logo}
          fallbackLabel={vc.name}
          alt={vc.name}
          size={44}
        />
        <div>
          <div
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 16.5,
              fontWeight: 500,
              letterSpacing: '-0.005em',
              lineHeight: 1.2,
            }}
          >
            {vc.name}
          </div>
          <div
            style={{
              fontSize: 12,
              color: 'var(--yc-text-muted)',
              marginTop: 4,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <MapPin size={11} />
            {vc.location}
          </div>
        </div>
        <div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {vc.stage.map((s) => {
              const meta = stageColor[s] || { bg: 'var(--yc-surface)', fg: 'var(--yc-text-muted)' };
              return (
                <span
                  key={s}
                  style={{
                    padding: '2px 8px',
                    borderRadius: 999,
                    background: meta.bg,
                    color: meta.fg,
                    fontSize: 10.5,
                    fontWeight: 700,
                    letterSpacing: 0.4,
                  }}
                >
                  {s}
                </span>
              );
            })}
          </div>
          <div
            style={{
              marginTop: 6,
              fontSize: 12,
              color: 'var(--yc-text-muted)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {vc.typical_check}
          </div>
        </div>
        <div>
          <span
            style={{
              padding: '4px 10px',
              borderRadius: 999,
              background: stageMeta.bg,
              color: stageMeta.fg,
              fontSize: 11.5,
              fontWeight: 700,
            }}
          >
            {topStage}
          </span>
        </div>
        <div style={{ fontSize: 13, color: 'var(--yc-text)', lineHeight: 1.55 }}>
          {vc.why_good_fit}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 12px',
              borderRadius: 999,
              background: isOpen ? 'var(--yc-text)' : '#fff',
              color: isOpen ? '#fff' : 'var(--yc-text)',
              border: `1px solid ${isOpen ? 'var(--yc-text)' : 'var(--yc-border)'}`,
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            <Mail size={13} />
            {isOpen ? 'Hide' : 'Open'}
            {isOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </span>
        </div>
      </button>

      {isOpen && (
        <EmailPanel
          vc={vc}
          contact={selectedContact}
          email={email}
          onSelectContact={setSelectedContact}
        />
      )}
    </div>
  );
}

function EmailPanel({
  vc,
  contact,
  email,
  onSelectContact,
}: {
  vc: VcFund;
  contact: VcContact;
  email: ReturnType<typeof buildEmail>;
  onSelectContact: (c: VcContact) => void;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`Subject: ${email.subject}\n\n${email.body}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* noop */
    }
  };

  return (
    <div
      style={{
        padding: '0 20px 20px',
        display: 'grid',
        gridTemplateColumns: 'minmax(240px, 280px) 1fr',
        gap: 16,
        animation: 'vcEmailIn 0.3s ease',
      }}
      className="vc-funding-expansion"
    >
      <style>{`
        @keyframes vcEmailIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 840px) {
          .vc-funding-expansion { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Contacts column */}
      <div
        style={{
          background: '#fff',
          border: '1px solid var(--yc-border)',
          borderRadius: 12,
          padding: 16,
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 1.4,
            textTransform: 'uppercase',
            color: 'var(--yc-text-muted)',
            marginBottom: 10,
          }}
        >
          Pick a partner
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {vc.contacts.map((c) => {
            const active = c.email === contact.email;
            return (
              <button
                key={c.email}
                type="button"
                onClick={() => onSelectContact(c)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: `1px solid ${active ? 'var(--yc-orange)' : 'var(--yc-border)'}`,
                  background: active ? '#FFF1E3' : '#fff',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                  color: 'var(--yc-text)',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: active ? 'var(--yc-orange)' : 'var(--yc-surface)',
                    color: active ? '#fff' : 'var(--yc-text)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: 12,
                    flexShrink: 0,
                  }}
                >
                  {c.name
                    .split(' ')
                    .map((p) => p[0])
                    .slice(0, 2)
                    .join('')}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700 }}>{c.name}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--yc-text-muted)' }}>{c.title}</div>
                </div>
                <a
                  href={c.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  aria-label={`${c.name} on LinkedIn`}
                  style={{
                    color: '#0a66c2',
                    display: 'inline-flex',
                    padding: 6,
                  }}
                >
                  <Linkedin size={15} />
                </a>
              </button>
            );
          })}
        </div>
      </div>

      {/* Gmail compose */}
      <div
        style={{
          background: '#fff',
          borderRadius: 12,
          border: '1px solid var(--yc-border)',
          boxShadow: '0 12px 28px -16px rgba(15, 23, 42, 0.18)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            background: '#404040',
            color: '#fff',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <Inbox size={14} />
            New message
          </span>
          <span style={{ fontSize: 12, fontWeight: 400, opacity: 0.7 }}>Drafted by Sarah</span>
        </div>
        <div
          style={{
            padding: '12px 16px',
            borderBottom: '1px solid #E5E7EB',
            fontSize: 13,
            color: '#1F2937',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            display: 'flex',
            gap: 8,
          }}
        >
          <span style={{ color: '#6B7280', minWidth: 30 }}>To</span>
          <span style={{ fontWeight: 500 }}>
            {contact.name} &lt;{contact.email}&gt;
          </span>
        </div>
        <div
          style={{
            padding: '12px 16px',
            borderBottom: '1px solid #E5E7EB',
            fontSize: 14,
            color: '#1F2937',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontWeight: 700,
          }}
        >
          {email.subject}
        </div>
        <div
          style={{
            padding: '16px',
            whiteSpace: 'pre-wrap',
            color: '#1F2937',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: 14,
            lineHeight: 1.6,
            minHeight: 220,
          }}
        >
          {email.body}
        </div>
        <div
          style={{
            padding: '10px 14px',
            background: '#F9FAFB',
            borderTop: '1px solid #E5E7EB',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 8,
            flexWrap: 'wrap',
          }}
        >
          <a
            href={email.mailto}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 16px',
              background: '#0B57D0',
              color: '#fff',
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 600,
              textDecoration: 'none',
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            <Send size={14} />
            Send
          </a>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              type="button"
              onClick={copy}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 12px',
                borderRadius: 999,
                background: copied ? '#ECFDF5' : '#fff',
                border: '1px solid var(--yc-border)',
                color: copied ? '#15803D' : 'var(--yc-text)',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
              }}
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <a
              href={vc.website}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 12px',
                borderRadius: 999,
                background: '#fff',
                border: '1px solid var(--yc-border)',
                color: 'var(--yc-text)',
                fontSize: 12,
                fontWeight: 600,
                textDecoration: 'none',
                fontFamily: 'var(--font-sans)',
              }}
            >
              {vc.name.split(' ')[0]} site
              <ArrowUpRight size={13} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScanningRow() {
  return (
    <div
      style={{
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        fontSize: 13,
        color: 'var(--yc-text-muted)',
        background: 'var(--yc-surface)',
      }}
    >
      <span
        aria-hidden
        style={{
          width: 12,
          height: 12,
          borderRadius: '50%',
          border: '2px solid var(--yc-orange)',
          borderRightColor: 'transparent',
          animation: 'vcSpin 0.9s linear infinite',
        }}
      />
      Drafting more intros…
    </div>
  );
}

function NextStep() {
  return (
    <section
      style={{
        background: 'linear-gradient(135deg, #FF6600, #FF884D)',
        color: '#fff',
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
          fontSize: 26,
          lineHeight: 1.25,
          letterSpacing: '-0.01em',
        }}
      >
        Send your three highest-fit emails this week. Don't batch — space them out so each reply
        gets a focused follow-up.
      </h3>
    </section>
  );
}
