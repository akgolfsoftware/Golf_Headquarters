/**
 * Rene regler for delingssamtykke til tredjepart (Team Norway/WANG — plan T8).
 * Ingen DB, ingen server-imports — testes isolert. Data-tilgangen ligger i
 * `samtykke.ts`, som bygger på disse. Mønster: src/lib/health/samtykke-regler.ts.
 *
 * GDPR-standpunkt (LÅST i plan T8): gruppemedlemskap alene er ALDRI
 * delingsgrunnlag — eksplisitt samtykke kreves alltid, per scope og per
 * mottakergruppe. For mindreårige (User.requiresGuardianConsent) KREVES
 * gittAvRolle FORESATT: en SELV-rad fra en mindreårig gir aldri deling,
 * uansett hva UI-et måtte ha sluppet gjennom.
 *
 * Historikken er append-only: trekk = ny rad med gitt=false, aldri update.
 * Gi og trekke er to regler (seniorgjennomgangen S3, D-69): et ja må komme fra
 * riktig rolle, mens et nei fra spilleren alltid stopper. Forelderens nei
 * stopper bare når det er lagret før spilleren fylte 16 (Anders 08.10.2026).
 */

import { sekstenaarsdag } from "@/lib/auth/minor";

/**
 * Versjon av samtykketeksten. Bump HVER gang tekstene under endres
 * meningsbærende — da vet vi nøyaktig hva hver enkelt faktisk sa ja til.
 */
export const SAMTYKKE_TEKST_VERSJON = "2026-08-16";

/**
 * De tingene det kan samtykkes til, hver for seg. En ekstern leser med
 * begge capabilities ser fortsatt bare det scopet spilleren har sagt ja til.
 *
 * KOMPLETT_PROFIL (TN-12, Claw batch 3, 01.09.2026): den andre av de «to
 * bryterne, aldri ti» i §FORRETNINGSMODELL: SPILLERLISENSER — i tillegg til
 * TEST_RESULTATER/STATS: treningsplan, TrackMan, analyse og fremgang.
 * Kommer alltid sammen med TEST_RESULTATER/STATS i UI-et (TnSamtykkeSide) —
 * en organisasjon som får komplett profil ser også testene, aldri omvendt —
 * men lagres som eget scope her, uavhengig av UI-koblingen.
 */
export const DELING_SCOPES = ["TEST_RESULTATER", "STATS", "KOMPLETT_PROFIL"] as const;
export type DelingScope = (typeof DELING_SCOPES)[number];

/** Hvem som utførte samtykke-handlingen. */
export const DELING_SAMTYKKE_ROLLER = ["SELV", "FORESATT"] as const;
export type DelingSamtykkeRolle = (typeof DELING_SAMTYKKE_ROLLER)[number];

export function erDelingScope(v: string): v is DelingScope {
  return (DELING_SCOPES as readonly string[]).includes(v);
}

/**
 * Teksten spilleren/foresatt faktisk ser. Bor her — ikke i komponenten — slik
 * at det som vises og det som lagres som `tekstVersjon` aldri kan komme i utakt.
 */
export const DELING_SAMTYKKE_TEKST: Record<
  DelingScope,
  { tittel: string; forklaring: string; punkter: string[] }
> = {
  TEST_RESULTATER: {
    tittel: "Del testresultatene mine",
    forklaring:
      "Ansvarlige i dette miljøet (for eksempel Team Norway eller WANG) får se testresultatene dine — dato, score og nivå. Du kan trekke samtykket når som helst, og treningen din påvirkes aldri av hva du velger her.",
    punkter: [
      "De ser: hvilke tester du har tatt, når, score og oppnådd benchmarknivå.",
      "De ser ikke: treningsplanen din, notater, helsedata eller annet innhold i appen.",
      "Delingen gjelder kun dette miljøet — ikke andre grupper eller tredjeparter.",
      "Du kan trekke samtykket når som helst, og delingen stopper umiddelbart.",
    ],
  },
  STATS: {
    tittel: "Del statistikken min",
    forklaring:
      "Ansvarlige i dette miljøet får se spillstatistikken din — snittscore og Strokes Gained-hovedtall fra rundene dine. Du kan trekke samtykket når som helst, og treningen din påvirkes aldri av hva du velger her.",
    punkter: [
      "De ser: antall runder, snittscore og SG-hovedtall (total, tee, innspill, nærspill, putting).",
      "De ser ikke: treningsplanen din, enkeltslag, notater eller helsedata.",
      "Delingen gjelder kun dette miljøet — ikke andre grupper eller tredjeparter.",
      "Du kan trekke samtykket når som helst, og delingen stopper umiddelbart.",
    ],
  },
  KOMPLETT_PROFIL: {
    tittel: "Del komplett profil",
    forklaring:
      "I tillegg til testresultater og statistikk: ansvarlige i dette miljøet får se treningsplanen din, TrackMan-data, analyse og fremgang over tid. Du kan trekke samtykket når som helst, og treningen din påvirkes aldri av hva du velger her.",
    punkter: [
      "De ser: treningsplanen din, TrackMan-økter, analyse og fremgang — i tillegg til testresultater og statistikk.",
      "De ser ikke: helsedata, private notater eller innhold utenfor dette miljøet.",
      "Delingen gjelder kun dette miljøet — ikke andre grupper eller tredjeparter.",
      "Du kan trekke samtykket når som helst, og delingen stopper umiddelbart.",
    ],
  },
};

/**
 * Én samtykkerad slik den ligger i delings_samtykker. Radene kan komme i
 * vilkårlig rekkefølge — reglene under plukker nyeste selv.
 */
export type DelingSamtykkeRad = {
  scope: string;
  mottakerGruppeId: string;
  gitt: boolean;
  gittAvRolle: string;
  createdAt: Date;
};

export type SamtykkeKrav = {
  scope: DelingScope;
  mottakerGruppeId: string;
  /** Under 16 (User.requiresGuardianConsent): bare FORESATT kan gi. */
  kreverForesatt: boolean;
  /**
   * Spillerens fødselsdato. Avgjør om et nei fra forelderen teller: bare nei
   * lagret før 16-årsdagen. Mangler den, teller forelderens nei alltid
   * (den trygge regelen).
   */
  fodselsdato?: Date | null;
};

function gjelder(rad: DelingSamtykkeRad, krav: SamtykkeKrav): boolean {
  return rad.scope === krav.scope && rad.mottakerGruppeId === krav.mottakerGruppeId;
}

/**
 * GI: nyeste ja som teller for dette scopet mot denne mottakergruppen.
 * Under 16 teller bare FORESATT-rader; en SELV-ja fra en mindreårig gir aldri
 * deling. Over 16 teller ja fra begge roller (et foresatt-samtykke gitt før
 * 16 gjelder videre til det trekkes).
 */
export function gyldigGittSamtykke(
  rader: readonly DelingSamtykkeRad[],
  krav: SamtykkeKrav,
): DelingSamtykkeRad | null {
  let nyeste: DelingSamtykkeRad | null = null;
  for (const rad of rader) {
    if (!rad.gitt || !gjelder(rad, krav)) continue;
    if (krav.kreverForesatt && rad.gittAvRolle !== "FORESATT") continue;
    if (!nyeste || rad.createdAt.getTime() > nyeste.createdAt.getTime()) nyeste = rad;
  }
  return nyeste;
}

/**
 * Teller dette neiet? Spillerens nei teller alltid. Forelderens nei teller
 * bare når det er lagret før spilleren fylte 16; etter 16 kan bare spilleren
 * trekke (D-69, Anders 08.10.2026). Uten fødselsdato teller forelderens nei.
 */
function neiTeller(rad: DelingSamtykkeRad, krav: SamtykkeKrav): boolean {
  if (rad.gittAvRolle === "SELV") return true;
  if (rad.gittAvRolle !== "FORESATT") return false;
  const fyller16 = sekstenaarsdag(krav.fodselsdato);
  return fyller16 === null || rad.createdAt.getTime() < fyller16.getTime();
}

/**
 * TREKKE: finnes det et «nei» som teller (se `neiTeller`) og er like nytt
 * som eller nyere enn `ja`? Ett nei stopper delingen (D-69). Spilleren kan
 * alltid trekke, også under 16. Ved likt tidspunkt vinner trekket (D-69,
 * GDPR art. 7-3).
 */
export function erTrukketEtter(
  rader: readonly DelingSamtykkeRad[],
  krav: SamtykkeKrav,
  ja: DelingSamtykkeRad,
): boolean {
  return rader.some(
    (rad) =>
      !rad.gitt &&
      gjelder(rad, krav) &&
      neiTeller(rad, krav) &&
      rad.createdAt.getTime() >= ja.createdAt.getTime(),
  );
}

/**
 * Har spilleren gyldig samtykke for dette scopet mot denne mottakergruppen
 * akkurat nå? Gyldig ja (gi-regelen) og ingen nyere nei (trekk-regelen).
 * Ingen rad = ikke samtykket. Svaret gjelder nå, også for eldre resultater.
 */
export function harGyldigSamtykke(
  rader: readonly DelingSamtykkeRad[],
  krav: SamtykkeKrav,
): boolean {
  const ja = gyldigGittSamtykke(rader, krav);
  return ja !== null && !erTrukketEtter(rader, krav, ja);
}

/** Kandidat i ekstern-leser-filtreringen — én spiller med sine rader. */
export type SamtykkeKandidat = {
  userId: string;
  kreverForesatt: boolean;
  fodselsdato?: Date | null;
  /** Aktive medlemskap i leserens grupper. */
  gruppeIder: readonly string[];
  samtykkeRader: readonly DelingSamtykkeRad[];
};

/**
 * Ren filtrering for ekstern-leser-scopet: per gruppe, hvilke kandidater har
 * gyldig samtykke for scopet mot AKKURAT den gruppen? Et samtykke mot gruppe A
 * åpner aldri innsyn via gruppe B — selv om spilleren er medlem i begge.
 */
export function velgSamtykkedeSpillerePerGruppe(
  kandidater: readonly SamtykkeKandidat[],
  scope: DelingScope,
): Map<string, string[]> {
  const resultat = new Map<string, string[]>();
  for (const kandidat of kandidater) {
    for (const gruppeId of kandidat.gruppeIder) {
      const gyldig = harGyldigSamtykke(kandidat.samtykkeRader, {
        scope,
        mottakerGruppeId: gruppeId,
        kreverForesatt: kandidat.kreverForesatt,
        fodselsdato: kandidat.fodselsdato,
      });
      if (!gyldig) continue;
      const liste = resultat.get(gruppeId);
      if (liste) liste.push(kandidat.userId);
      else resultat.set(gruppeId, [kandidat.userId]);
    }
  }
  return resultat;
}
