// Cron-job: synk alle NotionDatabaseLinks med syncMode=AUTO.
// Kjører hvert 5. min (se vercel.json).

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { syncNotionDatabase } from "@/lib/notion/sync";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: Request): Promise<NextResponse> {
  const auth = req.headers.get("authorization");
  const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;
  // VIKTIG: manglende CRON_SECRET i env er en konfigurasjonsfeil — avvis alltid.
  // Original bug: `if (process.env.CRON_SECRET && ...)` tillot tilgang hvis
  // env-variabelen MANGLER (tom string = falsy). Riktig: avvis hvis den mangler.
  if (!process.env.CRON_SECRET || auth !== expectedAuth) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const links = await prisma.notionDatabaseLink.findMany({
    where: { syncMode: "AUTO" },
    select: { id: true, navn: true },
  });

  const results: Array<{
    linkId: string;
    navn: string;
    ok: boolean;
    pagesUpserted?: number;
    errors?: number;
    durationMs?: number;
    error?: string;
  }> = [];

  for (const link of links) {
    try {
      const res = await syncNotionDatabase(link.id);
      results.push({
        linkId: link.id,
        navn: link.navn,
        ok: true,
        ...res,
      });
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
