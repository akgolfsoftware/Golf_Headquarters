import assert from "node:assert/strict";
import { mock,test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
mock.module("server-only", { defaultExport:{} });
mock.module("@/styles/precision-player-coach-upgrade.css", { namedExports:{} });
mock.module("next/navigation", { namedExports:{useRouter:()=>({refresh(){},push(){}}),unstable_rethrow(){} } });
mock.module("next/link", { defaultExport:"a" });
mock.module("@/lib/workbench/apply-template-actions", { namedExports:{
  coachApplyTemplateToGroup:async()=>({ok:false,error:"Kun syntetisk kontroll"}),
  forhaandsvisMalUtrulling:async()=>({ok:false,error:"Kun syntetisk kontroll"}),
  hentMalUtrullingGruppe:async()=>({ok:false,error:"Kun syntetisk kontroll"}),
  forhaandsvisMalGruppePublisering:async()=>({ok:false,error:"Kun syntetisk kontroll"}),
} });
mock.module("@/lib/workbench/group-session-actions", { namedExports:{ publishGroupWorkbenchSessions:async()=>({ok:false,error:"Kun syntetisk kontroll"}) } });
test("malvalget følger fra valgt inngang og ingen lagringskvittering vises før handling",async()=>{
  const {RullUtMalPanel}=await import("@/components/admin/v2/RullUtMalPanel");
  const html=renderToStaticMarkup(createElement(RullUtMalPanel,{groupId:"syntetisk-gruppe",initialTemplateId:"valgt-mal",maler:[{id:"forste-mal",name:"Første mal",varighetUker:1,sessionCount:2},{id:"valgt-mal",name:"Valgt mal",varighetUker:2,sessionCount:4}]}));
  assert.match(html,/<option value="valgt-mal" selected="">Valgt mal/);
  assert.match(html,/Personlige forslag · spilleren godtar/);assert.match(html,/Vis konkret utrulling/);
  assert.doesNotMatch(html,/Forslagene er opprettet|Gruppeutkastene er lagret|Gruppeøktene er publisert/);
});
test("lagrede gruppeutkast kan finnes igjen, men publisering krever et eksplisitt utvalg",async()=>{
  const {GruppeMalPublisering}=await import("@/components/admin/v2/GruppeMalPublisering");
  const html=renderToStaticMarkup(createElement(GruppeMalPublisering,{groupId:"syntetisk-gruppe",rows:[{id:"syntetisk-utkast",title:"Syntetisk lagret gruppeøkt",date:"2099-01-05",startMinute:480,durationMinutes:45,status:"DRAFT"}]}));
  assert.match(html,/Syntetisk lagret gruppeøkt/);assert.match(html,/08:00/);assert.match(html,/Utkast/);
  assert.match(html,/Vis og publiser valgte gruppeøkter/);assert.match(html,/disabled=""/);
  assert.doesNotMatch(html,/gruppeøkter er publisert/);
});
