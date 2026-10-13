import type { ReactNode } from "react";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { WangAppSkall } from "@/components/wang/WangAppSkall";
import { TnShell } from "@/components/team-norway/tn-shell";
import { GruppeDetaljV2, type GruppeDetaljV2Data, type GruppeDetaljV2Actions } from "@/components/admin/v2/GruppeDetaljV2";
import { GruppeTimeplanV2, type GruppeTimeplanV2Data } from "@/components/admin/v2/GruppeTimeplanV2";
import { SkoledataForm } from "@/app/admin/grupper/[id]/arsplan/skoledata/skoledata-form";
import { Sidehode } from "@/components/precision/pa";
import "@/styles/wang-tokens.css";
import "@/styles/wang-app.css";
import "@/styles/precision-grupper.css";
export const sti = "/admin/grupper/syntetisk-gruppe";
const group: GruppeDetaljV2Data = { id:"syntetisk-gruppe",navn:"Syntetisk golfgruppe",type:"Skole",antallMedlemmer:1,antallHjelpetrenere:0,snittHcp:"3,5",totalRunder:0,proAndel:0,antallSamlinger:1,coachNavn:"Test Trener",coachEpost:null,nesteSamling:{id:"syntetisk-samling",title:"Felles trening",startAt:"2026-10-19T06:00:00Z",location:"Lokalt testgrunnlag",recurring:"WEEKLY",maxParticipants:12,description:"Syntetisk innhold for visuell kontroll."},kommendeSamlinger:[],medlemmer:[{id:"medlem",userId:"test",navn:"Test Spiller",avatarUrl:null,homeClub:"Testklubb",erHjelpetrener:false,erTrener:false,erPro:false,schoolYear:"VG1",hcp:3.5,runder90d:0,planNavn:null,planAndel:0,planDone:0,planTotal:0}],trinnValg:["VG1","VG2"],aktivtTrinn:null,kandidater:[],trenerKandidater:[] };
const A: GruppeDetaljV2Actions = {
  StartOktButton:()=> <button className="pa-btn pa-btn--secondary">Ny booking</button>,
  LeggTilSpillerButton:()=> <button className="pa-btn pa-btn--secondary">Legg til medlem</button>,
  FjernMedlemButton:()=> <button className="pa-btn pa-btn--ghost">Fjern medlem</button>,
  SeAlleTimePlanButton:()=> <a href="#" className="pa-btn pa-btn--ghost">Se timeplan</a>,
  DetaljerButton:()=> <a href="#" className="pa-btn pa-btn--ghost">Detaljer</a>,
  AapneButton:()=> <a href="#" className="pa-btn pa-btn--ghost">Åpne</a>,
  SlettGruppeButton:()=> <button className="pa-btn pa-btn--ghost">Slett gruppe</button>,
};
const plan: GruppeTimeplanV2Data = { groupId:group.id,navn:group.navn,totaltAntall:1,faste:[{...group.nesteSamling!,description:"Lokalt testgrunnlag",endAt:"2026-10-19T08:00:00Z"}],kommende:[],tidligere:[],focusId:null };
function frame(org:"ak"|"wang"|"tn",body:ReactNode) {
  const child=<div className="group-content">{body}</div>;
  if(org==="wang") return <div className="pa-root wang-tp wang-app" data-org="wang"><WangAppSkall rolle="Trener" brukerNavn="Test Trener" aktivtOmraade="trening">{child}</WangAppSkall></div>;
  if(org==="tn") return <div className="pa-root tn-app" data-org="team-norway"><TnShell aktiv="workbench" brukerNavn="Test Trener" rolle="Trener" groupId={group.id} visTrenerflater kanAdministrere={false}>{child}</TnShell></div>;
  return <AgencyOSSkall navn="Test Trener">{child}</AgencyOSSkall>;
}
const medlemmer=<GruppeDetaljV2 data={group} actions={A} />;
const timeplan=<GruppeTimeplanV2 data={plan} onOpprett={async()=>({ok:false,feil:"Syntetisk lagringsfeil. Ingen database."})} onDupliser={async()=>({ok:false,feil:"Syntetisk lagringsfeil. Ingen database."})} />;
export const tilstander={ ak:frame("ak",medlemmer),wang:frame("wang",medlemmer),tn:frame("tn",medlemmer),wangTimeplan:frame("wang",timeplan),tnTimeplan:frame("tn",timeplan),skoledata:frame("wang",<><Sidehode title="Legg inn skoledata" /><SkoledataForm groupId={group.id} /></>) };
