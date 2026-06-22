/**
 * PlayerHQ · Mål-detalj (hybrid design)
 *
 * /portal/mal/goal/[id]
 *
 * Hybrid pattern: editorial light header → terminal data cards
 * Two tabs: Mål-detalj (progress ring + LevelLadder + drills) og
 * Milepæler (badge shelf + neste milepæl).
 *
 * Redesign 2026-06-17 — prosjektgjennomgang hybrid design.
 */

import Link from "next/link";
import { ArrowLeft, Target } from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { GoalDetailClient } from "./goal-client";

type GoalStatus = "ACTIVE" | "ACHIEVED" | "ABANDONED";

type RoundRow = {
  id: string;
  date: string;
  label: string;
  value: number;
  sgTotal: number | null;
};

type GoalView = {
  id: string;
  title: string;
  goalType: string;
  typeLabel: string;
  deadline: Date | null;
  status: GoalStatus;
  currentValue: number;
  targetValue: number;
  unit: string;
  progressPct: number;
  etaWeeks: number | null;
  history: RoundRow[];
  abandonReason: string | null;
};

// Modulnivå-helper: Date.now() kan ikke kalles i render-body (react-hooks/purity).
function nowMs(): number {
  return Date.now();
}

function daysUntil(d: Date | null): number | null {
  if (!d) return null;
  const ms = d.getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

function formatDeadline(d: Date | null): string {
  if (!d) return "Ingen frist";
  return d.toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function goalTypeLabelNorsk(type: string): string {
  if (type === "HCP_TARGET") return "HCP-MÅL";
  if (type === "ROUNDS_PER_MONTH") return "RUNDER/MND";
  if (type === "SG_AREA") return "STROKES GAINED";
  return "MÅL";
}

function goalTypeUnit(type: string): string {
  if (type === "HCP_TARGET") return "HCP";
  if (type === "ROUNDS_PER_MONTH") return "runder/mnd";
  if (type === "SG_AREA") return "SG";
  return "";
}

export default async function GoalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requirePortalUser();
  const { id } = await params;

  const goal = await prisma.goal.findUnique({ where: { id } });
  const isOwner =
    !!goal &&
    (goal.userId === user.id ||
      user.role === "ADMIN" ||
      user.role === "COACH");

  // Ingen ekte mål — eller ikke tilgang. Vis ærlig "ikke funnet", aldri demo-mål.
  if (!goal || !isOwner) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b border-border bg-card px-4 pt-4 pb-6 sm:px-6">
          <Link
            href="/portal/mal"
            className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.04em] text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" strokeWidth={1.75} />
            Mine mål
          </Link>
        </div>
        <div className="px-4 py-16 text-center sm:px-6">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-secondary text-muted-foreground">
            <Target className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <h1 className="mt-4 font-display text-[22px] font-bold tracking-[-0.02em] text-foreground">
            Mål ikke funnet
          </h1>
          <p className="mt-2 text-[13px] text-muted-foreground">
            Vi fant ingen mål med denne ID-en på kontoen din.
          </p>
          <Link
            href="/portal/mal"
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
            Tilbake til mine mål
          </Link>
        </div>
      </div>
    );
  }

  const isOwnGoal = goal.userId === user.id;

  const ninetyDaysAgo = new Date(nowMs() - 90 * 24 * 60 * 60 * 1000);
  const rounds = await prisma.round.findMany({
    where: { userId: goal.userId, playedAt: { gte: ninetyDaysAgo } },
    include: { course: { select: { name: true } } },
    orderBy: { playedAt: "desc" },
    take: 30,
  });

  const isResult =
    goal.type === "HCP_TARGET" || goal.type === "ROUNDS_PER_MONTH";

  const history: RoundRow[] = rounds.map((r) => ({
    id: r.id,
    date: r.playedAt.toISOString(),
    label: r.course?.name ?? "Runde",
    value: r.score,
    sgTotal: r.sgTotal ?? null,
  }));

  const currentValue =
    goal.type === "HCP_TARGET" && user.hcp != null
      ? user.hcp
      : history[0]?.value ?? 0;

  const startValue = history[history.length - 1]?.value ?? currentValue;
  const targetValue = goal.targetValue ?? 0;

  const progressPct = isResult
    ? Math.max(
        0,
        Math.min(
          100,
          ((startValue - currentValue) /
            Math.max(0.001, startValue - targetValue)) *
            100,
        ),
      )
    : 0;

  // Simple ETA estimate: weeks at current rate
  let etaWeeks: number | null = null;
  if (goal.targetDate) {
    const ms = goal.targetDate.getTime() - nowMs();
    etaWeeks = Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24 * 7)));
  }

  const payloadObj =
    goal.payload &&
    typeof goal.payload === "object" &&
    !Array.isArray(goal.payload)
      ? (goal.payload as Record<string, unknown>)
      : {};
  const abandonReason =
    typeof payloadObj.abandonReason === "string"
      ? payloadObj.abandonReason
      : null;

  const data: GoalView = {
    id: goal.id,
    title: goal.title,
    goalType: goal.type,
    typeLabel: goalTypeLabelNorsk(goal.type),
    deadline: goal.targetDate,
    status: (goal.status as GoalStatus) ?? "ACTIVE",
    currentValue,
    targetValue,
    unit: goalTypeUnit(goal.type),
    progressPct,
    etaWeeks,
    history,
    abandonReason,
  };

  const daysLeft = daysUntil(data.deadline);
  // Snittscore-stige — computed from HCP
  const ladderSteps = buildLadder(data.currentValue, data.goalType);

  return (
    <div className="min-h-screen bg-background">
      {/* Editorial header */}
      <div className="border-b border-border bg-card px-4 pt-4 pb-6 sm:px-6">
        <Link
          href="/portal/mal"
          className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.04em] text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-3 w-3" strokeWidth={1.75} />
          Mine mål
        </Link>

        <div className="font-mono text-[9px] font-bold uppercase tracking-[0.10em] mb-1 text-primary">
          {data.typeLabel}
        </div>

        <h1 className="font-display text-[26px] font-bold tracking-[-0.03em] text-foreground leading-tight">
          {data.title.split(" til ")[0] + " til "}
          {data.title.includes(" til ") ? (
            <em className="font-display italic font-medium text-primary">
              {data.title.split(" til ").slice(1).join(" til ")}
            </em>
          ) : null}
        </h1>

        {data.deadline && (
          <div className="mt-1 text-[13px] text-muted-foreground">
            Frist: {formatDeadline(data.deadline)}
            {data.etaWeeks != null && ` · ETA: ~${data.etaWeeks} uker`}
          </div>
        )}
      </div>

      {/* Detalj-innhold (server-rendret) */}
      <div className="px-4 py-5 sm:px-6 space-y-5">
        {/* Progress-kort */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
              Fremdrift
            </span>
            <span
              className="rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.06em]"
              style={
                data.status === "ACHIEVED"
                  ? { background: "var(--accent)", color: "var(--foreground)" }
                  : data.status === "ABANDONED"
                    ? { background: "var(--secondary)", color: "var(--muted-foreground)" }
                    : { background: "rgba(0,88,64,.10)", color: "var(--primary)" }
              }
            >
              {data.status === "ACHIEVED"
                ? "Oppnådd"
                : data.status === "ABANDONED"
                  ? "Avbrutt"
                  : "Aktivt"}
            </span>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-mono text-[34px] font-bold leading-none tabular-nums text-foreground">
              {data.currentValue.toLocaleString("nb-NO", {
                maximumFractionDigits: 1,
              })}
            </span>
            <span className="font-mono text-[13px] text-muted-foreground">
              / {data.targetValue.toLocaleString("nb-NO", { maximumFractionDigits: 1 })}{" "}
              {data.unit}
            </span>
          </div>

          {/* Progress-bar */}
          <div className="mt-3 h-[10px] overflow-hidden rounded-full border border-border bg-secondary">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.round(data.progressPct)}%`,
                background: "linear-gradient(90deg, #005840, #D1F843)",
              }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between font-mono text-[10px] text-muted-foreground">
            <span>{Math.round(data.progressPct)}% av målet</span>
            {daysLeft != null && <span>{daysLeft} dager igjen</span>}
          </div>
        </div>

        {/* Nivå-stige (kun HCP-mål) */}
        {ladderSteps.length > 0 && (
          <div className="rounded-2xl border border-border bg-card p-5">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
              Nivå-stige
            </span>
            <div className="mt-3 flex flex-col-reverse gap-1.5">
              {ladderSteps.map((step) => (
                <div
                  key={step.code}
                  className="flex items-center gap-3 rounded-lg px-3 py-2"
                  style={
                    step.state === "here"
                      ? { background: "var(--primary)", color: "var(--primary-foreground)" }
                      : step.state === "next"
                        ? { border: "1px dashed var(--primary)" }
                        : { background: "transparent" }
                  }
                >
                  <span className="font-mono text-[13px] font-bold tabular-nums">
                    {step.code}
                  </span>
                  <span
                    className={`text-[13px] ${step.state === "here" ? "" : "text-muted-foreground"}`}
                  >
                    {step.label}
                  </span>
                  {step.state === "here" && (
                    <span className="ml-auto font-mono text-[9px] font-bold uppercase tracking-[0.06em]">
                      Du er her
                    </span>
                  )}
                  {step.state === "next" && (
                    <span className="ml-auto font-mono text-[9px] font-bold uppercase tracking-[0.06em] text-primary">
                      Neste
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {data.status === "ABANDONED" && data.abandonReason && (
          <div className="rounded-2xl border border-border bg-secondary p-4 text-[13px] text-muted-foreground">
            <span className="font-medium text-foreground">Årsak: </span>
            {data.abandonReason}
          </div>
        )}

        {/* Handlinger — kun på egne mål */}
        {isOwnGoal && (
          <GoalDetailClient
            goalId={data.id}
            initial={{
              title: data.title,
              type: data.goalType,
              targetValue: data.targetValue,
              targetDate: data.deadline
                ? data.deadline.toISOString().slice(0, 10)
                : null,
            }}
          />
        )}
      </div>
    </div>
  );
}

type LadderStep = {
  code: string;
  label: string;
  state: "here" | "passed" | "next" | "future";
};

function buildLadder(currentHcp: number, goalType: string): LadderStep[] {
  if (goalType !== "HCP_TARGET") return [];

  // A-K score bands (NGF category approximation via HCP)
  const bands: { code: string; label: string; hcpMax: number }[] = [
    { code: "A", label: "Scratch", hcpMax: 0 },
    { code: "B", label: "0–2 · Tour", hcpMax: 2 },
    { code: "C", label: "2–4 · Nasjonal", hcpMax: 4 },
    { code: "D", label: "4–6 · Toppjunior", hcpMax: 6 },
    { code: "E", label: "6–10 · Regional", hcpMax: 10 },
    { code: "F", label: "10–15 · Klubbelite", hcpMax: 15 },
    { code: "G", label: "15–20 · Aktiv", hcpMax: 20 },
  ];

  const currentBandIdx = bands.findIndex((b) => currentHcp <= b.hcpMax);
  const currentIdx =
    currentBandIdx === -1 ? bands.length - 1 : currentBandIdx;

  // Show relevant window (current ± 2)
  const start = Math.max(0, currentIdx - 2);
  const end = Math.min(bands.length - 1, currentIdx + 1);

  return bands.slice(start, end + 1).map((b, i) => {
    const absIdx = start + i;
    let state: LadderStep["state"] = "future";
    if (absIdx === currentIdx) state = "here";
    else if (absIdx > currentIdx) state = "next";
    else state = "passed";
    return { code: b.code, label: b.label, state };
  });
}
