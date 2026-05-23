# vc.me

AI agent for founders to help them reach their next milestone. The root app is a React + Vite frontend where founders pitch Sarah, VC.me's AI robot, and get feedback across Traction, Authority, and Funding.

## Frontend

```bash
npm install
npm run dev
```

By default, the frontend uses Sarah's local analysis logic. To connect it to the local backend adapter, run the API in another terminal and set `VITE_VCME_API_URL`:

```bash
python3 scripts/vcme_api.py
VITE_VCME_API_URL=http://127.0.0.1:8787 npm run dev
```

The frontend sends founder ideas to `POST /api/founder-analysis` and displays the returned Traction, Authority, and Funding scores.

## Backend Adapter

`scripts/vcme_api.py` is a lightweight local API for Sarah's founder diagnosis. It uses no external Python dependencies and exposes:

- `GET /health`
- `POST /api/founder-analysis`

## RocketRide MVP

RocketRide is installed in Cursor (`RocketRide.rocketride` v1.1.0). This repo holds the first pipeline for ingesting scraped VC contact JSON and enriching it with an LLM.

## Pipeline

`pipelines/vc_contact_enrich.pipe`

```text
dropper -> parse -> question -> prompt -> llm_gmi_cloud -> response_answers
```

- **Ingest:** Drop `data/sample_contact.json` or another contact JSON on the dropper node in the canvas, or use **Send files** from the Connection Manager.
- **Transform:** Parse extracts text; prompt applies enrichment instructions; the LLM returns structured JSON in `answers`.

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
