import { beforeEach, mock, test } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
let user = { id:"test-player", role:"PLAYER", tier:"PRO" };
let source: { kind:"v2"|"plan"|"workbench"; row:{status:string;playerId:string} };
let sourceError: Error | null;
let activeLoads = 0;
mock.module("next/navigation", { namedExports:{ redirect:(href:string)=>{throw Error(`redirect:${href}`);},notFound:()=>{throw Error("not-found");} } });
mock.module("@/lib/auth/requirePortalUser", { namedExports:{requirePortalUser:async()=>user} });
mock.module("@/lib/portal-live/session-source", { namedExports:{loadAuthorizedLiveSource:async()=>{if(sourceError)throw sourceError;return source;}} });
mock.module("@/lib/portal-live/load-ph04-07", { namedExports:{loadPH05ActiveData:async()=>{activeLoads++;return {fixture:true};},loadWbLiveAktiv:async()=>{activeLoads++;return {fixture:true};}} });
mock.module("@/components/portal/precision/PH05LiveAktiv", { namedExports:{PH05LiveAktiv:()=>createElement("div",{},"Syntetisk Live")} });
const page = async()=> (await import("@/app/portal/(fullscreen)/live/[sessionId]/active/page")).default({params:Promise.resolve({sessionId:"test-session"})});
beforeEach(()=> {user={id:"test-player",role:"PLAYER",tier:"PRO"};source={kind:"v2",row:{status:"IN_PROGRESS",playerId:user.id}};sourceError=null;activeLoads=0;});
for (const kind of ["v2","plan","workbench"] as const) {
 test(`${kind}: planlagt økt sender til brief uten å opprette lokal klokke`,async()=>{source={kind,row:{status:kind==="workbench"?"PUBLISHED":"PLANNED",playerId:user.id}};await assert.rejects(page,/redirect:\/portal\/live\/test-session\/brief/);assert.equal(activeLoads,0);});
 test(`${kind}: gjennomført økt sender til oppsummering uten aktiv registrering`,async()=>{source={kind,row:{status:"COMPLETED",playerId:user.id}};await assert.rejects(page,/redirect:\/portal\/live\/test-session\/summary/);assert.equal(activeLoads,0);});
 test(`${kind}: allerede påbegynt økt åpner registreringen`,async()=>{source={kind,row:{status:kind==="plan"?"ACTIVE":"IN_PROGRESS",playerId:user.id}};await page();assert.equal(activeLoads,1);});
}
test("pauset plan kan åpnes med sin eksisterende pause",async()=>{source={kind:"plan",row:{status:"PAUSED",playerId:user.id}};await page();assert.equal(activeLoads,1);});
test("fremmed økt avslører ingen status eller aktiv innholdslasting",async()=>{sourceError=Error("forbidden");await assert.rejects(page,/^Error: not-found$/);assert.equal(activeLoads,0);});
test("reell datakildefeil beholdes som feil, ikke manglende økt",async()=>{sourceError=Error("syntetisk kildefeil");await assert.rejects(page,/syntetisk kildefeil/);assert.equal(activeLoads,0);});
test("coach bruker brief og åpner ikke spillerens registreringsflate",async()=>{user.role="COACH";await assert.rejects(page,/redirect:\/portal\/live\/test-session\/brief/);assert.equal(activeLoads,0);});
