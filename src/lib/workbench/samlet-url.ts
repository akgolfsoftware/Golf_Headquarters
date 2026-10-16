import { queryVerdi, type PlanQuery, type PlanReferanse } from "./plan-kontekst";
import { parseVisning, workbenchUrl, type WbVisning, type WorkbenchSurface } from "./visning-url";
import type { WorkbenchFlate } from "./workbench-samlet-typer";

const FLATER: readonly WorkbenchFlate[] = ["sesong", "uke", "bord", "analyse"];
const NIVAA: Record<WorkbenchFlate, WbVisning> = { sesong: "aar", uke: "uke", bord: "stall", analyse: "vol" };

export function parseWorkbenchFlate(raw?: string, visning: WbVisning = "uke"): WorkbenchFlate {
  if (raw && (FLATER as readonly string[]).includes(raw)) return raw as WorkbenchFlate;
  if (["aar", "periode", "maned"].includes(visning)) return "sesong";
  if (visning === "stall") return "bord";
  if (visning === "vol") return "analyse";
  return "uke";
}

/** Live, egen kalender og målsetninger beholder sine eksisterende handlinger. */
export function brukSamletWorkbench(query: PlanQuery): boolean {
  if (queryVerdi(query, "klassisk") === "1") return false;
  if ((FLATER as readonly string[]).includes(queryVerdi(query, "flate") ?? "")) return true;
  return !["live", "min", "mal"].includes(parseVisning(queryVerdi(query, "niva") ?? queryVerdi(query, "vis")));
}

export function samletWorkbenchUrl(
  playerId: string,
  flate: WorkbenchFlate,
  referanse: PlanReferanse,
  surface: WorkbenchSurface = "agency",
  kontekst: PlanReferanse = {},
  options: { niva?: WbVisning; side?: string } = {},
): string {
  const [path, rawQuery] = workbenchUrl(playerId, options.niva ?? NIVAA[flate], referanse, surface, kontekst).split("?");
  const query = new URLSearchParams(rawQuery);
  query.set("flate", flate);
  if (options.side) query.set("side", options.side);
  return `${path}?${query.toString()}`;
}

/** En annen spiller har egne periode-/økt-ID-er; kalenderkonteksten beholdes. */
export function samletSpillerUrl(
  playerId: string, flate: WorkbenchFlate, referanse: PlanReferanse,
  surface: WorkbenchSurface = "agency",
): string {
  const { periode: _periode, okt: _okt, ...kalender } = referanse;
  return samletWorkbenchUrl(playerId, flate, kalender, surface);
}

export function klassiskWorkbenchUrl(
  playerId: string, visning: WbVisning, referanse: PlanReferanse,
  surface: WorkbenchSurface = "agency",
): string {
  return `${workbenchUrl(playerId, visning, referanse, surface)}&klassisk=1`;
}
