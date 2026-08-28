/**
 * AgenticOS godkjenningspolicy A3 · B1 · C3 (C7 / AO-12).
 *
 * A3: start-godkjenning når runtime er sky, area er ØKONOMI/PERSONLIG/DRIFT,
 *     eller writeTargets ≠ none.
 * B1: Godkjenn er hvit primær — ok-grønn finnes ikke i AgenticOS (UI-regel).
 * C3: research uten skriv går aldri i godkjenn-køen; den lander som
 *     Cockpit-badge.
 *
 * Agent skriver aldri uten godkjenning. Ingen direkte Workbench-write.
 * J-A og J-B er hoppet (krever Anders).
 */

export type AgenticosRuntime = "sky" | "lokal";

export type AgenticosArea = "OKONOMI" | "PERSONLIG" | "DRIFT" | "SPORT" | "ANNET";

export type AgenticosSkriv = "none" | "note" | "workbench" | "mail";

export type AgenticosOppgave = {
  runtime: AgenticosRuntime;
  area: AgenticosArea;
  writeTargets: AgenticosSkriv;
  kind: "research" | "handling";
};

export type AgenticosRute = "GODKJENN_START" | "COCKPIT_BADGE" | "DIREKTE_FORBUDT";

const SENSITIVE_AREA: ReadonlySet<AgenticosArea> = new Set(["OKONOMI", "PERSONLIG", "DRIFT"]);

/** B1: `#30D158` er forbudt i AgenticOS. Warm hake, aldri ok-grønn. */
export const AGENTICOS_FORBYR_OK_GRONN = true;

export function kreverStartGodkjenning(o: AgenticosOppgave): boolean {
  if (o.writeTargets === "none" && o.kind === "research") return false; // C3
  return o.runtime === "sky" || SENSITIVE_AREA.has(o.area) || o.writeTargets !== "none";
}

export function ruteForOppgave(o: AgenticosOppgave): AgenticosRute {
  if (o.writeTargets === "workbench") return "DIREKTE_FORBUDT";
  if (o.writeTargets === "none" && o.kind === "research") return "COCKPIT_BADGE";
  if (kreverStartGodkjenning(o)) return "GODKJENN_START";
  return "COCKPIT_BADGE";
}
