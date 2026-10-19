/**
 * De fem standardplanene i PH-12 Velg treningsplan (beslutninger.md §SKJERMENE … RUNDE 8, Motoren, 28.09):
 * Weekend Warrior, Klubbspilleren, Junior-aspirant, Konkurransespilleren og Practice like the pros.
 * Alle fem kan velges i alle kategorier A–K (§ØKONOMI BARE FOR HEAD COACH, 28.09).
 *
 * Timer per uke, fordeling og tekst er tegningens eksempler (docs/design-system/utkast-playerhq/ovelser.html,
 * skjerm «velg»). Det faglige innholdet per kategori er ikke skrevet (åpent hos Anders), derfor merkes
 * kortene «Eksempel» på skjermen.
 */
import type { Fordeling } from "./velg-plan";

export type Standardplan = {
  id: string;
  navn: string;
  tekst: string;
  timerPerUke: number;
  /** Bilde fra public/images/playerhq/. */
  bilde: string;
  fordeling: Fordeling;
};

export const STANDARDPLANER: readonly Standardplan[] = [
  { id: "std-weekend-warrior", navn: "Weekend Warrior", tekst: "To økter i uka og en runde i helga.", timerPerUke: 3, bilde: "/images/playerhq/spill-bane.jpg", fordeling: { fys: 10, tek: 15, slag: 35, spill: 40, turn: 0 } },
  { id: "std-klubbspilleren", navn: "Klubbspilleren", tekst: "Fire økter i uka, mest nærspill og putting.", timerPerUke: 6, bilde: "/images/playerhq/naerspill-wedge.jpg", fordeling: { fys: 15, tek: 15, slag: 45, spill: 25, turn: 0 } },
  { id: "std-junior-aspirant", navn: "Junior-aspirant", tekst: "Teknikk og fysisk grunnlag, med turneringer i sesongen.", timerPerUke: 9, bilde: "/images/playerhq/slag-utslag.jpg", fordeling: { fys: 25, tek: 30, slag: 30, spill: 10, turn: 5 } },
  { id: "std-konkurransespilleren", navn: "Konkurransespilleren", tekst: "Periodisert mot turneringene dine, med testuker.", timerPerUke: 14, bilde: "/images/playerhq/turn-tee.jpg", fordeling: { fys: 20, tek: 20, slag: 35, spill: 15, turn: 10 } },
  { id: "std-practice-like-the-pros", navn: "Practice like the pros", tekst: "Daglig trening med mål for hver øvelse.", timerPerUke: 20, bilde: "/images/playerhq/slag-simulator.jpg", fordeling: { fys: 20, tek: 25, slag: 35, spill: 10, turn: 10 } },
];

/**
 * Anbefalt standardplan etter turneringsnivået fra oppstarten (vedtak 28.09): region og høyere gir
 * Konkurransespilleren, ellers Klubbspilleren. Ukjent nivå gir ingen anbefaling.
 */
export function anbefaltStandardplanId(konkurranseNivaa: string | null): string | null {
  if (!konkurranseNivaa) return null;
  return ["REGION", "NASJONALT", "INTERNASJONALT"].includes(konkurranseNivaa) ? "std-konkurransespilleren" : "std-klubbspilleren";
}
