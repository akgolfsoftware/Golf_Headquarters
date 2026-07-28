/**
 * PlayerHQ · Mål-detalj (/portal/mal/goal/[id]) — v2.
 * v2-port 17. juli 2026: `MalDetaljV2` erstatter hybrid-designet
 * (page + goal-client), ruten flyttet ut av (legacy). Auth/eierskaps-sjekk,
 * Prisma-queries, fremdrifts-/ETA-utregningen og A–K-stigen (buildLadder)
 * er uendret — kun presentasjonslaget er nytt. Handlinger (endre/oppnådd/
 * avbryt) går fortsatt via goals-actions.ts, nå fra MalDetaljV2s modaler.
 * Not-found-fallback beholdt (ærlig melding, aldri demo-mål).
 */

import Link from "next/link";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { TilbakeLenke, TomTilstand, CTAPill, Kort } from "@/components/v2";
import {
  MalDetaljV2,
  type MalDetaljV2Data,
  type MalStigeTrinn,
} from "@/components/portal/v2/MalDetaljV2";
import { beregnGoalProgress } from "@/lib/portal/goals/progress";
import { PYR_LABEL } from "@/lib/pyramide";
import { lesSgMaal } from "@/lib/domain/maal-fremdrift";

type GoalStatus = "ACTIVE" | "ACHIEVED" | "ABANDONED";

// Modulnivå-helper: Date.now() kan ikke kalles i render-body (react-hooks/purity).
function nowMs(): number {
  return Date.now();
}

function daysUntil(d: Date | null): number | null {
  if (!d) return null;
  const ms = d.getTime() - nowMs();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

function formatDeadline(d: Date): string {
  return d.toLocaleDateString("nb-NO", { day: "numeric", month: "long", year: "numeric" });
}

function goalTypeLabelNorsk(type: string): string {
  if (type === "HCP_TARGET") return "HCP-MÅL";
  if (type === "ROUNDS_PER_MONTH") return "RUNDER/MND";
  if (type === "SG_AREA") return "STROKES GAINED";
  if (type === "SESSION_FREQUENCY") return "ØKTFREKVENS";
  if (type === "TEST_SCORE") return "TESTRESULTAT";
  return "MÅL";
}

function goalTypeUnit(type: string): string {
  if (type === "HCP_TARGET") return "HCP";
  if (type === "ROUNDS_PER_MONTH") return "runder/mnd";
  if (type === "SG_AREA") return "SG";
  if (type === "SESSION_FREQUENCY") return "økter/uke";
  if (type === "TEST_SCORE") return "poeng";
  return "";
}

function formatAchievedDato(d: Date): string {
  return d.toLocaleDateString("nb-NO", { day: "numeric", month: "long", year: "numeric" });
}

function buildLadder(currentHcp: number, goalType: string): MalStigeTrinn[] {
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
  const currentIdx = currentBandIdx === -1 ? bands.length - 1 : currentBandIdx;

  // Show relevant window (current ± 2)
  const start = Math.max(0, currentIdx - 2);
  const end = Math.min(bands.length - 1, currentIdx + 1);

  return bands.slice(start, end + 1).map((b, i) => {
    const absIdx = start + i;
    let state: MalStigeTrinn["state"] = "future";
    if (absIdx === currentIdx) state = "here";
    else if (absIdx > currentIdx) state = "next";
    else state = "passed";
    return { code: b.code, label: b.label, state };
  });
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
    (goal.userId === user.id || user.role === "ADMIN" || user.role === "COACH");

  // Ingen ekte mål — eller ikke tilgang. Vis ærlig "ikke funnet", aldri demo-mål.
  if (!goal || !isOwner) {
    return (
      <V2Shell aktiv="meg" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
        <TilbakeLenke href="/portal/mal">Mine mål</TilbakeLenke>
        <Kort>
          <TomTilstand
            icon="target"
            title="Mål ikke funnet"
            sub="Vi fant ingen mål med denne ID-en på kontoen din."
          />
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Link href="/portal/mal" style={{ textDecoration: "none" }}>
              <CTAPill icon="arrow-right">Tilbake til mine mål</CTAPill>
            </Link>
          </div>
        </Kort>
      </V2Shell>
    );
  }

  const isOwnGoal = goal.userId === user.id;

  const [progress, linkedTest, testOptions] = await Promise.all([
    beregnGoalProgress(goal, { hcp: user.hcp }),
    goal.linkedTestId
      ? prisma.testDefinition.findUnique({ where: { id: goal.linkedTestId }, select: { name: true } })
      : Promise.resolve(null),
    goal.type === "TEST_SCORE" || isOwnGoal
      ? prisma.testDefinition.findMany({
          where: { OR: [{ isCustom: false }, { isCoachApproved: true }] },
          select: { id: true, name: true },
          orderBy: { name: "asc" },
        })
      : Promise.resolve([]),
  ]);

  const targetValue = goal.targetValue ?? 0;

  // Simple ETA estimate: weeks until deadline
  let etaWeeks: number | null = null;
  if (goal.targetDate) {
    const ms = goal.targetDate.getTime() - nowMs();
    etaWeeks = Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24 * 7)));
  }

  const payloadObj =
    goal.payload && typeof goal.payload === "object" && !Array.isArray(goal.payload)
      ? (goal.payload as Record<string, unknown>)
      : {};
  const abandonReason =
    typeof payloadObj.abandonReason === "string" ? payloadObj.abandonReason : null;

  const data: MalDetaljV2Data = {
    id: goal.id,
    typeLabel: goalTypeLabelNorsk(goal.type),
    tittel: goal.title,
    goalType: goal.type,
    status: (goal.status as GoalStatus) ?? "ACTIVE",
    naaVerdi: progress.value ?? 0,
    maalVerdi: targetValue,
    enhet: goalTypeUnit(goal.type),
    progressPct: progress.pct,
    hasData: progress.hasData,
    fremdriftTekst: progress.detail,
    fristTekst: goal.targetDate ? formatDeadline(goal.targetDate) : null,
    etaUker: etaWeeks,
    dagerIgjen: daysUntil(goal.targetDate),
    stige: buildLadder(user.hcp ?? 0, goal.type),
    avbruttGrunn: abandonReason,
    achievedAtTekst: goal.achievedAt
      ? formatAchievedDato(goal.achievedAt)
      : goal.status === "ACHIEVED"
        ? "Dato ukjent"
        : null,
    linkedPyramidAreaLabel: goal.linkedPyramidArea ? PYR_LABEL[goal.linkedPyramidArea] : null,
    linkedTestName: linkedTest?.name ?? null,
    erEget: isOwnGoal,
    initial: {
      title: goal.title,
      type: goal.type,
      targetValue: goal.targetValue,
      targetDate: goal.targetDate ? goal.targetDate.toISOString().slice(0, 10) : null,
      linkedPyramidArea: goal.linkedPyramidArea,
      linkedTestId: goal.linkedTestId,
      sgOmrade: lesSgMaal(goal.payload)?.omrade ?? null,
    },
  };

  return (
    <V2Shell aktiv="meg" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <TilbakeLenke href="/portal/mal">Mine mål</TilbakeLenke>
      <MalDetaljV2 data={data} testOptions={testOptions} />
    </V2Shell>
  );
}
