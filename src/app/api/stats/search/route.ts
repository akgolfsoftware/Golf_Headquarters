/**
 * GET /api/stats/search?q=hovland
 *
 * Returnerer søkeresultater fra PublicPlayer, PgaPlayerSeason og Tournament.
 * Brukes av /stats/sok SokClient (live debounced søk).
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/security/same-origin";
import { offentligSpillerFilter } from "@/lib/stats/offentlig-spiller";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = await rateLimit({ key: `stats-search:${ip}`, max: 60, windowMs: 60_000 });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "rate-limited" },
      { status: 429, headers: { "x-ratelimit-reset": String(rl.resetAt) } },
    );
  }

  const q = req.nextUrl.searchParams.get("q") ?? "";

  if (!q || q.length < 2) {
    return NextResponse.json({ norskeSpillere: [], pgaSpillere: [], turneringer: [] });
  }

  const [norskeSpillere, pgaSpillere, turneringer] = await Promise.all([
    prisma.publicPlayer
      .findMany({
        where: {
          country: "NO",
          isActive: true,
          ...offentligSpillerFilter(),
          name: { contains: q, mode: "insensitive" },
        },
        take: 10,
        orderBy: { name: "asc" },
        select: { slug: true, name: true, tier: true, bio: true },
      })
      .catch(() => []),

    prisma.pgaPlayerSeason
      .findMany({
        where: {
          playerName: { contains: q, mode: "insensitive" },
          year: 2026,
        },
        take: 10,
        orderBy: { sgTotal: "desc" },
        select: { playerName: true, sgTotal: true, dgPlayerId: true },
      })
      .catch(() => []),

    prisma.tournament
      .findMany({
        where: {
          name: { contains: q, mode: "insensitive" },
          mergedIntoId: null,
        },
        orderBy: { startDate: "desc" },
        take: 10,
        select: { slug: true, name: true, startDate: true, tour: true },
      })
      .catch(() => []),
  ]);

  return NextResponse.json(
    { norskeSpillere, pgaSpillere, turneringer },
    {
      headers: {
        "Cache-Control": "no-store, must-revalidate",
      },
    },
  );
}
