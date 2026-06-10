// Genererer den komplette PlayerHQ knapp->skjerm-godkjenningstabellen.
// Hvert skjermbilde innebygges ÉN gang (IMG-map), refereres per knapp.
import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import path from "node:path";

const THUMBS = "/tmp/akds/_shots/thumbs";
const OUT = "/Users/anderskristiansen/Developer/akgolf-hq/docs/kobling-godkjenning/playerhq.html";

// --- bygg IMG-map (key -> data-uri), én per skjerm ---
const files = (await readdir(THUMBS)).filter((f) => f.endsWith(".jpg"));
const IMG = {};
for (const f of files) {
  const buf = await readFile(path.join(THUMBS, f));
  IMG[f.replace(".jpg", "")] = `data:image/jpeg;base64,${buf.toString("base64")}`;
}

// --- sammenslåings-forslag (toppen) ---
const SUMMARY = {
  idag: "~25 design-skjermer · 144 app-ruter",
  foreslatt: "5 faner + Workbench-master + 6 støtteskjermer",
  merges: [
    "Planlegge-hub (6 kort) + separate Årsplan / Treningsplan / Fysplan / Mål / Ny-økt-wizard → moduser i Workbench",
    "Statistikk + SG + TrackMan + Runder + Tester + Innsikt (6 sider) → Analysere (én flate med faner)",
    "Kalender + Booking → faner inni Gjennomføre",
    "Dobbeltadresser /analyse+/analysere, /stats+/statistikk → én av hver",
  ],
  removes: [
    "Ny plan-wizard", "Ny økt-wizard", "Planlegge-hub (6 kort)", "Dobbeltadresse-sidene",
  ],
  news: [
    "Turnering-detalj (designeren listet den, men bygde den aldri — trengs)",
  ],
};

// --- knapp-data gruppert per kildeskjerm ---
// d=designer-bilde-key, r=anbefaling-bilde-key (null=ny/ikke tegnet), enig=bool
const GROUPS = [
  {
    skjerm: "Hjem", adr: "/portal", img: "home",
    knapper: [
      { label: "Start økt", kode: 'nav.openLive()', d: "live-brief", dN: "Live-økt", enig: true, r: "live-brief", rN: "Live-økt", why: "Riktig — åpner økten i fullskjerm." },
      { label: "Planlegg i Workbench / Se i planen", kode: 'nav.go("workbench", {mode})', d: "workbench", dN: "Workbench", enig: true, r: "workbench", rN: "Workbench", why: "Kjernen i visjonen — all planlegging i Workbench-masteren." },
      { label: "Planlegg mot NM", kode: 'nav.go("workbench", {mode:"arsplan"})', d: "workbench-arsplan", dN: "Workbench · Årsplan", enig: true, r: "workbench-arsplan", rN: "Workbench · Årsplan", why: "Turneringsplanlegging hører hjemme i Workbench-årsplanen." },
      { label: "Økt-rad (ferdig / kommende)", kode: 'nav.go("execute")', d: "execute", dN: "Gjennomføre (dagsliste)", enig: false, r: "live-brief", rN: "Live-økt / økt-detalj", why: "Å trykke på en ØKT bør åpne den økten — ikke en generell dagsliste. (Live for nå/kommende, oppsummering for ferdig.)" },
      { label: "Økt-rad «nå» (14:30)", kode: 'nav.openLive()', d: "live-brief", dN: "Live-økt", enig: true, r: "live-brief", rN: "Live-økt", why: "Riktig." },
      { label: "Runde-rad", kode: 'nav.go("round-detail")', d: "round-detail", dN: "Runde-detalj", enig: true, r: "round-detail", rN: "Runde-detalj", why: "Riktig — scorecard for runden." },
      { label: "«Alle →» (turneringer)", kode: 'nav.go("tournaments")', d: "tournaments", dN: "Turneringer (liste)", enig: true, r: "tournaments", rN: "Turneringer (liste)", why: "Lista som ren oversikt er greit — selve planleggingen skjer i Workbench." },
      { label: "Turnering-kort (selve kortet)", kode: '(ingen onClick i dag)', d: "tournaments", dN: "→ kun lista", enig: false, r: null, rN: "Turnering-detalj (NY)", why: "Bør kunne trykke på turneringen og se den (tee-tid, bane, format). Designeren listet skjermen, men bygde den ikke." },
      { label: "«I dag →» / «Hele dagen →»", kode: 'nav.go("execute")', d: "execute", dN: "Gjennomføre", enig: true, r: "execute", rN: "Gjennomføre", why: "Riktig." },
      { label: "«Alle runder →»", kode: 'nav.go("analyze", {tab:"runder"})', d: "analyze", dN: "Analysere · Runder", enig: true, r: "analyze", rN: "Analysere · Runder", why: "Riktig — Runder som fane i Analysere." },
    ],
  },
  {
    skjerm: "Workbench (master)", adr: "/portal/planlegge/workbench", img: "workbench",
    knapper: [
      { label: "Modus-rail: Årsplan · Treningsplan · Fysplan · Mål · Drills · Ny økt", kode: 'nav.go("workbench", {mode})', d: "workbench", dN: "Workbench-moduser", enig: true, r: "workbench", rN: "Workbench-moduser", why: "Nøyaktig visjonen — alle planleggings-modusene bor her. Hit skal de 6 gamle sidene foldes inn." },
      { label: "Start økt (fra plan)", kode: 'nav.openLive()', d: "live-brief", dN: "Live-økt", enig: true, r: "live-brief", rN: "Live-økt", why: "Riktig." },
      { label: "Turnering-kobling", kode: 'nav.go("tournaments")', d: "tournaments", dN: "Turneringer", enig: true, r: "tournaments", rN: "Turneringer", why: "OK som oppslag; selve planleggingen skjer i årsplan-modus." },
    ],
  },
  {
    skjerm: "Gjennomføre", adr: "/portal/gjennomfore", img: "execute",
    knapper: [
      { label: "Faner: I dag · Kalender · Booking", kode: 'intern tab-state', d: "execute", dN: "Én flate med faner", enig: true, r: "execute", rN: "Én flate med faner", why: "Riktig — Kalender og Booking skal være faner her, ikke egne sider." },
      { label: "Start nå", kode: 'nav.openLive()', d: "live-brief", dN: "Live-økt", enig: true, r: "live-brief", rN: "Live-økt", why: "Riktig." },
      { label: "Endre rekkefølge", kode: 'nav.go("workbench")', d: "workbench", dN: "Workbench", enig: true, r: "workbench", rN: "Workbench", why: "Riktig — rekkefølge er planlegging = Workbench." },
    ],
  },
  {
    skjerm: "Analysere", adr: "/portal/analysere", img: "analyze",
    knapper: [
      { label: "Faner: SG · Runder · TrackMan · Tester · Innsikt", kode: 'intern tab-state', d: "analyze", dN: "Én flate med faner", enig: true, r: "analyze", rN: "Én flate med faner", why: "Riktig — de 6 separate analyse-sidene + dobbeltadressene skal hit." },
      { label: "Loggfør runde", kode: 'nav.go("log-round")', d: "log-round", dN: "Loggfør runde", enig: true, r: "log-round", rN: "Loggfør runde", why: "Riktig." },
      { label: "Innsikt: «svakhet → drill»", kode: 'nav.go("workbench", {mode:"drills"})', d: "workbench", dN: "Workbench · Drills", enig: true, r: "workbench", rN: "Workbench · Drills", why: "Riktig — å legge til drill er planlegging = Workbench." },
    ],
  },
  {
    skjerm: "Coach-skuff", adr: "(skuff fra høyre)", img: "coach-panel",
    knapper: [
      { label: "Faner: Meldinger · Planer · Videoer · AI-Caddie", kode: 'nav.openCoach(tab)', d: "coach-panel", dN: "Skuff fra høyre", enig: true, r: "coach-panel", rN: "Skuff fra høyre", why: "Riktig — Coach er en skuff, ikke en 5. bunn-fane (den plassen er «Meg»)." },
      { label: "Planer (i skuffen)", kode: 'nav.go("workbench")', d: "workbench", dN: "Workbench", enig: true, r: "workbench", rN: "Workbench", why: "Riktig — coachens plan åpnes i Workbench." },
    ],
  },
  {
    skjerm: "Meg", adr: "/portal/meg", img: "me",
    knapper: [
      { label: "Konto-rader: Profil · Innstillinger · Helse · Utstyr · Dokumenter · Hjelp", kode: 'nav.go("me-…")', d: "me", dN: "Meg + undersider", enig: true, r: "me", rN: "Meg + undersider", why: "Behold som undersider (innstillinger-type) — disse er ikke planlegging og hører ikke i Workbench." },
      { label: "Se coaching-pakken", kode: 'nav.go("me-abonnement")', d: "me", dN: "Abonnement", enig: true, r: "me", rN: "Abonnement", why: "Riktig." },
    ],
  },
  {
    skjerm: "Turneringer", adr: "/portal/tren/turneringer", img: "tournaments",
    knapper: [
      { label: "Planlegg mot", kode: 'nav.go("workbench", {mode:"arsplan"})', d: "workbench-arsplan", dN: "Workbench · Årsplan", enig: true, r: "workbench-arsplan", rN: "Workbench · Årsplan", why: "Riktig — planlegging = Workbench." },
      { label: "Turnering-rad", kode: 'nav.go("tournaments")', d: "tournaments", dN: "→ blir værende på lista", enig: false, r: null, rN: "Turnering-detalj (NY)", why: "Bør åpne den enkelte turneringen, ikke bare lista. Trenger detalj-skjermen." },
    ],
  },
  {
    skjerm: "Varsler", adr: "/portal/varsler", img: "varsler",
    knapper: [
      { label: "Varsel-rad", kode: 'nav.go(relevant flate)', d: "varsler", dN: "Inn i relevant flate", enig: true, r: "varsler", rN: "Inn i relevant flate", why: "Riktig — hvert varsel leder dit det hører." },
    ],
  },
  {
    skjerm: "Live-økt (fullskjerm)", adr: "/portal/(fullscreen)/live", img: "live-brief",
    knapper: [
      { label: "Treff / Bom + rep-teller", kode: 'intern state', d: "live-brief", dN: "Live-økt (aktiv)", enig: true, r: "live-brief", rN: "Live-økt (aktiv)", why: "Riktig — logging skjer i fullskjerm-økten." },
      { label: "Avslutt & lagre", kode: 'nav → oppsummering', d: "live-brief", dN: "Oppsummering → Hjem", enig: true, r: "live-brief", rN: "Oppsummering → Hjem", why: "Riktig — lagrer økten og viser oppsummering." },
      { label: "Avbryt", kode: 'nav.closeLive()', d: "home", dN: "Tilbake til Hjem", enig: true, r: "home", rN: "Tilbake til Hjem", why: "Riktig." },
    ],
  },
  {
    skjerm: "Runde-detalj", adr: "/portal/tren/turneringer/[id]/runde", img: "round-detail",
    knapper: [
      { label: "Del med Anders", kode: 'nav.openCoach()', d: "coach-panel", dN: "Coach-skuff", enig: true, r: "coach-panel", rN: "Coach-skuff", why: "Riktig — deler runden med coachen." },
    ],
  },
  {
    skjerm: "Loggfør runde", adr: "/portal/mal/runder/ny", img: "log-round",
    knapper: [
      { label: "Lagre runde", kode: 'nav.go("analyze", {tab:"runder"})', d: "analyze", dN: "Analysere · Runder", enig: true, r: "analyze", rN: "Analysere · Runder", why: "Riktig — lagrer til Runder-fanen." },
    ],
  },
  {
    skjerm: "Meg-undersider", adr: "/portal/meg/*", img: "me",
    knapper: [
      { label: "Profil (rediger)", kode: 'nav.go("me-profil")', d: "me-profil", dN: "Profil", enig: true, r: "me-profil", rN: "Profil", why: "Behold — kontoinnstilling, ikke planlegging." },
      { label: "Abonnement", kode: 'nav.go("me-abonnement")', d: "me-abonnement", dN: "Abonnement", enig: true, r: "me-abonnement", rN: "Abonnement", why: "Behold — gratis via Performance Pro / 300 kr." },
      { label: "Innstillinger", kode: 'nav.go("me-innstillinger")', d: "me-innstillinger", dN: "Innstillinger", enig: true, r: "me-innstillinger", rN: "Innstillinger", why: "Behold — varsler / integrasjoner / sikkerhet." },
      { label: "Helse", kode: 'nav.go("me-helse")', d: "me-helse", dN: "Helse", enig: true, r: "me-helse", rN: "Helse", why: "Behold — hvilepuls / søvn / symptomer." },
      { label: "Utstyrsbag", kode: 'nav.go("me-utstyr")', d: "me-utstyr", dN: "Utstyrsbag", enig: true, r: "me-utstyr", rN: "Utstyrsbag", why: "Behold — køllene + avstander." },
      { label: "Dokumenter", kode: 'nav.go("me-dokumenter")', d: "me-dokumenter", dN: "Dokumenter", enig: true, r: "me-dokumenter", rN: "Dokumenter", why: "Behold — avtaler / samtykker." },
      { label: "Hjelp (FAQ)", kode: 'nav.go("me-hjelp")', d: "me-hjelp", dN: "Hjelp", enig: true, r: "me-hjelp", rN: "Hjelp", why: "Behold — søk + sammenleggbare svar." },
    ],
  },
  {
    skjerm: "Auth + oppstart", adr: "/auth/*", img: "auth-login",
    knapper: [
      { label: "Logg inn", kode: 'au.go("bankid")', d: "auth-login", dN: "Logg inn", enig: true, r: "auth-login", rN: "Logg inn", why: "Behold — standard innlogging (e-post + BankID)." },
      { label: "Opprett konto", kode: 'au.go("signup")', d: "auth-signup", dN: "Registrer", enig: true, r: "auth-signup", rN: "Registrer", why: "Behold." },
      { label: "Glemt passord", kode: 'au.go("glemt")', d: "auth-glemt", dN: "Glemt passord", enig: true, r: "auth-glemt", rN: "Glemt passord", why: "Behold." },
      { label: "BankID", kode: 'au.go("bankid")', d: "auth-bankid", dN: "BankID-verifisering", enig: true, r: "auth-bankid", rN: "BankID-verifisering", why: "Behold." },
      { label: "Foreldresamtykke (under 18)", kode: 'au.go("samtykke")', d: "auth-samtykke", dN: "Samtykke venter", enig: true, r: "auth-samtykke", rN: "Samtykke venter", why: "Behold — GDPR art. 8." },
      { label: "Onboarding (5 steg)", kode: 'au.go("onboarding")', d: "auth-onboarding", dN: "Onboarding", enig: true, r: "auth-onboarding", rN: "Onboarding", why: "Behold — baseline-oppsett." },
    ],
  },
];

// ---------- HTML ----------
const F = "#005840", LIME = "#D1F843", BG = "#FAFAF7", INK = "#0A1F17", MUT = "#5E5C57", BORDER = "#E5E3DD", OK = "#1A7D56", WARN = "#B8852A";

function bilde(key, navn, badge, farge) {
  const inner = key
    ? `<img data-img="${key}" alt="${navn}" style="width:100%;display:block;border-radius:10px;border:1px solid ${BORDER}">`
    : `<div style="width:100%;aspect-ratio:16/10;border-radius:10px;border:2px dashed ${BORDER};display:flex;align-items:center;justify-content:center;text-align:center;color:${MUT};font-size:13px;padding:16px;box-sizing:border-box">Ny skjerm — ikke tegnet ennå</div>`;
  return `<div style="flex:1;min-width:260px">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:7px">
      <span style="font-size:10px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:#fff;background:${farge};padding:3px 8px;border-radius:99px">${badge}</span>
      <span style="font-weight:650;font-size:14px;color:${INK}">${navn}</span>
    </div>${inner}</div>`;
}

const grupperHtml = GROUPS.map((g) => `
  <div style="margin:34px 0 10px;display:flex;align-items:center;gap:14px">
    <img data-img="${g.img}" style="width:120px;border-radius:8px;border:1px solid ${BORDER};opacity:.92">
    <div><div style="font-size:20px;font-weight:750;color:${INK}">${g.skjerm}</div>
    <div style="font-family:monospace;font-size:12px;color:${MUT}">${g.adr}</div></div>
  </div>
  ${g.knapper.map((b, i) => {
    const id = (g.skjerm + "-" + i).replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
    return `<section style="background:#fff;border:1px solid ${BORDER};border-radius:16px;padding:18px;margin-bottom:14px">
      <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:12px">
        <div style="font-size:18px;font-weight:700;color:${INK}">${b.label}</div>
        <div style="font-family:monospace;font-size:11px;color:${MUT};background:${BG};border:1px solid ${BORDER};border-radius:6px;padding:4px 8px">${b.kode}</div>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:16px;margin-bottom:12px">
        ${bilde(b.d, b.dN, "Designerens fasit", F)}
        ${bilde(b.r, b.rN, b.enig ? "Min anbefaling · ✓ Enig" : "Min anbefaling · annet", b.enig ? OK : WARN)}
      </div>
      <div style="font-size:13.5px;color:${INK};background:${BG};border-left:3px solid ${b.enig ? OK : WARN};border-radius:0 8px 8px 0;padding:9px 13px;margin-bottom:12px"><b>Hvorfor:</b> ${b.why}</div>
      <div style="border-top:1px solid ${BORDER};padding-top:12px;display:flex;flex-wrap:wrap;gap:8px;align-items:center">
        <label style="border:1px solid ${BORDER};border-radius:9px;padding:8px 12px;cursor:pointer;font-size:13px"><input type="radio" name="${id}" value="designer"> Designerens</label>
        <label style="border:1px solid ${BORDER};border-radius:9px;padding:8px 12px;cursor:pointer;font-size:13px"><input type="radio" name="${id}" value="min"> Min anbefaling</label>
        <label style="border:1px solid ${BORDER};border-radius:9px;padding:8px 12px;cursor:pointer;font-size:13px"><input type="radio" name="${id}" value="feil"> Noe annet</label>
        <input data-note="${id}" placeholder="notat…" style="flex:1;min-width:160px;border:1px solid ${BORDER};border-radius:9px;padding:8px 10px;font-family:inherit;font-size:13px">
      </div>
    </section>`;
  }).join("")}`).join("");

const liste = (arr) => arr.map((x) => `<li style="margin-bottom:5px">${x}</li>`).join("");

const html = `<!doctype html><html lang="nb"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><title>PlayerHQ — knapp→skjerm + sammenslåing</title>
<style>body{margin:0;background:${BG};color:${INK};font-family:-apple-system,Segoe UI,Inter,system-ui,sans-serif;-webkit-font-smoothing:antialiased}
.wrap{max-width:1000px;margin:0 auto;padding:28px 20px 100px}</style></head><body><div class="wrap">
  <div style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:${F};font-weight:700">AK Golf HQ · PlayerHQ</div>
  <h1 style="font-size:30px;margin:4px 0 8px">Knapp → skjerm + sammenslåing</h1>
  <p style="color:${MUT};font-size:15px;line-height:1.55;max-width:720px">Komplett gjennomgang av alle knappene i PlayerHQ. Per knapp: <b style="color:${F}">designerens fasit</b> vs. <b style="color:${WARN}">min slanke anbefaling</b> (Workbench som planleggings-master, færrest mulig skjermer). Velg per knapp. «Eksporter JSON» gir meg fasiten å bygge etter.</p>

  <div style="background:${F};color:#fff;border-radius:18px;padding:22px;margin:20px 0">
    <div style="font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:${LIME};font-weight:700;margin-bottom:10px">Forslag til sammenslåing</div>
    <div style="display:flex;flex-wrap:wrap;gap:24px;margin-bottom:8px">
      <div><div style="font-size:11px;opacity:.75;text-transform:uppercase">I dag</div><div style="font-size:17px;font-weight:700">${SUMMARY.idag}</div></div>
      <div style="font-size:22px;align-self:center">→</div>
      <div><div style="font-size:11px;opacity:.75;text-transform:uppercase">Foreslått</div><div style="font-size:17px;font-weight:700;color:${LIME}">${SUMMARY.foreslatt}</div></div>
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:22px;font-size:13.5px;line-height:1.5;margin-top:12px">
      <div style="flex:1;min-width:240px"><b style="color:${LIME}">Slås sammen</b><ul style="margin:6px 0 0;padding-left:18px">${liste(SUMMARY.merges)}</ul></div>
      <div style="flex:1;min-width:160px"><b style="color:${LIME}">Fjernes</b><ul style="margin:6px 0 0;padding-left:18px">${liste(SUMMARY.removes)}</ul>
      <b style="color:${LIME}">Bygges nytt</b><ul style="margin:6px 0 0;padding-left:18px">${liste(SUMMARY.news)}</ul></div>
    </div>
  </div>

  <div style="display:flex;gap:10px;margin:18px 0 6px;position:sticky;top:0;background:${BG};padding:10px 0;z-index:5">
    <button id="lagre" style="background:${F};color:${LIME};border:0;border-radius:10px;padding:11px 18px;font-weight:700;cursor:pointer">Lagre valg</button>
    <button id="eksport" style="background:#fff;color:${INK};border:1px solid ${BORDER};border-radius:10px;padding:11px 18px;font-weight:650;cursor:pointer">Eksporter JSON</button>
    <span id="status" style="align-self:center;color:${MUT};font-size:13px"></span>
  </div>
  ${grupperHtml}
</div>
<script>
const IMG=${JSON.stringify(IMG)};
document.querySelectorAll('[data-img]').forEach(el=>{const k=el.getAttribute('data-img');if(IMG[k])el.src=IMG[k]});
const KEY="ak-kobling-playerhq";
function load(){try{return JSON.parse(localStorage.getItem(KEY)||"{}")}catch(e){return{}}}
function save(){const s={};document.querySelectorAll('input[type=radio]:checked').forEach(r=>{s[r.name]=s[r.name]||{};s[r.name].valg=r.value});document.querySelectorAll('[data-note]').forEach(t=>{if(t.value){s[t.dataset.note]=s[t.dataset.note]||{};s[t.dataset.note].notat=t.value}});localStorage.setItem(KEY,JSON.stringify(s));document.getElementById('status').textContent='Lagret '+new Date().toLocaleTimeString('nb-NO');}
function restore(){const s=load();Object.entries(s).forEach(([k,v])=>{if(v.valg){const el=document.querySelector('input[name="'+k+'"][value="'+v.valg+'"]');if(el)el.checked=true}if(v.notat){const t=document.querySelector('[data-note="'+k+'"]');if(t)t.value=v.notat}});}
document.getElementById('lagre').onclick=save;
document.getElementById('eksport').onclick=()=>{save();const b=new Blob([JSON.stringify(load(),null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='playerhq-kobling.json';a.click();};
document.addEventListener('change',e=>{if(e.target.matches('input[type=radio]'))save()});
restore();
</script></body></html>`;

await mkdir(path.dirname(OUT), { recursive: true });
await writeFile(OUT, html);
console.log("Skrev:", OUT, "(" + Math.round(html.length / 1024) + " KB) ·", GROUPS.reduce((n, g) => n + g.knapper.length, 0), "knapper");
