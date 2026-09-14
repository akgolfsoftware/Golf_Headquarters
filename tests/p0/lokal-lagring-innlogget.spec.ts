/**
 * Innlogget R-E-reise for privat lokal lagring (R-C). Mot isolert
 * HQ-Supabase. Hopper ikke over manglende oppsett — da skal prøven feile
 * stengt.
 *
 * Komponent-/enhetstestene i src/lib/offline-queue/*.test.ts og den
 * tidligere kontrollen (docs/design-audit/lokal-lagring-personvern-2026-09-11.md)
 * beviser allerede nøkkelbygging og eierskille i isolasjon. Denne testen er
 * den ekte innloggede ende-til-ende-reisen den kontrollen eksplisitt lister
 * som gjenstående: to virkelige, innloggede brukere etter hverandre på
 * SAMME nettleser-context, uten at noen mellomsteg rydder localStorage/
 * IndexedDB manuelt (det ville skjult akkurat den risikoen testen skal bevise).
 */
import { expect, test, type Page } from "@playwright/test";

function krev(navn: string): string {
  const verdi = process.env[navn]?.trim();
  if (!verdi) {
    throw new Error(`${navn} mangler. Kjør scripts/p0-test-innlogget-reise.mjs mot HQ-stacken.`);
  }
  return verdi;
}

const spillerEpost = krev("P0_PLAYER_EMAIL");
const spillerPassord = krev("P0_PLAYER_PASSWORD");
const spillerId = krev("P0_PLAYER_ID");
const fremmedEpost = krev("P0_FOREIGN_EMAIL");
const fremmedPassord = krev("P0_FOREIGN_PASSWORD");
// Egen økt, ALDRI P0_WB_ID — den deles med spillerreise-innlogget.spec.ts,
// som forventer null tapp på den fra start.
const wbId = krev("P0_LOKAL_WB_ID");
const fremmedWbId = krev("P0_FREMMED_WB_ID");

function stiMatcher(sti: string) {
  return (url: URL) => url.pathname === sti && url.search === "";
}

async function ventPaSti(page: Page, sti: string, timeout = 90_000) {
  await expect(page).toHaveURL(stiMatcher(sti), { timeout });
}

/** WB-økter starter som PUBLISHED — tapper-siden krever IN_PROGRESS. Samme brief→start-flyt som spillerreise-innlogget.spec.ts. */
async function startOktOgApneTapper(page: Page, sessionId: string) {
  await page.goto(`/portal/live/${sessionId}/brief`);
  await page.locator('[data-od-id="brief-start"]').click({ timeout: 20_000 });
  await ventPaSti(page, `/portal/live/${sessionId}/tapper`);
}

async function lukkCookie(page: Page) {
  const btn = page.getByRole("button", { name: "Kun nødvendige", exact: true });
  try {
    await btn.waitFor({ state: "visible", timeout: 8_000 });
    await btn.click();
    await btn.waitFor({ state: "hidden", timeout: 5_000 }).catch(() => undefined);
  } catch {
    // Banner finnes ikke.
  }
}

/** Bevisst UTEN å rydde localStorage/IndexedDB — det er selve risikoen som testes. */
async function loggInnUtenAOppdrag(page: Page, epost: string, passord: string) {
  await page.goto("/auth/login");
  await lukkCookie(page);
  await page.locator('input[type="email"]').fill(epost);
  await page.locator('input[type="password"]').fill(passord);
  await page.locator('form button[type="submit"]').click();
  try {
    await page.waitForURL((url) => new URL(url).pathname.startsWith("/portal"), { timeout: 90_000 });
  } catch (error) {
    const tekst = (await page.locator("#v2login-feil").innerText().catch(() => "")).trim();
    throw new Error(tekst || (error instanceof Error ? error.message : "Innlogging førte ikke videre"));
  }
  await lukkCookie(page);
}

type TapperKoRadForPrøve = { key: string; eierId: string; sessionId: string; counts: Array<{ club: string; count: number }> };

async function lesTapperKo(page: Page): Promise<TapperKoRadForPrøve[]> {
  return page.evaluate(() => {
    return new Promise<TapperKoRadForPrøve[]>((resolve) => {
      const req = indexedDB.open("akgolf-offline-ko", 2);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains("tapper-ko-v2")) {
          req.result.createObjectStore("tapper-ko-v2", { keyPath: "key" });
        }
      };
      req.onsuccess = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains("tapper-ko-v2")) {
          db.close();
          resolve([]);
          return;
        }
        const tx = db.transaction("tapper-ko-v2", "readonly");
        const alle = tx.objectStore("tapper-ko-v2").getAll();
        alle.onsuccess = () => {
          resolve(alle.result as TapperKoRadForPrøve[]);
          db.close();
        };
        alle.onerror = () => {
          resolve([]);
          db.close();
        };
      };
      req.onerror = () => resolve([]);
    });
  });
}

function tellerLocator(page: Page) {
  return page.getByText("slag denne økta", { exact: true }).locator("xpath=following-sibling::div[1]");
}

test.describe("P0 innlogget privat lokal lagring (R-C)", () => {
  test.beforeEach(async ({ page }) => {
    await page.addLocatorHandler(
      page.getByRole("button", { name: "Kun nødvendige", exact: true }),
      async (btn) => {
        await btn.click().catch(() => undefined);
      },
    );
  });

  test("kølagt telling er navnerommet til eieren og lekker ikke til neste innlogging på samme enhet", async ({ page }) => {
    test.setTimeout(120_000);

    await loggInnUtenAOppdrag(page, spillerEpost, spillerPassord);
    await startOktOgApneTapper(page, wbId);
    await expect(page.getByText("slag denne økta", { exact: true })).toBeVisible();

    // Simuler at nettet forsvinner under en økt — lagringen skal da falle
    // tilbake til den lokale, eier-navnerommede IndexedDB-køen i stedet for
    // å miste slagene.
    await page.context().setOffline(true);
    await page.locator('[data-od-id="tapper-klubb-driver"]').click();
    await expect(page.getByRole("alert").filter({ hasText: "Slagene ble ikke lagret" })).toBeVisible({
      timeout: 20_000,
    });
    await page.context().setOffline(false);

    const koEtterSpiller = await lesTapperKo(page);
    const spillerNokkel = `${encodeURIComponent(spillerId)}:${wbId}`;
    const spillerRad = koEtterSpiller.find((r) => r.key === spillerNokkel);
    expect(spillerRad, `forventet en kølagt rad for ${spillerNokkel}`).toBeTruthy();
    expect(spillerRad?.eierId).toBe(spillerId);
    expect(spillerRad?.counts.find((c) => c.club === "driver")?.count).toBe(1);
    // Ingen andre rader enn spillerens egen skal finnes ennå.
    expect(koEtterSpiller.every((r) => r.eierId === spillerId)).toBe(true);

    // Bytt bruker på SAMME nettleser-context UTEN å rydde lokal lagring —
    // dette er nøyaktig scenarioet R-C skal beskytte mot (delt enhet, ingen
    // eksplisitt utlogging).
    await loggInnUtenAOppdrag(page, fremmedEpost, fremmedPassord);
    await startOktOgApneTapper(page, fremmedWbId);
    await expect(page.getByText("slag denne økta", { exact: true })).toBeVisible();
    // Fremmed sin teller skal starte på 0 — ALDRI arve spillerens kølagte tall.
    await expect(tellerLocator(page)).toHaveText("0");
    await expect(page.getByRole("alert").filter({ hasText: "Slagene ble ikke lagret" })).toHaveCount(0);

    // Spillerens rad ligger fortsatt urørt i IndexedDB — fremmed sin
    // innlasting har verken lest, slettet eller overskrevet den.
    const koEtterFremmed = await lesTapperKo(page);
    const bevartSpillerRad = koEtterFremmed.find((r) => r.key === spillerNokkel);
    expect(bevartSpillerRad?.eierId).toBe(spillerId);
    expect(bevartSpillerRad?.counts.find((c) => c.club === "driver")?.count).toBe(1);
    // Enhver ny rad fra fremmeds besøk må være navnerommet til fremmed selv.
    for (const rad of koEtterFremmed) {
      if (rad.key === spillerNokkel) continue;
      expect(rad.key.startsWith(`${encodeURIComponent(rad.eierId)}:`)).toBe(true);
      expect(rad.eierId).not.toBe(spillerId);
    }
  });
});
