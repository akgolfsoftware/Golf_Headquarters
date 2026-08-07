/**
 * Mottar klient-feil fra error.tsx / global-error.tsx via reportClientError.
 *
 * S5 (client error boundary): egen rute fordi error-tracking er server-only
 * og server actions er upålitelige når root-layout selv har krasjet.
 * S2 (API-rate-limit-spor) skal hoppe over denne filen ved konflikt.
 *
 * Åpen POST, men:
 *  - in-memory rate-limit per IP (20/min)
 *  - streng felt-trim
 *  - PII-sanitering skjer i logError
 */

import { NextResponse } from "next/server";
import { logError } from "@/lib/error-tracking";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = {
  context?: unknown;
  message?: unknown;
  stack?: unknown;
  digest?: unknown;
  url?: unknown;
};

/** Enkel prosess-lokal rate-limit. Nullstilles ved kaldstart. */
const treff = new Map<string, number[]>();
const RL_MAX = 20;
const RL_WINDOW_MS = 60_000;

function rateLimitOk(ip: string): boolean {
  const naa = Date.now();
  const prev = (treff.get(ip) ?? []).filter((t) => naa - t < RL_WINDOW_MS);
  if (prev.length >= RL_MAX) {
    treff.set(ip, prev);
    return false;
  }
  prev.push(naa);
  treff.set(ip, prev);
  return true;
}

function clientIp(req: Request): string {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) {
    const first = xf.split(",")[0]?.trim();
    if (first) return first;
  }
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}

function asString(v: unknown, max: number): string | undefined {
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  if (!t) return undefined;
  return t.slice(0, max);
}

export async function POST(req: Request) {
  const ip = clientIp(req);
  if (!rateLimitOk(ip)) {
    return NextResponse.json({ ok: false, error: "rate-limited" }, { status: 429 });
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid-json" }, { status: 400 });
  }

  const context = asString(body.context, 200) ?? "client-error";
  const message = asString(body.message, 2000) ?? "Ukjent klientfeil";
  const stack = asString(body.stack, 8000);
  const digest = asString(body.digest, 200);
  const url = asString(body.url, 500);

  const error = stack
    ? Object.assign(new Error(message), { stack })
    : message;

  // global-error = root-layout-krasj → fatal (Telegram/Slack). Øvrige = error.
  const severity =
    context === "global-error" || context.startsWith("global-error")
      ? "fatal"
      : "error";

  try {
    await logError({
      context,
      error,
      meta: {
        source: "client-error-boundary",
        ...(digest ? { digest } : {}),
        ...(url ? { url } : {}),
      },
      severity,
    });
  } catch {
    // logError skal ikke kaste — men aldri la API-et falle hardt
  }

  return NextResponse.json({ ok: true });
}
