#!/usr/bin/env python3
"""Local VC.me API adapter for Sarah's founder analysis."""

from http.server import BaseHTTPRequestHandler, HTTPServer
import json
import os
from urllib.parse import urlparse
from uuid import uuid4
from datetime import datetime, timezone


HOST = os.environ.get("VCME_API_HOST", "127.0.0.1")
PORT = int(os.environ.get("VCME_API_PORT", "8787"))

INTERVIEW_QUESTIONS = [
    {
        "key": "traction",
        "title": "Traction",
        "prompt": "What proof do you have that people want this product? Tell me about revenue, active users, growth, retention, pilots, waitlists, or customer engagement.",
    },
    {
        "key": "authority",
        "title": "Authority",
        "prompt": "Why are you the right founder to build this? Tell me about your domain expertise, track record, industry knowledge, advisors, recognition, or audience.",
    },
    {
        "key": "funding",
        "title": "Funding",
        "prompt": "How much capital do you need, what stage are you raising for, what runway does it buy, and what milestones will you hit with it?",
    },
]

SESSION_STORE = {}


def has_any(text, words):
    return any(word in text for word in words)


def clamp_score(score):
    return max(5, min(95, score))


def local_analysis(idea):
    normalized = (idea or "Startup idea submitted").strip()
    text = normalized.lower()

    traction = 18
    if has_any(text, ["paying", "revenue", "$", "arr", "mrr"]):
        traction += 24
    if has_any(text, ["customer", "users", "pilot", "waitlist", "signed", "retention"]):
        traction += 18
    if has_any(text, ["growth", "mo m", "month over month", "repeat", "usage"]):
        traction += 14

    authority = 24
    if has_any(text, ["ex-", "years", "built", "founded", "operator", "engineer"]):
        authority += 18
    if has_any(text, ["advisor", "partner", "network", "community", "expert"]):
        authority += 14
    if has_any(text, ["healthcare", "fintech", "legal", "climate", "education", "enterprise"]):
        authority += 10

    funding = 16
    if has_any(text, ["runway", "burn", "raise", "seed", "pre-seed", "angel"]):
        funding += 18
    if has_any(text, ["milestone", "model", "unit economics", "margin", "cac", "ltv"]):
        funding += 18
    if has_any(text, ["grant", "bootstrapped", "profitable", "term sheet"]):
        funding += 12

    traction = clamp_score(traction)
    authority = clamp_score(authority)
    funding = clamp_score(funding)
    overall = round((traction + authority + funding) / 3)

    return {
        "idea": normalized,
        "source": "backend",
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "overallScore": overall,
        "summary": (
            "Sarah sees real early signals, but the next step is tightening proof into investor-grade evidence."
            if overall >= 65
            else "Sarah sees the shape of a startup, but the missing work is still proof: demand, credibility, and a fundable milestone plan."
        ),
        "dimensions": {
            "traction": {
                "title": "Traction",
                "subtitle": "Early Demand Signals" if traction >= 55 else "Market Validation Missing",
                "score": traction,
                "description": "Traction is quantitative evidence of market demand: revenue, active users, growth rate, retention, and customer engagement. It is proof that somebody wants your product.",
                "tips": [
                    "Get your first 10 paying customers or signed pilots before talking to investors.",
                    "Track monthly growth in revenue, active users, retention, and engagement.",
                    "Define the one traction metric that would make this company undeniable.",
                ],
            },
            "authority": {
                "title": "Authority",
                "subtitle": "Credibility Forming" if authority >= 55 else "Founder Credibility Gap",
                "score": authority,
                "description": "Authority is founder credibility and domain expertise: track record, industry knowledge, public recognition, advisor relationships, and thought leadership.",
                "tips": [
                    "Write a sharp founder-market-fit paragraph: why you, why this problem, why now.",
                    "Recruit one advisor or design partner with visible credibility in the market.",
                    "Publish insights, get featured, or speak where customers and investors pay attention.",
                ],
            },
            "funding": {
                "title": "Funding",
                "subtitle": "Capital Story Emerging" if funding >= 55 else "Capital Readiness: Early",
                "score": funding,
                "description": "Funding readiness means knowing whether this is Pre-Seed or Seed, how much runway you need, what milestones you will hit, and whether the metrics justify the ask.",
                "tips": [
                    "Decide if you are Pre-Seed ($10K-$500K) or Seed ($500K-$2M).",
                    "Define 18-24 months of runway, burn, and hiring with a conservative budget.",
                    "Tie the raise to three milestones that materially de-risk the company.",
                ],
            },
        },
    }


class Handler(BaseHTTPRequestHandler):
    def _send_json(self, status, payload):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self._send_json(204, {})

    def do_GET(self):
        path = urlparse(self.path).path
        if path == "/health":
            self._send_json(200, {"ok": True, "service": "vcme-api"})
        elif path == "/api/interview-questions":
            self._send_json(200, {"questions": INTERVIEW_QUESTIONS})
        else:
            self._send_json(404, {"error": "Not found"})

    def do_POST(self):
        path = urlparse(self.path).path
        length = int(self.headers.get("Content-Length", "0"))
        try:
            payload = json.loads(self.rfile.read(length) or b"{}")
        except json.JSONDecodeError:
            self._send_json(400, {"error": "Invalid JSON"})
            return

        if path == "/api/founder-analysis":
            self._send_json(200, local_analysis(payload.get("idea", "")))
            return

        if path == "/api/interview-sessions":
            session_id = payload.get("session_id") or str(uuid4())
            SESSION_STORE[session_id] = {
                "session_id": session_id,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "answers": {},
                "transcript": [],
            }
            self._send_json(201, {"session_id": session_id, "questions": INTERVIEW_QUESTIONS})
            return

        if path.startswith("/api/interview-sessions/"):
            parts = path.strip("/").split("/")
            if len(parts) != 4:
                self._send_json(404, {"error": "Not found"})
                return

            session_id = parts[2]
            action = parts[3]
            session = SESSION_STORE.setdefault(
                session_id,
                {
                    "session_id": session_id,
                    "created_at": datetime.now(timezone.utc).isoformat(),
                    "answers": {},
                    "transcript": [],
                },
            )

            if action == "transcript":
                question_key = payload.get("question_key")
                transcript = (payload.get("transcript") or "").strip()
                if question_key and transcript:
                    session["answers"][question_key] = transcript
                    session["transcript"].append(
                        {
                            "question_key": question_key,
                            "transcript": transcript,
                            "created_at": datetime.now(timezone.utc).isoformat(),
                        }
                    )
                self._send_json(200, session)
                return

            if action == "analyze":
                answers = payload.get("answers") or session.get("answers") or {}
                idea = "\n\n".join(
                    f"{question['title']}: {answers.get(question['key'], '')}"
                    for question in INTERVIEW_QUESTIONS
                )
                self._send_json(200, local_analysis(idea))
                return

        self._send_json(404, {"error": "Not found"})


if __name__ == "__main__":
    server = HTTPServer((HOST, PORT), Handler)
    print(f"VC.me API listening on http://{HOST}:{PORT}")
    server.serve_forever()
