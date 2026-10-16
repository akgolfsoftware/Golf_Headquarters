import { expect, test, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { parse } from "dotenv";

const users = parse(readFileSync(".codex/environments/workbench/.env.users"));
async function loggInn(page: Page, rolle: "COACH_A" | "P01") {
  await page.context().route("**/*", async route => {
    const url = new URL(route.request().url());
    if (url.hostname === "127.0.0.1" && ["3072", "55721"].includes(url.port)) await route.continue();
    else await route.abort();
  });
  await page.goto("/auth/login");
  await page.getByRole("button", { name: "Logg inn med passord", exact: true }).click();
  await page.locator("input[type=email]").fill(users[`LOCAL_${rolle}_EMAIL`]);
  await page.locator("input[type=password]").fill(users[`LOCAL_${rolle}_PASSWORD`]);
  const innlogging = page.waitForResponse(response => response.url().startsWith("http://127.0.0.1:55721/auth/v1/token") && response.request().method() === "POST");
  await page.locator("form button[type=submit]").click();
  expect((await innlogging).status()).toBe(200);
  await expect.poll(async () => (await page.context().cookies()).some(cookie => cookie.name.includes("-auth-token"))).toBe(true);
  const landing = rolle === "COACH_A" ? "/admin/agencyos" : "/portal";
  await page.waitForURL(url => url.pathname === landing, { timeout: 30_000, waitUntil: "domcontentloaded" });
}

for (const rolle of ["COACH_A", "P01"] as const) {
  test(`${rolle}: fire reelle visninger bevarer kalenderkontekst og åpner ukeplan`, async ({ page }, info) => {
    const feil: string[] = [];
    page.on("pageerror", error => feil.push(error.message));
    await loggInn(page, rolle);
    const path = rolle === "COACH_A" ? `/admin/workbench/${users.LOCAL_P01_ID}` : "/portal/planlegge/workbench";
    await page.goto(`${path}?flate=uke&uke=2027-01-04&aar=2027&maned=2027-01`);
    const cookie = page.getByRole("button", { name: "Kun nødvendige", exact: true });
    await expect(cookie).toBeVisible(); await cookie.click();
    await expect(page.locator(".wb-samlet h1")).toHaveText("Workbench");
    const nav = page.getByRole("navigation", { name: "Workbench-flater" });
    for (const [navn, flate] of [["Sesongkart", "sesong"], ["Ukeverksted", "uke"], ["Trenerbord", "bord"], ["Stats", "analyse"]]) {
      const link = nav.getByRole("link", { name: navn, exact: true });
      const treffbar = await link.evaluate(el => { const r = el.getBoundingClientRect(); return el.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)); });
      expect(treffbar).toBe(true);
      await link.click({ timeout: 10_000 });
      await expect(nav.getByRole("link", { name: navn, exact: true })).toHaveAttribute("aria-current", "page");
      const url = new URL(page.url());
      expect(url.searchParams.get("flate")).toBe(flate);
      expect(url.searchParams.get("uke")).toBe("2027-01-04");
      expect(url.searchParams.get("aar")).toBe("2027");
      expect(url.searchParams.get("maned")).toBe("2027-01");
      await expect(page.locator(".wb-samlet")).not.toContainText("Application error");
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({ path: `/tmp/ak-workbench-samlet-${rolle}-${flate}-${info.project.name}.png` });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
      expect(overflow).toBe(false);
      if (flate === "uke" && info.project.name === "mobil") {
        await expect(page.locator(".ws-agenda")).toBeVisible();
        await expect(page.locator(".ws-week > .ws-library")).not.toBeVisible();
      }
      if (rolle === "P01" && flate === "bord") {
        await expect(page.locator(".ws-toolbar")).toContainText("1 spiller");
        await expect(page.getByRole("button", { name: "Gruppeøkter", exact: true })).toHaveCount(0);
      }
    }
    await nav.getByRole("link", { name: "Ukeverksted", exact: true }).click();
    await page.getByRole("button", { name: "Ukeplan", exact: true }).click();
    const dialog = page.locator(".pa-sheet[role=dialog]");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("textbox", { name: "Oppholdssted", exact: true })).toBeVisible();
    const save = dialog.getByRole("button", { name: "Lagre ukeplan", exact: true });
    await save.scrollIntoViewIfNeeded();
    const hit = await save.evaluate(el => { const r = el.getBoundingClientRect(); return el.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)); });
    expect(hit).toBe(true);
    await page.screenshot({ path: `/tmp/ak-workbench-samlet-${rolle}-ukeplan-${info.project.name}.png` });
    const location = `Syntetisk samlet ${rolle} ${info.project.name}`;
    await dialog.getByRole("textbox", { name: "Oppholdssted", exact: true }).fill(location);
    await dialog.getByRole("spinbutton", { name: "SLAG timer", exact: true }).fill("0");
    await dialog.getByRole("spinbutton", { name: "SLAG økter", exact: true }).fill("2");
    await save.click(); await expect(dialog).not.toBeVisible();
    await page.reload();
    await page.getByRole("button", { name: "Ukeplan", exact: true }).click();
    await expect(dialog.getByRole("textbox", { name: "Oppholdssted", exact: true })).toHaveValue(location);
    await expect(dialog.getByRole("spinbutton", { name: "SLAG timer", exact: true })).toHaveValue("0");
    await expect(dialog.getByRole("spinbutton", { name: "SLAG økter", exact: true })).toHaveValue("2");
    expect(feil).toEqual([]);
  });
}
