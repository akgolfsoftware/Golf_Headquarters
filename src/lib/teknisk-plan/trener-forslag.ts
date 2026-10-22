import { z } from "zod";

/**
 * A2 (beslutninger §KODEGJENNOMGANGEN 06.10): en Team Norway-trener skriver aldri direkte i spillerens
 * tekniske plan. Treneren lagrer et forslag som `PlanAction`; spilleren godtar eller avviser i PlayerHQ,
 * og først ved godkjenning skrives planen. Ingen nytt skjema: `actionType` er en fritekstkolonne.
 */
export const TEKNISK_PLAN_FORSLAG_TYPE = "TECH_PLAN_COACH_PROPOSAL";

const Pyramide = z.enum(["FYS", "TEK", "SLAG", "SPILL", "TURN"]);
const Tall = z.number().int().min(0).max(100000);

export const OppgaveFelt = z.object({
  tittel: z.string().trim().min(1).max(200),
  beskrivelse: z.string().trim().max(2000).nullable(),
  pyramide: Pyramide,
  omraade: z.string().trim().min(1).max(200),
  koller: z.array(z.string().trim().min(1).max(60)).max(20),
  repsMaalDry: Tall,
  repsMaalLav: Tall,
  repsMaalFull: Tall,
}).strict();

export const TekniskPlanForslagSchema = z.discriminatedUnion("kind", [
  z.object({
    versjon: z.literal(1), kind: z.literal("REP_LOG"), planId: z.string().min(1), taskId: z.string().min(1),
    taskTittel: z.string().max(200), felt: z.enum(["dry", "lav", "full"]), antall: z.number().int().min(1).max(10000),
  }).strict(),
  z.object({
    versjon: z.literal(1), kind: z.literal("TASK_ADD"), planId: z.string().min(1),
    pNummer: z.string().min(1).max(20), pName: z.string().min(1).max(120), oppgave: OppgaveFelt,
  }).strict(),
  z.object({
    versjon: z.literal(1), kind: z.literal("TASK_UPDATE"), planId: z.string().min(1), taskId: z.string().min(1),
    taskTittel: z.string().max(200), oppgave: OppgaveFelt,
  }).strict(),
  z.object({
    versjon: z.literal(1), kind: z.literal("TASK_DELETE"), planId: z.string().min(1), taskId: z.string().min(1),
    taskTittel: z.string().max(200),
  }).strict(),
]);

export type OppgaveFeltData = z.infer<typeof OppgaveFelt>;
export type TekniskPlanForslag =z.infer<typeof TekniskPlanForslagSchema>;

const FELT_NAVN = { dry: "uten ball", lav: "lav hastighet", full: "automatikk" } as const;

/** Én setning i hverdagsspråk om hva forslaget gjør. Brukes i PlayerHQ-kortet. */
export function beskrivTekniskPlanForslag(f: TekniskPlanForslag): string {
  switch (f.kind) {
    case "REP_LOG": return `Logge ${f.antall} repetisjoner (${FELT_NAVN[f.felt]}) på «${f.taskTittel}»`;
    case "TASK_ADD": return `Legge til oppgaven «${f.oppgave.tittel}» på ${f.pNummer} ${f.pName}`;
    case "TASK_UPDATE": return `Endre oppgaven «${f.taskTittel}» til «${f.oppgave.tittel}»`;
    case "TASK_DELETE": return `Fjerne oppgaven «${f.taskTittel}»`;
  }
}
