/**
 * /admin/spillere/[id]/plan/[planId] — Spiller-plan detalj (coach-context)
 *
 * Variant A "Klassisk tab-layout, Drills aktiv" fra Claude Design-bundle
 * Sg2FEKvykU45c4naIgQx6w (s3-plan-detalj.jsx).
 *
 * 5 tabs: Oversikt · Periodisering · Drills (default) · Hit-rate · Effekt.
 * Drills-tab er default som spesifisert i prompt-fila.
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { Edit, Copy, ChevronRight, Plus, Sparkles, GripVertical } from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { AthleticEyebrow, AthleticButton } from "@/components/athletic";
import { TabBar } from "@/components/athletic/tab-bar";

export const dynamic = "force-dynamic";

const TABS = ["oversikt", "periodisering", "drills", "hit-rate", "effekt"] as const;
type Tab = (typeof TABS)[number];

const DRILLS = [
  { name: "Gate-putt med start-linje", category: "PUTT", mins: "10 min", reps: "6 av 8 inn", rate: "78%", tm: true, color: "bg-amber-100 text-amber-800" },
  { name: "Lag-på-lag stige 1m → 3m", category: "PUTT", mins: "12 min", reps: "8 av 10", rate: "82%", tm: true, color: "bg-amber-100 text-amber-800" },
  { name: "Pitch 30–50m kontroll", category: "SLAG", mins: "15 min", reps: "CP < 4m", rate: "64%", tm: true, color: "bg-emerald-100 text-emerald-800" },
  { name: "Bunker · plugged lie", category: "SLAG", mins: "12 min", reps: "5 av 7 på green", rate: "71%", tm: false, color: "bg-emerald-100 text-emerald-800" },
  { name: "Drift med målgate", category: "TEK", mins: "20 min", reps: "CL ± 8m", rate: "69%", tm: true, color: "bg-sky-100 text-sky-800" },
  { name: "Y-balanse · 3 retninger", category: "FYS", mins: "8 min", reps: "3 × 8 hver", rate: "—", tm: false, color: "bg-purple-100 text-purple-800" },
  { name: "Stagespill 10 hull · scramble", category: "SPILL", mins: "90 min", reps: "~70 strokes", rate: "—", tm: false, color: "bg-orange-100 text-orange-800" },
];

const EFFEKT_ROWS: [string, string, string][] = [
  ["SG · PUTT (siste 30 dg)", "−2,4", "−1,6"],
  ["Putt < 2,5m · hit-rate", "64%", "78%"],
  ["Start-linje · SD", "2,1°", "1,4°"],
  ["Pitch 30–50m · CP", "5,8m", "4,2m"],
  ["Bunker · green-hit", "57%", "71%"],
];

export default async function SpillerPlanDetaljPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; planId: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const { id, planId } = await params;
  const sp = await searchParams;
  const tab: Tab = TABS.includes(sp.tab as Tab) ? (sp.tab as Tab) : "drills";

  const [spiller, plan] = await Promise.all([
    prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, hcp: true },
    }),
    prisma.technicalPlan.findUnique({
      where: { id: planId },
      select: { id: true, navn: true, status: true, startDato: true, sluttDato: true, userId: true },
    }),
  ]);

  if (!spiller || !plan || plan.userId !== id) {
    notFound();
  }

  const drillsTotal = DRILLS.length;
  const totalMin = DRILLS.reduce((sum, d) => sum + parseInt(d.mins, 10), 0);

  return (
    <div className="space-y-6">
      {/* Hero */}
      <header className="-mx-4 -mt-4 border-b border-border bg-gradient-to-b from-[#FBFAF5] to-background px-4 py-8 md:-mx-8 md:-mt-8 md:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <AthleticEyebrow>
              Coach · {spiller.name} · Utviklingsplan
            </AthleticEyebrow>
            <h1 className="font-display mt-2 text-3xl font-bold leading-tight tracking-tight md:text-4xl">
              {plan.navn.split(" ").slice(0, -1).join(" ")}{" "}
              <em
                className="font-normal not-italic"
                style={{
                  fontFamily: "'Inter Tight', sans-serif",
                  fontStyle: "italic",
                  color: "hsl(var(--primary))",
                }}
              >
                {plan.navn.split(" ").slice(-1)[0]}
              </em>
            </h1>
            <div className="font-mono mt-2 text-[11px] uppercase tracking-[0.04em] text-muted-foreground">
              <Link href={`/admin/spillere/${id}`} className="hover:text-foreground">
                ← TILBAKE TIL {spiller.name.toUpperCase()}
              </Link>
              {" · "}12 UKER · {plan.startDato.toLocaleDateString("nb-NO", { day: "2-digit", month: "short" }).toUpperCase()}
              {plan.sluttDato
                ? ` — ${plan.sluttDato.toLocaleDateString("nb-NO", { day: "2-digit", month: "short" }).toUpperCase()}`
                : ""}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <AthleticButton variant="ghost-light" size="sm">
              <Edit className="h-3.5 w-3.5" /> Rediger
            </AthleticButton>
            <AthleticButton variant="ghost-light" size="sm">
              <Copy className="h-3.5 w-3.5" /> Dupliser
            </AthleticButton>
            <AthleticButton variant="lime" size="sm">Publiser endring</AthleticButton>
          </div>
        </div>

        {/* KPI-strip */}
        <div className="mt-6 grid grid-cols-2 gap-6 border-t border-border pt-6 md:grid-cols-4">
          <KpiBox label="STATUS" value={
            <span className="font-mono inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-emerald-800">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" /> {plan.status}
            </span>
          } />
          <KpiBox label="PERIODE" value="U07 / 12" />
          <KpiBox label="CS · ØKTER" value="34 / 56" />
          <KpiBox
            label="EFFEKT · SG-PUTT"
            value={<span className="font-mono text-emerald-700">+0,8</span>}
          />
        </div>
      </header>

      {/* Tab-bar */}
      <TabBar
        tabs={[
          { id: "oversikt", label: "Oversikt" },
          { id: "periodisering", label: "Periodisering" },
          { id: "drills", label: "Drills", count: drillsTotal },
          { id: "hit-rate", label: "Hit-rate" },
          { id: "effekt", label: "Effekt" },
        ]}
        defaultTab="drills"
      />

      {/* Tab-innhold */}
      {tab === "oversikt" ? (
        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="font-mono mb-2 text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              MÅL · BESKRIVELSE
            </div>
            <p
              className="text-base leading-relaxed"
              style={{ fontFamily: "'Inter Tight', sans-serif", fontStyle: "italic" }}
            >
              Bygge fundament i putt og short game før sesongstart. Spesielt fokus på &lt; 2,5m
              og pitch 30–50m. Mål: SG-putt fra −2,4 → −1,0 ved sesongstart 28. mars.
            </p>
          </div>
          <div className="rounded-2xl border border-accent/40 bg-accent/[0.08] p-6">
            <div className="font-mono mb-2 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.10em] text-primary">
              <Sparkles className="h-3 w-3" /> AI-GENERERINGS-KONTEKST
            </div>
            <p className="text-sm leading-relaxed">
              Generert 14. nov fra: TrackMan-data 90 dg, SG-runder Q3, {spiller.name}s egne
              notater i Notion, sesongmål «sub-par på Olyo Tour».
            </p>
          </div>
        </div>
      ) : null}

      {tab === "periodisering" ? (
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="font-mono mb-4 text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
            PERIODISERING · 12 UKER
          </div>
          <div className="font-mono mb-2 grid grid-cols-12 gap-1 text-center text-[9.5px] uppercase tracking-[0.04em] text-muted-foreground">
            {["U1", "U2", "U3", "U4", "U5", "U6", "U7", "U8", "U9", "U10", "U11", "U12"].map((u) => (
              <div key={u}>{u}</div>
            ))}
          </div>
          <div className="relative h-12 rounded-lg bg-muted/40">
            <span
              className="font-mono absolute top-0 flex h-full items-center px-4 text-[10px] font-bold uppercase tracking-[0.08em] text-primary"
              style={{ left: "0%", width: "33%", background: "rgba(0,88,64,0.18)", borderRadius: 8 }}
            >
              FUNDAMENT · TEKNIKK
            </span>
            <span
              className="font-mono absolute top-0 flex h-full items-center px-4 text-[10px] font-bold uppercase tracking-[0.08em] text-foreground"
              style={{ left: "33%", width: "34%", background: "rgba(209,248,67,0.45)" }}
            >
              SHORT GAME · PUTT
            </span>
            <span
              className="font-mono absolute top-0 flex h-full items-center px-4 text-[10px] font-bold uppercase tracking-[0.08em] text-foreground"
              style={{ left: "67%", width: "33%", background: "rgba(44,125,82,0.20)", borderRadius: 8 }}
            >
              SPILL · COMPETITION
            </span>
            <span
              className="absolute top-[-8px] bottom-[-8px] w-0.5 bg-foreground"
              style={{ left: "58%" }}
            >
              <span className="font-mono absolute top-[-22px] -translate-x-1/2 whitespace-nowrap rounded bg-foreground px-1.5 py-0.5 text-[9px] font-bold text-card">
                NÅ · U7
              </span>
            </span>
          </div>
        </div>
      ) : null}

      {tab === "drills" ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <FilterChip label="Alle" count={drillsTotal} active />
            <FilterChip label="PUTT" count={2} />
            <FilterChip label="SLAG" count={2} />
            <FilterChip label="TEK" count={1} />
            <FilterChip label="FYS" count={1} />
            <FilterChip label="SPILL" count={1} />
            <div className="ml-auto flex gap-2">
              <Link href="/portal/ai/foresla-drill">
                <AthleticButton variant="ghost-light" size="sm">
                  <Sparkles className="h-3.5 w-3.5" /> AI-foreslå
                </AthleticButton>
              </Link>
              <AthleticButton variant="lime" size="sm">
                <Plus className="h-3.5 w-3.5" /> Legg til drill
              </AthleticButton>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <header className="mb-4 flex items-baseline justify-between">
              <div>
                <h2 className="font-display text-base font-semibold">
                  {drillsTotal} drills · ~{totalMin} min / uke
                </h2>
                <div className="font-mono mt-1 text-[10.5px] uppercase tracking-[0.04em] text-muted-foreground">
                  Dra for å endre rekkefølge · klikk → for detalj
                </div>
              </div>
            </header>
            <ul className="divide-y divide-border">
              {DRILLS.map((d, i) => (
                <li
                  key={d.name}
                  className="grid grid-cols-[20px_32px_1fr_auto_auto_auto] items-center gap-2 py-2"
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <div className="font-mono text-sm font-bold text-muted-foreground">{i + 1}</div>
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <span
                        className={`font-mono rounded-full px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.08em] ${d.color}`}
                      >
                        {d.category}
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                        {d.mins}
                      </span>
                      {d.tm ? (
                        <span className="font-mono rounded-sm bg-orange-100 px-1.5 py-0.5 text-[9px] font-bold tracking-[0.08em] text-orange-700">
                          TM
                        </span>
                      ) : null}
                    </div>
                    <div className="font-display text-sm font-semibold">{d.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-[9px] uppercase tracking-[0.10em] text-muted-foreground">
                      REP-MÅL
                    </div>
                    <div className="font-mono text-xs font-semibold">{d.reps}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-[9px] uppercase tracking-[0.10em] text-muted-foreground">
                      HIT-RATE
                    </div>
                    <div
                      className={`font-mono text-sm font-bold ${d.rate === "—" ? "text-muted-foreground" : "text-emerald-700"}`}
                    >
                      {d.rate}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}

      {tab === "hit-rate" ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {DRILLS.filter((d) => d.tm).map((d) => (
            <div key={d.name} className="rounded-2xl border border-border bg-card p-6">
              <span
                className={`font-mono rounded-full px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.08em] ${d.color}`}
              >
                {d.category}
              </span>
              <div className="font-display mt-2 text-sm font-semibold">{d.name}</div>
              <div className="mt-2 flex items-baseline gap-2">
                <div className="font-mono text-3xl font-bold tabular-nums text-emerald-700">
                  {d.rate}
                </div>
                <div className="font-mono text-[10.5px] uppercase tracking-[0.04em] text-muted-foreground">
                  hit-rate · siste 14 dg
                </div>
              </div>
              <div className="mt-4 flex gap-0.5">
                {[78, 82, 75, 84, 80, 86, 82].map((v, j) => (
                  <div
                    key={j}
                    className="h-8 flex-1 rounded-sm bg-accent"
                    style={{ opacity: v / 100 }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {tab === "effekt" ? (
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="font-mono mb-2 text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
            FØR / ETTER · UTVALGTE METRIKKER
          </div>
          <ul className="divide-y divide-border">
            {EFFEKT_ROWS.map(([k, before, after]) => (
              <li
                key={k}
                className="grid grid-cols-[2fr_1fr_1fr_1fr] items-center gap-2 py-2"
              >
                <div className="font-display text-sm font-semibold">{k}</div>
                <div className="font-mono text-right text-sm text-muted-foreground tabular-nums">
                  {before}
                </div>
                <div className="font-mono text-right text-sm font-bold tabular-nums text-emerald-700">
                  → {after}
                </div>
                <div className="font-mono text-right text-[10px] uppercase tracking-[0.08em] text-emerald-700">
                  ▲
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function KpiBox({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </div>
      <div className="font-display mt-1.5 text-base font-bold">{value}</div>
    </div>
  );
}

function FilterChip({
  label,
  count,
  active,
}: {
  label: string;
  count: number;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      className={`font-mono inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] transition ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground"
      }`}
    >
      {label}
      <span
        className={`rounded-full px-1.5 py-px tabular-nums ${active ? "bg-white/20" : "bg-muted"}`}
      >
        {count}
      </span>
    </button>
  );
}
