import assert from 'node:assert/strict';
import { beforeEach, describe, mock, test } from 'node:test';
import * as React from 'react';
import { buildWeekViewModel, createSession } from '@/lib/domain/workbench/operations';
import type { Drill } from '@/lib/domain/workbench/types';
import type { OvelseInput } from '@/lib/domain/workbench/ovelse-utkast';
import { UI } from '@/lib/domain/workbench/labels';
const states=new Map<string,unknown[]>();let context='',cursor=0;
function draw<T>(id:string,fn:()=>T):T{context=id;cursor=0;return fn();}
function useState<T>(initial:T|(()=>T)):[T,(v:T|((old:T)=>T))=>void]{const slots=states.get(context)??[];states.set(context,slots);const i=cursor++;if(!(i in slots))slots[i]=typeof initial==='function'?(initial as ()=>T)():initial;return[slots[i] as T,v=>{slots[i]=typeof v==='function'?(v as(old:T)=>T)(slots[i] as T):v;}];}
mock.module("@/lib/workbench/wb-session-life-actions", { namedExports: { loadSessionExecution: async () => ({ ok: false, error: "Ubrukt gjennomføringslesing" }), mutateSessionExecution: async () => ({ ok: false, error: "Ubrukt gjennomføringshandling" }) } });
mock.module('react',{namedExports:{...React,useState,useEffect(){},useRef:()=>({current:null}),useCallback:(fn:unknown)=>fn,useMemo:(fn:()=>unknown)=>fn(),useTransition:()=>[false,()=>{}]}});
mock.module('next/link',{defaultExport:'a'});mock.module('next/navigation',{namedExports:{useRouter:()=>({replace(){}})}});mock.module('sonner',{namedExports:{toast:{success(){},error(){}}}});
mock.module('@/components/workbench/SourcesPanel',{namedExports:{SourcesPanel:'sources'}});mock.module('@/components/workbench/VisningPiller',{namedExports:{VisningPiller:'tabs'}});
const unused=()=>{throw Error('Uventet handling');};mock.module('@/lib/workbench/wb-actions',{namedExports:{addDrill:unused,loadWeek:unused,moveSession:unused,publishSessions:unused,removeDrill:unused,reorderDrills:unused,unpublishSession:unused}});
type Node=React.ReactElement<Record<string,unknown>>;
function nodes(n:React.ReactNode):Node[]{if(Array.isArray(n))return n.flatMap(nodes);if(!React.isValidElement<Record<string,unknown>>(n))return[];return[n,...nodes(n.props.children as React.ReactNode)];}
function find(tree:React.ReactNode,p:(n:Node)=>boolean):Node{const n=nodes(tree).find(p);assert.ok(n);return n;}
function field(tree:React.ReactNode,label:string):Node{const wrapper=find(tree,n=>n.type==='label'&&React.Children.toArray(n.props.children as React.ReactNode).some(c=>c===label));return find(wrapper.props.children as React.ReactNode,n=>n.type==='input'||n.type==='select');}
function change(n:Node,value:string){(n.props.onChange as(e:{target:{value:string}})=>void)({target:{value}});}
function button(tree:React.ReactNode,label:string){return find(tree,n=>n.type==='button'&&text(n.props.children as React.ReactNode).replace(/\s+/g,' ').trim()===label);}
function click(n:Node){(n.props.onClick as()=>void)();}
function text(n:React.ReactNode):string{if(Array.isArray(n))return n.map(text).join(' ');if(React.isValidElement<Record<string,unknown>>(n))return text(n.props.children as React.ReactNode);return typeof n==='string'||typeof n==='number'?String(n):'';}
beforeEach(()=>states.clear());
describe('nye Workbench-øvelsesfelter',async()=>{
const {OvelseSkjema}=await import('@/components/workbench/OvelseSkjema');
const {WorkbenchOkt}=await import('@/components/workbench/WorkbenchOkt');
test('ekte editor oppretter segmenter/utstyr, forhåndsutfyller, avviser feil, bevarer gren og tømmer',()=>{
 const captured:OvelseInput[]=[];const saved=()=>captured.at(-1);const create=()=>draw('create',()=>OvelseSkjema({standardPyramide:'FYS',disabled:false,utseende:'precision',onSubmit:o=>{captured.push(o);}}));
 change(field(create(),UI.drillTitle),'Syntetisk kondisjon');change(field(create(),UI.drillArea),'KONDISJON');
 click(button(create(),'Legg til segment'));change(field(create(),'Segment 1 tid (min)'),'5');change(field(create(),'Segment 1 pulssone'),'S1');
 click(button(create(),'Legg til segment'));change(field(create(),'Segment 2 tid (min)'),'10');change(field(create(),'Segment 2 pulssone'),'S3');
 click(button(create(),'Legg til utstyr'));change(field(create(),'Utstyr 1'),'Syntetisk mølle');
 click(button(create(),'Legg til utstyr'));change(field(create(),'Utstyr 2'),'Markør');change(field(create(),'Utstyr 2 antall'),'0');
 click(find(create(),n=>n.props.role==='radio'&&n.props.children instanceof Array&&n.props.children.includes('SPILL')));
 change(field(create(),'Enhet'),'OPPGAVER');change(field(create(),'Oppgaver'),'12');
 click(find(create(),n=>n.props.role==='radio'&&n.props.children instanceof Array&&n.props.children.includes('FYS')));
 assert.equal(field(create(),'Segment 2 pulssone').props.value,'S3');assert.equal(field(create(),'Utstyr 1 antall').props.value,'');
 click(button(create(),UI.addDrill));assert.ok(saved());const original:Drill={...saved()!,id:'stabil-id',order:0};assert.equal(original.akFormel.detaljer?.utstyr?.[0].antall,undefined);
 const edit=()=>draw('edit',()=>OvelseSkjema({standardPyramide:'FYS',drill:original,disabled:false,utseende:'precision',onSubmit:o=>{captured.push(o);}}));
 assert.equal(field(edit(),'Segment 2 tid (min)').props.value,'10');assert.equal(field(edit(),'Utstyr 2 antall').props.value,'0');
 change(field(edit(),'Segment 1 tid (min)'),'0');captured.length=0;click(button(edit(),'Lagre øvelse'));assert.equal(saved(),undefined);assert.match(text(edit()),/positiv tid/);
 change(field(edit(),'Segment 1 tid (min)'),'7');click(button(edit(),'Fjern segment 2'));click(button(edit(),'Fjern utstyr 2'));click(button(edit(),'Lagre øvelse'));assert.ok(saved());assert.equal(saved()!.akFormel.detaljer?.kondisjonssegmenter?.length,1);
 click(button(edit(),'Fjern segment 1'));click(button(edit(),'Fjern utstyr 1'));click(button(edit(),'Lagre øvelse'));assert.ok(saved());assert.equal(saved()!.akFormel.detaljer?.kondisjonssegmenter,undefined);assert.equal(saved()!.akFormel.detaljer?.utstyr,undefined);
});
test('ekte RIR-felt min0/max4/step1 beholder historisk7 ved navneendring og avviser nye5/brøkdeler',()=>{
 const original:Drill={id:'historisk',order:0,title:'Før',durationMinutes:20,akFormel:{pyramid:'FYS',area:'STYRKE',label:'Fysisk',detaljer:{mengde:{enhet:'SERIER',reps:6,rir:7}}}};const captured:OvelseInput[]=[];const saved=()=>captured.at(-1);
 const edit=()=>draw('legacy',()=>OvelseSkjema({standardPyramide:'FYS',drill:original,disabled:false,utseende:'precision',onSubmit:o=>{captured.push(o);}}));
 const rir=field(edit(),'RIR');assert.equal(rir.props.min,0);assert.equal(rir.props.max,4);assert.equal(rir.props.step,1);assert.equal(rir.props.value,'7');
 change(field(edit(),UI.drillTitle),'Endret navn');click(button(edit(),'Lagre øvelse'));assert.equal(saved()?.akFormel.detaljer?.mengde?.rir,7);
 for(const value of ['5','4.4']){captured.length=0;change(field(edit(),'RIR'),value);click(button(edit(),'Lagre øvelse'));assert.equal(saved(),undefined);assert.match(text(edit()),/RIR må være et heltall 0–4/);}
 change(field(edit(),'RIR'),'0');click(button(edit(),'Lagre øvelse'));assert.equal(saved()?.akFormel.detaljer?.mengde?.rir,0);
});
test('Workbench økt viser lagrede segmenter/utstyr og dose uten antall',()=>{
 const session=createSession({playerId:'syntetisk',coachId:'coach',date:'2027-01-04',startMinute:600,durationMinutes:60,title:'Syntetisk',pyramid:'FYS',createdBy:'PLAYER',drills:[{title:'Styrke',durationMinutes:20,akFormel:{pyramid:'FYS',area:'STYRKE',label:'Fysisk',detaljer:{mengde:{enhet:'SERIER',reps:6,vektKg:0,rir:0},utstyr:[{navn:'Markør'}],kondisjonssegmenter:[{minutter:5,pulssone:'S1'}]}}}]});
 const tree=draw('view',()=>WorkbenchOkt({playerId:'syntetisk',spillerNavn:'Syntetisk',uke:buildWeekViewModel('2027-01-04',[session],[],{kind:'PLAYER',subjectId:'syntetisk',sources:[]}),kilder:[]}));
 const inspector=find(tree,n=>typeof n.type==='function'&&n.type.name==='SessionEditor');const details=draw('inspector',()=>(inspector.type as (props:Record<string,unknown>)=>React.ReactNode)(inspector.props));
 assert.match(text(details),/6 repetisjoner · 0 kg · RIR 0/);assert.match(text(details),/5 min · S1/);assert.match(text(details),/Markør · antall ikke registrert/);
});

});
