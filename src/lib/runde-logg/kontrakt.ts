/**
 * Runde/SG-kontrakt.
 *
 * Dette er den kodebaserte versjonen av datakravene fra PH-RD-designpakken:
 * status, kilde og datakvalitet skal avledes likt i lagring, visning og senere
 * AgencyOS-analyse. Verdiene lagres på Round for nye endringer, men kan også
 * avledes for eldre runder som mangler metadata.
 */

import type { Prisma } from "@/generated/prisma/client";

export const RUNDE_TYPER = ["turnering", "trening"] as const;
export type RundeType = (typeof RUNDE_TYPER)[number];

export const RUNDE_SG_KILDE = {
  MANUAL: "manual",
  BEREGNET: "beregnet",
  ESTIMERT: "estimert",
} as const;
export const RUNDE_SG_KILDER = Object.values(RUNDE_SG_KILDE);
export type RundeSgKilde = (typeof RUNDE_SG_KILDER)[number];

export const RUNDE_KILDER = [
  "live",
  "etterregistrering",
  "upgame_csv",
  "annen_app",
  "manuell",
  "ukjent",
] as const;
export type RundeKilde = (typeof RUNDE_KILDER)[number];

export const RUNDE_STATUSER = [
  "kladd",
  "delvis",
  "komplett",
  "importert",
  "manuell_sg",
] as const;
export type RundeStatus = (typeof RUNDE_STATUSER)[number];

export const RUNDE_DATAKVALITETER = [
  "total_only",
  "hullscore",
  "hullscore_detaljer",
  "slag_for_slag_komplett",
  "manuell_sg",
] as const;
export type RundeDataQuality = (typeof RUNDE_DATAKVALITETER)[number];

export const RUNDE_STATUS_META: Record<RundeStatus, { label: string; forklaring: string }> = {
  kladd: {
    label: "Kladd",
    forklaring: "Runden er bare lagret lokalt eller ufullstendig.",
  },
  delvis: {
    label: "Delvis",
    forklaring: "Runden har scoredata, men ikke komplett SG-grunnlag.",
  },
  komplett: {
    label: "Komplett",
    forklaring: "Runden har komplett slag-for-slag-kjede.",
  },
  importert: {
    label: "Importert",
    forklaring: "Runden kommer fra import eller annen app.",
  },
  manuell_sg: {
    label: "Manuell SG",
    forklaring: "SG-tallene er lagt inn manuelt og overskrives ikke automatisk.",
  },
};

export const RUNDE_DATAQUALITY_META: Record<RundeDataQuality, { label: string; forklaring: string }> = {
  total_only: {
    label: "Kun totalscore",
    forklaring: "Gir brutto score og historikk, men ikke beregnet SG.",
  },
  hullscore: {
    label: "Scorekort",
    forklaring: "Gir hullscore og enkel statistikk, men ikke beregnet SG.",
  },
  hullscore_detaljer: {
    label: "Scorekort med detaljer",
    forklaring: "Gir score, putter/FW/GIR der det finnes, men ikke beregnet SG.",
  },
  slag_for_slag_komplett: {
    label: "Slag-for-slag komplett",
    forklaring: "Gir beregnet SG og hullanalyse.",
  },
  manuell_sg: {
    label: "Manuell eller importert SG",
    forklaring: "Gir SG med kilde, men ikke beregnet fra slagkjeden.",
  },
};

export const RUNDE_KILDE_META: Record<RundeKilde, { label: string }> = {
  live: { label: "Live føring" },
  etterregistrering: { label: "Etterregistrering" },
  upgame_csv: { label: "UpGame CSV" },
  annen_app: { label: "Annen app" },
  manuell: { label: "Manuell" },
  ukjent: { label: "Ukjent kilde" },
};

export type RundeKontraktHoleScore = {
  holeNumber: number;
  strokes: number;
  putts?: number | null;
  fairway?: boolean | null;
  gir?: boolean | null;
};

export type RundeKontraktShot = {
  holeNumber: number;
  distanceToPin: number | null;
  isPenalty: boolean;
};

export type AvledRundeRegistreringInput = {
  sgSource: string | null;
  holeScores: ReadonlyArray<RundeKontraktHoleScore>;
  shots: ReadonlyArray<RundeKontraktShot>;
  kilde?: RundeKilde | null;
  erKladd?: boolean;
};

export type RundeRegistreringStatus = {
  status: RundeStatus;
  dataQuality: RundeDataQuality;
  kilde: RundeKilde;
  sgKilde: RundeSgKilde | null;
  antallHullMedScore: number;
  antallKompletteHull: number;
  manglerForBeregnetSg: string[];
  kanBeregneSg: boolean;
  beskytterManuellSg: boolean;
};

export type RundeRegistreringFelter = {
  source: RundeKilde;
  sourceDate: Date;
  dataQuality: RundeDataQuality;
  status: RundeStatus;
  partialSave: boolean;
  importMetadata?: Prisma.InputJsonValue;
};

export function lesRundeSgKilde(value: string | null | undefined): RundeSgKilde | null {
  if (!value) return null;
  return RUNDE_SG_KILDER.includes(value as RundeSgKilde) ? (value as RundeSgKilde) : null;
}

export function lesRundeKilde(value: string | null | undefined): RundeKilde | null {
  if (!value) return null;
  return RUNDE_KILDER.includes(value as RundeKilde) ? (value as RundeKilde) : null;
}

export function lesRundeStatus(value: string | null | undefined): RundeStatus | null {
  if (!value) return null;
  return RUNDE_STATUSER.includes(value as RundeStatus) ? (value as RundeStatus) : null;
}

export function lesRundeDataQuality(value: string | null | undefined): RundeDataQuality | null {
  if (!value) return null;
  return RUNDE_DATAKVALITETER.includes(value as RundeDataQuality) ? (value as RundeDataQuality) : null;
}

export function erKomplettSlagKjede(
  holeScores: ReadonlyArray<RundeKontraktHoleScore>,
  shots: ReadonlyArray<RundeKontraktShot>,
): { komplett: boolean; antallKompletteHull: number; mangler: string[] } {
  if (holeScores.length === 0) {
    return { komplett: false, antallKompletteHull: 0, mangler: ["scorekort"] };
  }
  if (shots.length === 0) {
    return { komplett: false, antallKompletteHull: 0, mangler: ["slag-for-slag"] };
  }

  const slagPerHull = new Map<number, RundeKontraktShot[]>();
  for (const shot of shots) {
    const liste = slagPerHull.get(shot.holeNumber) ?? [];
    liste.push(shot);
    slagPerHull.set(shot.holeNumber, liste);
  }

  let antallKompletteHull = 0;
  const mangler = new Set<string>();
  const hullMedScore = new Set(holeScores.map((h) => h.holeNumber));

  for (const h of holeScores) {
    const slag = slagPerHull.get(h.holeNumber) ?? [];
    const straffer = slag.filter((s) => s.isPenalty).length;
    const harAvstander = slag.every((s) => s.distanceToPin != null && s.distanceToPin > 0);
    if (slag.length > 0 && harAvstander && slag.length + straffer === h.strokes) {
      antallKompletteHull += 1;
    } else {
      if (slag.length === 0) mangler.add(`slag hull ${h.holeNumber}`);
      if (!harAvstander) mangler.add(`avstand hull ${h.holeNumber}`);
      if (slag.length > 0 && slag.length + straffer !== h.strokes) {
        mangler.add(`score/slag hull ${h.holeNumber}`);
      }
    }
  }

  for (const hullNr of slagPerHull.keys()) {
    if (!hullMedScore.has(hullNr)) mangler.add(`scorekort hull ${hullNr}`);
  }

  return {
    komplett: antallKompletteHull === holeScores.length && mangler.size === 0,
    antallKompletteHull,
    mangler: [...mangler],
  };
}

export function avledRundeRegistrering(
  input: AvledRundeRegistreringInput,
): RundeRegistreringStatus {
  const sgKilde = lesRundeSgKilde(input.sgSource);
  const kjede = erKomplettSlagKjede(input.holeScores, input.shots);
  const harHullDetaljer = input.holeScores.some(
    (h) => h.putts != null || h.fairway != null || h.gir != null,
  );
  const kilde = input.kilde ?? avledKilde(sgKilde, input.holeScores.length, input.shots.length);
  const beskytterManuellSg = sgKilde === RUNDE_SG_KILDE.MANUAL;

  if (input.erKladd) {
    return {
      status: "kladd",
      dataQuality: input.holeScores.length > 0 ? "hullscore" : "total_only",
      kilde,
      sgKilde,
      antallHullMedScore: input.holeScores.length,
      antallKompletteHull: kjede.antallKompletteHull,
      manglerForBeregnetSg: kjede.mangler,
      kanBeregneSg: false,
      beskytterManuellSg,
    };
  }

  if (beskytterManuellSg) {
    return {
      status: "manuell_sg",
      dataQuality: "manuell_sg",
      kilde: kilde === "ukjent" ? "manuell" : kilde,
      sgKilde,
      antallHullMedScore: input.holeScores.length,
      antallKompletteHull: kjede.antallKompletteHull,
      manglerForBeregnetSg: kjede.komplett ? [] : kjede.mangler,
      kanBeregneSg: kjede.komplett,
      beskytterManuellSg,
    };
  }

  if (sgKilde === RUNDE_SG_KILDE.ESTIMERT) {
    const dataQuality =
      input.holeScores.length === 0
        ? "total_only"
        : harHullDetaljer
          ? "hullscore_detaljer"
          : "hullscore";
    return {
      status: "delvis",
      dataQuality,
      kilde,
      sgKilde,
      antallHullMedScore: input.holeScores.length,
      antallKompletteHull: kjede.antallKompletteHull,
      manglerForBeregnetSg: kjede.komplett ? [] : kjede.mangler,
      kanBeregneSg: false,
      beskytterManuellSg: false,
    };
  }

  if (kjede.komplett) {
    return {
      status: "komplett",
      dataQuality: "slag_for_slag_komplett",
      kilde,
      sgKilde,
      antallHullMedScore: input.holeScores.length,
      antallKompletteHull: kjede.antallKompletteHull,
      manglerForBeregnetSg: [],
      kanBeregneSg: true,
      beskytterManuellSg: false,
    };
  }

  const dataQuality =
    input.holeScores.length === 0
      ? "total_only"
      : harHullDetaljer
        ? "hullscore_detaljer"
        : "hullscore";

  return {
    status: kilde === "upgame_csv" || kilde === "annen_app" ? "importert" : "delvis",
    dataQuality,
    kilde,
    sgKilde,
    antallHullMedScore: input.holeScores.length,
    antallKompletteHull: kjede.antallKompletteHull,
    manglerForBeregnetSg: kjede.mangler,
    kanBeregneSg: false,
    beskytterManuellSg: false,
  };
}

export function rundeRegistreringFelter(
  registrering: RundeRegistreringStatus,
  options?: {
    sourceDate?: Date;
    partialSave?: boolean;
    importMetadata?: Prisma.InputJsonValue;
  },
): RundeRegistreringFelter {
  return {
    source: registrering.kilde,
    sourceDate: options?.sourceDate ?? new Date(),
    dataQuality: registrering.dataQuality,
    status: registrering.status,
    partialSave: options?.partialSave ?? registrering.status === "kladd",
    ...(options && "importMetadata" in options
      ? { importMetadata: options.importMetadata }
      : {}),
  };
}

function avledKilde(
  sgKilde: RundeSgKilde | null,
  antallHullMedScore: number,
  antallSlag: number,
): RundeKilde {
  if (sgKilde === RUNDE_SG_KILDE.MANUAL) return "manuell";
  if (antallSlag > 0) return "live";
  if (antallHullMedScore > 0) return "etterregistrering";
  return "etterregistrering";
}
