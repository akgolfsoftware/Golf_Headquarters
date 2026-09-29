/**
 * Øvelsen i Plan-hub (AG-14): utkastet coachen bygger i åtte trinn, og
 * oversettelsen til og fra ExerciseDefinition. Ren TypeScript, ingen prisma —
 * brukes av både skjemaet (klient) og lasteren (server).
 *
 * De åtte trinnene (docs/treningsplanlegging.md, kap. 9–17): pyramide, område,
 * sted, måleutstyr, gjennomføring (læringssteg, hastighet, treningsmåte,
 * teknisk fokus, sandtrinn), press, mengde og mål.
 *
 * Lagring: aksene som har egne kolonner på ExerciseDefinition (område,
 * motorikk, belastning, press) skrives dit. Resten av trinnene — sted,
 * måleutstyr, treningsmåte, hastighet, teknisk fokus, sandtrinn, mengde og mål
 * — har ingen kolonne og lagres som `akFormelV2.detaljer` inne i
 * `parametersJson`, i samme form som Workbench lagrer dem på økta
 * (`OvelseDetaljerSchema`). Øvrige nøkler i `parametersJson` beholdes, så en
 * eldre øvelse ikke mister det den hadde. Ingen databaseendring.
 *
 * Alt her er merkelapper, aldri regler (beslutning 18.08.2026): ingenting
 * sperrer et valg, feltene som ikke gjelder området vaskes bare bort.
 */

import {
  BELASTNING_LABEL,
  DIMENSJON_LABEL,
  MOTORIKK_LABEL,
  PRESS_LABEL,
  formelStreng,
  omraadeDef,
  type BelastningKode,
  type MotorikkKode,
  type OmraadeKode,
  type PressKode,
  type PyramideKode,
} from "@/lib/domain/ak-formel-v2";
import {
  OvelseDetaljerSchema,
  belastningFraSted,
  feltForOvelse,
  mengdeTekst,
  vaskDetaljer,
  type OvelseDetaljer,
} from "@/lib/domain/workbench/ovelse-detaljer";
import type { TrainingArea } from "@/lib/domain/workbench/types";

/** Områdene tegningen tilbyr per pyramide (AG-14 › AREAS). */
const GOLF_FULLSVING: OmraadeKode[] = ["TEE_TOTAL", "INNSPILL_200", "INNSPILL_150", "INNSPILL_100", "INNSPILL_50"];
const GOLF_NAERSPILL: OmraadeKode[] = ["CHIP", "PITCH", "LOB", "BUNKER"];
const GOLF_PUTT: OmraadeKode[] = ["PUTT_0_3", "PUTT_3_5", "PUTT_5_10", "PUTT_10_25", "PUTT_25_40", "PUTT_40_PLUSS"];

export const OMRAADER_PER_PYRAMIDE: Record<PyramideKode, readonly OmraadeKode[]> = {
  FYS: ["STYRKE", "KONDISJON", "BEVEGELIGHET"],
  TEK: [...GOLF_FULLSVING, ...GOLF_NAERSPILL],
  SLAG: [...GOLF_FULLSVING, ...GOLF_NAERSPILL, ...GOLF_PUTT],
  SPILL: ["BANE"],
  TURN: ["BANE"],
};

export function omraadeLabel(kode: OmraadeKode | null | undefined): string | null {
  return kode ? omraadeDef(kode).label : null;
}

/** Workbench-domenet bruker «TEE» for utslag; formelen bruker «TEE_TOTAL». */
export function tilTrainingArea(kode: OmraadeKode): TrainingArea {
  return (kode === "TEE_TOTAL" ? "TEE" : kode) as TrainingArea;
}

export type OvelseUtkast = {
  id: string | null;
  navn: string;
  pyramide: PyramideKode;
  omraade: OmraadeKode;
  motorikk: MotorikkKode | null;
  press: PressKode | null;
  detaljer: OvelseDetaljer;
};

export function tomtUtkast(): OvelseUtkast {
  return {
    id: null,
    navn: "",
    pyramide: "SLAG",
    omraade: "INNSPILL_100",
    motorikk: "AUTO",
    press: "ALENE",
    detaljer: { sted: { hoved: "UTENDORS_TRENINGSOMRAADE" }, mengde: { enhet: "SLAG" } },
  };
}

/** Belastning følger stedet (masteren kap. 20). FYS uten sted: innendørs. */
export function belastningFor(u: OvelseUtkast): BelastningKode | null {
  if (u.detaljer.sted) return belastningFraSted(u.detaljer.sted.hoved, u.detaljer.sted.delvalg);
  return u.pyramide === "FYS" ? "INNENDORS" : null;
}

/**
 * Rydder utkastet etter et bytte av pyramide eller område: ugyldige akser og
 * detaljer fjernes, mengde-enheten settes til den første som gjelder.
 */
export function vaskUtkast(u: OvelseUtkast): OvelseUtkast {
  const omraader = OMRAADER_PER_PYRAMIDE[u.pyramide];
  const omraade = omraader.includes(u.omraade) ? u.omraade : omraader[0]!;
  const area = tilTrainingArea(omraade);
  const felt = feltForOvelse(u.pyramide, area);
  const motorikk = felt.laeringssteg ? (u.motorikk ?? "AUTO") : null;
  const press = felt.press ? (u.press ?? "ALENE") : u.pyramide === "FYS" ? "ALENE" : null;
  const vasket = vaskDetaljer(u.pyramide, area, motorikk ?? undefined, u.detaljer) ?? {};
  const enheter = felt.mengde.enheter;
  const mengde = vasket.mengde ?? (u.detaljer.mengde && !enheter.includes(u.detaljer.mengde.enhet)
    ? { enhet: enheter[0]!, ...(u.detaljer.mengde.antall !== undefined ? { antall: u.detaljer.mengde.antall } : {}) }
    : { enhet: enheter[0]! });
  return { ...u, omraade, motorikk, press, detaljer: { ...vasket, mengde } };
}

export type OvelseFeil = { navn?: string; mengde?: string };

export function validerUtkast(u: OvelseUtkast): OvelseFeil {
  const feil: OvelseFeil = {};
  if (!u.navn.trim()) feil.navn = "Gi øvelsen et navn.";
  if (u.detaljer.mengde?.antall === undefined) feil.mengde = "Skriv mengde, for eksempel 30 slag eller 3 serier.";
  return feil;
}

export function formelFor(u: OvelseUtkast): string {
  return formelStreng({ pyramide: u.pyramide, omraade: u.omraade, motorikk: u.motorikk, belastning: belastningFor(u), press: u.press });
}

const erObjekt = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);

/**
 * parametersJson for lagring. Beholder øvrige nøkler fra den lagrede verdien
 * når modusen er den samme, og legger detaljene under `akFormelV2`. Formen
 * passer fortsatt `DrillParametersSchema` (FYS eller GOLF) for eldre lesere.
 */
export function byggParametre(u: OvelseUtkast, original: unknown): Record<string, unknown> {
  const base = erObjekt(original) ? original : {};
  const detaljer = vaskUtkast(u).detaljer;
  const akFormelV2 = { detaljer };
  if (u.pyramide === "FYS") {
    const b = base.modus === "FYS" ? base : {};
    const m = detaljer.mengde;
    const fysType = u.omraade === "STYRKE" || u.omraade === "KONDISJON" || u.omraade === "BEVEGELIGHET" ? u.omraade : "STYRKE";
    return {
      ...b,
      modus: "FYS",
      fysType,
      muskelgrupper: Array.isArray(b.muskelgrupper) ? b.muskelgrupper : [],
      kondisjonSone: b.kondisjonSone ?? null,
      bevegelighetType: b.bevegelighetType ?? null,
      kondisjonAktivitet: b.kondisjonAktivitet ?? null,
      sets: m?.enhet === "SERIER" ? (m.antall ?? null) : (b.sets ?? null),
      reps: m?.reps ?? b.reps ?? null,
      kg: m?.vektKg ?? b.kg ?? null,
      tidSekunder: m?.enhet === "MINUTTER" && m.antall !== undefined ? m.antall * 60 : (b.tidSekunder ?? null),
      akFormelV2,
    };
  }
  const b = base.modus === "GOLF" ? base : {};
  return {
    ...b,
    modus: "GOLF",
    treningsomrade: u.omraade,
    lFase: b.lFase ?? null,
    pPosisjoner: Array.isArray(b.pPosisjoner) ? b.pPosisjoner : [],
    environment: b.environment ?? null,
    akFormelV2,
  };
}

/** Detaljene som er lagret på øvelsen, validert — null når det ikke finnes noen. */
export function lesDetaljer(parametre: unknown): OvelseDetaljer | null {
  if (!erObjekt(parametre) || !erObjekt(parametre.akFormelV2)) return null;
  const r = OvelseDetaljerSchema.safeParse(parametre.akFormelV2.detaljer);
  return r.success ? r.data : null;
}

/** Øvelsen slik lasteren gir den til skjermen. */
export type PlanhubOvelse = {
  id: string;
  navn: string;
  pyramide: PyramideKode;
  omraade: OmraadeKode | null;
  motorikk: MotorikkKode | null;
  belastning: BelastningKode | null;
  press: PressKode | null;
  /** Lagret mengde som tekst (defaultRepsSets), null når den mangler. */
  mengde: string | null;
  detaljer: OvelseDetaljer | null;
  /** Rå parametersJson, så lagring kan beholde eldre nøkler. */
  parametre: unknown;
};

export function utkastFraOvelse(o: PlanhubOvelse): OvelseUtkast {
  const omraade = o.omraade && OMRAADER_PER_PYRAMIDE[o.pyramide].includes(o.omraade) ? o.omraade : OMRAADER_PER_PYRAMIDE[o.pyramide][0]!;
  return vaskUtkast({ id: o.id, navn: o.navn, pyramide: o.pyramide, omraade, motorikk: o.motorikk, press: o.press, detaljer: o.detaljer ?? {} });
}

/** Merkelappen for en lagret øvelse. Uten område finnes ingen formel: «—». */
export function formelForOvelse(o: PlanhubOvelse): string {
  if (!o.omraade) return "—";
  return formelStreng({ pyramide: o.pyramide, omraade: o.omraade, motorikk: o.motorikk, belastning: o.belastning, press: o.press });
}

/** Lesbar linje: område · læringssteg · belastning · press · teknisk fokus. */
export function metaForOvelse(o: PlanhubOvelse): string {
  return [
    omraadeLabel(o.omraade),
    o.motorikk ? MOTORIKK_LABEL[o.motorikk] : null,
    o.belastning ? BELASTNING_LABEL[o.belastning] : null,
    o.press ? PRESS_LABEL[o.press] : null,
    o.detaljer?.tekniskFokus ? DIMENSJON_LABEL[o.detaljer.tekniskFokus] : null,
  ].filter(Boolean).join(" · ");
}

/** Mengde som tekst: lagret detalj først, så defaultRepsSets. */
export function mengdeForOvelse(o: PlanhubOvelse): string | null {
  return mengdeTekst(o.detaljer?.mengde) ?? o.mengde;
}

/** Feltene lagringen skriver til ExerciseDefinition. */
export function tilLagring(u: OvelseUtkast, original: unknown) {
  const v = vaskUtkast(u);
  return {
    name: v.navn.trim(),
    pyramidArea: v.pyramide,
    omraadeKode: v.omraade,
    motorikk: v.motorikk,
    belastning: belastningFor(v),
    press: v.press,
    defaultRepsSets: mengdeTekst(v.detaljer.mengde) ?? undefined,
    parametersJson: byggParametre(v, original),
  };
}
