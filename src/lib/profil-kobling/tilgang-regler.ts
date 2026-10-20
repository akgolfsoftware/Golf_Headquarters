/**
 * Hvem som får se hva i en spillers komplette profil (resultater, tester, IUP).
 * Rene regler, testet uten database (mønster: regler.ts i samme mappe).
 *
 * Fire måter å komme til en profil på. De to første er egne eller coachede spillere som allerede
 * har egne porter; den tredje er delingen som Team Norway og WANG bruker:
 *  - SELV:       spilleren ser sin egen profil.
 *  - AK_COACH:   admin eller coachen til en coachet spiller (coachScopedPlayerWhere).
 *  - ORG_TRENER: trener i en organisasjonsgruppe (WANG/Team Norway) med gjeldende navngitt deling.
 *                Delingen kontrolleres på hvert oppslag, og for under 16 krever den foresatt.
 *  - INGEN:      alt annet, inkludert forelder og andre spillere.
 *
 * Golf-ID (MemberID) vises bare for trenere (Anders 20.10.2026). Den står åpent i GolfBox-lister,
 * men samles ikke i en visning for spilleren selv eller for andre. Data Golf er ikke en del av
 * profilen i det hele tatt: databasefunksjonen leverer ingen, uansett hvem som spør.
 */

export type Relasjon = "SELV" | "AK_COACH" | "ORG_TRENER" | "INGEN";

export type Synlighet = { kanSe: boolean; kanSeGolfId: boolean };

export function synlighet(relasjon: Relasjon): Synlighet {
  switch (relasjon) {
    case "SELV":
      return { kanSe: true, kanSeGolfId: false };
    case "AK_COACH":
    case "ORG_TRENER":
      return { kanSe: true, kanSeGolfId: true };
    default:
      return { kanSe: false, kanSeGolfId: false };
  }
}

/**
 * Hvilken relasjon har betrakteren? Faktaene hentes av serveren, aldri fra klienten.
 * Rekkefølgen er bevisst: egen profil, så coach/admin, så delt organisasjonstilgang.
 */
export function avgjorRelasjon(fakta: {
  betrakterId: string;
  spillerId: string;
  betrakterRolle: string;
  erCoachetAvBetrakter: boolean;
  harGjeldendeDeling: boolean;
}): Relasjon {
  if (fakta.betrakterId === fakta.spillerId && ["PLAYER", "COACH", "ADMIN"].includes(fakta.betrakterRolle)) return "SELV";
  if (fakta.erCoachetAvBetrakter) return "AK_COACH";
  if (fakta.betrakterRolle === "COACH" && fakta.harGjeldendeDeling) return "ORG_TRENER";
  return "INGEN";
}
