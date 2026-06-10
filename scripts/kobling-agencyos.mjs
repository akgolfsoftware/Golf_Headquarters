// Genererer den komplette AgencyOS knapp->skjerm-godkjenningstabellen (mørkt tema).
import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import path from "node:path";

const THUMBS = "/tmp/akds/_shots-ag/thumbs";
const OUT = "/Users/anderskristiansen/Developer/akgolf-hq/docs/kobling-godkjenning/agencyos.html";

const files = (await readdir(THUMBS)).filter((f) => f.endsWith(".jpg"));
const IMG = {};
for (const f of files) {
  const buf = await readFile(path.join(THUMBS, f));
  IMG[f.replace(".jpg", "")] = `data:image/jpeg;base64,${buf.toString("base64")}`;
}

const SUMMARY = {
  idag: "~26 design-skjermer · 134 app-ruter",
  foreslatt: "6 seksjoner + Spiller-Workbench-master + drift/detalj",
  merges: [
    "Per-spiller planlegging (Treningsplaner, Teknisk-plan, Plan-detalj) → Spiller-Workbench",
    "Plan-maler + Drill-bibliotek = bibliotek (byggeklosser) som brukes INN i Workbench",
    "Dashboard-varianter (dashboard, board, queue) → én Cockpit",
    "Dobbeltadresser: analyse/analysere/analytics · calendar/kalender · innboks/messages/foresporsler · spillere/agencyos-spillere/stall · godkjenninger/approvals · finance/okonomi → én av hver",
  ],
  removes: ["Ny plan-wizard", "Ny økt-wizard", "board (redirect)", "Dobbeltadresse-sidene", "«CoachHQ»-rester i tekst (130+ steder)"],
  news: [
    "Fokus-spiller: manuell pin + 3 AI-forslag (Cockpit) — tegnet i coach-flows, ikke i hovedprototypen",
    "Fellesmelding-flyt fullføres (Turneringer) — modal finnes, men Send sender ingenting",
    "Spiller↔gruppe-veksler fast i topbar på ALLE skjermer (finnes bare i Workbench i dag)",
  ],
};

const GROUPS = [
  {
    skjerm: "Cockpit (Oversikt)", adr: "/admin/agencyos", img: "dashboard",
    knapper: [
      { label: "Spiller i «Trenger oppmerksomhet»", kode: 'nav.go("workbench")', d: "workbench", dN: "Spiller-Workbench", enig: true, r: "workbench", rN: "Spiller-Workbench", why: "Riktig — fra fokus rett inn i spillerens Workbench." },
      { label: "Fokus-spiller: pin + AI-forslag", kode: '(coach-flows/, ikke koblet)', d: "dashboard", dN: "Kun enkel liste i dag", enig: false, r: null, rN: "Pin + 3 AI-forslag (NY)", why: "Designet tegnet manuell pin + 3 AI-forslag (haster/ubesvart/frafall), men hovedprototypen har bare en enkel liste. Bygg pin+AI inn." },
      { label: "Innboks-teller", kode: 'nav.go("requests")', d: "requests", dN: "Forespørsler", enig: true, r: "requests", rN: "Forespørsler", why: "Riktig." },
    ],
  },
  {
    skjerm: "Topbar (overalt)", adr: "(fast topp)", img: "workbench",
    knapper: [
      { label: "Spiller ↔ gruppe-veksler", kode: '(finnes kun i Workbench)', d: "workbench", dN: "Bare i Workbench-toppen", enig: false, r: "workbench", rN: "Fast i topbar på ALLE skjermer", why: "Designet HAR veksleren i Workbench — anbefaler å gjøre den fast i toppen overalt, så coachen alltid kan bytte spiller/gruppe." },
      { label: "Varsler (bjelle)", kode: 'nav.go("requests")', d: "requests", dN: "Forespørsler", enig: true, r: "requests", rN: "Forespørsler", why: "Riktig." },
    ],
  },
  {
    skjerm: "Stall", adr: "/admin/spillere", img: "players",
    knapper: [
      { label: "Klikk på spiller-rad", kode: 'nav.go("player-profile")', d: "player-profile", dN: "Spillerprofil (mellomside)", enig: false, r: "workbench", rN: "Spiller-Workbench (rett inn)", why: "DEN viktigste forenklingen: klikk på en spiller skal gå RETT i spillerens Workbench — ingen profil-mellomside. Ett trykkpunkt." },
      { label: "Grupper", kode: 'nav.go("groups")', d: "groups", dN: "Grupper", enig: true, r: "groups", rN: "Grupper", why: "Riktig." },
      { label: "Talent-radar", kode: 'nav.go("talent-radar")', d: "talent-radar", dN: "Talent-radar", enig: true, r: "talent-radar", rN: "Talent-radar", why: "Riktig." },
      { label: "Sammenligning", kode: 'nav.go("comparison")', d: "comparison", dN: "Sammenligning", enig: true, r: "comparison", rN: "Sammenligning", why: "Riktig." },
      { label: "WAGR-import", kode: 'nav.go("wagr")', d: "wagr", dN: "WAGR-import", enig: true, r: "wagr", rN: "WAGR-import", why: "Riktig." },
    ],
  },
  {
    skjerm: "Planlegge", adr: "/admin/planlegge", img: "training-plans",
    knapper: [
      { label: "Treningsplaner (oversikt)", kode: 'nav.go("training-plans")', d: "training-plans", dN: "Aktive planer (liste)", enig: true, r: "training-plans", rN: "Aktive planer (liste)", why: "Ok som oversikt over planer i drift." },
      { label: "«Ny plan» / «Ny økt»", kode: 'nav.go("plan-builder")', d: null, dN: "Wizard — ikke bygd som egen skjerm", enig: false, r: "workbench", rN: "Spiller-Workbench", why: "Fjern wizard-flyten. Å lage plan/økt skjer inni spillerens Workbench — ikke en parallell wizard." },
      { label: "Plan-maler", kode: 'nav.go("plan-templates")', d: "plan-templates", dN: "Plan-maler (bibliotek)", enig: true, r: "plan-templates", rN: "Bibliotek → inn i Workbench", why: "Byggekloss — males brukes inn i Workbench." },
      { label: "Drill-bibliotek", kode: 'nav.go("drills")', d: "drills", dN: "Drill-bibliotek", enig: true, r: "drills", rN: "Bibliotek → inn i Workbench", why: "Byggekloss — drills tildeles i Workbench." },
    ],
  },
  {
    skjerm: "Gjennomføre (drift)", adr: "/admin/gjennomfore", img: "calendar",
    knapper: [
      { label: "Kalender", kode: 'nav.go("calendar")', d: "calendar", dN: "Drift-kalender", enig: true, r: "calendar", rN: "Drift-kalender (én adresse)", why: "Behold — men slå sammen calendar/kalender til én adresse." },
      { label: "Bookinger", kode: 'nav.go("bookings")', d: "bookings", dN: "Bookinger", enig: true, r: "bookings", rN: "Bookinger", why: "Riktig (ny-booking som wizard er ok)." },
      { label: "Anlegg", kode: 'nav.go("facilities")', d: "facilities", dN: "Anlegg", enig: true, r: "facilities", rN: "Anlegg", why: "Drift — behold." },
      { label: "Tilgjengelighet", kode: 'nav.go("availability")', d: "availability", dN: "Tilgjengelighet", enig: true, r: "availability", rN: "Tilgjengelighet", why: "Drift — behold." },
      { label: "Tjenester", kode: 'nav.go("services")', d: "services", dN: "Tjenester", enig: true, r: "services", rN: "Tjenester", why: "Drift — behold." },
    ],
  },
  {
    skjerm: "Innsikt", adr: "/admin/analysere", img: "stable-analysis",
    knapper: [
      { label: "Stall-analyse", kode: 'nav.go("stable-analysis")', d: "stable-analysis", dN: "Stall-analyse", enig: true, r: "stable-analysis", rN: "Stall-analyse", why: "Behold — men slå sammen analyse/analysere/analytics til én." },
      { label: "Lag-snitt", kode: 'nav.go("team-average")', d: "team-average", dN: "Lag-snitt", enig: true, r: "team-average", rN: "Lag-snitt", why: "Riktig." },
      { label: "Tester", kode: 'nav.go("tests")', d: "tests", dN: "Tester", enig: true, r: "tests", rN: "Tester", why: "Riktig." },
      { label: "Forespørsler", kode: 'nav.go("requests")', d: "requests", dN: "Forespørsler", enig: true, r: "requests", rN: "Forespørsler", why: "Behold — slå sammen innboks/messages/foresporsler." },
      { label: "Godkjenninger", kode: 'nav.go("approvals")', d: "approvals", dN: "Godkjenninger", enig: true, r: "approvals", rN: "Godkjenninger", why: "Behold — slå sammen godkjenninger/approvals til én." },
      { label: "Rapporter", kode: 'nav.go("reports")', d: "reports", dN: "Rapporter", enig: true, r: "reports", rN: "Rapporter", why: "Riktig." },
    ],
  },
  {
    skjerm: "Turneringer", adr: "/admin/tournaments", img: "tournaments",
    knapper: [
      { label: "Turneringer (oversikt)", kode: 'nav.go("tournaments")', d: "tournaments", dN: "Turneringer", enig: true, r: "tournaments", rN: "Turneringer", why: "Riktig — sesongens turneringer." },
      { label: "«Fellesmelding» til deltakere", kode: '(modal, Send sender ikke)', d: "tournaments", dN: "Modal finnes — Send virker ikke", enig: false, r: null, rN: "Fellesmelding-flyt (fullfør)", why: "Modalen er tegnet, men Send-knappen sender ingenting. Fullfør: velg turnering → deltakere → skriv → kanaler → send." },
    ],
  },
  {
    skjerm: "Admin", adr: "/admin/organisasjon", img: "admin",
    knapper: [
      { label: "Organisasjon · Innstillinger · Audit", kode: 'nav.go("admin")', d: "admin", dN: "Admin", enig: true, r: "admin", rN: "Admin", why: "Riktig." },
      { label: "Økonomi", kode: 'nav.go("reports"/"finance")', d: "admin", dN: "Økonomi", enig: true, r: "admin", rN: "Økonomi (én adresse)", why: "Behold — slå sammen finance/okonomi til én." },
    ],
  },
];

const F = "#005840", LIME = "#D1F843", BG = "#FAFAF7", INK = "#0A1F17", MUT = "#5E5C57", BORDER = "#E5E3DD", OK = "#1A7D56", WARN = "#B8852A";

function bilde(key, navn, badge, farge) {
  const inner = key
    ? `<img data-img="${key}" alt="${navn}" style="width:100%;display:block;border-radius:10px;border:1px solid ${BORDER}">`
    : `<div style="width:100%;aspect-ratio:16/10;border-radius:10px;border:2px dashed ${BORDER};display:flex;align-items:center;justify-content:center;text-align:center;color:${MUT};font-size:13px;padding:16px;box-sizing:border-box">${navn}</div>`;
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
<meta name="viewport" content="width=device-width, initial-scale=1"><title>AgencyOS — knapp→skjerm + sammenslåing</title>
<style>body{margin:0;background:${BG};color:${INK};font-family:-apple-system,Segoe UI,Inter,system-ui,sans-serif;-webkit-font-smoothing:antialiased}
.wrap{max-width:1000px;margin:0 auto;padding:28px 20px 100px}</style></head><body><div class="wrap">
  <div style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:${F};font-weight:700">AK Golf HQ · AgencyOS (coach)</div>
  <h1 style="font-size:30px;margin:4px 0 8px">Knapp → skjerm + sammenslåing</h1>
  <p style="color:${MUT};font-size:15px;line-height:1.55;max-width:720px">Komplett gjennomgang av alle knappene i AgencyOS. Per knapp: <b style="color:${F}">designerens fasit</b> vs. <b style="color:${WARN}">min slanke anbefaling</b> (Spiller-Workbench som planleggings-master, færrest mulig skjermer). Velg per knapp. «Eksporter JSON» gir meg fasiten å bygge etter.</p>

  <div style="background:${F};color:#fff;border-radius:18px;padding:22px;margin:20px 0">
    <div style="font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:${LIME};font-weight:700;margin-bottom:10px">Forslag til sammenslåing</div>
    <div style="display:flex;flex-wrap:wrap;gap:24px;margin-bottom:8px">
      <div><div style="font-size:11px;opacity:.75;text-transform:uppercase">I dag</div><div style="font-size:17px;font-weight:700">${SUMMARY.idag}</div></div>
      <div style="font-size:22px;align-self:center">→</div>
      <div><div style="font-size:11px;opacity:.75;text-transform:uppercase">Foreslått</div><div style="font-size:17px;font-weight:700;color:${LIME}">${SUMMARY.foreslatt}</div></div>
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:22px;font-size:13.5px;line-height:1.5;margin-top:12px">
      <div style="flex:1;min-width:240px"><b style="color:${LIME}">Slås sammen</b><ul style="margin:6px 0 0;padding-left:18px">${liste(SUMMARY.merges)}</ul></div>
      <div style="flex:1;min-width:200px"><b style="color:${LIME}">Fjernes</b><ul style="margin:6px 0 0;padding-left:18px">${liste(SUMMARY.removes)}</ul>
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
const KEY="ak-kobling-agencyos";
function load(){try{return JSON.parse(localStorage.getItem(KEY)||"{}")}catch(e){return{}}}
function save(){const s={};document.querySelectorAll('input[type=radio]:checked').forEach(r=>{s[r.name]=s[r.name]||{};s[r.name].valg=r.value});document.querySelectorAll('[data-note]').forEach(t=>{if(t.value){s[t.dataset.note]=s[t.dataset.note]||{};s[t.dataset.note].notat=t.value}});localStorage.setItem(KEY,JSON.stringify(s));document.getElementById('status').textContent='Lagret '+new Date().toLocaleTimeString('nb-NO');}
function restore(){const s=load();Object.entries(s).forEach(([k,v])=>{if(v.valg){const el=document.querySelector('input[name="'+k+'"][value="'+v.valg+'"]');if(el)el.checked=true}if(v.notat){const t=document.querySelector('[data-note="'+k+'"]');if(t)t.value=v.notat}});}
document.getElementById('lagre').onclick=save;
document.getElementById('eksport').onclick=()=>{save();const b=new Blob([JSON.stringify(load(),null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='agencyos-kobling.json';a.click();};
document.addEventListener('change',e=>{if(e.target.matches('input[type=radio]'))save()});
restore();
</script></body></html>`;

await mkdir(path.dirname(OUT), { recursive: true });
await writeFile(OUT, html);
console.log("Skrev:", OUT, "(" + Math.round(html.length / 1024) + " KB) ·", GROUPS.reduce((n, g) => n + g.knapper.length, 0), "knapper");
