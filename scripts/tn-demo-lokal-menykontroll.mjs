#!/usr/bin/env node
/**
 * Avgrenset LESEKONTROLL av Team Norway-menyen mot den kjørende lokale
 * reserven (scripts/tn-demo-lokal-standby.mjs, port 3011). Logger inn med
 * den eksisterende syntetiske coach-kontoen, følger de faktiske menylenkene
 * fra tnHovedmeny() og besøker hver side ved 390/834/1440px. Ingen
 * skrive-handling (ingen invitasjon, slett, lagre eller opprett).
 *
 * Leser credentials KUN programmatisk fra den lokale filen — verdiene
 * skrives aldri til stdout/stderr/skjermbilder. Kjører i en egen,
 * ikke-interaktiv Playwright-nettleser (chromium.launch), ikke Anders' egen
 * Chrome-fane.
 */
import { chromium } from "@playwright/test";
import { readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { renFeilmelding } from "./tn-demo-lokal-privatfil.mjs";

const APP_HOST = "127.0.0.1";
const APP_PORT = "3011";
const APP = `http://${APP_HOST}:${APP_PORT}`;
const CREDS_FIL = "/tmp/ak-hq-tn-demo-creds.env";
const UT_DIR = "/tmp/ak-hq-tn-demo-menykontroll";
const RAPPORT_FIL = join(UT_DIR, "funn.json");

function krevAppUrl(url) {
  const target = new URL(url);
  if (target.hostname !== APP_HOST || target.port !== APP_PORT) {
    throw new Error(`Kun den isolerte TN-reserven på ${APP_HOST}:${APP_PORT} er tillatt — ikke hosted, ikke WANG.`);
  }
  return target;
}
krevAppUrl(APP);

function lastCreds(sti) {
  if (!existsSync(sti)) throw new Error(`Mangler ${sti}. Kjør scripts/tn-demo-lokal-reise.mjs eller -standby.mjs først.`);
  const env = {};
  for (const linje of readFileSync(sti, "utf8").split("\n")) {
    const treff = linje.match(/^([A-Z0-9_]+)=(.*)$/);
    if (treff) env[treff[1]] = treff[2];
  }
  return env;
}

// Credentials leses inn i minnet og brukes direkte til å fylle skjemafelt —
// de logges, printes eller skrives ALDRI ut noe sted i dette skriptet.
const creds = lastCreds(CREDS_FIL);
if (!creds.TN_DEMO_COACH_EMAIL || !creds.TN_DEMO_COACH_PASSWORD) {
  throw new Error("Fant ikke coach-credentials i den lokale filen.");
}

mkdirSync(UT_DIR, { recursive: true });

// De faktiske menylenkene fra tnHovedmeny() (src/components/team-norway/tn-shell.tsx),
// avgrenset til punktene i oppdraget. Gruppeposter/Dokumenter/Inviter/Trenere-
// og-tilgang er bevisst utelatt (invitasjon/skriv-handlinger, ikke bedt om).
const RUTER = [
  { id: "oversikt", menyLabel: "Oversikt", href: "/team-norway" },
  { id: "fellestesting", menyLabel: "Fellestesting", href: "/team-norway/fellestesting" },
  { id: "protokoller", menyLabel: "Testprotokoller", href: "/team-norway/protokoller" },
  { id: "manedsplan", menyLabel: "Månedsplan", href: "/team-norway/manedsplan" },
  { id: "samlinger", menyLabel: "Samlingspunkt", href: "/team-norway/samlinger" },
  { id: "college", menyLabel: "Collegegruppen", href: "/team-norway/college" },
  { id: "spillere", menyLabel: "Spillerutvikling", href: "/team-norway/spillere" },
  { id: "uttak", menyLabel: "Uttaksliste", href: "/team-norway/uttak" },
  { id: "rangliste", menyLabel: "Rangliste", href: "/team-norway/rangliste" },
  { id: "skoler", menyLabel: "Skoleoversikt", href: "/team-norway/skoler" },
  { id: "turneringer", menyLabel: "Turneringer", href: "/team-norway/turneringer" },
  { id: "referansenivaer", menyLabel: "Referansenivåer", href: "/team-norway/referansenivaer" },
  { id: "apparatet", menyLabel: "Trenerkatalog", href: "/team-norway/apparatet" },
];

const VIEWPORTS = [
  { tag: "390", width: 390, height: 844 },
  { tag: "834", width: 834, height: 1194 },
  { tag: "1440", width: 1440, height: 900 },
];

// Liten, representativ delmengde for skjermbilder (ikke alle 13 × 3 = 39).
const SKJERMBILDE_RUTER = new Set(["oversikt", "spillere", "fellestesting", "protokoller"]);

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const konsollFeil = [];
  const sideFeil = [];
  const serverFeil = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") konsollFeil.push(msg.text());
  });
  page.on("pageerror", (err) => sideFeil.push(String(err)));
  page.on("response", (res) => {
    if (res.request().resourceType() === "document" && res.status() >= 400) {
      serverFeil.push(`${res.status()} ${res.url()}`);
    }
  });

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${APP}/auth/login`);
  await page.locator('input[type="email"]').fill(creds.TN_DEMO_COACH_EMAIL);
  await page.locator('input[type="password"]').fill(creds.TN_DEMO_COACH_PASSWORD);
  await page.locator('form button[type="submit"]').click();
  await page.waitForURL(
    (url) => {
      const path = new URL(url).pathname;
      return path.startsWith("/portal") || path.startsWith("/admin") || path.startsWith("/team-norway");
    },
    { timeout: 60_000 },
  );

  const funn = [];

  // Bekreft at menylenkene FAKTISK finnes i den renderte sidemenyen (ekte
  // reise, ikke gjettede URL-er), på oversiktssiden ved 1440px. networkidle
  // er nødvendig her — uten den ga en tidligere kjøring falske "ikke funnet"
  // fordi sjekken kjørte før siden var ferdig rendret (rase, ikke reelt funn).
  await page.goto(`${APP}/team-norway`, { waitUntil: "networkidle" });
  const menyFunn = [];
  for (const rute of RUTER) {
    const lenke = page.getByRole("link", { name: rute.menyLabel, exact: true }).first();
    const finnesIMenyen = await lenke.isVisible().catch(() => false);
    menyFunn.push({ id: rute.id, menyLabel: rute.menyLabel, finnesIMenyen });
  }

  for (const rute of RUTER) {
    for (const vp of VIEWPORTS) {
      konsollFeil.length = 0;
      sideFeil.length = 0;
      serverFeil.length = 0;
      await page.setViewportSize({ width: vp.width, height: vp.height });
      let httpStatus = null;
      const res = await page.goto(`${APP}${rute.href}`, { waitUntil: "networkidle" }).catch((e) => {
        sideFeil.push(`Navigasjon feilet: ${e instanceof Error ? e.message : String(e)}`);
        return null;
      });
      httpStatus = res ? res.status() : null;
      const [scrollWidth, clientWidth] = await page
        .evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth])
        .catch(() => [null, null]);
      const overflowPx = scrollWidth !== null ? scrollWidth - clientWidth : null;
      const h1 = await page.locator("h1").first().textContent().catch(() => null);
      const harInnhold = await page
        .locator("table, ul li, [role='region']")
        .first()
        .isVisible()
        .catch(() => false);

      funn.push({
        rute: rute.id,
        href: rute.href,
        viewport: vp.tag,
        httpStatus,
        tittel: h1?.trim() ?? null,
        overflowPx,
        harSynligInnholdEllerTabell: harInnhold,
        konsollFeil: [...konsollFeil],
        sideFeil: [...sideFeil],
        serverFeil: [...serverFeil],
      });

      if (SKJERMBILDE_RUTER.has(rute.id) && (vp.tag === "390" || vp.tag === "1440")) {
        await page.screenshot({ path: join(UT_DIR, `${rute.id}-${vp.tag}.png`), fullPage: true }).catch(() => undefined);
      }
    }
  }

  // Spillerpost: følg den EKTE lenken for DEN NAVNGITTE demospilleren — ikke
  // .first() over alle rader (som tidligere kunne treffe en annen, allerede
  // eksisterende syntetisk spiller i samme delte database).
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${APP}/team-norway/spillere`, { waitUntil: "networkidle" });
  const spillerNavn = "TN Demo Spiller";
  const spillerLenke = page.getByRole("link", { name: spillerNavn, exact: true });
  const spillerpostFunn = { rute: "spillerpost", href: null, viewport: "1440", httpStatus: null, konsollFeil: [], sideFeil: [], serverFeil: [] };
  if (await spillerLenke.isVisible().catch(() => false)) {
    const href = await spillerLenke.getAttribute("href");
    konsollFeil.length = 0;
    sideFeil.length = 0;
    serverFeil.length = 0;
    let malteStatus = null;
    const fangResponsForDenneSiden = (res) => {
      if (res.url() === `${APP}${href}` && res.request().resourceType() === "document") malteStatus = res.status();
    };
    page.on("response", fangResponsForDenneSiden);
    await Promise.all([
      page.waitForURL((url) => new URL(url).pathname === href, { timeout: 15_000 }),
      spillerLenke.click(),
    ]);
    await page.waitForLoadState("networkidle").catch(() => undefined);
    page.off("response", fangResponsForDenneSiden);
    spillerpostFunn.href = href;
    // Klientnavigert (Next Link) treffer ikke alltid en ny dokument-response
    // å måle — status forblir null i så fall i stedet for å late som 200.
    spillerpostFunn.httpStatus = malteStatus;
    spillerpostFunn.tittel = await page.locator("h1").first().textContent().catch(() => null);
    spillerpostFunn.konsollFeil = [...konsollFeil];
    spillerpostFunn.sideFeil = [...sideFeil];
    spillerpostFunn.serverFeil = [...serverFeil];
    await page.screenshot({ path: join(UT_DIR, "spillerpost-1440.png"), fullPage: true }).catch(() => undefined);
    // Også 390px for spillerposten (den er nevnt spesifikt i oppdraget).
    await page.setViewportSize({ width: 390, height: 844 });
    const overflowRes = await page.goto(`${APP}${href}`, { waitUntil: "networkidle" }).catch(() => null);
    if (overflowRes) spillerpostFunn.httpStatus = overflowRes.status();
    await page.screenshot({ path: join(UT_DIR, "spillerpost-390.png"), fullPage: true }).catch(() => undefined);
  } else {
    spillerpostFunn.sideFeil.push(`Fant ingen lenke med eksakt navn «${spillerNavn}» i spillerlisten.`);
  }
  funn.push(spillerpostFunn);

  // Mørk modus: koden (src/lib/v2/team-norway.ts) dokumenterer mørk som en
  // ROLLE (hero/seksjonsskille), ikke et globalt tema. Testes empirisk her —
  // ikke antatt — ved å emulere OS-mørk og se om noe faktisk endrer seg.
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${APP}/team-norway`);
  const bakgrunnLys = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  await page.emulateMedia({ colorScheme: "dark" });
  await page.reload({ waitUntil: "networkidle" });
  const bakgrunnMorkEmulert = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  await page.screenshot({ path: join(UT_DIR, "oversikt-os-dark-emulert-1440.png"), fullPage: true }).catch(() => undefined);
  const morktemaReagerer = bakgrunnLys !== bakgrunnMorkEmulert;
  await page.emulateMedia({ colorScheme: "light" });

  const rapport = { menyFunn, funn, morkTema: { bakgrunnLys, bakgrunnMorkEmulert, endretSegVedOsMorkEmulering: morktemaReagerer } };
  writeFileSync(RAPPORT_FIL, JSON.stringify(rapport, null, 2));
  process.stdout.write(`Ferdig. Rapport: ${RAPPORT_FIL}\nSkjermbilder: ${UT_DIR}\n`);

  await browser.close();
}

main().catch((error) => {
  process.stderr.write(`${renFeilmelding(error)}\n`);
  process.exit(1);
});
