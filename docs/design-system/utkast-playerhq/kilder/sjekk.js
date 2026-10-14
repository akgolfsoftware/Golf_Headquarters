// Bruk: node sjekk.js <fil.html> <ut-prefiks>  — skjermbilde mobil+PC, sidelengs-måling, JS-feil
const {chromium}=require('playwright');
(async()=>{const [fil,ut]=process.argv.slice(2);const b=await chromium.launch();const p=await b.newPage({viewport:{width:1300,height:2400}});const fe=[];p.on('pageerror',e=>fe.push(e.message));p.on('requestfailed',r=>fe.push('mangler '+r.url()));
await p.goto('file://'+fil);await p.waitForTimeout(1600);
await (await p.$('#ramme')).screenshot({path:ut+'-mob.png'});
const mal=()=>p.evaluate(()=>{const a=document.querySelector('.app');if(!a)return'ingen app';const q=a.getBoundingClientRect();return {sidelengs:document.documentElement.scrollWidth-document.documentElement.clientWidth,utenfor:[...a.querySelectorAll('*')].filter(e=>{const r=e.getBoundingClientRect();return r.width&&r.right>q.right+1}).map(e=>e.className.baseVal??e.className).slice(0,5)}});
console.log('mob',JSON.stringify(await mal()));
await p.click('[data-bredde=pc]');await p.waitForTimeout(1600);await (await p.$('#ramme')).screenshot({path:ut+'-pc.png'});
await p.setViewportSize({width:360,height:900});await p.click('[data-bredde=mob]');await p.waitForTimeout(800);console.log('360',JSON.stringify(await mal()));
console.log('feil',fe);await b.close();})();
