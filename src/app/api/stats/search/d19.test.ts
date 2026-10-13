import assert from 'node:assert/strict';
import { mock, test } from 'node:test';
import { NextRequest } from 'next/server';
let fail=false;
const sources:string[]=[];
mock.module('@/lib/prisma',{namedExports:{prisma:{publicPlayer:{findMany:async()=>[]},pgaPlayerSeason:{findMany:async({where}:{where:{source:{in:string[]}}})=>{assert.deepEqual(where.source.in,[]);return []; }},tournament:{findMany:async({where}:{where:{sourceOrigin:{in:string[]}}})=>{if(fail)throw new Error('syntetisk source error');assert.equal(where.sourceOrigin.in.includes('DATAGOLF'),false);sources.push(...where.sourceOrigin.in);return [{slug:'tillatt',name:'Egen kilde',startDate:null,tour:null}];}}}}});
mock.module('@/lib/rate-limit',{namedExports:{rateLimit:async()=>({ok:true})}});
mock.module('@/lib/security/same-origin',{namedExports:{getClientIp:()=> 'syntetisk-ip'}});
test('offentlig søk filtrerer DG før lesing og svarer kildefeil som feil',async()=>{
 const {GET}=await import('./route');
 let response=await GET(new NextRequest('https://syntetisk.example/api/stats/search?q=test'));
 assert.equal(response.status,200);let body=await response.json();assert.equal(body.pgaSpillere.length,0);assert.equal(body.turneringer[0].slug,'tillatt');assert.ok(sources.includes('NGF'));
 fail=true;response=await GET(new NextRequest('https://syntetisk.example/api/stats/search?q=test'));assert.equal(response.status,503);body=await response.json();assert.ok(body.error);assert.equal(body.turneringer,undefined);
});
