/**
 * DEMO — Notification center · plan
 * Bygd fra wireframe live-states/e5-notification-center-plan.html
 * URL: /notification-plan-demo
 */

import { ArrowRight, CheckCheck, CheckSquare, ListChecks, Settings, X } from "lucide-react";

type PlanChange = { day: string; tag: string; tagColor: string; from: string; to: string };

const PLAN_CHANGES: PlanChange[] = [
  {
    day: "Onsdag 14. mai",
    tag: "+30 min",
    tagColor: "bg-accent/30 text-foreground",
    from: "Driver (50 min)",
    to: "Approach 80 min",
  },
  {
    day: "Torsdag 15. mai",
    tag: "Byttet",
    tagColor: "bg-[#F4C430]/30 text-[#7A5C00]",
    from: "7-iron drills",
    to: "Putt 6 m konsistens",
  },
];

const CHIPS = [
  { label: "Alle" },
  { label: "Uleste" },
  { label: "Achievements" },
  { label: "Plan", count: 2, active: true },
  { label: "Meldinger" },
];

export default function NotificationPlanDemo() {
  return (
    <div className="min-h-screen bg-foreground/80 flex justify-end px-4 py-8">
      <aside className="flex w-full max-w-[460px] flex-col rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
        {/* Header */}
        <header className="border-b border-border px-6 pt-6 pb-5">
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
            <strong className="text-foreground">2 plan-endringer</strong> · uke 19-22
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
                    c.active ? "bg-background/20 text-background" : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {c.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {/* Plan-justering klar */}
          <div className="grid grid-cols-[40px_1fr_auto] items-start gap-3 px-6 py-3.5 border-b border-border bg-accent/5">
            <span className="grid h-10 w-10 place-items-center rounded-md bg-primary">
              <ListChecks size={18} strokeWidth={1.5} className="text-primary-foreground" />
            </span>
            <div>
              <div className="text-sm font-medium leading-snug">
                Plan-justering klar for godkjenning
              </div>
              <div className="mt-1 text-xs leading-snug text-muted-foreground">
                AI foreslår 3 endringer basert på siste rundes SG-tap på approach.
              </div>

              {/* Plan card */}
              <div className="mt-2.5 flex flex-col gap-1.5 rounded-md border border-border bg-card p-3 text-xs">
                {PLAN_CHANGES.map((c, i) => (
                  <div key={i} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                      <span>{c.day}</span>
                      <span
                        className={`rounded-sm px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.04em] ${c.tagColor}`}
                      >
                        {c.tag}
                      </span>
                    </div>
                    <div className="text-[13px] text-foreground">
                      <span className="line-through text-muted-foreground">{c.from}</span> →{" "}
                      {c.to}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-2.5 flex items-center gap-2">
                <button className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90">
                  Se hele forslaget
                </button>
                <button className="rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary">
                  Avvis
                </button>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">
                2 t
              </span>
              <span className="inline-block h-2 w-2 rounded-full bg-primary" />
            </div>
          </div>

          {/* Plan-endring akseptert */}
          <div className="grid grid-cols-[40px_1fr_auto] items-start gap-3 px-6 py-3.5 border-b border-border">
            <span className="grid h-10 w-10 place-items-center rounded-md bg-[#16A34A]">
              <CheckCheck size={18} strokeWidth={1.5} className="text-white" />
            </span>
            <div>
              <div className="text-sm font-medium leading-snug">
                Plan-endring akseptert · uke 18
              </div>
              <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                7 økter oppdatert · kalender synk ok
              </div>
            </div>
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">
              4 dgr
            </span>
          </div>

          {/* Sesongplan publisert */}
          <div className="grid grid-cols-[40px_1fr_auto] items-start gap-3 px-6 py-3.5 border-b border-border">
            <span className="grid h-10 w-10 place-items-center rounded-md bg-primary">
              <CheckSquare size={18} strokeWidth={1.5} className="text-primary-foreground" />
            </span>
            <div>
              <div className="text-sm font-medium leading-snug">Sesongplan publisert</div>
              <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                2026-plan · 5 perioder · synk til kalender
              </div>
            </div>
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">
              5 dgr
            </span>
          </div>
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-between border-t border-border bg-secondary/40 px-6 py-3.5">
          <button className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
            <Settings size={14} strokeWidth={1.5} />
            Innstillinger
          </button>
          <button className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
            Åpne plan
            <ArrowRight size={14} strokeWidth={1.5} />
          </button>
        </footer>
      </aside>
    </div>
  );
}
