/**
 * POST /api/player-depth { mode: 'simple' | 'deep' }
 * Progressive disclosure only — does not change entitlements.
 */
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { setPlayerDepthMode, type PlayerDepthMode } from "@/lib/player-depth-mode";
import { requireSameOrigin } from "@/lib/security/same-origin";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const guard = requireSameOrigin(req);
  if (guard) return guard;

  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauth" }, { status: 401 });

  const rl = await rateLimit({
    key: `player-depth:${user.id}`,
    max: 30,
    windowMs: 60_000,
  });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "rate-limited" },
      { status: 429, headers: { "x-ratelimit-reset": String(rl.resetAt) } },
    );
  }

  const body = (await req.json().catch(() => ({}))) as { mode?: string };
  const mode: PlayerDepthMode = body.mode === "deep" ? "deep" : "simple";
  await setPlayerDepthMode(mode);
  return NextResponse.json({ ok: true, mode });
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauth" }, { status: 401 });
  const { getPlayerDepthMode } = await import("@/lib/player-depth-mode");
  const mode = await getPlayerDepthMode();
  return NextResponse.json({ mode });
}
