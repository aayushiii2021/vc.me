import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { BadgeDollarSign, Check, Mic, MicOff, Send, Shield, TrendingUp, Volume2 } from 'lucide-react';
import YCTopbar from '../components/YCTopbar';
import { analyzeFounder } from '../lib/founder-analysis';
import { saveAnalysis, saveAnswers, loadAnswers, type QuizAnswers } from '../lib/analysis-store';

type QuestionKey = 'traction' | 'authority' | 'funding';

interface InterviewQuestion {
  key: QuestionKey;
  title: string;
  prompt: string;
  helper: string;
  icon: ReactNode;
}

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

const questions: InterviewQuestion[] = [
  {
    key: 'traction',
    title: 'Traction',
    prompt:
      'What proof do you have that people want this product? Cover revenue, active users, growth, retention, pilots, waitlists, or customer engagement.',
    helper: 'Sarah is listening for quantitative evidence of market demand.',
    icon: <TrendingUp size={18} style={{ color: '#FF6600' }} />,
  },
  {
    key: 'authority',
    title: 'Authority',
    prompt:
      'Why are you the right founder to build this? Cover your domain expertise, track record, advisors, recognition, or audience.',
    helper: 'Sarah is listening for founder credibility and founder-market fit.',
    icon: <Shield size={18} style={{ color: '#FF6600' }} />,
  },
  {
    key: 'funding',
    title: 'Funding',
    prompt:
      'How much capital do you need, what stage are you raising for, what runway does it buy, and what milestones will it unlock?',
    helper: 'Sarah is listening for capital readiness, runway, milestones, and unit economics.',
    icon: <BadgeDollarSign size={18} style={{ color: '#FF6600' }} />,
  },
];

export default function Quiz() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>(
    () => loadAnswers() || { traction: '', authority: '', funding: '' }
  );
  const [draft, setDraft] = useState(answers[questions[0].key] || '');
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const currentQuestion = questions[currentIndex];
  const completedCount = questions.filter((q) => answers[q.key].trim()).length;

  const speechSupported = useMemo(
    () => Boolean(window.SpeechRecognition || window.webkitSpeechRecognition),
    []
  );

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
      for (let index = 0; index < event.results.length; index += 1) {
        transcript += event.results[index][0].transcript;
      }
      setDraft(transcript.trim());
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => {
      setIsListening(false);
      setSpeechError('Sarah could not access the microphone. You can still type your answer.');
    };
    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, [speechSupported]);

  const speak = useCallback((text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.94;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  }, []);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      setSpeechError('Speech recognition is not available here. Type your answer instead.');
      return;
    }
    setSpeechError('');
    setDraft(answers[currentQuestion.key]);
    setIsListening(true);
    recognitionRef.current.start();
  }, [answers, currentQuestion.key]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const saveCurrentAnswer = useCallback(() => {
    setAnswers((prev) => {
      const next = { ...prev, [currentQuestion.key]: draft.trim() };
      saveAnswers(next);
      return next;
    });
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((index) => index + 1);
      setDraft(answers[questions[currentIndex + 1].key] || '');
    }
  }, [answers, currentIndex, currentQuestion.key, draft]);

  const goToQuestion = useCallback(
    (index: number) => {
      stopListening();
      setCurrentIndex(index);
      setDraft(answers[questions[index].key] || '');
    },
    [answers, stopListening]
  );

  const submitInterview = useCallback(async () => {
    stopListening();
    const finalAnswers: QuizAnswers = {
      ...answers,
      [currentQuestion.key]: draft.trim() || answers[currentQuestion.key],
    };
    saveAnswers(finalAnswers);
    const payload = questions
      .map((q) => `${q.title}: ${finalAnswers[q.key]}`)
      .join('\n\n');
    setSubmitting(true);
    try {
      const result = await analyzeFounder(payload);
      saveAnalysis(result);
      navigate('/results');
    } finally {
      setSubmitting(false);
    }
  }, [answers, currentQuestion.key, draft, navigate, stopListening]);

  const hasDraft = draft.trim().length > 0;
  const canSubmit = completedCount === questions.length || (completedCount === questions.length - 1 && hasDraft);

  return (
    <div style={{ background: '#fff', minHeight: '100vh', color: '#000' }}>
      <YCTopbar />

      <main className="yc-container" style={{ padding: '32px 16px 80px' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Voice quiz</h1>
          <p style={{ fontSize: 13, color: 'var(--yc-text-muted)' }}>
            {completedCount}/3 answers captured. Sarah will score you after all three.
          </p>
        </div>

        <div
          className="voice-interview-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(220px, 0.7fr) minmax(0, 1.3fr)',
            gap: 16,
          }}
        >
          {/* Question nav */}
          <aside className="yc-card" style={{ padding: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--yc-text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
              Questions
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {questions.map((q, index) => {
                const isActive = index === currentIndex;
                const isComplete = Boolean(answers[q.key].trim());
                return (
                  <button
                    key={q.key}
                    onClick={() => goToQuestion(index)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8,
                      width: '100%',
                      padding: '10px 12px',
                      border: `1px solid ${isActive ? '#FF6600' : 'var(--yc-border)'}`,
                      background: isActive ? '#FFF4EC' : '#fff',
                      color: '#000',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontFamily: 'Verdana, Geneva, sans-serif',
                      fontSize: 13,
                      fontWeight: isActive ? 700 : 400,
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {q.icon}
                      <span>
                        {index + 1}. {q.title}
                      </span>
                    </span>
                    {isComplete && <Check size={14} style={{ color: '#16a34a' }} />}
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Active question */}
          <section className="yc-card">
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#FF6600',
                textTransform: 'uppercase',
                letterSpacing: 2,
              }}
            >
              Question {currentIndex + 1} of {questions.length} — {currentQuestion.title}
            </div>

            <h2 style={{ fontSize: 22, fontWeight: 700, marginTop: 8, lineHeight: 1.3 }}>
              {currentQuestion.prompt}
            </h2>

            <p style={{ marginTop: 10, color: 'var(--yc-text-muted)', fontSize: 13 }}>
              {currentQuestion.helper}
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 18 }}>
              <button onClick={() => speak(currentQuestion.prompt)} className="yc-btn-secondary">
                <Volume2 size={16} />
                Ask out loud
              </button>
              <button
                onClick={isListening ? stopListening : startListening}
                className="yc-btn-primary"
                style={isListening ? { background: '#b91c1c', borderColor: '#b91c1c' } : undefined}
              >
                {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                {isListening ? 'Stop recording' : 'Start recording'}
              </button>
            </div>

            {speechError && (
              <p style={{ marginTop: 12, color: '#b91c1c', fontSize: 13 }}>{speechError}</p>
            )}

            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Your answer will appear here as Sarah transcribes it. You can also type or edit it."
              className="yc-input"
              style={{
                marginTop: 18,
                minHeight: 180,
                resize: 'vertical',
                lineHeight: 1.6,
              }}
            />

            <div
              style={{
                marginTop: 16,
                display: 'flex',
                justifyContent: 'space-between',
                gap: 12,
                flexWrap: 'wrap',
              }}
            >
              <button
                onClick={saveCurrentAnswer}
                disabled={!hasDraft}
                className="yc-btn-secondary"
                style={{
                  opacity: hasDraft ? 1 : 0.5,
                  cursor: hasDraft ? 'pointer' : 'not-allowed',
                }}
              >
                <Check size={16} />
                {currentIndex < questions.length - 1 ? 'Save & next' : 'Save answer'}
              </button>
              <button
                onClick={submitInterview}
                disabled={!canSubmit || submitting}
                className="yc-btn-primary"
                style={{
                  opacity: !canSubmit || submitting ? 0.5 : 1,
                  cursor: !canSubmit || submitting ? 'not-allowed' : 'pointer',
                }}
              >
                <Send size={16} />
                {submitting ? 'Analyzing…' : 'Analyze with Sarah'}
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
