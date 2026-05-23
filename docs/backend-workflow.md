# VC.me Voice Backend Workflow

This is the intended production setup for Sarah as a conversational founder-readiness coach.

## Product Flow

1. The frontend opens a Sarah interview session.
2. Sarah asks three questions: Traction, Authority, and Funding.
3. Browser audio is streamed to the backend.
4. Google Cloud Speech-to-Text returns interim and final transcripts.
5. The backend stores the transcript by session and sends final answers to RocketRide.
6. RocketRide runs `pipelines/founder_readiness_interview.pipe`.
7. GMI scores the founder and returns structured JSON for the dashboard.
8. Sarah speaks the final readout with browser speech synthesis now, or Google Cloud Text-to-Speech in production.

## Google Products

- **Google Cloud Speech-to-Text:** production transcription for real-time or uploaded audio. Use streaming recognition for live conversation and batch recognition for uploaded recordings.
- **Google Cloud Text-to-Speech:** production Sarah voice output when we want consistent generated audio instead of browser speech synthesis.
- **Cloud Run:** host the VC.me backend with HTTPS and WebSocket or streaming endpoints.
- **Secret Manager:** store `ROCKETRIDE_GMI_CLOUD_APIKEY`, Google credentials, and future provider keys.
- **Firestore:** store interview sessions, transcripts, scores, and follow-up tasks.
- **Firebase Auth:** optional founder login so users can return to their dashboard.

## GMI

Use GMI as the LLM inference layer inside RocketRide. The first scoring model can stay `deepseek-v3`, with the prompt constrained to return strict JSON:

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

## RocketRide Workflow

Create this pipeline in RocketRide:

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

## Backend API Shape

Current prototype:

- `GET /health`
- `GET /api/interview-questions`
- `POST /api/founder-analysis`
- `POST /api/interview-sessions`
- `POST /api/interview-sessions/:id/transcript`
- `POST /api/interview-sessions/:id/analyze`

Next production endpoints:

- `POST /api/speech/google/stream-token` returns short-lived config for a secure backend-mediated speech stream.
- `POST /api/sarah/voice` converts Sarah's final readout to audio with Google Cloud Text-to-Speech.

## Local Setup

```bash
cp .env.example .env
npm install
npm run backend
VITE_VCME_API_URL=http://127.0.0.1:8787 npm run dev
```

For RocketRide:

```bash
open pipelines/founder_readiness_interview.pipe
```

Drop `data/sample_founder_interview.json` onto the dropper node.

## Why This Split

The browser can handle prototype speech recognition, but production should not depend on browser-only Web Speech support. The backend should own Google transcription, session storage, provider credentials, and RocketRide orchestration. The frontend should stay focused on the conversation UI and the dashboard.
