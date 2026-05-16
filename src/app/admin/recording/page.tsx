/**
 * /admin/recording — CoachHQ sesjon-opptak
 *
 * Designet hentet fra src/app/sesjon-opptak-demo/page.tsx.
 * Henter siste 30 SessionRecording-rader fra Prisma og viser dem som
 * pipeline-status (transkriberer → analyserer → foreslår), waveform-placeholder
 * og meta-stats. Når Deepgram ikke er konfigurert, vises advarsels-kort.
 *
 * Roller: COACH, ADMIN.
 */

import {
  Check,
  CircleDot,
  Flag,
  Loader2,
  Mic,
  Pause,
  Play,
  Square,
  Tag,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { RecordingControls } from "./recording-controls";

type PipelineStatus = "done" | "active" | "idle";

type PipelineStep = {
  label: string;
  meta: string;
  status: PipelineStatus;
};

const STATUS_LABEL: Record<string, string> = {
  PROCESSING: "Behandles",
  DONE: "Ferdig",
  FAILED: "Feilet",
};

const STATUS_PILL: Record<string, string> = {
  PROCESSING: "bg-accent/25 text-foreground border border-accent/40",
  DONE: "bg-primary/10 text-primary border border-primary/20",
  FAILED: "bg-destructive/15 text-destructive border border-destructive/30",
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
  // ikke samme som aktiv recordingId i URL.
  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
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
    <div className="space-y-8">
      <PageHeader
        eyebrow="CoachHQ · Sesjon · opptak"
        titleLead="Lytter"
        titleItalic="mens du coacher"
        sub="Last opp lyd-fil og Deepgram transkriberer i sanntid. Pipeline trekker ut nøkkelpunkter til slutt."
      />

      {!harDeepgramKey && (
        <div className="rounded-lg border border-accent/40 bg-accent/5 p-6">
          <h3 className="font-display text-base font-semibold tracking-tight">
            Deepgram ikke konfigurert
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Automatisk transkripsjon krever en{" "}
            <code className="rounded bg-secondary px-1 py-0.5 font-mono text-xs">
              DEEPGRAM_API_KEY
            </code>{" "}
            i .env.local. Inntil videre kan opptak lastes opp manuelt og
            transkripsjon limes inn for hånd.
          </p>
        </div>
      )}

      {/* Live recording frame */}
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
              <span className="inline-flex items-center gap-2 rounded-full border border-destructive/30 bg-destructive/10 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-destructive">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-destructive" />
                </span>
                REC {formatVarighet(aktivt.durationSec ?? null)}
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                <CircleDot className="h-3 w-3" strokeWidth={1.5} />
                Ingen aktiv økt
              </span>
            )}
            <div className="ml-auto flex items-center gap-2 text-[13px] text-foreground">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-primary font-mono text-[9px] font-semibold text-primary-foreground">
                {(user.name ?? "?").trim().charAt(0).toUpperCase()}
              </span>
              <span className="font-medium">{user.name}</span>
              <span className="text-muted-foreground">— coach</span>
            </div>
          </>
        }
        stage={
          <div className="relative grid min-h-[480px] grid-rows-[auto_auto_1fr] items-start gap-8 px-8 pt-12 pb-32">
          {/* Pipeline */}
          <div className="flex items-center justify-center gap-6">
            {pipeline.map((step, i) => (
              <div key={step.label} className="flex items-center gap-6">
                <PipelineNode step={step} />
                {i < pipeline.length - 1 && (
                  <div
                    className={`h-px w-14 ${
                      pipeline[i].status === "done" ? "bg-primary" : "bg-border"
                    }`}
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
                className={`block w-1 rounded-full ${
                  harAktivt && aktivt.status === "PROCESSING"
                    ? "bg-primary"
                    : "bg-muted-foreground/30"
                }`}
                style={{
                  height: h,
                  opacity: 0.4 + (i % 5) * 0.12,
                }}
              />
            ))}
          </div>

          {/* Transcript-placeholder */}
          <div
            className="pointer-events-none absolute bottom-[104px] left-1/2 max-h-[200px] w-[720px] max-w-[90%] -translate-x-1/2 overflow-hidden px-6 py-4 font-mono text-[13px] leading-[1.6]"
            style={{
              maskImage: "linear-gradient(to top, #000 70%, transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(to top, #000 70%, transparent 100%)",
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
              <div className="text-muted-foreground/60 italic">
                Transkripsjon vises her når opptak starter …
              </div>
            )}
          </div>
        </div>
        }
      />

      {/* Timeline-scrubber */}
      <TimelineScrubber
        varighet={aktivt?.durationSec ?? 754}
        aktiv={harAktivt && aktivt?.status === "PROCESSING"}
      />

      {/* Meta-strip under frame */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <MetaStat label="Totalt opptak" value={String(totalt)} />
        <MetaStat label="Ferdig" value={String(ferdig)} />
        <MetaStat
          label="Behandles"
          value={String(behandles)}
          delta={behandles > 0 ? "live" : undefined}
        />
        <MetaStat
          label="Feilet"
          value={String(feilet)}
          tone={feilet > 0 ? "danger" : "default"}
        />
      </div>

      {/* Siste opptak */}
      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Historikk
            </span>
            <h3 className="mt-1 font-display text-lg font-semibold tracking-tight">
              Siste 30 opptak
            </h3>
          </div>
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
                className="flex flex-wrap items-center gap-4 rounded-lg border border-border bg-card p-4"
              >
                <span className="font-mono text-xs text-muted-foreground">
                  {formatDato(r.createdAt)}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] ${
                    STATUS_PILL[r.status] ??
                    "border border-border bg-secondary text-muted-foreground"
                  }`}
                >
                  {STATUS_LABEL[r.status] ?? r.status}
                </span>
                {r.durationSec && (
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {Math.round(r.durationSec / 60)} min
                  </span>
                )}
                {r.audioUrl ? (
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {r.audioUrl}
                  </span>
                ) : (
                  <span className="font-mono text-[10px] text-muted-foreground italic">
                    Lyd ikke klar
                  </span>
                )}
                {r.transcript && (
                  <details className="w-full">
                    <summary className="cursor-pointer font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                      Vis transkripsjon
                    </summary>
                    <pre className="mt-2 whitespace-pre-wrap rounded-md bg-secondary p-4 text-xs text-foreground">
                      {r.transcript}
                    </pre>
                  </details>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

// Stub-markers — i prod kommer disse fra SessionRecording.markers (eller en
// separat tabell). Beholdes som inline-array til schema er på plass.
type Marker = {
  posisjon: number; // 0..1
  ts: string;
  tag: "Setup" | "Backswing" | "Impact" | "Notat";
  notat: string;
};

const STUB_MARKERS: Marker[] = [
  { posisjon: 0.15, ts: "01:53", tag: "Setup", notat: "Bredere stance" },
  { posisjon: 0.38, ts: "04:46", tag: "Backswing", notat: "Skuldre roterer godt" },
  { posisjon: 0.62, ts: "07:48", tag: "Impact", notat: "Hofte først" },
  { posisjon: 0.84, ts: "10:34", tag: "Notat", notat: "Pust mellom slag" },
];

const TAG_FARGE: Record<Marker["tag"], string> = {
  Setup: "bg-accent text-accent-foreground",
  Backswing: "bg-primary/15 text-primary border border-primary/30",
  Impact: "bg-destructive/15 text-destructive border border-destructive/30",
  Notat: "bg-secondary text-foreground border border-border",
};

function formatTid(s: number): string {
  const m = Math.floor(s / 60);
  const sek = Math.round(s % 60);
  return `${String(m).padStart(2, "0")}:${String(sek).padStart(2, "0")}`;
}

function TimelineScrubber({
  varighet,
  aktiv,
}: {
  varighet: number;
  aktiv: boolean;
}) {
  const playhead = aktiv ? 0.42 : 0.0;

  return (
    <section className="space-y-4 rounded-2xl border border-border bg-card p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Timeline
          </span>
          <h3 className="mt-1 font-display text-lg font-semibold tracking-tight">
            Markers og tagging
          </h3>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-4 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
          >
            {aktiv ? (
              <Pause className="h-3.5 w-3.5" strokeWidth={1.75} />
            ) : (
              <Play className="h-3.5 w-3.5" strokeWidth={1.75} />
            )}
            {aktiv ? "Pause" : "Spill"}
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md bg-accent px-4 py-1.5 text-xs font-semibold text-accent-foreground transition-opacity hover:opacity-90"
          >
            <Flag className="h-3.5 w-3.5" strokeWidth={2} />
            Legg til marker
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md bg-destructive px-4 py-1.5 text-xs font-semibold text-destructive-foreground transition-opacity hover:opacity-90"
          >
            <Square className="h-3 w-3 fill-current" strokeWidth={0} />
            Stopp
          </button>
        </div>
      </div>

      {/* Stub video-player */}
      <div className="relative aspect-video w-full overflow-hidden rounded-md bg-foreground/90 dark:bg-card">
        <video
          className="h-full w-full"
          poster=""
          preload="none"
          controls={false}
          aria-label="Sesjon-opptak video"
        >
          <source src="" type="video/mp4" />
        </video>
        <div className="absolute inset-0 grid place-items-center text-background/60">
          <span className="font-mono text-[10px] uppercase tracking-[0.12em]">
            Video-stub
          </span>
        </div>
      </div>

      {/* Scrubber-spor */}
      <div className="space-y-2">
        <div className="relative h-12 rounded-md border border-border bg-secondary/40">
          <span
            className="absolute inset-y-0 left-0 rounded-l-md bg-primary/20"
            style={{ width: `${playhead * 100}%` }}
          />
          <span
            className="absolute top-0 h-full w-px bg-primary"
            style={{ left: `${playhead * 100}%` }}
            aria-hidden
          />
          <span
            className="absolute top-1/2 grid h-4 w-4 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-primary"
            style={{ left: `${playhead * 100}%` }}
            aria-hidden
          />
          {STUB_MARKERS.map((m, i) => (
            <span
              key={i}
              className="absolute top-0 flex h-full -translate-x-1/2 flex-col items-center"
              style={{ left: `${m.posisjon * 100}%` }}
            >
              <span className="h-full w-0.5 bg-foreground/40" aria-hidden />
              <span className="absolute -top-2 grid h-4 w-4 place-items-center rounded-full border-2 border-background bg-foreground text-background">
                <Flag className="h-2 w-2" strokeWidth={2.5} />
              </span>
            </span>
          ))}
        </div>
        <div className="flex justify-between font-mono text-[10px] tabular-nums text-muted-foreground">
          <span>00:00</span>
          <span>{formatTid(varighet / 2)}</span>
          <span>{formatTid(varighet)}</span>
        </div>
      </div>

      {/* Marker-liste med tag-system */}
      <ul className="space-y-2">
        {STUB_MARKERS.map((m, i) => (
          <li
            key={i}
            className="flex flex-wrap items-center gap-4 rounded-md border border-border bg-background px-4 py-2 dark:bg-card"
          >
            <span className="font-mono text-xs tabular-nums text-muted-foreground">
              {m.ts}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] ${TAG_FARGE[m.tag]}`}
            >
              <Tag className="h-2.5 w-2.5" strokeWidth={2} />
              {m.tag}
            </span>
            <span className="flex-1 text-sm text-foreground">{m.notat}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function PipelineNode({ step }: { step: PipelineStep }) {
  const ringStyles =
    step.status === "active"
      ? "border-primary text-primary bg-primary/10"
      : step.status === "done"
        ? "border-primary text-primary bg-primary/10"
        : "border-border text-muted-foreground bg-card";
  const metaStyles =
    step.status === "active"
      ? "text-primary font-mono"
      : step.status === "done"
        ? "text-primary"
        : "text-muted-foreground";
  const Icon =
    step.status === "active"
      ? Loader2
      : step.status === "done"
        ? Check
        : CircleDot;
  return (
    <div className="flex min-w-[200px] flex-col items-center gap-2.5">
      <div
        className={`grid h-14 w-14 place-items-center rounded-full border-2 ${ringStyles}`}
      >
        <Icon
          className={`h-5 w-5 ${step.status === "active" ? "animate-spin" : ""}`}
          strokeWidth={1.5}
        />
      </div>
      <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        {step.label}
      </div>
      <div className={`text-[12px] ${metaStyles}`}>{step.meta}</div>
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
    <div className="rounded-md border border-border bg-card px-4 py-4">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 flex items-baseline gap-2">
        <span
          className={`font-mono text-[20px] font-medium tabular-nums tracking-tight ${
            tone === "danger" ? "text-destructive" : "text-foreground"
          }`}
        >
          {value}
        </span>
        {delta && (
          <span className="font-mono text-[10px] text-primary">{delta}</span>
        )}
      </div>
    </div>
  );
}
