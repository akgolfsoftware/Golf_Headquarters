/**
 * CoachHQ — Sesjon Opptak (Recording-state)
 * Bygd fra wireframe/design-files-v2/screens/05-coachhq-sesjon-opptak.html
 * URL: /sesjon-opptak-demo
 *
 * Produksjonsskjerm: ett aktivt opptak under live coaching-økt.
 * Deepgram-pipeline transkriberer i sanntid. Wave-form viser audio-input,
 * pipeline-steg 1 spinner, live transkripsjon fader inn nederst.
 */

import { Check, CircleDot, Loader2, Pause, Square, X } from "lucide-react";

type PipelineStatus = "done" | "active" | "idle";

type PipelineStep = {
  label: string;
  meta: string;
  status: PipelineStatus;
};

const pipeline: PipelineStep[] = [
  { label: "Transkriberer", meta: "12:34 live", status: "active" },
  { label: "Analyserer", meta: "venter", status: "idle" },
  { label: "Foreslår", meta: "venter", status: "idle" },
];

type TranscriptLine = { ts: string; text: string; fresh?: boolean };

const transcript: TranscriptLine[] = [
  { ts: "14:32", text: "... og så slo jeg en ny ball som gikk" },
  { ts: "14:32", text: "... 240 meter, ganske rett" },
  { ts: "14:33", text: "... tror grepet føles bedre nå", fresh: true },
  { ts: "14:33", text: "... men avslutningen er ennå litt åpen", fresh: true },
];

// Pre-computed deterministic waveform bars (live-state)
const wave: number[] = Array.from({ length: 120 }, (_, i) => {
  const h =
    6 +
    Math.abs(Math.sin(i * 0.4) * 40) +
    Math.abs(Math.sin(i * 0.13) * 30);
  return Math.round(h);
});

export default function SesjonOpptakDemo() {
  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <header className="mb-6">
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          CoachHQ · Sesjon · opptak
        </span>
        <h1 className="mt-2 font-display text-[36px] font-medium leading-[1.1] tracking-tight">
          Lytter <em className="italic text-primary">mens du coacher</em>.
        </h1>
        <p className="mt-1.5 text-[13px] text-muted-foreground">
          Markus R Pedersen · TEK · Driver · GFGK Performance Studio. Deepgram
          transkriberer i sanntid, pipeline trekker ut nøkkelpunkter til slutt.
        </p>
      </header>

      {/* Frame */}
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        {/* Topbar */}
        <div className="flex items-center justify-between border-b border-border bg-[var(--surface-alt,#F1EEE5)] px-4 py-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#A32D2D]/30 bg-destructive/8 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-destructive">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-destructive" />
              </span>
              REC 12:34
            </span>
          </div>
          <div className="flex items-center gap-2 text-[13px] text-foreground">
            <span className="grid h-5 w-5 place-items-center rounded-full bg-[var(--color-pyr-tek,#B8852A)] font-mono text-[9px] font-semibold text-white">
              MR
            </span>
            <span className="font-medium">Markus R Pedersen</span>
            <span className="text-muted-foreground">— TEK · Driver</span>
          </div>
          <button
            aria-label="Lukk"
            className="grid h-7 w-7 place-items-center rounded-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <X size={16} strokeWidth={1.5} />
          </button>
        </div>

        {/* Stage */}
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
                className="block w-1 rounded-full bg-primary"
                style={{
                  height: h,
                  opacity: 0.4 + (i % 5) * 0.12,
                }}
              />
            ))}
          </div>

          {/* Transcript */}
          <div
            className="pointer-events-none absolute bottom-[104px] left-1/2 max-h-[200px] w-[720px] max-w-[90%] -translate-x-1/2 overflow-hidden px-6 py-2 font-mono text-[13px] leading-[1.6]"
            style={{
              maskImage:
                "linear-gradient(to top, #000 70%, transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(to top, #000 70%, transparent 100%)",
            }}
          >
            {transcript.map((line, i) => (
              <div
                key={i}
                className={
                  line.fresh ? "text-foreground" : "text-muted-foreground"
                }
              >
                <span className="mr-2 text-[var(--ink-disabled,#C4C0B8)]">
                  {line.ts}
                </span>
                {line.text}
              </div>
            ))}
          </div>
        </div>

        {/* Bottombar */}
        <div className="flex items-center gap-2 border-t border-border bg-[var(--surface-alt,#F1EEE5)] px-4 py-4">
          <button className="inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary">
            <Pause size={16} strokeWidth={1.5} />
            Pause opptak
          </button>
          <button className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90">
            <Square size={16} strokeWidth={1.5} fill="currentColor" />
            Avslutt og analyser
          </button>
        </div>
      </div>

      {/* Meta-strip under frame */}
      <div className="mt-6 grid grid-cols-4 gap-2">
        <MetaStat label="Varighet" value="12:34" />
        <MetaStat label="Lyd-kvalitet" value="HD · 48 kHz" />
        <MetaStat label="Ord transkribert" value="1 248" />
        <MetaStat label="Nøkkelpunkter" value="3 så langt" delta="oppdaterer" />
      </div>
    </div>
  );
}

function PipelineNode({ step }: { step: PipelineStep }) {
  const ringStyles =
    step.status === "active"
      ? "border-primary text-primary bg-primary/8 shadow-[0_0_0_6px_rgba(0,88,64,0.08),0_0_20px_rgba(0,88,64,0.25)]"
      : step.status === "done"
        ? "border-primary text-primary bg-primary/8"
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
          size={20}
          strokeWidth={1.5}
          className={step.status === "active" ? "animate-spin" : ""}
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
}: {
  label: string;
  value: string;
  delta?: string;
}) {
  return (
    <div className="rounded-md border border-border bg-card px-4 py-2">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="font-mono text-[20px] font-medium tabular-nums tracking-tight text-foreground">
          {value}
        </span>
        {delta && (
          <span className="font-mono text-[10px] text-primary">{delta}</span>
        )}
      </div>
    </div>
  );
}

