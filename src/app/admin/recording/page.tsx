/**
 * AgencyOS — Sesjon-opptak (/admin/recording). Flyttet ut av (legacy)
 * 2026-07-27 — egen V2Shell-chrome (mønster: /admin/okter, /admin/settings).
 *
 * Coach velger spiller og tar opp coaching-økt; Whisper transkriberer
 * (OPENAI_API_KEY) og Claude-analysen kjøres automatisk etterpå
 * (/api/recording/complete → transcribe → analyze). Server component —
 * ekte Prisma, ingen falske tall. aiAnalysis leses zod-validert
 * (AnalyseResultatSchema) — aldri `as unknown as`.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { TilbakeLenke } from "@/components/v2";
import { GlobalSearchModal } from "@/components/admin/global-search-modal";
import { AnalyseResultatSchema, type AnalyseResultat } from "@/lib/coaching-analysis";
import {
  AdminRecordingV2,
  type AdminRecordingV2Data,
  type AdminRecordingRad,
} from "@/components/admin/v2/AdminRecordingV2";
import { hentLydSamtykkeKart } from "@/lib/recording/lyd-samtykke";

type SearchParams = Promise<{ id?: string; okt?: string }>;

function parseAnalyse(json: unknown): AnalyseResultat | null {
  if (!json) return null;
  const parsed = AnalyseResultatSchema.safeParse(json);
  return parsed.success ? parsed.data : null;
}

export default async function RecordingAdmin({ searchParams }: { searchParams?: SearchParams }) {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const sp = (await searchParams) ?? {};
  const activeRecordingId = sp.id ?? null;

  // ?okt= — opptaket startes fra en treningsøkt. Spilleren låses til øktas
  // spiller, og /api/recording/start knytter opptaket til økta, slik at
  // coachens live-økt-flate kan vise transkript og analyse for nettopp den.
  // Tilgang håndheves i API-et; her henter vi kun visningsdata.
  const oktRad = sp.okt
    ? await prisma.trainingSessionV2.findUnique({
        where: { id: sp.okt },
        select: { id: true, title: true, studentId: true },
      })
    : null;
  const okt =
    oktRad?.studentId != null
      ? { sessionId: oktRad.id, playerId: oktRad.studentId, tittel: oktRad.title }
      : null;

  const [recordings, spillere] = await Promise.all([
    prisma.sessionRecording.findMany({
      orderBy: { createdAt: "desc" },
      take: 30,
      include: { player: { select: { name: true } } },
    }),
    prisma.user.findMany({
      where: { role: "PLAYER" },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  // Hard gate for UI: Start-knapp skjules uten GITT (server avviser uansett).
  const lydSamtykkeKart = await hentLydSamtykkeKart(spillere.map((s) => s.id));

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

  // Transkribering (src/lib/transcribe.ts) bruker OpenAI Whisper og gates
  // på OPENAI_API_KEY.
  const harTranskriberingsNokkel = !!process.env.OPENAI_API_KEY;

  const aktivt = activeRecordingId
    ? (recordings.find((r) => r.id === activeRecordingId) ?? null)
    : (recordings.find((r) => r.status === "PROCESSING") ?? recordings[0] ?? null);

  const aktivAnalyse = aktivt ? parseAnalyse(aktivt.aiAnalysis) : null;

  // Pipeline-status utledes fra faktisk fremdrift (transcript/aiAnalysis),
  // ikke bare status-enum — så coach ser hvilket steg som faktisk pågår.
  const pipeline: AdminRecordingV2Data["pipeline"] = (() => {
    if (!aktivt) {
      return [
        { label: "Transkriberer", meta: "—", status: "idle" as const },
        { label: "Analyserer", meta: "—", status: "idle" as const },
        { label: "Foreslår", meta: "—", status: "idle" as const },
      ];
    }
    const harTranskript = !!aktivt.transcript?.trim();
    switch (aktivt.status) {
      case "DONE":
        return [
          { label: "Transkriberer", meta: "ferdig", status: "done" as const },
          { label: "Analyserer", meta: "ferdig", status: "done" as const },
          { label: "Foreslår", meta: "klar", status: "done" as const },
        ];
      case "FAILED":
        return harTranskript
          ? [
              { label: "Transkriberer", meta: "ferdig", status: "done" as const },
              { label: "Analyserer", meta: "feilet", status: "idle" as const },
              { label: "Foreslår", meta: "venter", status: "idle" as const },
            ]
          : [
              { label: "Transkriberer", meta: "feilet", status: "idle" as const },
              { label: "Analyserer", meta: "venter", status: "idle" as const },
              { label: "Foreslår", meta: "venter", status: "idle" as const },
            ];
      case "PROCESSING":
        return harTranskript
          ? [
              { label: "Transkriberer", meta: "ferdig", status: "done" as const },
              { label: "Analyserer", meta: "kjører", status: "active" as const },
              { label: "Foreslår", meta: "venter", status: "idle" as const },
            ]
          : [
              { label: "Transkriberer", meta: "kjører", status: "active" as const },
              { label: "Analyserer", meta: "venter", status: "idle" as const },
              { label: "Foreslår", meta: "venter", status: "idle" as const },
            ];
      default:
        // RECORDING / ABORTED
        return [
          { label: "Transkriberer", meta: "venter", status: "idle" as const },
          { label: "Analyserer", meta: "venter", status: "idle" as const },
          { label: "Foreslår", meta: "venter", status: "idle" as const },
        ];
    }
  })();

  const rader: AdminRecordingRad[] = recordings.map((r) => ({
    id: r.id,
    dato: r.createdAt.toLocaleDateString("nb-NO", { day: "2-digit", month: "2-digit", year: "numeric" }),
    status: r.status,
    spillerNavn: r.player?.name ?? null,
    varighetMin: r.durationSec ? Math.round(r.durationSec / 60) : null,
    audioUrl: r.audioUrl,
    transcript: r.transcript,
    analyse: parseAnalyse(r.aiAnalysis),
  }));

  const data: AdminRecordingV2Data = {
    coachNavn: user.name ?? "Coach",
    harTranskriberingsNokkel,
    activeRecordingId,
    recoveryRecordingId: recovery?.id ?? null,
    recoveryStartedAtLabel: recovery
      ? recovery.startedAt.toLocaleString("nb-NO", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })
      : null,
    spillere: spillere.map((s) => ({
      id: s.id,
      navn: s.name,
      lydSamtykkeGitt: lydSamtykkeKart[s.id] === true,
    })),
    aktiv: aktivt
      ? {
          id: aktivt.id,
          status: aktivt.status,
          durationSec: aktivt.durationSec,
          transcript: aktivt.transcript,
          spillerNavn: aktivt.player?.name ?? null,
          analyse: aktivAnalyse,
        }
      : null,
    pipeline,
    totalt: recordings.length,
    ferdig: recordings.filter((r) => r.status === "DONE").length,
    behandles: recordings.filter((r) => r.status === "PROCESSING").length,
    feilet: recordings.filter((r) => r.status === "FAILED").length,
    recordings: rader,
    okt,
  };

  return (
    <V2Shell bredde="kolonne" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"} avatarUrl={user.avatarUrl}>
      <TilbakeLenke href="/admin/agencyos">Cockpit</TilbakeLenke>
      <AdminRecordingV2 data={data} />
      <GlobalSearchModal />
    </V2Shell>
  );
}
