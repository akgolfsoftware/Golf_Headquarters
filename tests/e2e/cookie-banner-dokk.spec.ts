/**
 * Regresjon (10.08.2026): cookie-banneret lå oppå bunn-forankret chrome på
 * mobil — bunn-nav og sticky handlingsdokker så klikkbare ut, men banner-kortet
 * fanget trykket. Banneret publiserer nå sin høyde som `--ak-cookie-h`, og
 * bunn-chrome legger variabelen til sin egen bunn-padding.
 *
 * Testen kjører på 390px (iPhone-førsteinntrykket) med tomt samtykke.
 */
import { test, expect, type Page } from "@playwright/test";
import { loginAsPlayer, playerCredentials } from "./_auth-helpers";

const BANNER = '[aria-label="Cookie-samtykke"]';

test.use({ viewport: { width: 390, height: 844 } });

/** Nullstill samtykke og vent til banneret faktisk står i bunnen. */
async function visBanner(page: Page, url: string): Promise<void> {
  await page.goto(url);
  await page.evaluate(() => {
    localStorage.removeItem("ak_cookie_consent");
    document.cookie =
      "ak_cookie_consent=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
  });
  await page.reload();
  await page.waitForSelector(BANNER, { timeout: 30_000 });
}

/**
 * Finner nederste chrome-element (fixed/sticky, bredt, forankret i bunnen) og
 * treffprøver midtpunktet av dets øvre kant — der handlingen ligger.
 */
async function bunnChromeTreff(page: Page) {
  return page.evaluate((bannerSel) => {
    const rot = document.documentElement;
    const dokk = Array.from(document.querySelectorAll("body *")).find((e) => {
      const cs = getComputedStyle(e);
      if (cs.position !== "fixed" && cs.position !== "sticky") return false;
      if (e.closest(bannerSel)) return false;
      const r = e.getBoundingClientRect();
      return (
        r.height > 0 &&
        r.bottom > window.innerHeight - 8 &&
        r.width > window.innerWidth * 0.5
      );
    }) as HTMLElement | undefined;
    if (!dokk) return { funnet: false as const };
    const r = dokk.getBoundingClientRect();
    const traff = document.elementFromPoint(
      Math.round(r.left + r.width / 2),
      Math.round(r.top + Math.min(28, r.height / 2)),
    );
    return {
      funnet: true as const,
      cookieVar: rot.style.getPropertyValue("--ak-cookie-h"),
      dekketAvBanner: !!traff?.closest(bannerSel),
      trefferDokk: !!traff && dokk.contains(traff),
    };
  }, BANNER);
}

test("cookie-banneret publiserer høyden sin som --ak-cookie-h", async ({ page }) => {
  await visBanner(page, "/booking");
  const maal = await page.evaluate((sel) => {
    const b = document.querySelector(sel) as HTMLElement | null;
    return {
      varVerdi: document.documentElement.style.getPropertyValue("--ak-cookie-h"),
      hoyde: b ? Math.ceil(b.getBoundingClientRect().height) : 0,
    };
  }, BANNER);
  expect(maal.hoyde).toBeGreaterThan(0);
  expect(maal.varVerdi).toBe(`${maal.hoyde}px`);
});

test("--ak-cookie-h nullstilles når samtykke er gitt", async ({ page }) => {
  await visBanner(page, "/booking");
  await page.getByRole("button", { name: "Kun nødvendige", exact: true }).click();
  await page.waitForSelector(BANNER, { state: "detached", timeout: 10_000 });
  const verdi = await page.evaluate(() =>
    document.documentElement.style.getPropertyValue("--ak-cookie-h"),
  );
  expect(verdi).toBe("0px");
});

test("PlayerHQ bunn-nav er klikkbar mens cookie-banneret vises", async ({ page }) => {
  test.skip(!playerCredentials(), "mangler testbruker (SCREENTEST_PASSWORD)");
  await loginAsPlayer(page);
  await visBanner(page, "/portal");
  const treff = await bunnChromeTreff(page);
  expect(treff.funnet).toBe(true);
  expect(treff).toMatchObject({ dekketAvBanner: false, trefferDokk: true });
});
