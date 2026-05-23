# vc.me

AI agent for founders to help you reach your next milestone.

## RocketRide MVP

RocketRide is installed in Cursor (`RocketRide.rocketride` v1.1.0). This repo holds the first pipeline for ingesting scraped VC contact JSON and enriching it with an LLM.

## Pipeline

`pipelines/vc_contact_enrich.pipe`

```text
dropper → parse → question → prompt → llm_openai → response_answers
```

- **Ingest:** Drop `data/sample_contact.json` (or any contact JSON) on the dropper node in the canvas, or use **Send files** from the Connection Manager.
- **Transform:** Parse extracts text; prompt applies enrichment instructions; OpenAI returns structured JSON in `answers`.

## One-time setup

1. **Reload Cursor** (or open this folder) so the RocketRide sidebar appears.
2. Click the **RocketRide** icon → deploy **Local** engine (first run downloads the engine).
3. Copy `.env.example` → `.env` and set `ROCKETRIDE_OPENAI_KEY`.
4. Open `pipelines/vc_contact_enrich.pipe` (visual canvas).
5. Press **Play** on the dropper node, then drop `data/sample_contact.json`.

## Bulk data

Full scraped dataset: `../vcs-data/people.json` (large). For MVP testing, use `data/sample_contact.json` or export a small slice.

## Frontend

React + Tailwind + shadcn foundation (YC-inspired tokens, light mode only):

```bash
cd frontend && npm install && npm run dev
```

See [frontend/README.md](frontend/README.md).

## Docs

Shipped with the extension under `~/.cursor/extensions/rocketride.rocketride-*/docs/` — start with `ROCKETRIDE_QUICKSTART.md`.
