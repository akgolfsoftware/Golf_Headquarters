// src/app/api/health/ingest/route.ts
// Inntak av Apple Health-data fra Health Auto Export på iPhone.
//
// All parsing ligger i @/lib/health/parse-apple-health (ren, testet). Denne fila
// gjør kun auth og I/O. Skriver til me_health i Meg-databasen (personlig namespace,
// service-role, deny-all RLS) — aldri til spillertabellene.

import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { parseAppleHealth } from "@/lib/health/parse-apple-health";
import { megSupabase } from "@/lib/meg/supabase";
import { recordWebhookFailure } from "@/lib/webhook-retry";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/security/same-origin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Health Auto Export sender én dags målinger — langt under dette. */
const MAKS_BODY_BYTES = 2 * 1024 * 1024;

/**
 * Konstant-tids sammenlikning. timingSafeEqual kaster på ulik bufferlengde, så
 * lengden sjekkes først — og ulik lengde er uansett feil token.
 */
function tokenErGyldig(oppgitt: string | null, forventet: string): boolean {
  if (!oppgitt) return false;
  const a = Buffer.from(oppgitt, "utf8");
  const b = Buffer.from(forventet, "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export async function POST(req: Request) {
  const forventetToken = process.env.HEALTH_INGEST_TOKEN;
  if (!forventetToken) {
    console.error(
      "[health/ingest] HEALTH_INGEST_TOKEN mangler i miljøet — endepunktet er stengt",
    );
    return NextResponse.json({ error: "ikke konfigurert" }, { status: 500 });
  }

  if (!tokenErGyldig(req.headers.get("x-health-token"), forventetToken)) {
    return new NextResponse(null, { status: 401 });
  }
  const ip = getClientIp(req);
  const rl = await rateLimit({ key: `health-ingest:${ip}`, max: 20, windowMs: 60_000 });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "rate-limited" },
      { status: 429, headers: { "x-ratelimit-reset": String(rl.resetAt) } },
    );
  }


  const contentLength = Number(req.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > MAKS_BODY_BYTES) {
    return NextResponse.json({ error: "payload for stor" }, { status: 413 });
  }

  const rawBody = await req.text();
  if (rawBody.length > MAKS_BODY_BYTES) {
    return NextResponse.json({ error: "payload for stor" }, { status: 413 });
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "ugyldig JSON" }, { status: 400 });
  }

  let parsed;
  try {
    parsed = parseAppleHealth(body);
  } catch {
    return NextResponse.json({ error: "ugjenkjennelig payload" }, { status: 400 });
  }

  const { rows, skipped, unknownMetrics, unitMismatch } = parsed;

  if (rows.length === 0) {
    return NextResponse.json({
      inserted: 0,
      skipped,
      unknownMetrics,
      unitMismatch,
    });
  }

  const db = megSupabase();
  if (!db) {
    console.error("[health/ingest] Meg-databasen er ikke konfigurert (MEG_SUPABASE_*)");
    return NextResponse.json({ error: "ikke konfigurert" }, { status: 500 });
  }

  const { error } = await db
    .from("me_health")
    .upsert(rows, { onConflict: "metric_date,metric,source" });

  if (error) {
    console.error("[health/ingest] upsert mot me_health feilet", error.message);
    // Health Auto Export retryer selv. eventId er en hash av payloaden, slik at
    // gjentatte forsøk med samme innhold øker attemptCount i stedet for å lage
    // en ny rad per retry.
    await recordWebhookFailure({
      source: "apple-health",
      eventId: `health-ingest:${crypto
        .createHash("sha256")
        .update(rawBody)
        .digest("hex")
        .slice(0, 32)}`,
      payload: body,
      error,
    });
    return NextResponse.json({ error: "lagring feilet" }, { status: 500 });
  }

  // Aldri logg payloaden ved suksess — kun tellere.
  return NextResponse.json({
    inserted: rows.length,
    skipped,
    unknownMetrics,
    unitMismatch,
  });
}
