import eventsRaw from '../data/events.json';

export type EventFit = 'high' | 'medium' | 'low';

export interface RawEvent {
  id: number;
  city: string;
  name: string;
  picture: string;
  date: string;
  price: string;
  location: string;
  luma_url: string;
}

export interface CuratedEvent extends RawEvent {
  fit: EventFit;
  why: string;
  category: string;
}

// Hand-written `why` + fit per event. Tuned for a devtools founder selling to
// AI engineers / agent builders (RocketRide).
const annotations: Record<number, Pick<CuratedEvent, 'fit' | 'why' | 'category'>> = {
  1: {
    fit: 'medium',
    why: 'Google I/O lead-in pulls a wide ML/web crowd. Good for awareness; expect breadth over depth.',
    category: 'Hackathon',
  },
  2: {
    fit: 'high',
    why: 'a16z + Accel + Decagon in one room. Enterprise AI buyers AND the investors funding them — both audiences you need.',
    category: 'Investor mixer',
  },
  3: {
    fit: 'high',
    why: 'Agent builders are literally your ICP. Hard-problems framing means people there are wrestling with the exact pain RocketRide solves.',
    category: 'Meetup',
  },
  4: {
    fit: 'high',
    why: 'Codex community = OpenAI-native developers shipping AI workflows. High intent, low BS, perfect for a hands-on demo.',
    category: 'Hackathon',
  },
  5: {
    fit: 'medium',
    why: 'HeyGen audience skews multimodal AI. Worth attending for connections; weak commercial signal for devtools.',
    category: 'Pop-up',
  },
  6: {
    fit: 'high',
    why: 'Physical AI + Boost VC office hours. Two birds: live-feedback from technical founders and direct VC face time.',
    category: 'Office hours',
  },
  7: {
    fit: 'high',
    why: 'Agentic engineering is the exact category. NYC version of #3 — same ICP, different coast.',
    category: 'Hackathon',
  },
  8: {
    fit: 'high',
    why: 'Enterprise AI agents + security + deployment. These are the buyers who pay $50K+/yr for the right tool.',
    category: 'Conference',
  },
  9: {
    fit: 'high',
    why: '"AI Engineers: Devs & Drinks" is bullseye ICP in casual setting. Low-friction first conversation, high follow-up rate.',
    category: 'Meetup',
  },
  10: {
    fit: 'medium',
    why: 'Lovable + McKinsey crowd skews finance/no-code. Useful for indirect referrals into AI engineering teams.',
    category: 'Hackathon',
  },
  11: {
    fit: 'medium',
    why: 'Ramp\'s design community = early-stage operators with budget. Indirect path to dev teams via design partners.',
    category: 'Meetup',
  },
  13: {
    fit: 'high',
    why: 'Agentic AI in LA is small but tight-knit. You\'ll meet everyone in the scene in one night.',
    category: 'Meetup',
  },
  14: {
    fit: 'medium',
    why: 'XPRIZE + Range Media = futurists and media. Better for press connections than direct sales.',
    category: 'Networking',
  },
  15: {
    fit: 'medium',
    why: 'Lovable founder series brings the no-code-curious. Some will be AI engineers; most will be product founders.',
    category: 'Founder series',
  },
  17: {
    fit: 'medium',
    why: 'Generative AI applied to film. Adjacent ICP — interesting for partnerships, not first-customer hunting.',
    category: 'Showcase',
  },
  19: {
    fit: 'high',
    why: 'Cursor users are RocketRide\'s exact buyer profile. A hackathon where they\'re building = peak intent.',
    category: 'Hackathon',
  },
  20: {
    fit: 'medium',
    why: 'TikTok for Business is creator-economy heavy. Worth it only if you have a creator angle for RocketRide.',
    category: 'Conference',
  },
  23: {
    fit: 'medium',
    why: 'Intimate founder dinner — high signal per attendee. Slot is invite-only-feeling so pre-RSVP and arrive sharp.',
    category: 'Dinner',
  },
};

const cityOrder = ['San Francisco', 'New York', 'Los Angeles', 'Miami'];
const fitOrder: Record<EventFit, number> = { high: 0, medium: 1, low: 2 };

export const curatedEvents: CuratedEvent[] = (eventsRaw as RawEvent[])
  .filter((e) => annotations[e.id]) // drop non-dev events (sip & paint, ceramic, etc.)
  .map((e) => ({
    ...e,
    ...annotations[e.id],
  }))
  .sort((a, b) => {
    if (a.fit !== b.fit) return fitOrder[a.fit] - fitOrder[b.fit];
    const aCity = cityOrder.indexOf(a.city);
    const bCity = cityOrder.indexOf(b.city);
    if (aCity !== bCity) return aCity - bCity;
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

export const totalScanned = (eventsRaw as RawEvent[]).length;

export const cities = ['All', ...Array.from(new Set(curatedEvents.map((e) => e.city)))];

export function formatEventDate(iso: string) {
  const d = new Date(iso);
  const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
  const month = d.toLocaleDateString('en-US', { month: 'short' });
  const day = d.getDate();
  const time = d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
  return { weekday, month, day, time };
}
