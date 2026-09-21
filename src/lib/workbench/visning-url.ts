/**
 * URL-er for Workbench-pills. Spilleren ligger i stien, visningen i query.
 */

export type WbVisning =
  | "aar"
  | "periode"
  | "maned"
  | "uke"
  | "okt"
  | "stall"
  | "live"
  | "min";

const ALLE: readonly WbVisning[] = [
  "aar",
  "periode",
  "maned",
  "uke",
  "okt",
  "stall",
  "live",
  "min",
];

export function parseVisning(raw: string | undefined): WbVisning {
  if (raw && (ALLE as readonly string[]).includes(raw)) return raw as WbVisning;
  return "uke";
}

export function workbenchUrl(
  playerId: string,
  visning: WbVisning,
  ref: { uke?: string; maned?: string; aar?: string; periode?: string; okt?: string },
): string {
  const q = new URLSearchParams();
  if (visning !== "uke") q.set("vis", visning);
  if ((visning === "uke" || visning === "min" || visning === "okt" || visning === "stall" || visning === "live") && ref.uke) {
    q.set("uke", ref.uke);
  }
  if ((visning === "okt" || visning === "stall") && ref.okt) q.set("okt", ref.okt);
  if (visning === "maned" && ref.maned) q.set("maned", ref.maned);
  if ((visning === "aar" || visning === "periode") && ref.aar) q.set("aar", ref.aar);
  if (visning === "periode" && ref.periode) q.set("periode", ref.periode);
  const qs = q.toString();
  return `/admin/workbench/${playerId}${qs ? `?${qs}` : ""}`;
}
