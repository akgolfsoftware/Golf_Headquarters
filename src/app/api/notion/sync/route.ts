// Manuell "Synk nå"-knapp for ADMIN. Trigger sync av alle databaser
// koblet til innlogget brukers connection.

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { syncNotionDatabase } from "@/lib/notion/sync";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(): Promise<NextResponse> {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (user.role !== "ADMIN") {
    return NextResponse.json({ error: "admin_only" }, { status: 403 });
  }

  const links = await prisma.notionDatabaseLink.findMany({
    where: { connection: { userId: user.id }, syncMode: { not: "PAUSED" } },
    select: { id: true, navn: true },
  });

  const results = [];
  for (const link of links) {
    try {
      const res = await syncNotionDatabase(link.id);
      results.push({ linkId: link.id, navn: link.navn, ok: true, ...res });
    } catch (err) {
      results.push({
        linkId: link.id,
        navn: link.navn,
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return NextResponse.json({ ok: true, count: links.length, results });
}
