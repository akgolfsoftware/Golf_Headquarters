import { describe, mock, test } from "node:test";
import assert from "node:assert/strict";
const scope={role:"PLAYER",deletedAt:null,id:{in:["egen-spiller"]}};
const queries:Record<string,unknown>[]=[];
let requestedTotal=1;
mock.module("@/lib/auth/requirePortalUser",{namedExports:{requirePortalUser:async(opts:unknown)=>{queries.push({gate:opts});return {id:"egen-coach",role:"COACH",name:"Testcoach"};}}});
mock.module("@/lib/auth/coached",{namedExports:{coachSkrivbarPlayerWhere:(user:{id:string})=>{assert.equal(user.id,"egen-coach");return scope;}}});
mock.module("@/lib/prisma",{namedExports:{prisma:{
 user:{findMany:async(q:Record<string,unknown>)=>{queries.push({players:q});return [{id:"egen-spiller",name:"Testspiller"}];}},
 booking:{findMany:async(q:Record<string,unknown>)=>{queries.push({bookings:q});return [{id:"egen-booking",userId:"egen-spiller",startAt:new Date("2026-10-13T10:00:00Z"),serviceType:{name:"Coaching"}}];}},
 sessionVideo:{count:async(q:Record<string,unknown>)=>{queries.push({count:q});return requestedTotal;},findMany:async(q:Record<string,unknown>)=>{queries.push({videos:q});return [{id:"egen-video",title:"Syntetisk video",playerId:"egen-spiller",coachId:"egen-coach",status:"PROCESSING",createdAt:new Date("2026-10-13T10:00:00Z"),sizeBytes:24,tag:null,notes:null,player:{name:"Testspiller"},coach:{name:"Testcoach"},videoUrl:"hemmelig-lagringssti",token:"hemmelig-token"}];}},
}}});
mock.module("@/components/precision/AgencyOSSkall",{namedExports:{AgencyOSSkall:"main"}});
mock.module("@/components/admin/precision/agency-completion/CoachContent",{namedExports:{CoachContent:"div"}});
mock.module("@/components/admin/precision/agency-completion/CoachingVideoManager",{namedExports:{CoachingVideoManager:"section"}});
describe("Faktisk videorute",async()=>{
 const {default:Page}=await import("@/app/admin/videoer/page");
 const vis=async(query:Record<string,string>={})=>{queries.length=0;const tree=await Page({searchParams:Promise.resolve(query)});return tree.props.children.props.children.props.data;};
 test("liste, spiller og booking bruker samme skriverett som de faktiske video-handlingene",async()=>{
  await vis();assert.deepEqual(queries.find(q=>q.gate)?.gate,{allow:["COACH","ADMIN"]});
  assert.deepEqual((queries.find(q=>q.players)?.players as {where:unknown}).where,scope);
  assert.deepEqual((queries.find(q=>q.videos)?.videos as {where:unknown}).where,{player:scope});
  assert.deepEqual((queries.find(q=>q.bookings)?.bookings as {where:unknown}).where,{coachId:"egen-coach",user:scope});
 });
 test("ukjent spiller-forvalg avvises og private paths/tokens går aldri til manageren",async()=>{
  const data=await vis({playerId:"fremmed-spiller"});assert.equal(data.initialPlayerId,"");assert.doesNotMatch(JSON.stringify(data),/hemmelig/);
  const select=(queries.find(q=>q.videos)?.videos as {select:Record<string,unknown>}).select;assert.ok(!("videoUrl" in select));
 });
 test("processing kan kontrolleres av uploader, men slettes ikke med uavklart lagringsobjekt",async()=>{
  const data=await vis({playerId:"egen-spiller"});assert.equal(data.initialPlayerId,"egen-spiller");assert.equal(data.videos[0].canConfirm,true);assert.equal(data.videos[0].canDelete,false);
 });
 test("sidetall begrenses av faktisk scoped antall",async()=>{
  requestedTotal=52;const data=await vis({page:"99999"});assert.equal(data.page,2);
  const q=queries.find(q=>q.videos)?.videos as {skip:number;take:number};assert.equal(q.skip,50);assert.equal(q.take,50);requestedTotal=1;
 });
});
