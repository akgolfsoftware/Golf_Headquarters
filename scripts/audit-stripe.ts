/**
 * Stripe-audit: list alle Live Products + Prices og sammenlign mot DB.
 *
 * Verifiserer:
 * - Abonnement-priser (STRIPE_PRICE_ID_PRO / _PERFORMANCE / _PERFORMANCE_PRO)
 *   peker på eksisterende aktive priser i Stripe
 * - Drop-in ServiceType lager ad-hoc Checkout (ingen forhåndsdefinerte products)
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import Stripe from "stripe";
import { Client } from "pg";

const SECRET = process.env.STRIPE_SECRET_KEY;
if (!SECRET) {
  console.error("STRIPE_SECRET_KEY mangler i .env.local");
  process.exit(1);
}

const stripe = new Stripe(SECRET, { apiVersion: "2026-04-22.dahlia" });

const ABO_ENV = {
  STRIPE_PRICE_ID_PRO: process.env.STRIPE_PRICE_ID_PRO,
  STRIPE_PRICE_ID_PERFORMANCE: process.env.STRIPE_PRICE_ID_PERFORMANCE,
  STRIPE_PRICE_ID_PERFORMANCE_PRO:
    process.env.STRIPE_PRICE_ID_PERFORMANCE_PRO,
};

async function main() {
  console.log("=== Stripe Live audit ===\n");

  // 1) Hent alle products
  const products = await stripe.products.list({ limit: 50, active: true });
  console.log(`Produkter (${products.data.length}):`);
  for (const p of products.data) {
    console.log(`  · ${p.id}  ${p.name}`);
  }

  // 2) Hent alle priser
  const prices = await stripe.prices.list({ limit: 100, active: true });
  console.log(`\nPriser (${prices.data.length}):`);
  for (const p of prices.data) {
    const amount = p.unit_amount ? `${p.unit_amount / 100} ${p.currency}` : "?";
    const interval = p.recurring?.interval ?? "engangs";
    console.log(`  · ${p.id}  ${amount}  ${interval}  product=${p.product}`);
  }

  // 3) Verifiser abonnement-env-vars
  console.log("\n=== Abonnement-env-vars vs Stripe ===");
  let warnings = 0;
  for (const [envKey, priceId] of Object.entries(ABO_ENV)) {
    if (!priceId) {
      console.log(`  ✗ ${envKey} = mangler`);
      warnings++;
      continue;
    }
    const found = prices.data.find((p) => p.id === priceId);
    if (!found) {
      console.log(`  ✗ ${envKey} = ${priceId} (FINNES IKKE i Stripe Live)`);
      warnings++;
    } else if (!found.active) {
      console.log(`  ⚠ ${envKey} = ${priceId} (eksisterer men er inaktiv)`);
      warnings++;
    } else {
      const amount = found.unit_amount ? `${found.unit_amount / 100} kr` : "?";
      console.log(`  ✓ ${envKey} → ${priceId} (${amount} ${found.recurring?.interval ?? ""})`);
    }
  }

  // 4) DB ServiceTypes (direkte pg-spørring for å unngå Prisma-adapter init-issue)
  console.log("\n=== DB ServiceTypes (drop-in, ad-hoc Stripe Checkout) ===");
  const dbUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
  if (dbUrl) {
    const client = new Client({ connectionString: dbUrl });
    await client.connect();
    const { rows } = await client.query<{
      slug: string;
      pris: number;
      varighet: number;
      coach: string | null;
    }>(`
      SELECT s.slug, s."priceOre"/100 AS pris, s."durationMin" AS varighet, u.name AS coach
      FROM service_types s
      LEFT JOIN users u ON s."coachUserId" = u.id
      WHERE s.active = true
      ORDER BY s.slug
    `);
    for (const r of rows) {
      console.log(
        `  · ${r.slug.padEnd(28)} ${String(r.pris).padStart(5)} kr  ${r.varighet} min  ${r.coach ?? "(felles)"}`,
      );
    }
    await client.end();
  }
  console.log(
    `\nMerk: drop-in lager ad-hoc Stripe Checkout uten forhåndsdefinerte products. Pris fra priceOre.`,
  );

  if (warnings > 0) {
    console.log(`\n${warnings} advarsler — sjekk konfigurasjon.`);
    process.exit(1);
  }
  console.log("\n✓ Alt grønt.");
  process.exit(0);
}

main().catch((e) => {
  console.error("Audit feilet:", e);
  process.exit(1);
});
