/**
 * AgencyOS — Sesjon-opptak (/admin/recording)
 *
 * Coach tar opp coaching-økt; Deepgram transkriberer og pipeline trekker ut
 * nøkkelpunkter. Henter siste 30 SessionRecording-rader fra Prisma og viser
 * pipeline-status, waveform-placeholder og meta-stats. Server component —
 * ekte Prisma, ingen falske tall.
 *
 * Recording-controls + analyze-button er egne klient-komponenter (urørt).
 */

import {
  Check,
  CircleDot,
  Loader2,
  Mic,
  type LucideIcon,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";
import { RecordingControls } from "./recording-controls";
import { RecordingAnalyzeButton } from "@/components/admin/recording-analyze-button";

type PipelineStatus = "done" | "active" | "idle";

type PipelineStep = {
  label: string;
  meta: string;
  status: PipelineStatus;
};

const STATUS_LABEL: Record<string, string> = {
  RECORDING: "Tar opp",
  PROCESSING: "Behandles",
  DONE: "Ferdig",
  FAILED: "Feilet",
  ABORTED: "Avbrutt",
};

const STATUS_PILL: Record<string, string> = {
  RECORDING: "bg-destructive/10 text-destructive border border-destructive/30",
  PROCESSING: "bg-accent/25 text-foreground border border-accent/50",
  DONE: "bg-primary/10 text-primary border border-primary/20",
  FAILED: "bg-destructive/15 text-destructive border border-destructive/30",
  ABORTED: "bg-secondary text-muted-foreground border border-border",
};

// Pre-computed deterministic waveform bars
const wave: number[] = Array.from({ length: 120 }, (_, i) => {
  const h =
    6 +
    Math.abs(Math.sin(i * 0.4) * 40) +
    Math.abs(Math.sin(i * 0.13) * 30);
  return Math.round(h);
});

function formatVarighet(seconds: number | null): string {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function formatDato(d: Date): string {
  return d.toLocaleDateString("nb-NO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

type SearchParams = Promise<{ id?: string }>;

export default async function RecordingAdmin({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
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

  const harDeepgramKey = !!process.env.DEEPGRAM_API_KEY;

  // Plukk siste aktive opptak for live-vinduet, ellers placeholder
  const aktivt = activeRecordingId
    ? (recordings.find((r) => r.id === activeRecordingId) ?? null)
    : (recordings.find((r) => r.status === "PROCESSING") ??
        recordings[0] ??
        null);
  const harAktivt = !!aktivt;

  // Pipeline-tilstand basert på aktivt opptak
  const pipeline: PipelineStep[] = aktivt
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

  const totalt = recordings.length;
  const ferdig = recordings.filter((r) => r.status === "DONE").length;
  const behandles = recordings.filter((r) => r.status === "PROCESSING").length;
  const feilet = recordings.filter((r) => r.status === "FAILED").length;

  return (
    <div className="space-y-1">
      {/* header */}
      <div className="mb-3">
        <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
          AGENCYOS · OPPTAK
        </span>
        <h1 className="mt-2 font-display text-[30px] font-bold leading-[1.05] tracking-[-0.025em] text-foreground">
          Lytter <em className="font-normal italic text-primary">mens du coacher</em>.
        </h1>
        <p className="mt-1.5 max-w-[780px] text-sm leading-relaxed text-muted-foreground">
          Last opp lyd-fil og Deepgram transkriberer i sanntid. Pipeline trekker ut nøkkelpunkter til
          slutt og foreslår oppfølging.
        </p>
      </div>

      {!harDeepgramKey && (
        <div className="mt-5 rounded-xl border border-warning/40 bg-warning/[0.06] p-5">
          <h3 className="font-display text-[15px] font-bold tracking-[-0.01em] text-foreground">
            Deepgram ikke konfigurert
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            Automatisk transkripsjon krever en{" "}
            <code className="rounded bg-secondary px-1 py-0.5 font-mono text-xs">DEEPGRAM_API_KEY</code> i
            .env.local. Inntil videre kan opptak lastes opp manuelt og transkripsjon limes inn for hånd.
          </p>
        </div>
      )}

      {/* Live recording frame */}
      <div className="pt-5">
        <RecordingControls
          recordingId={activeRecordingId}
          recoveryRecordingId={recovery?.id ?? null}
          recoveryStartedAt={
            recovery
              ? recovery.startedAt.toLocaleString("nb-NO", {
                  day: "2-digit",
                  month: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : null
          }
          topbar={
            <>
              {harAktivt && aktivt.status === "PROCESSING" ? (
                <span className="inline-flex items-center gap-2 rounded-full border border-destructive/30 bg-destructive/10 px-2.5 py-1 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-destructive">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-destructive" />
                  </span>
                  REC {formatVarighet(aktivt.durationSec ?? null)}
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
                  <CircleDot className="h-3 w-3" strokeWidth={1.5} aria-hidden />
                  Ingen aktiv økt
                </span>
              )}
              <div className="ml-auto flex items-center gap-2 text-[13px] text-foreground">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-primary font-mono text-[9px] font-bold text-primary-foreground">
                  {(user.name ?? "?").trim().charAt(0).toUpperCase()}
                </span>
                <span className="font-medium">{user.name}</span>
                <span className="text-muted-foreground">— coach</span>
              </div>
            </>
          }
          stage={
            <div className="relative grid min-h-[480px] grid-rows-[auto_auto_1fr] items-start gap-8 px-8 pb-32 pt-12">
              {/* Pipeline */}
              <div className="flex items-center justify-center gap-6">
                {pipeline.map((step, i) => (
                  <div key={step.label} className="flex items-center gap-6">
                    <PipelineNode step={step} />
                    {i < pipeline.length - 1 && (
                      <div
                        className={cn(
                          "h-px w-14",
                          pipeline[i].status === "done" ? "bg-primary" : "bg-border",
                        )}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Waveform */}
              <div className="mx-auto flex h-[140px] w-full max-w-[720px] items-center justify-center gap-[3px]">
                {wave.map((h, i) => (
                  <span
                    key={i}
                    className={cn(
                      "block w-1 rounded-full",
                      harAktivt && aktivt.status === "PROCESSING" ? "bg-primary" : "bg-muted-foreground/30",
                    )}
                    style={{ height: h, opacity: 0.4 + (i % 5) * 0.12 }}
                  />
                ))}
              </div>

              {/* Transcript-placeholder */}
              <div
                className="pointer-events-none absolute bottom-[104px] left-1/2 max-h-[200px] w-[720px] max-w-[90%] -translate-x-1/2 overflow-hidden px-6 py-4 font-mono text-[13px] leading-[1.6]"
                style={{
                  maskImage: "linear-gradient(to top, #000 70%, transparent 100%)",
                  WebkitMaskImage: "linear-gradient(to top, #000 70%, transparent 100%)",
                }}
              >
                {aktivt?.transcript ? (
                  <div className="text-foreground">
                    {aktivt.transcript
                      .split(/\n+/)
                      .slice(-4)
                      .map((line, i) => (
                        <div key={i} className="text-muted-foreground">
                          {line}
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="italic text-muted-foreground/60">
                    Transkripsjon vises her når opptak starter …
                  </div>
                )}
              </div>
            </div>
          }
        />
      </div>

      {/* Meta-strip under frame */}
      <div className="grid grid-cols-2 gap-3 pt-5 sm:grid-cols-4">
        <MetaStat label="TOTALT OPPTAK" value={String(totalt)} />
        <MetaStat label="FERDIG" value={String(ferdig)} />
        <MetaStat label="BEHANDLES" value={String(behandles)} delta={behandles > 0 ? "live" : undefined} />
        <MetaStat label="FEILET" value={String(feilet)} tone={feilet > 0 ? "danger" : "default"} />
      </div>

      {/* Siste opptak */}
      <section className="space-y-4 pt-7">
        <div className="flex items-center gap-3 font-mono text-[11px] font-extrabold uppercase tracking-[0.12em] text-foreground">
          <span>Historikk · siste 30 opptak</span>
          <span className="rounded-full bg-secondary px-2 py-0.5 text-[9px] tracking-[0.06em] text-muted-foreground">
            {recordings.length}
          </span>
          <span className="h-px flex-1 bg-border" aria-hidden />
        </div>

        {recordings.length === 0 ? (
          <EmptyState
            icon={Mic}
            titleItalic="Ingen opptak"
            titleTrail="registrert"
            sub="Opptak fra coaching-økter dukker opp her etter opplasting."
          />
        ) : (
          <ul className="space-y-2">
            {recordings.map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card p-4"
              >
                <span className="font-mono text-xs tabular-nums text-muted-foreground">
                  {formatDato(r.createdAt)}
                </span>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 font-mono text-[9px] font-extrabold uppercase tracking-[0.10em]",
                    STATUS_PILL[r.status] ?? "border border-border bg-secondary text-muted-foreground",
                  )}
                >
                  {STATUS_LABEL[r.status] ?? r.status}
                </span>
                {r.durationSec && (
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {Math.round(r.durationSec / 60)} min
                  </span>
                )}
                {r.audioUrl ? (
                  <span className="truncate font-mono text-[10px] text-muted-foreground">{r.audioUrl}</span>
                ) : (
                  <span className="font-mono text-[10px] italic text-muted-foreground">Lyd ikke klar</span>
                )}
                {r.transcript && (
                  <details className="w-full">
                    <summary className="cursor-pointer font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground hover:text-foreground">
                      Vis transkripsjon
                    </summary>
                    <pre className="mt-2 whitespace-pre-wrap rounded-md bg-secondary p-4 text-xs text-foreground">
                      {r.transcript}
                    </pre>
                  </details>
                )}
                {r.status === "PROCESSING" && (
                  <RecordingAnalyzeButton
                    recordingId={r.id}
                    harTranskripsjon={!!r.transcript && r.transcript.trim().length > 0}
                  />
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function PipelineNode({ step }: { step: PipelineStep }) {
  const ringStyles =
    step.status === "active" || step.status === "done"
      ? "border-primary text-primary bg-primary/10"
      : "border-border text-muted-foreground bg-card";
  const metaStyles =
    step.status === "active"
      ? "text-primary font-mono"
      : step.status === "done"
        ? "text-primary"
        : "text-muted-foreground";
  const Icon: LucideIcon =
    step.status === "active" ? Loader2 : step.status === "done" ? Check : CircleDot;
  return (
    <div className="flex min-w-[200px] flex-col items-center gap-2.5">
      <div className={cn("grid h-14 w-14 place-items-center rounded-full border-2", ringStyles)}>
        <Icon
          className={cn("h-5 w-5", step.status === "active" && "animate-spin")}
          strokeWidth={1.5}
          aria-hidden
        />
      </div>
      <div className="font-mono text-[11px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground">
        {step.label}
      </div>
      <div className={cn("text-[12px]", metaStyles)}>{step.meta}</div>
    </div>
  );
}

function MetaStat({
  label,
  value,
  delta,
  tone = "default",
}: {
  label: string;
  value: string;
  delta?: string;
  tone?: "default" | "danger";
}) {
  return (
    <div className="rounded-xl border border-border bg-card px-[18px] py-4">
      <div className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span
          className={cn(
            "font-mono text-[28px] font-bold leading-none tracking-[-0.02em] tabular-nums",
            tone === "danger" ? "text-destructive" : "text-foreground",
          )}
        >
          {value}
        </span>
        {delta && <span className="font-mono text-[10px] font-bold text-primary">{delta}</span>}
      </div>
    </div>
  );
}
