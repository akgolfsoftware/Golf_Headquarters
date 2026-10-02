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
  ref: { uke?: string; maned?: string; aar?: string; periode?: string; okt?: string },
  surface: WorkbenchSurface = "agency",
): string {
  const q = new URLSearchParams();
  const niva = visning === "aar" ? "ar" : visning === "maned" ? "maned" : visning === "vol" ? "volum" : visning === "mal" ? "malsetninger" : visning;
  q.set("niva", niva);
  if ((visning === "uke" || visning === "vol" || visning === "mal" || visning === "min" || visning === "okt" || visning === "stall" || visning === "live") && ref.uke) {
    q.set("uke", ref.uke);
  }
  if ((visning === "okt" || visning === "stall") && ref.okt) q.set("okt", ref.okt);
  if (visning === "maned" && ref.maned) q.set("maned", ref.maned);
  if ((visning === "aar" || visning === "periode") && ref.aar) q.set("aar", ref.aar);
  if (visning === "periode" && ref.periode) q.set("periode", ref.periode);
  const qs = q.toString();
  const path = surface === "player" ? "/portal/planlegge/workbench" : `/admin/workbench/${playerId}`;
  return `${path}${qs ? `?${qs}` : ""}`;
}
