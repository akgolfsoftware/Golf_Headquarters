/**
 * Kilde: AK Golf Precision Athletics PH-15 (Test: gjennomfør i nattmodus / fokus).
 * Hjelpefunksjoner og logikk for testgjennomføring i PlayerHQ.
 */

import type { ScorekortSpec } from "./protocol";

export type PH15TestModus = "distance" | "hit_miss" | "points";

export interface PH15TestOppsett {
  antallSlag: number;
  modus: PH15TestModus;
  grenseM?: number;
  enhet: string;
  stepperVerdier: number[];
  standardInndataVerdi: number;
}

/** Formaterer tall til norsk visning («3,5», «10», etc.) */
export function formaterNorskDesimal(val: number | null | undefined, maksDesimaler = 1): string {
  if (val == null || !Number.isFinite(val)) return "—";
  return new Intl.NumberFormat("nb-NO", {
    minimumFractionDigits: 0,
    maximumFractionDigits: maksDesimaler,
  }).format(val);
}

/** Analyserer protokoll-spec for å bestemme testoppsett og inndatamodus. */
export function utledPH15Oppsett(spec: ScorekortSpec, _scoringRule?: string): PH15TestOppsett {
  const antallSlag = spec.forsok.length > 0 ? spec.forsok.length : 10;
  const forsteFelt = spec.forsok[0]?.felter[0];

  // Sjekk om testen er boolean treff/bom
  if (forsteFelt?.type === "checkbox") {
    return {
      antallSlag,
      modus: "hit_miss",
      enhet: "treff",
      stepperVerdier: [],
      standardInndataVerdi: 1,
    };
  }

  // Sjekk enhet for avstandsmåling (meter / fot)
  const feltEnhet = forsteFelt?.unit?.toLowerCase() || spec.unit?.toLowerCase() || "m";
  const erAvstand = forsteFelt?.type === "meter" || feltEnhet === "m" || feltEnhet === "fot" || feltEnhet === "meter";

  if (erAvstand) {
    const erFot = feltEnhet === "fot";
    // Målgrense: standard 4 meter i PH-15 fasit (innspill)
    const grenseM = 4;
    return {
      antallSlag,
      modus: "distance",
      grenseM,
      enhet: erFot ? "fot" : "m",
      stepperVerdier: erFot ? [-1, -0.5, 0.5, 1] : [-1, -0.5, 0.5, 1],
      standardInndataVerdi: 3.5,
    };
  }

  // Poeng eller generelle tall
  return {
    antallSlag,
    modus: "points",
    enhet: feltEnhet || "poeng",
    stepperVerdier: [-5, -1, 1, 5],
    standardInndataVerdi: 1,
  };
}

export interface PH15Statistikk {
  antallFort: number;
  erFerdig: boolean;
  snittVerdi: number | null;
  antallInnenforGrense: number;
  prosentInnenfor: number;
}

/** Beregner samlet statistikk for gjennomførte slag. */
export function beregnPH15Statistikk(
  slagVerdier: (number | boolean | null)[],
  grenseM = 4,
  modus: PH15TestModus = "distance",
): PH15Statistikk {
  const gyldigeVerdier = slagVerdier.filter((v): v is number | boolean => v !== null && v !== undefined);
  const antallFort = gyldigeVerdier.length;

  if (antallFort === 0) {
    return {
      antallFort: 0,
      erFerdig: false,
      snittVerdi: null,
      antallInnenforGrense: 0,
      prosentInnenfor: 0,
    };
  }

  let antallInnenforGrense = 0;
  let sumTall = 0;
  let antallTall = 0;

  for (const v of gyldigeVerdier) {
    if (typeof v === "boolean") {
      if (v) antallInnenforGrense++;
    } else if (typeof v === "number") {
      sumTall += v;
      antallTall++;
      if (modus === "distance" && v <= grenseM) {
        antallInnenforGrense++;
      } else if (modus === "points" && v > 0) {
        antallInnenforGrense++;
      }
    }
  }

  const snittVerdi = antallTall > 0 ? sumTall / antallTall : null;
  const prosentInnenfor = Math.round((antallInnenforGrense / antallFort) * 100);

  return {
    antallFort,
    erFerdig: false, // styres av totalt antall i kallet
    snittVerdi,
    antallInnenforGrense,
    prosentInnenfor,
  };
}

/** Justerer stepper-verdi med hensyn til min/max og desimalavrunding. */
export function justerStepperVerdi(gjeldende: number, delta: number, minVerdi = 0, maksVerdi = 100): number {
  const nyVerdi = Math.round((gjeldende + delta) * 10) / 10;
  return Math.min(maksVerdi, Math.max(minVerdi, nyVerdi));
}
