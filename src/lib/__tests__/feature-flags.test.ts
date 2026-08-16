/**
 * resolveTilgang/resolveTier (plan A3) — persona-matrisen rundt cutover
 * 1. september 2026. Alle tester bruker simulert `now` (now-parameterisert
 * ren kode — ingen miljøtriks).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  gratisForAlle,
  resolveTier,
  resolveTilgang,
  type ResolveTilgangInput,
} from "@/lib/feature-flags";

const FOR_CUTOVER = new Date("2026-08-31T23:59:59+02:00");
const ETTER_CUTOVER = new Date("2026-09-01T00:00:01+02:00");
const SENERE = new Date("2026-10-15T12:00:00+02:00");

/** Basis-persona: gammel gratisbruker uten noe som helst. */
function persona(overrides: Partial<ResolveTilgangInput> = {}): ResolveTilgangInput {
  return {
    tier: "GRATIS",
    profilType: "STANDARD",
    createdAt: new Date("2026-01-01T00:00:00+01:00"),
    trialEndsAt: null,
    coaching: null,
    playerhq: null,
    akGruppeCount: 0,
    now: SENERE,
    ...overrides,
  };
}

// ── Lanserings-vinduet ─────────────────────────────────────────────────────

test("gratisForAlle: true før cutover, false etter (eksakt grense)", () => {
  assert.equal(gratisForAlle(FOR_CUTOVER), true);
  assert.equal(gratisForAlle(ETTER_CUTOVER), false);
});

test("før cutover: ALLE personaer har FULL med kilde LANSERING", () => {
  const t = resolveTilgang(persona({ now: FOR_CUTOVER }));
  assert.equal(t.nivaa, "FULL");
  assert.equal(t.kilde, "LANSERING");
  assert.equal(t.effektivTier, "PRO");
});

// ── PlayerHQ-abonnement ────────────────────────────────────────────────────

test("betaler månedlig: FULL via PLAYERHQ_ABONNEMENT", () => {
  const t = resolveTilgang(
    persona({
      playerhq: { status: "ACTIVE", currentPeriodEnd: null, plan: "PLAYERHQ_MND", stripeSubscriptionId: "sub_1" },
    }),
  );
  assert.equal(t.nivaa, "FULL");
  assert.equal(t.kilde, "PLAYERHQ_ABONNEMENT");
});

test("betaler årlig: FULL", () => {
  const t = resolveTilgang(
    persona({
      playerhq: { status: "ACTIVE", currentPeriodEnd: null, plan: "PLAYERHQ_AAR", stripeSubscriptionId: "sub_2" },
    }),
  );
  assert.equal(t.nivaa, "FULL");
});

test("TRIALING-broen (vinn-tilbake): FULL", () => {
  const t = resolveTilgang(
    persona({
      playerhq: { status: "TRIALING", currentPeriodEnd: null, plan: "PLAYERHQ_AAR", stripeSubscriptionId: "sub_3" },
    }),
  );
  assert.equal(t.nivaa, "FULL");
});

test("oppsagt PlayerHQ med resttid: FULL ut perioden, INGEN etter", () => {
  const playerhq = {
    status: "CANCELLED" as const,
    currentPeriodEnd: new Date("2026-11-01T00:00:00+01:00"),
    plan: "PLAYERHQ_MND",
    stripeSubscriptionId: "sub_4",
  };
  assert.equal(resolveTilgang(persona({ playerhq })).nivaa, "FULL");
  assert.equal(
    resolveTilgang(persona({ playerhq, now: new Date("2026-11-02T00:00:00+01:00") })).nivaa,
    "INGEN",
  );
});

test("anker-rad (plan null) gir ALDRI tilgang", () => {
  const t = resolveTilgang(
    persona({
      playerhq: { status: "ACTIVE", currentPeriodEnd: null, plan: null, stripeSubscriptionId: null },
    }),
  );
  assert.equal(t.nivaa, "INGEN");
});

test("MANUELL-rad (admin-opprettet, uten Stripe): FULL når ACTIVE", () => {
  const t = resolveTilgang(
    persona({
      playerhq: { status: "ACTIVE", currentPeriodEnd: null, plan: "MANUELL", stripeSubscriptionId: null },
    }),
  );
  assert.equal(t.nivaa, "FULL");
});

test("user.tier PRO (manuelt satt) gir FULL selv uten abonnementsrad", () => {
  assert.equal(resolveTilgang(persona({ tier: "PRO" })).nivaa, "FULL");
});

// ── Coaching-pakken ────────────────────────────────────────────────────────

test("aktiv Performance-pakke: FULL via COACHING_PAKKE", () => {
  const t = resolveTilgang(
    persona({ coaching: { status: "ACTIVE", monthlyCredits: 2, currentPeriodEnd: null } }),
  );
  assert.equal(t.kilde, "COACHING_PAKKE");
});

test("oppsagt coaching med resttid: tilgangen følger pakken UT perioden (krav 2)", () => {
  const t = resolveTilgang(
    persona({
      coaching: {
        status: "CANCELLED",
        monthlyCredits: 4,
        currentPeriodEnd: new Date("2026-11-01T00:00:00+01:00"),
      },
    }),
  );
  assert.equal(t.nivaa, "FULL");
  assert.equal(t.kilde, "COACHING_PAKKE");
});

test("oppsagt coaching ETTER periodeslutt: ingen tilgang lenger", () => {
  const t = resolveTilgang(
    persona({
      coaching: {
        status: "CANCELLED",
        monthlyCredits: 4,
        currentPeriodEnd: new Date("2026-10-01T00:00:00+02:00"),
      },
    }),
  );
  assert.equal(t.nivaa, "INGEN");
});

test("coaching-rad uten credits (aldri en ekte pakke) gir ikke tilgang", () => {
  const t = resolveTilgang(
    persona({ coaching: { status: "ACTIVE", monthlyCredits: 0, currentPeriodEnd: null } }),
  );
  assert.equal(t.nivaa, "INGEN");
});

// ── AK-gruppe ──────────────────────────────────────────────────────────────

test("aktivt AK-gruppemedlemskap: FULL via AK_GRUPPE", () => {
  const t = resolveTilgang(persona({ akGruppeCount: 1 }));
  assert.equal(t.nivaa, "FULL");
  assert.equal(t.kilde, "AK_GRUPPE");
});

test("null aktive AK-gruppemedlemskap: ikke gruppe-tilgang", () => {
  assert.equal(resolveTilgang(persona({ akGruppeCount: 0 })).kilde, "INGEN");
});

// ── Prøveperiode ───────────────────────────────────────────────────────────

test("innenfor 30 dager fra registrering: FULL via PROVEPERIODE", () => {
  const t = resolveTilgang(
    persona({ createdAt: new Date("2026-10-01T00:00:00+02:00"), now: SENERE }),
  );
  assert.equal(t.kilde, "PROVEPERIODE");
});

test("trialEndsAt vinner over createdAt+30d — kan forlenge og forkorte", () => {
  // Gammel bruker med forlenget prøve → FULL.
  const forlenget = resolveTilgang(
    persona({ trialEndsAt: new Date("2026-12-01T00:00:00+01:00") }),
  );
  assert.equal(forlenget.kilde, "PROVEPERIODE");
  // Ny bruker med tidlig-avsluttet prøve → INGEN.
  const avsluttet = resolveTilgang(
    persona({
      createdAt: new Date("2026-10-10T00:00:00+02:00"),
      trialEndsAt: new Date("2026-10-12T00:00:00+02:00"),
    }),
  );
  assert.equal(avsluttet.nivaa, "INGEN");
});

test("prøveperioden utløper på grensen (eksakt 30 dager)", () => {
  const createdAt = new Date("2026-09-10T00:00:00+02:00");
  const grense = new Date(createdAt.getTime() + 30 * 86_400_000);
  assert.equal(
    resolveTilgang(persona({ createdAt, now: new Date(grense.getTime() - 1) })).nivaa,
    "FULL",
  );
  assert.equal(resolveTilgang(persona({ createdAt, now: grense })).nivaa, "INGEN");
});

// ── TALENT-profilen ────────────────────────────────────────────────────────

test("TALENT-profil: nivå TALENT, effektiv tier GRATIS, utløper aldri", () => {
  const t = resolveTilgang(
    persona({ profilType: "TALENT", now: new Date("2028-01-01T00:00:00+01:00") }),
  );
  assert.equal(t.nivaa, "TALENT");
  assert.equal(t.kilde, "TALENT_PROFIL");
  assert.equal(t.effektivTier, "GRATIS");
});

test("TALENT-profil som kjøper abonnement: FULL vinner automatisk", () => {
  const t = resolveTilgang(
    persona({
      profilType: "TALENT",
      playerhq: { status: "ACTIVE", currentPeriodEnd: null, plan: "PLAYERHQ_MND", stripeSubscriptionId: "sub_5" },
    }),
  );
  assert.equal(t.nivaa, "FULL");
});

test("TALENT-profil som meldes inn i AK-gruppe: FULL vinner", () => {
  const t = resolveTilgang(persona({ profilType: "TALENT", akGruppeCount: 1 }));
  assert.equal(t.nivaa, "FULL");
  assert.equal(t.kilde, "AK_GRUPPE");
});

test("TALENT-profil i prøveperiode: FULL i prøven, TALENT etterpå (aldri INGEN)", () => {
  const createdAt = new Date("2026-09-10T00:00:00+02:00");
  const iProven = resolveTilgang(
    persona({ profilType: "TALENT", createdAt, now: new Date("2026-09-20T00:00:00+02:00") }),
  );
  assert.equal(iProven.nivaa, "FULL");
  const etterProven = resolveTilgang(persona({ profilType: "TALENT", createdAt, now: SENERE }));
  assert.equal(etterProven.nivaa, "TALENT");
});

// ── INGEN + wrapper ────────────────────────────────────────────────────────

test("gammel gratisbruker uten noe: INGEN", () => {
  const t = resolveTilgang(persona());
  assert.equal(t.nivaa, "INGEN");
  assert.equal(t.effektivTier, "GRATIS");
});

test("resolveTier-wrapperen: PRO ved FULL, GRATIS ellers (bakoverkompatibilitet)", () => {
  assert.equal(resolveTier(persona({ akGruppeCount: 1 })), "PRO");
  assert.equal(resolveTier(persona({ profilType: "TALENT" })), "GRATIS");
  assert.equal(resolveTier(persona()), "GRATIS");
});

test("kilde-prioritet: abonnement før coaching før gruppe før prøve", () => {
  const alt = persona({
    playerhq: { status: "ACTIVE", currentPeriodEnd: null, plan: "PLAYERHQ_MND", stripeSubscriptionId: "s" },
    coaching: { status: "ACTIVE", monthlyCredits: 4, currentPeriodEnd: null },
    akGruppeCount: 2,
    createdAt: new Date("2026-10-01T00:00:00+02:00"),
  });
  assert.equal(resolveTilgang(alt).kilde, "PLAYERHQ_ABONNEMENT");
  assert.equal(resolveTilgang({ ...alt, playerhq: null, tier: "GRATIS" }).kilde, "COACHING_PAKKE");
  assert.equal(resolveTilgang({ ...alt, playerhq: null, coaching: null }).kilde, "AK_GRUPPE");
  assert.equal(
    resolveTilgang({ ...alt, playerhq: null, coaching: null, akGruppeCount: 0 }).kilde,
    "PROVEPERIODE",
  );
});
