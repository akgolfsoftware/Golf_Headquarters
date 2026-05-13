/**
 * Re-import Stripe-historikk inn i Payment-modellen.
 *
 * Idempotent: bruker upsert mot Stripe-IDer. Kan kjøres flere ganger.
 *
 * Henter:
 *  - PaymentIntents (alle)
 *  - Checkout Sessions (alle)
 *  - Invoices (alle)
 *  - Charges (kun de med refunds — for å fange refund-status)
 *
 * Bruk: npx tsx scripts/reimport-stripe.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import Stripe from "stripe";
import {
  recordPaymentIntent,
  recordCheckoutSession,
  recordInvoice,
  recordChargeRefund,
} from "../src/lib/payments/record";

const SECRET = process.env.STRIPE_SECRET_KEY;
if (!SECRET) {
  console.error("STRIPE_SECRET_KEY mangler i .env.local");
  process.exit(1);
}

const stripe = new Stripe(SECRET, { apiVersion: "2026-04-22.dahlia" });

async function importPaymentIntents() {
  let count = 0;
  let errors = 0;
  for await (const intent of stripe.paymentIntents.list({ limit: 100 })) {
    try {
      await recordPaymentIntent(intent);
      count++;
      if (count % 25 === 0) console.log(`  PaymentIntents: ${count}`);
    } catch (err) {
      errors++;
      console.error(`  PI ${intent.id} feilet:`, err instanceof Error ? err.message : err);
    }
  }
  console.log(`PaymentIntents totalt: ${count} (feil: ${errors})`);
}

async function importCheckoutSessions() {
  let count = 0;
  let errors = 0;
  for await (const session of stripe.checkout.sessions.list({ limit: 100 })) {
    try {
      await recordCheckoutSession(session);
      count++;
      if (count % 25 === 0) console.log(`  Sessions: ${count}`);
    } catch (err) {
      errors++;
      console.error(`  Session ${session.id} feilet:`, err instanceof Error ? err.message : err);
    }
  }
  console.log(`Checkout Sessions totalt: ${count} (feil: ${errors})`);
}

async function importInvoices() {
  let count = 0;
  let errors = 0;
  for await (const invoice of stripe.invoices.list({ limit: 100 })) {
    try {
      await recordInvoice(invoice);
      count++;
      if (count % 25 === 0) console.log(`  Invoices: ${count}`);
    } catch (err) {
      errors++;
      console.error(`  Invoice ${invoice.id} feilet:`, err instanceof Error ? err.message : err);
    }
  }
  console.log(`Invoices totalt: ${count} (feil: ${errors})`);
}

async function importRefunds() {
  let count = 0;
  let errors = 0;
  for await (const charge of stripe.charges.list({ limit: 100 })) {
    if (charge.amount_refunded === 0) continue;
    try {
      await recordChargeRefund(charge);
      count++;
    } catch (err) {
      errors++;
      console.error(`  Charge ${charge.id} feilet:`, err instanceof Error ? err.message : err);
    }
  }
  console.log(`Refunded charges totalt: ${count} (feil: ${errors})`);
}

async function main() {
  console.log("=== Reimport Stripe → Payment-modell ===\n");

  console.log("1) PaymentIntents...");
  await importPaymentIntents();

  console.log("\n2) Checkout Sessions...");
  await importCheckoutSessions();

  console.log("\n3) Invoices...");
  await importInvoices();

  console.log("\n4) Refunds (charges med amount_refunded > 0)...");
  await importRefunds();

  console.log("\nFerdig.");
  process.exit(0);
}

main().catch((e) => {
  console.error("Reimport feilet:", e);
  process.exit(1);
});
