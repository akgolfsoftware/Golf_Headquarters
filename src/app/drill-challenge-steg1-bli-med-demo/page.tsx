/**
 * DEMO — Drill Challenge Steg 1 (Bli med på eksisterende)
 * Bygd fra wireframe live-states/e1-drill-challenge-steg1-bli-med.html
 * URL: /drill-challenge-steg1-bli-med-demo
 */

import { ArrowRight, ChevronDown, ChevronUp, X } from "lucide-react";

type OpenChallenge = {
  initials: string;
  title: string;
  tag: string;
  tagWarn?: boolean;
  byline: string;
  expanded?: boolean;
};

const CHALLENGES: OpenChallenge[] = [
  {
    initials: "HN",
    title: "10 putts fra 3 m",
    tag: "TEK",
    byline: "Henrik Nilsen · slutter om 3 dager",
    expanded: true,
  },
  {
    initials: "AK",
    title: "Bunker up & down",
    tag: "SLAG",
    byline: "Anders Kristiansen · slutter om 1 uke",
  },
  {
    initials: "MR",
    title: "150 m approach-konsistens",
    tag: "SPILL",
    tagWarn: true,
    byline: "Markus Roinås Pedersen · slutter om 2 uker",
  },
];

export default function DrillChallengeSteg1BliMedDemo() {
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
              Steg 1 av 2 · Lag ny eller bli med
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="h-1.5 w-8 rounded-full bg-primary" />
              <span className="h-1.5 w-8 rounded-full bg-border" />
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
        <div className="px-6 py-6">
          {/* Mode toggle */}
          <div className="mb-6 grid grid-cols-2 gap-1.5 rounded-xl bg-secondary p-1">
            <button className="rounded-lg px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Lag ny challenge
            </button>
            <button className="rounded-lg bg-card px-4 py-2.5 text-sm font-medium text-foreground shadow-sm">
              Bli med på eksisterende
            </button>
          </div>

          <label className="block font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
            3 åpne challenges fra venner
          </label>

          {/* Invite code input */}
          <div className="mt-2.5 mb-4">
            <input
              type="text"
              placeholder="… eller lim inn invite-kode"
              defaultValue=""
              className="w-full rounded-md border border-input bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex flex-col gap-2.5">
            {CHALLENGES.map((c) => (
              <div
                key={c.title}
                className={`rounded-xl border bg-card ${
                  c.expanded ? "border-foreground p-5" : "border-border px-5 py-4"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full bg-primary text-[12px] font-semibold text-primary-foreground">
                    {c.initials}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="text-[15px] font-semibold">{c.title}</div>
                      <span
                        className={`rounded-sm px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] ${
                          c.tagWarn
                            ? "bg-[#B8852A]/10 text-[#B8852A]"
                            : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        {c.tag}
                      </span>
                    </div>
                    <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.04em] text-muted-foreground">
                      {c.byline}
                    </div>

                    {c.expanded && (
                      <div className="mt-4 grid grid-cols-3 gap-2.5">
                        <div className="rounded-lg bg-secondary px-3 py-2.5">
                          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                            Deltakere
                          </div>
                          <div className="mt-0.5 font-mono text-[18px] font-medium tabular-nums">
                            4 / 8
                          </div>
                        </div>
                        <div className="rounded-lg bg-secondary px-3 py-2.5">
                          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                            Beste
                          </div>
                          <div className="mt-0.5 font-mono text-[18px] font-medium tabular-nums">
                            9/10
                          </div>
                        </div>
                        <div className="rounded-lg bg-secondary px-3 py-2.5">
                          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                            Scoring
                          </div>
                          <div className="mt-0.5 text-[13px] font-medium">
                            Beste forsøk
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <span className="text-muted-foreground">
                    {c.expanded ? (
                      <ChevronUp size={18} strokeWidth={1.5} />
                    ) : (
                      <ChevronDown size={18} strokeWidth={1.5} />
                    )}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-between gap-3 border-t border-border bg-secondary/40 px-6 py-4">
          <button className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-card hover:text-foreground">
            Avbryt
          </button>
          <button className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">
            Bli med · 10 putts
            <ArrowRight size={16} strokeWidth={2} />
          </button>
        </footer>
      </div>
    </div>
  );
}
