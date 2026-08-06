/**
 * POST /api/push/unsubscribe — fjern push-subscription for innlogget bruker.
 *
 * Body (JSON): { endpoint }
 */
import { NextResponse } from "next/server";
import { z } from "zod";
import { slettPushSubscription } from "@/lib/push/subscriptions";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/security/same-origin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  endpoint: z.string().url(),
});

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = await rateLimit({ key: `push-unsubscribe:${ip}`, max: 30, windowMs: 60_000 });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "rate-limited" },
      { status: 429, headers: { "x-ratelimit-reset": String(rl.resetAt) } },
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Forventet JSON-body" },
      { status: 400 },
    );
  }

  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Ugyldig payload" },
      { status: 400 },
    );
  }

  try {
    const result = await slettPushSubscription(parsed.data.endpoint);
    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Kunne ikke slette subscription";
    const status = msg === "unauthenticated" ? 401 : 500;
    return NextResponse.json({ ok: false, error: msg }, { status });
  }
}
