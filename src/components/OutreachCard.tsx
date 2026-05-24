import { useMemo, useState } from 'react';
import { ArrowUpRight, Check, Copy, Headphones, Mail, Newspaper, Youtube } from 'lucide-react';
import type { OutreachTarget } from '../lib/playbook-data';
import { founder } from '../lib/playbook-data';
import Logo from './Logo';

interface Props {
  target: OutreachTarget;
  index: number;
  revealed: boolean;
}

const typeMeta: Record<
  OutreachTarget['type'],
  { label: string; icon: React.ReactNode; accent: string }
> = {
  podcast: { label: 'Podcast', icon: <Headphones size={13} />, accent: '#FF6600' },
  youtube: { label: 'YouTube', icon: <Youtube size={13} />, accent: '#DC2626' },
  newsletter_blog: { label: 'Newsletter', icon: <Newspaper size={13} />, accent: '#2563EB' },
};

function extractDomainFromTarget(target: OutreachTarget): string | undefined {
  const candidate = target.website || target.channel_url;
  if (!candidate) return undefined;
  try {
    return new URL(candidate).hostname.replace(/^www\./, '');
  } catch {
    return undefined;
  }
}

function buildPitch(target: OutreachTarget) {
  const hostName =
    target.host || (target.hosts && target.hosts[0]) || `the ${target.name} team`;
  return `Hi ${hostName},

I'm ${founder.name}, founder of ${founder.company} — ${founder.positioning}.

${target.pitch_tips ? `Saw that ${target.pitch_tips.replace(/\.$/, '')}.` : ''}

I'd love to come on ${target.name}. The angle I'd bring: ${founder.diagnosis} I can walk listeners through how we built ${founder.company} to fix that, with live demos and the architecture trade-offs.

Happy to send a clip, our deck, or a 2-minute Loom — whatever's easiest.

— ${founder.name}`;
}

export default function OutreachCard({ target, index, revealed }: Props) {
  const meta = typeMeta[target.type];
  const [copied, setCopied] = useState(false);
  const pitch = useMemo(() => buildPitch(target), [target]);

  const reach =
    target.estimated_listeners || target.subscribers || target.estimated_reach || 'Niche audience';
  const cadence = target.episode_cadence || target.posting_cadence;
  const ctaUrl = target.website || target.channel_url || '#';

  const copyPitch = async () => {
    try {
      await navigator.clipboard.writeText(pitch);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* noop */
    }
  };

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid var(--yc-border)',
        borderRadius: 14,
        padding: 18,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        opacity: revealed ? 1 : 0,
        transform: revealed ? 'translateY(0)' : 'translateY(10px)',
        transition: `opacity 0.45s ease ${index * 40}ms, transform 0.45s ease ${index * 40}ms`,
        boxShadow: '0 1px 0 rgba(15, 23, 42, 0.02)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <Logo
          src={target.logo}
          domain={extractDomainFromTarget(target)}
          fallbackLabel={target.name}
          alt={target.name}
          size={44}
          fallbackColor={meta.accent}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '2px 8px',
              borderRadius: 999,
              background: `${meta.accent}15`,
              color: meta.accent,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 0.6,
              textTransform: 'uppercase',
              marginBottom: 6,
            }}
          >
            {meta.icon}
            {meta.label}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 18,
              fontWeight: 600,
              lineHeight: 1.15,
              letterSpacing: '-0.01em',
            }}
          >
            {target.name}
          </div>
          {target.subtitle && (
            <div style={{ fontSize: 13, color: 'var(--yc-text-muted)', marginTop: 2 }}>
              {target.subtitle}
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          fontSize: 12,
          color: 'var(--yc-text-muted)',
        }}
      >
        <Stat label="Reach" value={reach} />
        {cadence && <Stat label="Cadence" value={cadence} />}
      </div>

      {target.why_good_fit && (
        <p
          style={{
            margin: 0,
            fontSize: 13.5,
            lineHeight: 1.55,
            color: 'var(--yc-text)',
          }}
        >
          <strong style={{ color: meta.accent }}>Why this fits: </strong>
          {target.why_good_fit}
        </p>
      )}

      {target.pitch_tips && (
        <p
          style={{
            margin: 0,
            fontSize: 13,
            lineHeight: 1.5,
            color: 'var(--yc-text-muted)',
            background: 'var(--yc-surface)',
            border: '1px solid var(--yc-border)',
            borderRadius: 8,
            padding: '10px 12px',
          }}
        >
          <strong style={{ color: 'var(--yc-text)' }}>Pitch tip · </strong>
          {target.pitch_tips}
        </p>
      )}

      <div
        style={{
          display: 'flex',
          gap: 8,
          marginTop: 4,
          flexWrap: 'wrap',
        }}
      >
        <button
          type="button"
          onClick={copyPitch}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 14px',
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
          {copied ? 'Pitch copied' : 'Copy pitch'}
        </button>
        <a
          href={ctaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="yc-btn-primary"
          style={{ padding: '8px 14px', fontSize: 13 }}
        >
          Apply
          <ArrowUpRight size={14} />
        </a>
        {target.how_to_pitch?.includes('@') && (
          <a
            href={`mailto:${target.how_to_pitch.match(/[\w.+-]+@[\w-]+\.[\w.-]+/)?.[0]}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 12px',
              borderRadius: 999,
              border: '1px solid var(--yc-border)',
              background: 'transparent',
              color: 'var(--yc-text)',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Mail size={14} />
            Email
          </a>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
      }}
    >
      <span style={{ fontWeight: 700, color: 'var(--yc-text)' }}>{label}:</span>
      <span>{value}</span>
    </span>
  );
}
