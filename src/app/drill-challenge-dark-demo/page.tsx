/**
 * DEMO — Drill Challenge (mørkt tema, steg 2 av 2)
 * Bygd fra wireframe live-states/e1-drill-challenge-moerkt.html
 * URL: /drill-challenge-dark-demo
 */

import { ArrowLeft, Plus, Send, Target, X } from "lucide-react";

type Friend = { initials: string; name: string };

const SELECTED_FRIENDS: Friend[] = [
  { initials: "HN", name: "Henrik Nilsen" },
  { initials: "AK", name: "Anders Kristiansen" },
  { initials: "MR", name: "Markus Roinås Pedersen" },
  { initials: "LS", name: "Lise Sandberg" },
];

const SUGGESTED_FRIENDS: Friend[] = [
  { initials: "JT", name: "Joachim Tangen" },
  { initials: "ES", name: "Emma Solberg" },
];

export default function DrillChallengeDarkDemo() {
  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <div className="fixed inset-0 flex items-center justify-center bg-black/60 px-4 py-8">
        <div className="w-full max-w-[640px] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
          {/* Header */}
          <header className="flex items-start justify-between gap-6 border-b border-border px-6 pt-6 pb-5">
            <div className="flex-1">
              <h1 className="font-display text-[28px] font-semibold leading-tight tracking-tight">
                Drill-<em className="italic">challenge</em>
              </h1>
              <div className="mt-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                Steg 2 av 2 · Inviter deltakere
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className="h-1.5 w-8 rounded-full bg-primary" />
                <span className="h-1.5 w-8 rounded-full bg-primary" />
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
          <div className="space-y-5 px-6 py-6">
            {/* Drill summary */}
            <div className="flex items-center gap-3 rounded-xl bg-secondary px-4 py-3.5">
              <span className="grid h-8 w-8 place-items-center rounded-md bg-accent/20 text-accent">
                <Target size={16} strokeWidth={1.5} />
              </span>
              <div className="flex-1">
                <div className="text-sm font-semibold">10 putts fra 3 m</div>
                <div className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.04em] text-muted-foreground">
                  1 uke · beste forsøk
                </div>
              </div>
              <button className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-card">
                Endre
              </button>
            </div>

            {/* Selected + suggested chips */}
            <div>
              <label className="block font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                Foreslåtte fra siste runder · 4 valgt
              </label>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {SELECTED_FRIENDS.map((f) => (
                  <span
                    key={f.initials}
                    className="inline-flex items-center gap-2 rounded-full bg-foreground px-3 py-1.5 pl-1.5 text-[13px] font-medium text-background"
                  >
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                      {f.initials}
                    </span>
                    {f.name}
                    <X size={14} strokeWidth={2} className="opacity-70" />
                  </span>
                ))}
                {SUGGESTED_FRIENDS.map((f) => (
                  <button
                    key={f.initials}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary"
                  >
                    <Plus size={14} strokeWidth={2} />
                    {f.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Personal message */}
            <div>
              <label className="block font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                Personlig melding (valgfri)
              </label>
              <textarea
                rows={3}
                defaultValue="Skal vi se hvem som er sterkest på 3-meterne i sommer-toppform?"
                className="mt-2 w-full rounded-md border border-input bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          {/* Footer */}
          <footer className="flex items-center justify-between gap-3 border-t border-border bg-secondary/40 px-6 py-4">
            <button className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-card">
              <ArrowLeft size={14} strokeWidth={2} />
              Tilbake
            </button>
            <button className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">
              Send invitasjon (4 venner)
              <Send size={16} strokeWidth={2} />
            </button>
          </footer>
        </div>
      </div>
    </div>
  );
}
