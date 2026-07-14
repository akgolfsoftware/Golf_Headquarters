/**
 * AgencyOS — Sesjon-opptak (`/admin/recording`), v2.
 * Port av `(legacy)/recording/page.tsx` + `recording-controls.tsx` +
 * `recording-analyze-button.tsx` (2026-07-14, AgencyOS Bølge 3.11) — samme
 * `SessionRecording`-modell og `/api/recording/*`-kontrakt, MediaRecorder/
 * Wake Lock/chunk-opplasting-logikken er uendret (kun re-skinnet i
 * `AdminOpptakV2`).
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { AdminOpptakV2, type OpptakRadV2, type PipelineStepV2 } from "@/components/admin/v2/AdminOpptakV2";
import type { StatusTone } from "@/components/v2";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  RECORDING: "Tar opp",
  PROCESSING: "Behandles",
  DONE: "Ferdig",
  FAILED: "Feilet",
  ABORTED: "Avbrutt",
};

const STATUS_TONE: Record<string, StatusTone> = {
  RECORDING: "down",
  PROCESSING: "warn",
  DONE: "up",
  FAILED: "down",
  ABORTED: "info",
};

function formatDato(d: Date): string {
  return d.toLocaleDateString("nb-NO", { day: "2-digit", month: "2-digit", year: "numeric" });
}

type SearchParams = Promise<{ id?: string }>;

export default async function RecordingAdmin({ searchParams }: { searchParams?: SearchParams }) {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const sp = (await searchParams) ?? {};
  const activeRecordingId = sp.id ?? null;

  const recordings = await prisma.sessionRecording.findMany({
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  // valueOf() unngår react-compiler purity-warning på Date.now() (request-time,
  // ikke render-time) — samme triks som i legacy-siden.
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

  const harDeepgramKey = !!process.env.DEEPGRAM_API_KEY;

  const aktivt = activeRecordingId
    ? (recordings.find((r) => r.id === activeRecordingId) ?? null)
    : (recordings.find((r) => r.status === "PROCESSING") ?? recordings[0] ?? null);
  const harAktivt = !!aktivt;

  const pipeline: PipelineStepV2[] = aktivt
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

  const transkripsjonLinjer = aktivt?.transcript ? aktivt.transcript.split(/\n+/).slice(-4) : [];

  const opptak: OpptakRadV2[] = recordings.map((r) => ({
    id: r.id,
    datoTekst: formatDato(r.createdAt),
    statusLabel: STATUS_LABEL[r.status] ?? r.status,
    statusTone: STATUS_TONE[r.status] ?? "info",
    varighetTekst: r.durationSec ? `${Math.round(r.durationSec / 60)} min` : null,
    audioUrl: r.audioUrl,
    transcript: r.transcript,
    kanAnalysere: r.status === "PROCESSING",
    harTranskripsjon: !!r.transcript && r.transcript.trim().length > 0,
  }));

  return (
    <V2Shell nav={AGENCYOS_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <AdminOpptakV2
        harDeepgramKey={harDeepgramKey}
        activeRecordingId={activeRecordingId}
        recoveryRecordingId={recovery?.id ?? null}
        recoveryStartedAtTekst={
          recovery
            ? recovery.startedAt.toLocaleString("nb-NO", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })
            : null
        }
        userNavn={user.name}
        harAktivt={harAktivt}
        aktivProsesserer={harAktivt && aktivt?.status === "PROCESSING"}
        aktivVarighetSek={aktivt?.durationSec ?? 0}
        pipeline={pipeline}
        transkripsjonLinjer={transkripsjonLinjer}
        totalt={recordings.length}
        ferdig={recordings.filter((r) => r.status === "DONE").length}
        behandles={recordings.filter((r) => r.status === "PROCESSING").length}
        feilet={recordings.filter((r) => r.status === "FAILED").length}
        opptak={opptak}
      />
    </V2Shell>
  );
}
