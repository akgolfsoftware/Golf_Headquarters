"use client";

import { useRef } from "react";
import Link from "next/link";
import {
  Trophy,
  Award,
  Flag,
  Target,
  CheckCircle,
  Star,
  ArrowRight,
} from "lucide-react";
import { useInView } from "@/components/athletic/hooks";

// ── Types ─────────────────────────────────────────────────────────

export type MilestoneType =
  | "GOAL_ACHIEVED"
  | "PLAN_COMPLETED"
  | "TOURNAMENT_RESULT"
  | "PR_NEW"
  | "TEST_PASSED"
  | "MILESTONE_OTHER";

export type MilestoneAxis = "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";

export type Milestone = {
  id: string;
  date: string; // ISO
  dateLabel: { day: string; month: string; year?: string };
  type: MilestoneType;
  axis?: MilestoneAxis;
  title: string;
  body?: string;
  photo?: string;
  metric?: { label: string; value: string; tone?: "accent" | "default" };
  href?: string;
};

export type TimelinePatternProps = {
  milestones: Milestone[];
  title?: string;
  groupByYear?: boolean;
};

// ── Achievement type config ───────────────────────────────────────

type AchievementConfig = {
  icon: React.ElementType;
  color: string;
  bg: string;
  label: string;
};

const TYPE_CONFIG: Record<MilestoneType, AchievementConfig> = {
  GOAL_ACHIEVED: {
    icon: Trophy,
    color: "var(--color-accent-foreground, #005840)",
    bg: "color-mix(in oklab, var(--color-accent) 25%, transparent)",
    label: "Mål oppnådd",
  },
  PLAN_COMPLETED: {
    icon: Award,
    color: "var(--color-primary)",
    bg: "color-mix(in oklab, var(--color-primary) 10%, transparent)",
    label: "Plan fullført",
  },
  TOURNAMENT_RESULT: {
    icon: Flag,
    color: "var(--color-info)",
    bg: "color-mix(in oklab, var(--color-info) 10%, transparent)",
    label: "Turnering",
  },
  PR_NEW: {
    icon: Target,
    color: "var(--color-accent-foreground, #005840)",
    bg: "color-mix(in oklab, var(--color-accent) 20%, transparent)",
    label: "PR",
  },
  TEST_PASSED: {
    icon: CheckCircle,
    color: "var(--color-success)",
    bg: "color-mix(in oklab, var(--color-success) 10%, transparent)",
    label: "Test bestatt",
  },
  MILESTONE_OTHER: {
    icon: Star,
    color: "hsl(var(--muted-foreground))",
    bg: "color-mix(in oklab, hsl(var(--foreground)) 6%, transparent)",
    label: "Milepel",
  },
};

// ── Axis pill CSS classes (matches globals.css) ───────────────────

const AXIS_PILL_CLASS: Record<MilestoneAxis, string> = {
  FYS: "pill-fys",
  TEK: "pill-tek",
  SLAG: "pill-slag",
  SPILL: "pill-spill",
  TURN: "pill-turn",
};

// ── Dot color per axis (rail-dot) ─────────────────────────────────

const AXIS_DOT_COLOR: Record<MilestoneAxis, string> = {
  FYS: "var(--color-primary)",
  TEK: "var(--color-warning, #B8852A)",
  SLAG: "var(--color-info, #2563EB)",
  SPILL: "hsl(var(--accent))",
  TURN: "hsl(var(--destructive))",
};

const DEFAULT_DOT_COLOR = "hsl(var(--muted-foreground))";

// ── Rail dot ─────────────────────────────────────────────────────

function RailDot({
  axis,
  isLast,
}: {
  axis?: MilestoneAxis;
  isLast: boolean;
}) {
  const dotColor = axis ? AXIS_DOT_COLOR[axis] : DEFAULT_DOT_COLOR;

  return (
    <div className="relative flex flex-col items-center" style={{ minHeight: 0 }}>
      {/* Vertical line above dot */}
      <div
        className="absolute top-0 w-px"
        style={{
          height: "calc(50% - 8px)",
          background: "hsl(var(--border))",
          left: "50%",
          transform: "translateX(-50%)",
        }}
      />

      {/* Dot */}
      <div
        className="relative z-10 rounded-full flex-shrink-0"
        style={{
          width: 16,
          height: 16,
          background: dotColor,
          boxShadow: `0 0 0 3px color-mix(in oklab, ${dotColor} 18%, transparent)`,
          marginTop: "calc(50% - 8px)",
        }}
        aria-hidden="true"
      />

      {/* Vertical line below dot */}
      {!isLast && (
        <div
          className="absolute bottom-0 w-px"
          style={{
            height: "calc(50% - 8px)",
            background: "hsl(var(--border))",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        />
      )}
    </div>
  );
}

// ── Metric chip ───────────────────────────────────────────────────

function MetricChip({
  metric,
}: {
  metric: NonNullable<Milestone["metric"]>;
}) {
  const isAccent = metric.tone === "accent";
  return (
    <div
      className="inline-flex items-baseline gap-[6px] rounded-full"
      style={{
        padding: "4px 12px",
        background: isAccent
          ? "color-mix(in oklab, var(--color-accent) 20%, transparent)"
          : "color-mix(in oklab, hsl(var(--foreground)) 6%, transparent)",
      }}
    >
      <span
        className="font-mono text-[11px] font-bold tabular"
        style={{
          color: isAccent
            ? "var(--color-accent-foreground, #005840)"
            : "hsl(var(--foreground))",
        }}
      >
        {metric.value}
      </span>
      <span className="font-mono text-[10px] text-muted-foreground">
        {metric.label}
      </span>
    </div>
  );
}

// ── Milestone card ────────────────────────────────────────────────

type MilestoneCardProps = {
  milestone: Milestone;
  inView: boolean;
  delayIdx: number;
};

function MilestoneCard({ milestone, inView, delayIdx }: MilestoneCardProps) {
  const cfg = TYPE_CONFIG[milestone.type];
  const IconComponent = cfg.icon;
  const pillClass = milestone.axis ? AXIS_PILL_CLASS[milestone.axis] : undefined;

  const cardStyle: React.CSSProperties = {
    opacity: inView ? 1 : 0,
    transform: inView ? "translateX(0)" : "translateX(16px)",
    transition: `opacity 400ms var(--ease-out, cubic-bezier(0.16,1,0.3,1)) ${delayIdx * 60}ms, transform 400ms var(--ease-out, cubic-bezier(0.16,1,0.3,1)) ${delayIdx * 60}ms`,
  };

  const cardInner = (
    <div
      className="flex flex-col gap-4 rounded-[var(--radius-card,16px)] border"
      style={{
        background: "var(--color-surface-card)",
        borderColor: "hsl(var(--border))",
        boxShadow: "var(--shadow-card)",
        padding: 24,
        ...cardStyle,
      }}
    >
      {/* Top row: axis pill (left) + achievement icon (right) */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          {pillClass && (
            <span
              className={`${pillClass} font-mono text-[10px] font-bold uppercase tracking-[0.12em] rounded-full`}
              style={{ padding: "4px 12px" }}
            >
              {milestone.axis}
            </span>
          )}
        </div>

        {/* Achievement icon badge */}
        <div
          className="flex-shrink-0 rounded-full flex items-center justify-center"
          style={{
            width: 32,
            height: 32,
            background: cfg.bg,
          }}
          aria-label={cfg.label}
        >
          <IconComponent size={16} style={{ color: cfg.color }} />
        </div>
      </div>

      {/* Photo (full-width, above title when present) */}
      {milestone.photo && (
        <div
          className="overflow-hidden rounded-[calc(var(--radius-card,16px)-4px)]"
          style={{ marginTop: -4 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={milestone.photo}
            alt={milestone.title}
            className="w-full object-cover"
            style={{ maxHeight: 180 }}
            loading="lazy"
          />
        </div>
      )}

      {/* Title */}
      <h3
        className="m-0 font-display text-lg font-bold leading-[1.25] tracking-[-0.02em] text-foreground"
        style={{ textWrap: "pretty" } as React.CSSProperties}
      >
        {milestone.title}
      </h3>

      {/* Body */}
      {milestone.body && (
        <p className="m-0 text-sm leading-[1.55] text-muted-foreground">
          {milestone.body}
        </p>
      )}

      {/* Metric + link row */}
      {(milestone.metric ?? milestone.href) && (
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {milestone.metric && <MetricChip metric={milestone.metric} />}
          {milestone.href && (
            <span
              className="inline-flex items-center gap-1 font-mono text-[11px] font-bold uppercase tracking-[0.08em]"
              style={{ color: "var(--color-primary)" }}
            >
              Se mer
              <ArrowRight size={12} />
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (milestone.href) {
    return (
      <Link
        href={milestone.href}
        className="block no-underline"
        aria-label={`Milepel: ${milestone.title}`}
        style={{ color: "inherit" }}
      >
        {cardInner}
      </Link>
    );
  }

  return <div aria-label={`Milepel: ${milestone.title}`}>{cardInner}</div>;
}

// ── Year separator ─────────────────────────────────────────────────

function YearSeparator({ year }: { year: string }) {
  return (
    <div
      className="flex items-center gap-4"
      role="separator"
      aria-label={`År ${year}`}
    >
      <span
        className="font-mono text-xs font-bold uppercase tracking-[0.12em] rounded-full"
        style={{
          padding: "6px 16px",
          background: "color-mix(in oklab, hsl(var(--foreground)) 6%, transparent)",
          color: "hsl(var(--muted-foreground))",
        }}
      >
        {year}
      </span>
      <div
        className="flex-1 h-px"
        style={{ background: "hsl(var(--border))" }}
      />
    </div>
  );
}

// ── Date column ────────────────────────────────────────────────────

function DateColumn({
  dateLabel,
}: {
  dateLabel: Milestone["dateLabel"];
}) {
  return (
    <div
      className="flex flex-col items-end justify-start pt-[calc(50%-1.5rem)] gap-0"
      aria-hidden="true"
    >
      <span className="font-mono text-xl font-bold tabular leading-none text-foreground">
        {dateLabel.day}
      </span>
      <span className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground leading-none mt-[2px]">
        {dateLabel.month}
      </span>
    </div>
  );
}

// ── Main pattern ───────────────────────────────────────────────────

export function TimelinePattern({
  milestones,
  title,
  groupByYear = false,
}: TimelinePatternProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef);

  // Sort newest first
  const sorted = [...milestones].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  // Group by year if requested
  type RowItem =
    | { kind: "year"; year: string }
    | { kind: "milestone"; milestone: Milestone; globalIdx: number };

  const rows: RowItem[] = [];

  if (groupByYear) {
    let lastYear = "";
    sorted.forEach((m, idx) => {
      const year = m.date.slice(0, 4);
      if (year !== lastYear) {
        rows.push({ kind: "year", year });
        lastYear = year;
      }
      rows.push({ kind: "milestone", milestone: m, globalIdx: idx });
    });
  } else {
    sorted.forEach((m, idx) => {
      rows.push({ kind: "milestone", milestone: m, globalIdx: idx });
    });
  }

  // Count only milestone rows for isLast logic
  const milestoneRows = rows.filter(
    (r): r is Extract<RowItem, { kind: "milestone" }> => r.kind === "milestone",
  );

  return (
    <section ref={containerRef} className="flex flex-col gap-0">
      {/* Optional header */}
      {title && (
        <h2 className="font-display text-2xl font-bold tracking-[-0.02em] text-foreground mb-8 mt-0">
          {title}
        </h2>
      )}

      {/* Empty state */}
      {milestones.length === 0 && (
        <div
          className="rounded-[var(--radius-card,16px)] border flex items-center justify-center"
          style={{
            background: "var(--color-surface-card)",
            borderColor: "hsl(var(--border))",
            minHeight: 160,
            boxShadow: "var(--shadow-card)",
          }}
        >
          <p className="text-sm text-muted-foreground text-center px-8">
            Ingen milepæler ennå. Sett deg et mål for å starte.
          </p>
        </div>
      )}

      {/* Timeline rows */}
      {rows.map((row) => {
        if (row.kind === "year") {
          return (
            <div key={`year-${row.year}`} className="mb-8 mt-4 first:mt-0">
              <YearSeparator year={row.year} />
            </div>
          );
        }

        const { milestone, globalIdx } = row;
        const milestoneIdx = milestoneRows.findIndex(
          (r) => r.milestone.id === milestone.id,
        );
        const isLast = milestoneIdx === milestoneRows.length - 1;

        return (
          <div
            key={milestone.id}
            className="grid items-stretch"
            style={{
              gridTemplateColumns: "80px 24px 1fr",
              gap: "0 16px",
              paddingBottom: isLast ? 0 : 24,
            }}
          >
            {/* Col 1: Date */}
            <DateColumn dateLabel={milestone.dateLabel} />

            {/* Col 2: Rail */}
            <RailDot axis={milestone.axis} isLast={isLast} />

            {/* Col 3: Card */}
            <MilestoneCard
              milestone={milestone}
              inView={inView}
              delayIdx={globalIdx}
            />
          </div>
        );
      })}
    </section>
  );
}

export default TimelinePattern;
