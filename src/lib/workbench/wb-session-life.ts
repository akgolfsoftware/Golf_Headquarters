import { z } from "zod";

export const ExecutionPhaseSchema = z.enum(["ACTIVE", "PAUSED", "COMPLETED", "ABANDONED", "SKIPPED"]);
export const ExecutionCommandSchema = z.object({
  sessionId: z.string().min(1),
  expectedUpdatedAt: z.string().datetime(),
  requestId: z.string().min(8).max(100),
  action: z.enum(["PAUSE", "RESUME", "FINISH", "ABORT", "RECORD"]),
  outcome: z.enum(["COMPLETED", "ABANDONED", "SKIPPED"]).optional(),
  actualMinutes: z.number().int().min(0).max(1440).nullable().optional(),
  perceivedEffort: z.number().int().min(1).max(10).nullable().optional(),
  reason: z.string().trim().min(1).max(500).optional(),
}).strict().superRefine((input, ctx) => {
  if ((input.action === "RECORD" || input.action === "ABORT") && !input.reason) ctx.addIssue({code:"custom",path:["reason"],message:"Oppgi årsaken."});
  if (input.action === "RECORD" && !input.outcome) ctx.addIssue({code:"custom",path:["outcome"],message:"Velg gjennomføringsstatus."});
  if (["PAUSE", "RESUME"].includes(input.action) && (input.actualMinutes !== undefined || input.perceivedEffort !== undefined || input.outcome !== undefined)) ctx.addIssue({code:"custom",message:"Pause og fortsett endrer ikke registrerte resultater."});
});
export type ExecutionCommand = z.infer<typeof ExecutionCommandSchema>;
const EffortSchema = z.object({ status:z.string(), actualMinutes:z.number().nullable(), perceivedEffort:z.number().nullable() });
const EventSchema = z.object({
  requestId:z.string(), signature:z.string(), action:z.string(), at:z.string().datetime(), actorId:z.string(),
  reason:z.string().optional(), before:EffortSchema, after:EffortSchema,
}).passthrough();
export const ExecutionSchema = z.object({
  version:z.literal(1), phase:ExecutionPhaseSchema, accumulatedSec:z.number().int().min(0).max(604800),
  runningSinceISO:z.string().datetime().nullable(), events:z.array(EventSchema).max(1000),
}).passthrough();
export type SessionExecution = z.infer<typeof ExecutionSchema>;
export type SessionExecutionSnapshot = Record<string, unknown> & {
  totalSec: number;
  updatedAtISO: string;
  execution: SessionExecution;
};
export function jsonObject(value:unknown): Record<string,unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? value as Record<string,unknown> : null;
}
export function readSessionExecution(value:unknown): SessionExecution | null {
  const raw=jsonObject(value); const parsed=ExecutionSchema.safeParse(raw?.execution); return parsed.success?parsed.data:null;
}
export function executionSeconds(execution:SessionExecution, now=Date.now()):number {
  const running=execution.phase === "ACTIVE" && execution.runningSinceISO ? Math.max(0,Math.floor((now-Date.parse(execution.runningSinceISO))/1000)):0;
  return Math.min(604800,execution.accumulatedSec+running);
}
export function executionSignature(input:ExecutionCommand):string {
  // Versionen er en forventning, ikke en del av ønsket mutasjon ved et identisk retry.
  return JSON.stringify([input.action,input.outcome??null,input.actualMinutes===undefined?"undefined":input.actualMinutes,input.perceivedEffort===undefined?"undefined":input.perceivedEffort,input.reason??null]);
}
export function initialSessionExecution(nowISO:string):SessionExecution {
  return {version:1,phase:"ACTIVE",accumulatedSec:0,runningSinceISO:nowISO,events:[]};
}
export function transitionSessionExecution(input:ExecutionCommand, row:{status:string;actualMinutes:number|null;perceivedEffort:number|null;liveSnapshot:unknown}, actorId:string, nowISO:string) {
  const raw = row.liveSnapshot == null ? {} : jsonObject(row.liveSnapshot);
  if (!raw) throw new Error("Eldre gjennomføringsdata må gjennomgås. Ingen data er endret.");
  if (raw.execution !== undefined && !readSessionExecution(raw)) throw new Error("Ukjent gjennomføringsversjon. Ingen data er endret.");
  let current=readSessionExecution(raw);
  const signature=executionSignature(input);
  const previous=current?.events.find(e=>e.requestId===input.requestId);
  if (previous) {
    if (previous.signature!==signature || previous.actorId!==actorId) throw new Error("Forespørselen er allerede brukt til en annen registrering.");
    return {retry:true as const};
  }
  if (input.action === "RECORD") {
    if (!["PUBLISHED","COMPLETED","SKIPPED","ABANDONED"].includes(row.status)) throw new Error("Avslutt pågående økt før etterregistrering. Utkast kan ikke registreres.");
  } else if (row.status !== "IN_PROGRESS") throw new Error("Økten er ikke pågående.");
  if (!current) {
    // Gamle snapshots beholdes; kjent varighet overføres uten å overskrive råfelt.
    const total=typeof raw.totalSec==="number" && Number.isInteger(raw.totalSec) && raw.totalSec>=0 && raw.totalSec<=604800 ? raw.totalSec : 0;
    const started=typeof raw.updatedAtISO==="string" && Number.isFinite(Date.parse(raw.updatedAtISO)) ? new Date(raw.updatedAtISO).toISOString() : nowISO;
    current={...initialSessionExecution(nowISO),accumulatedSec:total,runningSinceISO:started};
  }
  if (current.events.length >=1000) throw new Error("Gjennomføringshistorikken må gjennomgås før flere rettinger.");
  if (input.action === "PAUSE" && current.phase!=="ACTIVE") throw new Error("Økten er allerede satt på pause.");
  if (input.action === "RESUME" && current.phase!=="PAUSED") throw new Error("Bare en økt på pause kan fortsette.");
  const phase:SessionExecution["phase"]= input.action === "RECORD" ? input.outcome! : input.action === "PAUSE" ? "PAUSED" : input.action === "RESUME" ? "ACTIVE" : input.action === "ABORT" ? "ABANDONED" : "COMPLETED";
  const status = phase === "ACTIVE" || phase === "PAUSED" ? "IN_PROGRESS" : phase;
  const actualMinutes=input.actualMinutes===undefined?row.actualMinutes:input.actualMinutes;
  const perceivedEffort=input.perceivedEffort===undefined?row.perceivedEffort:input.perceivedEffort;
  const before={status:row.status,actualMinutes:row.actualMinutes,perceivedEffort:row.perceivedEffort};
  const execution:SessionExecution={...current,phase,accumulatedSec:executionSeconds(current,Date.parse(nowISO)),runningSinceISO:phase === "ACTIVE"?nowISO:null,
    events:[...current.events,{requestId:input.requestId,signature,action:input.action,at:nowISO,actorId,...(input.reason?{reason:input.reason}:{}),before,after:{status,actualMinutes,perceivedEffort}}]};
  const snapshot: SessionExecutionSnapshot = { ...raw, totalSec:execution.accumulatedSec, updatedAtISO:nowISO, execution };
  return {retry:false as const,status,actualMinutes,perceivedEffort,snapshot};
}

/** Avslutning fra eldre klienter bevarer hele snapshotet, også ukjente felt. */
export function sealSessionSnapshot(value:unknown, phase:"COMPLETED"|"ABANDONED"|"SKIPPED", nowISO:string):Record<string,unknown> {
  const raw=value==null?{}:jsonObject(value);
  if(!raw) throw new Error("Eldre gjennomføringsdata må gjennomgås før avslutning.");
  const current=readSessionExecution(raw);
  if(raw.execution!==undefined&&!current) throw new Error("Ukjent gjennomføringsversjon. Ingen data er endret.");
  const total=current?executionSeconds(current,Date.parse(nowISO)):typeof raw.totalSec==="number"&&Number.isInteger(raw.totalSec)&&raw.totalSec>=0&&raw.totalSec<=604800?raw.totalSec:0;
  return {...raw,totalSec:total,execution:{...(current??initialSessionExecution(nowISO)),phase,accumulatedSec:total,runningSinceISO:null}};
}

/** Planutkast kan fjernes; gjennomføring og rå historikk tilhører loggen. */
export function harGjennomforingshistorikk(row:{status:string;liveSnapshot:unknown;actualMinutes?:number|null;perceivedEffort?:number|null}):boolean {
  return ["IN_PROGRESS","COMPLETED","ABANDONED","SKIPPED"].includes(row.status) || row.liveSnapshot != null || row.actualMinutes != null || row.perceivedEffort != null;
}
