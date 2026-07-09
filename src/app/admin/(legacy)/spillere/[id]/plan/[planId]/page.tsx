/**
 * /admin/spillere/[id]/plan/[planId] — Spiller-plan detalj (coach-context)
 *
 * Variant A "Klassisk tab-layout, Drills aktiv" fra Claude Design-bundle
 * Sg2FEKvykU45c4naIgQx6w (s3-plan-detalj.jsx).
 *
 * 5 tabs: Oversikt · Periodisering · Drills (default) · Hit-rate · Effekt.
 * Drills-tab er default som spesifisert i prompt-fila.
 *
 * Datakobling: Drills-, Hit-rate- og Effekt-fanene leser planens EKTE
 * positions[].tasks (samme include-mønster som /portal/tren/teknisk-plan).
 * Ingen demo-drills — tom plan gir ærlig tom-tilstand.
 */

import { Eyebrow } from "@/components/athletic/golfdata";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Sparkles } from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PlanTabs } from "./plan-tabs";
import { SG_BUCKETS, type PyramidArea } from "@/components/teknisk-plan/constants";
import type { OppgaveDraft } from "@/components/teknisk-plan/oppgave-modal";
import { PlanToolbar } from "./plan-toolbar";
import { DrillsPanel, type DrillRow } from "./drills-panel";

export const dynamic = "force-dynamic";

const TABS = ["oversikt", "periodisering", "drills", "hit-rate", "effekt"] as const;
type Tab = (typeof TABS)[number];

/** Tailwind-tone per pyramide-akse — speiler drills-panel sin palett. */
const CATEGORY_COLOR: Record<PyramidArea, string> = {
  FYS: "bg-purple-100 text-purple-800",
  TEK: "bg-sky-100 text-sky-800",
  SLAG: "bg-emerald-100 text-emerald-800",
  SPILL: "bg-orange-100 text-orange-800",
  TURN: "bg-amber-100 text-amber-800",
};

/** Reverse: hvilken SG-fane (omraadeTab) hører et lagret omraade til? */
function omraadeToTab(omraade: string): keyof typeof SG_BUCKETS {
  for (const tab of Object.keys(SG_BUCKETS) as (keyof typeof SG_BUCKETS)[]) {
    if ((SG_BUCKETS[tab] as readonly string[]).includes(omraade)) return tab;
  }
  return "Tee";
}

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
      select: {
        id: true,
        navn: true,
        status: true,
        startDato: true,
        sluttDato: true,
        userId: true,
        positions: {
          orderBy: { sortOrder: "asc" },
          select: {
            id: true,
            pNummer: true,
            navn: true,
            sortOrder: true,
            hovedfokus: true,
            tasks: {
              orderBy: { sortOrder: "asc" },
              include: { tmGoals: true },
            },
          },
        },
      },
    }),
  ]);

  if (!spiller || !plan || plan.userId !== id) {
    notFound();
  }

  // Default mål-posisjon for global "Legg til drill": hovedfokus/første P,
  // ellers P7.0 (Impact) som rimelig fallback.
  const sortedPositions = [...plan.positions].sort((a, b) => {
    if (a.hovedfokus && !b.hovedfokus) return -1;
    if (!a.hovedfokus && b.hovedfokus) return 1;
    return a.sortOrder - b.sortOrder;
  });
  const defaultTarget = sortedPositions[0]
    ? { pNummer: sortedPositions[0].pNummer, pName: sortedPositions[0].navn }
    : { pNummer: "P7.0", pName: "Impact" };

  // Map planens EKTE tasks → DrillRow[] (med ferdig OppgaveDraft for edit-modal).
  const drills: DrillRow[] = plan.positions.flatMap((pos) =>
    pos.tasks.map((t): DrillRow => {
      const repsTarget = t.repsMaalDry + t.repsMaalLav + t.repsMaalFull;
      const repsDone = t.repsGjortDry + t.repsGjortLav + t.repsGjortFull;

      // Hit-rate-mål: PositionTaskTmGoal med targetType HIT_RATE.
      const hitRateGoals = t.tmGoals.filter((g) => g.targetType === "HIT_RATE");
      const spreadGoals = t.tmGoals.filter((g) => g.targetType !== "HIT_RATE");

      // Vis faktisk hit-rate hvis vi har et målt vindu, ellers «—».
      const primaryHit = hitRateGoals.find(
        (g) => typeof g.currentHits === "number" && typeof g.currentBatchSize === "number",
      );
      const rate =
        primaryHit && primaryHit.currentBatchSize
          ? `${Math.round(((primaryHit.currentHits ?? 0) / primaryHit.currentBatchSize) * 100)}%`
          : "—";

      const omraadeTab = omraadeToTab(t.omraade);

      const draft: OppgaveDraft = {
        id: t.id,
        pNummer: pos.pNummer,
        pName: pos.navn,
        tittel: t.tittel,
        beskrivelse: t.beskrivelse ?? "",
        pyramide: t.pyramide as PyramidArea,
        omraadeTab,
        omraade: t.omraade,
        koller: t.koller,
        lFase: t.lFase ?? undefined,
        cs: t.cs ?? undefined,
        m: t.miljo ?? undefined,
        pr: t.prPress ?? undefined,
        bildeUrl: t.bildeUrl ?? undefined,
        videoUrl: t.videoUrl ?? undefined,
        repsMaalDry: t.repsMaalDry,
        repsMaalLav: t.repsMaalLav,
        repsMaalFull: t.repsMaalFull,
        tmGoals: spreadGoals.map((g) => ({
          id: g.id,
          metric: g.metric,
          klubb: g.klubb,
          baselineValue: g.baselineValue,
          targetValue: g.targetValue,
          targetType: (g.targetType === "SECONDARY"
            ? "SECONDARY"
            : g.targetType === "CAUSAL"
              ? "CAUSAL"
              : "PRIMARY") as "PRIMARY" | "SECONDARY" | "CAUSAL",
          comparison: g.comparison as "LESS_THAN" | "GREATER_THAN" | "RANGE" | "EQUAL",
        })),
        hitRateGoals: hitRateGoals.map((g) => ({
          id: g.id,
          metric: g.metric,
          klubb: g.klubb,
          protocol: (g.protocol ?? "ROLLING_WINDOW") as OppgaveDraft["hitRateGoals"][number]["protocol"],
          corridorMin: g.corridorMin ?? "",
          corridorMax: g.corridorMax ?? "",
          requiredHits: g.requiredHits ?? "",
          windowSize: g.windowSize ?? "",
          currentHits: g.currentHits ?? undefined,
          currentBatchSize: g.currentBatchSize ?? undefined,
          bestHits: g.bestHits ?? undefined,
          currentStreak: g.currentStreak ?? undefined,
          inTarget: g.inTarget,
        })),
        drillIds: [],
      };

      return {
        taskId: t.id,
        name: t.tittel,
        category: t.pyramide as PyramidArea,
        omraade: t.omraade,
        minLabel: "",
        reps:
          repsTarget > 0 ? `${repsDone} / ${repsTarget}` : "Ingen mål",
        rate,
        tm: spreadGoals.length > 0 || hitRateGoals.length > 0,
        draft,
      };
    }),
  );

  const drillsTotal = drills.length;
  const hitRateDrills = drills.filter((d) => d.rate !== "—");

  return (
    <div className="space-y-6">
      {/* Hero */}
      <header className="-mx-4 -mt-4 border-b border-border bg-gradient-to-b from-[#FBFAF5] to-background px-4 py-8 md:-mx-8 md:-mt-8 md:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <Eyebrow as="span">
              Coach · {spiller.name} · Utviklingsplan
            </Eyebrow>
            <h1 className="font-display mt-2 text-3xl font-bold leading-tight tracking-tight md:text-4xl">
              {plan.navn.split(" ").slice(0, -1).join(" ")}{" "}
              <em
                className="font-normal not-italic"
                style={{
                  fontFamily: "var(--font-familjen-grotesk), sans-serif",
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
              {" · "}{plan.startDato.toLocaleDateString("nb-NO", { day: "2-digit", month: "short" }).toUpperCase()}
              {plan.sluttDato
                ? ` — ${plan.sluttDato.toLocaleDateString("nb-NO", { day: "2-digit", month: "short" }).toUpperCase()}`
                : ""}
            </div>
          </div>
          <PlanToolbar
            planId={plan.id}
            drillsHref={`/admin/spillere/${id}/plan/${planId}?tab=drills`}
            isPublished={plan.status === "ACTIVE"}
          />
        </div>

        {/* KPI-strip */}
        <div className="mt-6 grid grid-cols-2 gap-6 border-t border-border pt-6 md:grid-cols-4">
          <KpiBox label="STATUS" value={
            <span className="font-mono inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-emerald-800">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" /> {plan.status}
            </span>
          } />
          <KpiBox label="P-POSISJONER" value={`${plan.positions.length}`} />
          <KpiBox label="DRILLS" value={`${drillsTotal}`} />
          <KpiBox label="MED TM-MÅL" value={`${drills.filter((d) => d.tm).length}`} />
        </div>
      </header>

      {/* Tab-bar */}
      <PlanTabs
        tabs={[
          { id: "oversikt", label: "Oversikt" },
          { id: "periodisering", label: "Periodisering" },
          { id: "drills", label: `Drills (${drillsTotal})` },
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
              PLAN · SAMMENDRAG
            </div>
            <p
              className="text-base leading-relaxed"
              style={{ fontFamily: "var(--font-familjen-grotesk), sans-serif", fontStyle: "italic" }}
            >
              {plan.navn} for {spiller.name}. {drillsTotal} drills fordelt på{" "}
              {plan.positions.length} P-posisjoner.
            </p>
          </div>
          <div className="rounded-2xl border border-accent/40 bg-accent/[0.08] p-6">
            <div className="font-mono mb-2 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.10em] text-primary">
              <Sparkles className="h-3 w-3" /> NESTE STEG
            </div>
            <p className="text-sm leading-relaxed">
              {drillsTotal === 0
                ? "Planen har ingen drills ennå. Gå til Drills-fanen og legg til den første."
                : "Rediger drills i Drills-fanen, eller publiser planen for å gjøre den aktiv for spilleren."}
            </p>
          </div>
        </div>
      ) : null}

      {tab === "periodisering" ? (
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="font-mono mb-2 text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
            PERIODISERING
          </div>
          <p className="text-sm text-muted-foreground">
            Periodisering settes i Workbench. Denne fanen viser planens tidslinje når
            periode-blokker er koblet.
          </p>
        </div>
      ) : null}

      {tab === "drills" ? (
        <DrillsPanel planId={plan.id} defaultTarget={defaultTarget} drills={drills} />
      ) : null}

      {tab === "hit-rate" ? (
        hitRateDrills.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-10 text-center">
            <div className="font-display text-sm font-semibold">Ingen hit-rate-data ennå</div>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Hit-rate vises når drills med hit-rate-mål har målte slag-vinduer fra TrackMan.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {hitRateDrills.map((d) => (
              <div key={d.taskId} className="rounded-2xl border border-border bg-card p-6">
                <span
                  className={`font-mono rounded-full px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.08em] ${CATEGORY_COLOR[d.category]}`}
                >
                  {d.category}
                </span>
                <div className="font-display mt-2 text-sm font-semibold">{d.name}</div>
                <div className="mt-2 flex items-baseline gap-2">
                  <div className="font-mono text-3xl font-bold tabular-nums text-emerald-700">
                    {d.rate}
                  </div>
                  <div className="font-mono text-[10.5px] uppercase tracking-[0.04em] text-muted-foreground">
                    hit-rate · siste vindu
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : null}

      {tab === "effekt" ? (
        <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-10 text-center">
          <div className="font-display text-sm font-semibold">Effekt kommer</div>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Før/etter-effekt per metrikk krever koblet baseline- og oppfølgingsdata. Vi viser
            ekte tall her når datagrunnlaget er på plass — ingen påfunn.
          </p>
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
