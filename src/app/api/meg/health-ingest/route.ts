import { NextResponse } from "next/server";
import { z } from "zod";
import { megSupabase } from "@/lib/meg/supabase";
import { readMegHealthIngestSecret } from "@/lib/meg/env";

export const runtime = "nodejs";

// Normalisert helse-payload. Health Auto Export (Apple) og ak-helse/helse_sync.py
// (Garmin) POSTer denne formen. source-tag hindrer dobbeltelling.
const payloadSchema = z.object({
  source: z.enum(["apple", "garmin"]),
  metrics: z
    .array(
      z.object({
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        metric: z.string().min(1),
        value: z.number(),
        unit: z.string().optional(),
        raw: z.unknown().optional(),
      }),
    )
    .min(1),
});

export async function POST(req: Request) {
  const secret = readMegHealthIngestSecret();
  if (!secret) return NextResponse.json({ ok: false }, { status: 503 });

  const provided = req.headers.get("x-meg-health-secret");
  if (provided !== secret) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "ugyldig JSON" }, { status: 400 });
  }

  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "ugyldig payload" }, { status: 400 });
  }

  const db = megSupabase();
  if (!db) return NextResponse.json({ ok: false }, { status: 503 });

  const rows = parsed.data.metrics.map((m) => ({
    metric_date: m.date,
    metric: m.metric,
    value_num: m.value,
    unit: m.unit ?? null,
    source: parsed.data.source,
    raw_json: m.raw ?? null,
  }));

  const { error } = await db
    .from("me_health")
    .upsert(rows, { onConflict: "metric_date,metric,source" });

  if (error) {
    console.error("[meg/health-ingest] upsert feilet", error.message);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true, count: rows.length });
}
