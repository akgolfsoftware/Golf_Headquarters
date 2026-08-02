/**
 * Health-check endpoint for monitoring og smoke-tester.
 *
 * Sjekker BÅDE prosess-liveness OG database-tilkobling. Et uptime-probe som
 * kun målte `process.uptime()` ville rapportert «grønt» mens Postgres var nede
 * — nettopp situasjonen et helsesjekk skal fange. En lett `SELECT 1` med kort
 * timeout skiller «appen lever» fra «appen kan faktisk betjene trafikk».
 *
 * 200 = ok · 503 = degradert (DB utilgjengelig). Monitoring bør alarmere på 503.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const DB_TIMEOUT_MS = 3000;

export async function GET() {
  const base = {
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  };

  let dbOk = false;
  try {
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("db-timeout")), DB_TIMEOUT_MS),
      ),
    ]);
    dbOk = true;
  } catch {
    dbOk = false;
  }

  return NextResponse.json(
    { status: dbOk ? "ok" : "degraded", db: dbOk ? "up" : "down", ...base },
    { status: dbOk ? 200 : 503 },
  );
}
