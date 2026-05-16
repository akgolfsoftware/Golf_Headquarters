// POST /api/admin/cleanup-recordings/preview
// Returnerer hvor mange SessionRecording-rader som VILLE blitt ryddet
// av neste cleanup-recordings-cron — uten å slette noe. Kun for trygg
// manuell sjekk før daglig 03:00 UTC-jobb kjører.

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }
  if (user.role !== "ADMIN") {
    return NextResponse.json({ error: "Ikke autorisert" }, { status: 403 });
  }

  const naa = new Date();

  const totalt = await prisma.sessionRecording.count({
    where: {
      retentionUntil: { lt: naa },
      audioUrl: { not: null },
    },
  });

  // Eldste 10 — gir inntrykk av køen.
  const eksempler = await prisma.sessionRecording.findMany({
    where: {
      retentionUntil: { lt: naa },
      audioUrl: { not: null },
    },
    select: {
      id: true,
      audioUrl: true,
      retentionUntil: true,
      durationSec: true,
    },
    orderBy: { retentionUntil: "asc" },
    take: 10,
  });

  return NextResponse.json({
    ok: true,
    naa: naa.toISOString(),
    villeSlettet: totalt,
    eksempler,
  });
}
