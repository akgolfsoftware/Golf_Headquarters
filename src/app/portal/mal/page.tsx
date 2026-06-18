/**
 * PlayerHQ Mål-hub — /portal/mal
 * Hybrid design (B2). Portert fra:
 * public/design-handover/prosjektgjennomgang-2026-06-17/…/PlayerHQ Mål-hub (hybrid).dc.html
 *
 * Layout: header + siste milepæl + goal-cards liste + empty state.
 * Data: ekte Prisma-queries for Goal + Achievement.
 */

import Link from "next/link";
import { Plus, Shield } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { NyGoalModal } from "./ny-goal-modal";
import type { Goal } from "@/generated/prisma/client";

// ---------------------------------------------------------------------------
// Typer
// ---------------------------------------------------------------------------

type GoalStatus = "on-track" | "behind" | "achieved";

type GoalRow = {
  id: string;
  type: string;
  title: string;
  pct: number;
  sub: string;
  status: GoalStatus;
  statusLabel: string;
};

// ---------------------------------------------------------------------------
// Hjelpere
// ---------------------------------------------------------------------------

const TYPE_LABELS: Record<string, string> = {
  HCP_TARGET: "HCP",
  ROUNDS_PER_MONTH: "RUNDER",
  SG_AREA: "SG",
  FREE_TEXT: "MÅL",
};

function typeLabel(type: string): string {
  return TYPE_LABELS[type] ?? "MÅL";
}

/**
 * Beregner fremdrift i prosent og status for et mål.
 * Returnerer 0–100 %.
 */
function beregnFremdrift(
  goal: Goal,
  hcp: number | null,
): { pct: number; status: GoalStatus; sub: string } {
  const { type, targetValue, targetDate } = goal;

  // HCP-mål: reise fra 54 → målverdi
  if (type === "HCP_TARGET" && targetValue !== null && hcp !== null) {
    const start = 54;
    const range = Math.max(0.1, start - targetValue);
    const reise = Math.max(0, start - hcp);
    const pct = Math.min(100, Math.round((reise / range) * 100));
    const fristStr = targetDate
      ? `Frist: ${formatKortDato(targetDate)}`
      : "Ingen frist";
    const delta = +(hcp - targetValue).toFixed(1);
    const sub =
      delta > 0
        ? `${hcp.toFixed(1)} nå · trenger ${delta.toFixed(1)} til · ${fristStr}`
        : `Mål nådd! HCP ${hcp.toFixed(1)}`;
    const status: GoalStatus = pct >= 100 ? "achieved" : pct >= 50 ? "on-track" : "behind";
    return { pct, status, sub };
  }

  // Fallback — ingen kalkulerbar fremdrift
  const sub = targetDate ? `Frist: ${formatKortDato(targetDate)}` : goal.title;
  return { pct: 0, status: "on-track", sub };
}

function formatKortDato(d: Date): string {
  return d.toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function mapGoalRow(goal: Goal, hcp: number | null): GoalRow {
  const { pct, status, sub } = beregnFremdrift(goal, hcp);
  const STATUS_LABELS: Record<GoalStatus, string> = {
    "on-track": pct >= 80 ? "Nær mål" : "På sporet",
    behind: "Bak plan",
    achieved: "Oppnådd",
  };
  return {
    id: goal.id,
    type: typeLabel(goal.type),
    title: goal.title,
    pct,
    sub,
    status,
    statusLabel: STATUS_LABELS[status],
  };
}

// ---------------------------------------------------------------------------
// Side (Server Component)
// ---------------------------------------------------------------------------

export default async function MalHub() {
  const user = await requirePortalUser();

  const [goals, sisteMilepael] = await Promise.all([
    prisma.goal.findMany({
      where: { userId: user.id, status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
    }),
    prisma.achievement.findFirst({
      where: { userId: user.id },
      orderBy: { earnedAt: "desc" },
    }),
  ]);

  const goalRows = goals.map((g) => mapGoalRow(g, user.hcp));

  return (
    <div className="mx-auto max-w-[600px] space-y-4 px-4 pb-24 pt-2 sm:px-6">
      {/* ---- Header ---- */}
      <div className="flex items-start justify-between pt-2">
        <div>
          <h1 className="font-display text-[24px] font-bold leading-tight tracking-[-0.03em] text-foreground">
            Mine{" "}
            <em className="font-display italic font-medium text-primary not-italic" style={{ fontStyle: "italic" }}>
              mål
            </em>
          </h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            {goals.length} aktive {goals.length === 1 ? "mål" : "mål"}
          </p>
        </div>
        <NyGoalModal />
      </div>

      {/* ---- Siste milepæl ---- */}
      {sisteMilepael && (
        <SisteMilepael milepael={sisteMilepael} />
      )}

      {/* ---- Mål-liste ---- */}
      {goalRows.length > 0 ? (
        <div className="flex flex-col gap-[9px]">
          {goalRows.map((row) => (
            <GoalCard key={row.id} row={row} />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Siste milepæl
// ---------------------------------------------------------------------------

const ACHIEVEMENT_TITLER: Record<string, string> = {
  STREAK_7: "7 dager på rad",
  STREAK_14: "14 dager på rad",
  STREAK_30: "30 dager på rad",
  FIRST_ROUND: "Første registrerte runde",
  FIRST_TEST: "Første gjennomførte test",
  SG_POSITIVE_30D: "SG positiv siste 30 dager",
  HCP_DOWN: "HCP gikk ned",
  ROUND_BEST: "Ny personlig rekord",
};

function SisteMilepael({
  milepael,
}: {
  milepael: { kind: string; earnedAt: Date; payload?: unknown };
}) {
  const tittel = ACHIEVEMENT_TITLER[milepael.kind] ?? milepael.kind;
  const datoStr = milepael.earnedAt.toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div
      className="rounded-[20px] px-[15px] py-[14px]"
      style={{ background: "var(--forest, #005840)", boxShadow: "0 14px 40px -12px rgba(0,88,64,.45)" }}
    >
      <div
        className="font-mono text-[9px] font-bold uppercase tracking-[0.12em] mb-[5px]"
        style={{ color: "var(--lime, #D1F843)" }}
      >
        Siste milepæl
      </div>
      <div
        className="font-display text-[15px] font-bold"
        style={{ color: "#fff" }}
      >
        {tittel}
      </div>
      <div
        className="font-mono text-[10px] mt-[3px]"
        style={{ color: "rgba(255,255,255,.6)" }}
      >
        {datoStr}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Goal Card
// ---------------------------------------------------------------------------

const STATUS_CHIP_STYLE: Record<GoalStatus, { bg: string; color: string }> = {
  "on-track": { bg: "rgba(0,88,64,.10)", color: "var(--forest, #005840)" },
  behind: { bg: "rgba(184,133,42,.14)", color: "var(--warn, #B8852A)" },
  achieved: { bg: "rgba(209,248,67,.20)", color: "var(--forest, #005840)" },
};

const TYPE_COLOR: Record<GoalStatus, string> = {
  "on-track": "var(--forest, #005840)",
  behind: "var(--warn, #B8852A)",
  achieved: "var(--lime-dim, #A9CF2E)",
};

const BORDER_COLOR: Record<GoalStatus, string> = {
  "on-track": "var(--forest, #005840)",
  behind: "var(--warn, #B8852A)",
  achieved: "var(--lime, #D1F843)",
};

function GoalCard({ row }: { row: GoalRow }) {
  const chip = STATUS_CHIP_STYLE[row.status];
  const typeColor = TYPE_COLOR[row.status];
  const borderColor = BORDER_COLOR[row.status];

  return (
    <Link
      href={`/portal/mal/goal/${row.id}`}
      className="block rounded-[20px] border border-border bg-card p-[15px] transition-transform hover:-translate-y-0.5"
      style={{
        borderLeftWidth: "3px",
        borderLeftColor: borderColor,
        boxShadow: "0 1px 2px rgba(10,31,23,.05)",
      }}
    >
      {/* Top row: type + title + status chip */}
      <div className="flex items-start justify-between mb-2 gap-2">
        <div className="min-w-0 flex-1">
          <div
            className="font-mono text-[8.5px] font-bold uppercase tracking-[0.08em] mb-[3px]"
            style={{ color: typeColor }}
          >
            {row.type}
          </div>
          <div className="text-[14px] font-semibold text-foreground leading-snug">
            {row.title}
          </div>
        </div>
        <span
          className="flex-shrink-0 font-mono text-[9px] font-bold rounded-full px-2 py-[2px]"
          style={{ background: chip.bg, color: chip.color }}
        >
          {row.statusLabel}
        </span>
      </div>

      {/* Progress label row */}
      <div className="flex justify-between mb-[5px]">
        <span className="font-mono text-[9px] uppercase tracking-[0.06em] text-muted-foreground">
          Fremdrift
        </span>
        <span className="font-mono text-[11px] font-semibold text-foreground">
          {row.pct} %
        </span>
      </div>

      {/* Progress bar */}
      <div
        className="h-2 rounded-full overflow-hidden border border-border"
        style={{ background: "var(--secondary, #F1EEE5)" }}
      >
        <div
          className="h-full rounded-full transition-[width] duration-700"
          style={{
            width: `${row.pct}%`,
            background: "linear-gradient(90deg, var(--forest, #005840), var(--lime-deep, #B9E022))",
          }}
        />
      </div>

      {/* Sub text */}
      <div className="text-[12px] text-muted-foreground mt-[6px]">
        {row.sub}
      </div>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Empty State
// ---------------------------------------------------------------------------

function EmptyState() {
  return (
    <div
      className="rounded-[28px] border border-border bg-card p-8 text-center"
      style={{ boxShadow: "0 1px 2px rgba(10,31,23,.05)" }}
    >
      <div
        className="w-[52px] h-[52px] rounded-full flex items-center justify-center mx-auto mb-4"
        style={{ background: "var(--secondary, #F1EEE5)" }}
      >
        <Shield
          className="h-6 w-6"
          style={{ color: "var(--muted-foreground, #5E5C57)" }}
          strokeWidth={1.5}
        />
      </div>
      <div className="font-display text-[17px] font-bold text-foreground mb-[6px]">
        Ingen mål ennå
      </div>
      <p className="text-[13px] text-muted-foreground mb-[18px] leading-[1.55] max-w-[240px] mx-auto">
        Sett ditt første mål og begynn å spore fremgangen din.
      </p>
      <Link
        href="/portal/mal/bygger"
        className="inline-flex items-center gap-[6px] font-mono text-[11px] font-bold uppercase tracking-[0.08em] rounded-full px-[22px] py-[11px] border-none"
        style={{
          background: "var(--lime, #D1F843)",
          color: "var(--forest, #005840)",
        }}
      >
        <Plus className="h-3 w-3" strokeWidth={2.4} />
        Sett første mål
      </Link>
    </div>
  );
}
