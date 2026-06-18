/**
 * /admin/planlegge — AgencyOS Planlegging (hybrid terminal design 2026-06-17)
 *
 * Design-fasit: public/design-handover/prosjektgjennomgang-2026-06-17/…/AgencyOS Planlegging (hybrid).dc.html
 *
 * Layout:
 *   Topbar — tittel + mono-undertittel + spiller-velger + handlingsknapper
 *   2-kol grid (1fr 340px):
 *     VEN: Gantt-årsplan (periodeblokker) + aktiv periode KPI-strip
 *     HØY: Utviklingssteg / milepæl-tidslinje
 *
 * Henter ekte data fra SeasonPlan + PeriodBlock + TournamentEntry + TrainingPlan.
 * Når ingen aktiv sesongplan finnes vises ærlige tomme tilstander — ingen demo-tall.
 */

import Link from "next/link";
import { Plus, ChevronDown } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// ── Typer ────────────────────────────────────────────────────────────────────

type GanttBand = {
  label: string;
  startMonth: number; // 0-11
  endMonth: number;   // 0-11 (inclusive)
  phase: "fys" | "tek" | "konkurranse" | "topping" | "hvile";
  active?: boolean;
};

type TournamentMark = {
  /** 0-1: posisjon i Gantt-grid */
  pos: number;
};

type PeriodKpi = {
  label: string;
  value: string;
  valueCls: string; // Tailwind-klasse for farge
};

type ActivePeriod = {
  label: string;
  monthRange: string;
};

// ── Data-henting ─────────────────────────────────────────────────────────────

async function loadPlanData(coachId: string) {
  const now = new Date();
  const year = now.getFullYear();

  // Finn aktiv spiller (første aktive treningsplan tilknyttet coach)
  const activePlan = await prisma.trainingPlan.findFirst({
    where: { isActive: true, status: "ACTIVE", createdById: coachId },
    include: {
      user: { select: { id: true, name: true } },
      sessions: { where: { scheduledAt: { gte: new Date(year, 0, 1) } } },
    },
    orderBy: { updatedAt: "desc" },
  });

  // Finn sesongplan for aktiv spiller (eller første tilgjengelig)
  const targetUserId = activePlan?.user.id;
  const seasonPlan = targetUserId
    ? await prisma.seasonPlan.findFirst({
        where: { userId: targetUserId, year },
        include: {
          periodBlocks: { orderBy: { startDate: "asc" } },
          tournamentEntries: {
            where: { manualDate: { gte: new Date(year, 0, 1), lte: new Date(year, 11, 31) } },
            orderBy: { manualDate: "asc" },
          },
        },
      })
    : null;

  // Planlagte / fullførte økter for KPI
  const totalSessions = activePlan?.sessions.length ?? 0;
  const completedSessions = activePlan?.sessions.filter(
    (s) => s.scheduledAt < now
  ).length ?? 0;
  const pctComplete =
    totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;
  const tournamentCount = seasonPlan?.tournamentEntries.length ?? 0;

  // Aktiv periodeblokk (den som omslutter dagens dato)
  const activeBlock =
    seasonPlan?.periodBlocks.find((b) => b.startDate <= now && b.endDate >= now) ?? null;

  return {
    player: activePlan?.user ?? null,
    seasonPlan,
    activeBlock,
    kpis: { totalSessions, completedSessions, pctComplete, tournamentCount },
  };
}

// ── Hjelpefunksjoner ─────────────────────────────────────────────────────────

const MONTH_LABELS = [
  "jan","feb","mar","apr","mai","jun",
  "jul","aug","sep","okt","nov","des",
] as const;

function monthPos(date: Date): number {
  // Måneds-posisjon som andel av året (0-1)
  return (date.getMonth() + date.getDate() / 31) / 12;
}

const PHASE_LABEL: Record<string, string> = {
  GRUNN: "Grunntrening",
  SPESIAL: "Oppbygging",
  TURNERING: "Sesong",
};

/** Bygger label + måned-spenn for den aktive periodeblokken. */
function activePeriodFrom(block: {
  lPhase: string;
  startDate: Date;
  endDate: Date;
}): ActivePeriod {
  const from = MONTH_LABELS[block.startDate.getMonth()].toUpperCase();
  const to = MONTH_LABELS[block.endDate.getMonth()].toUpperCase();
  return {
    label: PHASE_LABEL[block.lPhase] ?? "Periode",
    monthRange: from === to ? from : `${from} – ${to}`,
  };
}

/** Konverterer PeriodBlock til GanttBand. Brukes kun om SeasonPlan finnes. */
function blocksToGanttBands(
  blocks: Array<{ lPhase: string; startDate: Date; endDate: Date }>,
  activePhase: string | null
): GanttBand[] {
  const phaseMap: Record<string, GanttBand["phase"]> = {
    GRUNN: "fys",
    SPESIAL: "tek",
    TURNERING: "konkurranse",
  };
  return blocks.map((b) => ({
    label:
      b.lPhase === "GRUNN"
        ? "Grunntrening"
        : b.lPhase === "SPESIAL"
          ? "Oppbygging"
          : "Sesong",
    startMonth: b.startDate.getMonth(),
    endMonth: b.endDate.getMonth(),
    phase: phaseMap[b.lPhase] ?? "fys",
    active: b.lPhase === activePhase,
  }));
}

// ── Phase → klasser ───────────────────────────────────────────────────────────


const PHASE_BAND_CLASSES: Record<GanttBand["phase"], string> = {
  fys: "bg-pyr-fys text-white",
  tek: "bg-pyr-tek text-white",
  konkurranse: "bg-card text-foreground border border-border",
  topping: "bg-primary text-primary-foreground",
  hvile: "bg-warning/80 text-warning-foreground",
};

// ── Sub-komponenter ───────────────────────────────────────────────────────────

function GanttBandBar({
  band,
}: {
  band: GanttBand;
}) {
  const left = `${(band.startMonth / 12) * 100}%`;
  const width = `${((band.endMonth - band.startMonth + 1) / 12) * 100}%`;

  const cls = PHASE_BAND_CLASSES[band.phase];
  const activeCls = band.active ? "ring-2 ring-primary" : "";

  return (
    <div
      className={`absolute top-1 bottom-1 rounded-full flex items-center px-2 font-mono text-[9.5px] font-semibold tracking-[0.04em] uppercase whitespace-nowrap overflow-hidden ${cls} ${activeCls}`}
      style={{ left, width }}
    >
      {band.label}
    </div>
  );
}

function GanttRow({ label, band }: { label: string; band: GanttBand }) {
  return (
    <div className="grid gap-3 mb-2" style={{ gridTemplateColumns: "120px 1fr" }}>
      <span className="font-mono text-[11px] font-semibold tracking-[0.04em] uppercase text-muted-foreground self-center">
        {label}
      </span>
      <div
        className="relative h-[26px] rounded-sm bg-card border border-border"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, transparent, transparent calc(100%/12 - 1px), hsl(var(--border)) calc(100%/12 - 1px), hsl(var(--border)) calc(100%/12))",
        }}
      >
        <GanttBandBar band={band} />
      </div>
    </div>
  );
}

function TournamentRow({ marks }: { marks: TournamentMark[] }) {
  return (
    <div className="grid gap-3" style={{ gridTemplateColumns: "120px 1fr" }}>
      <span className="font-mono text-[11px] font-semibold tracking-[0.04em] uppercase text-muted-foreground self-center">
        Turneringer
      </span>
      <div className="relative h-[18px]">
        {marks.map((m, i) => (
          <div
            key={i}
            className="absolute top-0 bottom-0 w-[2px] bg-destructive rounded-full"
            style={{ left: `${m.pos * 100}%` }}
          >
            <div className="absolute -top-[3px] left-1/2 -translate-x-1/2 w-[7px] h-[7px] rounded-full bg-destructive" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Hoved-komponent ───────────────────────────────────────────────────────────

export default async function PlanleggePage() {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  // Last ekte data — fanger eventuelle DB-feil stille (viser tom tilstand)
  let planData: Awaited<ReturnType<typeof loadPlanData>> | null = null;
  try {
    planData = await loadPlanData(user.id);
  } catch {
    // Ved DB-feil: behandle som om ingen plan finnes (tom tilstand)
  }

  const playerName = planData?.player?.name ?? null;
  const playerInitials = playerName
    ? playerName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "–";

  const year = new Date().getFullYear();
  const activePhase = planData?.activeBlock?.lPhase ?? null;

  // Bygg Gantt-data fra ekte periodeblokker (ingen demo-fallback)
  const ganttBands: GanttBand[] =
    planData?.seasonPlan?.periodBlocks && planData.seasonPlan.periodBlocks.length > 0
      ? blocksToGanttBands(
          planData.seasonPlan.periodBlocks as Array<{
            lPhase: string;
            startDate: Date;
            endDate: Date;
          }>,
          activePhase
        )
      : [];

  // Turneringsmarkeringer fra ekte oppføringer (ingen demo-fallback)
  const tournamentMarks: TournamentMark[] =
    planData?.seasonPlan?.tournamentEntries
      ?.filter((e) => e.manualDate)
      .map((e) => ({ pos: monthPos(e.manualDate!) })) ?? [];

  // KPI-data — kun ekte tall (turneringer + planlagte/fullførte økter). SG mål har ingen kilde ennå.
  const kpis: PeriodKpi[] =
    planData && planData.kpis.totalSessions > 0
      ? [
          {
            label: "Turneringer",
            value: String(planData.kpis.tournamentCount),
            valueCls: "text-foreground",
          },
          {
            label: "Planlagte økter",
            value: String(planData.kpis.totalSessions),
            valueCls: "text-foreground",
          },
          {
            label: "Fullført",
            value: `${planData.kpis.pctComplete} %`,
            valueCls: "text-primary",
          },
        ]
      : [];

  // Aktiv periode (label + måned-spenn) fra ekte periodeblokk
  const activePeriod: ActivePeriod | null = planData?.activeBlock
    ? activePeriodFrom(planData.activeBlock)
    : null;

  const months = [
    "jan","feb","mar","apr","mai","jun",
    "jul","aug","sep","okt","nov","des",
  ];

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* ── Topbar ── */}
      <div
        className="flex items-center gap-3 px-5 py-3.5 border-b border-border flex-shrink-0"
        style={{ background: "hsl(var(--background)/0.5)" }}
      >
        <div>
          <div className="font-display font-bold text-[19px] text-foreground tracking-tight">
            Planlegging
          </div>
          <div className="font-mono text-[10.5px] text-muted-foreground mt-0.5">
            Årsplan · perioder · milepæler
          </div>
        </div>

        {/* Spiller-velger */}
        <div className="flex items-center gap-2 bg-card border border-border rounded-md px-3 py-2 cursor-pointer">
          <span className="w-[22px] h-[22px] rounded-full bg-card border border-border text-muted-foreground flex items-center justify-center font-mono text-[9px] font-bold flex-shrink-0">
            {playerInitials}
          </span>
          <span className="text-[12.5px] font-semibold text-foreground">
            {playerName ?? "Ingen aktiv spiller"}
          </span>
          <ChevronDown size={13} className="text-muted-foreground" />
        </div>

        <div className="ml-auto flex gap-2">
          <Link
            href="/admin/plans"
            className="flex items-center gap-1.5 bg-card border border-border text-muted-foreground rounded-md px-3 py-2 font-mono text-[10.5px] font-bold tracking-[0.04em] uppercase hover:text-foreground transition-colors"
          >
            Rediger plan
          </Link>
          <Link
            href="/admin/plans"
            className="flex items-center gap-1.5 bg-primary text-primary-foreground rounded-md px-3 py-2 font-mono text-[10.5px] font-bold tracking-[0.04em] uppercase"
          >
            <Plus size={13} strokeWidth={2.4} aria-hidden />
            Ny periode
          </Link>
        </div>
      </div>

      {/* ── Innhold ── */}
      <div className="flex-1 overflow-y-auto p-5">
        <div className="grid gap-[18px]" style={{ gridTemplateColumns: "1fr 340px" }}>

          {/* ── Venstre: Gantt + Periode-detalj ── */}
          <div className="flex flex-col gap-[14px]">

            {/* Gantt-card */}
            <div className="bg-card border border-border rounded-xl p-[18px]">
              <div className="flex items-center justify-between mb-[14px]">
                <span className="font-mono text-[10px] font-bold tracking-[0.08em] uppercase text-muted-foreground">
                  Årsplan · Gantt · {year}
                </span>
              </div>

              {ganttBands.length > 0 ? (
                <>
                  {/* Månedsoverskrift */}
                  <div className="grid gap-3 mb-3" style={{ gridTemplateColumns: "120px 1fr" }}>
                    <span />
                    <div className="grid grid-cols-12 font-mono text-[9px] font-semibold tracking-[0.06em] uppercase text-muted-foreground">
                      {months.map((m) => (
                        <span key={m} className="text-center">{m}</span>
                      ))}
                    </div>
                  </div>

                  {/* Gantt-rader */}
                  {ganttBands.map((band, i) => (
                    <GanttRow key={i} label={band.label} band={band} />
                  ))}

                  {/* Turnerings-markering */}
                  {tournamentMarks.length > 0 && <TournamentRow marks={tournamentMarks} />}
                </>
              ) : (
                <p className="py-8 text-center text-[13px] text-muted-foreground">
                  Ingen sesongplan for {year} ennå.
                </p>
              )}
            </div>

            {/* Aktiv periode KPI-strip */}
            <div className="bg-card border border-border rounded-xl p-[16px]">
              <div className="flex items-center justify-between mb-[14px]">
                <span className="font-mono text-[10px] font-bold tracking-[0.08em] uppercase text-muted-foreground">
                  {activePeriod ? `Aktiv periode · ${activePeriod.label}` : "Aktiv periode"}
                </span>
                {activePeriod && (
                  <span className="font-mono text-[9.5px] font-bold bg-card border border-primary text-primary px-3 py-1 rounded-full">
                    {activePeriod.monthRange} {year}
                  </span>
                )}
              </div>
              {kpis.length > 0 ? (
                <div className="grid grid-cols-3 gap-2.5">
                  {kpis.map((kpi) => (
                    <div
                      key={kpi.label}
                      className="bg-background border border-border rounded-sm p-[11px_12px]"
                    >
                      <div className="font-mono text-[8.5px] font-semibold tracking-[0.1em] uppercase text-muted-foreground mb-[7px]">
                        {kpi.label}
                      </div>
                      <div
                        className={`font-mono text-[20px] font-semibold tabular-nums leading-none ${kpi.valueCls}`}
                      >
                        {kpi.value}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-4 text-center text-[13px] text-muted-foreground">
                  Ingen aktiv plan med planlagte økter ennå.
                </p>
              )}
            </div>
          </div>

          {/* ── Høyre: Milepæl-tidslinje ── */}
          <div className="bg-card border border-border rounded-xl p-[18px] overflow-y-auto">
            <div className="font-mono text-[10px] font-bold tracking-[0.08em] uppercase text-muted-foreground mb-4">
              Utviklingssteg · milepæler
            </div>
            <p className="py-4 text-[13px] text-muted-foreground leading-[1.5]">
              Ingen milepæler registrert ennå.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
