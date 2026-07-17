/**
 * AgencyOS — Sesjon-opptak (/admin/recording). v2-port 16. juli 2026.
 *
 * Coach tar opp coaching-økt; Whisper transkriberer (OPENAI_API_KEY) og
 * pipeline trekker ut nøkkelpunkter. Server component — ekte Prisma, ingen
 * falske tall. Recording-controls + analyze-button er egne klient-
 * komponenter (urørt).
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { AdminRecordingV2, type AdminRecordingV2Data, type AdminRecordingRad } from "@/components/admin/v2/AdminRecordingV2";

type SearchParams = Promise<{ id?: string }>;

export default async function RecordingAdmin({ searchParams }: { searchParams?: SearchParams }) {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const sp = (await searchParams) ?? {};
  const activeRecordingId = sp.id ?? null;

  const recordings = await prisma.sessionRecording.findMany({
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  // Recovery: status=RECORDING for innlogget coach, startet >5 min siden,
  // ikke samme som aktiv recordingId i URL. valueOf() unngår react-compiler
  // purity-warning på Date.now() (request-time, ikke render-time).
  const fiveMinAgo = new Date(new Date().valueOf() - 5 * 60 * 1000);
  const recovery = await prisma.sessionRecording.findFirst({
    where: {
      uploadedById: user.id,
      status: "RECORDING",
      startedAt: { lt: fiveMinAgo },
      ...(activeRecordingId ? { id: { not: activeRecordingId } } : {}),
    },
    orderBy: { startedAt: "desc" },
    select: { id: true, startedAt: true },
  });

  // Transkribering (src/lib/transcribe.ts) bruker OpenAI Whisper, ikke
  // Deepgram — sjekk riktig nøkkel (se AdminRecordingV2-kommentar for bug-fiks).
  const harTranskriberingsNokkel = !!process.env.OPENAI_API_KEY;

  const aktivt = activeRecordingId
    ? (recordings.find((r) => r.id === activeRecordingId) ?? null)
    : (recordings.find((r) => r.status === "PROCESSING") ?? recordings[0] ?? null);

  const pipeline: AdminRecordingV2Data["pipeline"] = aktivt
    ? aktivt.status === "DONE"
      ? [
          { label: "Transkriberer", meta: "ferdig", status: "done" },
          { label: "Analyserer", meta: "ferdig", status: "done" },
          { label: "Foreslår", meta: "klar", status: "done" },
        ]
      : aktivt.status === "FAILED"
        ? [
            { label: "Transkriberer", meta: "feilet", status: "idle" },
            { label: "Analyserer", meta: "venter", status: "idle" },
            { label: "Foreslår", meta: "venter", status: "idle" },
          ]
        : [
            { label: "Transkriberer", meta: "live", status: "active" },
            { label: "Analyserer", meta: "venter", status: "idle" },
            { label: "Foreslår", meta: "venter", status: "idle" },
          ]
    : [
        { label: "Transkriberer", meta: "—", status: "idle" },
        { label: "Analyserer", meta: "—", status: "idle" },
        { label: "Foreslår", meta: "—", status: "idle" },
      ];

  const rader: AdminRecordingRad[] = recordings.map((r) => ({
    id: r.id,
    dato: r.createdAt.toLocaleDateString("nb-NO", { day: "2-digit", month: "2-digit", year: "numeric" }),
    status: r.status,
    varighetMin: r.durationSec ? Math.round(r.durationSec / 60) : null,
    audioUrl: r.audioUrl,
    transcript: r.transcript,
  }));

  const data: AdminRecordingV2Data = {
    coachNavn: user.name ?? "Coach",
    harTranskriberingsNokkel,
    activeRecordingId,
    recoveryRecordingId: recovery?.id ?? null,
    recoveryStartedAtLabel: recovery
      ? recovery.startedAt.toLocaleString("nb-NO", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })
      : null,
    aktiv: aktivt ? { id: aktivt.id, status: aktivt.status, durationSec: aktivt.durationSec, transcript: aktivt.transcript } : null,
    pipeline,
    totalt: recordings.length,
    ferdig: recordings.filter((r) => r.status === "DONE").length,
    behandles: recordings.filter((r) => r.status === "PROCESSING").length,
    feilet: recordings.filter((r) => r.status === "FAILED").length,
    recordings: rader,
  };

  return <AdminRecordingV2 data={data} />;
}
