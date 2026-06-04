import { NextResponse } from "next/server";
import { z } from "zod";
import { megSupabase } from "@/lib/meg/supabase";
import { readMegHealthIngestSecret } from "@/lib/meg/env";

export const runtime = "nodejs";

type HealthRow = {
  metric_date: string;
  metric: string;
  value_num: number;
  unit: string | null;
  source: "apple" | "garmin";
  raw_json: unknown;
};

// Format A — normalisert. ak-helse/helse_sync.py (Garmin) POSTer denne formen.
const normalisertSchema = z.object({
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

// Format B — Health Auto Export (iPhone) sitt native REST API-format:
// { data: { metrics: [ { name, units, data: [ { date, qty|asleep|Avg|value, ... } ] } ] } }
const haeSchema = z.object({
  data: z.object({
    metrics: z
      .array(
        z.object({
          name: z.string().min(1),
          units: z.string().optional(),
          data: z.array(z.record(z.string(), z.unknown())),
        }),
      )
      .default([]),
  }),
});

function pickValue(point: Record<string, unknown>): number | null {
  for (const key of ["qty", "asleep", "Avg", "value", "totalSleep"]) {
    const v = point[key];
    if (typeof v === "number" && Number.isFinite(v)) return v;
  }
  return null;
}

function pickDate(point: Record<string, unknown>): string | null {
  const d = point.date;
  if (typeof d === "string" && /^\d{4}-\d{2}-\d{2}/.test(d)) return d.slice(0, 10);
  return null;
}

function haeTilRader(parsed: z.infer<typeof haeSchema>): HealthRow[] {
  const rows: HealthRow[] = [];
  for (const m of parsed.data.metrics) {
    for (const point of m.data) {
      const value = pickValue(point);
      const date = pickDate(point);
      if (value === null || date === null) continue;
      rows.push({
        metric_date: date,
        metric: m.name,
        value_num: value,
        unit: m.units ?? null,
        source: "apple",
        raw_json: point,
      });
    }
  }
  return rows;
}

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

  let rows: HealthRow[];
  const normalisert = normalisertSchema.safeParse(body);
  if (normalisert.success) {
    rows = normalisert.data.metrics.map((m) => ({
      metric_date: m.date,
      metric: m.metric,
      value_num: m.value,
      unit: m.unit ?? null,
      source: normalisert.data.source,
      raw_json: m.raw ?? null,
    }));
  } else {
    const hae = haeSchema.safeParse(body);
    if (!hae.success) {
      return NextResponse.json({ ok: false, error: "ugyldig payload" }, { status: 400 });
    }
    rows = haeTilRader(hae.data);
  }

  if (rows.length === 0) {
    return NextResponse.json({ ok: true, count: 0 });
  }

  const db = megSupabase();
  if (!db) return NextResponse.json({ ok: false }, { status: 503 });

  const { error } = await db
    .from("me_health")
    .upsert(rows, { onConflict: "metric_date,metric,source" });

  if (error) {
    console.error("[meg/health-ingest] upsert feilet", error.message);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true, count: rows.length });
}
