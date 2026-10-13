import { describe, mock, test } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { CoachingVideoData } from "@/components/admin/precision/agency-completion/CoachingVideoManager";
mock.module("next/link",{defaultExport:"a"});
mock.module("next/navigation",{namedExports:{useRouter:()=>({refresh(){},replace(){}})}});
mock.module("@/components/admin/precision/agency-completion/CoachingVideoManager.module.css",{defaultExport:{}});
mock.module("@/lib/storage/video",{namedExports:{createVideoUploadTicket:()=>{assert.fail("ingen upload ved rendering");},confirmVideoUpload:()=>{assert.fail("ingen bekreftelse ved rendering");},getSignedVideoUrl:()=>{assert.fail("URL skal hentes først ved avspilling");},deleteVideo:()=>{assert.fail("ingen sletting ved rendering");}}});
mock.module("@/lib/storage/direct-video-client",{namedExports:{uploadSignedVideo:()=>{assert.fail("ingen filsendig ved rendering");}}});
const empty:CoachingVideoData={players:[],bookings:[],videos:[],total:0,page:1,pageSize:50,initialPlayerId:""};
const row:CoachingVideoData["videos"][number]={id:"egen-video",title:"Testvideo",playerId:"egen-spiller",playerName:"Testspiller",coachName:"Testcoach",status:"PROCESSING",createdLabel:"13. oktober 2026",sizeLabel:"1 MB",tag:null,notes:null,canConfirm:true,canDelete:false};
describe("Precision coachingvideo med faktisk innhold",async()=>{
 const {CoachingVideoManager}=await import("@/components/admin/precision/agency-completion/CoachingVideoManager");
 const vis=(data:CoachingVideoData)=>renderToStaticMarkup(createElement(CoachingVideoManager,{data}));
 test("tomt scope gir vei til Stall og ingen falsk opplastingshandling",()=>{
  const html=vis(empty);assert.match(html,/Ingen spillere med coachingtilgang/);assert.match(html,/href="\/admin\/spillere"/);assert.doesNotMatch(html,/IKKE KOBLET|Last opp og del/);
 });
 test("bookingvalg viser bare bookinger for den valgte egne spilleren",()=>{
  const html=vis({...empty,players:[{id:"egen-spiller",name:"Testspiller"},{id:"egen-spiller-2",name:"Annen testspiller"}],initialPlayerId:"egen-spiller",bookings:[{id:"booking-a",playerId:"egen-spiller",label:"Egen booking A"},{id:"booking-b",playerId:"egen-spiller-2",label:"Booking B"}]});
  assert.match(html,/Egen booking A/);assert.doesNotMatch(html,/Booking B/);assert.match(html,/Last opp og del/);
 });
 test("uavklart fil vises ærlig og verken spiller av eller slettes",()=>{
  const html=vis({...empty,videos:[row],total:1});assert.match(html,/Lagring er ikke bekreftet/);assert.match(html,/Kontroller lagring/);assert.doesNotMatch(html,/Slett video|Spill av|<video/);
 });
 test("READY tilbyr avspilling og sletting, men signerer ikke URL før eget klikk",()=>{
  const html=vis({...empty,videos:[{...row,status:"READY",canConfirm:false,canDelete:true}],total:1});assert.match(html,/Spill av/);assert.match(html,/Slett video/);assert.doesNotMatch(html,/<video/);
 });
});
