/**
 * Tak-pakke — oversettelse av DataGolf innspill-nærhet til stasjon + sirkel.
 *
 * DataGolf proximity er fot. Vi lagrer og viser innspill i meter.
 * Putting skalerer ikke her — se DG-17.
 */

export const FOT_TIL_METER = 0.3048;
export const YARD_TIL_METER = 0.9144;

export type TakBandKode = "innspill50" | "innspill100" | "innspill150" | "innspill200";
export type TakLie = "fairway" | "rough";

export type TakBandDef = {
  kode: TakBandKode;
  omraade: "INNSPILL_50" | "INNSPILL_100" | "INNSPILL_150" | "INNSPILL_200";
  lie: TakLie;
  minYards: number;
  maxYards: number;
  /** Nøkler i DataGolf /preds/approach-skill. */
  proximityKey: string;
  sgKey: string;
  girKey: string;
  goodKey: string;
  countKey: string;
};

export const TAK_BAND: readonly TakBandDef[] = [
  {
    kode: "innspill50",
    omraade: "INNSPILL_50",
    lie: "fairway",
    minYards: 50,
    maxYards: 100,
    proximityKey: "50_100_fw_proximity_per_shot",
    sgKey: "50_100_fw_sg_per_shot",
    girKey: "50_100_fw_gir_rate",
    goodKey: "50_100_fw_good_shot_rate",
    countKey: "50_100_fw_shot_count",
  },
  {
    kode: "innspill100",
    omraade: "INNSPILL_100",
    lie: "fairway",
    minYards: 100,
    maxYards: 150,
    proximityKey: "100_150_fw_proximity_per_shot",
    sgKey: "100_150_fw_sg_per_shot",
    girKey: "100_150_fw_gir_rate",
    goodKey: "100_150_fw_good_shot_rate",
    countKey: "100_150_fw_shot_count",
  },
  {
    kode: "innspill150",
    omraade: "INNSPILL_150",
    lie: "fairway",
    minYards: 150,
    maxYards: 200,
    proximityKey: "150_200_fw_proximity_per_shot",
    sgKey: "150_200_fw_sg_per_shot",
    girKey: "150_200_fw_gir_rate",
    goodKey: "150_200_fw_good_shot_rate",
    countKey: "150_200_fw_shot_count",
  },
  {
    kode: "innspill200",
    omraade: "INNSPILL_200",
    lie: "fairway",
    minYards: 200,
    maxYards: 250,
    proximityKey: "over_200_fw_proximity_per_shot",
    sgKey: "over_200_fw_sg_per_shot",
    girKey: "over_200_fw_gir_rate",
    goodKey: "over_200_fw_good_shot_rate",
    countKey: "over_200_fw_shot_count",
  },
  {
    kode: "innspill100",
    omraade: "INNSPILL_100",
    lie: "rough",
    minYards: 0,
    maxYards: 150,
    proximityKey: "under_150_rgh_proximity_per_shot",
    sgKey: "under_150_rgh_sg_per_shot",
    girKey: "under_150_rgh_gir_rate",
    goodKey: "under_150_rgh_good_shot_rate",
    countKey: "under_150_rgh_shot_count",
  },
  {
    kode: "innspill150",
    omraade: "INNSPILL_150",
    lie: "rough",
    minYards: 150,
    maxYards: 250,
    proximityKey: "over_150_rgh_proximity_per_shot",
    sgKey: "over_150_rgh_sg_per_shot",
    girKey: "over_150_rgh_gir_rate",
    goodKey: "over_150_rgh_good_shot_rate",
    countKey: "over_150_rgh_shot_count",
  },
];

export function fotTilMeter(fot: number): number {
  return fot * FOT_TIL_METER;
}

export function bandMidtMeter(minYards: number, maxYards: number): number {
  return ((minYards + maxYards) / 2) * YARD_TIL_METER;
}

/**
 * Sirkel eleven må stoppe innenfor for å slå taket.
 * Stasjon = elevens carry. Takets slag = midten av båndet i meter.
 */
export function slaTakSirkelMeter(input: {
  takNaerhetMeter: number;
  elevCarryMeter: number;
  takSlagMeter: number;
}): number | null {
  if (!(input.takNaerhetMeter > 0)) return null;
  if (!(input.elevCarryMeter > 0)) return null;
  if (!(input.takSlagMeter > 0)) return null;
  return (input.takNaerhetMeter * input.elevCarryMeter) / input.takSlagMeter;
}

export function visningsnavnFraDataGolf(raw: string): string {
  const trimmed = raw.trim();
  const komma = trimmed.indexOf(",");
  if (komma <= 0 || komma === trimmed.length - 1) return trimmed;
  const etternavn = trimmed.slice(0, komma).trim();
  const fornavn = trimmed.slice(komma + 1).trim();
  if (!fornavn || !etternavn) return trimmed;
  return `${fornavn} ${etternavn}`;
}

export function rundMeter(n: number, desimaler = 1): number {
  const f = 10 ** desimaler;
  return Math.round(n * f) / f;
}

function num(v: unknown): number | null {
  if (typeof v !== "number" || !Number.isFinite(v)) return null;
  return v;
}

function int(v: unknown): number | null {
  const n = num(v);
  return n === null ? null : Math.round(n);
}

export type TakBandRad = {
  band: TakBandKode;
  lie: TakLie;
  proximityMeters: number | null;
  sgPerShot: number | null;
  girRate: number | null;
  goodShotRate: number | null;
  shotCount: number | null;
};

/** Map én DataGolf approach-skill-rad til tak-bånd. Proximity fot → meter. */
export function bandFraApproachRad(row: Record<string, unknown>): TakBandRad[] {
  return TAK_BAND.map((def) => {
    const proxFot = num(row[def.proximityKey]);
    return {
      band: def.kode,
      lie: def.lie,
      proximityMeters: proxFot === null ? null : fotTilMeter(proxFot),
      sgPerShot: num(row[def.sgKey]),
      girRate: num(row[def.girKey]),
      goodShotRate: num(row[def.goodKey]),
      shotCount: int(row[def.countKey]),
    };
  });
}
