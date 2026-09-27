/**
 * Lanseringskjeden — hver synlig knapp/lenke virker.
 *
 * Feiler hvis en synlig <a>/<button>/[role=button] verken har:
 *  - href til en ekte rute (ikke "#" / tom / javascript:)
 *  - native onClick som gjør noe (React-handlere syns ikke i DOM — de dekkes
 *    av den statiske grepen under)
 *  - disabled/aria-disabled med forklaring (title, aria-label eller synlig tekst)
 *  - nærmeste <a href> med ekte rute (knapp inni Link, f.eks. BankID)
 *
 * Statisk grep kjører uten innlogging (CI). Runtime-kjeden skipper uten
 * SCREENTEST_PASSWORD / E2E_*-credentials. Ingen e-post, ingen Stripe-kjøp,
 * ingen publisering til ekte spiller.
 *
 * I dag-Start mot `/portal/tren/wb/` eies av Task 2 — logges, ikke endret.
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { test, expect, type Locator, type Page } from "@playwright/test";
import { config as loadEnv } from "dotenv";
import {
  coachCredentials,
  playerCredentials,
  dismissCookieBanner,
} from "./_auth-helpers";

loadEnv({ path: ".env.local" });

const DØD_ONCLICK =
  /onClick=\{\(\)\s*=>\s*(\{\s*\}|undefined|null|void\s+0)/;
const DØD_HREF_HASH = /href=["']#["']/;
const DØD_HREF_TOM = /href=["']["']/;

/** Filer i spiller- og coach-løypen. Ikke språk-innstillinger, ikke marketing. */
const KJEDEROTER = [
  "src/app/auth",
  "src/app/portal/page.tsx",
  "src/app/portal/planlegge",
  "src/app/portal/analysere",
  "src/app/portal/trackman",
  "src/app/portal/meg",
  "src/app/portal/coach",
  "src/app/portal/booking",
  "src/app/portal/(fullscreen)/live",
  "src/app/portal/(fullscreen)/tren",
  "src/components/portal/v2/LoginV2.tsx",
  "src/components/portal/v2/idag",
  "src/components/portal/v2/PlanV2.tsx",
  "src/components/portal/v2/AnalyseHubTrainLock.tsx",
  "src/components/portal/v2/TrackManListeTrainLock.tsx",
  "src/components/portal/v2/MegV2.tsx",
  "src/components/portal/v2/MegAbonnementV2.tsx",
  "src/components/portal/v2/CoachHubV2.tsx",
  "src/components/portal/v2/BookingHubV2.tsx",
  "src/components/portal/v2/BookingCoachV2.tsx",
  "src/components/portal/v2/BookingNyV2.tsx",
  "src/components/portal/v2/BookingNyBekreftV2.tsx",
  "src/components/portal/live",
  "src/components/portal/workbench",
  "src/app/admin/spillere",
  "src/app/admin/workbench",
  "src/app/admin/plan",
  "src/app/admin/ko",
  "src/app/admin/kommunikasjon",
  "src/app/admin/jarvis",
  "src/app/admin/profile",
  "src/components/admin/v2/TrainLockStall.tsx",
  "src/components/admin/v2/SpillerOversiktV2.tsx",
  "src/components/admin/v2/ko",
  "src/components/admin/v2/kommunikasjon",
  "src/components/admin/v2/jarvis",
  "src/components/admin/v2/oppsett/AdminProfilTrainLock.tsx",
  "src/components/workbench",
  "src/lib/agencyos/skall-ia.ts",
  "src/components/v2/shell.tsx",
] as const;

const BREDDER = [
  { navn: "mobil", viewport: { width: 390, height: 844 } },
  { navn: "desktop", viewport: { width: 1280, height: 900 } },
] as const;

/** Klikk som sender e-post, tar betaling eller publiserer — aldri i denne testen. */
const STOPP_KLIKK =
  /betal|kjøp|stripe|checkout|publiser alle|publiser valgte|send melding|send e-post|godta|avvis|bekreft time|bekreft booking|bekreft betaling/i;

type DodFunnet = { fil: string; linje: number; treff: string };

function erTsFil(navn: string): boolean {
  const ext = extname(navn);
  return ext === ".ts" || ext === ".tsx";
}

function samleFiler(rot: string, ut: string[]): void {
  let st;
  try {
    st = statSync(rot);
  } catch {
    return;
  }
  if (st.isFile()) {
    if (erTsFil(rot)) ut.push(rot);
    return;
  }
  if (!st.isDirectory()) return;
  for (const barn of readdirSync(rot)) {
    if (barn === "node_modules" || barn.startsWith(".")) continue;
    samleFiler(join(rot, barn), ut);
  }
}

function grepDod(fil: string): DodFunnet[] {
  const tekst = readFileSync(fil, "utf8");
  const linjer = tekst.split("\n");
  const funn: DodFunnet[] = [];
  linjer.forEach((linje, i) => {
    if (DØD_ONCLICK.test(linje) || DØD_HREF_HASH.test(linje) || DØD_HREF_TOM.test(linje)) {
      funn.push({
        fil: relative(process.cwd(), fil),
        linje: i + 1,
        treff: linje.trim().slice(0, 120),
      });
    }
  });
  return funn;
}

function ekteHref(href: string | null): boolean {
  if (!href) return false;
  const h = href.trim();
  if (h === "" || h === "#" || /^javascript:/i.test(h)) return false;
  return true;
}

async function etikett(el: Locator): Promise<string> {
  const aria = (await el.getAttribute("aria-label"))?.trim();
  if (aria) return aria;
  const title = (await el.getAttribute("title"))?.trim();
  if (title) return title;
  const tekst = (await el.innerText()).replace(/\s+/g, " ").trim();
  return tekst.slice(0, 80) || "(uten navn)";
}

async function auditSynligeKnapper(page: Page): Promise<string[]> {
  const rute = new URL(page.url()).pathname;
  const feil: string[] = [];

  const lenker = page.locator("a[href]");
  const nLenker = await lenker.count();
  for (let i = 0; i < nLenker; i++) {
    const el = lenker.nth(i);
    if (!(await el.isVisible().catch(() => false))) continue;
    const href = await el.getAttribute("href");
    if (ekteHref(href)) continue;
    // In-page anker (#id) er OK når målet finnes.
    if (href && href.startsWith("#") && href.length > 1) {
      const id = href.slice(1);
      if ((await page.locator(`[id="${id}"]`).count()) > 0) continue;
    }
    feil.push(`${rute}: lenke «${await etikett(el)}» har død href="${href ?? ""}"`);
  }

  const knapper = page.locator("button, [role='button']");
  const nKnapper = await knapper.count();
  for (let i = 0; i < nKnapper; i++) {
    const el = knapper.nth(i);
    if (!(await el.isVisible().catch(() => false))) continue;
    const navn = await etikett(el);
    const disabled =
      (await el.isDisabled().catch(() => false)) ||
      (await el.getAttribute("aria-disabled")) === "true";
    if (disabled) {
      const title = (await el.getAttribute("title"))?.trim();
      const aria = (await el.getAttribute("aria-label"))?.trim();
      if (!title && !aria && !navn.replace(/^\(uten navn\)$/, "").trim()) {
        feil.push(`${rute}: disabled knapp uten forklaring`);
      }
      continue;
    }

    const parentHref = await el.evaluate((node) => {
      const a = node.closest("a[href]");
      return a?.getAttribute("href") ?? null;
    });
    if (ekteHref(parentHref)) continue;

    const type = await el.getAttribute("type");
    if (type === "submit") continue;

    const native = await el.evaluate((node) => {
      const h = (node as HTMLElement).onclick;
      if (!h) return "ingen-native";
      const s = Function.prototype.toString.call(h);
      if (/\)\s*=>\s*\{\s*\}/.test(s) || /function\s*\([^)]*\)\s*\{\s*\}/.test(s)) {
        return "noop";
      }
      return "ok";
    });
    if (native === "noop") {
      feil.push(`${rute}: knapp «${navn}» har tom onClick`);
    }
    // React onClick ligger ikke på element.onclick — dekkes av statisk grep.
  }

  return feil;
}

async function gaaOgAudit(page: Page, url: string, feil: string[]): Promise<void> {
  const res = await page.goto(url, { waitUntil: "domcontentloaded" });
  const status = res?.status() ?? 0;
  expect(
    status === 200 || (status >= 300 && status < 400),
    `${url} skal laste — fikk ${status}`,
  ).toBeTruthy();
  await expect(page, `${url} kastet ut til login`).not.toHaveURL(/\/auth\/login/);
  await expect(page.locator("body")).not.toContainText(
    /Application error|Internal Server Error/i,
  );
  await dismissCookieBanner(page);
  feil.push(...(await auditSynligeKnapper(page)));
}

async function settTema(page: Page, tema: "dark" | "light"): Promise<void> {
  await page.evaluate((t) => {
    if (t === "dark") document.documentElement.setAttribute("data-v2-tema", "dark");
    else document.documentElement.removeAttribute("data-v2-tema");
    document.cookie = `ak-v2-tema=${t};path=/;max-age=31536000;samesite=lax`;
    window.dispatchEvent(new Event("ak-v2-tema"));
  }, tema);
}

async function loggInn(page: Page, email: string, password: string): Promise<void> {
  await page.goto("/auth/login");
  await dismissCookieBanner(page);
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/\/(portal|admin|auth\/etter-innlogging|forelder)/, {
    timeout: 30_000,
  });
  await dismissCookieBanner(page);
}

async function klikkHvisTrygg(
  page: Page,
  rolle: "button" | "link",
  name: RegExp,
): Promise<boolean> {
  const knapp = page.getByRole(rolle, { name }).first();
  if (!(await knapp.isVisible().catch(() => false))) return false;
  const navn = await etikett(knapp);
  if (STOPP_KLIKK.test(navn)) return false;
  await knapp.click();
  return true;
}

test("statisk: ingen død onClick eller href=# i lanseringskjeden", () => {
  const filer: string[] = [];
  for (const rot of KJEDEROTER) samleFiler(rot, filer);
  expect(filer.length, "kjede-røtter skal treffe kildefiler").toBeGreaterThan(20);

  const funn = filer.flatMap(grepDod);
  expect(
    funn,
    funn
      .map((f) => `${f.fil}:${f.linje} ${f.treff}`)
      .join("\n") || "ingen",
  ).toEqual([]);
});

test("login-siden har ekte lenker (uten innlogging)", async ({ page }) => {
  await page.goto("/auth/login", { waitUntil: "domcontentloaded" });
  await dismissCookieBanner(page);
  const feil = await auditSynligeKnapper(page);
  await expect(page.getByRole("button", { name: /Logg inn/i }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /Glemt passord/i }).first()).toBeVisible();
  expect(feil, feil.join("\n")).toEqual([]);
});

for (const bredde of BREDDER) {
  test.describe(`spiller-kjeden — ${bredde.navn}`, () => {
    test.use({ viewport: bredde.viewport });

    test(`PlayerHQ-løypen har virkende knapper (${bredde.navn})`, async ({
      page,
    }) => {
      const creds = playerCredentials();
      test.skip(!creds, "Krever E2E_TEST_USER_* eller SCREENTEST_PASSWORD");

      const feil: string[] = [];
      await loggInn(page, creds!.email, creds!.password);

      await gaaOgAudit(page, "/portal", feil);

      const start = page.getByRole("link", { name: /Start økt|Fortsett|Start egen økt/i }).first();
      if (await start.isVisible().catch(() => false)) {
        const href = (await start.getAttribute("href")) ?? "";
        if (href.includes("/portal/tren/wb")) {
          test.info().annotations.push({
            type: "task-2",
            description: `I dag Start href=${href} — Task 2 eier denne, ikke endret`,
          });
        }
        await start.click();
        await page.waitForLoadState("domcontentloaded");
        await expect(page).not.toHaveURL(/\/auth\/login/);
        feil.push(...(await auditSynligeKnapper(page)));

        // Ett steg i live-tapperen: kølleknapp (skriver kun testdata). Hopp over Fullfør.
        const kolle = page.getByRole("button", { name: /Driver|Putter|Jern|Wedge|Fairway/i }).first();
        if (await kolle.isVisible().catch(() => false)) {
          await kolle.click();
        }
        const recap = page.getByRole("link", { name: /recap|oppsummering|se recap/i }).first();
        if (await recap.isVisible().catch(() => false)) {
          await recap.click();
          await page.waitForLoadState("domcontentloaded");
          feil.push(...(await auditSynligeKnapper(page)));
        }
      }

      await gaaOgAudit(page, "/portal/planlegge", feil);
      const dag = page.locator("[data-od-id='plan-root'] button[aria-pressed]").first();
      if (await dag.isVisible().catch(() => false)) {
        const annen = page.locator("[data-od-id='plan-root'] button[type='button']").nth(1);
        if (await annen.isVisible().catch(() => false)) await annen.click();
      }
      await klikkHvisTrygg(page, "link", /Åpne økt/i);

      await gaaOgAudit(page, "/portal/analysere", feil);
      const dypere = page.locator("a[href^='/portal/']").filter({ hasText: /TrackMan|Runder|Tester|Turnering|DataGolf/i }).first();
      if (await dypere.isVisible().catch(() => false)) {
        await dypere.click();
        await page.waitForLoadState("domcontentloaded");
        feil.push(...(await auditSynligeKnapper(page)));
      }

      await gaaOgAudit(page, "/portal/analysere/trackman", feil);
      await gaaOgAudit(page, "/portal/meg", feil);

      const godta = page.locator('[data-od-id="wb-idag-godkjenning-godta"]');
      if (await godta.isVisible().catch(() => false)) {
        test.info().annotations.push({
          type: "note",
          description: "Godta/Avvis-kort synlig — handlere på plass, ikke klikket (muterer økt)",
        });
      }

      await gaaOgAudit(page, "/portal/coach", feil);
      await gaaOgAudit(page, "/portal/booking", feil);
      const book = page.getByRole("link", { name: /Book time|Se alle ledige tider|Book — betal per time/i }).first();
      if (await book.isVisible().catch(() => false)) {
        const href = (await book.getAttribute("href")) ?? "";
        if (href.includes("/portal/booking/ny") && !/[?&]betaling=1/.test(href)) {
          await book.click();
          await page.waitForLoadState("domcontentloaded");
          feil.push(...(await auditSynligeKnapper(page)));
          // Stopp før bekreft/betaling.
        }
      }

      await gaaOgAudit(page, "/portal/meg/abonnement", feil);

      await settTema(page, "light");
      feil.push(...(await auditSynligeKnapper(page)));
      await settTema(page, "dark");

      expect(feil, feil.join("\n")).toEqual([]);
    });
  });

  test.describe(`coach-kjeden — ${bredde.navn}`, () => {
    test.use({ viewport: bredde.viewport });

    test(`AgencyOS-løypen har virkende knapper (${bredde.navn})`, async ({
      page,
    }) => {
      const creds = coachCredentials();
      test.skip(!creds, "Krever E2E_COACH_* eller SCREENTEST_PASSWORD");

      const feil: string[] = [];
      await loggInn(page, creds!.email, creds!.password);

      await gaaOgAudit(page, "/admin/spillere", feil);
      const spillerLenke = page
        .locator('a[href^="/admin/spillere/"]:not([href="/admin/spillere/ny"])')
        .first();
      if (await spillerLenke.isVisible().catch(() => false)) {
        await spillerLenke.click();
        await page.waitForURL(/\/admin\/spillere\/[^/]+/, { timeout: 20_000 });
        feil.push(...(await auditSynligeKnapper(page)));

        const wb = page.getByRole("link", { name: /Åpne uke i Workbench|Workbench/i }).first();
        if (await wb.isVisible().catch(() => false)) {
          await wb.click();
          await page.waitForURL(/\/admin\/workbench\//, { timeout: 20_000 });
          feil.push(...(await auditSynligeKnapper(page)));

          const publiser = page.getByRole("button", { name: /^Publiser$/ }).first();
          if (await publiser.isVisible().catch(() => false)) {
            const disabled = await publiser.isDisabled();
            if (!disabled) {
              await publiser.click();
              const avbryt = page.getByRole("button", { name: /^Avbryt$/ }).first();
              await expect(avbryt).toBeVisible({ timeout: 8_000 });
              await avbryt.click();
            }
          }
        }
      }

      await gaaOgAudit(page, "/admin/ko", feil);
      await gaaOgAudit(page, "/admin/kommunikasjon", feil);
      await gaaOgAudit(page, "/admin/jarvis", feil);
      await gaaOgAudit(page, "/admin/profile", feil);

      await settTema(page, "light");
      feil.push(...(await auditSynligeKnapper(page)));
      await settTema(page, "dark");

      expect(feil, feil.join("\n")).toEqual([]);
    });
  });
}
