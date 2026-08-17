/**
 * Regresjonstest for Stripe-abonnementsstatus (steg 7 i
 * `docs/plan-testdekning.md`).
 *
 * Feilen dette dekker står i `gotchas.md` og har skjedd før: Stripe rapporterer
 * `active` + `cancel_at_period_end` frem til periodeslutt. Mapper vi det til
 * ACTIVE, overskriver neste `customer.subscription.updated` den CANCELLED-en
 * `cancelPro()` nettopp satte — stille, uten feilmelding. Brukeren ser
 * «avbestilt», og oppdager at det ikke stemmer først når kortet belastes igjen.
 *
 * Kjør med: npm test
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  mapStripeStatus,
  effektivAbonnementStatus,
} from "./abonnement-status";

test("REGRESJON: active + cancel_at_period_end lagres som CANCELLED", () => {
  // Selve feilen fra gotchas.md.
  assert.equal(
    effektivAbonnementStatus(mapStripeStatus("active"), true),
    "CANCELLED",
  );
});

test("REGRESJON: trialing + cancel_at_period_end lagres som CANCELLED", () => {
  // A2: trialing mapper nå til TRIALING (vinn-tilbake-broen), men en trial
  // som sies opp før start skal fortsatt vises som CANCELLED.
  assert.equal(
    effektivAbonnementStatus(mapStripeStatus("trialing"), true),
    "CANCELLED",
  );
});

test("A2: trialing uten cancel lagres som TRIALING (vinn-tilbake-broen vises som «starter {dato}»)", () => {
  assert.equal(effektivAbonnementStatus(mapStripeStatus("trialing"), false), "TRIALING");
});

test("active uten cancel_at_period_end forblir ACTIVE", () => {
  assert.equal(
    effektivAbonnementStatus(mapStripeStatus("active"), false),
    "ACTIVE",
  );
  // Stripe kan utelate feltet helt.
  assert.equal(
    effektivAbonnementStatus(mapStripeStatus("active"), null),
    "ACTIVE",
  );
  assert.equal(
    effektivAbonnementStatus(mapStripeStatus("active"), undefined),
    "ACTIVE",
  );
});

test("cancel_at_period_end oppgraderer ALDRI en dårligere status", () => {
  // past_due + cancel_at_period_end skal forbli PAST_DUE — ikke bli CANCELLED,
  // som ville skjult at det finnes en ubetalt faktura.
  assert.equal(
    effektivAbonnementStatus(mapStripeStatus("past_due"), true),
    "PAST_DUE",
  );
  assert.equal(
    effektivAbonnementStatus(mapStripeStatus("unpaid"), true),
    "PAST_DUE",
  );
});

test("canceled forblir CANCELLED uansett flagg", () => {
  assert.equal(
    effektivAbonnementStatus(mapStripeStatus("canceled"), false),
    "CANCELLED",
  );
  assert.equal(
    effektivAbonnementStatus(mapStripeStatus("canceled"), true),
    "CANCELLED",
  );
});

test("mapStripeStatus dekker alle Stripe-statusene vi håndterer", () => {
  assert.equal(mapStripeStatus("active"), "ACTIVE");
  assert.equal(mapStripeStatus("trialing"), "TRIALING");
  assert.equal(mapStripeStatus("past_due"), "PAST_DUE");
  assert.equal(mapStripeStatus("unpaid"), "PAST_DUE");
  assert.equal(mapStripeStatus("canceled"), "CANCELLED");
  assert.equal(mapStripeStatus("incomplete_expired"), "CANCELLED");
});

test("ukjent Stripe-status faller til ACTIVE (bevisst — ikke steng ute en betalende kunde)", () => {
  // Dokumenterer et VALG, ikke en tilfeldighet: nye Stripe-statuser skal ikke
  // låse ute noen som betaler. Endres defaulten, skal denne testen tvinge fram
  // en bevisst vurdering.
  assert.equal(mapStripeStatus("incomplete"), "ACTIVE");
  assert.equal(mapStripeStatus("paused"), "ACTIVE");
  assert.equal(mapStripeStatus("noe-helt-nytt-fra-stripe"), "ACTIVE");
});
