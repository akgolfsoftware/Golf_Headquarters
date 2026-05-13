/**
 * POST /api/view-mode { mode: 'player' | 'coach' }
 * Setter cookie og redirector til /portal eller /admin.
 */
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { setViewMode } from "@/lib/view-mode";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauth" }, { status: 401 });
  if (user.role !== "ADMIN" && user.role !== "COACH") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const body = (await req.json().catch(() => ({}))) as { mode?: string };
  const mode = body.mode === "player" ? "player" : "coach";
  await setViewMode(mode);
  const target = mode === "player" ? "/portal" : "/admin";
  return NextResponse.json({ ok: true, redirect: target });
}
