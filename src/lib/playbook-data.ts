import authorityRaw from '../data/authority.json';

export type OutreachType = 'podcast' | 'youtube' | 'newsletter_blog';

export interface OutreachTarget {
  id: number;
  type: OutreachType;
  name: string;
  subtitle?: string;
  logo?: string;
  website?: string;
  channel_url?: string;
  hosts?: string[];
  host?: string;
  topics?: string[];
  audience?: string;
  estimated_listeners?: string;
  estimated_reach?: string;
  episode_cadence?: string;
  posting_cadence?: string;
  subscribers?: string;
  platforms?: string[];
  why_good_fit?: string;
  how_to_pitch?: string;
  pitch_tips?: string;
  social?: Record<string, string>;
}

export const outreachTargets = authorityRaw as OutreachTarget[];

export const founder = {
  name: 'Joe Maionchi',
  initials: 'JM',
  avatarUrl:
    'https://media.licdn.com/dms/image/v2/D5635AQHaYehHYXrCBg/profile-framedphoto-shrink_800_800/profile-framedphoto-shrink_800_800/0/1638164060343?e=1780185600&v=beta&t=tNB6gKLHlvQ3n0NY0qqh3wHcgfpEGzhm3xEuViadGBo',
  email: 'joe@rocketride.dev',
  company: 'RocketRide',
  positioning: 'Helping developers ship AI workflows faster',
  currentHeadline: 'Founder of RocketRide',
  newHeadline: 'Founder of RocketRide | Helping developers ship AI workflows faster',
  diagnosis:
    'AI teams can prototype fast, but shipping reliable AI workflows is still too slow.',
};

export const authorityActions = [
  {
    id: 'headline',
    label: 'Update your LinkedIn headline',
    rationale:
      'A specific market conversation beats a job title. Investors and users skim this in 2 seconds.',
    before: 'Founder of RocketRide',
    after: 'Founder of RocketRide | Helping developers ship AI workflows faster',
  },
  {
    id: 'demo-content',
    label: 'Publish demo-led content',
    rationale:
      'Show, do not tell. Three short clips beat a manifesto. People share what they can see in 10 seconds.',
    bullets: [
      'AI workflow before RocketRide',
      'AI workflow built with RocketRide',
      'How fast someone goes from idea to working workflow',
    ],
  },
  {
    id: 'proof-assets',
    label: 'Turn active users into proof',
    rationale:
      'Your first 10 users are your authority engine. Capture proof before they churn or get distracted.',
    bullets: [
      'A short user quote',
      'A demo clip',
      'A build-in-public metric',
      'A mini case study: "How one developer shipped an AI workflow with RocketRide"',
    ],
  },
];

export const linkedInPost = {
  body: `AI prototypes are easy now.
Production AI workflows are still painful.

The hard part is not calling an LLM.
It is connecting models, tools, data, evals, and deployment without turning your codebase into glue.

That is why we are building RocketRide: to help developers ship AI workflows faster.`,
  reactions: 247,
  comments: 38,
  reposts: 12,
};

export const nextStep =
  'Update the LinkedIn headline today and publish one demo post this week.';
