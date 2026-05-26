// POST /api/recording/analyze
// Body: { recordingId }
// Henter SessionRecording + transkripsjon, bygger spiller-kontekst, kjorer
// Claude-analyse, lagrer aiAnalysis JSON, sync-er til Notion (oppretter
// Coaching Session-side + appender linje pa Spillerprofil), lagrer
// notionPageId og setter status=DONE.

import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { rateLimit } from "@/lib/rate-limit";
import {
  analyserCoachingSesjon,
  type SpillerKontekst,
} from "@/lib/coaching-analysis";
import {
  finnSpillerSideId,
  opprettCoachingSesjon,
  appendTilSpillerprofil,
  NOTION_COACHING_DB_ID,
} from "@/lib/notion";
import {
  aggregateByArea,
  PYR_LABEL,
  PYR_REKKEFOLGE,
} from "@/lib/pyramide";

const Body = z.object({
  recordingId: z.string().min(1),
});

async function byggSpillerKontekst(playerId: string): Promise<SpillerKontekst> {
  const player = await prisma.user.findUnique({
    where: { id: playerId },
    select: {
      name: true,
      hcp: true,
      ambition: true,
    },
  });
  if (!player) {
    return {
      navn: "Ukjent spiller",
      hcp: null,
      ambisjon: null,
      alder: null,
      sisteFireUkerSummary: "Ingen aktivitet registrert.",
      aktivPlan: null,
    };
  }

  // Aktiv treningsplan
  const aktivPlan = await prisma.trainingPlan.findFirst({
    where: {
      userId: playerId,
      isActive: true,
      status: { in: ["ACTIVE", "ACCEPTED"] },
    },
    select: { name: true, startDate: true },
    orderBy: { startDate: "desc" },
  });

  // Sesjoner siste 4 uker
  const fireUkerSiden = new Date();
  fireUkerSiden.setDate(fireUkerSiden.getDate() - 28);
  const sesjoner = await prisma.trainingPlanSession.findMany({
    where: {
      plan: { userId: playerId },
      scheduledAt: { gte: fireUkerSiden },
      status: { in: ["COMPLETED", "ACTIVE"] },
    },
    select: { pyramidArea: true, durationMin: true },
  });

  let sisteFireUkerSummary: string;
  if (sesjoner.length === 0) {
    sisteFireUkerSummary = "Ingen fullforte trenings-sesjoner siste 4 uker.";
  } else {
    const agg = aggregateByArea(sesjoner);
    const total = sesjoner.length;
    const totalMin = Object.values(agg).reduce((s, v) => s + v, 0);
    const fordeling = PYR_REKKEFOLGE.filter((area) => agg[area] > 0)
      .map((area) => `${PYR_LABEL[area]} ${agg[area]}min`)
      .join(", ");
    sisteFireUkerSummary = `${total} okter, ${totalMin} min totalt. Fordeling: ${fordeling || "ingen data"}.`;
  }

  return {
    navn: player.name,
    hcp: player.hcp ?? null,
    ambisjon: player.ambition ?? null,
    alder: null,
    sisteFireUkerSummary,
    aktivPlan: aktivPlan?.name ?? null,
  };
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  // Rate-limit: 10 Claude-analyser per time per bruker (dyr AI-operasjon).
  const rl = await rateLimit({ key: `recording-analyze:${user.id}`, max: 10, windowMs: 3_600_000 });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "rate-limited" },
      { status: 429, headers: { "x-ratelimit-reset": String(rl.resetAt) } }
    );
  }

  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Ugyldig body" }, { status: 400 });
  }
  const { recordingId } = parsed.data;

  const recording = await prisma.sessionRecording.findUnique({
    where: { id: recordingId },
    select: {
      id: true,
      uploadedById: true,
      playerId: true,
      transcript: true,
      durationSec: true,
      status: true,
      completedAt: true,
    },
  });
  if (!recording) {
    return NextResponse.json({ error: "Recording finnes ikke" }, { status: 404 });
  }
  if (recording.uploadedById !== user.id && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Mangler tilgang" }, { status: 403 });
  }
  if (!recording.transcript || !recording.transcript.trim()) {
    return NextResponse.json(
      { error: "Mangler transkripsjon - kan ikke analysere" },
      { status: 400 },
    );
  }

  const varighetMin = recording.durationSec
    ? Math.max(1, Math.round(recording.durationSec / 60))
    : 0;

  // Bygg spiller-kontekst. Hvis recording mangler playerId, bruker vi
  // uploadedBy som fallback (egen-okt) men markerer alder som null.
  const spillerId = recording.playerId ?? recording.uploadedById;
  const spillerKontekst = await byggSpillerKontekst(spillerId);

  // 1) Kjor Claude
  let analyse;
  try {
    analyse = await analyserCoachingSesjon({
      spillerKontekst,
      transkripsjon: recording.transcript,
      varighetMin,
    });
  } catch (err) {
    console.error("[recording/analyze] Claude-feil", err);
    await audit({
      actorId: user.id,
      action: "recording.analyze_failed",
      target: `SessionRecording:${recording.id}`,
      metadata: { error: err instanceof Error ? err.message : "ukjent" },
    });
    return NextResponse.json(
      { error: "AI-analyse feilet", detail: err instanceof Error ? err.message : null },
      { status: 500 },
    );
  }

  // 2) Lagre analyse pa recording
  await prisma.sessionRecording.update({
    where: { id: recording.id },
    data: {
      aiAnalysis: analyse,
      status: "DONE",
    },
  });
  await audit({
    actorId: user.id,
    action: "recording.analyzed",
    target: `SessionRecording:${recording.id}`,
    metadata: { playerId: spillerId, varighetMin },
  });

  // 3) Notion-sync (best-effort - logger feil men lar fortsatt klienten fa
  //    suksess for selve analysen).
  let notionPageId: string | null = null;
  let notionUrl: string | null = null;
  if (NOTION_COACHING_DB_ID) {
    try {
      const spillerSideId = await finnSpillerSideId(spillerKontekst.navn);
      const dato = recording.completedAt ?? new Date();
      const res = await opprettCoachingSesjon({
        spillerNavn: spillerKontekst.navn,
        spillerSideId,
        dato,
        varighetMin,
        analyse: {
          teknisk: analyse.teknisk,
          taktisk: analyse.taktisk,
          mental: analyse.mental,
          fysisk: analyse.fysisk,
          hjemmelekse: analyse.hjemmelekse,
          coachAnalyse: analyse.coachAnalyse,
          nesteOktAnbefaling: analyse.nesteOktAnbefaling,
        },
        raaTranskripsjon: recording.transcript,
      });
      notionPageId = res.pageId;
      notionUrl = res.url;

      await prisma.sessionRecording.update({
        where: { id: recording.id },
        data: { notionPageId },
      });

      if (spillerSideId) {
        const datoStr = dato.toISOString().split("T")[0];
        await appendTilSpillerprofil(
          spillerSideId,
          datoStr,
          analyse.oppsummering,
        );
      }

      await audit({
        actorId: user.id,
        action: "recording.notion_synced",
        target: `SessionRecording:${recording.id}`,
        metadata: {
          notionPageId,
          notionUrl,
          spillerSideId: spillerSideId ?? null,
        },
      });
    } catch (err) {
      console.error("[recording/analyze] Notion-sync feilet", err);
      await audit({
        actorId: user.id,
        action: "recording.notion_failed",
        target: `SessionRecording:${recording.id}`,
        metadata: { error: err instanceof Error ? err.message : "ukjent" },
      });
    }
  }

  return NextResponse.json({
    ok: true,
    recordingId: recording.id,
    notionPageId,
    notionUrl,
  });
}
