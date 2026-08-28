/**
 * URL-er for Workbench Uke / Måned / År. Spilleren ligger i stien,
 * visningen i query — bytte visning beholder samme spiller.
 */

export type WbVisning = "uke" | "maned" | "aar";

export function parseVisning(raw: string | undefined): WbVisning {
  if (raw === "maned" || raw === "aar") return raw;
  return "uke";
}

export function workbenchUrl(
  playerId: string,
  visning: WbVisning,
  ref: { uke?: string; maned?: string; aar?: string },
): string {
  const q = new URLSearchParams();
  if (visning !== "uke") q.set("vis", visning);
  if (visning === "uke" && ref.uke) q.set("uke", ref.uke);
  if (visning === "maned" && ref.maned) q.set("maned", ref.maned);
  if (visning === "aar" && ref.aar) q.set("aar", ref.aar);
  const qs = q.toString();
  return `/admin/workbench/${playerId}${qs ? `?${qs}` : ""}`;
}
