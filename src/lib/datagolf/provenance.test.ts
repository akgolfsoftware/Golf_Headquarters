import assert from 'node:assert/strict';
import { test } from 'node:test';
import { withoutDataGolfRoundSg, independentRoundSgWhere, independentSgInputWhere } from './round-provenance';
import { withoutDataGolfExport } from './export-projection';
import { publicTournamentSourceWhere, publicPgaSourceWhere, PUBLIC_TOURNAMENT_SOURCES } from './public-sources';
import { DG_VIEWS, readDGView, DG_UNAVAILABLE, selectedDGReferences } from './analysis-views';
test('DG-rundereferanse fjernes uten å endre egen score, hull eller registrert dato',()=>{
  const own={score:72,holeScores:[{strokes:4}],sgTotal:2,sgOtt:0,sgSource:'beregnet',sgReferenceSet:{source:'DATAGOLF',sourceVersion:'v1'}};
  const safe=withoutDataGolfRoundSg(own);assert.equal(safe.score,72);assert.deepEqual(safe.holeScores,own.holeScores);assert.equal(safe.sgTotal,null);assert.equal(safe.sgOtt,null);
  assert.equal(own.sgTotal,2);
});
test('ukjent beregnet referanse er ukjent; uavhengig Broadie og manuelt registrert null beholdes',()=>{
  assert.equal(withoutDataGolfRoundSg({sgTotal:1,sgSource:'beregnet',sgReferenceSet:null}).sgTotal,null);
  assert.equal(withoutDataGolfRoundSg({sgTotal:0,sgSource:'manual',sgReferenceSet:null}).sgTotal,0);
  assert.equal(withoutDataGolfRoundSg({sgTotal:0,sgSource:'beregnet',sgReferenceSet:{source:'Broadie',sourceVersion:'2014'}}).sgTotal,0);
});
test('normal eksport utelater rå DG og avledede drillmål, men beholder egne runder og månedsplaner',()=>{
  const safe=withoutDataGolfExport({user:{id:'egen',prefs:{datagolf:{target:7},routine:'mine'}},monthlyPlans:{egnePlaner:[{goal:'Eget mål'}]},rounds:[{id:'runde',score:72,sgTotal:1,sgSource:'beregnet',sgReferenceSet:{source:'DG_model',sourceVersion:'v1'},shots:[{strokes:1,sgResults:[{sgValue:2,referenceSet:{source:'DATAGOLF',sourceVersion:'v1'}},{sgValue:0,referenceSet:{source:'Broadie',sourceVersion:'2014'}}]}]}],workbench:{sessions:[{id:'dg-egen-attempt',title:'Avledet mål',target:7},{id:'egen-økt',title:'Eget mål'}]},tournamentEntries:[{tournament:{sourceOrigin:'DATAGOLF'},rawSg:7},{tournament:{sourceOrigin:'NGF'},score:0}]});
  const text=JSON.stringify(safe);for(const s of ['DATAGOLF','DG_model','Avledet mål','rawSg','target'])assert.equal(text.includes(s),false,s);
  assert.equal(text.includes('Eget mål'),true);assert.equal(text.includes('monthlyPlans'),true);assert.equal(text.includes('"score":72'),true);assert.equal(text.includes('"sgValue":0'),true);
});
test('public source whitelist følger faktiske produsenter; DG og ukjente kilder er ikke tillatt',()=>{
  assert.deepEqual(publicTournamentSourceWhere(),{sourceOrigin:{in:[...PUBLIC_TOURNAMENT_SOURCES]}});
  assert.deepEqual(publicPgaSourceWhere(),{source:{in:[]}});
  assert.equal((PUBLIC_TOURNAMENT_SOURCES as readonly string[]).includes('DATAGOLF'),false);
  for(const source of ['NGF','GJGT','NCAA','SRIXON','OLYO','NORGESCUP'])assert.equal((PUBLIC_TOURNAMENT_SOURCES as readonly string[]).includes(source),true);
});
test('hele DG-registeret kan navigeres og manglende live/fantasy har eksplisitt kildeavhengighet',()=>{
  assert.equal(DG_VIEWS.length,17);assert.equal(new Set(DG_VIEWS.map(v=>v[0])).size,17);
  for(const [id]of DG_VIEWS)assert.equal(readDGView(id),id);
  assert.equal(readDGView('fremmed'),'DG-01');for(const id of ['DG-08','DG-10','DG-17']as const)assert.ok(DG_UNAVAILABLE[id]);
});

test('ukjent historisk SG beholdes ikke som et målt nullresultat, og gammel PLAYERHQ-cache avvises',()=>{
  assert.equal(withoutDataGolfRoundSg({sgTotal:2,sgSource:null,sgReferenceSet:null}).sgTotal,null);
  const filter=independentSgInputWhere();assert.equal(JSON.stringify(filter).includes('"PLAYERHQ"'),false);assert.equal(JSON.stringify(filter).includes('PLAYERHQ_INDEPENDENT_V1'),true);
  const round=JSON.stringify(independentRoundSgWhere());for(const source of ['datagolf','data_golf','data-golf','data golf','DG_'])assert.equal(round.includes(source),true);
});

test('DG05 velger 2–4 faktiske profiler og avviser gjentakelser, hovedspiller og ukjent ID',()=>{
 const profiles = [1,2,3,4].map(dgId=>({dgId,name:`Syntetisk ${dgId}`,country:null,asOf:'2026-10-01',total:0,ott:null,app:null,arg:null,putt:null,distance:null,accuracy:null}));
 assert.deepEqual(selectedDGReferences(profiles,1,[2,'3','4']).map(p=>p.dgId),[2,3,4]);
 assert.deepEqual(selectedDGReferences(profiles,1,[1,2,2,999,'feil']).map(p=>p.dgId),[2]);
});
