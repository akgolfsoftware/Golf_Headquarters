// Deterministisk generator: docs/MASTER-SKJERMPLAN.md → docs/skjermplan/data.js
// Parser de standard 8-kolonners skjermtabellene (PlayerHQ, AgencyOS, Auth,
// Forelder, Marketing) og legger til kuraterte spesial-seksjoner (Stats,
// System, drop-off, mangler). Ingen hukommelse — alt leses fra kilden.
import { readFileSync, writeFileSync } from "node:fs";

const SRC = "/Users/anderskristiansen/Developer/akgolf-hq/docs/MASTER-SKJERMPLAN.md";
const OUT = "/Users/anderskristiansen/Developer/akgolf-hq/docs/skjermplan/data.js";

const lines = readFileSync(SRC, "utf8").split("\n");

// ── haker-parsing ────────────────────────────────────────────────
const cell = (v) => {
  const t = (v || "").trim();
  if (t === "✓") return "ja";
  if (t === "~") return "delvis";
  return "nei"; // – eller -
};
// 3-tegns responsiv (mob/desk/ipad), tegn for tegn (codepoint)
function triple(v) {
  const cps = [...(v || "").trim()];
  const m = (c) => (c === "✓" ? "ja" : c === "~" ? "delvis" : "nei");
  return { mobil: m(cps[0]), desktop: m(cps[1]), ipad: m(cps[2]) };
}
function statusOf(h) {
  // 6 likeverdige kategorier (responsiv = snitt av mob/desk/iPad), ja=1 · delvis=0,5 · nei=0 (maks 6).
  // Responsiv som snitt gjør at desktop-bare ferdige AgencyOS-skjermer (–✓–) ikke straffes urettferdig.
  const v = { ja: 1, delvis: 0.5, nei: 0 };
  const resp = (v[h.mobil] + v[h.desktop] + v[h.ipad]) / 3;
  const score = v[h.design] + resp + v[h.adresse] + v[h.flyt] + v[h.data] + v[h.funker];
  if (score >= 5.0) return "ferdig";                          // i praksis alle kategorier grønne
  if (h.design === "ja" || h.design === "delvis") return "delvis"; // designet, men ikke ferdig koblet
  return "planlagt";                                          // ikke designet ennå (ruten finnes)
}
// rute fra `` `/x` `` evt. med "→ /y" (ta første backtick-path)
function routeOf(c) {
  const m = (c || "").match(/`([^`]+)`/);
  return m ? m[1].trim() : "";
}
function nameOf(c) {
  let t = (c || "").trim();
  const key = t.includes("★");
  const data = t.includes("†");
  const child = t.startsWith("·");
  t = t.replace(/\*\*/g, "").replace(/★/g, "").replace(/†/g, "").replace(/^·\s*/, "").trim();
  return { navn: t, key, data, child };
}

// ── parse standard-tabeller ──────────────────────────────────────
let topMod = null; // playerhq | agencyos | combined | null
let sub = "";
function subToModule(s) {
  if (topMod === "playerhq") return "playerhq";
  if (topMod === "agencyos") return "agencyos";
  if (topMod === "combined") {
    if (/Auth/i.test(s)) return "auth";
    if (/Forelder/i.test(s)) return "forelder";
    if (/Marketing/i.test(s)) return "marketing";
    return null; // System o.l. → kuratert
  }
  return null;
}
const parsed = {}; // moduleId → [{gruppe, navn, rute, status, key, data, haker}]
function push(modId, scr) { (parsed[modId] ||= []).push(scr); }

for (const raw of lines) {
  const line = raw.trimEnd();
  let m;
  if ((m = line.match(/^##\s+Skjermene\s+—\s+(.+)$/))) {
    const t = m[1];
    if (/PlayerHQ/i.test(t)) topMod = "playerhq";
    else if (/AgencyOS/i.test(t)) topMod = "agencyos";
    else if (/Auth/i.test(t)) topMod = "combined";
    else topMod = null;
    sub = "";
    continue;
  }
  if (/^##\s+/.test(line)) { topMod = null; sub = ""; continue; } // annet ## stopper
  if ((m = line.match(/^###\s+(.+)$/))) { sub = m[1].trim(); continue; }
  if (!topMod) continue;
  if (!line.startsWith("|")) continue;

  const cells = line.split("|").slice(1, -1).map((c) => c.trim());
  if (cells.length !== 8) continue;            // kun standard 8-kol
  const rute = routeOf(cells[1]);
  if (!rute.startsWith("/")) continue;          // hopper over header/separator
  const modId = subToModule(sub);
  if (!modId) continue;

  const { navn, key, data, child } = nameOf(cells[0]);
  const tri = triple(cells[3]);
  const haker = {
    design: cell(cells[2]),
    mobil: tri.mobil, desktop: tri.desktop, ipad: tri.ipad,
    adresse: cell(cells[4]), flyt: cell(cells[5]),
    data: cell(cells[6]), funker: cell(cells[7]),
  };
  push(modId, {
    gruppe: sub.replace(/\s*\(.+\)\s*$/, "").trim(),
    navn, rute, child, key, datakoblet: data,
    status: statusOf(haker), haker,
  });
}

// ── kuraterte spesial-seksjoner (fra MASTER-SKJERMPLAN.md) ────────
// Marketing → Stats (offentlig stats-univers): funksjonelt m/ ekte data, ikke v10-design.
const statsRows = [
  ["Stats-forside + uka + 2026", "/(marketing)/stats · /stats/uka · /stats/2026"],
  ["Spillere + årgang", "/(marketing)/stats/spillere(/[slug]) · /stats/aargang(/[aar])"],
  ["Baner + klubber + regioner", "/(marketing)/stats/baner · /klubber · /regions"],
  ["Turneringer (offentlig)", "/(marketing)/stats/turneringer · /tour/[slug]"],
  ["Leaderboards + norske + PGA", "/(marketing)/stats/leaderboards · /norske · /pga (+ 9 undersider)"],
  ["Verktøy (kalkulatorer)", "/(marketing)/stats/verktoy (+ 5 kalkulatorer)"],
  ["Sammenlign + SG-sammenlign", "/(marketing)/stats/sammenlign-spillere · /sg-sammenlign"],
  ["Blogg + søk + quiz + wrapped", "/(marketing)/stats/blogg · /sok · /quiz · /wrapped · /min-progresjon"],
].map(([navn, rute]) => ({
  gruppe: "Stats (offentlig)", navn, rute, child: false, key: false, datakoblet: true,
  status: "delvis",
  haker: { design: "nei", mobil: "delvis", desktop: "ja", ipad: "nei", adresse: "ja", flyt: "delvis", data: "ja", funker: "ja" },
}));
parsed.marketing = [...(parsed.marketing || []), ...statsRows];

// System + interne (ikke brukerskjermer)
const systemScreens = [
  ["Offline-side", "/offline", "Vises uten nett. Funker. Ingen v10-design nødvendig."],
  ["404 (ikke funnet)", "(system)", "Nytt v10-design i forhåndsvisning (mx-404.png). Ikke koblet til ekte side."],
  ["Onboard coach", "/onboard/coach", "4-stegs coach-oppstart. Ingen v10-design."],
  ["Onboard klubb", "/onboard/klubb", "5-stegs klubb-oppstart. Ingen v10-design."],
  ["Design-system (internt)", "/(internal)/design-system · /design-system-v2", "Utviklerverktøy, ikke brukerskjerm."],
  ["Demoer (internt)", "/(internal)/demos/* · /intern/komponenter/* (~29 stk)", "Test-/demo-sider. Bør ryddes før lansering."],
].map(([navn, rute, note]) => ({ gruppe: "System & internt", navn, rute, note, status: "system" }));

// Drop-off A — tegnet, men ikke koblet ennå
const dropoff = [
  ["404-side (mx-404.png)", "Appens «ikke funnet»-side"],
  ["Onboarding (pl-onboarding.png)", "/auth/onboarding"],
  ["Forelder-info (pl-forelder.png)", "/portal/meg/foreldre"],
  ["Varsler (pl-varsler.png)", "/portal/varsler"],
  ["Innstillinger (pl-innstillinger.png)", "/portal/meg/innstillinger"],
  ["TrackMan (pl-trackman.png)", "/portal/mal/trackman"],
  ["Turnering (pl-turnering.png)", "/portal/tren/turneringer"],
  ["Forelder ser barn (fo-barn.png)", "/forelder/barn"],
  ["Coach AI-chat (ag-caddie.png)", "/admin/agencyos/caddie"],
  ["Sammenlign spillere (ag-compare.png)", "/admin/talent/sammenligning"],
  ["Compliance (ag-compliance.png)", "/admin/analysere/compliance"],
  ["Drift/anlegg (ag-drift.png)", "/admin/anlegg"],
  ["Kalender (ag-kalender.png)", "/admin/kalender"],
  ["Tester (ag-tester.png)", "/admin/tester"],
  ["Marketing-forside (mk-forside.png)", "/(marketing)"],
  ["Coach på mobil (components-coach-mobile.html)", "Mobil-utgave AgencyOS — ikke bygget"],
  ["Elite: Dispersion/Utslag-spredning", "/portal/statistikk/shot-map (Elite Fase 2 — parkert)"],
].map(([navn, rute]) => ({ gruppe: "Tegnet, ikke brukt", navn, rute, status: "droppoff" }));

// Mangler helt
const mangler = [
  ["Shot-map / spredningsplott", "/portal/statistikk/shot-map", "Data-blokkert: mangler punkt-koordinater per slag."],
  ["Scorekort hull-for-hull", "/portal/tren/turneringer/[id]/runde/[nr]", "Data-blokkert: Round har bare totalscore."],
  ["Live turnerings-tracking", "/portal/tren/turneringer/[id]/live", "Data-blokkert: live-scoring-dataflyt mangler."],
  ["Fellesmelding til turneringsdeltakere", "(AgencyOS)", "Trenger design: velg deltakere → skriv → send."],
  ["Spiller↔gruppe-veksler (player-picker)", "(AgencyOS topbar)", "Trenger design."],
  ["Fokus-spiller-blokk (pin + AI-forslag)", "/admin/agencyos", "Delvis bygget; pin + AI-felt ikke ferdig designet."],
  ["Mobil-utgave Workbench + AgencyOS", "(desktop-først)", "Mobil-varianter ikke tegnet. Spørsmål: trengs før lansering?"],
].map(([navn, rute, note]) => ({ gruppe: "Mangler helt", navn, rute, note, status: "mangler" }));

// ── bygg PLAN ────────────────────────────────────────────────────
const META = {
  updated: "13. juni 2026",
  generert: "15. juni 2026",
  note: "Levende kart over alle flater i AK Golf HQ — generert deterministisk fra docs/MASTER-SKJERMPLAN.md. Spec utledes per skjerm i spec.js.",
  source: "docs/MASTER-SKJERMPLAN.md",
};
const PLAN = {
  meta: META,
  modules: [
    { id: "playerhq", name: "PlayerHQ", icon: "Smartphone", tema: "lyst",
      desc: "Spillerens eget verktøy — «hva skal JEG gjøre i dag?». Adressene begynner med /portal.",
      screens: parsed.playerhq || [] },
    { id: "agencyos", name: "AgencyOS", icon: "LayoutDashboard", tema: "mørkt",
      desc: "Coachens kontrolltårn — «hvem trenger MEG i dag?». Adressene begynner med /admin.",
      screens: parsed.agencyos || [] },
    { id: "auth", name: "Auth", icon: "LogIn", tema: "lyst",
      desc: "Innlogging og oppstart — login, registrering, BankID, onboarding, samtykke.",
      screens: parsed.auth || [] },
    { id: "forelder", name: "Forelder", icon: "Users", tema: "lyst",
      desc: "Foreldreportalen — foresatt følger barnets utvikling, bookinger og økonomi.",
      screens: parsed.forelder || [] },
    { id: "marketing", name: "Marketing (akgolf.no)", icon: "Globe", tema: "lyst",
      desc: "Offentlige sider + det store offentlige stats-universet.",
      screens: parsed.marketing || [] },
    { id: "system", name: "System & internt", icon: "Settings2", tema: "lyst",
      desc: "Tverrgående/interne flater — ikke vanlige brukerskjermer.",
      screens: systemScreens },
    { id: "dropoff", name: "Tegnet, ikke brukt (drop-off)", icon: "AlertTriangle", tema: "lyst",
      desc: "Ferdig tegnet av Claude Design, men ennå ikke koblet som ekte skjerm. Mål: tom liste.",
      screens: dropoff },
    { id: "mangler", name: "Mangler helt", icon: "CircleSlash", tema: "lyst",
      desc: "Skjermer/funksjoner planen krever, men som ikke kan bygges ennå (data-blokkert eller trenger design).",
      screens: mangler },
  ],
};

const out = "// AUTO-GENERERT av gen-data.mjs fra docs/MASTER-SKJERMPLAN.md — ikke rediger for hånd.\n" +
  "window.PLAN = " + JSON.stringify(PLAN, null, 2) + ";\n";
writeFileSync(OUT, out, "utf8");

// rapport
const counts = PLAN.modules.map((m) => `${m.id}: ${m.screens.length}`).join(" · ");
const total = PLAN.modules.reduce((a, m) => a + m.screens.length, 0);
console.log("Skrev", OUT);
console.log("Moduler:", counts);
console.log("Totalt skjermer:", total);
