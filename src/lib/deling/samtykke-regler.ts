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
 * De to tingene det kan samtykkes til, hver for seg. En ekstern leser med
 * begge capabilities ser fortsatt bare det scopet spilleren har sagt ja til.
 */
export const DELING_SCOPES = ["TEST_RESULTATER", "STATS"] as const;
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
 * (Trekk håndheves likevel av at foresattes egen nyeste rad vinner: en
 * FORESATT-rad med gitt=false stopper delingen.)
 */
export function harGyldigSamtykke(
  rader: readonly DelingSamtykkeRad[],
  krav: { scope: DelingScope; mottakerGruppeId: string; kreverForesatt: boolean },
): boolean {
  let nyeste: DelingSamtykkeRad | null = null;
  for (const rad of rader) {
    if (rad.scope !== krav.scope) continue;
    if (rad.mottakerGruppeId !== krav.mottakerGruppeId) continue;
    if (krav.kreverForesatt && rad.gittAvRolle !== "FORESATT") continue;
    if (!nyeste || rad.createdAt.getTime() > nyeste.createdAt.getTime()) {
      nyeste = rad;
    }
  }
  return nyeste?.gitt === true;
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
