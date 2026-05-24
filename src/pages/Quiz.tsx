import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowLeft, ArrowRight, Check, Mic, MicOff, X } from 'lucide-react';
import { analyzeFounder } from '../lib/founder-analysis';
import {
  emptyPlaybook,
  loadPlaybookAnswers,
  savePlaybookAnswers,
  saveAnalysis,
  type PlaybookAnswers,
} from '../lib/analysis-store';

interface SpeechRecognitionEventLike {
  results: {
    length: number;
    [index: number]: {
      isFinal?: boolean;
      [index: number]: { transcript: string };
    };
  };
}

interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  }
}

type MultiKey = 'stage' | 'priority';

type Step =
  | { type: 'multi'; key: MultiKey; title: string; sub: string; options: string[] }
  | { type: 'story'; key: 'story'; title: string; sub: string };

const steps: Step[] = [
  {
    type: 'multi',
    key: 'stage',
    title: 'Where are you today?',
    sub: 'Pick the closest fit.',
    options: [
      'Just an idea',
      'Building a prototype or MVP',
      'Live with early users',
      'Generating revenue',
    ],
  },
  {
    type: 'multi',
    key: 'priority',
    title: 'What matters most in the next 90 days?',
    sub: 'Pick one or more.',
    options: [
      'Build credibility & profile',
      'Find first customers',
      'Meet angels or VCs',
      'All of the above',
    ],
  },
  {
    type: 'story',
    key: 'story',
    title: 'Tell us what you’re building, who it helps, and why it matters now.',
    sub: 'Talk or type — 30 seconds is plenty.',
  },
];

export default function Quiz() {
  const navigate = useNavigate();
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<PlaybookAnswers>(
    () => loadPlaybookAnswers() || emptyPlaybook
  );
  const [submitting, setSubmitting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState('');
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const current = steps[idx];
  const isLast = idx === steps.length - 1;
  const isFirst = idx === 0;
  const progress = ((idx + 1) / steps.length) * 100;

  const speechSupported = useMemo(
    () => typeof window !== 'undefined' && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition),
    []
  );

  useEffect(() => {
    savePlaybookAnswers(answers);
  }, [answers]);

  useEffect(() => {
    if (!speechSupported) return;
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) return;
    const recognition = new Recognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; i += 1) {
        transcript += event.results[i][0].transcript;
      }
      setAnswers((prev) => ({ ...prev, story: transcript.trim() }));
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => {
      setIsListening(false);
      setSpeechError('Could not access the microphone. You can still type.');
    };
    recognitionRef.current = recognition;
    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, [speechSupported]);

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) {
      setSpeechError('Speech recognition is not available here. Type instead.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setSpeechError('');
      setIsListening(true);
      recognitionRef.current.start();
    }
  }, [isListening]);

  const toggleOption = useCallback(
    (key: MultiKey, value: string) => {
      setAnswers((prev) => {
        const list = prev[key];
        const exists = list.includes(value);
        return {
          ...prev,
          [key]: exists ? list.filter((v) => v !== value) : [...list, value],
        };
      });
    },
    []
  );

  const canAdvance = useMemo(() => {
    if (current.type === 'multi') {
      return answers[current.key].length > 0;
    }
    return answers.story.trim().length > 0;
  }, [answers, current]);

  const goNext = useCallback(async () => {
    if (!canAdvance) return;
    if (!isLast) {
      setIdx((i) => i + 1);
      return;
    }
    setSubmitting(true);
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }
    const payload = [
      `Story: ${answers.story}`,
      `Stage: ${answers.stage.join(', ')}`,
      `90-day priority: ${answers.priority.join(', ')}`,
    ].join('\n\n');
    try {
      const result = await analyzeFounder(payload);
      saveAnalysis(result);
      navigate('/results');
    } finally {
      setSubmitting(false);
    }
  }, [answers, canAdvance, isLast, isListening, navigate]);

  const goBack = useCallback(() => {
    if (isFirst) return;
    setIdx((i) => i - 1);
  }, [isFirst]);

  useEffect(() => {
    if (current.type !== 'multi') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        goNext();
        return;
      }
      const key = e.key.toUpperCase();
      if (key.length === 1 && key >= 'A' && key <= 'Z') {
        const index = key.charCodeAt(0) - 65;
        const opt = current.options[index];
        if (opt) {
          e.preventDefault();
          toggleOption(current.key, opt);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [current, goNext, toggleOption]);

  return (
    <div
      style={{
        background: 'var(--yc-bg)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        color: 'var(--yc-text)',
      }}
    >
      {/* Progress bar */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: 'var(--yc-surface)',
          zIndex: 20,
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            background: 'var(--yc-orange)',
            transition: 'width 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </div>

      {/* Minimal header */}
      <header
        style={{
          padding: '20px 24px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Link
          to="/"
          style={{
            fontFamily: 'var(--font-serif)',
            color: 'var(--yc-orange)',
            fontWeight: 600,
            fontSize: 20,
            letterSpacing: '-0.02em',
          }}
        >
          vc.me
        </Link>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            fontSize: 13,
            color: 'var(--yc-text-muted)',
          }}
        >
          <span>
            {String(idx + 1).padStart(2, '0')}{' '}
            <span style={{ opacity: 0.5 }}>/ {String(steps.length).padStart(2, '0')}</span>
          </span>
          <Link
            to="/"
            aria-label="Exit"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: 999,
              color: 'var(--yc-text-muted)',
            }}
          >
            <X size={18} />
          </Link>
        </div>
      </header>

      {/* Step content (centered) */}
      <main
        key={idx}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          maxWidth: 640,
          width: '100%',
          margin: '0 auto',
          padding: '40px 24px 140px',
          textAlign: 'center',
          animation: 'vcStep 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div
          style={{
            fontSize: 13,
            color: 'var(--yc-orange)',
            fontWeight: 600,
            letterSpacing: 1.5,
            textTransform: 'uppercase',
            marginBottom: 14,
          }}
        >
          Question {idx + 1}
        </div>
        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(28px, 4.2vw, 46px)',
            fontWeight: 500,
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            margin: 0,
            maxWidth: 640,
          }}
        >
          {current.title}
        </h1>
        <p
          style={{
            marginTop: 14,
            fontSize: 16,
            color: 'var(--yc-text-muted)',
            maxWidth: 520,
          }}
        >
          {current.sub}
        </p>

        {current.type === 'multi' && (
          <div
            style={{
              marginTop: 32,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              width: '100%',
              maxWidth: 520,
            }}
          >
            {current.options.map((opt, i) => {
              const selected = answers[current.key].includes(opt);
              const letter = String.fromCharCode(65 + i);
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => toggleOption(current.key, opt)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    width: '100%',
                    padding: '16px 18px',
                    borderRadius: 12,
                    border: selected
                      ? '1.5px solid var(--yc-orange)'
                      : '1.5px solid var(--yc-border)',
                    background: selected ? '#FFF1E3' : '#ffffff',
                    color: 'var(--yc-text)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: 'var(--font-sans)',
                    fontSize: 16,
                    fontWeight: 500,
                    transition: 'background 0.12s ease, border-color 0.12s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!selected) {
                      (e.currentTarget as HTMLButtonElement).style.background = 'var(--yc-surface)';
                      (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--yc-text-muted)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!selected) {
                      (e.currentTarget as HTMLButtonElement).style.background = '#ffffff';
                      (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--yc-border)';
                    }
                  }}
                >
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 26,
                      height: 26,
                      borderRadius: 5,
                      background: selected ? 'var(--yc-orange)' : 'var(--yc-surface)',
                      color: selected ? '#ffffff' : 'var(--yc-text)',
                      fontSize: 12,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {letter}
                  </span>
                  <span style={{ flex: 1 }}>{opt}</span>
                  {selected && (
                    <Check size={16} style={{ color: 'var(--yc-orange)', flexShrink: 0 }} />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {current.type === 'story' && (
          <div style={{ marginTop: 28, width: '100%', maxWidth: 640, textAlign: 'left' }}>
            <textarea
              autoFocus
              value={answers.story}
              onChange={(e) => setAnswers((prev) => ({ ...prev, story: e.target.value }))}
              placeholder="What it is, who it’s for, why now…"
              style={{
                width: '100%',
                minHeight: 180,
                resize: 'vertical',
                padding: '20px 22px',
                borderRadius: 16,
                border: '1px solid var(--yc-border)',
                background: '#ffffff',
                color: 'var(--yc-text)',
                fontFamily: 'var(--font-sans)',
                fontSize: 17,
                lineHeight: 1.55,
                outline: 'none',
              }}
            />
            <div
              style={{
                marginTop: 14,
                display: 'flex',
                gap: 10,
                alignItems: 'center',
                flexWrap: 'wrap',
                justifyContent: 'center',
              }}
            >
              <button
                type="button"
                onClick={toggleListening}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 18px',
                  borderRadius: 999,
                  border: '1px solid var(--yc-border)',
                  background: isListening ? '#b91c1c' : 'transparent',
                  color: isListening ? '#fff' : 'var(--yc-text)',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.15s ease, color 0.15s ease',
                }}
              >
                {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                {isListening ? 'Stop' : 'Use mic'}
              </button>
              <span style={{ fontSize: 13, color: 'var(--yc-text-muted)' }}>
                Both work — talk or type.
              </span>
            </div>
            {speechError && (
              <p style={{ marginTop: 10, color: '#b91c1c', fontSize: 13, textAlign: 'center' }}>
                {speechError}
              </p>
            )}
          </div>
        )}
      </main>

      {/* Bottom nav */}
      <footer
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '16px 24px',
          background: 'linear-gradient(to top, var(--yc-bg) 60%, rgba(251, 247, 240, 0))',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <button
          type="button"
          onClick={goBack}
          disabled={isFirst}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '10px 16px',
            borderRadius: 999,
            border: 'none',
            background: 'transparent',
            color: isFirst ? 'transparent' : 'var(--yc-text-muted)',
            cursor: isFirst ? 'default' : 'pointer',
            fontSize: 14,
            fontWeight: 500,
            pointerEvents: isFirst ? 'none' : 'auto',
          }}
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {current.type === 'multi' && (
            <span style={{ fontSize: 13, color: 'var(--yc-text-muted)' }}>
              Press{' '}
              <kbd
                style={{
                  background: 'var(--yc-surface)',
                  border: '1px solid var(--yc-border)',
                  borderRadius: 4,
                  padding: '1px 6px',
                  fontFamily: 'var(--font-sans)',
                  fontSize: 12,
                }}
              >
                Enter
              </kbd>
            </span>
          )}
          <button
            type="button"
            onClick={goNext}
            disabled={!canAdvance || submitting}
            className="yc-btn-primary"
            style={{
              opacity: !canAdvance || submitting ? 0.4 : 1,
              cursor: !canAdvance || submitting ? 'not-allowed' : 'pointer',
            }}
          >
            {submitting ? 'Generating…' : isLast ? 'Generate playbook' : 'Continue'}
            <ArrowRight size={16} />
          </button>
        </div>
      </footer>

      <style>{`
        @keyframes vcStep {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
