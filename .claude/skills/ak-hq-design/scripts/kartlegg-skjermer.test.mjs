import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { routeInfo, inventory, outputs } from './kartlegg-skjermer.mjs';

function fixture() {
  const root=mkdtempSync(join(tmpdir(),'ak-hq-design-inventar-'));
  const put=(p,s='export default function Page() {}')=>{mkdirSync(join(root,p,'..'),{recursive:true});writeFileSync(join(root,p),s);};
  return {root,put,clean:()=>rmSync(root,{recursive:true,force:true})};
}
test('route groups retain provenance; dynamic paths and shared slot paths are not silently dropped',()=>{
  assert.deepEqual(routeInfo('src/app/portal/(fullscreen)/live/[id]/page.tsx'),{route:'/portal/live/[id]',groups:['(fullscreen)'],slots:[],requiresRouteReview:false});
  assert.deepEqual(routeInfo('src/app/admin/@detail/[id]/page.tsx'),{route:'/admin/[id]',groups:[],slots:['@detail'],requiresRouteReview:true});
  assert.equal(routeInfo('src/app/(site)/(.)photo/[id]/page.tsx').route,null);
  assert.equal(routeInfo('src/app/(site)/(.)photo/[id]/page.tsx').requiresRouteReview,true);
  assert.equal(routeInfo('src/app/docs/[[...slug]]/page.mdx').route,'/docs/[[...slug]]');
});
test('inventory observes files without executing pages or following external symlinks',()=>{
  const f=fixture();try{
    f.put('src/app/layout.tsx'); f.put('src/app/error.tsx'); f.put('src/app/portal/loading.tsx');
    f.put('src/app/portal/(old)/page.tsx','throw new Error("must never execute"); redirect("/other");');
    f.put('src/app/portal/(new)/page.jsx');f.put('src/app/docs/[[...slug]]/page.mdx');
    f.put('src/app/api/orders/route.ts','throw new Error("never execute API");');
    f.put('src/components/ui/button.tsx');f.put('src/components/ui/button.test.tsx');
    f.put('outside/page.tsx');symlinkSync(join(f.root,'outside'),join(f.root,'src/app/external'));
    const data=inventory(f.root);
    assert.equal(data.totals.pageFiles,3);assert.equal(data.totals.uniqueRoutePatterns,2);
    assert.equal(data.sharedRoutePatterns[0].sources.length,2);
    assert.equal(data.pages.find(p=>p.source.includes('(old)')).redirectCandidate,true);
    assert.deepEqual(data.pages.find(p=>p.source.includes('(old)')).nearbySurfaces,['src/app/error.tsx','src/app/layout.tsx','src/app/portal/loading.tsx']);
    assert.ok(data.pages.every(p=>p.designStatus==='ikke-vurdert' && p.accessStatus==='ikke-verifisert'));
    assert.equal(data.components.filter(p=>p.isTest).length,1);
  }finally{f.clean();}
});
test('CLI detects new routes and regenerates inventory without touching manual decisions',()=>{
  const f=fixture();try{
    f.put('src/app/page.tsx');f.put('output/designvalg.json','{"approved":"example"}');
    const script=resolve(import.meta.dirname,'kartlegg-skjermer.mjs');
    const run=(mode)=>spawnSync(process.execPath,[script,'--root',f.root,'--output',join(f.root,'output'),mode],{encoding:'utf8'});
    assert.equal(run('--write').status,0);assert.equal(run('--check').status,0);
    f.put('src/app/booking/page.tsx');assert.equal(run('--check').status,1);
    assert.equal(run('--write').status,0);assert.equal(run('--check').status,0);
    assert.equal(readFileSync(join(f.root,'output/designvalg.json'),'utf8'),'{"approved":"example"}');
    const data=JSON.parse(readFileSync(join(f.root,'output/ruteinventar.json'),'utf8'));
    assert.equal(data.totals.pageFiles,2);assert.equal(data.totals.byArea['offentlig-booking'],1);
  }finally{f.clean();}
});
test('CSV quotes a source containing a comma and output is deterministic',()=>{
 const f=fixture();try{
  f.put('src/app/(a,b)/page.tsx');const first=outputs(inventory(f.root));
  assert.deepEqual(first,outputs(inventory(f.root)));
  assert.ok(first['ruteinventar.csv'].includes('"src/app/(a,b)/page.tsx"'));
 }finally{f.clean();}
});
