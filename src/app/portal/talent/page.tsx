/**
 * /portal/talent — PlayerHQ Talent hub
 * Hybrid design: editorial hero + data widgets
 * Fasit: [historisk fasit, fjernet 2026-07-03] prosjektgjennomgang-2026-06-17/.../PlayerHQ Talent (hybrid).dc.html
 */

import type { ReactElement } from "react";
import { Check, Lock, Star } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
// eslint-disable-next-line no-restricted-imports -- TODO(opprydding): migrer til golfdata (Fase 3/4)
import { Eyebrow } from "@/components/athletic/golfdata";
import { computeStreak, aktivStreak } from "@/lib/streak";

export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// Level-system mapping (TalentTracking.niva → display)
// ---------------------------------------------------------------------------
const JOURNEY_STAGES = [
  { key: "Klubb", label: "Klubb", state: "passed" as const },
  { key: "Regional", label: "Regional", state: "done" as const },
  { key: "Nasjonal", label: "Nasjonal", state: "now" as const },
  { key: "Inter.", label: "Inter.", state: "locked" as const },
  { key: "Tour", label: "Tour", state: "locked" as const },
] as const;

type StageState = "passed" | "done" | "now" | "locked";

const LEVEL_LADDER = [
  { code: "B", label: "68–70 · Tour", state: "future" as const },
  { code: "C", label: "70–72 · Nasjonal", state: "next" as const },
  { code: "D", label: "72–74 · Toppjunior", state: "here" as const },
  { code: "E", label: "74–77 · Regional", state: "passed" as const },
] as const;

type LadderState = "future" | "next" | "here" | "passed";

// Map niva field to a badge label
function nivaLabel(niva: string): string {
  const map: Record<string, string> = {
    U10: "U10 · Begynner",
    U12: "U12 · Junior",
    U14: "U14 · Junior",
    U16: "U16 · Toppjunior",
    U18: "U18 · Nasjonalt",
    Senior: "Senior · Elite",
  };
  return map[niva] ?? niva;
}

// ---------------------------------------------------------------------------
// SVG Mastery Ring
// ---------------------------------------------------------------------------
function MasteryRing({
  label,
  pct,
  level,
}: {
  label: string;
  pct: number;
  level: number;
}) {
  const C = 188; // circumference ≈ 2π×30
  const offset = C * (1 - pct / 100);
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-3 text-center">
      <svg viewBox="0 0 72 72" className="block h-[72px] w-[72px]">
        {/* track */}
        <circle
          cx="36"
          cy="36"
          r="30"
          fill="none"
          stroke="var(--color-secondary)"
          strokeWidth="10"
        />
        {/* fill */}
        <circle
          cx="36"
          cy="36"
          r="30"
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={offset}
          style={{
            transformOrigin: "center",
            transform: "rotate(-90deg)",
          }}
        />
        <text
          x="36"
          y="32"
          textAnchor="middle"
          fontFamily="var(--font-jetbrains-mono, monospace)"
          fontSize="7"
          fill="var(--color-muted-foreground)"
        >
          NV {level}
        </text>
        <text
          x="36"
          y="44"
          textAnchor="middle"
          fontFamily="var(--font-jetbrains-mono, monospace)"
          fontSize="14"
          fontWeight="600"
          fill="var(--color-foreground)"
        >
          {pct}%
        </text>
      </svg>
      <span className="text-[11px] font-semibold text-foreground">{label}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Journey dot icon
// ---------------------------------------------------------------------------
function JourneyIcon({ state }: { state: StageState }) {
  if (state === "done" || state === "passed") {
    return <Check size={14} strokeWidth={2.5} />;
  }
  if (state === "now") {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden>
        <circle cx="12" cy="12" r="4" fill="currentColor" />
      </svg>
    );
  }
  return <Lock size={12} strokeWidth={2} />;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default async function TalentPage() {
  const user = await requirePortalUser();

  // Fetch talent data, goals, rounds, and session logs in parallel
  const [tracking, goals, roundsRaw, sessionLogs] = await Promise.all([
    prisma.talentTracking.findUnique({
      where: { userId: user.id },
      select: {
        niva: true,
        fysisk: true,
        teknikk: true,
        taktikk: true,
        mental: true,
        motivasjon: true,
      },
    }),
    prisma.goal.findMany({
      where: { userId: user.id, status: "ACTIVE" },
      select: { id: true, title: true, targetValue: true, payload: true },
      orderBy: { createdAt: "asc" },
      take: 3,
    }),
    prisma.round.findMany({
      where: { userId: user.id },
      select: { sgTotal: true },
      orderBy: { playedAt: "desc" },
      take: 20,
    }),
    prisma.trainingPlanSessionLog.findMany({
      where: { session: { plan: { userId: user.id } } },
      select: { startedAt: true },
      orderBy: { startedAt: "desc" },
      take: 100,
    }),
  ]);

  // Streak computation
  const streakDates = sessionLogs.map((l) => new Date(l.startedAt));
  const streak14 = computeStreak(streakDates, 14);
  const activeDays = aktivStreak(streak14);

  // SG percentile — simplified: compute position vs reference (+1.0 = top ~15%)
  const sgValues = roundsRaw
    .map((r) => r.sgTotal)
    .filter((v): v is number => v != null);
  const sgAvg =
    sgValues.length > 0
      ? sgValues.reduce((s, v) => s + v, 0) / sgValues.length
      : null;
  // Map sgAvg to percentile (rough linear: -3 = 10th, 0 = 50th, +2 = 88th)
  const sgPercentile =
    sgAvg != null ? Math.round(Math.min(98, Math.max(2, 50 + sgAvg * 19))) : null;

  // Mastery rings: map 1–10 axes to 0–100 pct; derive level (1=0-30, 2=30-60, 3=60-80, 4=80+)
  function axisRing(val: number | null | undefined, label: string) {
    const v = val ?? 0;
    const pct = Math.round((v / 10) * 100);
    const level = v < 3 ? 1 : v < 6 ? 2 : v < 8 ? 3 : 4;
    return { label, pct, level };
  }
  const rings = [
    axisRing(tracking?.teknikk, "Teknikk"),
    axisRing(tracking?.fysisk, "Fysisk"),
    axisRing(tracking?.motivasjon, "Motivasjon"),
  ];

  // Goals with progress (payload may include currentValue and targetValue)
  type GoalPayload = { currentValue?: number; targetValue?: number };
  function goalPct(goal: {
    targetValue: number | null;
    payload: unknown;
  }): number {
    const p = goal.payload as GoalPayload | null;
    const current = p?.currentValue ?? 0;
    const target = goal.targetValue ?? p?.targetValue ?? 100;
    if (target === 0) return 0;
    return Math.round(Math.min(100, (current / target) * 100));
  }

  const niva = tracking?.niva ?? "—";

  // Journey stages: determine which stages are done/now based on niva
  const nivaOrder = ["U10", "U12", "U14", "U16", "U18", "Senior"];
  const nivaIdx = nivaOrder.indexOf(niva);
  // Map niva to journey stage index (rough: U10/U12=Klubb, U14=Regional, U16=Nasjonal, U18=Inter, Senior=Tour)
  const journeyMapping: Record<string, number> = {
    U10: 0,
    U12: 0,
    U14: 1,
    U16: 2,
    U18: 3,
    Senior: 4,
  };
  const currentJourneyIdx =
    nivaIdx >= 0 ? (journeyMapping[niva] ?? 2) : 2;

  const journeyStages: { key: string; label: string; state: StageState }[] =
    JOURNEY_STAGES.map((s, i) => ({
      ...s,
      state:
        i < currentJourneyIdx
          ? "done"
          : i === currentJourneyIdx
            ? "now"
            : "locked",
    }));

  // Journey progress bar width
  const journeyPct =
    JOURNEY_STAGES.length > 1
      ? (currentJourneyIdx / (JOURNEY_STAGES.length - 1)) * 100
      : 0;

  // Gauge needle angle: -90 (left) to +90 (right) = 0% to 100%
  const gaugeAngle =
    sgPercentile != null ? -90 + (sgPercentile / 100) * 180 : -90;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="golfdata-scope mx-auto max-w-lg space-y-4 px-4 py-6">
      {/* Hero */}
      <header className="px-1 pb-2">
        <Eyebrow style={{ fontSize: "var(--text-11)", letterSpacing: "0.16em" }}>
          Talent · {user.name}
        </Eyebrow>
        <h1 className="mt-2.5 font-display text-[30px] font-bold leading-[1.04] tracking-[-0.035em] text-foreground">
          Din{" "}
          <em className="italic font-medium text-primary">utviklingsvei</em>
        </h1>
        {/* Level badge */}
        <div className="mt-2.5 inline-flex items-center gap-2 rounded-full bg-primary px-3.5 py-1.5">
          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.04em] text-accent">
            NIVÅ {niva}
          </span>
          <span className="h-3 w-px bg-primary-foreground/20" />
          <span className="text-[11.5px] text-primary-foreground/80">{nivaLabel(niva)}</span>
        </div>
      </header>

      {/* JourneyMap */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <h2 className="font-display text-[15px] font-bold tracking-[-0.02em] text-foreground">
          Journey<em className="italic font-medium text-primary">Map</em>
        </h2>
        <div className="mt-3 overflow-x-auto pb-1">
          <div className="relative flex min-w-[280px] items-center">
            {/* connector line */}
            <div className="absolute inset-x-[5%] top-[17px] z-0 h-0.5 bg-border">
              <div
                className="absolute inset-y-0 left-0 rounded-sm bg-primary transition-all duration-1000"
                style={{ width: `${journeyPct}%` }}
              />
            </div>
            {journeyStages.map((stage) => (
              <div
                key={stage.key}
                className="relative z-10 flex flex-1 flex-col items-center gap-1.5"
              >
                {/* dot */}
                <div
                  className={[
                    "flex h-[34px] w-[34px] items-center justify-center rounded-full border-2",
                    stage.state === "done" || stage.state === "passed"
                      ? "border-primary bg-primary text-accent"
                      : stage.state === "now"
                        ? "border-accent bg-card text-primary shadow-[0_0_0_3px_hsl(var(--accent)/0.25)]"
                        : "border-border bg-card text-muted-foreground",
                  ].join(" ")}
                >
                  <JourneyIcon state={stage.state} />
                </div>
                <span className="font-mono text-[8px] uppercase tracking-[0.03em] text-muted-foreground">
                  {stage.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MasteryRings */}
      <div>
        <h2 className="mb-3 font-display text-[15px] font-bold tracking-[-0.02em] text-foreground">
          Mastery<em className="italic font-medium text-primary">Rings</em>
        </h2>
        <div className="grid grid-cols-3 gap-2.5">
          {rings.map((r) => (
            <MasteryRing key={r.label} {...r} />
          ))}
        </div>
      </div>

      {/* GoalProgress */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <h2 className="mb-3.5 font-display text-[15px] font-bold tracking-[-0.02em] text-foreground">
          Goal<em className="italic font-medium text-primary">Progress</em>
        </h2>
        {goals.length === 0 ? (
          <p className="text-[12px] text-muted-foreground">
            Ingen aktive mål. Sett mål i PlayerHQ for å se fremgang her.
          </p>
        ) : (
          <div className="space-y-3.5">
            {goals.map((g) => {
              const pct = goalPct(g);
              const p = g.payload as GoalPayload | null;
              const current = p?.currentValue ?? 0;
              const target = g.targetValue ?? p?.targetValue;
              return (
                <div key={g.id}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-[12px] font-semibold text-foreground">
                      {g.title}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {target != null
                        ? `${current} / ${target}`
                        : `${pct}%`}
                    </span>
                  </div>
                  <div className="relative h-2 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full"
                      style={{
                        width: `${pct}%`,
                        // #8EBF00 (olje-lime) matcher ingen eksisterende token — trenger
                        // en beslutning fra Anders før dette kan tokeniseres.
                        background:
                          "linear-gradient(90deg, var(--color-primary), #8EBF00)",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* StreakTracker + PercentileGauge */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Streak */}
        <div className="rounded-xl border border-border bg-card p-3.5 shadow-sm">
          <h2 className="font-display text-[13px] font-bold tracking-[-0.02em] text-foreground">
            Streak<em className="italic font-medium text-primary">Tracker</em>
          </h2>
          <div className="font-mono text-[38px] font-bold leading-none text-primary mt-2">
            {activeDays}
          </div>
          <div className="mb-2.5 text-[11px] text-muted-foreground">
            dager på rad
          </div>
          {/* 14-day streak cells */}
          <div className="flex flex-wrap gap-[3px]">
            {streak14.map((on, i) => {
              const isToday = i === streak14.length - 1;
              const dayLabels = ["M", "T", "O", "T", "F", "L", "S"];
              const dayLabel = dayLabels[i % 7];
              return (
                <div
                  key={i}
                  className={[
                    "flex h-[28px] w-[28px] items-center justify-center rounded-[5px] font-mono text-[8px]",
                    on
                      ? "border-primary bg-primary font-bold text-accent"
                      : "border border-border text-muted-foreground",
                    isToday ? "ring-2 ring-accent ring-offset-1" : "",
                  ].join(" ")}
                >
                  {dayLabel}
                </div>
              );
            })}
          </div>
        </div>

        {/* Percentile Gauge */}
        <div className="rounded-xl border border-border bg-card p-3.5 shadow-sm">
          <h2 className="font-display text-[13px] font-bold tracking-[-0.02em] text-foreground">
            Percentile
            <em className="italic font-medium text-primary">Gauge</em>
          </h2>
          {/* Half-donut SVG gauge */}
          <svg viewBox="0 0 200 120" className="mt-1 block w-full">
            {/* Colored arc segments */}
            {(() => {
              const cx = 100;
              const cy = 95;
              const R = 72;
              const segments: ReactElement[] = [];
              for (let i = 0; i < 40; i++) {
                const p0 = i / 40;
                const p1 = (i + 1) / 40;
                const a0 = Math.PI - p0 * Math.PI;
                const a1 = Math.PI - p1 * Math.PI;
                const x0 = (cx + Math.cos(a0) * R).toFixed(1);
                const y0 = (cy - Math.sin(a0) * R).toFixed(1);
                const x1 = (cx + Math.cos(a1) * R).toFixed(1);
                const y1 = (cy - Math.sin(a1) * R).toFixed(1);
                const color =
                  p0 < 0.5
                    ? "var(--color-destructive)"
                    : p0 < 0.7
                      ? "var(--color-warning)"
                      : p0 < 0.85
                        ? "var(--color-primary)"
                        : "var(--color-accent)";
                segments.push(
                  <path
                    key={i}
                    d={`M${x0} ${y0} A${R} ${R} 0 0 1 ${x1} ${y1}`}
                    stroke={color}
                    strokeWidth="11"
                    fill="none"
                    opacity="0.9"
                  />
                );
              }
              return segments;
            })()}
            {/* Needle */}
            <g
              style={{
                transform: `rotate(${gaugeAngle}deg)`,
                transformOrigin: "100px 95px",
              }}
            >
              <line
                x1="100"
                y1="95"
                x2="100"
                y2="33"
                stroke="var(--color-foreground)"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle
                cx="100"
                cy="95"
                r="5"
                fill="var(--color-foreground)"
              />
              <circle cx="100" cy="95" r="2" fill="var(--color-accent)" />
            </g>
          </svg>
          <div className="mt-[-4px] text-center">
            <div className="font-mono text-[18px] font-bold text-primary">
              {sgPercentile != null ? `topp ${100 - sgPercentile}%` : "—"}
            </div>
            <div className="font-mono text-[8.5px] uppercase tracking-[0.06em] text-muted-foreground">
              SG total
            </div>
          </div>
        </div>
      </div>

      {/* LevelLadder */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <h2 className="mb-3 font-display text-[15px] font-bold tracking-[-0.02em] text-foreground">
          Level<em className="italic font-medium text-primary">Ladder</em>
        </h2>
        <div className="flex flex-col-reverse gap-[3px]">
          {LEVEL_LADDER.map((step) => {
            const s = step.state as LadderState;
            return (
              <div
                key={step.code}
                className={[
                  "grid items-center gap-2 rounded-sm px-2.5 py-[7px]",
                  s === "here"
                    ? "bg-primary"
                    : s === "next"
                      ? "border border-dashed border-accent/60"
                      : "border border-transparent",
                ].join(" ")}
                style={{ gridTemplateColumns: "28px 1fr auto" }}
              >
                <span
                  className={[
                    "text-center font-mono text-[14px] font-bold",
                    s === "here"
                      ? "text-accent"
                      : s === "passed"
                        ? "text-primary"
                        : "text-muted-foreground",
                  ].join(" ")}
                >
                  {step.code}
                </span>
                <span
                  className={[
                    "text-[11.5px]",
                    s === "here" ? "text-accent" : "text-muted-foreground",
                  ].join(" ")}
                >
                  {step.label}
                </span>
                {s === "here" ? (
                  <span className="rounded-[3px] bg-accent px-1.5 py-0.5 font-mono text-[8px] font-bold text-primary">
                    Du er her
                  </span>
                ) : s === "next" ? (
                  <span className="font-mono text-[8px] text-primary">
                    Neste
                  </span>
                ) : (
                  <span />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Pre-BETA banner */}
      <div className="rounded-md border border-warning/40 bg-warning/10 px-4 py-2 text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.10em] text-warning">
          PRE-BETA · Talent-modulen viser foreløpig demo-data — kobles til DB post-BETA
        </p>
      </div>

      {/* Navigation tiles for sub-pages */}
      <nav aria-label="Talent-undersider" className="grid grid-cols-2 gap-2.5">
        {[
          { href: "/portal/talent/mitt-niva", label: "Mitt nivå", sub: "Nåværende vurdering" },
          { href: "/portal/talent/min-plan", label: "Min plan", sub: "Fokusområder & mål" },
          { href: "/portal/talent/roadmap", label: "Roadmap", sub: "12 måneder framover" },
          { href: "/portal/talent/sammenligning", label: "Sammenligning", sub: "Mot kohort" },
        ].map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="flex flex-col gap-1 rounded-xl border border-border bg-card p-3.5 transition-colors hover:border-primary/40"
          >
            <span className="flex items-center gap-1 text-[12px] font-semibold text-foreground">
              <Star size={12} strokeWidth={1.5} className="text-primary" aria-hidden />
              {item.label}
            </span>
            <span className="font-mono text-[10px] text-muted-foreground">
              {item.sub}
            </span>
          </a>
        ))}
      </nav>
    </div>
  );
}
