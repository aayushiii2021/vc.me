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
  source: 'gmi' | 'backend' | 'local';
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
            ? 'Traction is proof that somebody wants your product: revenue, active users, growth rate, retention, and customer engagement. You have signals Sarah can work with, but they need to become investor-grade metrics.'
            : 'Traction is quantitative evidence of market demand. Sarah needs proof that people actually want your product: first paying customers, active users, growth, retention, and engagement.',
        tips: [
          'Get your first 10 paying customers or signed pilots before talking to investors',
          'Track monthly growth in revenue, active users, retention, and engagement',
          'Document the exact customer actions that prove market demand',
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
            ? 'Authority is founder credibility and domain expertise. Sarah can see founder-market fit, but it should be made explicit through proof, access, advisor relationships, and trusted voices.'
            : 'Authority is why investors should believe you are the right person to build this. First-time founders can build it through industry insight, public recognition, advisor relationships, and thought leadership.',
        tips: [
          'Write a sharp founder-market-fit paragraph: why you, why this problem, why now',
          'Recruit one advisor or design partner with visible credibility in the market',
          'Publish useful insights where your customers and investors already spend attention',
          'Get featured, quoted, or invited into an industry conversation',
          'Show evidence that customers trust you with the problem, not just the product',
        ],
      },
      funding: {
        title: 'Funding',
        subtitle: fundingScore >= 55 ? 'Capital Story Emerging' : 'Capital Readiness: Early',
        score: fundingScore,
        description:
          fundingScore >= 55
            ? 'Funding readiness means you know whether this is Pre-Seed or Seed, how much runway the round buys, and which milestones make the next raise easier. Sarah sees the start of a capital story.'
            : "Funding readiness means knowing your stage, runway, use of funds, milestones, and unit economics. 'I need money to figure it out' is not a plan Sarah can defend.",
        tips: [
          'Decide if you are Pre-Seed ($10K-$500K) or Seed ($500K-$2M)',
          'Define 18-24 months of runway, burn, and hiring with a conservative budget',
          'Tie the raise to three milestones that materially de-risk the company',
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
    // Backend integration boundary:
    // `/api/founder-analysis` currently calls GMI Cloud directly when configured.
    // Backend team can preserve this response contract while swapping implementation
    // to RocketRide (`founder_readiness_interview.pipe`) or a session-based analyze call.
    const response = await fetch(`${API_URL}/api/founder-analysis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idea }),
    });

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    return (await response.json()) as FounderAnalysis;
  } catch (error) {
    console.warn('Falling back to local Sarah analysis:', error);
    return createLocalAnalysis(idea);
  }
}
