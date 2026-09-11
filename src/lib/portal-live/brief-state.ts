/** Visningsvalg, aldri en erstatning for serverens tilgangs- og statuskontroll. */
export type BriefBlockReason = "completed" | "tier" | "coach" | "approval" | null;
export type BriefAction = { kind: "start" | "continue" | "summary" | "blocked"; label: string; message: string | null };

export function briefAction(status: string, canStart: boolean, reason: BriefBlockReason): BriefAction {
  if (status === "COMPLETED" || reason === "completed") return { kind: "summary", label: "Se oppsummering", message: "Økta er fullført." };
  if (["CANCELLED", "SKIPPED", "ABANDONED", "DRAFT"].includes(status)) return { kind: "blocked", label: "Tilbake til Plan", message: status === "SKIPPED" ? "Økta er hoppet over." : status === "ABANDONED" ? "Økta er avbrutt." : status === "DRAFT" ? "Økta er ikke publisert." : "Økta er avlyst." };
  if (!canStart) return { kind: "blocked", label: reason === "tier" ? "Se abonnement" : "Tilbake til Plan", message: reason === "tier" ? "Live krever PRO." : reason === "approval" ? "Svar på forslaget i Plan før du starter." : "Bare spilleren kan starte denne økta." };
  if (["ACTIVE", "PAUSED", "IN_PROGRESS"].includes(status)) return { kind: "continue", label: "Fortsett økta", message: status === "PAUSED" ? "Økta er satt på pause." : "Økta er allerede startet." };
  return { kind: "start", label: "Start økta", message: null };
}
