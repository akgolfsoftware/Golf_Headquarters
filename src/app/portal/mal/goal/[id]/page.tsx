// PH19Enkeltmal — Precision Athletics. Data og handlinger er beholdt.
/**
 * PlayerHQ · Mål-detalj (/portal/mal/goal/[id]) i Precision Athletics.
 * Kilde: Claude Design arkiv/2026-09-30/playerhq/screens/PH-19.jsx
 *
 * Auth/eierskaps-sjekk, Prisma-queries, fremdrifts-/ETA-utregningen og A–K-stigen
 * er uendret. Handlinger (endre/oppnådd/avbryt) går via goals-actions.ts.
 */

import Link from "next/link";
import { ArrowLeft, Target } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { loadGoalForViewer } from "@/lib/portal/goals/detail-data";
import { prisma } from "@/lib/prisma";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { Ikon, TomTilstand } from "@/components/precision/pa";
import { PH19Enkeltmal } from "@/components/portal/precision/PH19Enkeltmal";
import type { MalDetaljV2Data, MalStigeTrinn } from "@/components/portal/v2/MalDetaljV2";
import { beregnGoalProgress } from "@/lib/portal/goals/progress";
import { PYR_LABEL } from "@/lib/pyramide";
import { lesSgMaal } from "@/lib/domain/maal-fremdrift";
import { lesPlanNivaa } from "@/lib/domain/maal-plannivaa";

type GoalStatus = "ACTIVE" | "ACHIEVED" | "ABANDONED";

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

  const [detail, uleste] = await Promise.all([
    loadGoalForViewer(id, user),
    prisma.notification.count({ where: { userId: user.id, readAt: null } }),
  ]);
  const goal = detail?.goal;

  if (!goal || !detail) {
    return (
      <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste}>
        <div className="pa-side" style={{ maxWidth: 720, margin: "0 auto" }}>
          <Link href="/portal/mal" className="pa-btn pa-btn--secondary" style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
            <Ikon icon={ArrowLeft} size={15} name="arrow-left" />
            <span>Målsetninger</span>
          </Link>
          <div className="pa-card" style={{ padding: 32 }}>
            <TomTilstand
              icon={Target}
              title="Mål ikke funnet"
              text="Vi fant ingen mål med denne ID-en på kontoen din."
              actions={
                <Link href="/portal/mal" className="pa-btn pa-btn--primary">
                  Tilbake til målsetninger
                </Link>
              }
            />
          </div>
        </div>
      </PlayerHQSkall>
    );
  }

  const isOwnGoal = goal.userId === user.id;

  const [progress, linkedTest, testOptions] = await Promise.all([
    beregnGoalProgress(goal, { hcp: detail.hcp }),
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
    category: goal.category,
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
    stige: detail.hcp == null ? [] : buildLadder(detail.hcp, goal.type),
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
      category: goal.category,
      type: goal.type,
      targetValue: goal.targetValue,
      targetDate: goal.targetDate ? goal.targetDate.toISOString().slice(0, 10) : null,
      linkedPyramidArea: goal.linkedPyramidArea,
      linkedTestId: goal.linkedTestId,
      sgOmrade: lesSgMaal(goal.payload)?.omrade ?? null,
      planNivaa: lesPlanNivaa(goal.payload),
    },
  };

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste}>
      <PH19Enkeltmal data={data} testOptions={testOptions} />
    </PlayerHQSkall>
  );
}
