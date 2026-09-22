/**
 * Teknisk utvikling i Workbench — typer og filtre. Ingen databasetilgang, så
 * både biblioteks-panelet (klient) og henteren (server) kan bruke dem.
 *
 * Filtrene er visning, aldri en regel: en oppgave uten mål er like gyldig som
 * en med, jf. 18.08-beslutningen om at ingen treningsregler håndheves.
 */

import {
  MOTORIKK_LABEL,
  MAALEUTSTYR_LABEL,
  DIMENSJON_LABEL,
  type OmraadeKode,
  type MotorikkKode,
  type MaaleutstyrKode,
  type DimensjonKode,
} from "@/lib/domain/ak-formel-v2";

export type TekniskPanelOppgave = {
  id: string;
  planId: string;
  tittel: string;
  /** «P4.0» — hoved- eller mellomposisjon. */
  pNummer: string;
  pNavn: string;
  /** Hoved-P-en oppgaven grupperes under. */
  pHoved: string;
  hovedfokus: boolean;
  /** Fritekst-slaget, f.eks. «7-jern lav fade». Null når det ikke er satt. */
  slagNavn: string | null;
  omraadeKode: OmraadeKode | null;
  /** «Putt 5–10 fot (1,5–3 m)» — fasitens visning. */
  omraadeLabel: string;
  koller: string[];
  motorikk: MotorikkKode | null;
  dimensjon: DimensjonKode | null;
  maaleutstyr: MaaleutstyrKode | null;
  pyramide: string;
  /** Restmål: hva som mangler for å nå rep-målet, per læringssteg. */
  restUtenBall: number;
  restLavFart: number;
  restAuto: number;
  /** Summen av de tre. 0 = målet er nådd (eller ikke satt). */
  restTotalt: number;
  /** Enheten mengden måles i — «SLAG», «PUTTER» osv. */
  repsEnhet: string | null;
  /** Kort linje for kortet: «7-jern · Innspill 150–200 m · Lav hastighet». */
  undertekst: string;
};

export type TekniskPanelData = {
  planId: string;
  planNavn: string;
  oppgaver: TekniskPanelOppgave[];
  /** Verdiene som faktisk finnes i planen — fyller filtrene uten døde valg. */
  filtre: {
    slag: string[];
    koller: string[];
    omraader: { kode: OmraadeKode; label: string }[];
  };
};

/** Kort undertekst: slag, lengde og læringssteg — det coachen trenger for å velge. */
export function byggUndertekst(o: {
  slagNavn: string | null;
  koller: string[];
  omraadeLabel: string;
  motorikk: MotorikkKode | null;
}): string {
  const deler: string[] = [];
  if (o.slagNavn) deler.push(o.slagNavn);
  else if (o.koller.length === 1) deler.push(o.koller[0]);
  else if (o.koller.length > 1) deler.push(`${o.koller.length} køller`);
  deler.push(o.omraadeLabel);
  if (o.motorikk) deler.push(MOTORIKK_LABEL[o.motorikk]);
  return deler.join(" · ");
}

export type TekniskPanelFilter = {
  sok?: string;
  slag?: string | null;
  kolle?: string | null;
  omraade?: OmraadeKode | null;
  /** Bare oppgaver med gjenstående arbeid. */
  kunRest?: boolean;
};

/** Filtrering i klienten — samme regler uansett hvem som spør. */
export function filtrerTekniskePanelOppgaver(
  oppgaver: readonly TekniskPanelOppgave[],
  f: TekniskPanelFilter,
): TekniskPanelOppgave[] {
  const q = f.sok?.trim().toLowerCase() ?? "";
  return oppgaver.filter((o) => {
    if (q) {
      const heystakk = `${o.tittel} ${o.undertekst} ${o.pNummer} ${o.pNavn}`.toLowerCase();
      if (!heystakk.includes(q)) return false;
    }
    if (f.slag && o.slagNavn !== f.slag) return false;
    if (f.kolle && !o.koller.includes(f.kolle)) return false;
    if (f.omraade && o.omraadeKode !== f.omraade) return false;
    if (f.kunRest && o.restTotalt === 0) return false;
    return true;
  });
}

/**
 * Serverens grense for planlagte reps per læringstrinn (OktDrillSchema:
 * `planReps*` maks 2000). Et restmål over dette må klemmes, ellers avvises
 * hele økta med en valideringsfeil coachen ikke kan gjøre noe med.
 */
export const MAKS_PLAN_REPS = 2000;

export type TekniskDrillForslag = {
  navn: string;
  nivaa: "uten" | "lav" | "vanlig";
  planRepsUtenBall: number | null;
  planRepsLavFart: number | null;
  planRepsAuto: number | null;
  nyPyramidArea: string;
  nyOmraade: string;
  nyBeskrivelse?: string;
  positionTaskId: string;
  positionTaskTittel: string;
};

const PYRAMIDER = ["FYS", "TEK", "SLAG", "SPILL", "TURN"] as const;

/**
 * Teknisk oppgave → drill-forslag for Ny økt. Restmålet er et FORSLAG coachen
 * kan overskrive, ikke et krav (ingen treningsregel håndheves, 18.08).
 *
 * Læringssteget på oppgaven bestemmer hvilket trinn økta starter på. Område og
 * pyramide faller tilbake på trygge verdier når oppgaven mangler dem.
 */
export function tekniskOppgaveTilDrill(o: TekniskPanelOppgave): TekniskDrillForslag {
  const klem = (n: number) => (n > 0 ? Math.min(n, MAKS_PLAN_REPS) : null);
  return {
    navn: o.tittel,
    nivaa: o.motorikk === "UTEN_BALL" ? "uten" : o.motorikk === "LAV_HAST" ? "lav" : "vanlig",
    planRepsUtenBall: klem(o.restUtenBall),
    planRepsLavFart: klem(o.restLavFart),
    planRepsAuto: klem(o.restAuto),
    nyPyramidArea: (PYRAMIDER as readonly string[]).includes(o.pyramide) ? o.pyramide : "TEK",
    // Serveren tar maks 80 tegn på område.
    nyOmraade: o.omraadeLabel.slice(0, 80),
    nyBeskrivelse: o.slagNavn ? `Slag: ${o.slagNavn}` : undefined,
    positionTaskId: o.id,
    positionTaskTittel: o.tittel,
  };
}

/** Etikett for teknisk fokus og måleutstyr på kortet. Tom streng når ikke satt. */
export function merkelapper(o: TekniskPanelOppgave): string[] {
  const ut: string[] = [];
  if (o.dimensjon) ut.push(DIMENSJON_LABEL[o.dimensjon]);
  if (o.maaleutstyr) ut.push(MAALEUTSTYR_LABEL[o.maaleutstyr]);
  return ut;
}
