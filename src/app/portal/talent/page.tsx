/**
 * /portal/talent — PlayerHQ Talent hub
 * Hybrid design: editorial hero + data widgets
 * Fasit: [historisk fasit, fjernet 2026-07-03] prosjektgjennomgang-2026-06-17/.../PlayerHQ Talent (hybrid).dc.html
 */

import { Star } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { Card, Eyebrow, Heatmap, NivaStige, PercentileBar, Progress, RingGauge, Stepper, Tag } from "@/components/athletic/golfdata";
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
// ---------------------------------------------------------------------------
// Journey dot icon
// ---------------------------------------------------------------------------
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
        <div className="mt-2.5 flex items-center gap-2">
          <Tag variant="signal">NIVÅ {niva}</Tag>
          <span className="text-[11.5px] text-muted-foreground">{nivaLabel(niva)}</span>
        </div>
      </header>

      {/* JourneyMap — golfdata Stepper (klubb → tour) */}
      <Card eyebrow="Reisen" title="JourneyMap" compact>
        <Stepper steps={journeyStages.map((st) => st.label)} current={currentJourneyIdx} />
      </Card>

      {/* MasteryRings — golfdata RingGauge */}
      <div>
        <h2 className="mb-3 font-display text-[15px] font-bold tracking-[-0.02em] text-foreground">
          Mastery<em className="italic font-medium text-primary">Rings</em>
        </h2>
        <div className="grid grid-cols-3 gap-2.5">
          {rings.map((r) => (
            <Card key={r.label} compact bodyStyle={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <RingGauge value={r.pct} min={0} max={100} size={72} label={`NV ${r.level}`} unit="%" decimals={0} />
              <span className="text-[11px] font-semibold text-foreground">{r.label}</span>
            </Card>
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
                  <Progress variant="bar" value={pct} max={100} />
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
          {/* 14-dagers streak som golfdata Heatmap (2 uker × 7 dager) */}
          <Heatmap
            rows={["Uke 1", "Uke 2"]}
            cols={["M", "T", "O", "T", "F", "L", "S"]}
            values={[streak14.slice(0, 7).map((on) => (on ? 1 : 0)), streak14.slice(7).map((on) => (on ? 1 : 0))]}
            cell={22}
          />
        </div>

        {/* Percentile — golfdata PercentileBar */}
        <div className="rounded-xl border border-border bg-card p-3.5 shadow-sm">
          <h2 className="mb-3 font-display text-[13px] font-bold tracking-[-0.02em] text-foreground">
            Percentile<em className="italic font-medium text-primary">Bar</em>
          </h2>
          <PercentileBar
            percentile={sgPercentile ?? 50}
            label="SG total"
            valueLabel={sgPercentile != null ? `topp ${100 - sgPercentile} %` : "—"}
          />
        </div>
      </div>

      {/* LevelLadder — golfdata NivaStige */}
      <NivaStige
        nivaa={LEVEL_LADDER.find((l) => l.state === "here")?.code ?? "—"}
        etikett={LEVEL_LADDER.find((l) => l.state === "here")?.label}
        steg={LEVEL_LADDER.length}
        fylte={LEVEL_LADDER.filter((l) => l.state === "passed").length + 1}
        nesteEtikett={(() => { const n = LEVEL_LADDER.find((l) => l.state === "next"); return n ? `${n.code} · ${n.label}` : undefined; })()}
      />

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
