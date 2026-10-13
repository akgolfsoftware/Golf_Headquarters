import { test } from "node:test";
import assert from "node:assert/strict";
import { completeCoachingVideoUpload, validateCoachingVideo, type CoachingUploadAttempt, type CoachingUploadActions } from "./coaching-video-upload";
const header = Buffer.alloc(24); header.writeUInt32BE(24); header.write("ftyp",4); header.write("isom",8);
const file = () => new File([header],"syntetisk.mp4",{type:"video/mp4"});
const metadata = { title:"Syntetisk coaching", playerId:"egen-spiller", bookingId:"egen-booking", sizeBytes:24, mimeType:"video/mp4" as const };
const ticket = { videoId:"syntetisk-video", path:"videos/syntetisk-video.mp4", token:"syntetisk-token", bucket:"coaching-videos" as const };
function rig() {
  const calls:string[]=[];
  const actions:CoachingUploadActions={ createTicket:async()=>{calls.push("ticket");return ticket;}, upload:async()=>{calls.push("upload");}, confirm:async()=>{calls.push("confirm");return {ok:true,videoId:ticket.videoId};} };
  return {calls,actions};
}
test("kvittering krever faktisk serverbekreftelse etter direkte upload",async()=>{
 const {calls,actions}=rig(); let remembered:CoachingUploadAttempt|null=null;
 const result=await completeCoachingVideoUpload(file(),metadata,null,actions,a=>{remembered=a;},()=>{});
 assert.deepEqual(calls,["ticket","upload","confirm"]);assert.deepEqual(result,{ok:true,videoId:ticket.videoId});assert.ok(remembered);
});
test("manglende serverkvittering beholder forsøket og retry sender ikke filen igjen",async()=>{
 const {calls,actions}=rig();const video=file();let remembered:CoachingUploadAttempt|null=null;
 actions.confirm=async()=>{calls.push("confirm-fail");throw new Error("Lagring kunne ikke bekreftes");};
 await assert.rejects(completeCoachingVideoUpload(video,metadata,null,actions,a=>{remembered=a;},()=>{}),/ikke bekreftes/);
 assert.ok(remembered);assert.deepEqual(calls,["ticket","upload","confirm-fail"]);
 actions.confirm=async()=>{calls.push("confirm-ok");return {ok:true,videoId:ticket.videoId};};
 await completeCoachingVideoUpload(video,metadata,remembered,actions,()=>{assert.fail("skal gjenbruke forsøk");},()=>{});
 assert.deepEqual(calls,["ticket","upload","confirm-fail","confirm-ok"]);
});
test("mistet upload-svar kan gjenopprettes bare med riktig serverkvittering",async()=>{
 const {calls,actions}=rig();actions.upload=async()=>{calls.push("lost-upload");throw new Error("Mistet svar");};
 const receipt=await completeCoachingVideoUpload(file(),metadata,null,actions,()=>{},()=>{});
 assert.equal(receipt.videoId,ticket.videoId);assert.deepEqual(calls,["ticket","lost-upload","confirm"]);
});
test("feil video-ID i kvittering kan ikke gi lagret-status",async()=>{
 const {actions}=rig();actions.confirm=async()=>({ok:true,videoId:"en-annen-video"});
 await assert.rejects(completeCoachingVideoUpload(file(),metadata,null,actions,()=>{},()=>{}),/ikke bekreftet lagret/);
});
test("rettigheter må bekreftes i ticket før bytes sendes",async()=>{
 const {calls,actions}=rig();actions.createTicket=async()=>{throw new Error("Tilgangen er trukket");};
 await assert.rejects(completeCoachingVideoUpload(file(),metadata,null,actions,()=>{},()=>{}),/trukket/);assert.deepEqual(calls,[]);
});
test("ny metadata gir nytt scoped forsøk i stedet for å gjenbruke gammel mottaker",async()=>{
 const {calls,actions}=rig();const video=file();const old={file:video,metadataKey:JSON.stringify(metadata),ticket,uploaded:true};
 await completeCoachingVideoUpload(video,{...metadata,playerId:"annen-egen-spiller"},old,actions,()=>{},()=>{});assert.deepEqual(calls,["ticket","upload","confirm"]);
});
test("ugyldig innhold avvises før ticket; tom fil og feil MIME blir heller ikke sendt",async()=>{
 const {calls,actions}=rig();await assert.rejects(completeCoachingVideoUpload(new File(["<html>ikke video</html>"],"falsk.mp4",{type:"video/mp4"}),metadata,null,actions,()=>{},()=>{}),/original/);
 assert.deepEqual(calls,[]);assert.match(validateCoachingVideo(new File([],"tom.mp4",{type:"video/mp4"}))!,/tom/);assert.match(validateCoachingVideo(new File(["tekst"],"tekst.txt",{type:"text/plain"}))!,/original/);
});
