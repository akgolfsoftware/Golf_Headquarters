import type { PyramidArea, SessionStatusV2 } from "@/generated/prisma/client";
import type { LiveSessionKind } from "@/lib/agents/live-coach-agent";

/** Én melding i live-coach-panelet (user/assistant kun i UI). */
export type LiveCoachChatRow = {
  role: "user" | "assistant";
  content: string;
};

export type LiveCoachPanelData = {
  sessionId: string;
  kind: LiveSessionKind;
  tier: "GRATIS" | "PRO";
  userId: string;
  fornavn: string;
  initialer: string;
  initialMessages: LiveCoachChatRow[];
};

/** Filtrerer CoachingSession.messages til chat-rader for panelet. */
export function filterLiveCoachMessages(raw: unknown): LiveCoachChatRow[] {
  if (!Array.isArray(raw)) return [];
  const out: LiveCoachChatRow[] = [];
  for (const row of raw) {
    if (!row || typeof row !== "object") continue;
    const role = (row as { role?: string }).role;
    const content = (row as { content?: string }).content;
    if (
      (role === "user" || role === "assistant") &&
      typeof content === "string" &&
      content.trim()
    ) {
      out.push({ role, content });
    }
  }
  return out;
}

/** Status for TrainingSessionV2-basert live-økt. */
export type LiveV2Status = SessionStatusV2;

/** Drill-view for live-økt (TrainingDrillV2). */
export type LiveV2Drill = {
  id: string;
  /** 1-basert rekkefølge for visning. */
  index: number;
  name: string;
  description: string | null;
  /** Planlagt varighet i minutter. */
  durationMinutes: number;
  /** Planlagt antall reps (repetitions). */
  plannedReps: number;
  pyramide: PyramidArea;
  lFase: string | null;
  notes: string | null;
  // Planlagt rep-type + volum (bølge 2) — det coachen la inn i composeren.
  repType: string | null;
  repAntall: number | null;
  repMinutter: number | null;
  repSett: number | null;
  repReps: number | null;
  // Fys-modalitet + mål (2026-07-16 · Live-økt-port) — NB: disse er i dag ALDRI
  // fylt ut av plan→live-speilingen (syncDrillsToV2 kopierer kun repType/repSett/
  // repReps over), så FysLogger faller tilbake til de generiske rep-feltene til
  // en fremtidig autoring-pipeline kobler ExerciseDefinition.parametersJson hit.
  fysTreningstype: string | null;
  fysMuskelgruppe: string | null;
  fysSett: number | null;
  fysReps: number | null;
  fysVektKg: number | null;
  fysTempo: string | null;
  fysPauseSek: number | null;
  fysVarighetMin: number | null;
  fysIntensitetsSone: number | null;
  fysDistanseM: number | null;
  fysAktivitet: string | null;
  fysBevegelighetType: string | null;
  fysHoldSek: number | null;
};

/** Planlagt rep-type + volum som klarspråk, f.eks. «120 baller», «30 min», «3 × 10». */
export function plannedVolumText(d: {
  repType: string | null;
  repAntall: number | null;
  repMinutter: number | null;
  repSett: number | null;
  repReps: number | null;
}): string | null {
  switch (d.repType) {
    case "SVINGER_UTEN_BALL":
      return d.repAntall != null ? `${d.repAntall} svinger` : "Svinger uten ball";
    case "BALLER_SLATT":
      return d.repAntall != null ? `${d.repAntall} baller` : "Baller slått";
    case "TID":
      return d.repMinutter != null ? `${d.repMinutter} min` : "Tid";
    case "SETT_REPS":
      return d.repSett != null && d.repReps != null
        ? `${d.repSett} × ${d.repReps}`
        : "Sett × reps";
    default:
      return null;
  }
}

/** Rep-fordeling logget for en drill (DrillLogV2). */
export type LiveV2DrillLog = {
  drillId: string;
  repsTotal: number;
  repsWithoutBall: number;
  repsLowSpeed: number;
  repsAutomatic: number;
  repsHit: number;
  successRate: number;
  notes: string | null;
  loggedAt: string;
};

/** Sesjons-view for live-økt (TrainingSessionV2). */
export type LiveV2Session = {
  sessionId: string;
  title: string;
  coachComment: string | null;
  focus: string | null;
  status: LiveV2Status;
  scheduledAtISO: string;
  completed: boolean;
  studentName: string | null;
  pyramide: PyramidArea;
  drills: LiveV2Drill[];
  existingLogs: LiveV2DrillLog[];
  /** Rå completedSummary JSON fra DB (brukes av summary). */
  completedSummary: unknown;
};

/** Rep-tilstand for én drill under aktiv økt. */
export type DrillRepState = {
  repsTotal: number;
  repsWithoutBall: number;
  repsLowSpeed: number;
  repsAutomatic: number;
  repsHit: number;
  /** Klarspråk-detaljer fra FYS-modalitetsloggeren (vekt/sone/RIR osv.) — golf-drills setter aldri denne.
   *  Eget navn (ikke "notes") for å unngå kollisjon med LiveV2Drill.notes (coachens plan-notat). */
  logNotes?: string;
};

/** Sammendragsdata for fullført økt. */
export type LiveV2Summary = LiveV2Session & {
  durationSec: number;
  totalReps: number;
  drillsCompleted: number;
  pyramidSummary: Record<PyramidArea, number>;
};
