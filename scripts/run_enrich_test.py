#!/usr/bin/env python3
"""Smoke-test vc_contact_enrich.pipe via RocketRide SDK + GMI (deepseek-v3)."""

import asyncio
import json
import sys
from pathlib import Path

from rocketride import RocketRideClient

ROOT = Path(__file__).resolve().parents[1]
PIPE = ROOT / "pipelines" / "vc_contact_enrich.pipe"
SAMPLE = ROOT / "data" / "sample_contact.json"


async def main() -> int:
    if not SAMPLE.is_file():
        print(f"Missing sample file: {SAMPLE}", file=sys.stderr)
        return 1

    client = RocketRideClient()
    try:
        await client.connect()
        print("Connected to RocketRide")

        result = await client.use(filepath=str(PIPE), use_existing=True)
        token = result["token"]
        print(f"Pipeline token: {token}")

        upload = await client.send_files(
            [(str(SAMPLE), {"name": SAMPLE.name}, "application/json")],
            token,
        )
        print("Upload:", json.dumps(upload, indent=2)[:500])

        status = await client.get_task_status(token)
        print("Status:", status.get("state", status))

        # Last send result often carries answers for dropper pipelines
        if upload and isinstance(upload, list) and upload[0]:
            body = upload[0]
            result_body = body.get("result") or body
            answers = (
                result_body.get("answers")
                or body.get("answers")
                or body.get("response", {}).get("answers")
            )
            if answers:
                print("\n--- LLM answers ---")
                if isinstance(answers, list):
                    for i, a in enumerate(answers):
                        print(f"[{i}]", a if isinstance(a, str) else json.dumps(a, indent=2))
                else:
                    print(json.dumps(answers, indent=2))
                return 0

        print("No answers in upload response; check RocketRide monitor / traces in the IDE.")
        return 0
    except Exception as exc:
        print(f"Error: {exc}", file=sys.stderr)
        return 1
    finally:
        try:
            await client.disconnect()
        except Exception:
            pass


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
