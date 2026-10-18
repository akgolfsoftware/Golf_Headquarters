"use client";
import { useRef, useState, useTransition } from "react";
import { useRouter, unstable_rethrow } from "next/navigation";
import { Knapp } from "@/components/precision/pa";
import { Dialogboks } from "@/components/precision/pa-a4";
import { forhaandsvisMalGruppePublisering } from "@/lib/workbench/apply-template-actions";
import { publishGroupWorkbenchSessions } from "@/lib/workbench/group-session-actions";
type Row = { id:string; title:string; date:string; startMinute:number; durationMinutes:number; status:string };
type Preview = Extract<Awaited<ReturnType<typeof forhaandsvisMalGruppePublisering>>, {ok:true}>["data"];
const klokke = (min:number) => `${String(Math.floor(min/60)).padStart(2,"0")}:${String(min%60).padStart(2,"0")}`;
/** Kan brukes straks etter utrulling og til lagrede gruppeutkast etter gjenåpning. */
export function GruppeMalPublisering({ groupId,sessionIds,rows,onPublished,flere }: {groupId:string;sessionIds?:readonly string[];rows?:readonly Row[];onPublished?:()=>void;flere?:boolean}) {
  const router=useRouter(); const [selected,setSelected]=useState<string[]>([]);
  const [preview,setPreview]=useState<Preview|null>(null),[error,setError]=useState<string|null>(null);
  const [receipt,setReceipt]=useState<number|null>(null),[pending,start]=useTransition(); const lock=useRef(false);
  const ids=sessionIds?[...sessionIds]:selected;
  const tilgjengelige=rows?.filter(r=>["DRAFT","SCHEDULED","PUBLISHED"].includes(r.status))??[];
  function vis() {
    if(!ids.length||lock.current)return;lock.current=true;
    start(async()=>{setError(null);setReceipt(null);try {
      const response=await forhaandsvisMalGruppePublisering(groupId,ids);
      if(!response.ok){setError(response.error);return;}setPreview(response.data);
    }catch(error){unstable_rethrow(error);setError("Publiseringen kunne ikke forhåndsvises. Utvalget er beholdt.");}finally{lock.current=false;}});
  }
  function bekreft() {
    if(!preview||lock.current)return;lock.current=true;
    start(async()=>{setError(null);try {
      const response=await publishGroupWorkbenchSessions({groupId,sessionIds:preview.sources.map(s=>s.id),expected:preview.expected});
      if(!response.ok){setError(response.error);return;}setReceipt(response.data.length);setPreview(null);setSelected([]);onPublished?.();router.refresh();
    }catch(error){unstable_rethrow(error);setError("Publiseringen kunne ikke bekreftes. Utkastene er beholdt.");}finally{lock.current=false;}});
  }
  return <section className="mal-group-publication" aria-busy={pending}>
    {rows&&<><h2>Lagrede gruppeøkter</h2><p>Velg øktene og se faktiske mottakere før publisering.</p>
      {flere&&<p>Viser de 100 neste gruppeøktene. Publiser et utvalg om gangen.</p>}
      {!tilgjengelige.length?<p>Ingen kommende gruppeøkter er lagret her.</p>:<><Knapp variant="ghost" disabled={pending} onClick={()=>setSelected(selected.length===tilgjengelige.length?[]:tilgjengelige.map(r=>r.id))}>{selected.length===tilgjengelige.length?"Fjern utvalget":"Velg alle viste økter"}</Knapp><div className="mal-rollout__recipients">{tilgjengelige.map(row=><label key={row.id}><input type="checkbox" checked={selected.includes(row.id)} disabled={pending} onChange={e=>setSelected(e.target.checked?[...selected,row.id]:selected.filter(id=>id!==row.id))}/><span><strong>{row.title}</strong><small>{row.date} · {klokke(row.startMinute)} · {row.durationMinutes} min · {row.status==="PUBLISHED"?"Publisert":"Utkast"}</small></span></label>)}</div></>}
    </>}
    <Knapp variant="secondary" disabled={pending||!ids.length} loading={pending} onClick={vis}>Vis og publiser {ids.length||"valgte"} gruppeøkter</Knapp>
    {error&&!preview&&<p role="alert" className="mal-rollout__error">{error}</p>}
    {receipt!==null&&<p role="status">{receipt} gruppeøkter er publisert.</p>}
    <Dialogboks open={Boolean(preview)} title="Publisere disse gruppeøktene?" onClose={()=>{if(!pending)setPreview(null);}} footer={<><Knapp variant="secondary" disabled={pending} onClick={()=>setPreview(null)}>Behold utkast</Knapp><Knapp disabled={pending} loading={pending} onClick={bekreft}>Bekreft publisering</Knapp></>}>
      <p>Dette publiserer gruppens økter. Spillerens egne tilpasninger og gjennomførte historikk bevares.</p>
      {error&&<p role="alert" className="mal-rollout__error">{error}</p>}
      <h3>Faktiske mottakere</h3><ul>{preview?.recipients.map(r=><li key={r.id}>{r.name} · {r.sessions} økter</li>)}</ul>
      <h3>Øktene som publiseres</h3><ol>{preview?.sources.map(s=><li key={s.id}><strong>{s.title}</strong><p>{s.date} · {klokke(s.startMinute)}–{klokke(s.startMinute+s.durationMinutes)} · {s.durationMinutes} min</p>{s.notes&&<p>{s.notes}</p>}<ul>{s.drills.map((d,i)=><li key={i}>{d.title} · {d.durationMinutes} min</li>)}</ul></li>)}</ol>
    </Dialogboks>
  </section>;
}
