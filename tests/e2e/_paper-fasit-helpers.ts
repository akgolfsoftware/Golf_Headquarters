/**
 * Helpers for å sammenligne en bygget skjerm mot dens Paper-fasit-HTML.
 *
 * Fasit-filene (`designsystem/paper/fase1/*.html`, `fase2/playerhq/*.html`) er
 * demo-stillas: `<html data-theme="light|dark">` styrer tema, `[data-tilstand]`-
 * knapper bytter Suksess/Tom/Laster/Feil, og `[data-demo-only]`/`.state-switch`
 * markerer element som IKKE skal sammenlignes (de porteres aldri til appen —
 * se `docs/port/monsterdokument-paper.md` §7 «Forbud»). Innholdet appen skal
 * matche ligger i `#kropp` der den finnes, ellers `main`, ellers `.phone`.
 *
 * Brukes av `paper-visual`-spec-ene og av `scripts/paper-baseline-seed.ts`.
 */

import type { Locator, Page } from "@playwright/test";

export type PaperTema = "light" | "dark";
export type PaperTilstand = "fylt" | "tom" | "laster" | "feil";

const DEMO_ONLY_SELECTORS = [
  "[data-demo-only]",
  ".state-switch",
  ".phone-ramme",
] as const;

/** Åpner en fasit-HTML-fil lokalt fra disk (file://) i en Playwright-page. */
export async function openFasitFile(
  page: Page,
  fasitAbsolutePath: string,
): Promise<void> {
  await page.goto(`file://${fasitAbsolutePath}`, {
    waitUntil: "domcontentloaded",
  });
}

/**
 * Setter tema, bytter til ønsket tilstand (hvis fasiten har
 * `[data-tilstand="…"]`-knapper for det) og skjuler alt demo-stillas
 * FØR skjermbildet tas — slik at bare det som faktisk skal porteres
 * sammenlignes.
 */
export async function prepareFasitState(
  page: Page,
  opts: { tema: PaperTema; tilstand?: PaperTilstand },
): Promise<void> {
  await page.evaluate((tema) => {
    document.documentElement.setAttribute("data-theme", tema);
  }, opts.tema);

  if (opts.tilstand) {
    const knapp = page.locator(`[data-tilstand="${opts.tilstand}"]`).first();
    if (await knapp.count()) {
      await knapp.click();
    }
  }

  await page.addStyleTag({
    content: DEMO_ONLY_SELECTORS.map((s) => `${s} { display: none !important; }`).join(
      "\n",
    ),
  });
}

/**
 * Finner elementet som faktisk skal sammenlignes med den bygde appen —
 * `#kropp` (mest presise, brukt i playerhq-*-fasitene), ellers `main`,
 * ellers hele `.phone`-stillaset (uten demo-only-barna, som er skjult over).
 */
export async function fasitInnholdLocator(page: Page): Promise<Locator> {
  const kropp = page.locator("#kropp");
  if (await kropp.count()) return kropp.first();

  const main = page.locator("main");
  if (await main.count()) return main.first();

  return page.locator(".phone").first();
}

/** Mobil/desktop-breddene skjermbilde-gaten krever (§Ferdig-definisjon). */
export const PAPER_VIEWPORTS = {
  mobil: { width: 390, height: 844 },
  desktop: { width: 1280, height: 900 },
} as const;
