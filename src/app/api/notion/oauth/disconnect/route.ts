// Koble fra Notion. Sletter NotionConnection (cascade fjerner
// database-links og cached oppgaver).

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/error-tracking";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(): Promise<NextResponse> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (user.role !== "ADMIN") {
    return NextResponse.json({ error: "admin_only" }, { status: 403 });
  }

  try {
    await prisma.notionConnection.deleteMany({ where: { userId: user.id } });
    return NextResponse.redirect(
      `${appUrl}/admin/workspace/notion?state=empty`,
      { status: 303 },
    );
  } catch (err) {
    await logError({
      context: "notion.oauth-disconnect",
      error: err,
      userId: user.id,
    });
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
