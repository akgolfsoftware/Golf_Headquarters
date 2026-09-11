/** Syntetiske nettleserprøver: ekte React, appskall og skrifter; simulerte serverhandlinger. */
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "@playwright/test";
import { startSummaryHarness } from "./server.mjs";

async function main() {
const out = resolve("_archive/visuell-kontroll-ph06-2026-09-11");
mkdirSync(out, { recursive: true });
const server = await startSummaryHarness();
const browser = await chromium.launch({ headless: true });
const errors: string[] = [];
let screenshots = 0;
const passed: string[] = [];
const cases = ["tom", "delvis", "fullfort", "lagret", "vurdert", "langt", "eldre", "tapper"];
try {
  const page = await browser.newPage();
  page.on("pageerror", (error) => errors.push(error.message));
  async function open(state = "fullfort", theme = "lys") {
    await page.goto(`${server.origin}/?state=${state}&theme=${theme}`);
    await page.locator(".ph06-number, .ph06-empty-title").waitFor();
    await page.evaluate(() => document.fonts.ready);
    assert(await page.evaluate(() => [...document.fonts].some((font) => font.family === "Geist" && font.status === "loaded")), "Appens Geist må faktisk være lastet");
  }
  for (const width of [320, 390, 834, 1440]) {
    await page.setViewportSize({ width, height: width < 768 ? 844 : 1100 });
    for (const theme of ["lys", "mork"]) for (const state of cases) {
      await open(state, theme);
      assert(await page.locator(".ph06").evaluate((el) => el.scrollWidth <= el.clientWidth + 1), `${state}/${width}/${theme}: horisontal overflyt`);
      if (state === "delvis") assert.match(await page.locator(".ph06-hero").innerText(), /1\s*\/\s*3/);
      if (state === "lagret" || state === "vurdert") {
        assert.match(await page.locator(".ph06-rating").innerText(), /Kvalitet: 4\/5/);
        assert.match(await page.locator(".ph06-rating").innerText(), /Jobbe mer med korte innspill/);
      }
      if (state === "lagret") assert.match(await page.locator('[data-od-id="etter-lagrede-ord"]').innerText(), /Fin økt med jevnt treffvindu/);
      if (state === "tapper") {
        assert.equal(await page.locator("textarea").count(), 0);
        assert.equal(await page.getByRole("button", { name: "Rediger oppsummering" }).count(), 0);
        assert.match(await page.locator(".ph06-hero").innerText(), /37/);
        assert.doesNotMatch(await page.locator(".ph06").innerText(), /Øvelser ferdig|Varighet/);
      }
      await page.screenshot({ path: resolve(out, `${state}--${theme}--${width}px.png`) }); screenshots++;
    }
  }
  passed.push("64 varianter: fire bredder, to temaer, åtte datatilstander; faktisk font og ombrekking");
  await page.setViewportSize({ width: 390, height: 844 });
  for (const state of ["fullfort", "lagret", "langt"]) {
    await open(state);
    await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
    assert(await page.locator(".ph06").evaluate((el) => el.scrollWidth <= el.clientWidth + 1));
    await page.getByRole("link", { name: "Lukk", exact: true }).last().scrollIntoViewIfNeeded();
    await page.screenshot({ path: resolve(out, `${state}--lys--390px-tekst-200pct.png`) }); screenshots++;
  }
  passed.push("200 prosent tekst: fullført, lagret og langt innhold; Lukk kan nås");

  await page.addInitScript(() => sessionStorage.setItem("akhq-live-notater-test-sesjon-1", JSON.stringify([{ t: "03:00", tekst: "Syntetisk notat én." }, { t: "08:00", tekst: "Syntetisk notat to." }])));
  await open();
  const note = page.getByRole("textbox", { name: "Oppsummering med dine ord" });
  await page.waitForFunction(() => document.querySelector<HTMLTextAreaElement>('#ph06-ord')?.value.includes("Syntetisk notat to."));
  assert.match(await note.inputValue(), /Syntetisk notat én/);
  await note.fill("Min korrigerte oppsummering.");
  await page.evaluate(() => { window.summaryHarness.mode = "throw"; });
  await page.getByRole("button", { name: "Lagre i loggen", exact: true }).click();
  await page.getByRole("alert").waitFor();
  assert.equal(await note.inputValue(), "Min korrigerte oppsummering.");
  assert(await page.getByRole("alert").evaluate((el) => el === document.activeElement));
  await page.screenshot({ path: resolve(out, "lagringsfeil--lys--390px.png") }); screenshots++;
  await page.evaluate(() => { window.summaryHarness.mode = "pending"; });
  await page.getByRole("button", { name: "Prøv igjen", exact: true }).click();
  assert(await note.isDisabled());
  const pending = page.getByRole("button", { name: "Lagrer…", exact: true });
  assert(await pending.isDisabled());
  await pending.evaluate((el) => { (el as HTMLButtonElement).click(); (el as HTMLButtonElement).click(); });
  assert.equal(await page.evaluate(() => window.summaryHarness.calls.length), 2);
  await page.screenshot({ path: resolve(out, "lagrer--lys--390px.png") }); screenshots++;
  await page.evaluate(() => window.summaryHarness.release());
  await page.getByText("Lagret i loggen", { exact: true }).waitFor();
  assert.equal(await page.locator('[data-od-id="etter-lagrede-ord"]').innerText(), "Min korrigerte oppsummering.");
  assert.equal(await page.evaluate(() => sessionStorage.getItem("akhq-live-notater-test-sesjon-1")), null);
  passed.push("Notat: begge øktnotater, nettfeil, fokus, bevaring, venting, dobbeltrykk, nytt forsøk og kvittering");

  await page.getByText("Hvordan var økta?", { exact: true }).click();
  await page.getByRole("button", { name: "Kvalitet 4", exact: true }).click();
  await page.getByRole("button", { name: "Anstrengelse 6 av 10", exact: true }).click();
  await page.getByRole("textbox", { name: "Følelse (valgfritt)", exact: true }).fill("Fokusert");
  await page.getByRole("textbox", { name: "Neste fokus", exact: true }).fill("Bevare samme rytme.");
  await page.evaluate(() => { window.summaryHarness.mode = "error"; });
  await page.getByRole("button", { name: "Lagre vurdering", exact: true }).click();
  await page.getByRole("alert").waitFor();
  assert.equal(await page.getByRole("textbox", { name: "Neste fokus", exact: true }).inputValue(), "Bevare samme rytme.");
  assert.equal(await page.getByRole("button", { name: "Kvalitet 4", exact: true }).getAttribute("aria-pressed"), "true");
  assert(await page.getByRole("alert").evaluate((el) => el === document.activeElement));
  await page.evaluate(() => { window.summaryHarness.mode = "throw"; });
  await page.getByRole("button", { name: "Prøv igjen", exact: true }).click();
  await page.getByText("Kunne ikke bekrefte lagringen. Feltene er bevart — prøv igjen.").waitFor();
  await page.evaluate(() => { window.summaryHarness.mode = "pending"; });
  await page.getByRole("button", { name: "Prøv igjen", exact: true }).click();
  assert(await page.getByRole("textbox", { name: "Neste fokus", exact: true }).isDisabled());
  await page.evaluate(() => window.summaryHarness.release());
  await page.getByText("Neste fokus: Bevare samme rytme.", { exact: true }).waitFor();
  await page.getByRole("button", { name: "Rediger oppsummering", exact: true }).click();
  assert.match(await page.locator(".ph06-rating").innerText(), /Kvalitet: 4\/5/);
  await page.getByRole("textbox", { name: "Oppsummering med dine ord" }).fill("Ny oppsummering, samme vurdering.");
  await page.evaluate(() => { window.summaryHarness.mode = "ok"; });
  await page.getByRole("button", { name: "Lagre i loggen", exact: true }).click();
  await page.getByText("Lagret i loggen", { exact: true }).waitFor();
  await page.reload();
  await page.getByText("Ny oppsummering, samme vurdering.", { exact: true }).waitFor();
  assert.match(await page.locator(".ph06-rating").innerText(), /Bevare samme rytme/);
  passed.push("Vurdering: returfeil/nettfeil, felt/fokus, venting, nytt forsøk, bevart ved redigering og simulert gjenåpning");

  const close = page.getByRole("link", { name: "Lukk", exact: true }).last();
  await close.focus();
  await page.keyboard.press("Enter");
  await page.waitForURL("**/portal");
  assert.equal(new URL(page.url()).pathname, "/portal");
  passed.push("Tastatur: Lukk åpner /portal i simulert ruting uten start-handling");
  assert.deepEqual(errors, [], "Ingen ubehandlede klientfeil");
  await page.goto(`${server.origin}/reference`);
  await page.screenshot({ path: resolve(out, "valgt-ph06-original.png"), fullPage: true }); screenshots++;
  const result = { screenshots, passed, errors, limitations: "Syntetisk React-komponentprøve med reelt LiveSessionShell og Geist fra Next-bygg. Serverhandlinger, vedvarende lagring og rutemål er simulert; ingen innlogget database-/produksjonsreise eller Anders-godkjenning." };
  writeFileSync(resolve(out, "resultat.json"), JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
} finally {
  await browser.close();
  await server.close();
}

}
main().catch((error) => { console.error(error); process.exitCode = 1; });
