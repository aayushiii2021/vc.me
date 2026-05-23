#!/usr/bin/env python3
"""Local VC.me API adapter for Sarah's founder analysis."""

from http.server import BaseHTTPRequestHandler, HTTPServer
import json
import os
from datetime import datetime, timezone


HOST = os.environ.get("VCME_API_HOST", "127.0.0.1")
PORT = int(os.environ.get("VCME_API_PORT", "8787"))


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
                "description": "Traction is evidence that the market is doing something meaningful: paying, using, waiting, renewing, or referring.",
                "tips": [
                    "Convert interest into a paid pilot, LOI, waitlist deposit, or recurring usage.",
                    "Track activation, retention, and referral behavior from the first test users.",
                    "Define the one traction metric that would make this company undeniable.",
                ],
            },
            "authority": {
                "title": "Authority",
                "subtitle": "Credibility Forming" if authority >= 55 else "Founder Credibility Gap",
                "score": authority,
                "description": "Authority is why the market should believe this founder is the right person to solve this problem.",
                "tips": [
                    "Write a sharp founder-market-fit paragraph: why you, why this problem, why now.",
                    "Recruit one advisor or design partner with visible credibility in the market.",
                    "Show evidence that customers trust you with the problem, not just the product.",
                ],
            },
            "funding": {
                "title": "Funding",
                "subtitle": "Capital Story Emerging" if funding >= 55 else "Capital Readiness: Early",
                "score": funding,
                "description": "Funding readiness means knowing your runway, use of funds, milestones, and why this round is the right financing path.",
                "tips": [
                    "Define the next 18 months of runway, burn, and hiring with a conservative budget.",
                    "Tie the raise to three milestones that materially de-risk the company.",
                    "Decide whether VC, angels, grants, revenue, or bootstrapping fits the business model.",
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
        if self.path == "/health":
            self._send_json(200, {"ok": True, "service": "vcme-api"})
        else:
            self._send_json(404, {"error": "Not found"})

    def do_POST(self):
        if self.path != "/api/founder-analysis":
            self._send_json(404, {"error": "Not found"})
            return

        length = int(self.headers.get("Content-Length", "0"))
        try:
            payload = json.loads(self.rfile.read(length) or b"{}")
        except json.JSONDecodeError:
            self._send_json(400, {"error": "Invalid JSON"})
            return

        self._send_json(200, local_analysis(payload.get("idea", "")))


if __name__ == "__main__":
    server = HTTPServer((HOST, PORT), Handler)
    print(f"VC.me API listening on http://{HOST}:{PORT}")
    server.serve_forever()
