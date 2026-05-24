import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { markAllRead } from "@/lib/notifications";
import { requireSameOrigin } from "@/lib/security/same-origin";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const guard = requireSameOrigin(req);
  if (guard) return guard;

  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauth" }, { status: 401 });
  await markAllRead(user.id);
  return NextResponse.json({ ok: true });
}
