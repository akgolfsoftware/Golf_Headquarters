/**
 * POST /api/push/subscribe — lagre push-subscription for innlogget bruker.
 *
 * Body (JSON):
 *   { endpoint, keys: { p256dh, auth } }
 *
 * Brukes av <PushToggle/> etter `serviceWorker.pushManager.subscribe()`.
 */
import { NextResponse } from "next/server";
import { z } from "zod";
import { lagrePushSubscription } from "@/lib/push/subscriptions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
});

export async function POST(req: Request) {
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
      { ok: false, error: "Ugyldig subscription-payload" },
      { status: 400 },
    );
  }

  const userAgent = req.headers.get("user-agent") ?? undefined;

  try {
    const result = await lagrePushSubscription({
      endpoint: parsed.data.endpoint,
      p256dh: parsed.data.keys.p256dh,
      auth: parsed.data.keys.auth,
      userAgent,
    });
    return NextResponse.json(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Kunne ikke lagre subscription";
    const status = msg === "unauthenticated" ? 401 : 500;
    return NextResponse.json({ ok: false, error: msg }, { status });
  }
}
