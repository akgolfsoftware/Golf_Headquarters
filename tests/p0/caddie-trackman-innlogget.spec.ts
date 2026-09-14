/**
 * Innlogget R-E-reise for Caddie (R-A, Mission Control-tilgang) og TrackMan
 * CSV-import (R-D, enheter gjennom en ekte skjermflyt). Mot isolert
 * HQ-Supabase. Hopper ikke over manglende oppsett — da skal prøven feile
 * stengt.
 *
 * Caddie-chat har per 13.09.2026 ingen ferdig monterte side under /admin —
 * komponenten (`KonsollChat`) er bygget, men ikke koblet til en rute ennå
 * (jf. beslutninger.md «AI-laget samles på ÉN adresse»). Prøven treffer
 * derfor `/api/caddie/chat` direkte med ekte innloggingscookies i stedet for
 * å klikke gjennom et grensesnitt som ikke finnes — det er den ærlige
 * innloggede reisen som faktisk kan bevises i dag.
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
const coachEpost = krev("P0_COACH_EMAIL");
const coachPassord = krev("P0_COACH_PASSWORD");
const adminEpost = krev("P0_ADMIN_EMAIL");
const adminPassord = krev("P0_ADMIN_PASSWORD");

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

async function loggInn(page: Page, epost: string, passord: string) {
  await page.goto("/auth/login");
  await lukkCookie(page);
  await page.locator('input[type="email"]').fill(epost);
  await page.locator('input[type="password"]').fill(passord);
  await page.locator('form button[type="submit"]').click();
  try {
    await page.waitForURL(
      (url) => {
        const path = new URL(url).pathname;
        return path.startsWith("/portal") || path.startsWith("/admin");
      },
      { timeout: 90_000 },
    );
  } catch (error) {
    const tekst = (await page.locator("#v2login-feil").innerText().catch(() => "")).trim();
    throw new Error(tekst || (error instanceof Error ? error.message : "Innlogging førte ikke videre"));
  }
  await lukkCookie(page);
}

function caddieBody() {
  return {
    messages: [
      { id: "p0-1", role: "user", parts: [{ type: "text", text: "P0-testmelding, ingen ekte spillerdata." }] },
    ],
  };
}

test.describe("P0 innlogget Caddie-tilgang (R-A)", () => {
  test.beforeEach(async ({ page }) => {
    await page.addLocatorHandler(
      page.getByRole("button", { name: "Kun nødvendige", exact: true }),
      async (btn) => {
        await btn.click().catch(() => undefined);
      },
    );
  });

  test("ADMIN slipper forbi tilgangssjekken; COACH avvises 401 på samme rute", async ({ page }) => {
    await loggInn(page, adminEpost, adminPassord);
    const adminSvar = await page.request.post("/api/caddie/chat", { data: caddieBody() });
    // AI-nøkkel finnes ikke i det isolerte testmiljøet, så selve modell-
    // kallet kan feile — men ADMIN skal ALDRI stoppes av tilgangssjekken.
    expect(adminSvar.status()).not.toBe(401);

    await page.context().clearCookies();
    await loggInn(page, coachEpost, coachPassord);
    const coachSvar = await page.request.post("/api/caddie/chat", { data: caddieBody() });
    expect(coachSvar.status()).toBe(401);
    expect(await coachSvar.text()).toBe("Ikke autorisert");
  });

  test("uinnlogget forespørsel avvises 401", async ({ page }) => {
    const svar = await page.request.post("/api/caddie/chat", { data: caddieBody() });
    expect(svar.status()).toBe(401);
  });
});

test.describe("P0 innlogget TrackMan CSV-import (R-D)", () => {
  test.beforeEach(async ({ page }) => {
    await page.addLocatorHandler(
      page.getByRole("button", { name: "Kun nødvendige", exact: true }),
      async (btn) => {
        await btn.click().catch(() => undefined);
      },
    );
  });

  test("CSV med eksplisitte enheter importeres og vises i listen", async ({ page }) => {
    await loggInn(page, spillerEpost, spillerPassord);
    await page.goto("/portal/analysere/trackman");
    await expect(page.getByRole("heading", { name: "TrackMan", exact: true })).toBeVisible();
    await expect(page.getByText("Ingen økter ennå", { exact: true })).toBeVisible();

    await page.getByRole("button", { name: "Last opp CSV / HTML" }).click();
    await page.getByRole("button", { name: "CSV-fil" }).click();
    await page.getByRole("button", { name: "Neste" }).click();

    const csv = [
      "Date,Club,Club Speed (mph),Ball Speed (mph),Carry (m),Total (m),Side (m)",
      "2026-09-13,Driver,100,150,250,260,5",
    ].join("\n");
    await page.locator('input[type="file"]').setInputFiles({
      name: "p0-trackman.csv",
      mimeType: "text/csv",
      buffer: Buffer.from(csv, "utf8"),
    });
    await expect(page.getByText("1 slag parset", { exact: false })).toBeVisible();

    await page.getByRole("button", { name: "Neste" }).click();
    await page.getByRole("button", { name: "Neste" }).click();
    await page.getByRole("button", { name: "Bekreft og importer" }).click();

    await expect(page.getByText(/slag ·.*matchet til teknisk plan/)).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText("1 økt", { exact: true })).toBeVisible();
  });

  test("HTML Multi Group Report med eksplisitte enheter importeres og vises i listen", async ({ page }) => {
    await loggInn(page, spillerEpost, spillerPassord);
    await page.goto("/portal/analysere/trackman");
    // CSV-testen over har allerede lagt inn 1 økt i samme kjøring — denne
    // testen bruker en ANNEN dato (12. i stedet for 13.) slik at importen
    // blir en ny, egen økt i stedet for en «ligner eksisterende»-kollisjon.
    await expect(page.getByText("1 økt", { exact: true })).toBeVisible();

    await page.getByRole("button", { name: "Last opp CSV / HTML" }).click();
    await page.getByRole("button", { name: "Multi Group HTML-rapport" }).click();
    await page.getByRole("button", { name: "Neste" }).click();

    const html = `
      <html><body>
        <div>Club Speed (mph)</div>
        <div>Ball Speed (mph)</div>
        <div>Total Distance (m)</div>
        <div>9/12/2026 P0 HTML Session 2026-09-12</div>
        <section>2026-09-12 7i SevenIron Hide
          1. 75 0 0 0 0 110 0 1.3 140 0
          Average 75 0 0 0 0 110 0 1.3 140 0
          Consistency 0 0 0 0 0 0 0 0 0 0
        </section>
      </body></html>
    `;
    await page.locator('input[type="file"]').setInputFiles({
      name: "p0-trackman.html",
      mimeType: "text/html",
      buffer: Buffer.from(html, "utf8"),
    });
    await expect(page.getByText("1 slag parset", { exact: false })).toBeVisible();

    await page.getByRole("button", { name: "Neste" }).click();
    await page.getByRole("button", { name: "Neste" }).click();
    await page.getByRole("button", { name: "Bekreft og importer" }).click();

    await expect(page.getByText(/slag ·.*matchet til teknisk plan/)).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText("2 økter", { exact: true })).toBeVisible();
  });
});
