/**
 * PH-RD-03/04 Live runde: slagene slik spilleren fører dem ute (hvor ballen ligger før slaget),
 * gjort om til runde-loggens kjede (hvor ballen havnet etter slaget) som lagreLoggetRunde regner SG fra.
 * Avstand lagres alltid i meter; putter føres i fot og regnes om.
 */
import type { HvileLie, LoggetHull, LoggetSlag, PuttRegistrering } from "@/lib/runde-logg/types";

export const UNDERLAG = ["Tee", "Fairway", "Rough", "Bunker", "Recovery", "Green"] as const;
export type Underlag = (typeof UNDERLAG)[number];

export type LiveSlagInn = {
  /** Hvor ballen lå før slaget. */
  lie: Underlag;
  /** Avstand til hullet før slaget, i meter. */
  avstandM: number;
  kolle: string;
  straff?: boolean;
  /** Bare for putter (lie Green). */
  putt?: PuttRegistrering;
};

export const FOT_PER_METER = 3.28084;
export const fotTilMeter = (fot: number) => Math.max(0.1, Math.round((fot / FOT_PER_METER) * 100) / 100);
export const meterTilFot = (m: number) => Math.round(m * FOT_PER_METER);

const HVILE: Record<Exclude<Underlag, "Tee">, HvileLie> = {
  Fairway: "FAIRWAY", Rough: "ROUGH", Bunker: "BUNKER", Recovery: "TREES", Green: "GREEN",
};

/** Slag på hullet: antall slag pluss straffeslag. */
export function slagPaaHull(slag: LiveSlagInn[]): number {
  return slag.length + slag.filter((s) => s.straff).length;
}

/**
 * Gjør et ferdig hull (siste slag gikk i hull) om til runde-loggens kjede.
 * Første slag må være fra tee. Et senere slag fra «Tee» (ny ball etter straff) lagres som fairway-posisjon.
 */
export function tilLoggetHull(holeNumber: number, par: number, slag: LiveSlagInn[]): LoggetHull {
  if (slag.length === 0) throw new Error(`Hull ${holeNumber}: ingen slag`);
  const ut: LoggetSlag[] = slag.map((s, i) => {
    const neste = slag[i + 1];
    const resultat = neste
      ? { iHull: false as const, lie: neste.lie === "Tee" ? ("FAIRWAY" as const) : HVILE[neste.lie], avstandTilHull: Math.max(0.1, neste.avstandM) }
      : { iHull: true as const };
    return {
      resultat,
      kolle: s.kolle,
      ...(s.straff && neste ? { straffe: true } : {}),
      ...(s.putt ? { putt: s.putt } : {}),
    };
  });
  return { holeNumber, par, lengdeMeter: slag[0].avstandM, slag: ut };
}

/** Til visning av en lagret kjede (kladd): tilbake til «før slaget». */
export function fraLoggetHull(h: LoggetHull): LiveSlagInn[] {
  const FRA: Record<HvileLie, Underlag> = {
    FAIRWAY: "Fairway", SEMI_ROUGH: "Rough", ROUGH: "Rough", DEEP_ROUGH: "Rough", BUNKER: "Bunker", GREEN: "Green", TREES: "Recovery",
  };
  let lie: Underlag = "Tee";
  let avstandM = h.lengdeMeter;
  return h.slag.map((s) => {
    const inn: LiveSlagInn = { lie, avstandM, kolle: s.kolle ?? "—", ...(s.straffe ? { straff: true } : {}), ...(s.putt ? { putt: s.putt } : {}) };
    if (!s.resultat.iHull) { lie = FRA[s.resultat.lie]; avstandM = s.resultat.avstandTilHull; }
    return inn;
  });
}
