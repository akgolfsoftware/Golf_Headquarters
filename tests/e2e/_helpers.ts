/**
 * Felles helpers for smoke-tester.
 *
 * Holdes minimal og typesikker (ingen `any`). Brukes av alle filer i
 * `tests/e2e/`.
 */

import type { Page, Response } from "@playwright/test";
import { expect } from "@playwright/test";

/**
 * Naviger til en path og vent til DOM-en er lastet.
 *
 * @returns Response-objektet fra navigeringen (eller null hvis ingen redirect).
 */
export async function gotoAndWait(
  page: Page,
  path: string,
): Promise<Response | null> {
  const response = await page.goto(path, { waitUntil: "domcontentloaded" });
  return response;
}

/**
 * Lytt på console.error og fail testen hvis noen logges under interaksjon.
 *
 * Returnerer en disposer som kan kalles for å slutte å lytte.
 */
export function expectNoConsoleErrors(page: Page): () => void {
  const errors: string[] = [];

  const handler = (msg: import("@playwright/test").ConsoleMessage): void => {
    if (msg.type() === "error") {
      // Ignorer kjente browser-warnings som ikke er våre.
      const text = msg.text();
      if (
        text.includes("Failed to load resource") ||
        text.includes("favicon") ||
        text.includes("manifest")
      ) {
        return;
      }
      errors.push(text);
    }
  };

  page.on("console", handler);

  return (): void => {
    page.off("console", handler);
    expect(errors, `Console errors: ${errors.join("\n")}`).toHaveLength(0);
  };
}

/**
 * Ta screenshot ved feil. Playwright gjør dette automatisk i konfig,
 * men denne kan brukes for ekstra eksplisitte snapshots.
 */
export async function screenshotOnFailure(
  page: Page,
  name: string,
): Promise<void> {
  await page.screenshot({
    path: `test-results/${name}-${Date.now()}.png`,
    fullPage: true,
  });
}

/**
 * Sjekk at en respons enten er 200 eller en redirect (3xx).
 * Brukes for sider som kan kreve auth — redirect til /auth/login er OK.
 */
export function isOkOrRedirect(status: number): boolean {
  return status === 200 || (status >= 300 && status < 400);
}
