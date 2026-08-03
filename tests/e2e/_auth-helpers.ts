/**
 * Innlogging for e2e-smoke.
 *
 * Coach (prioritet):
 *  1. E2E_COACH_EMAIL + E2E_COACH_PASSWORD
 *  2. coachtest@akgolf.test + SCREENTEST_PASSWORD (samme som seed-screentest-coach)
 *
 * Spiller: E2E_TEST_USER_EMAIL + E2E_TEST_USER_PASSWORD
 *
 * Laster .env.local her — Playwright leser ikke den filen selv.
 * Uten credentials skal tester bruke test.skip — ikke feile suiten.
 */

import { config as loadEnv } from "dotenv";
import type { Page } from "@playwright/test";

loadEnv({ path: ".env.local" });

const SCREENTEST_COACH_EMAIL = "coachtest@akgolf.test";
const SCREENTEST_PLAYER_EMAIL = "screentest@akgolf.test";

export function coachCredentials(): { email: string; password: string } | null {
  const email = process.env.E2E_COACH_EMAIL?.trim() ?? "";
  const password = process.env.E2E_COACH_PASSWORD?.trim() ?? "";
  if (email && password) return { email, password };

  // Samme konto som scripts/seed-screentest-coach.ts og e2e/i0-selvbetjent-gate
  const screentestPw = process.env.SCREENTEST_PASSWORD?.trim() ?? "";
  if (screentestPw) {
    return { email: SCREENTEST_COACH_EMAIL, password: screentestPw };
  }

  return null;
}

export function playerCredentials(): { email: string; password: string } | null {
  const email = process.env.E2E_TEST_USER_EMAIL?.trim() ?? "";
  const password = process.env.E2E_TEST_USER_PASSWORD?.trim() ?? "";
  if (email && password) return { email, password };

  // Samme konto som scripts/opprett-e2e-testspiller-2026-08-02.ts (og seed-screentest.ts)
  const screentestPw = process.env.SCREENTEST_PASSWORD?.trim() ?? "";
  if (screentestPw) {
    return { email: SCREENTEST_PLAYER_EMAIL, password: screentestPw };
  }

  return null;
}

/** true når coach-innlogging kan kjøres. */
export function hasCoachAuth(): boolean {
  return coachCredentials() !== null;
}

/** Cookie-banner kan dekke hele body i headless — lukk den hvis den vises. */
export async function dismissCookieBanner(page: Page): Promise<void> {
  const btn = page
    .getByRole("button", { name: /Kun nødvendige|Godta alle/i })
    .first();
  try {
    if (await btn.isVisible({ timeout: 2_500 })) {
      await btn.click();
      await btn.waitFor({ state: "hidden", timeout: 5_000 }).catch(() => undefined);
    }
  } catch {
    // Banner finnes ikke — greit.
  }
}

async function loginWith(
  page: Page,
  email: string,
  password: string,
): Promise<void> {
  await page.goto("/auth/login");
  await dismissCookieBanner(page);
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/\/(portal|auth\/etter-innlogging|forelder|admin)/, {
    timeout: 25_000,
  });
  await dismissCookieBanner(page);
}

/** Logg inn som coach (AgencyOS). */
export async function loginAsCoach(page: Page): Promise<void> {
  const creds = coachCredentials();
  if (!creds) {
    throw new Error(
      "loginAsCoach: mangler credentials. Sett E2E_COACH_EMAIL/PASSWORD eller SCREENTEST_PASSWORD i .env.local",
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
