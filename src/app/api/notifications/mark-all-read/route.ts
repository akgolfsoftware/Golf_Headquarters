import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { markAllRead } from "@/lib/notifications";

export const runtime = "nodejs";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauth" }, { status: 401 });
  await markAllRead(user.id);
  return NextResponse.json({ ok: true });
}
