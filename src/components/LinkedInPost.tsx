import { useMemo, useState } from 'react';
import { Check, Copy, Globe, MessageCircle, Repeat2, Send, ThumbsUp } from 'lucide-react';
import { useStreamingText } from '../lib/use-streaming-text';
import { founder, linkedInPost } from '../lib/playbook-data';
import BeforeAfterGraphic from './BeforeAfterGraphic';

interface Props {
  startDelay?: number;
  onDone?: () => void;
}

export default function LinkedInPost({ startDelay = 0, onDone }: Props) {
  const { displayed, isDone } = useStreamingText(linkedInPost.body, {
    charsPerSecond: 700,
    startDelay,
    onDone,
  });
  const [copied, setCopied] = useState(false);

  const reactionsLabel = useMemo(() => linkedInPost.reactions.toLocaleString(), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(linkedInPost.body);
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
        border: '1px solid #E0E0E0',
        borderRadius: 12,
        fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
        color: '#000',
        overflow: 'hidden',
        boxShadow: '0 4px 18px rgba(15, 23, 42, 0.06)',
      }}
    >
      {/* Header */}
      <div style={{ padding: '14px 16px 8px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #FF6600, #FFB36B)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 18,
            flexShrink: 0,
            overflow: 'hidden',
          }}
        >
          {founder.avatarUrl ? (
            <img
              src={founder.avatarUrl}
              alt={founder.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => {
                const img = e.currentTarget as HTMLImageElement;
                img.style.display = 'none';
                if (img.parentElement) img.parentElement.textContent = founder.initials;
              }}
            />
          ) : (
            founder.initials
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#000' }}>
            {founder.name} <span style={{ color: '#666', fontWeight: 400 }}>· You</span>
          </div>
          <div style={{ fontSize: 12, color: '#666', lineHeight: 1.4 }}>
            {founder.newHeadline}
          </div>
          <div
            style={{
              fontSize: 12,
              color: '#666',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              marginTop: 2,
            }}
          >
            Just now · <Globe size={11} />
          </div>
        </div>
        <button
          onClick={copy}
          aria-label="Copy post"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            borderRadius: 999,
            border: '1px solid #E0E0E0',
            background: '#fff',
            color: copied ? '#16a34a' : '#0a66c2',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      {/* Body */}
      <div
        style={{
          padding: '4px 16px 14px',
          fontSize: 14.5,
          color: '#1c1c1c',
          whiteSpace: 'pre-wrap',
          minHeight: 168,
          lineHeight: 1.55,
        }}
      >
        {displayed}
        {!isDone && (
          <span
            aria-hidden
            style={{
              display: 'inline-block',
              width: 8,
              height: 18,
              marginLeft: 2,
              background: '#0a66c2',
              verticalAlign: -3,
              animation: 'caretBlink 0.9s steps(2,start) infinite',
            }}
          />
        )}
      </div>

      {/* Image */}
      <div
        style={{
          padding: '0 16px 14px',
          opacity: isDone ? 1 : 0.55,
          transform: isDone ? 'translateY(0)' : 'translateY(8px)',
          transition: 'opacity 0.6s ease, transform 0.6s ease',
        }}
      >
        <BeforeAfterGraphic />
      </div>

      {/* Reaction summary */}
      <div
        style={{
          padding: '0 16px 8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 12,
          color: '#666',
        }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <div style={{ display: 'inline-flex' }}>
            <Bubble bg="#0a66c2" emoji="👍" />
            <Bubble bg="#df704d" emoji="❤️" offset />
            <Bubble bg="#f5b22d" emoji="💡" offset />
          </div>
          <span>{reactionsLabel}</span>
        </div>
        <div style={{ display: 'inline-flex', gap: 10 }}>
          <span>{linkedInPost.comments} comments</span>
          <span>·</span>
          <span>{linkedInPost.reposts} reposts</span>
        </div>
      </div>

      <div
        style={{
          margin: '0 16px',
          borderTop: '1px solid #E6E6E6',
        }}
      />

      {/* Action bar */}
      <div
        style={{
          padding: 4,
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 4,
        }}
      >
        <ActionBtn icon={<ThumbsUp size={16} />} label="Like" />
        <ActionBtn icon={<MessageCircle size={16} />} label="Comment" />
        <ActionBtn icon={<Repeat2 size={16} />} label="Repost" />
        <ActionBtn icon={<Send size={16} />} label="Send" />
      </div>

      <style>{`
        @keyframes caretBlink { 50% { opacity: 0; } }
      `}</style>
    </div>
  );
}

function Bubble({ bg, emoji, offset }: { bg: string; emoji: string; offset?: boolean }) {
  return (
    <span
      style={{
        width: 18,
        height: 18,
        borderRadius: '50%',
        background: bg,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 10,
        border: '2px solid #fff',
        marginLeft: offset ? -6 : 0,
      }}
    >
      {emoji}
    </span>
  );
}

function ActionBtn({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: '10px 8px',
        background: 'transparent',
        border: 'none',
        color: '#666',
        cursor: 'pointer',
        borderRadius: 6,
        fontSize: 13,
        fontWeight: 600,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = '#F3F2EF';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
      }}
    >
      {icon}
      {label}
    </button>
  );
}
