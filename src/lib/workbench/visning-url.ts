import type { PlanReferanse } from "./plan-kontekst";

/**
 * URL-er for Workbench-pills. Spilleren ligger i stien, visningen i query.
 */

export type WbVisning =
  | "aar"
  | "periode"
  | "maned"
  | "uke"
  | "okt"
  | "vol"
  | "mal"
  | "stall"
  | "live"
  | "min";

const ALLE: readonly WbVisning[] = [
  "aar",
  "periode",
  "maned",
  "uke",
  "okt",
  "vol",
  "mal",
  "stall",
  "live",
  "min",
];

export function parseVisning(raw: string | undefined): WbVisning {
  if (raw === "ar") return "aar";
  if (raw === "mnd") return "maned";
  if (raw === "volum") return "vol";
  if (raw === "malsetninger") return "mal";
  if (raw && (ALLE as readonly string[]).includes(raw)) return raw as WbVisning;
  return "uke";
}

export type WorkbenchSurface = "agency" | "player";

export function workbenchUrl(
  playerId: string,
  visning: WbVisning,
  ref: PlanReferanse,
  surface: WorkbenchSurface = "agency",
  kontekst: PlanReferanse = {},
): string {
  const q = new URLSearchParams();
  const niva = visning === "aar" ? "ar" : visning === "maned" ? "maned" : visning === "vol" ? "volum" : visning === "mal" ? "malsetninger" : visning;
  q.set("niva", niva);
  // Visningen bestemmer skjermen, ikke hvilke valg som skal glemmes.
  const valgt = { ...kontekst, ...ref };
  for (const key of ["uke", "okt", "maned", "aar", "periode"] as const) {
    if (valgt[key]) q.set(key, valgt[key]);
  }
  const qs = q.toString();
  const path = surface === "player" ? "/portal/planlegge/workbench" : `/admin/workbench/${playerId}`;
  return `${path}${qs ? `?${qs}` : ""}`;
}
