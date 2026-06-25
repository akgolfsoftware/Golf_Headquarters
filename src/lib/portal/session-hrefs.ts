/**
 * Spiller-lenker for TrainingSessionV2 (Spor B).
 * «Start økt» skal alltid gå til live-flyten — ikke read-only /portal/gjennomfore/[id].
 */

export type V2OktUiStatus = "done" | "now" | "upcoming";

/** Primær CTA (Start / Fortsett) for dagens økt-kort. */
export function v2SessionStartHref(
  sessionId: string,
  status: V2OktUiStatus,
): string {
  if (status === "now") return `/portal/live/${sessionId}/active`;
  if (status === "upcoming") return `/portal/live/${sessionId}`;
  return `/portal/live/${sessionId}/summary`;
}

/** Sekundær lenke — detalj-visning eller logg etter fullført økt. */
export function v2SessionDetailHref(
  sessionId: string,
  trengerLogg?: boolean,
): string {
  return trengerLogg
    ? `/portal/gjennomfore/${sessionId}?logg=1`
    : `/portal/gjennomfore/${sessionId}`;
}

type PlanSessionStatus =
  | "PLANNED"
  | "ACTIVE"
  | "PAUSED"
  | "COMPLETED"
  | "ABANDONED"
  | "SKIPPED"
  | "CANCELLED";

/** CTA for TrainingPlanSession (Spor A / Workbench). */
export function planSessionStartHref(
  sessionId: string,
  status: PlanSessionStatus,
): string {
  if (status === "COMPLETED") return `/portal/tren/${sessionId}`;
  if (status === "ABANDONED" || status === "SKIPPED" || status === "CANCELLED") {
    return `/portal/tren/${sessionId}`;
  }
  if (status === "ACTIVE" || status === "PAUSED") {
    return `/portal/live/${sessionId}/tapper`;
  }
  return `/portal/live/${sessionId}`;
}

export function planSessionUiStatus(
  status: PlanSessionStatus,
): V2OktUiStatus {
  if (status === "COMPLETED") return "done";
  if (status === "ACTIVE" || status === "PAUSED") return "now";
  return "upcoming";
}

/** TrainingSessionV2 status fra Prisma → spiller-CTA. */
export function v2DbSessionHref(sessionId: string, status: string): string {
  const ui: V2OktUiStatus =
    status === "COMPLETED"
      ? "done"
      : status === "IN_PROGRESS"
        ? "now"
        : "upcoming";
  return v2SessionStartHref(sessionId, ui);
}