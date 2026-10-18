import { chromium } from "@playwright/test";
import { config } from "dotenv";
import fs from "node:fs";
config({ path: ".env.local", quiet: true });
const BASE = "http://localhost:3103";
const OUT = "rapport";
const ids = JSON.parse(fs.readFileSync(`${OUT}/_ids.json`, "utf8"));
const reg = JSON.parse(fs.readFileSync("docs/design-system/skjermregister.json", "utf8"));
const pw = process.env.SCREENTEST_PASSWORD ?? "";
const LIMIT = process.env.LIMIT ? Number(process.env.LIMIT) : Infinity;
const RESUME = process.env.RESUME === "1";
const ONLY = process.env.ONLY ? new RegExp(process.env.ONLY) : null;
const CONC = Number(process.env.CONC ?? 4);

let rows = reg.sider.filter((s) => !/^\/demos/.test(s.rute) && s.kobling !== "intern-flate");
if (ONLY) rows = rows.filter((s) => ONLY.test(s.rute));
rows.sort((a, b) => (a.omrade === "marked-og-offentlig") - (b.omrade === "marked-og-offentlig"));
const browser = await chromium.launch();

async function login(email) {
  for (let forsok = 0; forsok < 2; forsok++) {
    const ctx = await browser.newContext({ baseURL: BASE });
    const page = await ctx.newPage();
    try {
      await page.goto("/auth/login", { waitUntil: "load", timeout: 120000 });
      await page.getByRole("button", { name: "Logg inn med passord", exact: true }).click();
      await page.locator('input[type="email"]').fill(email);
      await page.locator('input[type="password"]').fill(pw);
      await page.locator('button[type="submit"]').click();
      await page.waitForURL(/\/(portal|forelder|admin|onboard)/, { timeout: 120000 });
      await page.waitForTimeout(2500);
      const btn = page.getByRole("button", { name: /Kun nødvendige/i }).first();
      if (await btn.isVisible().catch(() => false)) await btn.click().catch(() => {});
      await page.close();
      return ctx;
    } catch (e) { await ctx.close(); if (forsok === 1) throw e; }
  }
}
const ctxs = {}; const loginInfo = {};
for (const [k, email] of [["coach", "coachtest@akgolf.test"], ["player", "screentest@akgolf.test"], ["parent", "screentest-parent@akgolf.test"]]) {
  try { ctxs[k] = await login(email); loginInfo[k] = "ok"; } catch (e) { loginInfo[k] = "feilet: " + String(e.message).split("\n")[0].slice(0, 100); }
}
ctxs.anon = await browser.newContext({ baseURL: BASE });
fs.writeFileSync(`${OUT}/_login.json`, JSON.stringify(loginInfo));
console.log("login", loginInfo);

const slugs = {};
{
  const p = await ctxs.anon.newPage();
  for (const pre of ["/anlegg", "/blogg", "/coacher", "/stats/blogg", "/stats/spillere", "/stats/turneringer", "/stats/baner", "/stats/klubber", "/stats/regions", "/stats/tour", "/turneringer", "/booking", "/stats/pga/spillere", "/stats/wrapped", "/stats/aargang"]) {
    try {
      await p.goto(pre, { waitUntil: "load", timeout: 90000 });
      await p.waitForTimeout(800);
      const hrefs = await p.$$eval("a[href]", (as) => as.map((a) => a.getAttribute("href")));
      const h = hrefs.find((x) => x && x.startsWith(pre + "/") && x.split("/").length === pre.split("/").length + 1 && !x.includes("?") && !x.includes("#"));
      if (h) slugs[pre] = h.slice(pre.length + 1);
    } catch {}
  }
  await p.close();
}
console.log("slugs", JSON.stringify(slugs));

function resolve(rute) {
  const miss = [];
  const pick = (v, why) => { if (v == null || v === "") { miss.push(why); return "X"; } return v; };
  const path = rute.replace(/\[(\w+)\]/g, (_, name) => {
    const r = rute;
    const has = (s) => r.includes(s);
    switch (name) {
      case "nr": return "1";
      case "aar": return "2025";
      case "club": return "driver";
      case "metric": return "slag";
      case "spillerId": case "playerId": case "childId": case "barnId": return pick(ids.player, name);
      case "coachId": return pick(ids.coach, name);
      case "baneId": return pick(ids.course, name);
      case "bookingId": return pick(ids.booking, name);
      case "runId": return pick(ids.round, name);
      case "anleggId": return pick(ids.location, name);
      case "oktId": return pick(ids.trainingPlanSession, name);
      case "testId": return pick(ids.testDefinition, name);
      case "agentId": return pick(ids.agentRun, name);
      case "token": return pick(null, "token");
      case "dg_id": return pick(slugs["/stats/pga/spillere"], name);
      case "planId":
        if (has("/technisk-plan/")) return pick(ids.technicalPlan_any, "technicalPlan");
        if (has("/fys-plan/")) return pick(null, "fysiskPlan");
        return pick(ids.trainingPlan ?? ids.trainingPlan_any, "trainingPlan");
      case "sessionId":
        if (has("/trackman/")) return pick(ids.trackManSession ?? ids.trackManSession_any, "trackManSession");
        if (has("/tren/wb/")) return pick(ids.workbenchSession, "workbenchSession");
        if (has("/portal/tren/[")) return pick(ids.trainingPlanSession, "trainingPlanSession");
        return pick(ids.trainingSessionV2, "trainingSessionV2");
      case "slug": {
        for (const pre of Object.keys(slugs)) { const base = r.slice(0, r.indexOf("[slug]") - 1); if (base === pre) return slugs[pre]; }
        if (has("/meg/help/artikkel")) return pick("kom-i-gang", "artikkel");
        if (has("/stats/turneringer/[slug]")) return pick(slugs["/stats/turneringer"], "slug");
        if (has("/booking/[slug]")) return pick(slugs["/booking"], "slug");
        return pick(null, "slug");
      }
      case "id":
        if (has("/admin/spillere/")) return pick(ids.player, "player");
        if (has("plan-templates") || has("plans/templates") || has("/portal/coach/plans")) return pick(ids.planTemplate, "planTemplate");
        if (has("/admin/bookinger") || has("/gjennomfore/okter")) return pick(ids.booking_any, "booking");
        if (has("/admin/grupper")) return pick(ids.group, "group");
        if (has("/admin/email-templates")) return pick(ids.emailTemplate, "emailTemplate");
        if (has("/admin/tournaments")) return pick(ids.tournament, "tournament");
        if (has("/admin/drills") || has("/ovelser/")) return pick(ids.exerciseDefinition, "exerciseDefinition");
        if (has("runder")) return pick(ids.round ?? ids.round_any, "round");
        if (has("trackman")) return pick(ids.trackManSession ?? ids.trackManSession_any, "trackManSession");
        if (has("/portal/drills")) return pick(ids.trainingDrillV2, "trainingDrillV2");
        if (has("/portal/gjennomfore")) return pick(ids.trainingPlanSession, "trainingPlanSession");
        if (has("/faktura")) return pick(ids.payment_any, "payment");
        if (has("/utfordringer")) return pick(ids.drillChallenge, "drillChallenge");
        if (has("/turneringer/")) return pick(ids.tournamentEntry ?? ids.tournamentEntry_any, "tournamentEntry");
        if (has("/goal/")) return pick(ids.goal ?? ids.goal_any, "goal");
        if (has("/sporsmal/")) return pick(ids.question, "question");
        if (has("/stats/sg-sammenlign")) return pick(ids.brukerSammenligning, "brukerSammenligning");
        if (has("/portal/tren/ovelser")) return pick(ids.exerciseDefinition, "exerciseDefinition");
        return pick(null, "id:" + rute);
      default: return pick(null, name);
    }
  });
  return { path, miss };
}

function ctxFor(rute) {
  if (rute.startsWith("/admin") || rute.startsWith("/team-wang") || rute.startsWith("/team-norway")) return "coach";
  if (rute.startsWith("/forelder")) return "parent";
  if (rute.startsWith("/portal") || rute.startsWith("/innsyn") || rute.startsWith("/meg") || rute.startsWith("/onboard") || rute.startsWith("/vedlikehold")) return "player";
  return "anon";
}
// Fallback: finn dynamiske segmenter ved å crawle foreldersiden og matche lenker mot rutemønsteret.
const crawlCache = {};
async function crawlResolve(ctx, rute) {
  const re = new RegExp("^" + rute.replace(/[.*+?^${}()|\\]/g, "\\$&").replace(/\\\[\w+\\\]/g, "[^/?#]+") + "$");
  const segs = rute.split("/");
  const firstDyn = segs.findIndex((x) => /^\[/.test(x));
  const cands = [];
  for (let i = firstDyn; i >= 1; i--) { const p = segs.slice(0, i).join("/") || "/"; if (!/\[/.test(p)) cands.push(p); }
  for (const parent of cands.slice(0, 3)) {
    let hrefs = crawlCache[parent];
    if (!hrefs) {
      const page = await ctx.newPage();
      try {
        await page.goto(parent, { waitUntil: "load", timeout: 45000 }); await page.waitForTimeout(1200);
        hrefs = await page.$$eval("a[href]", (as) => as.map((a) => a.getAttribute("href")));
      } catch { hrefs = []; }
      await page.close(); crawlCache[parent] = hrefs;
    }
    const h = hrefs.map((x) => (x ?? "").split(/[?#]/)[0]).find((x) => re.test(x));
    if (h) return h;
  }
  return null;
}

const DEMO = /\bdemo\b|Lorem|\bTODO\b|placeholder|FINNES IKKE I APPEN/gi;
const CRASH = /Application error|Internal Server Error|This page couldn.t load|Unhandled Runtime Error|Something went wrong/i;

async function maal(ctx, path, w, h, fil, omrade) {
  const page = await ctx.newPage();
  await page.setViewportSize({ width: w, height: h });
  const cons = []; const errs = [];
  page.on("console", (m) => { if (m.type() === "error") cons.push(m.text().slice(0, 160)); });
  page.on("pageerror", (e) => errs.push(String(e.message).slice(0, 160)));
  const res = { bredde: w };
  try {
    let r;
    for (let f = 0; f < 2; f++) {
      try { r = await page.goto(path, { waitUntil: "load", timeout: 45000 }); break; }
      catch (e) { if (f === 1) throw e; cons.length = 0; errs.length = 0; }
    }
    res.status = r ? r.status() : null;
    await page.waitForTimeout(1500);
    res.sluttUrl = new URL(page.url()).pathname + new URL(page.url()).search;
    res.videresendt = new URL(page.url()).pathname !== path.split(/[?#]/)[0];
    const minTreff = w <= 1024 ? 44 : 32;
    const d = await page.evaluate((minTreff) => {
      const iw = innerWidth;
      let utenfor = 0;
      for (const el of document.body.querySelectorAll("*")) {
        const rc = el.getBoundingClientRect();
        if (rc.width <= 0 || rc.height <= 0 || rc.right <= iw + 1) continue;
        const cs = getComputedStyle(el);
        if (cs.visibility === "hidden" || cs.display === "none" || cs.opacity === "0") continue;
        let clipped = false;
        for (let a = el.parentElement; a && a !== document.documentElement; a = a.parentElement) {
          const s = getComputedStyle(a);
          if ((s.overflowX !== "visible") && a.getBoundingClientRect().right <= iw + 1) { clipped = true; break; }
          if (s.position === "fixed") break;
        }
        if (!clipped) utenfor++;
      }
      // treffmål
      let smaa = 0; const smaaEks = [];
      for (const el of document.body.querySelectorAll('a[href],button,input:not([type=hidden]),select,textarea,[role=button],[role=tab],[role=checkbox],[role=switch]')) {
        const cs = getComputedStyle(el);
        if (cs.visibility === "hidden" || cs.display === "none" || cs.pointerEvents === "none") continue;
        const rc = el.getBoundingClientRect();
        if (rc.width <= 0 || rc.height <= 0 || rc.right < 0 || rc.left > iw) continue;
        if (el.matches("a") && cs.display === "inline" && el.closest("p,li,span,td,dd,label")) continue;
        if (el.matches('input[type=checkbox],input[type=radio]') && el.closest("label")) continue;
        if (el.disabled) continue;
        if (Math.min(rc.width, rc.height) < minTreff - 0.5) { smaa++; if (smaaEks.length < 3) smaaEks.push((el.getAttribute("aria-label") || el.textContent || el.tagName).trim().slice(0, 20) + ` ${Math.round(rc.width)}x${Math.round(rc.height)}`); }
      }
      const txt = document.body.innerText || "";
      const pa = !!document.querySelector('.pa-root[data-design="precision-athletics"], .pa-root');
      const wang = !!document.querySelector(".wang-app, .wang-tp");
      const tn = !!getComputedStyle(document.documentElement).getPropertyValue("--tn-navy-900").trim();
      return { sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, sh: document.documentElement.scrollHeight, utenfor, smaa, smaaEks, txt, pa, wang, tn, tittel: document.title, overlay: !!(document.querySelector("nextjs-portal")?.shadowRoot?.querySelector("[data-nextjs-dialog], [data-nextjs-dialog-overlay]")) };
    }, minTreff);
    res.sidelengs = d.sw > d.cw; res.scrollWidth = d.sw; res.clientWidth = d.cw;
    res.utenforElementer = d.utenfor; res.smaaTreffmal = d.smaa; res.terskelPx = minTreff; res.smaaEks = d.smaaEks;
    res.demo = [...new Set((d.txt.match(DEMO) || []).map((s) => s.toLowerCase()))];
    res.design = d.pa ? "precision" : d.wang ? "wang" : (d.tn && /^\/team-norway/.test(res.sluttUrl)) ? "tn" : "gammelt";
    res.tekstLengde = d.txt.length;
    res.krasj = CRASH.test(d.txt) || d.overlay || (res.status ?? 0) >= 500;
    res.is404 = res.status === 404 || /^404|ikke funnet|This page could not be found/i.test(d.txt.slice(0, 400));
    res.konsollfeil = [...new Set([...cons, ...errs])].slice(0, 5);
    res.tom = d.txt.trim().length < 20;
    res.tittel = d.tittel.slice(0, 60);
    try {
      fs.mkdirSync(`${OUT}/skjerm/${omrade}`, { recursive: true });
      await page.screenshot({ path: `${OUT}/skjerm/${omrade}/${fil}-${w}.png`, fullPage: true, clip: { x: 0, y: 0, width: w, height: Math.min(d.sh, 4000) } });
    } catch (e) { res.skjermbildeFeil = String(e.message).slice(0, 80); }
  } catch (e) {
    res.krasj = true; res.feil = "timeout/exception: " + String(e.message).split("\n")[0].slice(0, 120);
  }
  await page.close();
  return res;
}

const done = new Set();
if (RESUME && fs.existsSync(`${OUT}/maskin.jsonl`)) for (const l of fs.readFileSync(`${OUT}/maskin.jsonl`, "utf8").split("\n").filter(Boolean)) { const o = JSON.parse(l); done.add(o.screenId + "|" + o.rute + "|" + o.bredde); }
else fs.writeFileSync(`${OUT}/maskin.jsonl`, "");
let idx = 0; let ferdige = 0;
const jobs = rows.slice(0, LIMIT);
async function worker() {
  while (idx < jobs.length) {
    const s = jobs[idx++];
    if (done.has(s.screenId + "|" + s.rute + "|390") && done.has(s.screenId + "|" + s.rute + "|1440")) continue;
    let { path, miss } = resolve(s.rute);
    let k = ctxFor(s.rute);
    let viaCoach = false;
    if (k === "player" && !ctxs.player && ctxs.coach) { k = "coach"; viaCoach = true; }
    if (miss.length && ctxs[k] && /\[/.test(s.rute)) {
      const h = await crawlResolve(ctxs[k], s.rute).catch(() => null);
      if (h) { path = h; miss = []; }
    }
    const base = { viaCoach, rute: s.rute, sti: path, kobling: s.kobling, screenId: s.screenId, omrade: s.omrade };
    const lines = [];
    if (miss.length || !ctxs[k]) {
      for (const w of [390, 1440]) lines.push({ ...base, bredde: w, rolle: k, ikkeTestet: miss.length ? "mangler id: " + miss.join(",") : "innlogging feilet (" + k + ")" });
    } else {
      const fil = s.rute.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "root";
      for (const [w, h] of [[390, 844], [1440, 900]]) lines.push({ ...base, rolle: k, ...(await maal(ctxs[k], path, w, h, fil, s.omrade)) });
    }
    for (const l of lines) fs.appendFileSync(`${OUT}/maskin.jsonl`, JSON.stringify(l) + "\n");
    if (++ferdige % 25 === 0) console.log("fremdrift", ferdige, "/", jobs.length);
  }
}
await Promise.all(Array.from({ length: CONC }, worker));
await browser.close();
console.log("FERDIG", jobs.length);
