import assert from "node:assert/strict";
import { test } from "node:test";
import { vurderTreningsgap } from "./treningsgap-grunnlag";

const runde = (id: string) => ({ id, playedAt: new Date('2026-10-20T12:00Z'), playStatus:'COMPLETED', partialSave:false,
  sgReferenceSetId:'ref', benchmarkLevelSnapshot:'hcp-5', sgEngineVersion:'v1', sgSource:'beregnet', roundType:'turnering',
  dataQuality:'slag_for_slag_komplett', holeScores:Array.from({ length:18 },(_,i)=>({ holeNumber:i+1,strokes:4 })),
  sgTotal:-3,sgOtt:0,sgApp:0,sgArg:0,sgPutt:-3 });
const runder = Array.from({ length:5 },(_,i)=>runde(String(i)));
const volum = [{ uke:'2026-W42', sgArea:'APP' as const, minutter:100 }];
test('observasjonen har kildegrunnlag, måledekning og ingen dose-/årsakspåstand',()=>{
  const r=vurderTreningsgap(runder,volum)!;
  assert.equal(r.svakestOmraade,'PUTT'); assert.equal(r.andelTrening,0); assert.equal(r.antallRunder,5);
  assert.equal(r.registrerteSgMinutter,100); assert.equal(r.rader.length,5);
  assert.match(r.forklaring,/ikke all trening/); assert.match(r.forklaring,/ikke hva som forårsaker/);
  assert.match(r.forklaring,/ingen økter endres automatisk/);
});
test('ukjent trening, færre enn fem runder og manglende SG-felt gir ingen observasjon',()=>{
  assert.equal(vurderTreningsgap(runder,[]),null);
  assert.equal(vurderTreningsgap(runder.slice(1),volum),null);
  assert.equal(vurderTreningsgap(runder.map(r=>({...r,sgPutt:null})),volum),null);
  assert.equal(vurderTreningsgap(runder.map(r=>({...r,sgOtt:NaN})),volum),null);
  assert.equal(vurderTreningsgap(runder,[{...volum[0],minutter:NaN}]),null);
});
test('ulik referanse, motor, rundetype eller manglende metodebevis blandes ikke',()=>{
  for (const endring of [{sgReferenceSetId:'annen'}, {sgEngineVersion:'v2'}, {roundType:'trening'},
    {partialSave:true}, {sgSource:'estimert'}, {holeScores:runder[0].holeScores.slice(0,9)}]) {
    assert.equal(vurderTreningsgap([...runder.slice(0,4),{...runde('x'),...endring}],volum),null);
  }
});
test('minsteandelen er en utvalgsgrense, ikke automatisk trening; nyere referanse velges',()=>{
  assert.equal(vurderTreningsgap(runder,[...volum,{uke:'2026-W42',sgArea:'PUTT',minutter:25}]),null);
  const ny={...runde('ny'), playedAt:new Date('2026-10-22T12:00Z'),sgReferenceSetId:'ny'};
  assert.equal(vurderTreningsgap([...runder,ny],volum),null);
});
