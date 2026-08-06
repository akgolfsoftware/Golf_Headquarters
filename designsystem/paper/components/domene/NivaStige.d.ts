/**
 * Nivåstigen — lukket nivårekke med nå/forbi/mål (~6 skjermer: AK-stigen
 * junior, A–K-overganger, Veien til lavere score). FARGELØS: nivåer er
 * vokabular. IKKE ProgramLadder (progresjon inni et program) og IKKE
 * Stepper (flersteg-flyt i skjema). Rekka kommer fra konsumenten.
 */
export interface NivaStigeProps {
  /** Hele rekka i rekkefølge: ["Mini", "Knøtt", "Basis", "Utvikling", "Elite"] */
  levels: string[];
  current?: string;
  /** Sesongmålet — stiplet blekkramme + «mål» */
  target?: string;
  state?: "content" | "empty" | "loading" | "error";
  emptyText?: string;
  dataOdId?: string;
}
