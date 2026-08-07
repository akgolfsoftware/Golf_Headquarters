import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { markAllRead } from "@/lib/notifications";
import { requireSameOrigin } from "@/lib/security/same-origin";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const guard = requireSameOrigin(req);
  if (guard) return guard;

  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauth" }, { status: 401 });
  const rl = await rateLimit({ key: `notifications-mark-all-read:${user.id}`, max: 30, windowMs: 60_000 });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "rate-limited" },
      { status: 429, headers: { "x-ratelimit-reset": String(rl.resetAt) } },
    );
  }

  await markAllRead(user.id);
  return NextResponse.json({ ok: true });
}
