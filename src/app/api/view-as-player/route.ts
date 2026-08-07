/**
 * GET /api/view-as-player
 *
 * Direkte URL for ADMIN/COACH til å bytte til PlayerHQ-visning.
 * Praktisk for iPhone-testing der man ikke vil finne toggle-knappen.
 *
 * Setter view-mode-cookie til 'player' og redirecter til /portal.
 */
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { setViewMode } from "@/lib/view-mode";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    const url = new URL("/auth/login?next=/api/view-as-player", req.url);
    return NextResponse.redirect(url);
  }
  if (user.role !== "ADMIN" && user.role !== "COACH") {
    // Vanlig spiller — bare send til /portal
    return NextResponse.redirect(new URL("/portal", req.url));
  }
  const rl = await rateLimit({ key: `view-as-player:${user.id}`, max: 30, windowMs: 60_000 });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "rate-limited" },
      { status: 429, headers: { "x-ratelimit-reset": String(rl.resetAt) } },
    );
  }

  await setViewMode("player");
  return NextResponse.redirect(new URL("/portal", req.url));
}
