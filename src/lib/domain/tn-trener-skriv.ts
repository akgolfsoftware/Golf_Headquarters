import { hentTnArbeidskontekst, medTnSpillerData, type TnBruker } from "./tn-arbeidsflate";

/**
 * Kan denne Team Norway-treneren skrive TrackMan- og testdata for spilleren? (§TRACKMAN I TEAM NORWAY-TESTENE,
 * Anders 22.10.2026). Krever plattformrolle COACH eller ADMIN, gruppe-rolle COACH i Team Norway (Assist Coach
 * leser bare) og navngitt deling fra spilleren. Ny sjekk for hvert kall, aldri et varig tilgangsbevis.
 */
export async function tnTrenerKanSkriveFor(bruker: TnBruker, spillerId: string): Promise<boolean> {
  if (bruker.role !== "COACH" && bruker.role !== "ADMIN") return false;
  const kontekst = await hentTnArbeidskontekst(bruker);
  if (!kontekst || kontekst.erSpiller) return false;
  if (bruker.role !== "ADMIN" && kontekst.rolle !== "COACH") return false;
  return (await medTnSpillerData(bruker, spillerId, async () => true)) === true;
}
