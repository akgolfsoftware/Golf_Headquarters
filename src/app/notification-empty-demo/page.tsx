/**
 * DEMO — Notification center empty-state
 * Bygd fra wireframe live-states/e5-notification-center-empty.html
 * URL: /notification-empty-demo
 */

import { ArrowRight, Bell, BellRing, Settings, X } from "lucide-react";

const CHIPS = [
  { label: "Alle", count: 0, active: true },
  { label: "Uleste", count: 0 },
  { label: "Achievements" },
  { label: "Plan" },
  { label: "Meldinger" },
];

export default function NotificationEmptyDemo() {
  return (
    <div className="min-h-screen bg-foreground/80 flex justify-end px-4 py-8">
      <aside className="flex w-full max-w-[460px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        {/* Header */}
        <header className="border-b border-border px-6 pt-6 pb-5">
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
            0 uleste · alt fanget opp
          </div>
          <div className="mt-1.5 flex items-start justify-between gap-4">
            <h1 className="font-display text-[28px] font-semibold leading-tight tracking-tight">
              <em className="italic">Notifikasjoner</em>
            </h1>
            <button
              className="grid h-9 w-9 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              aria-label="Lukk"
            >
              <X size={18} strokeWidth={1.5} />
            </button>
          </div>
        </header>

        {/* Filter chips */}
        <div className="flex items-center gap-2 overflow-x-auto border-b border-border px-6 py-3">
          {CHIPS.map((c) => (
            <button
              key={c.label}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors ${
                c.active
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-card text-foreground hover:bg-secondary"
              }`}
            >
              {c.label}
              {c.count !== undefined && (
                <span
                  className={`rounded-full px-1.5 py-px font-mono text-[10px] font-semibold tabular-nums ${
                    c.active
                      ? "bg-background/20 text-background"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {c.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Empty state */}
        <div className="flex flex-1 flex-col items-center justify-center bg-secondary/30 px-10 py-12 text-center">
          {/* Tom-state illustrasjon */}
          <div className="mb-5 grid h-26 w-26 place-items-center rounded-[28px] bg-gradient-to-br from-accent/30 to-card text-primary shadow-[inset_0_0_0_1px_rgba(0,88,64,0.10)]" style={{ width: 104, height: 104 }}>
            <Bell size={44} strokeWidth={1.5} />
          </div>

          <div className="font-display text-2xl italic leading-tight">
            Ingen nye varsler
          </div>
          <p className="mt-2.5 max-w-[300px] text-sm leading-relaxed text-muted-foreground">
            Nye notifikasjoner dukker opp her. Du får pling i appen og på Apple
            Watch.
          </p>

          {/* Tips-kort */}
          <div className="mt-8 flex max-w-[340px] items-start gap-3 rounded-xl border border-border bg-card px-4 py-3.5 text-left">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-accent/30 text-primary">
              <BellRing size={18} strokeWidth={1.5} />
            </span>
            <div>
              <div className="text-[13px] font-semibold">
                Tips: skru på Live-pling
              </div>
              <div className="mt-1 text-xs leading-snug text-muted-foreground">
                Få varsel når Anders er aktiv i appen og kan svare med en gang.
              </div>
              <button className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-border bg-transparent px-2.5 py-1 text-[11px] font-semibold text-foreground transition-colors hover:bg-secondary">
                Åpne varselsinnstillinger
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-between border-t border-border bg-secondary/40 px-6 py-3.5">
          <button className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
            <Settings size={14} strokeWidth={1.5} />
            Innstillinger
          </button>
          <button className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
            Vis arkiv
            <ArrowRight size={14} strokeWidth={1.5} />
          </button>
        </footer>
      </aside>
    </div>
  );
}
