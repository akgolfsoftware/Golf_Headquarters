/**
 * Datakontrakter for den arkiverte GFGK-presentasjonen.
 *
 * Ekte spillerdata skal aldri lagres i denne filen eller i offentlig Git.
 * Hvis presentasjonen tas i bruk igjen, skal data hentes på serveren etter
 * tilgangs- og samtykkekontroll og begrenses til feltene mottakeren trenger.
 */

export interface PlayerSummary {
  name: string;
  club: string;
  birthYear: string;
  rang: number;
  tournaments: number;
  rounds: number;
  avg18: number;
  avgToPar: number;
  vsField: number;
  best: number;
  worst: number;
}

export interface TournamentResult {
  tour: string;
  name: string;
  course: string;
  date: string;
  klasse: string;
  holes: number;
  rounds: number[];
  brutto: number;
  toPar: number;
  par: number;
  fieldAvg: number | null;
  fieldN: number | null;
  vsField: number | null;
  diffVal: number;
  diffRank: number | null;
  diffLevel: string;
}

export interface CourseRank {
  name: string;
  rank: number;
  val: number;
  rounds: number;
}

export interface GfgkData {
  meta: { maxRank: number; seasonStart: string; seasonEnd: string };
  summary: Record<string, PlayerSummary>;
  players: Record<string, TournamentResult[]>;
  courses: CourseRank[];
}
