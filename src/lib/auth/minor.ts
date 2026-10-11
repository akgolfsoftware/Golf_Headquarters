/**
 * Mindreårig-helper for GDPR art. 8 (P17).
 *
 * Norsk lov: 16 år er aldersgrensen for å samtykke selv til behandling
 * av persondata. Under 16 år krever foreldresamtykke. Grensen byttes
 * ikke automatisk til 13.
 *
 * Brukes:
 *  - Ved onboarding: hvis dateOfBirth < 16 år → sett requiresGuardianConsent
 *  - I PortalShell: vis banner hvis requiresGuardianConsent + ikke gitt
 *  - I forelder-portal: ParentInvitation-flyt + signering
 *  - Helse- og delingssamtykke: samme 16-årsregel, strengeste signal vinner
 */

/** Norsk art. 8-grense. Ikke endre til 13 uten ny beslutning. */
export const GDPR_SAMTYKKE_ALDER = 16;

export type SamtykkeGiver = {
  /** Flagg satt ved onboarding eller av foresatt. */
  requiresGuardianConsent: boolean;
  /** Fødselsdato, hvis vi har den. */
  dateOfBirth: Date | null;
};

/**
 * Alder i hele år på et gitt tidspunkt. Kalenderalder, ikke 365,25-døgn.
 * Returnerer null hvis fødselsdato mangler.
 */
export function calculateAge(
  dateOfBirth: Date | null | undefined,
  naa: Date = new Date(),
): number | null {
  if (!dateOfBirth) return null;
  let age = naa.getFullYear() - dateOfBirth.getFullYear();
  const m = naa.getMonth() - dateOfBirth.getMonth();
  if (m < 0 || (m === 0 && naa.getDate() < dateOfBirth.getDate())) {
    age--;
  }
  return age;
}

/**
 * True hvis fødselsdato indikerer under 16 år.
 * False hvis dateOfBirth er null/undefined (anta voksen).
 */
export function isMinor(
  dateOfBirth: Date | null | undefined,
  naa: Date = new Date(),
): boolean {
  const age = calculateAge(dateOfBirth, naa);
  return age !== null && age < GDPR_SAMTYKKE_ALDER;
}

/**
 * Dagen spilleren fyller 16 (UTC-dato, samme kalenderdag som fødselsdatoen).
 * Null hvis fødselsdato mangler.
 */
export function sekstenaarsdag(dateOfBirth: Date | null | undefined): Date | null {
  if (!dateOfBirth) return null;
  return new Date(
    Date.UTC(
      dateOfBirth.getUTCFullYear() + GDPR_SAMTYKKE_ALDER,
      dateOfBirth.getUTCMonth(),
      dateOfBirth.getUTCDate(),
    ),
  );
}

/**
 * Kan spilleren gi samtykke selv, eller må en foresatt gjøre det?
 *
 * To uavhengige signaler, og vi stoler på det strengeste: flagget
 * `requiresGuardianConsent` og fødselsdatoen. Er ett av dem «under 16»,
 * må foresatt inn.
 *
 * Mangler fødselsdatoen, regnes spilleren IKKE som voksen (D-63, TA-03):
 * foresatt kreves til datoen er satt. Bare når rollen er oppgitt og ikke er
 * PLAYER (coach, admin, forelder), gjelder den gamle regelen om at ukjent
 * alder er voksen.
 */
export function maaHaForesattSamtykke(
  bruker: SamtykkeGiver & { role?: string },
  naa: Date = new Date(),
): boolean {
  if (bruker.requiresGuardianConsent) return true;
  if (!bruker.dateOfBirth) return bruker.role === undefined || bruker.role === "PLAYER";
  return isMinor(bruker.dateOfBirth, naa);
}

/**
 * D-63 (Anders): forelder må godkjenne innen sju dager etter at kontoen er
 * opprettet. Barnet bruker appen fullt ut de sju dagene.
 */
export const FORELDER_FRIST_DAGER = 7;

/** Tidspunktet kontoen låses hvis forelder ikke har godkjent. */
export function forelderFrist(createdAt: Date): Date {
  return new Date(createdAt.getTime() + FORELDER_FRIST_DAGER * 24 * 60 * 60 * 1000);
}

export type ForelderGodkjenningGrunnlag = {
  requiresGuardianConsent: boolean;
  guardianConsentGivenAt: Date | null;
  /** Mangler feltet, brukes bare flagget (eldre kallere). */
  dateOfBirth?: Date | null;
  /** Mangler feltet, regnes fristen som passert (fail-closed). */
  createdAt?: Date;
  /**
   * Finnes en godkjent ParentRelation? Settes av getCurrentUserRaw når det
   * trengs. Mangler feltet, teller bare `guardianConsentGivenAt`.
   */
  harGodkjentForelder?: boolean;
  role?: string;
};

/** Har en forelder godkjent kontoen (samtykkelenken eller godkjent kobling)? */
export function harForelderGodkjent(u: ForelderGodkjenningGrunnlag): boolean {
  return u.guardianConsentGivenAt !== null || u.harGodkjentForelder === true;
}

/**
 * Deling og opptak er sperret til forelder har godkjent (D-63). Gjelder alle
 * som må ha foresatt (under 16, eller spiller uten fødselsdato).
 */
export function venterPaaForelder(
  u: ForelderGodkjenningGrunnlag,
  naa: Date = new Date(),
): boolean {
  const giver: SamtykkeGiver & { role?: string } = {
    requiresGuardianConsent: u.requiresGuardianConsent,
    dateOfBirth: u.dateOfBirth ?? null,
    role: u.role,
  };
  return maaHaForesattSamtykke(giver, naa) && !harForelderGodkjent(u);
}

/**
 * Er kontoen låst fordi forelder ikke har godkjent innen fristen (D-63)?
 *
 * Gjelder spillere vi VET er under 16 (flagget eller fødselsdatoen). En
 * spiller uten fødselsdato låses ikke her; deling og opptak er likevel
 * sperret (`venterPaaForelder`), og oppstarten krever datoen.
 * Brukes av innloggingsvaktene; navnet er beholdt for kallerne.
 */
export function isAwaitingGuardianConsent(
  u: ForelderGodkjenningGrunnlag,
  naa: Date = new Date(),
): boolean {
  const kjentUnder16 = u.requiresGuardianConsent || isMinor(u.dateOfBirth, naa);
  if (!kjentUnder16 || harForelderGodkjent(u)) return false;
  if (!u.createdAt) return true;
  return naa.getTime() >= forelderFrist(u.createdAt).getTime();
}

export type FodselsdatoEndring = "uendret" | "sett" | "avvist";

function dagNokkel(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/**
 * Spilleren kan sette fødselsdatoen én gang, aldri endre den (D-63, TP-02).
 * Coach og admin endrer via egne handlinger.
 */
export function vurderEgenFodselsdato(
  eksisterende: Date | null,
  ny: Date | null | undefined,
): FodselsdatoEndring {
  if (!ny) return "uendret";
  if (!eksisterende) return "sett";
  return dagNokkel(eksisterende) === dagNokkel(ny) ? "uendret" : "avvist";
}

export const FODSELSDATO_LAAST_MELDING =
  "Fødselsdatoen er allerede satt og kan ikke endres her. Be coachen din om å rette den.";
