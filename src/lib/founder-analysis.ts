export type DimensionKey = 'traction' | 'authority' | 'funding';

export interface FounderDimension {
  title: 'Traction' | 'Authority' | 'Funding';
  subtitle: string;
  score: number;
  description: string;
  tips: string[];
}

export interface FounderAnalysis {
  idea: string;
  source: 'backend' | 'local';
  overallScore: number;
  summary: string;
  dimensions: Record<DimensionKey, FounderDimension>;
}

const API_URL = (import.meta.env.VITE_VCME_API_URL || '').replace(/\/$/, '');

const hasAny = (input: string, words: string[]) =>
  words.some((word) => input.toLowerCase().includes(word));

function clampScore(score: number) {
  return Math.max(5, Math.min(95, score));
}

export function createLocalAnalysis(idea: string): FounderAnalysis {
  const normalizedIdea = idea.trim() || 'Startup idea submitted';
  const text = normalizedIdea.toLowerCase();

  const tractionSignals = [
    hasAny(text, ['paying', 'revenue', '$', 'arr', 'mrr']) ? 24 : 0,
    hasAny(text, ['customer', 'users', 'pilot', 'waitlist', 'signed', 'retention']) ? 18 : 0,
    hasAny(text, ['growth', 'mo m', 'month over month', 'repeat', 'usage']) ? 14 : 0,
  ].reduce((sum, value) => sum + value, 18);

  const authoritySignals = [
    hasAny(text, ['ex-', 'years', 'built', 'founded', 'operator', 'engineer']) ? 18 : 0,
    hasAny(text, ['advisor', 'partner', 'network', 'community', 'expert']) ? 14 : 0,
    hasAny(text, ['healthcare', 'fintech', 'legal', 'climate', 'education', 'enterprise']) ? 10 : 0,
  ].reduce((sum, value) => sum + value, 24);

  const fundingSignals = [
    hasAny(text, ['runway', 'burn', 'raise', 'seed', 'pre-seed', 'angel']) ? 18 : 0,
    hasAny(text, ['milestone', 'model', 'unit economics', 'margin', 'cac', 'ltv']) ? 18 : 0,
    hasAny(text, ['grant', 'bootstrapped', 'profitable', 'term sheet']) ? 12 : 0,
  ].reduce((sum, value) => sum + value, 16);

  const tractionScore = clampScore(tractionSignals);
  const authorityScore = clampScore(authoritySignals);
  const fundingScore = clampScore(fundingSignals);
  const overallScore = Math.round((tractionScore + authorityScore + fundingScore) / 3);

  return {
    idea: normalizedIdea,
    source: 'local',
    overallScore,
    summary:
      overallScore >= 65
        ? 'Sarah sees real early signals, but the next step is tightening proof into investor-grade evidence.'
        : 'Sarah sees the shape of a startup, but the missing work is still proof: demand, credibility, and a fundable milestone plan.',
    dimensions: {
      traction: {
        title: 'Traction',
        subtitle: tractionScore >= 55 ? 'Early Demand Signals' : 'Market Validation Missing',
        score: tractionScore,
        description:
          tractionScore >= 55
            ? 'Traction is evidence that the market is doing something meaningful: paying, using, waiting, renewing, or referring. You have a few signs Sarah can work with, but they need to become measurable proof.'
            : "Traction is quantitative evidence of market demand: revenue, active users, growth rate, retention, pilots, or strong waitlist conversion. Right now Sarah needs more proof that people are taking action, not just nodding politely.",
        tips: [
          'Name the narrow customer segment with the highest pain and reach 20 of them this week',
          'Convert interest into a concrete action: paid pilot, LOI, waitlist deposit, or recurring usage',
          'Track activation, retention, and referral behavior from the first test users',
          'Collect customer quotes that describe the pain in their own words',
          'Define the one traction metric that would make this company undeniable',
        ],
      },
      authority: {
        title: 'Authority',
        subtitle: authorityScore >= 55 ? 'Credibility Forming' : 'Founder Credibility Gap',
        score: authorityScore,
        description:
          authorityScore >= 55
            ? 'Authority is why the market should believe you are the right person to solve this. Sarah can see some founder-market fit, but it should be made explicit through proof, access, and trusted voices.'
            : 'Authority is founder credibility: domain expertise, lived experience, market access, advisors, public insight, or a track record that makes you unusually believable. First-time founders can build this, but they have to show their homework.',
        tips: [
          'Write a sharp founder-market-fit paragraph: why you, why this problem, why now',
          'Recruit one advisor or design partner with visible credibility in the market',
          'Publish useful insight where your customers already spend attention',
          'Show evidence that customers trust you with the problem, not just the product',
          'Map the unfair access you have to buyers, data, distribution, or talent',
        ],
      },
      funding: {
        title: 'Funding',
        subtitle: fundingScore >= 55 ? 'Capital Story Emerging' : 'Capital Readiness: Early',
        score: fundingScore,
        description:
          fundingScore >= 55
            ? 'Funding readiness means you know how much capital unlocks the next proof point and why that milestone changes the company. Sarah sees some pieces, but the round story needs discipline.'
            : "Funding readiness means knowing your runway, use of funds, milestones, and why this round is the right financing path. 'We need money to figure it out' is not a plan Sarah can defend.",
        tips: [
          'Define the next 18 months of runway, burn, and hiring with a conservative budget',
          'Tie the raise to three milestones that materially de-risk the company',
          'Decide whether VC, angels, grants, revenue, or bootstrapping fits the business model',
          'Build a simple financial model with customer acquisition and gross margin assumptions',
          'Warm up investors only after the traction story has a crisp proof point',
        ],
      },
    },
  };
}

export async function analyzeFounder(idea: string): Promise<FounderAnalysis> {
  if (!API_URL) {
    return createLocalAnalysis(idea);
  }

  try {
    const response = await fetch(`${API_URL}/api/founder-analysis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idea }),
    });

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    const analysis = (await response.json()) as FounderAnalysis;
    return { ...analysis, source: 'backend' };
  } catch (error) {
    console.warn('Falling back to local Sarah analysis:', error);
    return createLocalAnalysis(idea);
  }
}
