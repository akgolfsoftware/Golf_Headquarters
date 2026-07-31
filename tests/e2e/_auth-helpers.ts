/**
 * Innlogging for e2e-smoke.
 *
 * Coach: E2E_COACH_EMAIL + E2E_COACH_PASSWORD
 * Spiller: E2E_TEST_USER_EMAIL + E2E_TEST_USER_PASSWORD
 *
 * Uten credentials skal tester bruke test.skip — ikke feile suiten.
 */

import type { Page } from "@playwright/test";

export function coachCredentials(): { email: string; password: string } | null {
  const email = process.env.E2E_COACH_EMAIL?.trim() ?? "";
  const password = process.env.E2E_COACH_PASSWORD?.trim() ?? "";
  if (!email || !password) return null;
  return { email, password };
}

export function playerCredentials(): { email: string; password: string } | null {
  const email = process.env.E2E_TEST_USER_EMAIL?.trim() ?? "";
  const password = process.env.E2E_TEST_USER_PASSWORD?.trim() ?? "";
  if (!email || !password) return null;
  return { email, password };
}

/** true når coach-innlogging kan kjøres. */
export function hasCoachAuth(): boolean {
  return coachCredentials() !== null;
}

async function loginWith(
  page: Page,
  email: string,
  password: string,
): Promise<void> {
  await page.goto("/auth/login");
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/\/(portal|auth\/etter-innlogging|forelder|admin)/, {
    timeout: 25_000,
  });
}

/** Logg inn som coach (AgencyOS). Krever E2E_COACH_*. */
export async function loginAsCoach(page: Page): Promise<void> {
  const creds = coachCredentials();
  if (!creds) {
    throw new Error(
      "loginAsCoach kalt uten E2E_COACH_EMAIL/PASSWORD — bruk hasCoachAuth() + test.skip",
    );
  }
  await loginWith(page, creds.email, creds.password);
}

/** Logg inn som spiller (PlayerHQ). Krever E2E_TEST_USER_*. */
export async function loginAsPlayer(page: Page): Promise<void> {
  const creds = playerCredentials();
  if (!creds) {
    throw new Error(
      "loginAsPlayer kalt uten E2E_TEST_USER_EMAIL/PASSWORD — bruk test.skip",
    );
  }
  await loginWith(page, creds.email, creds.password);
}
