"use client";
import { useEffect, useRef, useState, useTransition } from "react";
import type { WorkbenchSession } from "@/lib/domain/workbench/types";
import { STATUS_LABEL } from "@/lib/domain/workbench/labels";
import { loadSessionExecution, mutateSessionExecution } from "@/lib/workbench/wb-session-life-actions";
import { executionSignature, type ExecutionCommand, type SessionExecution } from "@/lib/workbench/wb-session-life";

type Props = {
  session: WorkbenchSession;
  execution?: SessionExecution | null;
  live?: boolean;
  beforeAction?: () => Promise<string | null>;
  onSaved?: (session:WorkbenchSession, execution:SessionExecution|null)=>void;
};
/** Én registrering på samme økt. Tom faktisk tid betyr uttrykkelig «ikke registrert». */
export function SessionExecutionPanel({session:initial,execution:provided,live=false,beforeAction,onSaved}:Props) {
  const sessionId=initial.id;
  const [session,setSession]=useState(initial);
  const [execution,setExecution]=useState<SessionExecution|null>(provided??null);
  const [version,setVersion]=useState(initial.updatedAt);
  const [minutes,setMinutes]=useState(initial.actualMinutes == null ? "" : String(initial.actualMinutes));
  const [effort,setEffort]=useState(initial.perceivedEffort == null ? "" : String(initial.perceivedEffort));
  const [reason,setReason]=useState("");
  const [outcome,setOutcome]=useState<"COMPLETED"|"SKIPPED"|"ABANDONED">(initial.status === "SKIPPED" || initial.status === "ABANDONED" ? initial.status : "COMPLETED");
  const [saving,setSaving]=useState<"confirmed"|"saving"|"error">("confirmed");
  const [error,setError]=useState<string|null>(null);
  const [unknown,setUnknown]=useState(false);
  const [ready,setReady]=useState(false);
  const [pending,startTransition]=useTransition();
  const pendingRequest=useRef<ExecutionCommand|null>(null);
  useEffect(()=>{
    let active=true;
    loadSessionExecution(sessionId).then(result=>{
      if(!active)return;
      if(!result.ok){setError(result.error);return;}
      setExecution(result.data.execution);setUnknown(result.data.unknownVersion);setVersion(result.data.updatedAt);
      setSession(result.data.session);setMinutes(result.data.session.actualMinutes==null?"":String(result.data.session.actualMinutes));setEffort(result.data.session.perceivedEffort==null?"":String(result.data.session.perceivedEffort));setReady(true);
    }).catch(()=>{if(active)setError("Gjennomføringshistorikken kunne ikke hentes.");});
    return ()=>{active=false;};
  },[sessionId]);
  const number=(value:string)=>value.trim()===""?null:Number(value);
  const valid=(value:string,max:number,min=0)=>value.trim()===""||(Number.isInteger(Number(value))&&Number(value)>=min&&Number(value)<=max);
  function act(action:ExecutionCommand["action"]) {
    if(!valid(minutes,1440)||!valid(effort,10,1)){setError("Bruk hele minutter fra 0 til 1440 og anstrengelse fra 1 til 10.");setSaving("error");return;}
    if((action==="RECORD"||action==="ABORT")&&!reason.trim()){setError("Oppgi årsaken før du lagrer.");setSaving("error");return;}
    setSaving("saving");setError(null);
    startTransition(async()=>{
      try {
        const expected=beforeAction ? await beforeAction() : version;
        if(!expected){setSaving("error");setError("Live-data er ikke bekreftet lagret. Prøv lagring igjen før du fortsetter.");return;}
        const desired:ExecutionCommand={sessionId:session.id,expectedUpdatedAt:expected,
          requestId:pendingRequest.current?.requestId??crypto.randomUUID(),action,...(action==="RECORD"?{outcome}:{}),
          ...(["FINISH","ABORT","RECORD"].includes(action)?{actualMinutes:number(minutes),perceivedEffort:number(effort)}:{}),
          ...(reason.trim()?{reason:reason.trim()}:{}),};
        if(!pendingRequest.current||executionSignature(pendingRequest.current)!==executionSignature(desired)||pendingRequest.current.sessionId!==desired.sessionId) {
          desired.requestId=crypto.randomUUID();pendingRequest.current=desired;
        }
        const result=await mutateSessionExecution(pendingRequest.current);
        if(!result.ok){setSaving("error");setError(result.error);return;}
        pendingRequest.current=null;
        setSession(result.data);setVersion(result.data.updatedAt);setSaving("confirmed");setReason("");
        const next=result.execution??execution;
        setExecution(next);
        onSaved?.(result.data,next);
        // Mutasjonen er bekreftet. En separat lesefeil skal ikke gjøre lagringen ukjent.
        try {
          const details=await loadSessionExecution(session.id);
          if(details.ok){setExecution(details.data.execution);setUnknown(details.data.unknownVersion);}
          else setError("Lagringen er bekreftet, men historikken kunne ikke hentes på nytt.");
        } catch {setError("Lagringen er bekreftet, men historikken kunne ikke hentes på nytt.");}
      } catch {setSaving("error");setError("Gjennomføringen kunne ikke bekreftes lagret.");}
    });
  }
  const paused=execution?.phase==="PAUSED";
  const eligible=!session.isTemplate&&!session.hiddenByPlayer&&!session.needsPlayerApproval&&session.approvalStatus!=="REJECTED";
  const disabled=pending||saving==="saving"||unknown||!eligible||!ready;
  return <section className="wb-week-summary" aria-label="Gjennomføring">
    <span className="wb-kicker">Gjennomføring</span>
    <p>{ready?(paused?"På pause":STATUS_LABEL[session.status]):"Henter økten …"}</p>
    <p role="status">{!ready?"Henter gjennomføring …":saving==="saving"?"Lagrer …":saving==="error"?"Ikke lagret":"Lagring bekreftet"}</p>
    {ready?<dl><div><dt>Planlagt tid</dt><dd>{session.durationMinutes} min</dd></div><div><dt>Faktisk tid</dt><dd>{session.actualMinutes == null?"Ikke registrert":`${session.actualMinutes} min`}</dd></div></dl>:null}
    {unknown?<p role="alert">Ukjent gjennomføringsversjon er bevart. Gjennomgå data før redigering.</p>:null}
    {error?<p role="alert">{error}</p>:null}
    {eligible&&["PUBLISHED","IN_PROGRESS","COMPLETED","SKIPPED","ABANDONED"].includes(session.status)?<div className="wb-session-editor">
      <label>Faktiske minutter<input aria-label="Faktiske minutter" type="number" min={0} max={1440} step={1} value={minutes} disabled={disabled} onChange={e=>setMinutes(e.target.value)}/></label>
      <small>Tomt felt betyr ikke registrert. 0 betyr registrert null minutter.</small>
      <label>Opplevd anstrengelse (1–10)<input aria-label="Opplevd anstrengelse" type="number" min={1} max={10} step={1} value={effort} disabled={disabled} onChange={e=>setEffort(e.target.value)}/></label>
      <label>Årsak til retting eller avbrudd<textarea aria-label="Årsak" maxLength={500} value={reason} disabled={disabled} onChange={e=>setReason(e.target.value)}/></label>
      {live&&session.status==="IN_PROGRESS"?<div className="wb-mobile-actions">
        <button type="button" className="wb-quiet" disabled={disabled} onClick={()=>act(paused?"RESUME":"PAUSE")}>{paused?"Fortsett økt":"Pause økt"}</button>
        <button type="button" className="wb-publish" disabled={disabled} onClick={()=>act("FINISH")}>Fullfør økt</button>
        <button type="button" className="wb-quiet" disabled={disabled} onClick={()=>act("ABORT")}>Avbryt økt</button>
      </div>:session.status!=="IN_PROGRESS"?<>
        <label>Registrert gjennomføring<select aria-label="Registrert gjennomføring" value={outcome} disabled={disabled} onChange={e=>setOutcome(e.target.value as typeof outcome)}><option value="COMPLETED">Gjennomført</option><option value="SKIPPED">Ikke utført</option><option value="ABANDONED">Avbrutt</option></select></label>
        <button type="button" className="wb-publish" disabled={disabled} onClick={()=>act("RECORD")}>Lagre etterregistrering</button>
      </>:<p>Pause eller avslutt økten i Live før etterregistrering.</p>}
    </div>:null}
    {execution?.events.length?<details><summary>Registreringshistorikk ({execution.events.length})</summary><ol>{execution.events.map(event=><li key={event.requestId}><time dateTime={event.at}>{new Intl.DateTimeFormat("nb-NO",{dateStyle:"short",timeStyle:"short",timeZone:"Europe/Oslo"}).format(new Date(event.at))}</time> · {event.action === "RECORD" ? "Etterregistrert / rettet" : event.action === "PAUSE" ? "Pause" : event.action === "RESUME" ? "Fortsatt" : event.action === "ABORT" ? "Avbrutt" : "Gjennomført"}{event.reason?` · ${event.reason}`:""}<p>{event.before.actualMinutes==null?"Ikke registrert":`${event.before.actualMinutes} min`} → {event.after.actualMinutes==null?"Ikke registrert":`${event.after.actualMinutes} min`}</p></li>)}</ol></details>:null}
  </section>;
}
