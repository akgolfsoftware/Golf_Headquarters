import assert from 'node:assert/strict';
import { test } from 'node:test';
import { OvelseDetaljerSchema, kondisjonssegmentTekst, mengdeTekst, utstyrTekst, vaskDetaljer } from './ovelse-detaljer';
import { AkFormelSchema, AkFormelLeseSchema, parseAkFormel } from './schemas';
import { byggOvelse, tomtUtkast, utkastFraOvelse } from './ovelse-utkast';
import type { Drill } from './types';
const felles={title:'Syntetisk øvelse',description:'',durationMinutes:20};
test('ny RIR er heltall 0–4; ugyldig input avvises uten avrunding',()=>{
 for(const rir of [0,4])assert.equal(OvelseDetaljerSchema.safeParse({mengde:{enhet:'SERIER',rir}}).success,true);
 for(const rir of [-1,5,4.4,NaN])assert.equal(OvelseDetaljerSchema.safeParse({mengde:{enhet:'SERIER',rir}}).success,false);
 for(const rir of ['-1','5','4,4','NaN'])assert.equal(byggOvelse('FYS',{...tomtUtkast('FYS'),rir},felles).ok,false);
 assert.equal(byggOvelse('FYS',{...tomtUtkast('FYS'),reps:'6,3'},felles).ok,false);
 assert.equal(byggOvelse('FYS',tomtUtkast('FYS'),{...felles,durationMinutes:20.5}).ok,false);
});
test('historisk RIR7 leses og beholdes ved navneendring, men nytt historisk tall tillates ikke',()=>{
 const formula={pyramid:'FYS',area:'STYRKE',label:'Fysisk',detaljer:{mengde:{enhet:'SERIER',reps:6,vektKg:60,rir:7},sted:{hoved:'FYSISK_TRENINGSSTED'}}};
 assert.equal(AkFormelSchema.safeParse(formula).success,false);assert.equal(AkFormelLeseSchema.safeParse(formula).success,true);
 const parsed=parseAkFormel(formula,'Fallback');assert.equal(parsed.pyramid,'FYS');assert.equal(parsed.detaljer?.mengde?.rir,7);
 const original:Drill={id:'historisk',order:0,title:'Før',durationMinutes:20,akFormel:parsed};
 const u=utkastFraOvelse(original).FYS;const result=byggOvelse('FYS',u,felles,original);assert.ok(result.ok);assert.equal(result.ovelse.akFormel.detaljer?.mengde?.rir,7);
 assert.equal(byggOvelse('FYS',{...u,rir:'8'},felles,original).ok,false);
 const corrected=byggOvelse('FYS',{...u,rir:'4'},felles,original);assert.ok(corrected.ok);assert.equal(corrected.ovelse.akFormel.detaljer?.mengde?.rir,4);
});
test('oppgaver og alle utfylte dosefelter vises også uten antall og med 0',()=>{
 const result=byggOvelse('SPILL',{...tomtUtkast('SPILL'),enhet:'OPPGAVER',antall:'12'},felles);assert.ok(result.ok);
 assert.equal(mengdeTekst(result.ovelse.akFormel.detaljer?.mengde),'12 oppgaver');
 assert.equal(mengdeTekst({enhet:'SERIER',reps:6,vektKg:0,rir:0,pauseSek:0}),'6 repetisjoner · 0 kg · RIR 0 · pause 0 sek');
 assert.equal(mengdeTekst({enhet:'SERIER'}),undefined);
});
test('kondisjonssegmenter og utstyr har validert rundtur, relevans og eksplisitt tomt',()=>{
 const u={...tomtUtkast('FYS'),area:'KONDISJON' as const,antall:'20',kondisjonssegmenter:[{minutter:'5',pulssone:'S1'},{minutter:'10,5',pulssone:'S3'}],utstyr:[{navn:'Syntetisk mølle',antall:''},{navn:'Markør',antall:'0'}]};
 const result=byggOvelse('FYS',u,felles);assert.ok(result.ok);const d=result.ovelse.akFormel.detaljer;
 assert.equal(kondisjonssegmentTekst(d?.kondisjonssegmenter),'5 min · S1 / 10.5 min · S3');
 assert.equal(utstyrTekst(d?.utstyr),'Syntetisk mølle · antall ikke registrert / Markør × 0');
 assert.equal(d?.utstyr?.[0].antall,undefined);
 const drill:Drill={...result.ovelse,id:'syntetisk',order:0};assert.deepEqual(utkastFraOvelse(drill).FYS.kondisjonssegmenter,[{minutter:'5',pulssone:'S1'},{minutter:'10.5',pulssone:'S3'}]);
 assert.equal(vaskDetaljer('FYS','STYRKE',undefined,d)?.kondisjonssegmenter,undefined);
 for(const segment of [{minutter:'0',pulssone:'S1'},{minutter:'-1',pulssone:'S2'},{minutter:'10',pulssone:'S6'},{minutter:'',pulssone:'S3'}])assert.equal(byggOvelse('FYS',{...u,kondisjonssegmenter:[segment]},felles).ok,false);
 for(const antall of ['1.5','-1','NaN'])assert.equal(byggOvelse('FYS',{...u,utstyr:[{navn:'Utstyr',antall}]},felles).ok,false);
 assert.equal(byggOvelse('FYS',{...u,utstyr:[{navn:'',antall:''}]},felles).ok,false);
 const cleared=byggOvelse('FYS',{...u,kondisjonssegmenter:[],utstyr:[]},felles);assert.ok(cleared.ok);assert.equal(cleared.ovelse.akFormel.detaljer?.utstyr,undefined);assert.equal(cleared.ovelse.akFormel.detaljer?.kondisjonssegmenter,undefined);
});
