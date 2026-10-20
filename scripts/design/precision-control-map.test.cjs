'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const {spawnSync}=require('node:child_process');
const zlib=require('node:zlib');
const { generate, sha, htmlScripts, normalizeMap, expandNormalized, strictStatus, screenMap } = require('./precision-control-map.cjs');
function fixture(files, run) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'precision-map-fixture-'));
  try { for (const [name, code] of Object.entries(files)) { const file = path.join(root, name); fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, code); } return run(root); }
  finally { fs.rmSync(root, { recursive: true, force: true }); }
}
function one(files, scripts) { return fixture({ ...files, 'host.html': scripts.map(f => `<script type="text/babel" src="${f}"></script>`).join('\n') }, root => generate(root, { hosts: [{ id: 'PH', file: 'host.html' }] })); }
const setup = `window.PHQ_SCREENS = {}; window.PHQ = {Shell: () => <div/>};`;
test('HTML scripts preserve order, inline offsets, quoted greater-than signs', () => {
  const s = htmlScripts('<script data-x="a>b" src="first.js"></script><script>const n=1;</script>');
  assert.equal(s[0].src, 'first.js'); assert.equal(s[1].code, 'const n=1;'); assert.ok(s[1].offset > 0);
});
test('last registered screen wins; a statically true guard stops fallback', () => {
  const r = one({ 'a.jsx': setup + `function Old(){return <button onClick={()=>oldAction()}>Old</button>} window.PHQ_SCREENS['P']={Component:Old}; window.Lib={Button:()=> <button onClick={()=>canonicalAction()}/>};`,
    'b.jsx': `(()=>{const NS=window.Lib;if(NS.Button) return;NS.Button=()=> <button onClick={()=>fallbackAction()}/>;})();function New(){const {Button}=window.Lib;return <Button/>}window.PHQ_SCREENS['P']={Component:New};` }, ['a.jsx','b.jsx']);
  assert.equal(r.roots.find(x => x.id === 'P').component.source.file, 'b.jsx');
  assert.equal(r.controls.filter(x=>x.root==='P' && x.tag==='button').length, 1);
  assert.ok(JSON.stringify(r.controls).includes('canonicalAction')); assert.ok(!JSON.stringify(r.controls).includes('fallbackAction'));
});
test('namespace aliases, object spread and rest props reach native canonical leaf', () => {
  const r = one({ 'a.jsx': setup + `function Button({children,...rest}){return <button {...rest}>{children}</button>} window.Lib={Button}; const K={ns:()=>window.Lib}; function Screen(){const N=K.ns(); const {Button}=N;const opts={onClick:()=>select('P2')};return <Button {...opts}>Go</Button>}window.PHQ_SCREENS['P']={Component:Screen};` }, ['a.jsx']);
  const leaf = r.controls.find(x=>x.tag==='button'); assert.ok(leaf.callbacks.onClick);
  assert.ok(leaf.callbacks.onClick.bindings[0].fullHandler.includes("select('P2')"));
  assert.equal(leaf.source.sha256.length,64); assert.equal(leaf.componentChain.length,2);
});
test('two callback levels preserve selected argument and full chained handlers', () => {
  const r = one({ 'a.jsx': setup + `function Leaf({onPick}){return <button onClick={()=>onPick('session-2')}/>}function Mid({onOpen}){return <Leaf onPick={x=>onOpen(x,'week-4')}/>}function Screen(){return <Mid onOpen={(sessionId,weekId)=>{window.SELECTED={sessionId,weekId};go('P2')}}/>}window.PHQ_SCREENS['P']={Component:Screen};` }, ['a.jsx']);
  const h=r.controls.find(x=>x.tag==='button').callbacks.onClick;
  assert.equal(h.bindings.length,3); assert.equal(h.bindings[1].arguments[0].value,'session-2');
  assert.equal(h.bindings[2].arguments[1].value,'week-4'); assert.ok(h.assignments[0].expression.includes('window.SELECTED'));
});
test('map object assignment contains s.id bindings, not only navigation target', () => {
  const r=one({'a.jsx':setup+`function Screen({go}){const sessions=window.DATA;return <div>{sessions.map(s=><button onClick={()=>{window.PHQ_SEL[s.id]=s;go(s.kind==='fys'?'P6':'P4')}}/>)}</div>}window.PHQ_SCREENS['P']={Component:Screen};`},['a.jsx']);
  const leaf=r.controls.find(x=>x.tag==='button'), h=leaf.callbacks.onClick;
  assert.equal(leaf.iterationRules.length,1); assert.equal(leaf.iterationRules[0].collection,'sessions');
  assert.ok(h.assignments[0].expression.includes('s.id'));
  assert.equal(h.assignments[0].references.find(x=>x.name==='s').value.chain[0].type,'iteration');
  assert.ok(h.calls.some(x=>x.callee==='go' && x.arguments[0].expression.includes("'P6':'P4'")));
});
test('local onClose and callbackless control are explicit; unknown callback stays unresolved', () => {
  const r=one({'a.jsx':setup+`function Dialog({onClose}){return <button onClick={onClose}/>}function Screen(){const [open,setOpen]=React.useState(false);return <div><Dialog onClose={()=>setOpen(false)}/><button onClick={missingCallback}/><button>Empty</button></div>}window.PHQ_SCREENS['P']={Component:Screen};`},['a.jsx']);
  assert.ok(r.componentCallbackContracts.find(x=>x.tag==='Dialog').callbacks.onClose);
  assert.ok(r.controls.find(x=>x.tag==='button' && x.callbacks.onClick?.original.expression==='missingCallback').callbacks.onClick.unresolved.length);
  assert.ok(r.issues.some(x=>x.code==='active-control-without-local-bound-action'));
});
test('bundle module source SHA is verified against bundle metadata and manifest canonical export', () => {
  const canonical=`export function Button({onClick}){return <button onClick={onClick}/>}`;
  const bundle=`/* @ds-bundle:${JSON.stringify({sourceHashes:{'components/Button.jsx':sha(canonical).slice(0,12)}})} */(()=>{try{}catch(e){const x={path:'components/Button.jsx'}}})();`;
  const files={'_ds_manifest.json':JSON.stringify({namespace:'NS',components:[{name:'Button',sourcePath:'components/Button.jsx'}]}),'_ds_bundle.js':bundle,'components/Button.jsx':canonical,'a.jsx':setup+`function Screen(){const {Button}=window.NS;return <Button onClick={()=>go('P2')}/>}window.PHQ_SCREENS['P']={Component:Screen};`};
  const r=one(files,['_ds_bundle.js','a.jsx']);assert.ok(r.controls.some(x=>x.tag==='button'));assert.ok(!r.issues.some(x=>x.code==='bundle-source-sha-mismatch'));
  const bad=one({...files,'components/Button.jsx':canonical+'\n// different'},['_ds_bundle.js','a.jsx']);assert.ok(bad.issues.some(x=>x.code==='bundle-source-sha-mismatch'));
});
test('cycles and unknown registration guards are explicit coverage failures', () => {
  const r=one({'a.jsx':setup+`function Loop(){return <Loop/>}window.PHQ_SCREENS['P']={Component:Loop};if(window.UNKNOWN){window.PHQ_SCREENS['Q']={Component:Loop}}`},['a.jsx']);
  assert.ok(r.issues.some(x=>x.code==='component-cycle-or-depth'));assert.ok(r.issues.some(x=>x.code==='unknown-registration-guard'));assert.equal(r.roots.some(x=>x.id==='Q'),false);
});
test('lexical factory parameters survive returned screen callbacks', () => {
  const r=one({'a.jsx':setup+`const make=(to)=>(p)=><button onClick={()=>p.go(to)}/>;window.PHQ_SCREENS['P']={Component:make('P2')};`},['a.jsx']);
  const h=r.controls.find(x=>x.tag==='button').callbacks.onClick;
  assert.equal(h.bindings[0].references.find(x=>x.name==='to').value.value,'P2');
});
test('nested wrapper children are independent render sites with conditions and no false cycles', () => {
  const r=one({'a.jsx':setup+`function Stack({children}){return <div>{children}</div>}function Screen(){const row=<button onClick={()=>act()}/>;return <Stack><Stack>{yes?row:row}</Stack></Stack>}window.PHQ_SCREENS['P']={Component:Screen};`},['a.jsx']);
  assert.equal(r.controls.filter(x=>x.tag==='button').length,2);
  assert.ok(!r.issues.some(x=>x.code==='duplicate-control-rule'||x.code==='component-cycle-or-depth'));
  assert.notEqual(r.controls[0].id,r.controls[1].id);
});
test('imported leaf resolves lexical export instead of a globally same-named component', () => {
  const r=one({'leaf.jsx':`export function IconButton({onClick}){return <button onClick={onClick}/>}`, 'a.jsx':`import {IconButton as ImportedButton} from './leaf.jsx';`+setup+`const IconButton=()=> <button/>;function Screen(){return <ImportedButton onClick={()=>act()}/>}window.PHQ_SCREENS['P']={Component:Screen};`},['a.jsx']);
  const leaf=r.controls.find(x=>x.tag==='button');assert.equal(leaf.source.file,'leaf.jsx');assert.ok(leaf.callbacks.onClick);
});
test('function object properties are resolved after assignment before render', () => {
  const r=one({'a.jsx':setup+`const ns=()=>window.Lib;function Screen(){return <ns.Avatar/>}window.PHQ_SCREENS['P']={Component:Screen};ns.Avatar=()=> <button onClick={()=>act()}/>;`},['a.jsx']);
  assert.equal(r.controls.filter(x=>x.tag==='button').length,1);assert.ok(!r.issues.some(x=>x.code==='component-unresolved'));
});
test('registration helpers and literal forEach cover all indices and dynamic screen IDs', () => {
  const r=one({'a.jsx':setup+`const reg=(id,C)=>{window.PHQ_SCREENS[id]={Component:C}};function Screen(){return <button onClick={()=>act()}/>};reg('P1',Screen);window.H={reg};window.H.reg('P2',Screen);['first','next','last'].forEach((step,i)=>{if(!i)return;window.PHQ_SCREENS['P-'+(i+1)]={Component:()=> <Screen/>}});`},['a.jsx']);
  assert.deepEqual(r.roots.filter(x=>x.id!=='@shell').map(x=>x.id),['P1','P2','P-2','P-3']);
});
test('early returns do not duplicate native controls or omit fallthrough guards', () => {
  const r=one({'a.jsx':setup+`function Sheet({mode,children}){if(mode==='docked')return <aside>{children}</aside>;return <div>{children}</div>}function Screen(){return <Sheet mode="docked"><button onClick={()=>act()}/></Sheet>}window.PHQ_SCREENS['P']={Component:Screen};`},['a.jsx']);
  assert.equal(r.controls.filter(x=>x.tag==='button').length,1); assert.ok(!r.issues.some(x=>x.code==='duplicate-control-rule'));
});
test('literal map callback choices remain an exact selected-item rule', () => {
  const r=one({'a.jsx':setup+`function Screen(){const [mode,setMode]=React.useState('year');return <div>{[['a',()=>setMode('year')],['b',()=>setMode('week')]].map(([id,fn])=><button onClick={()=>fn()}/>)}</div>}window.PHQ_SCREENS['P']={Component:Screen};`},['a.jsx']);
  const h=r.controls.find(x=>x.tag==='button').callbacks.onClick;
  assert.equal(h.unresolved.length,0);assert.equal(h.bindings.length,3);assert.ok(h.calls.some(c=>c.callee==='setMode' && c.arguments[0].value==='year'));assert.ok(h.calls.some(c=>c.callee==='setMode' && c.arguments[0].value==='week'));
});
test('guarded missing onSort selects local state setter and standard builtins are explicit', () => {
  const r=one({'a.jsx':setup+`function Screen({onSort}){const [sort,setSort]=React.useState(null);return <button onClick={()=>{onSort?onSort('x'):setSort('x');isFinite(4)}}/>}window.PHQ_SCREENS['P']={Component:Screen};`},['a.jsx']);
  const h=r.controls.find(x=>x.tag==='button').callbacks.onClick;
  assert.ok(!h.unresolved.some(x=>x.callee==='onSort'||x.callee==='isFinite'));assert.ok(h.calls.some(c=>c.kind==='standard-js-or-browser-api'));assert.ok(h.calls.some(c=>c.effect?.setter==='setSort'));
});
test('custom hook setter is lexically resolved; a function named setSomething is not assumed a setter', () => {
  const r=one({'a.jsx':setup+`function useFilters(){const [f,setF]=React.useState({});return [f,setF]}function Screen(){const [f,setF]=useFilters();return <div><button onClick={()=>setF({x:1})}/><button onClick={()=>setMissing(1)}/></div>}window.PHQ_SCREENS['P']={Component:Screen};`},['a.jsx']);
  const handlers=r.controls.filter(c=>c.tag==='button').map(c=>c.callbacks.onClick);
  assert.ok(handlers[0].calls.some(c=>c.meaning?.category==='state-mutation'));assert.equal(handlers[0].unresolved.length,0);
  assert.ok(handlers[1].unresolved.some(g=>g.callee==='setMissing'));
});
test('pure data methods and browser notification calls are not missing navigation', () => {
  const r=one({'a.jsx':setup+`function Screen(){return <button onClick={()=>{Math.round(2.3);['a'].map(x=>x);window.dispatchEvent(new Event('x'));}}/>}window.PHQ_SCREENS['P']={Component:Screen};`},['a.jsx']);
  const h=r.controls[0].callbacks.onClick;assert.ok(h.calls.some(c=>c.meaning?.category==='pure-data-operation'));assert.ok(h.calls.some(c=>c.meaning?.category==='data-method-rule'));assert.ok(h.calls.some(c=>c.meaning?.category==='browser-action'));
});
test('dictionary roundtrip preserves complete handlers, source SHA, conditions and lexical chains', () => {
  const fullHandler = `()=>{${'window.synthetic=1;'.repeat(500)}}`, source = { file:'test.jsx', sha256:sha('synthetic'), start:0, end:fullHandler.length };
  const control = { id:'one', host:'PH', root:'P', tag:'button', source, callbacks:{ onClick:{ fullHandler, references:[{value:{expression:'s.id',chain:[{type:'iteration',source}]}}] } }, conditions:['enabled'], iterationRules:[{source, collection:'items'}] };
  const input = { controls:[control,{...control,id:'two'}], roots:[], summary:{controls:2}, issues:[], reserved:{'$o':'original-value'} };
  const compact=normalizeMap(input); assert.deepEqual(expandNormalized(compact),input);
  assert.equal(Object.values(compact.dictionaries.texts).filter(s=>s===fullHandler).length,1);
  assert.deepEqual(expandNormalized(compact,compact.controlIndex[1].ruleRef),input.controls[1]);
  assert.ok(JSON.stringify(compact).length<JSON.stringify(input).length);
  const broken=structuredClone(compact);delete broken.dictionaries.objects[compact.rootRef.$o];assert.throws(()=>expandNormalized(broken),/Missing dictionary/);
});
test('stable source and control identities survive consecutive runs in the same process', () => {
  fixture({'host.html':'<script src="a.jsx"></script>','a.jsx':setup+`function Screen(){const [x,setX]=React.useState(0);return <button onClick={()=>setX(x+1)}/>}window.PHQ_SCREENS['P']={Component:Screen};`},root=>{
    const a=generate(root,{hosts:[{id:'PH',file:'host.html'}]}),b=generate(root,{hosts:[{id:'PH',file:'host.html'}]});delete a.generatedAt;delete b.generatedAt;assert.deepEqual(a,b);
    assert.ok(a.sources.every(s=>s.sha256.length===64));assert.deepEqual(normalizeMap(a),normalizeMap(b));
  });
});
test('known CSS insertion guard keeps unknown runtime truth without becoming registration failure', () => {
  const r=one({'a.jsx':setup+`if(!document.getElementById('test-css')){const style=document.createElement('style');style.textContent='button{color:red}';document.head.appendChild(style)}function Screen(){return <button onClick={()=>String(1)}/>}window.PHQ_SCREENS['P']={Component:Screen};`},['a.jsx','a.jsx']);
  const guards=r.guardAudit.filter(g=>g.classification==='conditional-dom-css-injection');assert.equal(guards.length,1);assert.equal(guards[0].occurrences.length,2);assert.equal(guards[0].truth,null);assert.equal(guards[0].runtimeVerified,false);assert.ok(!r.issues.some(i=>i.code==='unknown-side-effect-guard'));
});
test('strict source status fails missing actions and unresolved binding but not pure method rules', () => {
  const broken=one({'a.jsx':setup+`function Screen(){return <button/>}window.PHQ_SCREENS['P']={Component:Screen};`},['a.jsx']);
  assert.equal(strictStatus(broken).exitCodeWhenStrict,3);
  const valid=one({'a.jsx':setup+`function Screen(){return <button onClick={()=>['a'].map(x=>x)}/>}window.PHQ_SCREENS['P']={Component:Screen};`},['a.jsx']);
  assert.equal(strictStatus(valid).exitCodeWhenStrict,0);assert.equal(strictStatus(valid).runtimeVerified,false);
  const unknown=one({'a.jsx':setup+`if(window.runtimeChoice){window.PHQ_SCREENS['P']={Component:()=> <div/>}}`},['a.jsx']);assert.equal(strictStatus(unknown).exitCodeWhenStrict,3);
});
test('dynamic object IDs, complete object payload and conditional return are explicit source rules', () => {
  const r=one({'a.jsx':setup+`function Screen({onClose}){return <div>{window.ITEMS.map(s=><button onClick={()=>{if(s.locked)return false;window.SELECTED[s.id]=s;window.PAYLOAD={ownerId:s.ownerId,sessionId:s.id};onClose()}}/>)}</div>}window.PHQ_SCREENS['P']={Component:Screen};`},['a.jsx']);
  const h=r.controls[0].callbacks.onClick;
  assert.ok(h.assignments.find(a=>a.objectIndexRule?.expression==='s.id').objectIndexRule.references.some(ref=>ref.name==='s'));
  assert.deepEqual(h.assignments.find(a=>a.valueRule?.objectFields).valueRule.objectFields.map(f=>f.key),['ownerId','sessionId']);
  assert.equal(h.returns[0].conditions[0].expression,'s.locked');assert.equal(h.contract.returnRuleIndices.length,1);assert.equal(h.contract.objectIndexAssignmentIndices.length,1);
  assert.ok(h.calls.find(c=>c.callee==='onClose').conditionRules.some(c=>c.expression==='!(s.locked)'));
});
test('screen extraction retains selected native rules and shared provenance without unrelated controls', () => {
  const r=one({'a.jsx':setup+`function A(){return <button onClick={()=>String('a')}/>}function B(){return <button onClick={()=>String('b')}/>}window.PHQ_SCREENS['P1']={Component:A};window.PHQ_SCREENS['P2']={Component:B};`},['a.jsx']);
  const n=normalizeMap(r),projected=screenMap(n,'PH','P1'),view=expandNormalized(projected);
  assert.equal(view.roots.length,1);assert.equal(view.controls.length,1);assert.equal(view.controls[0].root,'P1');assert.equal(view.controls[0].callbacks.onClick.bindings[0].fullHandler,r.controls.find(c=>c.root==='P1').callbacks.onClick.bindings[0].fullHandler);assert.equal(view.sources[0].sha256.length,64);
  assert.throws(()=>screenMap(n,'PH','missing'),/not registered/);
});
test('CLI writes complete evidence yet returns strict exit 3 for unresolved sources; gzip is lossless', () => {
  fixture({'synthetic.txt':'synthetic'},root=>{
    const output=path.join(root,'out.json');
    const result=spawnSync(process.execPath,[path.join(__dirname,'precision-control-map.cjs'),root,output,'--normalized','--strict','--gzip'],{encoding:'utf8'});
    assert.equal(result.status,3);const text=fs.readFileSync(output,'utf8');assert.equal(zlib.gunzipSync(fs.readFileSync(output+'.gz')).toString('utf8'),text);
    const map=JSON.parse(text);assert.equal(map.strictStatus.exitCodeWhenStrict,3);assert.equal(map.strictStatus.blockerKinds['host-missing'],3);
  });
});
test('JSX stored in nested local conditional variables expands all mutable-state modal branches', () => {
  const r=one({'a.jsx':setup+`function Create(){return <input onChange={()=>String(1)}/>}function Session(){return <button onClick={()=>String(2)}/>}function Panel(){const [view,setView]=React.useState('empty');const content=view==='year'?<Create/>:<Session/>;return <section>{content}</section>}function Screen(){const [open,setOpen]=React.useState(false);const panel=open?<Panel/>:null;const body=panel||<button onClick={()=>setOpen(true)}/>;return <div>{body}</div>}window.PHQ_SCREENS['P']={Component:Screen};`},['a.jsx']);
  assert.ok(r.controls.some(c=>c.tag==='input'&&c.conditions.includes("view==='year'")));assert.ok(r.controls.some(c=>c.conditions.includes("!(view==='year')")));assert.ok(r.controls.some(c=>c.callbacks.onClick?.calls.some(call=>call.effect?.setter==='setOpen')));
  assert.ok(r.controls.every(c=>c.source.sha256.length===64));assert.equal(r.issues.filter(i=>i.code==='component-unresolved').length,0);
});
test('JSX footer, primary, children aliases and local return helper retain native controls', () => {
  const r=one({'a.jsx':setup+`function Frame({footer,primary,children}){return <section><header>{primary}</header>{children}<footer>{footer}</footer></section>}function Screen(){const [ready,setReady]=React.useState(false);const makePrimary=()=> <button onClick={()=>setReady(true)}/>;const footer=ready?<button onClick={()=>String(1)}/>:<button onClick={()=>String(2)}/>;const body=<input onChange={()=>String(3)}/>;return <Frame footer={footer} primary={makePrimary()}>{body}</Frame>}window.PHQ_SCREENS['P']={Component:Screen};`},['a.jsx']);
  assert.equal(r.controls.length,4);assert.equal(new Set(r.controls.map(c=>c.id)).size,4);assert.equal(r.summary.callbackUnresolved,0);
  assert.ok(r.controls.some(c=>c.conditions.includes('ready')));assert.ok(r.controls.some(c=>c.conditions.includes('!(ready)')));
  assert.ok(r.coverageInventory.declaredJsxFunctions.some(d=>d.name==='Frame'&&d.status==='rendered-in-static-instance-expansion'));
});
test('default native submit button links to enclosing form onSubmit and complete handler evidence', () => {
  const r=one({'a.jsx':setup+`function Screen(){return <form id="f" onSubmit={e=>{e.preventDefault();String('saved')}}><button/></form>}window.PHQ_SCREENS['P']={Component:Screen};`},['a.jsx']);
  const button=r.controls.find(c=>c.tag==='button'),form=r.forms[0];
  assert.equal(button.actionClassification,'native-form-action');assert.equal(button.formAssociation.effectiveType,'submit');assert.equal(button.formAssociation.defaultTypeApplied,true);
  assert.equal(button.formAction.targets[0].formRuleId,form.id);assert.equal(button.formAction.targets[0].handlerPresent,true);assert.equal(button.formAction.targets[0].callbackControlId,form.callbackControlId);
  assert.ok(form.callbacks.onSubmit.bindings[0].fullHandler.includes('preventDefault'));assert.equal(form.source.sha256.length,64);assert.equal(strictStatus(r).exitCodeWhenStrict,0);
});
test('input submit and button reset link separate native form events; native action without app handler remains valid', () => {
  const r=one({'a.jsx':setup+`function Screen(){return <div><form onSubmit={()=>String('submit')} onReset={()=>String('reset')}><input type="submit"/><button type="reset"/></form><form action="/synthetic"><button type="submit" formNoValidate/></form></div>}window.PHQ_SCREENS['P']={Component:Screen};`},['a.jsx']);
  const submit=r.controls.find(c=>c.tag==='input'),reset=r.controls.find(c=>c.formAction?.operation==='reset'),native=r.controls.find(c=>c.formAction&&c.formAction.targets[0]?.handlerPresent===false);
  assert.equal(submit.formAction.eventProperty,'onSubmit');assert.equal(reset.formAction.eventProperty,'onReset');assert.equal(native.actionClassification,'native-form-action');assert.equal(native.formAction.formNoValidate.value,true);assert.equal(strictStatus(r).exitCodeWhenStrict,0);
});
test('explicit form ID overrides enclosing form and resolves a later sibling through component children', () => {
  const r=one({'a.jsx':setup+`function Wrap({children}){return <section>{children}</section>}function Screen(){return <div><form id="first" onSubmit={()=>String(1)}><Wrap><button form="later"/></Wrap></form><form id="later" onSubmit={()=>String(2)}/></div>}window.PHQ_SCREENS['P']={Component:Screen};`},['a.jsx']);
  const c=r.controls.find(c=>c.tag==='button'),owner=r.forms.find(f=>f.htmlId.value==='later');assert.equal(c.formAssociation.ownerKind,'explicit-form-attribute');assert.equal(c.formAction.targets[0].formRuleId,owner.id);assert.equal(strictStatus(r).exitCodeWhenStrict,0);
  const subset=expandNormalized(screenMap(normalizeMap(r),'PH','P'));assert.equal(subset.forms.length,2);assert.equal(subset.controls.find(c=>c.tag==='button').formAction.targets[0].formRuleId,owner.id);
});
test('missing, dynamic and ambiguous explicit form owners remain strict source deviations', () => {
  for(const markup of ['<button form="missing"/>','<button form={window.owner}/>','<button form="f"/><form id="f"/><form id="f"/>']) {
    const r=one({'a.jsx':setup+`function Screen(){return <div>${markup}</div>}window.PHQ_SCREENS['P']={Component:Screen};`},['a.jsx']);
    assert.ok(r.issues.some(i=>i.code==='form-owner-unresolved'));assert.equal(strictStatus(r).exitCodeWhenStrict,3);assert.ok(r.controls.find(c=>c.tag==='button').formAssociation.source.sha256.length===64);
  }
});
test('form-independent button and orphan submit are not incorrectly delegated to onSubmit', () => {
  const r=one({'a.jsx':setup+`function Screen(){return <div><form onSubmit={()=>String(1)}><button type="button"/></form><button type="submit"/><input type="submit" readOnly/></div>}window.PHQ_SCREENS['P']={Component:Screen};`},['a.jsx']);
  assert.equal(r.issues.filter(i=>i.code==='active-control-without-local-bound-action').length,3);assert.ok(r.controls.find(c=>c.inputType?.value==='button').formAction===undefined);assert.equal(strictStatus(r).exitCodeWhenStrict,3);
});
test('native disabled preserves unresolved handler proof without counting an active binding gap', () => {
  const r=one({'a.jsx':setup+`function Screen(){return <button disabled onClick={window.missing} form="missing"/>}window.PHQ_SCREENS['P']={Component:Screen};`},['a.jsx']);
  assert.equal(r.controls[0].activity.status,'inactive');assert.equal(r.controls[0].actionClassification,'disabled-no-action');assert.equal(r.summary.callbackUnresolved,0);assert.equal(r.summary.inactiveCallbackBindingGaps,1);assert.equal(r.controls[0].callbacks.onClick.unresolved.length,1);assert.equal(strictStatus(r).exitCodeWhenStrict,0);
});
test('fieldset disabled reaches wrapped children while first native legend remains enabled', () => {
  const r=one({'a.jsx':setup+`function Wrap({children}){return <div>{children}</div>}function Screen(){return <fieldset disabled><legend><button type="button" onClick={window.legendHandler}/></legend><Wrap><button type="button" onClick={window.disabledHandler}/></Wrap><legend><input onChange={window.secondLegendHandler}/></legend></fieldset>}window.PHQ_SCREENS['P']={Component:Screen};`},['a.jsx']);
  assert.equal(r.controls[0].activity.status,'active');assert.ok(r.controls[0].activity.fieldsetLegendException);assert.equal(r.controls[1].activity.status,'inactive');assert.equal(r.controls[2].activity.status,'inactive');assert.equal(r.summary.callbackUnresolved,1);assert.equal(r.summary.inactiveCallbackBindingGaps,2);assert.equal(strictStatus(r).exitCodeWhenStrict,3);
});
test('unknown disabled predicate stays conditional; known disabled wins and invalid disabled on anchor does not', () => {
  const r=one({'a.jsx':setup+`function Screen(){return <div><fieldset disabled={window.busy}><button type="button"/><button type="button" disabled onClick={window.unknown}/></fieldset><a disabled href="/synthetic" onClick={window.anchorHandler}/></div>}window.PHQ_SCREENS['P']={Component:Screen};`},['a.jsx']);
  assert.equal(r.controls[0].activity.status,'conditional');assert.equal(r.controls[1].activity.status,'inactive');assert.equal(r.controls[2].activity.status,'active');assert.ok(r.issues.some(i=>i.code==='callbackless-disabled-predicate-unresolved'));assert.equal(r.summary.callbackUnresolved,1);assert.equal(r.summary.inactiveCallbackBindingGaps,1);
});
test('nested fieldset first legend does not bypass an outer disabled fieldset', () => {
  const r=one({'a.jsx':setup+`function Screen(){return <fieldset disabled><fieldset><legend><button type="button" onClick={window.missing}/></legend></fieldset></fieldset>}window.PHQ_SCREENS['P']={Component:Screen};`},['a.jsx']);assert.equal(r.controls[0].activity.status,'inactive');assert.equal(strictStatus(r).exitCodeWhenStrict,0);
});
test('dynamic button type and repeated literal explicit owner are not guessed as resolved', () => {
  const r=one({'a.jsx':setup+`function Screen(){return <div><form id="f"><button type={window.kind}/></form>{window.items.map(item=><form id="repeat"><button form="repeat"/></form>)}</div>}window.PHQ_SCREENS['P']={Component:Screen};`},['a.jsx']);assert.ok(r.issues.some(i=>i.code==='native-button-type-unresolved'));assert.ok(r.issues.some(i=>i.code==='form-owner-unresolved'&&i.status==='repeated-literal-form-id-unresolved'));assert.equal(strictStatus(r).exitCodeWhenStrict,3);
});
