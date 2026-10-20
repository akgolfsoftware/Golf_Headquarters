/** Bare syntetiske månedsplaner. Ingen database eller faktiske spillere. */
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { MonthPlan } from "@/components/workbench/MonthPlan";
import { emptyMonthDetails, type MonthPlanView } from "@/lib/domain/month-plan";
export const sti = "/portal/planlegge/workbench?niva=maned";
const details = { ...emptyMonthDetails(), focus: "Avstandskontroll og rutine før hvert slag", goals: ["Før observasjon etter hver planlagt treningsøkt.", "Følg opp månedens valgte treningsområder."], purpose: "Syntetisk månedsplan for skjermkontroll.", location: "Treningsanlegg", priorities: { ...emptyMonthDetails().priorities, TEE_TOTAL: "VEDLIKEHOLDE" as const, INNSPILL_100: "UTVIKLE" as const }, volumeHours: { FYS: 8, TEK: 10, SLAG: 16, SPILL: 8, TURN: null }, note: "Dette er et syntetisk notat med en lengre tekst som skal brytes innenfor skjermbredden." };
const base: MonthPlanView = { owner: { kind: "player", playerId: "syntetisk-spiller" }, year: 2026, month: 10, id: "syntetisk-maaned", revision: 2, activeRevision: 1, details, proposedDetails: null, proposalStale: false, playerEvaluation: null, coachEvaluation: null, canEdit: true, canPropose: false, canRespond: true, evaluationRole: "spiller", ended: false };
const Vis = (props: Partial<MonthPlanView>) => { const data = { ...base, ...props }; return <PlayerHQSkall innboksHref="#" uleste={0}><div className="pa-side"><MonthPlan owner={data.owner} year={data.year} month={data.month} initialData={data} summary={{ plannedMinutes: 420, registeredMinutes: 180, tournaments: 1, tests: 2, source: "Syntetisk grunnlag for skjermkontroll." }} /></div></PlayerHQSkall>; };
export const tilstander = {
  plan: <Vis />,
  forslag: <Vis proposedDetails={{ ...details, focus: "Syntetisk coachforslag" }} />,
  tom: <Vis details={null} />,
  evaluert: <Vis ended playerEvaluation={{ authorId: "syntetisk-spiller", score: 4, text: "Syntetisk evaluering.", savedAt: "2026-11-01T08:00:00.000Z" }} />,
};
