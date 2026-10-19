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

/**
 * Coachens Workbench viser de fire flatene (Sesongkart · Ukeverksted · Trenerbord · Stats).
 * Spilleren får nivåene År · Periode · Måned · Uke · Målsetninger og aldri de fire flatene
 * (§SPILLERENS WORKBENCH FÅR NIVÅENE, 14.10.2026). Live, egen kalender og målsetninger
 * beholder sine eksisterende handlinger.
 */
export function brukSamletWorkbench(query: PlanQuery, surface: WorkbenchSurface = "agency"): boolean {
  if (surface === "player") return false;
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

/** Spillerens nivå for en gammel `flate=`-lenke: Sesongkart → År, Ukeverksted og Trenerbord → Uke, Stats → Volum. */
const SPILLER_NIVA: Record<WorkbenchFlate, WbVisning> = { sesong: "aar", uke: "uke", bord: "uke", analyse: "vol" };

/**
 * Gamle `flate=`-lenker til spillerens Workbench sendes til riktig nivå, med uke, måned,
 * år, periode og økt beholdt. Et `niva` i lenken vinner over flaten. Null = ingen omdirigering.
 */
export function spillerNivaUrl(query: PlanQuery): string | null {
  const flate = queryVerdi(query, "flate");
  const klassisk = queryVerdi(query, "klassisk");
  if (!flate && !klassisk) return null;
  const raw = queryVerdi(query, "niva") ?? queryVerdi(query, "vis");
  const niva = raw ? parseVisning(raw) : flate && (FLATER as readonly string[]).includes(flate) ? SPILLER_NIVA[flate as WorkbenchFlate] : "uke";
  const ref: PlanReferanse = {};
  for (const key of ["uke", "okt", "maned", "aar", "periode"] as const) {
    const v = queryVerdi(query, key);
    if (v) ref[key] = v;
  }
  const url = workbenchUrl("", niva === "stall" ? "uke" : niva, ref, "player");
  const ekstra = new URLSearchParams();
  for (const key of ["side", "pille"] as const) { const v = queryVerdi(query, key); if (v) ekstra.set(key, v); }
  return ekstra.size ? `${url}&${ekstra.toString()}` : url;
}
