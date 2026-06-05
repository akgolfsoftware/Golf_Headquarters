// Bygger den selvstendige test-HTML-en for knapp->skjerm-godkjenning (Fase A).
// Leser nedskalerte design-skjermbilder og innebygger dem som base64 -> én fil.
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const SHOTS = "/tmp/akds/_shots";
const OUT = "/Users/anderskristiansen/Developer/akgolf-hq/docs/kobling-godkjenning/playerhq-test.html";

async function dataUri(file) {
  const buf = await readFile(path.join(SHOTS, file));
  return `data:image/jpeg;base64,${buf.toString("base64")}`;
}

const home = await dataUri("home-thumb.jpg");
const live = await dataUri("live-brief-thumb.jpg");
const tourn = await dataUri("tournaments-thumb.jpg");

// Hver rad = én knapp. img=null -> "ikke tegnet"-plassholder.
const RADER = [
  {
    id: "hjem-start-okt",
    kilde: "Hjem", kildeAdr: "/portal", kildeImg: home,
    knapp: "Start økt",
    kildeKode: 'ph-home.jsx: onClick={() => nav.openLive()}',
    designerNavn: "Live-økt", designerImg: live,
    minEnig: true,
    minNavn: "Live-økt", minImg: live,
    minHvorfor: "Åpenbart riktig — «Start økt» skal åpne selve økten i fullskjerm.",
  },
  {
    id: "hjem-turnering",
    kilde: "Hjem", kildeAdr: "/portal", kildeImg: home,
    knapp: "Turnering-kort / «Alle →» (Neste tee)",
    kildeKode: 'ph-home.jsx: onClick={() => nav.go("tournaments")}',
    designerNavn: "Turneringer (liste)", designerImg: tourn,
    minEnig: false,
    minNavn: "Turnering-detalj (egen skjerm)", minImg: null,
    minHvorfor:
      "Designeren LISTET «Turnering-detalj» i skjermlista, men bygde den aldri som egen skjerm — " +
      "så knappen havner i dag bare på lista. Når du står på Hjem og ser «neste turnering», vil du " +
      "som regel se DEN turneringen (tee-tid, bane, format), ikke en liste. Anbefaler å bygge detalj-skjermen.",
  },
];

const FOREST = "#005840", LIME = "#D1F843", BG = "#FAFAF7", INK = "#0A1F17", MUT = "#5E5C57", BORDER = "#E5E3DD";

function bildeBlokk(img, navn, badge, badgeFarge) {
  const inner = img
    ? `<img src="${img}" alt="${navn}" style="width:100%;display:block;border-radius:10px;border:1px solid ${BORDER}">`
    : `<div style="width:100%;aspect-ratio:820/558;border-radius:10px;border:2px dashed ${BORDER};display:flex;align-items:center;justify-content:center;text-align:center;color:${MUT};font-size:14px;padding:20px;box-sizing:border-box">Ikke tegnet i prototypen ennå<br><span style="font-size:12px">(skjermen finnes ikke å vise)</span></div>`;
  return `
    <div style="flex:1;min-width:280px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
        <span style="font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:#fff;background:${badgeFarge};padding:3px 9px;border-radius:99px">${badge}</span>
        <span style="font-weight:650;color:${INK}">${navn}</span>
      </div>
      ${inner}
    </div>`;
}

const radHtml = RADER.map((r, i) => `
  <section style="background:#fff;border:1px solid ${BORDER};border-radius:18px;padding:22px;margin-bottom:22px">
    <div style="display:flex;flex-wrap:wrap;gap:16px;align-items:flex-start;margin-bottom:18px">
      <div style="width:150px;flex-shrink:0">
        <img src="${r.kildeImg}" alt="${r.kilde}" style="width:100%;border-radius:8px;border:1px solid ${BORDER};opacity:.92">
        <div style="font-size:12px;color:${MUT};margin-top:6px">Kildeskjerm: <b style="color:${INK}">${r.kilde}</b> <span style="font-family:monospace">${r.kildeAdr}</span></div>
      </div>
      <div style="flex:1;min-width:220px">
        <div style="font-size:12px;letter-spacing:.05em;text-transform:uppercase;color:${MUT}">Knapp ${i + 1}</div>
        <div style="font-size:22px;font-weight:750;color:${INK};margin:2px 0 8px">${r.knapp}</div>
        <div style="font-size:12px;color:${MUT};font-family:monospace;background:${BG};border:1px solid ${BORDER};border-radius:8px;padding:8px 10px">${r.kildeKode}</div>
      </div>
    </div>

    <div style="display:flex;flex-wrap:wrap;gap:18px;margin-bottom:16px">
      ${bildeBlokk(r.designerImg, r.designerNavn, "Designerens fasit", FOREST)}
      ${bildeBlokk(r.minImg, r.minNavn, r.minEnig ? "Min anbefaling · ✓ Enig" : "Min anbefaling · annet", r.minEnig ? "#1A7D56" : "#B8852A")}
    </div>
    <div style="font-size:14px;color:${INK};background:${BG};border-left:3px solid ${r.minEnig ? "#1A7D56" : "#B8852A"};border-radius:0 8px 8px 0;padding:10px 14px;margin-bottom:16px">
      <b>Min begrunnelse:</b> ${r.minHvorfor}
    </div>

    <div style="border-top:1px solid ${BORDER};padding-top:14px">
      <div style="font-size:12px;letter-spacing:.05em;text-transform:uppercase;color:${MUT};margin-bottom:8px">Din beslutning</div>
      <div style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:10px">
        <label style="flex:1;min-width:160px;border:1px solid ${BORDER};border-radius:10px;padding:10px 12px;cursor:pointer;display:flex;gap:8px;align-items:center"><input type="radio" name="d-${r.id}" value="designer"> Godkjenn designerens</label>
        <label style="flex:1;min-width:160px;border:1px solid ${BORDER};border-radius:10px;padding:10px 12px;cursor:pointer;display:flex;gap:8px;align-items:center"><input type="radio" name="d-${r.id}" value="min"> Godkjenn min anbefaling</label>
        <label style="flex:1;min-width:160px;border:1px solid ${BORDER};border-radius:10px;padding:10px 12px;cursor:pointer;display:flex;gap:8px;align-items:center"><input type="radio" name="d-${r.id}" value="feil"> Feil / noe annet</label>
      </div>
      <textarea data-note="${r.id}" placeholder="Notat (valgfritt) — f.eks. «riktig, men …»" style="width:100%;box-sizing:border-box;min-height:54px;border:1px solid ${BORDER};border-radius:10px;padding:10px;font-family:inherit;font-size:14px"></textarea>
    </div>
  </section>`).join("");

const html = `<!doctype html><html lang="nb"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>PlayerHQ — knapp→skjerm-godkjenning (TEST)</title>
<style>body{margin:0;background:${BG};color:${INK};font-family:-apple-system,Segoe UI,Inter,system-ui,sans-serif;-webkit-font-smoothing:antialiased}
.wrap{max-width:980px;margin:0 auto;padding:28px 20px 80px}a{color:${FOREST}}</style></head>
<body><div class="wrap">
  <div style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:${FOREST};font-weight:700">AK Golf HQ · PlayerHQ</div>
  <h1 style="font-size:30px;margin:4px 0 6px">Knapp → skjerm-godkjenning <span style="font-size:14px;background:${LIME};color:${FOREST};padding:3px 10px;border-radius:99px;vertical-align:middle;font-weight:700">TEST · 2 knapper</span></h1>
  <p style="color:${MUT};font-size:15px;line-height:1.55;max-width:680px">
    For hver knapp ser du <b>skjermen den skal føre til</b> — to forslag side om side:
    <b style="color:${FOREST}">designerens fasit</b> (hentet rett fra Claude Designs prototype-kode) og
    <b style="color:#B8852A">min anbefaling</b> (basert på oversikt over alle skjermene dine).
    Velg hva som er riktig per knapp. Dette er en <b>test med 2 knapper</b> — funker oppsettet, bygger jeg hele PlayerHQ + AgencyOS slik.
  </p>
  <div style="display:flex;gap:10px;margin:18px 0 24px">
    <button id="lagre" style="background:${FOREST};color:${LIME};border:0;border-radius:10px;padding:11px 18px;font-weight:700;font-size:14px;cursor:pointer">Lagre valg</button>
    <button id="eksport" style="background:#fff;color:${INK};border:1px solid ${BORDER};border-radius:10px;padding:11px 18px;font-weight:650;font-size:14px;cursor:pointer">Eksporter som JSON</button>
    <span id="status" style="align-self:center;color:${MUT};font-size:13px"></span>
  </div>
  ${radHtml}
</div>
<script>
const KEY="ak-kobling-test";
function load(){try{return JSON.parse(localStorage.getItem(KEY)||"{}")}catch(e){return{}}}
function save(){const s=load();document.querySelectorAll('input[type=radio]:checked').forEach(r=>{s[r.name]=s[r.name]||{};s[r.name].valg=r.value});document.querySelectorAll('[data-note]').forEach(t=>{const k='d-'+t.dataset.note;s[k]=s[k]||{};s[k].notat=t.value});localStorage.setItem(KEY,JSON.stringify(s));document.getElementById('status').textContent='Lagret '+new Date().toLocaleTimeString('nb-NO');}
function restore(){const s=load();Object.entries(s).forEach(([k,v])=>{if(v.valg){const el=document.querySelector('input[name="'+k+'"][value="'+v.valg+'"]');if(el)el.checked=true}if(v.notat){const t=document.querySelector('[data-note="'+k.slice(2)+'"]');if(t)t.value=v.notat}});}
document.getElementById('lagre').onclick=save;
document.getElementById('eksport').onclick=()=>{save();const blob=new Blob([JSON.stringify(load(),null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='kobling-godkjenning.json';a.click();};
document.addEventListener('change',e=>{if(e.target.matches('input[type=radio]'))save()});
restore();
</script>
</body></html>`;

await mkdir(path.dirname(OUT), { recursive: true });
await writeFile(OUT, html);
console.log("Skrev:", OUT, "(" + Math.round(html.length / 1024) + " KB)");
