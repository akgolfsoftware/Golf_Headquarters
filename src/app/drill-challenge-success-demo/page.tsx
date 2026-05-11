/**
 * DEMO — Drill Challenge Success
 * Bygd fra wireframe live-states/e1-drill-challenge-success.html
 * URL: /drill-challenge-success-demo
 */

import { ArrowRight, Check, Target, X } from "lucide-react";

export default function DrillChallengeSuccessDemo() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 px-4 py-8">
      <div className="w-full max-w-[640px] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        {/* Header */}
        <header className="flex items-start justify-between gap-6 border-b border-border px-6 pt-6 pb-5">
          <div className="flex-1">
            <h1 className="font-display text-[28px] font-semibold leading-tight tracking-tight">
              Drill-<em className="italic">challenge</em>
            </h1>
            <div className="mt-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              Sendt · 11. mai 2026 14:32
            </div>
          </div>
          <button
            className="grid h-9 w-9 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Lukk"
          >
            <X size={16} strokeWidth={1.5} />
          </button>
        </header>

        {/* Body */}
        <div className="flex flex-col items-center px-7 py-10 text-center">
          {/* Success icon */}
          <div className="mb-6 grid h-[88px] w-[88px] place-items-center rounded-full bg-accent text-accent-foreground shadow-[0_0_40px_-5px_rgba(209,248,67,0.6)]">
            <Check size={44} strokeWidth={2.5} />
          </div>

          <div className="font-display text-[30px] italic leading-[1.2]">
            Du er med! 4 invitasjoner sendt
          </div>
          <p className="mt-2.5 max-w-md text-sm leading-relaxed text-muted-foreground">
            Henrik, Anna, Mads og Lise får varsel nå. Challengen starter automatisk
            når 2 har akseptert.
          </p>

          {/* Summary card */}
          <div className="mt-7 w-full rounded-xl border border-border bg-secondary/40 p-5 text-left">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-md bg-accent text-primary">
                <Target size={18} strokeWidth={1.5} />
              </span>
              <div className="flex-1">
                <div className="text-[15px] font-semibold">10 putts fra 3 m</div>
                <div className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.04em] text-muted-foreground">
                  1 uke · beste forsøk · 5 deltakere
                </div>
              </div>
              <span className="rounded-full bg-accent px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-accent-foreground">
                Aktiv
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-between gap-3 border-t border-border bg-secondary/40 px-6 py-4">
          <button className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-card hover:text-foreground">
            Til oversikt
          </button>
          <button className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">
            Spill første forsøk
            <ArrowRight size={16} strokeWidth={2} />
          </button>
        </footer>
      </div>
    </div>
  );
}
