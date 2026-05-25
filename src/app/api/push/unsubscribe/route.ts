/**
 * POST /api/push/unsubscribe — fjern push-subscription for innlogget bruker.
 *
 * Body (JSON): { endpoint }
 */
import { NextResponse } from "next/server";
import { z } from "zod";
import { slettPushSubscription } from "@/lib/push/subscriptions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  endpoint: z.string().url(),
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
