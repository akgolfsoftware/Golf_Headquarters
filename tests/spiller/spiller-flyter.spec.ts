/**
 * Funksjonstest av hovedflytene som spiller (voksen og junior 13 år), mot lokal dev-server.
 * Skriver bare til demokontoene (screentest*@akgolf.test). Sikkerhetsgrenser:
 *  - Booking føres fram til «Bekreft booking» men bekreftes aldri (e-post/varsler til ekte personer).
 *  - Utfordring opprettes uten deltakere (ingen varsler til andre).
 */
import { test, expect, type Page } from "@playwright/test";
import { loginWith } from "../e2e/_auth-helpers";
import { PERSONAS, passord } from "./_personas";

const STAMPEL = new Date().toISOString().slice(0, 16).replace("T", " ");

async function apne(page: Page, rute: string) {
  await page.goto(rute, { waitUntil: "load" });
  await page.waitForLoadState("networkidle", { timeout: 8_000 }).catch(() => undefined);
}

for (const persona of PERSONAS) {
  test.describe(persona.navn, () => {
    test.beforeEach(async ({ page }) => {
      test.setTimeout(150_000);
      test.skip(!passord(), "SCREENTEST_PASSWORD mangler");
      await loginWith(page, persona.email, passord());
    });

    test("I dag: dagsform og økt kan åpnes", async ({ page }) => {
      await apne(page, "/portal");
      await expect(page.getByRole("heading", { level: 1 }).first()).toContainText(/I dag/);
      const dagsform = page.getByRole("button", { name: /^4God/ });
      if (await dagsform.count()) await dagsform.first().click();
      const alle = page.getByRole("button", { name: "Se hele økta" });
      if (await alle.count()) {
        await alle.first().click();
        await expect(page.locator("[role=dialog], main").first()).toBeVisible();
      }
    });

    test("Workbench: legg inn ny økt og se den i uka", async ({ page }) => {
      await apne(page, "/portal/planlegge/workbench");
      const tittel = `Playwright-test ${persona.id} ${STAMPEL}`;
      await page.getByRole("button", { name: "Ny økt" }).first().click();
      const dlg = page.getByRole("dialog");
      await expect(dlg).toBeVisible();
      await dlg.getByPlaceholder("F.eks. Wedge 60–100 m").fill(tittel);
      await dlg.getByRole("button", { name: "Legg inn" }).click();
      await expect(dlg).toBeHidden({ timeout: 15_000 });
      await expect(page.getByText(tittel).first()).toBeVisible({ timeout: 15_000 });
    });

    test("Målsetning: lag prosessmål og se det i lista", async ({ page }) => {
      await apne(page, "/portal/mal/ny");
      const tittel = `Playwright-mål ${persona.id} ${STAMPEL}`;
      await page.getByRole("button", { name: /^Prosessmål/ }).click();
      await page.getByPlaceholder(/For eksempel/).first().fill(tittel);
      await page.getByRole("button", { name: "Lagre målsetningen" }).click();
      await page.waitForURL(/\/portal\/mal(\?|$|\/)/, { timeout: 20_000 });
      await expect(page.getByText(tittel).first()).toBeVisible({ timeout: 15_000 });
    });

    test("Utfordring: opprett uten deltakere", async ({ page }) => {
      await apne(page, "/portal/utfordringer/ny");
      const navn = `Playwright-utfordring ${persona.id} ${STAMPEL}`;
      await page.getByPlaceholder("For eksempel 8-ball, flest poeng").fill(navn);
      await page.getByRole("button", { name: /^Høyest score/ }).click();
      await page.getByRole("button", { name: "Opprett utfordring" }).click();
      await page.waitForURL(/\/portal\/utfordringer\/[^/]+$/, { timeout: 20_000 });
      await expect(page.getByText(navn).first()).toBeVisible();
    });

    test("Tester: batteriet vises med tre deler og en test kan åpnes", async ({ page }) => {
      await apne(page, "/portal/tren/tester");
      for (const del of ["Golfslag", "Teknikk", "Fysisk"]) {
        await expect(page.getByRole("heading", { name: del }).first()).toBeVisible();
      }
      await page.getByRole("button", { name: /^Driver Basic/ }).click();
      await expect(page.getByText("Start testen").first()).toBeVisible();
    });

    test("Runde: etterregistrering har dato, bane og hullskjema", async ({ page }) => {
      await apne(page, "/portal/runde/logg");
      await expect(page.locator('input[type="date"]').first()).toBeVisible();
      await expect(page.locator("select").first()).toBeVisible();
      await expect(page.getByRole("button", { name: "Hull for hull" })).toBeVisible();
    });

    test("Booking: tjeneste, dag og tid kan velges (bekreftes ikke)", async ({ page }) => {
      await apne(page, "/portal/booking/ny");
      await page.getByText(/^Flex 20 min — Markus/).first().click();
      const tider = page.getByRole("button", { name: /^\d{2}:\d{2}$/ });
      await expect(tider.first()).toBeVisible({ timeout: 15_000 });
      await tider.first().click();
      // Voksen med klipp får «Bekreft booking»; junior betaler med kort og får «Gå til betaling».
      await expect(page.getByRole("button", { name: /Bekreft booking|Gå til betaling/ })).toBeVisible();
    });

    test("Rollegrenser: spiller kommer ikke inn i AgencyOS eller Team Norway", async ({ page }) => {
      for (const rute of ["/admin", "/admin/agencyos", "/team-norway", "/team-wang/coach"]) {
        await page.goto(rute, { waitUntil: "load" });
        await page.waitForLoadState("networkidle", { timeout: 8_000 }).catch(() => undefined);
        await page.waitForTimeout(1_500);
        const sti = new URL(page.url()).pathname;
        expect(sti.startsWith("/admin") || sti.startsWith("/team-norway/") || sti.startsWith("/team-wang/coach"), `${rute} slapp spilleren inn (${sti})`).toBe(false);
      }
    });

    test("Fireukerssjekk er skjult for spillere utenfor WANG og Team Norway", async ({ page }) => {
      await page.goto("/portal/iup/fireukerssjekk", { waitUntil: "load" });
      await page.waitForURL((u) => !u.pathname.includes("/iup/fireukerssjekk"), { timeout: 15_000 });
    });
  });
}

test.describe("Junior (13 år)", () => {
  test("Foresatt er koblet og vises under Meg", async ({ page }) => {
    test.setTimeout(150_000);
    test.skip(!passord(), "SCREENTEST_PASSWORD mangler");
    await loginWith(page, "screentest-junior@akgolf.test", passord());
    await apne(page, "/portal/meg/foreldre");
    await expect(page.locator("body")).toContainText(/Kari Rohjan|Foresatt/i);
  });
});
