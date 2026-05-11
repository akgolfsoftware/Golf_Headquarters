/**
 * PILOT — CoachHQ Agent Feedback (modal)
 * Bygd direkte fra wireframe/design-files-v2/modaler-D/d08-agent-feedback.html
 * URL: /agent-feedback-demo
 *
 * Mock-data: Tilbakemelding fra Anders til Deload-agent etter avvist anbefaling
 * for Markus Roinås Pedersen.
 */

import { X, MessageSquare, ArrowRight } from "lucide-react";

const BACKDROP = "fixed inset-0 z-0 bg-[rgba(10,31,24,0.5)]" as const;

interface Reason {
  name: string;
  desc: string;
  checked?: boolean;
}

const REASONS: Reason[] = [
  {
    name: "For aggressiv anbefaling",
    desc: "Hele uken som pause er for mye — en redusert-volum-uke hadde vært nok.",
    checked: true,
  },
  {
    name: "Feil timing",
    desc: "Riktig type anbefaling, men ikke akkurat nå — kommer for tidlig eller for sent.",
  },
  {
    name: "Ikke relevant for spilleren",
    desc: "Spillerens kontekst eller mål gjør at dette ikke passer.",
  },
  {
    name: "Manglet kontekst",
    desc: "Agenten så ikke noe som er åpenbart relevant.",
  },
  {
    name: "Annet",
    desc: "Beskriv selv i fri-tekst under.",
  },
];

export default function AgentFeedbackDemo() {
  return (
    <div className="relative min-h-screen bg-background">
      <div className={BACKDROP} aria-hidden="true" />

      <div className="relative z-10 mx-auto my-8 w-full max-w-[640px] overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
        {/* Head */}
        <header className="flex items-start justify-between gap-4 border-b border-border px-8 pb-5 pt-6">
          <div>
            <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.07em] text-muted-foreground">
              <MessageSquare className="h-3 w-3" strokeWidth={2} />
              CoachHQ · agent-læring
            </div>
            <h2 className="mt-1.5 font-display text-[26px] font-semibold leading-tight tracking-tight text-foreground">
              Tilbakemelding til agent
            </h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
              Hjelper agenten å lære av denne beslutningen — tar 30 sek.
            </p>
          </div>
          <button
            type="button"
            aria-label="Lukk"
            className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </header>

        <div className="px-8 pb-2">
          {/* Context card */}
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-border bg-secondary px-4 py-3.5">
            <span className="mt-0.5 flex-shrink-0 rounded-full bg-[rgba(197,48,48,0.12)] px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.06em] text-[#a83232]">
              Avvist
            </span>
            <div className="flex-1 min-w-0">
              <div className="font-display text-[15px] font-semibold -tracking-[0.005em] text-foreground">
                Pauseuke anbefalt for Markus R Pedersen
              </div>
              <div className="mt-1 font-mono text-[11px] tabular-nums text-muted-foreground">
                <span className="font-bold text-primary">Deload-agent</span> · konfidens 87 % · avvist 4 min siden
              </div>
            </div>
          </div>

          {/* Reason field */}
          <div className="mt-6 flex items-center justify-between">
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
              Hvorfor avviste du?
            </span>
            <span className="font-mono text-[11px] text-muted-foreground">— velg én</span>
          </div>
          <div className="mt-2.5 flex flex-col gap-1.5">
            {REASONS.map((r) => (
              <RadioRow key={r.name} reason={r} />
            ))}
          </div>

          {/* Detail */}
          <div className="mt-6 flex items-center justify-between">
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
              Detaljer
            </span>
            <span className="font-mono text-[11px] text-muted-foreground">— valgfri</span>
          </div>
          <textarea
            className="mt-2.5 min-h-[96px] w-full rounded-md border-[1.5px] border-border bg-card px-3.5 py-3 text-[14px] leading-relaxed text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            placeholder="Beskriv hva som var galt og hva som ville vært bedre …"
          />
          <div className="mt-1 flex justify-end font-mono text-[10px] uppercase tracking-[0.05em] text-muted-foreground">
            0 / 500
          </div>

          {/* Toggle row */}
          <div className="mt-5 flex items-start gap-3 rounded-xl bg-secondary px-4 py-3.5">
            <div className="relative mt-0.5 h-[22px] w-9 flex-shrink-0 cursor-pointer rounded-full bg-primary">
              <span className="absolute left-[17px] top-[3px] h-4 w-4 rounded-full bg-accent transition-all" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-display text-[14px] font-semibold -tracking-[0.005em] text-foreground">
                La agenten lære av dette
              </div>
              <div className="mt-1 text-[12px] leading-snug text-muted-foreground">
                Bruker tilbakemeldingen til å forbedre fremtidige anbefalinger for Markus og lignende profiler.
              </div>
            </div>
          </div>
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-border bg-secondary/40 px-8 py-4">
          <button
            type="button"
            className="rounded-md border border-border bg-transparent px-3.5 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary"
          >
            Avbryt
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-2 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Send tilbakemelding
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        </footer>
      </div>
    </div>
  );
}

function RadioRow({ reason }: { reason: Reason }) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-2.5 rounded-md border-[1.5px] px-3.5 py-3 transition-colors ${
        reason.checked
          ? "border-primary border-2 bg-primary/5 px-[13px] py-[11px]"
          : "border-border bg-card hover:border-muted-foreground"
      }`}
    >
      <span
        className={`relative mt-0.5 h-[18px] w-[18px] flex-shrink-0 rounded-full border-2 ${
          reason.checked ? "border-primary" : "border-muted-foreground"
        }`}
      >
        {reason.checked && (
          <span className="absolute inset-[3px] rounded-full bg-primary" />
        )}
      </span>
      <div className="flex-1 min-w-0">
        <div className="font-display text-[14px] font-semibold -tracking-[0.005em] text-foreground">
          {reason.name}
        </div>
        <div className="mt-0.5 text-[12px] leading-snug text-muted-foreground">{reason.desc}</div>
      </div>
    </label>
  );
}
