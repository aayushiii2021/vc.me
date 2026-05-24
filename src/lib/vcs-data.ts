import vcsRaw from '../data/vcs.json';
import { founder } from './playbook-data';

export interface VcContact {
  name: string;
  title: string;
  linkedin: string;
  email: string;
}

export interface VcFund {
  id: number;
  name: string;
  logo: string;
  website: string;
  location: string;
  stage: string[];
  typical_check: string;
  thesis: string;
  why_good_fit: string;
  contacts: VcContact[];
}

export interface ColdEmail {
  to: string;
  contactName: string;
  contactFirst: string;
  subject: string;
  body: string;
  mailto: string;
}

export const vcs = vcsRaw as VcFund[];

const stageOrder: Record<string, number> = {
  'Pre-Seed': 0,
  Seed: 1,
  'Series A': 2,
  'Series B': 3,
  Growth: 4,
};

export function highestStage(vc: VcFund): string {
  return [...vc.stage].sort((a, b) => stageOrder[a] - stageOrder[b])[0];
}

function firstName(full: string) {
  return full.split(' ')[0];
}

function shortVcName(vc: VcFund) {
  // strip parentheticals and keep first word for snappy subject
  const stripped = vc.name.replace(/\s*\(.*?\)\s*/g, '').trim();
  return stripped;
}

function thesisHook(vc: VcFund) {
  // First sentence of why_good_fit, lowercased lead in.
  const firstSentence = vc.why_good_fit.split('.')[0].trim();
  return firstSentence.charAt(0).toLowerCase() + firstSentence.slice(1);
}

export function buildEmail(vc: VcFund, contact: VcContact): ColdEmail {
  const first = firstName(contact.name);
  const subject = `${first} — RocketRide × ${shortVcName(vc)} fit (AI workflows)`;
  const body = `Hi ${first},

I'm ${founder.name}, founder of ${founder.company} — ${founder.positioning.toLowerCase()}.

Read your thesis on ${thesisHook(vc)}. ${founder.company} maps directly: ${founder.diagnosis} We turn weeks of glue code into one pipeline that ships to prod.

Three signals in the last 60 days:
• 1,200 developers on the waitlist after a single demo post
• 4 design partners shipping AI workflows in production
• Targeting a ${highestStage(vc)} round in the ${vc.typical_check.split('–')[0].trim()} range

Would love 20 minutes to share the deck and get your read on what to sharpen before we open the round in earnest. Free Tue/Thu next week?

— ${founder.name}
Founder, ${founder.company}
${founder.email}`;

  const mailto = `mailto:${encodeURIComponent(contact.email)}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;

  return {
    to: contact.email,
    contactName: contact.name,
    contactFirst: first,
    subject,
    body,
    mailto,
  };
}

export function allStages(): string[] {
  const seen = new Set<string>();
  vcs.forEach((vc) => vc.stage.forEach((s) => seen.add(s)));
  return ['All', ...Array.from(seen).sort((a, b) => (stageOrder[a] ?? 99) - (stageOrder[b] ?? 99))];
}
