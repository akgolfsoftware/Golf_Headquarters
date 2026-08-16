// Cron-job: synk alle NotionDatabaseLinks med syncMode=AUTO.
// Kjører hvert 5. min (se vercel.json).

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { syncNotionDatabase } from "@/lib/notion/sync";
import { rateLimit } from "@/lib/rate-limit";
import { avvisUgyldigCron } from "@/lib/cron/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: Request): Promise<NextResponse> {
  const avvist = avvisUgyldigCron(req);
  if (avvist) return avvist;
  const rl = await rateLimit({ key: `cron-notion-sync`, max: 5, windowMs: 60_000 });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "rate-limited" },
      { status: 429, headers: { "x-ratelimit-reset": String(rl.resetAt) } },
    );
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
