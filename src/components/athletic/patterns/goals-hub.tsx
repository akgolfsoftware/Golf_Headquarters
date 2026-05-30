"use client";

import { useRef } from "react";
import Link from "next/link";
import { Plus, Target, Clock, CheckSquare } from "lucide-react";
import { useInView } from "@/components/athletic/hooks";

// ── Types ────────────────────────────────────────────────────────

export type Goal = {
  id: string;
  title: string;
  axis: "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";
  progress: number; // 0-100
  deadline: string; // formatted
  daysLeft: number;
  milestonesDone: number;
  milestonesTotal: number;
  status: "ACTIVE" | "ACHIEVED" | "OVERDUE";
};

export type GoalsHubPatternProps = {
  goals: Goal[];
  onCreateGoal?: () => void;
};

// ── Axis pill class map ──────────────────────────────────────────

const AXIS_PILL_CLASS: Record<Goal["axis"], string> = {
  FYS: "pill-fys",
  TEK: "pill-tek",
  SLAG: "pill-slag",
  SPILL: "pill-spill",
  TURN: "pill-turn",
};

// Maps axis to its CSS custom property for the progress bar fill
const AXIS_BAR_COLOR: Record<Goal["axis"], string> = {
  FYS: "var(--pyr-fys)",
  TEK: "var(--pyr-tek)",
  SLAG: "var(--pyr-slag)",
  SPILL: "var(--pyr-spill)",
  TURN: "var(--pyr-turn)",
};

// ── Status badge ─────────────────────────────────────────────────

function StatusBadge({ status }: { status: Goal["status"] }) {
  const map: Record<
    Goal["status"],
    { label: string; bg: string; color: string }
  > = {
    ACTIVE: {
      label: "Aktiv",
      bg: "color-mix(in oklab, var(--color-success) 12%, transparent)",
      color: "var(--color-success)",
    },
    ACHIEVED: {
      label: "Oppnådd",
      bg: "color-mix(in oklab, var(--pyr-fys) 12%, transparent)",
      color: "var(--pyr-fys)",
    },
    OVERDUE: {
      bg: "color-mix(in oklab, var(--color-danger) 12%, transparent)",
      color: "var(--color-danger)",
      label: "Forfalt",
    },
  };

  const cfg = map[status];

  return (
    <span
      className="font-mono text-[9px] font-bold uppercase tracking-[0.12em] rounded-full"
      style={{ background: cfg.bg, color: cfg.color, padding: "3px 10px" }}
    >
      {cfg.label}
    </span>
  );
}

// ── Goal card ────────────────────────────────────────────────────

type GoalCardProps = {
  goal: Goal;
  inView: boolean;
  delayIdx: number;
};

function GoalCard({ goal, inView, delayIdx }: GoalCardProps) {
  const pillClass = AXIS_PILL_CLASS[goal.axis];
  const barColor = AXIS_BAR_COLOR[goal.axis];

  const daysLabel =
    goal.daysLeft < 0
      ? `${Math.abs(goal.daysLeft)} dager over`
      : `${goal.daysLeft} dager`;

  const daysColor =
    goal.status === "OVERDUE"
      ? "var(--color-danger)"
      : goal.daysLeft <= 14
        ? "var(--color-warning)"
        : "hsl(var(--muted-foreground))";

  return (
    <Link
      href={`/portal/mal/goal/${goal.id}`}
      className="lift flex flex-col gap-4 rounded-[20px] border no-underline"
      style={{
        background: "var(--color-surface-card)",
        borderColor:
          goal.status === "ACHIEVED"
            ? "color-mix(in oklab, var(--pyr-fys) 25%, transparent)"
            : "hsl(var(--border))",
        boxShadow: "var(--shadow-card)",
        padding: 24,
        color: "inherit",
      }}
      aria-label={`Mål: ${goal.title}`}
    >
      {/* Top row: axis pill + status badge */}
      <div className="flex items-center justify-between gap-2">
        <span
          className={`${pillClass} font-mono text-[10px] font-bold uppercase tracking-[0.12em] rounded-full`}
          style={{ padding: "4px 12px" }}
        >
          {goal.axis}
        </span>
        <StatusBadge status={goal.status} />
      </div>

      {/* Title */}
      <h3
        className="m-0 font-display text-xl font-bold leading-[1.2] tracking-[-0.02em] text-foreground"
        style={{ textWrap: "pretty" } as React.CSSProperties}
      >
        {goal.title}
      </h3>

      {/* Progress bar */}
      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-2">
          <span className="font-mono text-[11px] font-bold tabular text-foreground">
            {goal.progress}%
          </span>
          <span className="font-mono text-[10px] text-muted-foreground">
            fullført
          </span>
        </div>
        <div
          className="relative overflow-hidden rounded-full"
          style={{
            height: 6,
            background: "color-mix(in oklab, hsl(var(--foreground)) 6%, transparent)",
          }}
          role="progressbar"
          aria-valuenow={goal.progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Fremgang: ${goal.progress}%`}
        >
          <div
            className="pyr-bar-fill absolute inset-y-0 left-0 rounded-full"
            style={{
              background: barColor,
              width: inView ? `${goal.progress}%` : "0%",
              transition: `width 1100ms cubic-bezier(0.22, 1, 0.36, 1) ${delayIdx * 80}ms`,
            }}
          />
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-border">
        {/* Milestones */}
        <span className="inline-flex items-center gap-[6px]">
          <CheckSquare
            size={14}
            className="text-muted-foreground flex-shrink-0"
          />
          <span className="font-mono text-[11px] text-muted-foreground tabular">
            {goal.milestonesDone}/{goal.milestonesTotal} milepæler
          </span>
        </span>

        {/* Deadline */}
        <span className="inline-flex items-center gap-[6px]">
          <Clock size={14} style={{ color: daysColor, flexShrink: 0 }} />
          <span
            className="font-mono text-[11px] tabular font-bold"
            style={{ color: daysColor }}
          >
            {daysLabel}
          </span>
        </span>
      </div>

      {/* Deadline date (subtle) */}
      <p className="m-0 font-mono text-[10px] text-muted-foreground">
        Frist: {goal.deadline}
      </p>
    </Link>
  );
}

// ── Empty state ──────────────────────────────────────────────────

function EmptyState({ onCreateGoal }: { onCreateGoal?: () => void }) {
  return (
    <div
      className="col-span-full flex flex-col items-center justify-center gap-6 rounded-[20px] border border-dashed py-16 px-8 text-center"
      style={{ borderColor: "hsl(var(--border))" }}
    >
      <span
        className="w-16 h-16 rounded-full grid place-items-center"
        style={{
          background: "color-mix(in oklab, hsl(var(--primary)) 8%, transparent)",
        }}
      >
        <Target size={32} style={{ color: "hsl(var(--primary))" }} />
      </span>

      <div className="flex flex-col gap-2">
        <h3 className="m-0 font-display text-2xl font-bold tracking-[-0.02em] text-foreground">
          Ingen mål enda
        </h3>
        <p className="m-0 text-muted-foreground text-[15px] max-w-[320px]">
          Start med ett konkret mål, så hjelper plattformen deg å holde fokus
          gjennom sesongen.
        </p>
      </div>

      {onCreateGoal ? (
        <button
          type="button"
          onClick={onCreateGoal}
          className="inline-flex items-center gap-2 rounded-full font-mono text-[12px] font-bold uppercase tracking-[0.10em] cursor-pointer border-0"
          style={{
            background: "hsl(var(--primary))",
            color: "hsl(var(--primary-foreground))",
            padding: "12px 24px",
          }}
        >
          <Plus size={16} />
          Lag ditt første mål
        </button>
      ) : (
        <Link
          href="/portal/mal/ny"
          className="inline-flex items-center gap-2 rounded-full font-mono text-[12px] font-bold uppercase tracking-[0.10em] no-underline"
          style={{
            background: "hsl(var(--primary))",
            color: "hsl(var(--primary-foreground))",
            padding: "12px 24px",
          }}
        >
          <Plus size={16} />
          Lag ditt første mål
        </Link>
      )}
    </div>
  );
}

// ── Main pattern ─────────────────────────────────────────────────

export default function GoalsHubPattern({
  goals,
  onCreateGoal,
}: GoalsHubPatternProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);

  return (
    <section className="flex flex-col gap-6">
      {/* CTA row */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-[2px]">
          <h2 className="m-0 font-display text-2xl font-bold tracking-[-0.02em] text-foreground">
            Mine mål
          </h2>
          {goals.length > 0 && (
            <p className="m-0 font-mono text-[11px] text-muted-foreground uppercase tracking-[0.10em]">
              {goals.filter((g) => g.status === "ACTIVE").length} aktive ·{" "}
              {goals.filter((g) => g.status === "ACHIEVED").length} oppnådd
            </p>
          )}
        </div>

        {onCreateGoal ? (
          <button
            type="button"
            onClick={onCreateGoal}
            className="inline-flex items-center gap-2 rounded-full font-mono text-[12px] font-bold uppercase tracking-[0.10em] cursor-pointer border-0 flex-shrink-0"
            style={{
              background: "hsl(var(--primary))",
              color: "hsl(var(--primary-foreground))",
              padding: "10px 20px",
            }}
          >
            <Plus size={15} />
            Nytt mål
          </button>
        ) : (
          <Link
            href="/portal/mal/ny"
            className="inline-flex items-center gap-2 rounded-full font-mono text-[12px] font-bold uppercase tracking-[0.10em] no-underline flex-shrink-0"
            style={{
              background: "hsl(var(--primary))",
              color: "hsl(var(--primary-foreground))",
              padding: "10px 20px",
            }}
          >
            <Plus size={15} />
            Nytt mål
          </Link>
        )}
      </div>

      {/* Grid */}
      <div
        ref={ref}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {goals.length === 0 ? (
          <EmptyState onCreateGoal={onCreateGoal} />
        ) : (
          goals.map((goal, idx) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              inView={inView}
              delayIdx={idx}
            />
          ))
        )}
      </div>
    </section>
  );
}
