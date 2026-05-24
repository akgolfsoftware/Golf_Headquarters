/**
 * Health-check endpoint for monitoring og smoke-tester.
 *
 * Returnerer 200 + JSON med status, tidspunkt og kjøretid.
 * Ingen DB-tilkobling — bare prosess-liveness.
 */

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export function GET() {
  return NextResponse.json(
    {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
    { status: 200 },
  );
}
