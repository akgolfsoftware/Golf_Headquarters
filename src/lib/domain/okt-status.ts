/**
 * Øktstatus, avbruddsårsak og etterlevelse.
 *
 * Anders 20.08: økter kan avlyses med årsak (syk, skade, reise, vær), og da
 * holdes de utenfor plan-mot-faktisk-analysen. «Hva er årsaken?» er selve
 * datapunktet — også når en økt slettes eller hoppes over.
 *
 * Uten dette blir en sykeuke stående som «0 % gjennomført», og etterlevelsen —
 * som er selve salgsargumentet — forurenses av avvik som ikke er avvik.
 *
 * Merk: etterlevelse BESKRIVER. «Planlagt 4, gjennomført 2» er en observasjon,
 * ikke en dom, og ingenting her sperrer noe (18.08).
 */

import type { OktAvbruddAarsak, SessionStatusV2 } from "@/generated/prisma/client";

export const AVBRUDD_LABEL: Record<OktAvbruddAarsak, string> = {
  SYK: "Syk",
  SKADE: "Skade",
  REISE: "Reise",
  VAER: "Vær",
  ANNET: "Annet",
};

export type OktTelling = {
  status: SessionStatusV2;
  avbruddAarsak: OktAvbruddAarsak | null;
};

/**
 * Teller denne økta med i etterlevelsen?
 *
 * AVLYST med årsak vises i kalenderen, men telles aldri som avvik. Hoppet over
 * UTEN årsak er derimot et ekte avvik — det er nettopp forskjellen analysen
 * skal kunne se.
 */
export function tellerIEtterlevelse(okt: OktTelling): boolean {
  if (okt.status === "CANCELLED") return false;
  if (okt.status === "SKIPPED" && okt.avbruddAarsak !== null) return false;
  return true;
}

export type EtterlevelseSum = {
  /** Økter som teller med — nevneren. */
  planlagt: number;
  gjennomfort: number;
  /** Hoppet over uten årsak: ekte avvik. */
  utenAarsak: number;
  /** Avlyst/hoppet over med årsak: holdt utenfor, men vist. */
  medAarsak: number;
  /** 0–1, eller null når ingenting kvalifiserer (aldri 0 % av ingenting). */
  andel: number | null;
};

export function sumEtterlevelse(okter: readonly OktTelling[]): EtterlevelseSum {
  let planlagt = 0;
  let gjennomfort = 0;
  let utenAarsak = 0;
  let medAarsak = 0;

  for (const okt of okter) {
    if (!tellerIEtterlevelse(okt)) {
      medAarsak += 1;
      continue;
    }
    planlagt += 1;
    if (okt.status === "COMPLETED") gjennomfort += 1;
    else if (okt.status === "SKIPPED") utenAarsak += 1;
  }

  return {
    planlagt,
    gjennomfort,
    utenAarsak,
    medAarsak,
    andel: planlagt > 0 ? gjennomfort / planlagt : null,
  };
}

// ---------------------------------------------------------------------------
// Selvvurdering
// ---------------------------------------------------------------------------

export type Vurdering = {
  fokus: number | null;
  gjennomforing: number | null;
  mestring: number | null;
};

export const VURDERING_LABEL = {
  fokus: "Fokus",
  gjennomforing: "Gjennomføring",
  mestring: "Mestring",
} as const;

export const VURDERING_SPORSMAL = {
  fokus: "Hvor til stede var du mentalt?",
  gjennomforing: "Hvor godt fikk du gjort det planlagte?",
  mestring: "Fikk du til det du jobbet med?",
} as const;

export type VurderingSnitt = {
  snitt: number | null;
  /** Andel økter som faktisk har svar, 0–1. Vises ved siden av snittet. */
  svarandel: number;
  antallSvar: number;
  antallOkter: number;
};

/**
 * Snitt for én vurderingsakse. Tomt er tomt — aldri 3 (spec 20.08). Derfor
 * følger svarandelen alltid med: et 4,8-snitt fra to av tolv økter betyr noe
 * annet enn 4,8 fra tolv.
 */
export function vurderingSnitt(
  vurderinger: readonly Vurdering[],
  akse: keyof Vurdering,
): VurderingSnitt {
  const svar = vurderinger.map((v) => v[akse]).filter((n): n is number => typeof n === "number");
  const antallOkter = vurderinger.length;
  return {
    snitt: svar.length > 0 ? svar.reduce((a, b) => a + b, 0) / svar.length : null,
    svarandel: antallOkter > 0 ? svar.length / antallOkter : 0,
    antallSvar: svar.length,
    antallOkter,
  };
}

/** 1–5, eller null. Verdier utenfor skalaen forkastes fremfor å klippes. */
export function gyldigStjerne(verdi: unknown): number | null {
  if (typeof verdi !== "number" || !Number.isInteger(verdi)) return null;
  return verdi >= 1 && verdi <= 5 ? verdi : null;
}
