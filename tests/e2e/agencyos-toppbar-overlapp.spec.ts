/**
 * Regresjonstest — sticky toppbar på AgencyOS-konsollen skal aldri dekke innhold.
 *
 * Bakgrunn (målt i prod 2026-08-14, 390x844): konsollen autoscrollet hele
 * dokumentet til bunn ved sidelasting, og de øverste 112 px av siste skjermbilde
 * lå da bak den sticky toppbaren — «Åpne AgenticOS» ble klippet på midten.
 * Feilen fantes i både main og PR-preview, altså ikke innført av designporten.
 *
 * Testen låser to ting: (1) siden lander på toppen, ikke i bunn, og
 * (2) ingen synlig handling overlapper toppbaren.
 */
import { test, expect } from "@playwright/test";
import { loginAsCoach, hasCoachAuth, dismissCookieBanner } from "./_auth-helpers";

test.describe("AgencyOS-konsollen — sticky toppbar", () => {
  test.skip(!hasCoachAuth(), "mangler coach-credentials");

  test("toppbaren dekker ingen handling ved sidelasting (390px)", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await loginAsCoach(page);
    await page.goto("/admin/agencyos");
    await dismissCookieBanner(page);
    await page.locator("header[data-paper-topbar='konsoll']").waitFor();
    // Autoscroll er «smooth» — vent forbi vinduet der den ev. ville kjørt.
    await page.waitForTimeout(2500);

    const funn = await page.evaluate(() => {
      const topp = document.querySelector<HTMLElement>("header[data-paper-topbar='konsoll']")!;
      const tb = topp.getBoundingClientRect();
      const dekket: string[] = [];
      document.querySelectorAll<HTMLElement>("a, button").forEach((el) => {
        if (topp.contains(el)) return;
        const r = el.getBoundingClientRect();
        if (r.height === 0 || r.width === 0) return;
        // Utenfor viewporten er uinteressant — vi ser kun på det som vises nå.
        if (r.bottom <= 0 || r.top >= window.innerHeight) return;
        if (r.top < tb.bottom && r.bottom > tb.top) {
          dekket.push(`${el.tagName} "${(el.textContent || "").trim().slice(0, 40)}"`);
        }
      });
      return {
        dekket,
        scrollY: window.scrollY,
        scrollPaddingTop: getComputedStyle(document.documentElement).scrollPaddingTop,
      };
    });

    expect(funn.dekket, `handlinger bak toppbaren: ${funn.dekket.join(", ")}`).toEqual([]);
    // Konsollen skal møte deg på toppen — ikke autoscrollet til bunn.
    expect(funn.scrollY).toBeLessThan(50);
    // --ak-topbar-h skal være publisert, så anker-hopp lander under toppbaren.
    expect(funn.scrollPaddingTop).not.toBe("auto");
    expect(parseFloat(funn.scrollPaddingTop)).toBeGreaterThan(0);
  });
});

/**
 * Alle sticky toppbarer over dokumentrullen skal publisere --ak-topbar-h, slik
 * at `html { scroll-padding-top }` faktisk har en verdi å jobbe med. Uten dette
 * lander anker-hopp bak toppbaren — det er nøyaktig feilen over, bare på en
 * annen flate.
 *
 * NB: `/stats/leaderboards`, `/stats/klubber` m.fl. er bevisst redirect'et til
 * `/stats` i produksjon (prototypedata, se `STATS_PROTOTYPE_PREFIXES` i
 * proxy.ts) — ikke bruk dem som testruter, de lander aldri der du tror.
 */
async function maalToppbar(page: import("@playwright/test").Page) {
  return page.evaluate(() => {
    const rot = document.documentElement;
    return {
      variabel: getComputedStyle(rot).getPropertyValue("--ak-topbar-h").trim(),
      padding: getComputedStyle(rot).scrollPaddingTop,
    };
  });
}

test.describe("Sticky toppbarer publiserer høyden sin", () => {
  test("--ak-topbar-h er satt på /stats/2026 (offentlig)", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/stats/2026");
    await dismissCookieBanner(page);
    await page.waitForTimeout(1200);

    const maalt = await maalToppbar(page);
    expect(maalt.variabel, "--ak-topbar-h skal være publisert").not.toBe("");
    expect(parseFloat(maalt.padding)).toBeGreaterThan(0);
  });

  test("--ak-topbar-h er satt på /admin/innboks", async ({ page }) => {
    test.skip(!hasCoachAuth(), "mangler coach-credentials");
    await page.setViewportSize({ width: 390, height: 844 });
    await loginAsCoach(page);
    await page.goto("/admin/innboks");
    await dismissCookieBanner(page);
    await page.waitForTimeout(1500);

    const maalt = await maalToppbar(page);
    expect(maalt.variabel, "--ak-topbar-h skal være publisert").not.toBe("");
    expect(parseFloat(maalt.padding)).toBeGreaterThan(0);
  });
});
