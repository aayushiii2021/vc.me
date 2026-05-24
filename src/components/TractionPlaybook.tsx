import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpRight, Calendar, Check, MapPin, Search, Sparkles, Tag } from 'lucide-react';
import {
  cities,
  curatedEvents,
  formatEventDate,
  totalScanned,
  type CuratedEvent,
  type EventFit,
} from '../lib/events-data';
import { useSequentialReveal } from '../lib/use-streaming-text';

interface Props {
  onComplete: () => void;
}

type Phase =
  | 'scan'
  | 'filter'
  | 'why'
  | 'reveal'
  | 'done';

const phaseLabel: Record<Phase, string> = {
  scan: `Scanning ${totalScanned} events across SF, NY, LA, Miami`,
  filter: 'Filtering for AI / dev-tool fit',
  why: 'Drafting why each one matters for you',
  reveal: 'Recommending events',
  done: 'Event plan ready',
};

const fitMeta: Record<EventFit, { label: string; bg: string; fg: string }> = {
  high: { label: 'High fit', bg: '#ECFDF5', fg: '#15803D' },
  medium: { label: 'Worth attending', bg: '#FFF1E3', fg: '#C2410C' },
  low: { label: 'Low fit', bg: 'var(--yc-surface)', fg: 'var(--yc-text-muted)' },
};

export default function TractionPlaybook({ onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>('scan');
  const [activeCity, setActiveCity] = useState('All');

  useEffect(() => {
    const t1 = window.setTimeout(() => setPhase('filter'), 500);
    const t2 = window.setTimeout(() => setPhase('why'), 1100);
    const t3 = window.setTimeout(() => setPhase('reveal'), 1600);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, []);

  const filtered = useMemo(
    () =>
      activeCity === 'All'
        ? curatedEvents
        : curatedEvents.filter((e) => e.city === activeCity),
    [activeCity]
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <GenerationHeader phase={phase} />
      {phase !== 'scan' && phase !== 'filter' && (
        <IntroCard cityCount={cities.length - 1} eventCount={curatedEvents.length} />
      )}
      {(phase === 'reveal' || phase === 'done') && (
        <EventsTable
          events={filtered}
          totalActive={filtered.length}
          activeCity={activeCity}
          onCityChange={setActiveCity}
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

function IntroCard({ cityCount, eventCount }: { cityCount: number; eventCount: number }) {
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
        Go where your buyers already gather
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
        {eventCount} events worth your time across {cityCount} cities
      </h3>
      <p style={{ margin: 0, color: 'var(--yc-text-muted)', fontSize: 14.5, lineHeight: 1.6 }}>
        Each event was scored for AI engineer / agent builder density. Sponsor or pitch the
        high-fit rooms first — that's where one good demo turns into three sales calls.
      </p>
    </section>
  );
}

function EventsTable({
  events,
  totalActive,
  activeCity,
  onCityChange,
  onComplete,
}: {
  events: CuratedEvent[];
  totalActive: number;
  activeCity: string;
  onCityChange: (c: string) => void;
  onComplete: () => void;
}) {
  const revealed = useSequentialReveal(events.length, 95);
  const firedRef = useRef(false);

  useEffect(() => {
    if (revealed >= events.length && !firedRef.current) {
      firedRef.current = true;
      const t = window.setTimeout(onComplete, 300);
      return () => window.clearTimeout(t);
    }
  }, [revealed, events.length, onComplete]);

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
            Curated event list
          </div>
          <div style={{ fontSize: 13, color: 'var(--yc-text-muted)', marginTop: 2 }}>
            <span
              style={{
                fontWeight: 700,
                color: 'var(--yc-text)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {Math.min(revealed, totalActive)}
            </span>
            {' / '}
            <span style={{ fontVariantNumeric: 'tabular-nums' }}>{totalActive}</span>{' '}
            recommended
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {cities.map((city) => {
            const active = city === activeCity;
            return (
              <button
                key={city}
                type="button"
                onClick={() => onCityChange(city)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 999,
                  border: active
                    ? '1px solid var(--yc-orange)'
                    : '1px solid var(--yc-border)',
                  background: active ? '#FFF1E3' : '#fff',
                  color: active ? 'var(--yc-orange)' : 'var(--yc-text)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {city}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table header */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '64px minmax(220px, 1.4fr) 130px minmax(160px, 1fr) minmax(220px, 1.6fr) 110px',
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
        className="vc-events-grid"
      >
        <span />
        <span>Event</span>
        <span>When</span>
        <span>Where</span>
        <span>Why this one</span>
        <span style={{ textAlign: 'right' }}>Action</span>
      </div>

      <div>
        {events.map((event, i) => (
          <EventRow
            key={event.id}
            event={event}
            isRevealed={i < revealed}
            isLast={i === events.length - 1}
          />
        ))}
        {revealed < events.length && <DiscoveringRow />}
      </div>
    </section>
  );
}

function EventRow({
  event,
  isRevealed,
  isLast,
}: {
  event: CuratedEvent;
  isRevealed: boolean;
  isLast: boolean;
}) {
  const fit = fitMeta[event.fit];
  const { weekday, month, day, time } = formatEventDate(event.date);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '64px minmax(220px, 1.4fr) 130px minmax(160px, 1fr) minmax(220px, 1.6fr) 110px',
        gap: 16,
        padding: '16px 20px',
        borderBottom: isLast ? 'none' : '1px solid var(--yc-border)',
        alignItems: 'center',
        opacity: isRevealed ? 1 : 0,
        transform: isRevealed ? 'translateY(0)' : 'translateY(6px)',
        transition: 'opacity 0.35s ease, transform 0.35s ease',
      }}
      className="vc-events-grid"
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 10,
          background: 'var(--yc-surface)',
          border: '1px solid var(--yc-border)',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        <img
          src={event.picture}
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          loading="lazy"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.opacity = '0';
          }}
        />
      </div>
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 4,
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{
              padding: '2px 8px',
              borderRadius: 999,
              background: fit.bg,
              color: fit.fg,
              fontSize: 10.5,
              fontWeight: 700,
              letterSpacing: 0.6,
              textTransform: 'uppercase',
            }}
          >
            {fit.label}
          </span>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 11,
              color: 'var(--yc-text-muted)',
              fontWeight: 600,
            }}
          >
            <Tag size={11} />
            {event.category}
          </span>
        </div>
        <div
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 16.5,
            fontWeight: 500,
            lineHeight: 1.25,
            letterSpacing: '-0.005em',
          }}
        >
          {event.name}
        </div>
        <div
          style={{
            fontSize: 12,
            color: 'var(--yc-text-muted)',
            marginTop: 4,
          }}
        >
          {event.price}
        </div>
      </div>
      <div style={{ fontSize: 13, color: 'var(--yc-text)' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
          <Calendar size={13} style={{ color: 'var(--yc-orange)' }} />
          {weekday} {month} {day}
        </div>
        <div style={{ fontSize: 12, color: 'var(--yc-text-muted)', marginTop: 2 }}>
          {time}
        </div>
      </div>
      <div style={{ fontSize: 13 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
          <MapPin size={13} style={{ color: 'var(--yc-orange)' }} />
          {event.city}
        </div>
        <div style={{ fontSize: 12, color: 'var(--yc-text-muted)', marginTop: 2 }}>
          {stripCity(event.location, event.city)}
        </div>
      </div>
      <div style={{ fontSize: 13, color: 'var(--yc-text)', lineHeight: 1.55 }}>{event.why}</div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <a
          href={event.luma_url}
          target="_blank"
          rel="noopener noreferrer"
          className="yc-btn-primary"
          style={{ padding: '7px 14px', fontSize: 12 }}
        >
          RSVP
          <ArrowUpRight size={13} />
        </a>
      </div>
    </div>
  );
}

function DiscoveringRow() {
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
      Discovering more events…
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
        Pick the two high-fit events closest to you this week and RSVP today.
        Bring a 90-second demo and three printed one-pagers.
      </h3>
    </section>
  );
}

function stripCity(location: string, city: string) {
  // "600 Townsend St, SoMa, San Francisco, CA" → "600 Townsend St, SoMa"
  return location
    .split(',')
    .map((s) => s.trim())
    .filter((s) => !s.includes(city) && s.length > 2)
    .slice(0, 2)
    .join(', ');
}
