# VC.me GMI Cloud Backend Workflow

Sarah should be a GMI Cloud-backed conversational founder-readiness coach.

## Product Flow

1. The frontend opens a Sarah interview session.
2. Sarah asks three questions: Traction, Authority, and Funding.
3. The browser captures speech and produces the transcript for the prototype conversation.
4. The frontend sends final transcript segments to the backend.
5. The backend stores the interview session and sends the full transcript to GMI Cloud.
6. GMI Cloud returns strict JSON with scores, advice, and Sarah's voice readout.
7. The frontend renders the Traction, Authority, and Funding dashboard.
8. Sarah speaks the readout with browser speech synthesis for now; a GMI Cloud audio node can replace this for production voice generation.

## Voice Layer

Current MVP:

- Browser Web Speech API handles speech-to-text.
- Browser speech synthesis reads Sarah's questions and final summary.

Backend integration points are already commented in:

- `src/sections/VoiceInterview.tsx`
- `scripts/vcme_api.py`

If we need Google products for the voice layer, use the Google I/O-era Gemini Live API / Gemini 2.5 native audio path for real-time voice conversation. Keep it behind the backend so API keys and model selection never ship to the browser. GMI Cloud should remain Sarah's scoring and advice model unless the product decision changes.

## GMI Cloud

GMI Cloud is the required AI inference layer for Sarah. The local backend calls:

```text
POST https://api.gmi-serving.com/v1/chat/completions
```

Required env:

```bash
GMI_API_KEY=
GMI_MODEL=deepseek-v3
```

Optional env:

```bash
GMI_ORG_ID=
GMI_CHAT_URL=https://api.gmi-serving.com/v1/chat/completions
```

`ROCKETRIDE_GMI_CLOUD_APIKEY` and `ROCKETRIDE_GMI_ORG_ID` are also accepted for local compatibility with the RocketRide pipeline.

## Sarah JSON Contract

The backend asks GMI Cloud for valid JSON only:

```json
{
  "overallScore": 0,
  "summary": "",
  "dimensions": {
    "traction": { "title": "Traction", "subtitle": "", "score": 0, "description": "", "tips": [] },
    "authority": { "title": "Authority", "subtitle": "", "score": 0, "description": "", "tips": [] },
    "funding": { "title": "Funding", "subtitle": "", "score": 0, "description": "", "tips": [] }
  },
  "voiceReadout": ""
}
```

Sarah should score only from the founder transcript:

- **Traction:** quantitative market demand: revenue, active users, growth, retention, and customer engagement.
- **Authority:** founder credibility: track record, domain expertise, recognition, advisors, and thought leadership.
- **Funding:** capital readiness: Pre-Seed or Seed stage, runway, milestones, and unit economics.

## RocketRide Workflow

RocketRide should mirror the same GMI Cloud scoring workflow visually:

```text
dropper -> parse -> question -> prompt -> llm_gmi_cloud -> response_answers
```

Pipeline file:

```text
pipelines/founder_readiness_interview.pipe
```

Input payload:

```json
{
  "session_id": "demo-founder-001",
  "answers": {
    "traction": "We have 12 paying customers...",
    "authority": "I spent six years in this market...",
    "funding": "We are raising 750K for 20 months..."
  }
}
```

Drop `data/sample_founder_interview.json` onto the RocketRide dropper node to test.

## Backend API Shape

Current local backend:

- `GET /health`
- `GET /api/interview-questions`
- `POST /api/founder-analysis`
- `POST /api/interview-sessions`
- `POST /api/interview-sessions/:id/transcript`
- `POST /api/interview-sessions/:id/analyze`

The direct scoring endpoints call GMI Cloud when `GMI_API_KEY` or `ROCKETRIDE_GMI_CLOUD_APIKEY` is configured. Without a key, they fall back to the local deterministic scorer so the frontend can still be developed.

## Local Setup

```bash
cp .env.example .env
npm install
npm run backend
VITE_VCME_API_URL=http://127.0.0.1:8787 npm run dev
```

## Production Shape

- Host the backend on a server that can keep GMI keys private.
- Keep browser-side speech recognition for a fast MVP, or move audio handling to a GMI Cloud audio model or dedicated endpoint when we choose the exact model.
- Store interview sessions, transcripts, scores, and Sarah readouts in the app database.
- Use RocketRide for the founder-readiness workflow canvas and GMI Cloud for inference.
