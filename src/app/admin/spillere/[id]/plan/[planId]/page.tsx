/**
 * AgencyOS Spiller-plan-detalj — v2 (coach-context). Auth/Prisma-loader og
 * all datamapping (drills fra plan.positions[].tasks, hit-rate-beregning)
 * bevart 1:1 fra legacy. DrillsPanel (drag/rediger/slett) og PlanToolbar
 * (dupliser/publiser) er tailwind-only og gjenbrukes — kun Eyebrow/Button
 * er byttet til v2. Tab-navigering er nå server-side Link-piller
 * (plan-tabs.tsx droppet — ren URL-synk uten egen UI, overflødig).
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { T } from "@/lib/v2/tokens";
import { Caps, Tittel, Kort, KpiFlis, StatusPill, MikroMeta, TomTilstand } from "@/components/v2";
import { omraadeToTab, type PyramidArea } from "@/components/teknisk-plan/constants";
import type { OppgaveDraft } from "@/components/teknisk-plan/oppgave-modal";
import { PlanToolbar } from "./plan-toolbar";
import { DrillsPanel, type DrillRow } from "./drills-panel";

export const dynamic = "force-dynamic";

const TABS = ["oversikt", "periodisering", "drills", "hit-rate", "effekt"] as const;
type Tab = (typeof TABS)[number];

const KATEGORI_TONE: Record<PyramidArea, "info" | "up" | "lime" | "warn"> = {
  FYS: "info",
  TEK: "info",
  SLAG: "up",
  SPILL: "warn",
  TURN: "warn",
};

export default async function SpillerPlanDetaljPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; planId: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const coach = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const { id, planId } = await params;
  const sp = await searchParams;
  const tab: Tab = TABS.includes(sp.tab as Tab) ? (sp.tab as Tab) : "drills";

  const [spiller, plan] = await Promise.all([
    prisma.user.findUnique({ where: { id }, select: { id: true, name: true, hcp: true } }),
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
            tasks: { orderBy: { sortOrder: "asc" }, include: { tmGoals: true } },
          },
        },
      },
    }),
  ]);

  if (!spiller || !plan || plan.userId !== id) notFound();

  const sortedPositions = [...plan.positions].sort((a, b) => {
    if (a.hovedfokus && !b.hovedfokus) return -1;
    if (!a.hovedfokus && b.hovedfokus) return 1;
    return a.sortOrder - b.sortOrder;
  });
  const defaultTarget = sortedPositions[0]
    ? { pNummer: sortedPositions[0].pNummer, pName: sortedPositions[0].navn }
    : { pNummer: "P7.0", pName: "Impact" };

  const drills: DrillRow[] = plan.positions.flatMap((pos) =>
    pos.tasks.map((t): DrillRow => {
      const repsTarget = t.repsMaalDry + t.repsMaalLav + t.repsMaalFull;
      const repsDone = t.repsGjortDry + t.repsGjortLav + t.repsGjortFull;

      const hitRateGoals = t.tmGoals.filter((g) => g.targetType === "HIT_RATE");
      const spreadGoals = t.tmGoals.filter((g) => g.targetType !== "HIT_RATE");

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
        kategori: t.kategori ?? undefined,
        bildeUrl: t.bildeUrl ?? undefined,
        videoUrl: t.videoUrl ?? undefined,
        repsMaalDry: t.repsMaalDry,
        repsMaalLav: t.repsMaalLav,
        repsMaalFull: t.repsMaalFull,
        repsGjortDry: t.repsGjortDry,
        repsGjortLav: t.repsGjortLav,
        repsGjortFull: t.repsGjortFull,
        tmGoals: spreadGoals.map((g) => ({
          id: g.id,
          metric: g.metric,
          klubb: g.klubb,
          baselineValue: g.baselineValue,
          targetValue: g.targetValue,
          targetType: (g.targetType === "SECONDARY" ? "SECONDARY" : g.targetType === "CAUSAL" ? "CAUSAL" : "PRIMARY") as
            | "PRIMARY"
            | "SECONDARY"
            | "CAUSAL",
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
        reps: repsTarget > 0 ? `${repsDone} / ${repsTarget}` : "Ingen mål",
        rate,
        tm: spreadGoals.length > 0 || hitRateGoals.length > 0,
        draft,
      };
    }),
  );

  const drillsTotal = drills.length;
  const hitRateDrills = drills.filter((d) => d.rate !== "—");

  return (
    <V2Shell aktiv="spillere" nav={AGENCYOS_NAV} navn={coach.name} avatarUrl={coach.avatarUrl}>
      <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
        {/* Hode */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
          <div>
            <Caps>Coach · {spiller!.name} · Utviklingsplan</Caps>
            <div style={{ marginTop: 10 }}>
              <Tittel>{plan!.navn}</Tittel>
            </div>
            <div style={{ marginTop: 10 }}>
              <Link href={`/admin/spillere/${id}`} style={{ textDecoration: "none" }}>
                <MikroMeta icon="arrow-left">Tilbake til {spiller!.name}</MikroMeta>
              </Link>
              <span style={{ fontFamily: T.mono, fontSize: 10, color: T.mut, marginLeft: 10 }}>
                {plan!.startDato.toLocaleDateString("nb-NO", { day: "2-digit", month: "short" }).toUpperCase()}
                {plan!.sluttDato ? ` — ${plan!.sluttDato.toLocaleDateString("nb-NO", { day: "2-digit", month: "short" }).toUpperCase()}` : ""}
              </span>
            </div>
          </div>
          <PlanToolbar planId={plan!.id} drillsHref={`/admin/spillere/${id}/plan/${planId}?tab=drills`} isPublished={plan!.status === "ACTIVE"} />
        </div>

        {/* KPI-strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4" style={{ gap: T.gap }}>
          <Kort>
            <Caps size={9}>Status</Caps>
            <div style={{ marginTop: 12 }}>
              <StatusPill tone={plan!.status === "ACTIVE" ? "up" : "info"}>{plan!.status}</StatusPill>
            </div>
          </Kort>
          <KpiFlis label="P-posisjoner" value={String(plan!.positions.length)} />
          <KpiFlis label="Drills" value={String(drillsTotal)} />
          <KpiFlis label="Med TM-mål" value={String(drills.filter((d) => d.tm).length)} />
        </div>

        {/* Tab-piller */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {(
            [
              { id: "oversikt", label: "Oversikt" },
              { id: "periodisering", label: "Periodisering" },
              { id: "drills", label: `Drills (${drillsTotal})` },
              { id: "hit-rate", label: "Hit-rate" },
              { id: "effekt", label: "Effekt" },
            ] as const
          ).map((t) => {
            const active = tab === t.id;
            return (
              <Link key={t.id} href={`/admin/spillere/${id}/plan/${planId}?tab=${t.id}`} style={{ textDecoration: "none" }}>
                <span
                  style={{
                    display: "inline-block",
                    padding: "7px 16px",
                    borderRadius: 9999,
                    fontFamily: T.ui,
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: active ? T.onLime : T.mut,
                    background: active ? T.lime : T.panel2,
                    border: `1px solid ${active ? "transparent" : T.border}`,
                  }}
                >
                  {t.label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Tab-innhold */}
        {tab === "oversikt" && (
          <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr]" style={{ gap: T.gap }}>
            <Kort eyebrow="Plan · sammendrag">
              <p style={{ fontFamily: T.disp, fontStyle: "italic", fontSize: 15, lineHeight: 1.6, color: T.fg, margin: 0 }}>
                {plan!.navn} for {spiller!.name}. {drillsTotal} drills fordelt på {plan!.positions.length} P-posisjoner.
              </p>
            </Kort>
            <Kort tint eyebrow={<MikroMeta icon="sparkles">Neste steg</MikroMeta>}>
              <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2, lineHeight: 1.6, margin: 0 }}>
                {drillsTotal === 0
                  ? "Planen har ingen drills ennå. Gå til Drills-fanen og legg til den første."
                  : "Rediger drills i Drills-fanen, eller publiser planen for å gjøre den aktiv for spilleren."}
              </p>
            </Kort>
          </div>
        )}

        {tab === "periodisering" && (
          <Kort eyebrow="Periodisering">
            <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, margin: 0 }}>
              Periodisering settes i Workbench. Denne fanen viser planens tidslinje når periode-blokker er koblet.
            </p>
          </Kort>
        )}

        {tab === "drills" && <DrillsPanel planId={plan!.id} defaultTarget={defaultTarget} drills={drills} />}

        {tab === "hit-rate" && (
          hitRateDrills.length === 0 ? (
            <Kort>
              <TomTilstand
                icon="trending-up"
                title="Ingen hit-rate-data ennå"
                sub="Hit-rate vises når drills med hit-rate-mål har målte slag-vinduer fra TrackMan."
              />
            </Kort>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{ gap: T.gap }}>
              {hitRateDrills.map((d) => (
                <Kort key={d.taskId}>
                  <StatusPill tone={KATEGORI_TONE[d.category]}>{d.category}</StatusPill>
                  <div style={{ fontFamily: T.disp, fontSize: 15, fontWeight: 700, color: T.fg, marginTop: 10 }}>{d.name}</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 10 }}>
                    <span style={{ fontFamily: T.mono, fontSize: 30, fontWeight: 700, color: T.up }}>{d.rate}</span>
                    <span style={{ fontFamily: T.mono, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.04em", color: T.mut }}>
                      hit-rate · siste vindu
                    </span>
                  </div>
                </Kort>
              ))}
            </div>
          )
        )}

        {tab === "effekt" && (
          <Kort>
            <TomTilstand
              icon="trending-up"
              title="Effekt kommer"
              sub="Før/etter-effekt per metrikk krever koblet baseline- og oppfølgingsdata. Vi viser ekte tall her når datagrunnlaget er på plass — ingen påfunn."
            />
          </Kort>
        )}
      </div>
    </V2Shell>
  );
}
