import assert from 'node:assert/strict';
import { before, beforeEach, mock, test } from 'node:test';
let principal: {id:string;authId:string;role:string;deletedAt?:Date|null}|null;
let reads=0;
mock.module('next/navigation',{namedExports:{notFound:()=>{throw new Error('not-found');},redirect:()=>{throw new Error('redirect');}}});
mock.module('@/lib/auth/requirePortalUser',{namedExports:{requirePortalUser:async()=>{if(!principal)throw new Error('unauthenticated');return principal;}}});
mock.module('@/lib/auth/getCurrentUser',{namedExports:{getCurrentUser:async()=>principal}});
mock.module('@/lib/prisma',{namedExports:{prisma:{ $queryRaw:async()=>{reads++;return [];},user:{findUnique:async()=>{reads++;return null;}},round:{findMany:async()=>{reads++;return [];}},datagolfTak:{findMany:async()=>{reads++;return [];}},trainingPlanSessionLog:{findMany:async()=>{reads++;return [];}} }}});
mock.module('@/lib/portal/turneringshistorikk-data',{namedExports:{hentTurneringshistorikk:async()=>{reads++;return {aar:[]};}}});
let access: typeof import('./access');
let data: typeof import('./player-tool-data');
let challenge: typeof import('./challenge-data');
let tak: typeof import('./tak-data');
before(async()=>{access=await import('./access');data=await import('./player-tool-data');challenge=await import('./challenge-data');tak=await import('./tak-data');});
beforeEach(()=>{ reads=0;principal={id:'database-user-id',authId:'supabase-auth-id',role:'ADMIN'};process.env.AK_INTERNAL_ANALYST_USER_ID='database-user-id';process.env.DATAGOLF_INTERNAL_ANALYSIS_ENABLED='true';});
test('konfig bruker User.id, ikke Auth.id; en generell adminrolle gir ingen analyseadgang',async()=>{
  assert.equal((await access.requireDataGolfAnalyst()).id,'database-user-id');
  process.env.AK_INTERNAL_ANALYST_USER_ID='supabase-auth-id';
  await assert.rejects(access.requireDataGolfAnalyst(),/not-found/);assert.equal(reads,0);
});
test('off, manglende ID og fremmed bruker stenges før DB-kall i alle aktive DG-lesere',async()=>{
  for(const scenario of ['off','id-mangler','annen-admin','annen-coach','player','sletta','uinnlogget']){
    principal={id:'database-user-id',authId:'supabase-auth-id',role:'ADMIN'};process.env.AK_INTERNAL_ANALYST_USER_ID='database-user-id';process.env.DATAGOLF_INTERNAL_ANALYSIS_ENABLED='true';
    if(scenario==='off')process.env.DATAGOLF_INTERNAL_ANALYSIS_ENABLED='false';
    if(scenario==='id-mangler')delete process.env.AK_INTERNAL_ANALYST_USER_ID;
    if(scenario==='annen-admin')principal.id='annen';if(scenario==='annen-coach'){principal.id='annen';principal.role='COACH';}
    if(scenario==='player')principal.role='PLAYER';if(scenario==='sletta')principal.deletedAt=new Date();if(scenario==='uinnlogget')principal=null;
    for(const read of [()=>data.hentProffer(),()=>data.hentProffRunder(7,12),()=>data.hentSpillerverktoy('database-user-id',{}),()=>challenge.hentUtfordringer('database-user-id'),()=>challenge.lagreUtfordringForBruker('database-user-id',{}),()=>tak.hentAktiveTak()])await assert.rejects(read);
    assert.equal(reads,0,scenario);
  }
});
test('analytikeren kan ikke lese eller lagre en annen brukers DG-historikk',async()=>{
  await assert.rejects(data.hentSpillerverktoy('fremmed',{}),/not-found/);
  await assert.rejects(challenge.hentUtfordringer('fremmed'),/not-found/);
  await assert.rejects(challenge.lagreUtfordringForBruker('fremmed',{}),/not-found/);
  assert.equal(reads,0);
});
