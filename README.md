# vc.me

AI agent for founders to help them reach their next milestone. The root app is a React + Vite speech-to-text frontend where founders talk to Sarah, VC.me's AI robot, and get feedback across Traction, Authority, and Funding.

## Frontend

```bash
npm install
npm run dev
```

By default, the frontend uses Sarah's local analysis logic. To connect it to the local backend adapter, run the API in another terminal and set `VITE_VCME_API_URL`:

```bash
GMI_API_KEY=your_gmi_key \
python3 scripts/vcme_api.py
VITE_VCME_API_URL=http://127.0.0.1:8787 npm run dev
```

Sarah prompts founders through three questions, transcribes or accepts typed answers, sends the interview to `POST /api/founder-analysis`, speaks the final readout, and displays a Traction, Authority, and Funding dashboard.

See [docs/backend-workflow.md](docs/backend-workflow.md) for the GMI Cloud and RocketRide backend architecture.

## Backend Adapter

`scripts/vcme_api.py` is a lightweight local API for Sarah's founder diagnosis. It calls GMI Cloud when `GMI_API_KEY` or `ROCKETRIDE_GMI_CLOUD_APIKEY` is configured, and uses a local fallback only for development without credentials. It uses no external Python dependencies and exposes:

- `GET /health`
- `GET /api/interview-questions`
- `POST /api/founder-analysis`
- `POST /api/interview-sessions`
- `POST /api/interview-sessions/:id/transcript`
- `POST /api/interview-sessions/:id/analyze`

## RocketRide MVP

RocketRide is installed in Cursor (`RocketRide.rocketride` v1.1.0). This repo holds the first pipeline for ingesting scraped VC contact JSON and enriching it with an LLM.

## Pipeline

Contact enrichment:

`pipelines/vc_contact_enrich.pipe`

Founder readiness interview:

`pipelines/founder_readiness_interview.pipe`

```text
dropper -> parse -> question -> prompt -> llm_gmi_cloud -> response_answers
```

- **Founder readiness ingest:** Drop `data/sample_founder_interview.json` onto `pipelines/founder_readiness_interview.pipe`.
- **Founder readiness transform:** Parse extracts text; prompt applies Sarah's scoring rubric; GMI Cloud returns structured JSON in `answers`.

## RocketRide Setup

1. Reload Cursor or open this folder so the RocketRide sidebar appears.
2. Click the RocketRide icon and deploy the Local engine.
3. Copy `.env.example` to `.env` and set the required API key.
4. Open `pipelines/vc_contact_enrich.pipe`.
5. Press Play on the dropper node, then drop `data/sample_contact.json`.

## Bulk Data

Full scraped dataset: `../vcs-data/people.json` (large). For MVP testing, use `data/sample_contact.json` or export a small slice.

## Docs

Shipped with the extension under `~/.cursor/extensions/rocketride.rocketride-*/docs/` — start with `ROCKETRIDE_QUICKSTART.md`.
