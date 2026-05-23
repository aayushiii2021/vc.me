import type { FounderAnalysis } from './founder-analysis';

const ANSWERS_KEY = 'vcme:answers';
const ANALYSIS_KEY = 'vcme:analysis';

export type QuizAnswers = {
  traction: string;
  authority: string;
  funding: string;
};

export function saveAnswers(answers: QuizAnswers) {
  sessionStorage.setItem(ANSWERS_KEY, JSON.stringify(answers));
}

export function loadAnswers(): QuizAnswers | null {
  const raw = sessionStorage.getItem(ANSWERS_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as QuizAnswers;
  } catch {
    return null;
  }
}

export function saveAnalysis(analysis: FounderAnalysis) {
  sessionStorage.setItem(ANALYSIS_KEY, JSON.stringify(analysis));
}

export function loadAnalysis(): FounderAnalysis | null {
  const raw = sessionStorage.getItem(ANALYSIS_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as FounderAnalysis;
  } catch {
    return null;
  }
}

export function clearAll() {
  sessionStorage.removeItem(ANSWERS_KEY);
  sessionStorage.removeItem(ANALYSIS_KEY);
}
