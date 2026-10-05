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
 * Nyeste rad per (scope, mottakerGruppe) vinner.
 */

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

/**
 * Har spilleren gyldig samtykke for dette scopet mot denne mottakergruppen?
 *
 * Nyeste rad per (scope, mottakerGruppe) vinner; ingen rad = ikke samtykket.
 * Med `kreverForesatt` (mindreårig) teller KUN FORESATT-rader — en SELV-rad
 * fra en mindreårig verken gir eller «skygger for» et foresatt-samtykke.
 * Trekk virker for begge: en FORESATT-rad med gitt=false, eller en nyere
 * SELV-rad med gitt=false fra spilleren selv (D-04, art. 7-3), stopper delingen.
 */
export function harGyldigSamtykke(
  rader: readonly DelingSamtykkeRad[],
  krav: { scope: DelingScope; mottakerGruppeId: string; kreverForesatt: boolean },
): boolean {
  let nyeste: DelingSamtykkeRad | null = null;
  let nyesteEgetTrekk = -Infinity;
  for (const rad of rader) {
    if (rad.scope !== krav.scope) continue;
    if (rad.mottakerGruppeId !== krav.mottakerGruppeId) continue;
    if (krav.kreverForesatt && rad.gittAvRolle !== "FORESATT") {
      // D-04: spilleren kan alltid trekke selv (art. 7-3).
      if (!rad.gitt) nyesteEgetTrekk = Math.max(nyesteEgetTrekk, rad.createdAt.getTime());
      continue;
    }
    if (!nyeste || rad.createdAt.getTime() > nyeste.createdAt.getTime()) {
      nyeste = rad;
    }
  }
  if (!nyeste?.gitt) return false;
  return nyesteEgetTrekk < nyeste.createdAt.getTime();
}

/** Kandidat i ekstern-leser-filtreringen — én spiller med sine rader. */
export type SamtykkeKandidat = {
  userId: string;
  kreverForesatt: boolean;
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
      });
      if (!gyldig) continue;
      const liste = resultat.get(gruppeId);
      if (liste) liste.push(kandidat.userId);
      else resultat.set(gruppeId, [kandidat.userId]);
    }
  }
  return resultat;
}

/**
 * D-13 (05.10.2026): WANG-elevens svar på «Del testene med Team Norway».
 * Omfanget er bare TEST_RESULTATER mot Team Norway-gruppen.
 *
 * - DELT: gyldig samtykke etter `harGyldigSamtykke` (under 16: bare FORESATT teller).
 * - VENTER_PA_FORELDER: eleven under 16 har sagt ja selv, foresatt har ikke svart.
 *   Elevens ja gir aldri tilgang alene.
 * - IKKE_DELT: nyeste svar er nei («Ikke nå» eller trukket).
 * - IKKE_SVART: ingen rad. Eleven får forespørselen.
 */
export type WangTnTestdelingStatus = "DELT" | "VENTER_PA_FORELDER" | "IKKE_DELT" | "IKKE_SVART";

export function wangTnTestdelingStatus(
  rader: readonly DelingSamtykkeRad[],
  krav: { mottakerGruppeId: string; kreverForesatt: boolean },
): WangTnTestdelingStatus {
  if (harGyldigSamtykke(rader, { scope: "TEST_RESULTATER", ...krav })) return "DELT";
  let nyeste: DelingSamtykkeRad | null = null;
  for (const rad of rader) {
    if (rad.scope !== "TEST_RESULTATER" || rad.mottakerGruppeId !== krav.mottakerGruppeId) continue;
    if (!nyeste || rad.createdAt.getTime() > nyeste.createdAt.getTime()) nyeste = rad;
  }
  if (!nyeste) return "IKKE_SVART";
  if (krav.kreverForesatt && nyeste.gitt && nyeste.gittAvRolle === "SELV") return "VENTER_PA_FORELDER";
  return "IKKE_DELT";
}
