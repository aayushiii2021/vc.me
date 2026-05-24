import { useMemo, useState } from 'react';

interface Props {
  /** Original logo URL (e.g. https://logo.clearbit.com/a16z.com). Used to derive a domain. */
  src?: string;
  /** Explicit domain override (e.g. "a16z.com"). Takes precedence over src. */
  domain?: string;
  /** Fallback letter when no image loads. */
  fallbackLabel: string;
  size?: number;
  /** Background of the letter fallback. */
  fallbackBg?: string;
  /** Color of the letter fallback. */
  fallbackColor?: string;
  /** Border radius (defaults to size * 0.22). */
  radius?: number;
  alt?: string;
  className?: string;
}

function extractDomain(input?: string): string | null {
  if (!input) return null;
  try {
    const url = new URL(input);
    const parts = url.pathname.split('/').filter(Boolean);
    // clearbit pattern: logo.clearbit.com/<domain>
    if (url.hostname.includes('clearbit') && parts.length > 0) {
      return parts[0];
    }
    // generic: use the original hostname (strip leading www.)
    return url.hostname.replace(/^www\./, '');
  } catch {
    // Not a URL — assume it's already a bare domain.
    return /[a-z]/i.test(input) ? input.replace(/^www\./, '') : null;
  }
}

export default function Logo({
  src,
  domain,
  fallbackLabel,
  size = 44,
  fallbackBg = 'var(--yc-surface)',
  fallbackColor = 'var(--yc-text)',
  radius,
  alt = '',
  className,
}: Props) {
  const borderRadius = radius ?? Math.round(size * 0.22);
  const resolvedDomain = useMemo(() => domain || extractDomain(src), [domain, src]);

  // Source priority: Google favicon (reliable), then letter fallback.
  // Clearbit is deprecated as of 2024 so we skip it.
  const sources = useMemo(() => {
    if (!resolvedDomain) return [] as string[];
    return [
      `https://www.google.com/s2/favicons?domain=${resolvedDomain}&sz=128`,
      `https://icons.duckduckgo.com/ip3/${resolvedDomain}.ico`,
    ];
  }, [resolvedDomain]);

  const [index, setIndex] = useState(0);
  const failed = index >= sources.length;

  if (failed || sources.length === 0) {
    return (
      <div
        className={className}
        style={{
          width: size,
          height: size,
          borderRadius,
          background: fallbackBg,
          color: fallbackColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontFamily: 'var(--font-sans)',
          fontSize: Math.round(size * 0.42),
          border: '1px solid var(--yc-border)',
          flexShrink: 0,
        }}
        aria-label={alt}
      >
        {fallbackLabel.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      className={className}
      src={sources[index]}
      alt={alt}
      width={size}
      height={size}
      loading="lazy"
      onError={() => setIndex((i) => i + 1)}
      style={{
        width: size,
        height: size,
        borderRadius: 10,
        background: '#fff',
        border: '1px solid var(--yc-border)',
        objectFit: 'cover',
        flexShrink: 0,
        display: 'block',
      }}
    />
  );
}
