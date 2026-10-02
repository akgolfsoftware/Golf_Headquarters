import assert from 'node:assert/strict';
import { beforeEach, describe, mock, test } from 'node:test';
import * as React from 'react';
import { buildWeekViewModel, createSession } from '@/lib/domain/workbench/operations';
import type { Drill } from '@/lib/domain/workbench/types';
import type { OvelseInput } from '@/lib/domain/workbench/ovelse-utkast';
import type { UpdateDrillInput } from '@/lib/workbench/wb-actions';
import { UI } from '@/lib/domain/workbench/labels';
const states=new Map<string,unknown[]>();let context='',cursor=0;
const pending:Promise<unknown>[]=[];
function draw<T>(id:string,fn:()=>T):T{context=id;cursor=0;return fn();}
function useState<T>(initial:T|(()=>T)):[T,(v:T|((old:T)=>T))=>void]{
 const slots=states.get(context)??[];states.set(context,slots);const i=cursor++;
 if(!(i in slots))slots[i]=typeof initial==='function'?(initial as ()=>T)():initial;
 return [slots[i] as T,v=>{slots[i]=typeof v==='function'?(v as (old:T)=>T)(slots[i] as T):v;}];
}
mock.module('react',{namedExports:{...React,useState,useEffect(){},useRef:()=>({current:null}),useCallback:(fn:unknown)=>fn,useMemo:(fn:()=>unknown)=>fn(),useTransition:()=>[false,(fn:()=>Promise<unknown>)=>pending.push(fn())]}});
mock.module('sonner',{namedExports:{toast:{success(){},error(){}}}});
mock.module('next/link',{defaultExport:'a'});
for(const css of ['precision-a4.css','precision-a9.css']) mock.module(`@/styles/${css}`,{namedExports:{}});
mock.module('@/components/precision/pa',{namedExports:{Ikon:'i',Knapp:'button',AKSE_NAVN:{fys:'FYS',tek:'TEK',slag:'SLAG',spill:'SPILL',turn:'TURN'}}});
mock.module('@/components/precision/pa-a4',{namedExports:{Ark:'sheet',Dialogboks:'dialog',Nokkelverdi:'values'}});
mock.module('@/components/precision/pa-a5',{namedExports:{InlineVarsel:'warning'}});
mock.module('@/components/precision/pa-a2',{namedExports:{Sokefelt:'input'}});
mock.module('@/components/precision/pa-workbench',{namedExports:{AKSER:['fys','tek','slag','spill','turn'],Caps:'small',Valgpille:'pill',akseFra:(v:string)=>v.toLowerCase(),akseStil:()=>({})}});
let row=createSession({playerId:'syntetisk-p1',coachId:'syntetisk-c1',date:'2026-10-02',startMinute:600,durationMinutes:60,title:'Syntetisk økt',pyramid:'TEK',createdBy:'COACH'});
let fail=false;const patches:UpdateDrillInput[]=[];
const unused=()=>{throw Error('Uventet handling');};
mock.module('@/lib/workbench/wb-actions',{namedExports:{
 createSession:unused,createSessionSeries:unused,createSessionFromSource:unused,deleteSession:unused,deleteSessionSeries:unused,moveSession:unused,publishSessions:unused,removeDrill:unused,reorderDrills:unused,setSessionTemplate:unused,unpublishSession:unused,updateSessionEffort:unused,saveWeekPlan:unused,addDrillFromSource:unused,
 loadWeek:async()=>({ok:true,data:buildWeekViewModel('2026-09-28',[row],[],{kind:'PLAYER',subjectId:'syntetisk-p1',sources:[]})}),
 addDrill:async({drill}:{drill:OvelseInput})=>{row={...row,drills:[{...drill,id:'stabil-drill',order:0}]};return{ok:true,data:row};},
 updateSeriesSession:async()=>({ok:false,error:'Syntetisk'}),
 updateDrill:async(input:UpdateDrillInput)=>{
  patches.push(input);if(fail)return{ok:false,error:'Syntetisk lagringsfeil'};
  const previous=row.drills[0];const p=input.patch;
  row={...row,drills:[{...previous,title:p.title??previous.title,durationMinutes:p.durationMinutes??previous.durationMinutes,
   description:p.description===null?undefined:p.description??previous.description,techniqueFocus:p.techniqueFocus===null?undefined:p.techniqueFocus??previous.techniqueFocus,akFormel:p.akFormel??previous.akFormel}]};
  return{ok:true,data:row};
 },
}});
type Node=React.ReactElement<Record<string,unknown>>;
function nodes(n:React.ReactNode):Node[]{if(Array.isArray(n))return n.flatMap(nodes);if(!React.isValidElement<Record<string,unknown>>(n))return[];return[n,...nodes(n.props.children as React.ReactNode)];}
function find(tree:React.ReactNode,p:(n:Node)=>boolean):Node{const n=nodes(tree).find(p);assert.ok(n);return n;}
function field(tree:React.ReactNode,label:string):Node{
 const wrapper=find(tree,n=>n.type==='label'&&React.Children.toArray(n.props.children as React.ReactNode).some(c=>c===label));
 return find(wrapper.props.children as React.ReactNode,n=>n.type==='input'||n.type==='select');
}
function change(n:Node,value:string){(n.props.onChange as (e:{target:{value:string}})=>void)({target:{value}});}
function click(n:Node){(n.props.onClick as ()=>void)();}
async function settle(){while(pending.length)await pending.shift();}
beforeEach(()=>{states.clear();pending.length=0;patches.length=0;fail=false;row={...row,drills:[]};});
describe('Workbench: faktisk øvelsesskjema og motor',async()=>{
 const {OvelseSkjema}=await import('@/components/workbench/OvelseSkjema');
 const {useUkeMotor}=await import('@/components/workbench/useUkeMotor');
 const {OvelseArk,OktArk}=await import('@/components/admin/precision/AG11Ark');
 const week=()=>buildWeekViewModel('2026-09-28',[row],[],{kind:'PLAYER',subjectId:'syntetisk-p1',sources:[]});
 const motor=()=>draw('motor',()=>useUkeMotor({playerId:'syntetisk-p1',uke:week()}));
 test('opprett → forhåndsutfyll → rediger → feil → gjentakelse → les beholder ID og tømmer eksplisitt',async()=>{
  const create=()=>draw('ny',()=>OvelseSkjema({standardPyramide:'TEK',disabled:false,utseende:'precision',onSubmit:(o,done)=>motor().leggTilOvelse(row.id,o,done)}));
  change(field(create(),UI.drillTitle),'Syntetisk original');change(field(create(),UI.formelMate),'Opprinnelig beskrivelse');change(field(create(),UI.formelMal),'Opprinnelig mål');
  change(field(create(),'Slag'),'30');click(find(create(),n=>n.props.children===UI.addDrill));await settle();assert.equal(row.drills[0].title,'Syntetisk original');
  const original=row.drills[0];let closed=0;
  const ark=()=>OvelseArk({session:row,pyramide:'TEK',drill:original,travel:false,onLukk:()=>{closed++;},onSubmit:(o,done)=>motor().oppdaterOvelse(row.id,original.id,o,done)});
  const render=()=>draw('editor',()=>OvelseSkjema(find(ark(),n=>n.type===OvelseSkjema).props as Parameters<typeof OvelseSkjema>[0]));
  assert.equal(field(render(),UI.drillTitle).props.value,'Syntetisk original');assert.equal(field(render(),UI.formelMate).props.value,'Opprinnelig beskrivelse');assert.equal(field(render(),UI.formelMal).props.value,'Opprinnelig mål');assert.equal(field(render(),'Slag').props.value,'30');
  change(field(render(),UI.drillTitle),'Syntetisk endret');change(field(render(),UI.formelMate),'');change(field(render(),UI.formelMal),'');change(field(render(),'Slag'),'0');
  fail=true;click(find(render(),n=>n.props.children==='Lagre øvelse'));await settle();assert.equal(closed,0);assert.equal(field(render(),UI.drillTitle).props.value,'Syntetisk endret');assert.equal(row.drills[0].title,'Syntetisk original');
  fail=false;click(find(render(),n=>n.props.children==='Lagre øvelse'));await settle();assert.equal(closed,1);assert.equal(row.drills[0].id,original.id);assert.equal(row.drills[0].title,'Syntetisk endret');assert.equal(row.drills[0].description,undefined);assert.equal(row.drills[0].techniqueFocus,undefined);assert.equal(row.drills[0].akFormel.detaljer?.mengde?.antall,0);
  assert.equal(patches.at(-1)?.patch.description,null);assert.equal(patches.at(-1)?.patch.techniqueFocus,undefined);assert.equal(patches.at(-1)?.expectedUpdatedAt,row.updatedAt);
  states.delete('gjenapnet');const reopened=draw('gjenapnet',()=>OvelseSkjema({standardPyramide:'TEK',drill:row.drills[0],disabled:false,utseende:'precision',onSubmit(){}}));
  assert.equal(field(reopened,UI.drillTitle).props.value,'Syntetisk endret');assert.equal(field(reopened,'Slag').props.value,'0');assert.equal(field(reopened,UI.formelMal).props.value,'');
 });
 test('OktArk har faktisk redigeringsknapp med riktig øvelse og travel-vakt',()=>{
  const drill:Drill={id:'stabil-drill',title:'Syntetisk',durationMinutes:15,order:0,akFormel:{pyramid:'TEK',area:'TEE_TOTAL',label:'Test'}};row={...row,drills:[drill]};let chosen:Drill|undefined;
  const render=(travel=false)=>{const m=motor();return draw('okt',()=>OktArk({session:row,spillerNavn:'Syntetisk spiller',motor:{...m,travel},onLukk(){},onApneOkt(){},onNyOvelse(){},onRedigerOvelse:(_s,d)=>{chosen=d;}}));};
  const button=find(render(),n=>n.props['aria-label']==='Rediger Syntetisk');click(button);assert.equal(chosen,drill);assert.equal(find(render(true),n=>n.props['aria-label']==='Rediger Syntetisk').props.disabled,true);
 });
});
