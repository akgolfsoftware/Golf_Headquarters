import { expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { parse } from "dotenv";
import pg from "pg";
import { assertLocalUsersDatabase, assertLocalUsersTargets } from "../../scripts/local-users-target.mjs";
import { loginAsPlayer, dismissCookieBanner } from "../e2e/_auth-helpers";

/** Only called by the explicitly isolated suite; no hosted database fallback. */
export async function creditJourney(page: Page) {
  const targets = assertLocalUsersTargets(process.env);
  const users = parse(readFileSync(".codex/environments/brukere/.env.users"));
  const db = new pg.Pool({ connectionString: targets.database.toString() });
  let bookingId: string | undefined;
  try {
    await assertLocalUsersDatabase(db);
    const balance = async () => (await db.query('SELECT "creditsRemaining" FROM subscriptions WHERE "userId"=$1 AND kind=\'COACHING\'', [users.LOCAL_P01_ID])).rows[0]?.creditsRemaining;
    expect(await balance()).toBe(4);
    const day = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Oslo" }).format(new Date(Date.now() + 3 * 86400000));
    await loginAsPlayer(page);
    await page.goto(`/portal/booking/ny?service=local-users-20261001-coaching&dato=${day}`);
    await dismissCookieBanner(page);
    const slot = page.locator('a[href^="/portal/booking/ny/bekreft?"]').first();
    await expect(slot).toBeVisible();
    await slot.click();
    await page.getByRole("button", { name: "Bekreft booking", exact: true }).click();
    await expect(page).toHaveURL(/\/portal\/booking\/bekreftet\?bookingId=/);
    bookingId = new URL(page.url()).searchParams.get("bookingId")!;
    await expect.poll(balance).toBe(3);
    const stored = async () => (await db.query('SELECT status, "userId", "serviceTypeId" FROM bookings WHERE id=$1', [bookingId])).rows[0];
    expect(await stored()).toMatchObject({ status: "CONFIRMED", userId: users.LOCAL_P01_ID, serviceTypeId: "local-users-20261001-service" });
    await page.goto(`/portal/booking/${bookingId}`);
    await page.getByRole("button", { name: "Avbestill", exact: true }).click();
    await page.getByRole("button", { name: "Ja, avbestill", exact: true }).click();
    await expect.poll(async () => (await stored())?.status).toBe("CANCELLED");
    await expect.poll(balance).toBe(4);
    await page.reload();
    await expect(page.getByRole("button", { name: "Avbestill", exact: true })).toHaveCount(0);
  } finally {
    // Only our own booking; never reset another user's subscription.
    if (bookingId) {
      await db.query('DELETE FROM bookings WHERE id=$1 AND "userId"=$2 AND "serviceTypeId"=$3', [bookingId, users.LOCAL_P01_ID, "local-users-20261001-service"]);
      await db.query('UPDATE subscriptions SET "creditsRemaining"=4 WHERE "userId"=$1 AND kind=\'COACHING\'', [users.LOCAL_P01_ID]);
    }
    await db.end();
  }
}
