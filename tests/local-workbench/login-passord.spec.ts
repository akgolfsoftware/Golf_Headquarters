import { expect, test, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { parse } from "dotenv";

const users = parse(readFileSync(".codex/environments/workbench/.env.users"));
async function passordSkjema(page: Page) {
  await page.context().route("**/*", async route => {
    const url = new URL(route.request().url());
    if (url.hostname === "127.0.0.1" && ["3072", "55721"].includes(url.port)) await route.continue();
    else await route.abort();
  });
  await page.goto("/auth/login");
  await page.getByRole("button", { name: "Logg inn med passord", exact: true }).click();
  await page.locator("input[type=email]").fill(users.LOCAL_P01_EMAIL);
}
for (let run = 1; run <= 6; run++) {
  test(`passord ${run}: fersk normal spillerinnlogging åpner beskyttet Workbench og tåler reload`, async ({ page }) => {
    await passordSkjema(page);
    const dokumentNavigasjoner: string[] = [];
    page.on("request", request => {
      if (request.isNavigationRequest() && request.frame() === page.mainFrame()) dokumentNavigasjoner.push(new URL(request.url()).pathname);
    });
    await page.locator("input[type=password]").fill(users.LOCAL_P01_PASSWORD);
    const auth = page.waitForResponse(response => response.url().startsWith("http://127.0.0.1:55721/auth/v1/token") && response.request().method() === "POST");
    await page.locator("form button[type=submit]").click();
    expect((await auth).status()).toBe(200);
    await page.waitForURL(url => url.pathname === "/portal", { waitUntil: "domcontentloaded" });
    expect(dokumentNavigasjoner.filter(path => path === "/auth/etter-innlogging")).toHaveLength(1);
    expect(dokumentNavigasjoner).not.toContain("/auth/login");
    await page.goto("/portal/planlegge/workbench?flate=uke&uke=2027-01-04&aar=2027&maned=2027-01");
    await expect(page.locator(".wb-samlet h1")).toHaveText("Workbench");
    await page.reload();
    await expect(page.locator(".wb-samlet h1")).toHaveText("Workbench");
    expect(new URL(page.url()).pathname).toBe("/portal/planlegge/workbench");
  });
}
test("ugyldig passord avvises på login uten dokumentnavigasjon", async ({ page }) => {
  await passordSkjema(page);
  let dokumentNavigasjoner = 0;
  page.on("request", request => { if (request.isNavigationRequest() && request.frame() === page.mainFrame()) dokumentNavigasjoner++; });
  await page.locator("input[type=password]").fill("ugyldig-syntetisk-passord");
  const auth = page.waitForResponse(response => response.url().startsWith("http://127.0.0.1:55721/auth/v1/token") && response.request().method() === "POST");
  await page.locator("form button[type=submit]").click();
  expect((await auth).status()).toBe(400);
  await expect(page.getByText("Feil e-post eller passord.", { exact: true })).toBeVisible();
  expect(new URL(page.url()).pathname).toBe("/auth/login");
  expect(dokumentNavigasjoner).toBe(0);
  expect((await page.context().cookies()).some(cookie => cookie.name.includes("auth-token"))).toBe(false);
});
