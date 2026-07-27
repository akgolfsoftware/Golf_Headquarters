/**
 * Rene regler for helsedata-samtykke (GDPR art. 9-2 a) — ingen DB, ingen
 * server-imports, så de kan testes isolert. Data-tilgangen ligger i
 * `samtykke.ts`, som bygger på disse.
 *
 * Bakgrunn: søvn, puls, HRV og stress fra en treningsklokke er «særlig
 * kategori» personopplysninger. De krever et UTTRYKKELIG, spesifikt og
 * informert samtykke — det holder ikke at spilleren godkjente noe hos Whoop
 * eller Garmin, og det holder ikke at de har akseptert vilkårene våre generelt.
 */

/**
 * Versjon av samtykketeksten. Bump denne HVER gang teksten under endres
 * meningsbærende — da vet vi nøyaktig hva hver enkelt faktisk sa ja til, og
 * gamle samtykker kan kreves fornyet.
 */
export const HELSE_SAMTYKKE_VERSJON = "2026-07-27";

/** De to formålene det samtykkes til hver for seg. */
export const HELSE_SAMTYKKE_TYPER = ["WEARABLE_HELSE", "COACH_INNSYN"] as const;
export type HelseSamtykkeType = (typeof HELSE_SAMTYKKE_TYPER)[number];

/** Hvem som utførte samtykke-handlingen. */
export const HELSE_SAMTYKKE_ROLLER = ["SELV", "FORESATT"] as const;
export type HelseSamtykkeRolle = (typeof HELSE_SAMTYKKE_ROLLER)[number];

export function erHelseSamtykkeType(v: string): v is HelseSamtykkeType {
  return (HELSE_SAMTYKKE_TYPER as readonly string[]).includes(v);
}

/**
 * Teksten spilleren/foresatt faktisk ser. Bor her — ikke i komponenten — slik
 * at det som vises og det som lagres som `tekstVersjon` aldri kan komme i utakt.
 */
export const HELSE_SAMTYKKE_TEKST: Record<
  HelseSamtykkeType,
  { tittel: string; forklaring: string; punkter: string[] }
> = {
  WEARABLE_HELSE: {
    tittel: "Hent helsedata fra klokka mi",
    forklaring:
      "Vi henter døgnverdiene fra treningsklokka di og bruker dem til å tilpasse treningen din. Du kan trekke samtykket når som helst, og treningen din blir aldri sperret av det du velger her.",
    punkter: [
      "Vi henter: timer søvn, restitusjon, variasjon i hjerterytme (HRV) og hvilepuls — én verdi per døgn.",
      "Vi henter ikke detaljerte pulskurver, posisjon eller treningsøkter fra klokka.",
      "Dataene lagres i vår database i London, innenfor EØS.",
      "Du kan koble fra når som helst, og velger da selv om historikken slettes.",
    ],
  },
  COACH_INNSYN: {
    tittel: "La coachen min se restitusjonsstatus",
    forklaring:
      "Coachen din ser en enkel status — grønn, gul eller rød — så treningen kan justeres når du er sliten. Coachen ser ikke søvntimene, pulsen eller tallene bak.",
    punkter: [
      "Coach ser: grønn, gul eller rød status, og dato for siste måling.",
      "Coach ser ikke: søvntimer, hvilepuls, HRV eller andre rå tall.",
      "Sier du nei her, henter vi fortsatt dataene til deg selv — hvis du har sagt ja over.",
    ],
  },
};

/**
 * Alderen der man kan samtykke selv til behandling av egne persondata.
 * Speiler GDPR_AGE_THRESHOLD i src/lib/auth/minor.ts (art. 8, norsk grense).
 */
const SELVSAMTYKKE_ALDER = 16;

export type SamtykteGiver = {
  /** Om brukeren er flagget som mindreårig i systemet. */
  requiresGuardianConsent: boolean;
  /** Fødselsdato, hvis vi har den. */
  dateOfBirth: Date | null;
};

/**
 * Kan spilleren gi dette samtykket selv, eller må en foresatt gjøre det?
 *
 * To uavhengige signaler, og vi stoler på det STRENGESTE: flagget
 * `requiresGuardianConsent` (satt ved onboarding) og fødselsdatoen. Er ett av
 * dem «under 16», må foresatt inn. Mangler begge, antar vi voksen — samme
 * antakelse som `isMinor` i auth/minor.ts.
 */
export function maaHaForesattSamtykke(
  bruker: SamtykteGiver,
  naa: Date = new Date(),
): boolean {
  if (bruker.requiresGuardianConsent) return true;
  if (!bruker.dateOfBirth) return false;
  return alderVed(bruker.dateOfBirth, naa) < SELVSAMTYKKE_ALDER;
}

/** Alder i hele år på et gitt tidspunkt. */
export function alderVed(foedselsdato: Date, naa: Date): number {
  let alder = naa.getFullYear() - foedselsdato.getFullYear();
  const maaned = naa.getMonth() - foedselsdato.getMonth();
  if (maaned < 0 || (maaned === 0 && naa.getDate() < foedselsdato.getDate())) {
    alder--;
  }
  return alder;
}

/**
 * Er en samtykke-handling gyldig? Returnerer null hvis alt er i orden, ellers
 * en norsk begrunnelse som kan vises rett i UI.
 *
 * Regelen som betyr noe: for en spiller under 16 kan IKKE spilleren selv gi
 * samtykket — heller ikke for å trekke det, der er det motsatt: å trekke et
 * samtykke skal alltid være lov, for hvem som helst. Å gjøre tilbaketrekking
 * vanskeligere enn samtykke ville brutt art. 7-3.
 */
export function validerSamtykkeHandling(input: {
  bruker: SamtykteGiver;
  rolle: HelseSamtykkeRolle;
  gitt: boolean;
  naa?: Date;
}): string | null {
  const { bruker, rolle, gitt, naa = new Date() } = input;

  // Tilbaketrekking er alltid tillatt — like enkelt som å gi (art. 7-3).
  if (!gitt) return null;

  if (maaHaForesattSamtykke(bruker, naa) && rolle === "SELV") {
    return "Du er under 16 år, så en foresatt må godkjenne dette for deg.";
  }
  return null;
}

/**
 * Gjeldende status regnet ut fra samtykke-historikken. Nyeste rad per type
 * vinner; ingen rad = ikke samtykket.
 */
export type SamtykkeRad = {
  type: string;
  gitt: boolean;
  tekstVersjon: string;
  createdAt: Date;
};

export type SamtykkeStatus = {
  /** Kan vi hente helsedata fra klokka i det hele tatt? */
  wearable: boolean;
  /** Kan coach se restitusjonsstatus? */
  coachInnsyn: boolean;
  /** Når wearable-samtykket sist ble gitt (null hvis ikke gitt nå). */
  wearableGittAt: Date | null;
  /** Versjonen wearable-samtykket ble gitt til — for å oppdage utdaterte samtykker. */
  wearableVersjon: string | null;
};

/**
 * Regn ut gjeldende status. Radene kan komme i vilkårlig rekkefølge —
 * vi plukker den nyeste per type selv i stedet for å stole på sortering.
 */
export function beregnSamtykkeStatus(rader: SamtykkeRad[]): SamtykkeStatus {
  const nyeste = new Map<string, SamtykkeRad>();
  for (const rad of rader) {
    const forrige = nyeste.get(rad.type);
    if (!forrige || rad.createdAt.getTime() > forrige.createdAt.getTime()) {
      nyeste.set(rad.type, rad);
    }
  }

  const wearable = nyeste.get("WEARABLE_HELSE");
  const coach = nyeste.get("COACH_INNSYN");
  const wearableAktiv = wearable?.gitt === true;

  return {
    wearable: wearableAktiv,
    // Coach-innsyn forutsetter wearable-samtykket: sier spilleren nei til at vi
    // henter data i det hele tatt, finnes det ingenting å dele med coachen.
    coachInnsyn: wearableAktiv && coach?.gitt === true,
    wearableGittAt: wearableAktiv ? (wearable?.createdAt ?? null) : null,
    wearableVersjon: wearableAktiv ? (wearable?.tekstVersjon ?? null) : null,
  };
}
