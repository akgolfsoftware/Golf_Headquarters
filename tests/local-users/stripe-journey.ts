import { expect, type Page } from "@playwright/test";
import { randomUUID } from "node:crypto";
import pg from "pg";
import Stripe from "stripe";
import { assertLocalUsersDatabase, assertLocalUsersTargets } from "../../scripts/local-users-target.mjs";
import { assertStripeTestSettings } from "../../scripts/local-stripe-target.mjs";
import { dismissCookieBanner } from "../e2e/_auth-helpers";
import { localStripeTestAuth } from "../../src/lib/stripe/local-test-auth";

/** A genuine test-mode Checkout and CLI webhook, never a simulated success page. */
export async function stripeJourney(page: Page) {
  const targets = assertLocalUsersTargets(process.env);
  assertStripeTestSettings(process.env.LOCAL_STRIPE_OAUTH_TOKEN ? {
    LOCAL_STRIPE_OAUTH_TOKEN: process.env.LOCAL_STRIPE_OAUTH_TOKEN, LOCAL_STRIPE_ACCOUNT: process.env.LOCAL_STRIPE_ACCOUNT,
  } : { STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY });
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", localStripeTestAuth(process.env));
  const db = new pg.Pool({ connectionString: targets.database.toString() });
  const email = `stripe-e2e-${randomUUID()}@akgolf.test`;
  try {
    await assertLocalUsersDatabase(db);
    await page.goto("/booking");
    await dismissCookieBanner(page);
    await page.getByRole("group", { name: "Velg tjeneste", exact: true })
      .getByRole("button", { name: /Lokal syntetisk coaching/ }).click();
    await page.getByRole("group", { name: "Velg dag", exact: true })
      .locator('button[aria-disabled="false"]').first().click();
    await page.getByRole("group", { name: /^Velg klokkeslett/ }).getByRole("button").first().click();
    await page.getByRole("button", { name: "Videre til dine opplysninger", exact: true }).click();
    await page.getByLabel("Navn", { exact: true }).fill("Syntetisk betalingsprøve");
    await page.getByLabel("E-post", { exact: true }).fill(email);
    await page.getByLabel("Telefon", { exact: true }).fill("00000000");
    await page.getByLabel(/Jeg godtar at opplysningene lagres/).check();
    await page.getByRole("button", { name: "Se over før du betaler", exact: true }).click();
    await page.getByRole("button", { name: "Gå til betaling", exact: true }).click();
    await page.waitForURL(/^https:\/\/checkout\.stripe\.com\//);
    const booking = (await db.query('SELECT * FROM bookings WHERE "guestEmail"=$1', [email])).rows[0];
    expect(booking?.stripeCheckoutSessionId).toMatch(/^cs_test_/);
    const checkout = await stripe.checkout.sessions.retrieve(booking.stripeCheckoutSessionId);
    expect(checkout.livemode).toBe(false);
    expect(checkout.amount_total).toBe(10000);
    expect(checkout.currency).toBe("nok");
    expect(booking.status).toBe("PENDING");
    // Stripe-hosted fields; confirm the real DOM when provider UI changes.
    await page.getByRole("button", { name: "Pay with card", exact: true }).press("Enter");
    const agentDisclosure = page.getByRole("checkbox", { name: "I am an AI agent acting on behalf of someone else", exact: true });
    if (await agentDisclosure.count()) {
      await agentDisclosure.press("Space");
      await expect(agentDisclosure).toBeChecked();
    }
    await page.locator('input[name="cardNumber"]').fill("4242424242424242");
    await page.locator('input[name="cardExpiry"]').fill("12/34");
    await page.locator('input[name="cardCvc"]').fill("123");
    await page.locator('input[name="billingName"]').fill("Syntetisk betalingsprøve");
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(url => url.origin === targets.app.origin && url.pathname === `/booking/kvittering/${booking.id}`, { timeout: 60_000 });
    await expect.poll(async () => (await db.query('SELECT status FROM bookings WHERE id=$1', [booking.id])).rows[0]?.status,
      { timeout: 60_000 }).toBe("CONFIRMED");
    await expect(page.getByRole("heading", { name: "Takk for bestillingen", exact: true })).toBeVisible();
    const paid = await stripe.checkout.sessions.retrieve(booking.stripeCheckoutSessionId);
    expect(paid.livemode).toBe(false);
    expect(paid.payment_status).toBe("paid");
    const payments = (await db.query('SELECT status, "amountOre", currency, "stripeSessionId" FROM payments WHERE "bookingId"=$1', [booking.id])).rows;
    expect(payments).toEqual([expect.objectContaining({ status: "SUCCEEDED", amountOre: 10000, currency: "nok", stripeSessionId: booking.stripeCheckoutSessionId })]);
  } finally {
    // Preserve synthetic payment history for inspection. No real refunds or mail.
    await db.end();
  }
}
