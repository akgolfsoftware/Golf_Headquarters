/**
 * PILOT — Periodiserings-Agent
 * Bygd fra wireframe/design-files-v2/screens/07-periodiserings-agent.html
 * URL: /periodiserings-agent-demo
 */

import { Check, ArrowRight, FileText, Bell, LayoutGrid } from "lucide-react";

type PyrRow = {
  label: string;
  pct: number;
  color: string;
};

type Suggestion = {
  text: string;
  impact: "high" | "med" | "low";
};

const pyrRows: PyrRow[] = [
  { label: "FYS", pct: 60, color: "var(--color-pyr-fys)" },
  { label: "TEK", pct: 78, color: "var(--color-pyr-tek)" },
  { label: "SLAG", pct: 38, color: "var(--color-pyr-slag)" },
  { label: "SPILL", pct: 45, color: "var(--color-pyr-spill)" },
  { label: "TURN", pct: 20, color: "var(--color-pyr-turn)" },
];

const suggestions: Suggestion[] = [
  { text: "Øk SLAG-volum fra 20 % → 30 % neste 2 uker", impact: "high" },
  { text: "Reduser TEK-press fra PR4 → PR3", impact: "med" },
  { text: "Legg til 1× putte-fokus-økt i uke 20", impact: "med" },
  { text: "Test-batch: NGF-100m i uke 21", impact: "low" },
  { text: "Anbefal mental-økt før Sørlandsåpent (2 uker før)", impact: "low" },
];

function impactStyles(impact: Suggestion["impact"]): string {
  if (impact === "high") return "bg-accent/20 text-primary";
  if (impact === "med") return "bg-[#FFF0D6] text-[#B8852A]";
  return "bg-secondary text-muted-foreground";
}

function impactLabel(impact: Suggestion["impact"]): string {
  if (impact === "high") return "Høy impact";
  if (impact === "med") return "Medium";
  return "Lav";
}

export default function PeriodiseringsAgentDemo() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top */}
      <header className="flex flex-wrap items-end justify-between gap-6 border-b border-border px-9 py-6">
        <div>
          <div className="text-[13px] text-muted-foreground">
            Verktøy <span className="opacity-50">›</span> Agenter <span className="opacity-50">›</span> Periodiserings-agent{" "}
            <span className="opacity-50">›</span>{" "}
            <b className="font-semibold text-foreground">Markus R</b>
          </div>
          <h1 className="mt-1 font-display text-[28px] font-bold leading-[1.1] -tracking-[0.02em]">
            <em className="font-medium italic">Periodiserings</em>-agent
          </h1>
          <div className="mt-2 inline-flex flex-wrap items-center gap-3 text-[14px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-2.5 py-1 text-[12px] font-medium text-foreground">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--color-pyr-tek)" }} />
              TEK · Sommer-toppform
            </span>
            <span>Markus Roinås Pedersen · uke 19</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="h-11 rounded-md border border-border bg-card px-4 text-[14px] font-medium text-foreground transition-colors hover:bg-secondary">
            Avvis
          </button>
          <button
            className="inline-flex h-14 items-center gap-2.5 rounded-md bg-accent px-5 text-[15px] font-semibold text-accent-foreground"
            style={{ boxShadow: "0 0 0 1px rgba(209,248,67,0.4), 0 8px 22px rgba(209,248,67,0.20)" }}
          >
            Godkjenn alle 5
            <ArrowRight size={18} strokeWidth={1.5} />
          </button>
        </div>
      </header>

      {/* Stack */}
      <div className="flex flex-col gap-4 px-9 py-6">
        {/* LAG 1 — Data inn */}
        <section className="grid grid-cols-[168px_1fr] gap-7 rounded-lg border border-border bg-card p-6 shadow-sm">
          <div className="border-r border-border pr-5">
            <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-primary">
              1 · DATA INN
            </div>
            <div className="mt-2.5 font-display text-[18px] font-bold leading-tight -tracking-[0.01em]">
              Hva agenten leser
            </div>
            <div className="mt-2 text-[12px] text-muted-foreground">
              Siste 30 dager fra Markus&apos; aktive datakilder.
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3.5">
            <div className="rounded-md border border-border bg-secondary px-4 py-3.5">
              <div className="font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">HCP</div>
              <div className="mt-2 font-mono text-[24px] tabular-nums">
                12,4 <span className="text-[14px] text-muted-foreground">→ 11,8</span>
              </div>
            </div>
            <div className="rounded-md border border-border bg-secondary px-4 py-3.5">
              <div className="font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">Volum / uke</div>
              <div className="mt-2 font-mono text-[24px] tabular-nums">
                4,2 <span className="text-[14px] text-muted-foreground">økter</span>
              </div>
            </div>
            <div className="rounded-md border border-border bg-secondary px-4 py-3.5">
              <div className="font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">SG-trend</div>
              <div className="mt-2 font-mono text-[24px] tabular-nums text-primary">+0,4</div>
            </div>
            <div className="rounded-md border border-border bg-secondary px-4 py-3.5">
              <div className="font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">Søvn-snitt</div>
              <div className="mt-2 font-mono text-[24px] tabular-nums">
                7,2 <span className="text-[14px] text-muted-foreground">t</span>
              </div>
            </div>
          </div>
        </section>

        {/* LAG 2 — Analyse */}
        <section className="grid grid-cols-[168px_1fr] gap-7 rounded-lg border border-border bg-card p-6 shadow-sm">
          <div className="border-r border-border pr-5">
            <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-primary">
              2 · ANALYSE
            </div>
            <div className="mt-2.5 font-display text-[18px] font-bold leading-tight -tracking-[0.01em]">
              Hva agenten tenker
            </div>
            <div className="mt-2 text-[12px] text-muted-foreground">
              Pyramide-balanse over de fem treningslagene.
            </div>
          </div>
          <div className="grid grid-cols-[200px_1fr] items-start gap-7">
            <div className="flex flex-col gap-2">
              {pyrRows.map((r) => (
                <div key={r.label} className="grid grid-cols-[56px_1fr_36px] items-center gap-2.5">
                  <span className="font-mono text-[11px] font-semibold tracking-[0.04em]">{r.label}</span>
                  <div className="h-2.5 overflow-hidden rounded-full bg-secondary">
                    <div className="h-full rounded-full" style={{ width: `${r.pct}%`, background: r.color }} />
                  </div>
                  <span className="text-right font-mono text-[11px] text-muted-foreground">{r.pct} %</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-[20px_1fr] gap-3 text-[14px] leading-[1.5]">
                <span className="mt-2 h-2 w-2 rounded-full bg-accent" />
                <span>Sterk fremgang på TEK (+15 % volum). Kan øke press.</span>
              </div>
              <div className="grid grid-cols-[20px_1fr] gap-3 text-[14px] leading-[1.5]">
                <span className="mt-2 h-2 w-2 rounded-full bg-[#B8852A]" />
                <span>SLAG er underrepresentert siste 14 d. Bør prioriteres neste syklus.</span>
              </div>
              <div className="grid grid-cols-[20px_1fr] gap-3 text-[14px] leading-[1.5]">
                <span className="mt-2 h-2 w-2 rounded-full bg-primary" />
                <span>Søvn-data viser god restitusjon — kan tåle høyere intensitet uten risiko.</span>
              </div>
            </div>
          </div>
        </section>

        {/* LAG 3 — Forslag */}
        <section className="grid grid-cols-[168px_1fr] gap-7 rounded-lg border border-border bg-card p-6 shadow-sm">
          <div className="border-r border-border pr-5">
            <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-primary">
              3 · FORSLAG
            </div>
            <div className="mt-2.5 font-display text-[18px] font-bold leading-tight -tracking-[0.01em]">
              Hva agenten anbefaler
            </div>
            <div className="mt-2 text-[12px] text-muted-foreground">5 endringer, alle valgt som standard.</div>
          </div>
          <div className="flex flex-col gap-2">
            {suggestions.map((s) => (
              <div
                key={s.text}
                className="grid grid-cols-[24px_1fr_auto] items-center gap-3.5 rounded-md border border-border bg-secondary/40 px-4 py-3"
              >
                <span className="grid h-5 w-5 place-items-center rounded-sm bg-primary text-accent">
                  <Check size={14} strokeWidth={2.5} />
                </span>
                <span className="text-[14px] font-medium leading-[1.4]">{s.text}</span>
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.04em] ${impactStyles(
                    s.impact,
                  )}`}
                >
                  {impactLabel(s.impact)}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* LAG 4 — Output */}
        <section className="grid grid-cols-[168px_1fr] gap-7 rounded-lg border border-border bg-card p-6 shadow-sm">
          <div className="border-r border-border pr-5">
            <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-primary">
              4 · OUTPUT
            </div>
            <div className="mt-2.5 font-display text-[18px] font-bold leading-tight -tracking-[0.01em]">
              Hva som skjer ved godkjenning
            </div>
            <div className="mt-2 text-[12px] text-muted-foreground">Tre nedstrøms-handlinger utløses automatisk.</div>
          </div>
          <div className="grid grid-cols-3 gap-3.5">
            <div className="grid grid-cols-[28px_1fr] items-start gap-3 rounded-md border border-border bg-secondary px-4 py-3.5">
              <span className="grid h-7 w-7 place-items-center rounded-sm border border-border bg-card text-primary">
                <FileText size={16} strokeWidth={1.5} />
              </span>
              <div>
                <div className="text-[13px] font-semibold leading-tight">Plan-fil oppdatert</div>
                <div className="mt-1 text-[12px] text-muted-foreground">
                  <code className="rounded-sm border border-border bg-card px-1.5 py-0.5 font-mono text-[11px]">
                    plans/markus-r-19.json
                  </code>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-[28px_1fr] items-start gap-3 rounded-md border border-border bg-secondary px-4 py-3.5">
              <span className="grid h-7 w-7 place-items-center rounded-sm border border-border bg-card text-primary">
                <Bell size={16} strokeWidth={1.5} />
              </span>
              <div>
                <div className="text-[13px] font-semibold leading-tight">Spiller varslet</div>
                <div className="mt-1 text-[12px] text-muted-foreground">Push + e-post til Markus</div>
              </div>
            </div>
            <div className="grid grid-cols-[28px_1fr] items-start gap-3 rounded-md border border-border bg-secondary px-4 py-3.5">
              <span className="grid h-7 w-7 place-items-center rounded-sm border border-border bg-card text-primary">
                <LayoutGrid size={16} strokeWidth={1.5} />
              </span>
              <div>
                <div className="text-[13px] font-semibold leading-tight">Coaching-board oppdatert</div>
                <div className="mt-1 text-[12px] text-muted-foreground">3 nye anbefalinger til Anders</div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <footer className="border-t border-border px-9 py-4 font-mono text-[12px] tabular-nums text-muted-foreground">
        Foreslått av plan-watcher 06:00 · ML-confidence 0,87 · Brukt 4 mnd historikk
      </footer>
    </div>
  );
}
