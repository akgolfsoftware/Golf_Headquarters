import type { PeriodType, PlanningGoalSummary, PyramidArea, SourceItem, WeekViewModel, WorkbenchSession } from "@/lib/domain/workbench/types";
import type { PlanKontekst } from "./plan-kontekst";
import type { WorkbenchSurface } from "./visning-url";
import type { WorkbenchFysTurneringData } from "./fys-turnering-data";
import type { SessionBudget } from "./perioder";
import type { Treningsvolum } from "./treningsvolum";
import type { StallFollowupData } from "./wb-actions";

export type WorkbenchFlate = "sesong" | "uke" | "bord" | "analyse";
export type SamletSpiller = { id: string; navn: string };
export type SamletVindu = { fraDato: string; tilDato: string }; // tilDato er eksklusiv
export type SamletPeriode = {
  id: string; type: PeriodType; startDate: string; endDate: string; focus: string | null;
  weeklyVolMin: number | null; weeklyVolMax: number | null; sessionBudget: SessionBudget | null;
  volum: Treningsvolum;
};
export type SamletHendelse = {
  id: string; kind: "turnering" | "test"; navn: string; fraDato: string; tilDato: string;
  kilde: "TournamentEntry" | "TestResult"; priority: string | null;
};
export type WorkbenchSamletSesong = {
  plan: { id: string; navn: string | null; startDate: string; endDate: string; updatedAt: string } | null;
  vindu: SamletVindu; perioder: SamletPeriode[]; hendelser: SamletHendelse[];
  sessions: WorkbenchSession[]; volum: Treningsvolum;
  maneder: { monthStart: string; volum: Treningsvolum }[];
};
export type WorkbenchSamletBordRad = {
  spiller: SamletSpiller; uke: WeekViewModel | null; volum: Treningsvolum | null;
  followup: StallFollowupData | null;
  error: string | null;
};
export type WorkbenchSamletBord = { rader: WorkbenchSamletBordRad[]; total: number; samtidigeLesere: number };
export type WorkbenchSamletAnalyse = {
  vindu: SamletVindu; kilde: string; volum: Treningsvolum;
  runder: { id: string; dato: string; brutto: number; hull: number; sgKilde: string | null; sgTotal: number | null; sgOtt: number | null; sgApp: number | null; sgArg: number | null; sgPutt: number | null }[];
  tester: { id: string; testId: string; navn: string; dato: string; verdi: number; enhet: string | null }[];
  trackman: { id: string; dato: string; slag: number }[];
  sg: { roundCount: number; total: number | null; ott: number | null; app: number | null; arg: number | null; putt: number | null; referanse: string };
};
export type WorkbenchSamletData = {
  player: SamletSpiller; routeSurface: WorkbenchSurface; role: "player" | "coach"; flate: WorkbenchFlate;
  planKontekst: PlanKontekst; uke: WeekViewModel; kilder: SourceItem[];
  goals: PlanningGoalSummary[]; fys: WorkbenchFysTurneringData;
  roster: SamletSpiller[]; grupper: SamletSpiller[]; volum: Treningsvolum;
  volumKilde: string;
  valgtOkt: WorkbenchSession | null;
  sesong: WorkbenchSamletSesong | null; bord: WorkbenchSamletBord | null; analyse: WorkbenchSamletAnalyse | null;
  /** Ekstra datakilder kan feile uten å fremstilles som reelle tomme kilder. */
  varsler: string[];
};
export type SamletAkse = PyramidArea;
