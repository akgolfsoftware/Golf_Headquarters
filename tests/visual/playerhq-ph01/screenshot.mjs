/** Eksporterer 20 referanser og 20 appbilder, og lager målbare diffbilder. */
import assert from "node:assert/strict";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "@playwright/test";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import { startPh01Harness } from "./server.mjs";

const states = ["normal", "ongoing", "completed", "approval", "rest", "empty-day", "empty-week", "loading", "error", "locked"];
const devices = [{ name: "mobile", width: 390, height: 844, selector: ".frame.ph" }, { name: "desktop", width: 1440, height: 880, selector: ".frame.dt" }];
const out = "/private/tmp/ak-hq-ph01-visual-20260921";
// Gjeldende v1.0 i «App design», hentet 21.09.2026 kveld (etag 1789994883152613) og renset
// for forhaandsvisningens injiserte blokk. Se les-meg.md i samme mappe.
const reference = "/Users/anderskristiansen/Documents/Codex/2026-09-21/ak-golf-hq-designverksted/outputs/playerhq-ph-01-v1.0-sky-20260921/ph-01-i-dag-v1.0.html";
mkdirSync(out, { recursive: true, mode: 0o700 });
const harness = await startPh01Harness();
const browser = await chromium.launch({ headless: true });
const result = { source: reference, viewports: [], consoleErrors: [], checks: [] };
try {
  const app = await browser.newPage();
  app.on("pageerror", (error) => result.consoleErrors.push(error.message));
  app.on("console", (message) => { if (message.type() === "error") result.consoleErrors.push(message.text()); });
  const ref = await browser.newPage();
  await ref.goto(`file://${reference}`);
  await ref.evaluate(() => document.fonts.ready);

  for (const device of devices) {
    await app.setViewportSize({ width: device.width, height: device.height });
    const frames = ref.locator(device.selector);
    assert.equal(await frames.count(), states.length, `${device.name}: forventet ti referanser`);
    for (const [index, state] of states.entries()) {
      await app.goto(`${harness.origin}/?state=${state}`);
      await app.locator('[data-design-version="ph-01-v1.0"]').waitFor();
      await app.evaluate(() => document.fonts.ready);
      assert(await app.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${state}/${device.name}: horisontal overflyt`);
      const appPath = resolve(out, `app-${device.name}-${state}.png`);
      const refPath = resolve(out, `fasit-${device.name}-${state}.png`);
      const diffPath = resolve(out, `diff-${device.name}-${state}.png`);
      await app.screenshot({ path: appPath, fullPage: false });
      await frames.nth(index).screenshot({ path: refPath });
      const actual = PNG.sync.read(readFileSync(appPath));
      const expected = PNG.sync.read(readFileSync(refPath));
      assert.equal(actual.width, expected.width); assert.equal(actual.height, expected.height);
      const diff = new PNG({ width: actual.width, height: actual.height });
      const mismatched = pixelmatch(expected.data, actual.data, diff.data, actual.width, actual.height, { threshold: 0.1 });
      PNG.sync.write(diff);
      writeFileSync(diffPath, PNG.sync.write(diff));
      result.viewports.push({ device: device.name, state, width: device.width, height: device.height, mismatchPercent: Number((mismatched * 100 / (actual.width * actual.height)).toFixed(2)), appPath, refPath, diffPath });
    }
  }

  await app.setViewportSize({ width: 390, height: 844 });
  await app.goto(`${harness.origin}/?state=normal`);
  assert.equal(await app.getByRole("link", { name: "START ØKT" }).getAttribute("href"), "/portal/live/wedge-1");
  await app.getByRole("button", { name: "Hele dagen" }).click();
  assert(await app.getByRole("dialog").isVisible());
  await app.getByRole("button", { name: "Lukk hele dagen" }).click();
  assert(!(await app.getByRole("dialog").isVisible()));
  result.checks.push("START ØKT peker til Live; Hele dagen åpner og lukker med faktisk dialog.");

  await app.goto(`${harness.origin}/?state=ongoing`);
  assert.equal(await app.getByRole("link", { name: "Fortsett økt" }).getAttribute("href"), "/portal/live/wedge-1");
  assert.equal(await app.getByRole("link", { name: "Avslutt økt" }).getAttribute("href"), "/portal/live/wedge-1");
  result.checks.push("Pågående økt har Fortsett og Avslutt til riktig Live-rute.");

  await app.goto(`${harness.origin}/?state=approval`);
  await app.getByRole("button", { name: "Godkjenn" }).click();
  await app.getByRole("button", { name: "Godkjenn" }).waitFor({ state: "detached" });
  result.checks.push("Godkjenning bruker handlingen og fjerner besvart forslag i klienten.");

  await app.goto(`${harness.origin}/?state=locked`);
  const lockedText = await app.locator("body").innerText();
  assert(!lockedText.includes("Innspill 50 m"));
  assert(!lockedText.includes("Privat økt"));
  assert(await app.getByRole("link", { name: "Tester" }).isVisible());
  result.checks.push("Gratis/TALENT viser åpne flater uten syntetisk planinnhold.");

  assert.deepEqual(result.consoleErrors, [], "Ingen konsollfeil");
  writeFileSync(resolve(out, "resultat.json"), JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
} finally {
  await browser.close();
  await harness.close();
}
