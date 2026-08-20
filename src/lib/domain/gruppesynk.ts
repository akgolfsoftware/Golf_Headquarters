/**
 * Gruppesynk — regelen for gruppeøkter som kopieres inn i spillerens plan.
 *
 * Én setning (bekreftet av Anders 20.08): gruppeøkta er originalen, hver spiller
 * får en levende kopi som følger den helt til spilleren endrer PLANINNHOLDET —
 * da løsrives kopien permanent. Oppmøte, logging og vurdering løsriver aldri.
 *
 * Ingen fletting, ingen konfliktdialoger. Spilleren ser aldri ordene «synk»,
 * «kopi» eller «løsrevet» — UI-et sier én setning: «Denne økta blir nå din egen.»
 */

export type HandlingsKlasse = "OPPMOTE" | "GJENNOMFORING" | "PLANENDRING";

/**
 * Hva spilleren gjorde med kopien. Klassen avgjør om lenken brytes.
 *
 * Listen er bevisst uttømmende: en ny handling må plasseres eksplisitt, slik at
 * ingen ny funksjon kan bryte lenken ved et uhell (eller la være å bryte den
 * når den burde).
 */
export type Handling =
  // Oppmøte — kopien forblir lenket
  | "DELTAR_IKKE"
  | "MELD_DELTAKELSE"
  // Gjennomføring — spillerens egne data på kopien
  | "LOGG_REPS"
  | "LOGG_TID"
  | "HOPP_OVER_DRILL"
  | "LEGG_TIL_MEDIA"
  | "SKRIV_KOMMENTAR"
  | "TALENOTAT"
  | "SETT_VURDERING"
  | "FULLFOR_OKT"
  // Planendring — løsriver permanent
  | "ENDRE_DRILL"
  | "LEGG_TIL_DRILL"
  | "SLETT_DRILL"
  | "ENDRE_REPS_PLAN"
  | "ENDRE_TID_PLAN"
  | "FLYTT_OKT"
  | "ENDRE_OKT_RAMME";

const KLASSE: Record<Handling, HandlingsKlasse> = {
  DELTAR_IKKE: "OPPMOTE",
  MELD_DELTAKELSE: "OPPMOTE",
  LOGG_REPS: "GJENNOMFORING",
  LOGG_TID: "GJENNOMFORING",
  HOPP_OVER_DRILL: "GJENNOMFORING",
  LEGG_TIL_MEDIA: "GJENNOMFORING",
  SKRIV_KOMMENTAR: "GJENNOMFORING",
  TALENOTAT: "GJENNOMFORING",
  SETT_VURDERING: "GJENNOMFORING",
  FULLFOR_OKT: "GJENNOMFORING",
  ENDRE_DRILL: "PLANENDRING",
  LEGG_TIL_DRILL: "PLANENDRING",
  SLETT_DRILL: "PLANENDRING",
  ENDRE_REPS_PLAN: "PLANENDRING",
  ENDRE_TID_PLAN: "PLANENDRING",
  FLYTT_OKT: "PLANENDRING",
  ENDRE_OKT_RAMME: "PLANENDRING",
};

export function klassifiser(handling: Handling): HandlingsKlasse {
  return KLASSE[handling];
}

/** Bryter denne handlingen lenken til gruppeøkta? */
export function loesriver(handling: Handling): boolean {
  return klassifiser(handling) === "PLANENDRING";
}

export type KopiTilstand = {
  sourceGroupSessionId: string | null;
  sourceGroupId: string | null;
  detachedAt: Date | null;
};

export function erLenket(kopi: KopiTilstand): boolean {
  return Boolean(kopi.sourceGroupSessionId) && kopi.detachedAt === null;
}

/**
 * Tilstanden etter en handling. Opphavsstempelet (`sourceGroupId`) slettes
 * aldri — det er det som lar kalenderen si HVILKEN gruppe økta kom fra, også
 * etter løsrivelse, og som lar v2-AI-en skille «det coachen planla» fra «det
 * spilleren gjorde» uten datavask.
 */
export function etterHandling(
  kopi: KopiTilstand,
  handling: Handling,
  naa: Date,
): KopiTilstand {
  if (!erLenket(kopi) || !loesriver(handling)) return kopi;
  return { ...kopi, detachedAt: naa };
}

/**
 * Skal en endring på gruppeøkta nå denne kopien?
 *
 * Aldri til løsrevne kopier, og aldri til gjennomførte økter — en fullført økt
 * er frossen historikk.
 */
export function skalPropagere(
  kopi: KopiTilstand,
  kopiStatus: "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "SKIPPED",
): boolean {
  if (!erLenket(kopi)) return false;
  return kopiStatus === "PLANNED";
}

/**
 * Hva skjer med kopiene når spilleren forlater gruppen.
 *
 * Gjennomført historikk beholdes hos spilleren med gruppestempel; fremtidige
 * lenkede kopier slettes; løsrevne består som spillerens egne økter.
 * Innmelding synker KUN fremover — aldri bakover (Anders 20.08).
 */
export type ExitHandling = "BEHOLD" | "SLETT";

export function vedGruppeExit(
  kopi: KopiTilstand,
  kopiStatus: "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "SKIPPED",
): ExitHandling {
  if (!erLenket(kopi)) return "BEHOLD";
  return kopiStatus === "PLANNED" ? "SLETT" : "BEHOLD";
}

/**
 * Skal denne gruppeøkta kopieres inn når spilleren meldes inn?
 * Kun økter som starter etter innmeldingstidspunktet.
 */
export function synkesVedInnmelding(oktStart: Date, innmeldtAt: Date): boolean {
  return oktStart.getTime() > innmeldtAt.getTime();
}
