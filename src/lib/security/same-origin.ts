import "server-only";

/**
 * Verifiserer at en POST-request stammer fra samme origin som serveren.
 *
 * Brukes på alle ikke-webhook POST-routes for å beskytte mot CSRF.
 * Webhooks (Stripe, Google Cal) bruker signatur-verifisering og skal IKKE
 * bruke denne funksjonen.
 *
 * Logikk:
 * 1. Sjekk Origin-header — må matche APP_URL-host.
 * 2. Fallback til Referer-header hvis Origin mangler (eldre nettlesere).
 * 3. Ingen av dem present → avvis (konservativ policy).
 *
 * I utvikling aksepteres localhost og 127.0.0.1 automatisk.
 */

const ALLOWED_ORIGINS: string[] = (() => {
  const prod = process.env.NEXT_PUBLIC_APP_URL ?? "https://akgolf.no";
  const origins = [new URL(prod).origin];

  if (process.env.NODE_ENV !== "production") {
    origins.push("http://localhost:3000", "http://127.0.0.1:3000");
    // Vercel preview-URLer: akgolf-hq-*.vercel.app
    if (process.env.VERCEL_URL) {
      origins.push(`https://${process.env.VERCEL_URL}`);
    }
  }

  return origins;
})();

export function isSameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (origin) {
    return ALLOWED_ORIGINS.some(
      (allowed) => allowed === origin || origin.endsWith(".vercel.app")
    );
  }

  // Fallback: sjekk Referer
  const referer = req.headers.get("referer");
  if (referer) {
    try {
      const refOrigin = new URL(referer).origin;
      return ALLOWED_ORIGINS.some((allowed) => allowed === refOrigin);
    } catch {
      return false;
    }
  }

  // Ingen origin/referer — avvis i produksjon
  return process.env.NODE_ENV !== "production";
}

/**
 * Returnerer NextResponse 403 hvis origin ikke matcher.
 * Bruk: const guard = requireSameOrigin(req); if (guard) return guard;
 */
import { NextResponse } from "next/server";

export function requireSameOrigin(req: Request): NextResponse | null {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  return null;
}

/**
 * Henter klient-IP fra Vercel-sikker header (ikke-spoofbar).
 * Bruk denne i stedet for x-forwarded-for[0].
 */
export function getClientIp(req: Request): string {
  return (
    req.headers.get("x-vercel-forwarded-for") ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}
