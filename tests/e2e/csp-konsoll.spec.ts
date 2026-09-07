/**
 * CSP-røyk — ingen «Content Security Policy»-brudd i nettleserkonsollen på
 * AgencyOS-ruter som streamer en loading.tsx-fallback.
 *
 * Bakgrunn (målt i prod 05.09.2026, skjermbilde-gate A0): på `/admin/analyse`
 * (alle tre faner) og `/admin/spillere/[id]` ble én Next-chunk blokkert av
 * `script-src 'self' 'nonce-…' 'strict-dynamic'`. Rotårsak (07.09.2026):
 * Next 16.3 sin `createComponentStylesAndScripts` (app-render) lager
 * `<script async src>` for loading-/error-grensens klient-chunks UTEN nonce —
 * `get-layer-assets.js` (layout/page) sender `nonce: ctx.nonce`, den gjør det
 * ikke. Når siden suspenderer lenge nok til at fallbacken streames, ligger den
 * nonse-løse taggen i HTML-en og blokkeres. Feilen ligger også i de
 * forhåndskompilerte prod-runtime-bundlene, så den kan ikke patches lokalt.
 * Fiks på vår side: V2Laster er ren serverkomponent (src/components/v2/laster.tsx),
 * så loading.tsx bærer ingen klient-JS og Next har ingen tag å skrive.
 *
 * Testen feiler på enhver konsollmelding som nevner Content Security Policy
 * (eller script-src) og på requestfailed med csp-årsak, på nettopp de rutene
 * som avdekket feilen.
 */
import { test, expect, type Page } from "@playwright/test";
import { loginAsCoach, hasCoachAuth } from "./_auth-helpers";

const CSP_MONSTER = /content security policy|script-src/i;

async function cspBruddPaa(page: Page, rute: string): Promise<string[]> {
  const brudd: string[] = [];
  const paaKonsoll = (m: { text: () => string }) => {
    const tekst = m.text();
    if (CSP_MONSTER.test(tekst)) brudd.push(`konsoll: ${tekst.slice(0, 240)}`);
  };
  const paaFeilet = (r: { url: () => string; failure: () => { errorText: string } | null }) => {
    const aarsak = r.failure()?.errorText ?? "";
    if (/csp/i.test(aarsak)) brudd.push(`requestfailed (${aarsak}): ${r.url()}`);
  };
  page.on("console", paaKonsoll);
  page.on("requestfailed", paaFeilet);
  await page.goto(rute);
  // Chunkene lastes async etter `load` — vent til nettverket roer seg.
  await page.waitForLoadState("networkidle", { timeout: 30_000 }).catch(() => undefined);
  await page.waitForTimeout(1_000);
  page.off("console", paaKonsoll);
  page.off("requestfailed", paaFeilet);
  return brudd;
}

test.describe("CSP — ingen blokkerte scripts i AgencyOS", () => {
  test.skip(!hasCoachAuth(), "mangler coach-credentials");

  test("/admin/analyse (alle tre faner) laster uten CSP-brudd", async ({ page }) => {
    await loginAsCoach(page);
    for (const rute of ["/admin/analyse", "/admin/analyse?fane=spiller", "/admin/analyse?fane=etterlevelse"]) {
      const brudd = await cspBruddPaa(page, rute);
      expect(brudd, `${rute}: ${brudd.join(" | ")}`).toEqual([]);
    }
  });

  test("/admin/spillere/[id] laster uten CSP-brudd", async ({ page }) => {
    await loginAsCoach(page);
    await page.goto("/admin/spillere");
    const href = await page
      .locator('a[href^="/admin/spillere/"]:not([href$="/ny"])')
      .first()
      .getAttribute("href", { timeout: 30_000 });
    expect(href, "fant ingen spillerlenke i stallen").toBeTruthy();
    const brudd = await cspBruddPaa(page, href!);
    expect(brudd, `${href}: ${brudd.join(" | ")}`).toEqual([]);
  });
});
