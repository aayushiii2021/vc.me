import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { BadgeDollarSign, Check, Mic, MicOff, Send, Shield, TrendingUp, Volume2 } from 'lucide-react';

interface VoiceInterviewProps {
  onStartAnalysis: (idea: string) => void;
}

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
      [index: number]: {
        transcript: string;
      };
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
      'What proof do you have that people want this product? Tell me about revenue, active users, growth, retention, pilots, waitlists, or customer engagement.',
    helper: 'Sarah is listening for quantitative evidence of market demand.',
    icon: <TrendingUp size={20} />,
  },
  {
    key: 'authority',
    title: 'Authority',
    prompt:
      'Why are you the right founder to build this? Tell me about your domain expertise, track record, industry knowledge, advisors, recognition, or audience.',
    helper: 'Sarah is listening for founder credibility and founder-market fit.',
    icon: <Shield size={20} />,
  },
  {
    key: 'funding',
    title: 'Funding',
    prompt:
      'How much capital do you need, what stage are you raising for, what runway does it buy, and what milestones will you hit with it?',
    helper: 'Sarah is listening for capital readiness, runway, milestones, and unit economics.',
    icon: <BadgeDollarSign size={20} />,
  },
];

export default function VoiceInterview({ onStartAnalysis }: VoiceInterviewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<QuestionKey, string>>({
    traction: '',
    authority: '',
    funding: '',
  });
  const [draft, setDraft] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState('');
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const currentQuestion = questions[currentIndex];
  const completedCount = questions.filter((question) => answers[question.key].trim()).length;
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
    setAnswers((previous) => ({ ...previous, [currentQuestion.key]: draft.trim() }));
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

  const submitInterview = useCallback(() => {
    stopListening();
    const payload = questions
      .map((question) => `${question.title}: ${answers[question.key] || draft}`)
      .join('\n\n');
    onStartAnalysis(payload);
  }, [answers, draft, onStartAnalysis, stopListening]);

  const hasDraft = draft.trim().length > 0;
  const canSubmit = completedCount === questions.length || hasDraft;

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '96px 24px',
      }}
    >
      <div
        className="voice-interview-grid"
        style={{
          width: '100%',
          maxWidth: '1040px',
          display: 'grid',
          gridTemplateColumns: 'minmax(240px, 0.8fr) minmax(0, 1.2fr)',
          gap: '28px',
        }}
      >
        <div
          style={{
            border: '1px solid rgba(168, 85, 247, 0.18)',
            borderRadius: '8px',
            background: 'rgba(15, 23, 42, 0.72)',
            padding: '24px',
            backdropFilter: 'blur(18px)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <img
              src="/sarah-avatar.jpg"
              alt="Sarah"
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                border: '2px solid #a855f7',
                objectFit: 'cover',
              }}
            />
            <div>
              <div style={{ color: '#f8fafc', fontWeight: 700 }}>Sarah</div>
              <div style={{ color: '#94a3b8', fontSize: '13px' }}>VC.me voice analyst</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {questions.map((question, index) => {
              const isActive = index === currentIndex;
              const isComplete = Boolean(answers[question.key].trim());

              return (
                <button
                  key={question.key}
                  onClick={() => goToQuestion(index)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    width: '100%',
                    padding: '14px',
                    borderRadius: '8px',
                    border: isActive
                      ? '1px solid rgba(168, 85, 247, 0.75)'
                      : '1px solid rgba(148, 163, 184, 0.16)',
                    background: isActive ? 'rgba(168, 85, 247, 0.12)' : 'rgba(2, 6, 23, 0.38)',
                    color: '#f8fafc',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ color: isActive ? '#c084fc' : '#64748b' }}>{question.icon}</span>
                    <span>{question.title}</span>
                  </span>
                  {isComplete && <Check size={16} style={{ color: '#22c55e' }} />}
                </button>
              );
            })}
          </div>

          <div
            style={{
              marginTop: '24px',
              padding: '14px',
              borderRadius: '8px',
              background: 'rgba(2, 6, 23, 0.52)',
              color: '#94a3b8',
              fontSize: '13px',
              lineHeight: 1.6,
            }}
          >
            {completedCount}/3 answers captured. Sarah will score you after all three.
          </div>
        </div>

        <div
          style={{
            border: '1px solid rgba(168, 85, 247, 0.2)',
            borderRadius: '8px',
            background: 'rgba(15, 23, 42, 0.78)',
            padding: '32px',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 30px 80px rgba(2, 6, 23, 0.45)',
          }}
        >
          <span
            style={{
              color: '#c084fc',
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '2px',
              textTransform: 'uppercase',
            }}
          >
            Question {currentIndex + 1}: {currentQuestion.title}
          </span>

          <h2
            style={{
              marginTop: '14px',
              color: '#f8fafc',
              fontSize: 'clamp(28px, 4vw, 42px)',
              lineHeight: 1.1,
            }}
          >
            {currentQuestion.prompt}
          </h2>

          <p style={{ color: '#94a3b8', fontSize: '15px', lineHeight: 1.6, marginTop: '16px' }}>
            {currentQuestion.helper}
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '28px' }}>
            <button
              onClick={() => speak(currentQuestion.prompt)}
              style={secondaryButtonStyle}
            >
              <Volume2 size={18} />
              Ask out loud
            </button>
            <button
              onClick={isListening ? stopListening : startListening}
              style={{
                ...primaryButtonStyle,
                background: isListening
                  ? 'linear-gradient(135deg, #ef4444, #be123c)'
                  : 'linear-gradient(135deg, #a855f7, #7c3aed)',
              }}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              {isListening ? 'Stop recording' : 'Start recording'}
            </button>
          </div>

          {speechError && (
            <p style={{ marginTop: '14px', color: '#fca5a5', fontSize: '13px' }}>{speechError}</p>
          )}

          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Your answer will appear here as Sarah transcribes it. You can also type or edit it."
            style={{
              width: '100%',
              minHeight: '180px',
              resize: 'vertical',
              marginTop: '24px',
              padding: '18px',
              borderRadius: '8px',
              border: '1px solid rgba(168, 85, 247, 0.25)',
              background: 'rgba(2, 6, 23, 0.64)',
              color: '#f8fafc',
              fontSize: '15px',
              lineHeight: 1.6,
              fontFamily: 'Inter, sans-serif',
              outline: 'none',
            }}
          />

          <div
            style={{
              marginTop: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            <button
              onClick={saveCurrentAnswer}
              disabled={!hasDraft}
              style={{
                ...secondaryButtonStyle,
                opacity: hasDraft ? 1 : 0.45,
                cursor: hasDraft ? 'pointer' : 'not-allowed',
              }}
            >
              <Check size={18} />
              Save answer
            </button>
            <button
              onClick={submitInterview}
              disabled={!canSubmit}
              style={{
                ...primaryButtonStyle,
                opacity: canSubmit ? 1 : 0.45,
                cursor: canSubmit ? 'pointer' : 'not-allowed',
              }}
            >
              <Send size={18} />
              Analyze with Sarah
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const primaryButtonStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '12px 18px',
  borderRadius: '8px',
  border: 'none',
  color: '#fff',
  fontSize: '14px',
  fontWeight: 700,
  fontFamily: 'Inter, sans-serif',
  cursor: 'pointer',
};

const secondaryButtonStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '12px 18px',
  borderRadius: '8px',
  border: '1px solid rgba(148, 163, 184, 0.22)',
  background: 'rgba(2, 6, 23, 0.52)',
  color: '#e2e8f0',
  fontSize: '14px',
  fontWeight: 700,
  fontFamily: 'Inter, sans-serif',
  cursor: 'pointer',
};
