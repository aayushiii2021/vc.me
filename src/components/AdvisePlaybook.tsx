import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Check,
  Clock,
  Film,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  Wand2,
} from 'lucide-react';

interface Props {
  onComplete: () => void;
}

type ClipState = 'pending' | 'generating' | 'ready';

interface ClipDef {
  id: string;
  title: string;
  duration: string;
  tags: string[];
  src?: string;
  description: string;
}

const clips: ClipDef[] = [
  {
    id: 'clip-1',
    title: 'How to land your first 10 dev-tool users',
    duration: '1:48',
    tags: ['First customers', 'Founder-led GTM'],
    src: '/advise-1.mp4',
    description:
      'The exact outbound playbook Sarah recommends for week one — DMs over emails, demos over decks.',
  },
  {
    id: 'clip-2',
    title: 'Raise on your demo, not your deck',
    duration: '2:14',
    tags: ['Pitching', 'Investor strategy'],
    src: '/advise-2.mp4',
    description:
      "Why investors over-index on a live demo at pre-seed, and what to cut from your deck to make room for it.",
  },
];

const queuedClip: ClipDef = {
  id: 'clip-3',
  title: 'Your custom 90-day milestone plan',
  duration: '~2:30',
  tags: ['Personalized', 'Roadmap'],
  description:
    'A Sarah-narrated walkthrough of the next 90 days for RocketRide, sequenced from your story.',
};

const generatingStatuses = [
  'Drafting script…',
  'Choosing supporting clips…',
  'Recording Sarah voiceover…',
  'Composing visuals…',
  'Rendering MP4…',
];

export default function AdvisePlaybook({ onComplete }: Props) {
  const [clipStates, setClipStates] = useState<Record<string, ClipState>>({
    'clip-1': 'generating',
    'clip-2': 'generating',
    'clip-3': 'pending',
  });
  const [showCustom, setShowCustom] = useState(false);
  const onCompleteRef = useRef(onComplete);
  const completedRef = useRef(false);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const t1 = window.setTimeout(
      () => setClipStates((prev) => ({ ...prev, 'clip-1': 'ready' })),
      1500
    );
    const t2 = window.setTimeout(
      () => setClipStates((prev) => ({ ...prev, 'clip-2': 'ready' })),
      6500
    );
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);

  // Mark complete once the two seeded clips are ready (fires exactly once).
  useEffect(() => {
    if (
      !completedRef.current &&
      clipStates['clip-1'] === 'ready' &&
      clipStates['clip-2'] === 'ready'
    ) {
      completedRef.current = true;
      onCompleteRef.current();
    }
  }, [clipStates]);

  const startCustom = () => {
    setClipStates((prev) => ({ ...prev, 'clip-3': 'generating' }));
    window.setTimeout(() => {
      setClipStates((prev) => ({ ...prev, 'clip-3': 'ready' }));
      setShowCustom(true);
    }, 11000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Header />
      <Intro />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 16,
        }}
      >
        {clips.map((clip, i) => (
          <VideoTile
            key={clip.id}
            clip={clip}
            state={clipStates[clip.id]}
            index={i}
            generationMs={i === 0 ? 1500 : 6500}
          />
        ))}
        <CustomClipTile
          clip={queuedClip}
          state={clipStates['clip-3']}
          onGenerate={startCustom}
          showCustom={showCustom}
        />
      </div>
    </div>
  );
}

function Header() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '14px 16px',
        background: 'var(--yc-surface)',
        border: '1px solid var(--yc-border)',
        borderRadius: 12,
        fontSize: 14,
        fontWeight: 600,
      }}
    >
      <Film size={18} style={{ color: '#FF6600' }} />
      <span style={{ flex: 1 }}>
        Sarah is filming short video advice tailored to your story
      </span>
      <span
        style={{
          fontSize: 12,
          color: 'var(--yc-text-muted)',
          fontWeight: 600,
        }}
      >
        Watch · Save · Share
      </span>
    </div>
  );
}

function Intro() {
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
        90 seconds of practical advice
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
        Three clips Sarah drafted for your week
      </h3>
      <p style={{ margin: 0, color: 'var(--yc-text-muted)', fontSize: 14.5, lineHeight: 1.6 }}>
        Each clip translates one piece of your playbook into a 2-minute video you can watch on a
        walk. Hit Generate on the third tile when you want one made just for you.
      </p>
    </section>
  );
}

function VideoTile({
  clip,
  state,
  index,
  generationMs,
}: {
  clip: ClipDef;
  state: ClipState;
  index: number;
  generationMs: number;
}) {
  return (
    <article
      style={{
        background: '#fff',
        border: '1px solid var(--yc-border)',
        borderRadius: 16,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          position: 'relative',
          aspectRatio: '16 / 9',
          background: '#0F172A',
          overflow: 'hidden',
        }}
      >
        {state === 'ready' && clip.src ? (
          <Player src={clip.src} />
        ) : (
          <GeneratingOverlay
            index={index}
            durationMs={generationMs}
            isGenerating={state === 'generating'}
          />
        )}
        <span
          style={{
            position: 'absolute',
            top: 10,
            left: 10,
            padding: '3px 8px',
            background: 'rgba(15, 23, 42, 0.78)',
            color: '#fff',
            fontSize: 11,
            fontWeight: 700,
            borderRadius: 999,
            letterSpacing: 0.8,
            textTransform: 'uppercase',
            backdropFilter: 'blur(8px)',
          }}
        >
          Clip {index + 1}
        </span>
        <span
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            padding: '3px 8px',
            background: 'rgba(15, 23, 42, 0.78)',
            color: '#fff',
            fontSize: 11,
            fontWeight: 600,
            borderRadius: 999,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            backdropFilter: 'blur(8px)',
          }}
        >
          <Clock size={11} />
          {clip.duration}
        </span>
      </div>
      <div style={{ padding: 18 }}>
        <h4
          style={{
            margin: 0,
            fontFamily: 'var(--font-serif)',
            fontSize: 18,
            fontWeight: 500,
            lineHeight: 1.25,
            letterSpacing: '-0.005em',
          }}
        >
          {clip.title}
        </h4>
        <p
          style={{
            margin: '6px 0 12px',
            fontSize: 13.5,
            color: 'var(--yc-text-muted)',
            lineHeight: 1.55,
          }}
        >
          {clip.description}
        </p>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {clip.tags.map((tag) => (
            <span
              key={tag}
              style={{
                padding: '3px 9px',
                borderRadius: 999,
                background: 'var(--yc-surface)',
                border: '1px solid var(--yc-border)',
                color: 'var(--yc-text-muted)',
                fontSize: 11.5,
                fontWeight: 600,
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

function GeneratingOverlay({
  index,
  durationMs,
  isGenerating,
}: {
  index: number;
  durationMs: number;
  isGenerating: boolean;
}) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState(generatingStatuses[0]);

  useEffect(() => {
    if (!isGenerating) {
      setProgress(0);
      return;
    }
    const start = performance.now();
    let cancelled = false;
    const tick = () => {
      if (cancelled) return;
      const elapsed = performance.now() - start;
      const pct = Math.min(1, elapsed / durationMs);
      setProgress(pct);
      const idx = Math.min(
        generatingStatuses.length - 1,
        Math.floor(pct * generatingStatuses.length)
      );
      setStatus(generatingStatuses[idx]);
      if (pct < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    return () => {
      cancelled = true;
    };
  }, [isGenerating, durationMs]);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background:
          'radial-gradient(circle at 30% 20%, rgba(255, 102, 0, 0.32), transparent 60%), radial-gradient(circle at 80% 80%, rgba(15, 23, 42, 0.9), #0F172A)',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: 18,
        gap: 12,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.12)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'vcPulse 1.4s ease-in-out infinite',
          }}
        >
          <Film size={26} style={{ color: '#FF8A4D' }} />
        </div>
      </div>
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: 0.4,
          color: 'rgba(255, 255, 255, 0.85)',
        }}
      >
        {status}
      </div>
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          height: 4,
          borderRadius: 999,
          background: 'rgba(255, 255, 255, 0.16)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${progress * 100}%`,
            background: 'linear-gradient(90deg, #FF6600, #FFB36B)',
            transition: 'width 0.15s ease',
          }}
        />
      </div>
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          fontSize: 11,
          fontWeight: 600,
          color: 'rgba(255, 255, 255, 0.6)',
          textAlign: 'right',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {Math.round(progress * 100)}%
      </div>
    </div>
  );
}

function Player({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setIsPlaying(true);
    } else {
      v.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setIsMuted(v.muted);
  };

  const restart = () => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = 0;
    v.play();
    setIsPlaying(true);
  };

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <video
        ref={videoRef}
        src={src}
        muted={isMuted}
        playsInline
        preload="metadata"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
        }}
        onEnded={() => setIsPlaying(false)}
      />
      {!isPlaying && (
        <button
          type="button"
          onClick={toggle}
          aria-label="Play"
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(15, 23, 42, 0.35)',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <span
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.95)',
              color: '#0F172A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 14px 30px rgba(15, 23, 42, 0.45)',
            }}
          >
            <Play size={26} fill="currentColor" />
          </span>
        </button>
      )}
      <div
        style={{
          position: 'absolute',
          bottom: 10,
          right: 10,
          display: 'flex',
          gap: 6,
        }}
      >
        <ControlBtn label={isMuted ? 'Unmute' : 'Mute'} onClick={toggleMute}>
          {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
        </ControlBtn>
        <ControlBtn label="Restart" onClick={restart}>
          <RotateCcw size={14} />
        </ControlBtn>
        <ControlBtn label={isPlaying ? 'Pause' : 'Play'} onClick={toggle}>
          {isPlaying ? <Pause size={14} /> : <Play size={14} fill="currentColor" />}
        </ControlBtn>
      </div>
    </div>
  );
}

function ControlBtn({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      style={{
        width: 30,
        height: 30,
        borderRadius: 999,
        border: 'none',
        background: 'rgba(15, 23, 42, 0.7)',
        color: '#fff',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        backdropFilter: 'blur(6px)',
      }}
    >
      {children}
    </button>
  );
}

function CustomClipTile({
  clip,
  state,
  onGenerate,
  showCustom,
}: {
  clip: ClipDef;
  state: ClipState;
  onGenerate: () => void;
  showCustom: boolean;
}) {
  return (
    <article
      style={{
        background: '#fff',
        border: '1.5px dashed var(--yc-orange)',
        borderRadius: 16,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          position: 'relative',
          aspectRatio: '16 / 9',
          background:
            state === 'generating'
              ? '#0F172A'
              : showCustom
              ? 'linear-gradient(135deg, #14532D, #0F172A)'
              : 'linear-gradient(135deg, #FFF1E3, #FFFFFF)',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {state === 'generating' && (
          <GeneratingOverlay index={2} durationMs={11000} isGenerating />
        )}
        {state === 'ready' && showCustom && <ReadyState />}
        {state === 'pending' && <IdleCTA onGenerate={onGenerate} />}
        <span
          style={{
            position: 'absolute',
            top: 10,
            left: 10,
            padding: '3px 8px',
            background:
              state === 'pending'
                ? 'rgba(255, 102, 0, 0.18)'
                : 'rgba(15, 23, 42, 0.78)',
            color: state === 'pending' ? 'var(--yc-orange)' : '#fff',
            fontSize: 11,
            fontWeight: 700,
            borderRadius: 999,
            letterSpacing: 0.8,
            textTransform: 'uppercase',
            backdropFilter: 'blur(8px)',
          }}
        >
          Clip 3 · Custom
        </span>
        {state !== 'pending' && (
          <span
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              padding: '3px 8px',
              background: 'rgba(15, 23, 42, 0.78)',
              color: '#fff',
              fontSize: 11,
              fontWeight: 600,
              borderRadius: 999,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              backdropFilter: 'blur(8px)',
            }}
          >
            <Clock size={11} />
            {clip.duration}
          </span>
        )}
      </div>
      <div style={{ padding: 18 }}>
        <h4
          style={{
            margin: 0,
            fontFamily: 'var(--font-serif)',
            fontSize: 18,
            fontWeight: 500,
            lineHeight: 1.25,
            letterSpacing: '-0.005em',
          }}
        >
          {clip.title}
        </h4>
        <p
          style={{
            margin: '6px 0 12px',
            fontSize: 13.5,
            color: 'var(--yc-text-muted)',
            lineHeight: 1.55,
          }}
        >
          {clip.description}
        </p>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {clip.tags.map((tag) => (
            <span
              key={tag}
              style={{
                padding: '3px 9px',
                borderRadius: 999,
                background: 'var(--yc-surface)',
                border: '1px solid var(--yc-border)',
                color: 'var(--yc-text-muted)',
                fontSize: 11.5,
                fontWeight: 600,
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

function IdleCTA({ onGenerate }: { onGenerate: () => void }) {
  return (
    <div
      style={{
        position: 'relative',
        textAlign: 'center',
        padding: 20,
        zIndex: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <span
        style={{
          width: 54,
          height: 54,
          borderRadius: '50%',
          background: 'var(--yc-orange)',
          color: '#fff',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 14px 30px rgba(255, 102, 0, 0.35)',
        }}
      >
        <Wand2 size={24} />
      </span>
      <button
        type="button"
        onClick={onGenerate}
        className="yc-btn-primary"
        style={{ padding: '11px 22px' }}
      >
        Generate this clip
        <Sparkles size={14} />
      </button>
      <p
        style={{
          margin: 0,
          fontSize: 12.5,
          color: 'var(--yc-text-muted)',
          maxWidth: 280,
          lineHeight: 1.5,
        }}
      >
        Sarah will record a personalized 90-second video walkthrough from your answers.
      </p>
    </div>
  );
}

function ReadyState() {
  const [now] = useState(() => new Date());
  const time = useMemo(
    () =>
      now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      }),
    [now]
  );

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: 20,
        gap: 10,
      }}
    >
      <span
        style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: 'rgba(34, 197, 94, 0.18)',
          border: '1px solid rgba(134, 239, 172, 0.6)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Check size={22} style={{ color: '#86EFAC' }} />
      </span>
      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 500 }}>
        Queued for render
      </div>
      <p
        style={{
          margin: 0,
          fontSize: 12.5,
          color: 'rgba(255, 255, 255, 0.78)',
          maxWidth: 240,
          lineHeight: 1.5,
        }}
      >
        We'll email the MP4 to Joe at {time}. Estimated delivery: 5 minutes.
      </p>
    </div>
  );
}
