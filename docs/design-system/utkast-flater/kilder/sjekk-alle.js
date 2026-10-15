// Bruk: NODE_PATH=<hovedrepo>/node_modules node kilder/sjekk-alle.js <fil.html> <ut-mappe>
// Går gjennom alle skjermer (data-skjerm) og tilstander. Måler sidelengs rulling i 390 og 360 px,
// samler JS-feil og tar skjermbilde av hver skjerm i mobil og PC.
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const [fil,ut]=process.argv.slice(2);fs.mkdirSync(ut,{recursive:true});
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1300,height:2400}});const fe=[];
p.on('pageerror',e=>fe.push(e.message));p.on('requestfailed',r=>{if(!/fonts\.g/.test(r.url()))fe.push('mangler '+r.url())});
await p.goto('file://'+fil);await p.waitForTimeout(1200);
const ids=await p.$$eval('[data-skjerm]',x=>x.map(e=>e.dataset.skjerm));
const mal=()=>p.evaluate(()=>{const a=document.querySelector('.app');if(!a)return'ingen app';const q=a.getBoundingClientRect();const u=[...a.querySelectorAll('*')].filter(e=>{const r=e.getBoundingClientRect();return r.width&&r.right>q.right+1&&!e.closest('[hidden]')}).map(e=>e.tagName+'.'+(e.className.baseVal??e.className)).slice(0,4);return {s:document.documentElement.scrollWidth-document.documentElement.clientWidth,a:a.scrollWidth-a.clientWidth,u}});
const avvik=[];
for(const id of ids){
 await p.setViewportSize({width:1300,height:2400});
 await p.click(`[data-skjerm="${id}"]`);await p.click('[data-tilstand=data]');await p.click('[data-bredde=mob]');await p.waitForTimeout(900);
 await (await p.$('#ramme')).screenshot({path:`${ut}/${id}-mob.png`});
 for(const w of [390,360]){await p.setViewportSize({width:w,height:900});await p.waitForTimeout(250);const m=await mal();if(m.s>0||m.a>0||m.u.length)avvik.push([id,w,m]);}
 for(const t of ['tom','laster','feil']){await p.click(`[data-tilstand=${t}]`);await p.waitForTimeout(200);const m=await mal();if(m.s>0||m.a>0||m.u.length)avvik.push([id,t,m]);}
 await p.setViewportSize({width:1300,height:2400});await p.click('[data-tilstand=data]');await p.click('[data-bredde=pc]');await p.waitForTimeout(900);
 await (await p.$('#ramme')).screenshot({path:`${ut}/${id}-pc.png`});
}
console.log('skjermer',ids.length,'avvik',JSON.stringify(avvik));console.log('feil',JSON.stringify(fe));await b.close();})();
