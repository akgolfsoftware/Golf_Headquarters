/**
 * IDOR-regresjoner — rene enhetstester uten DB.
 *
 * Importerer den EKTE produksjonskoden. Frem til 2026-08-15 speilet denne
 * filen `kanBekrefteUtenStripeLeak` og booking-eierskapet med lokale kopier;
 * speilet hadde drevet fra originalen (testet et `serviceCoachId`-felt som
 * ikke finnes i skjemaet, og en `booking.userId`-gren den ekte koden aldri
 * har hatt), så testene var grønne på kode som ikke kjører. Speilene er
 * erstattet med import fra `./booking-scope` — legg aldri inn en lokal kopi
 * av produksjonslogikk her igjen.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { coachScopedPlayerWhere } from "./coached";
import {
  coachBookingScope,
  kanBekrefteUtenStripeLeak,
} from "./booking-scope";
import type { User } from "@/generated/prisma/client";

/** Minimal staff-bruker — kun feltene scope-filteret leser. */
function staff(id: string, role: "ADMIN" | "COACH"): User {
  return { id, role } as User;
}

test("booking: betalt time uten PI/credit kan ikke bekreftes manuelt", () => {
  assert.equal(
    kanBekrefteUtenStripeLeak({
      priceOre: 150000,
      stripePaymentIntentId: null,
      subscriptionId: null,
    }),
    false,
  );
});

test("booking: gratis / PI / credit kan bekreftes", () => {
  assert.equal(
    kanBekrefteUtenStripeLeak({
      priceOre: 0,
      stripePaymentIntentId: null,
      subscriptionId: null,
    }),
    true,
  );
  assert.equal(
    kanBekrefteUtenStripeLeak({
      priceOre: 100,
      stripePaymentIntentId: "pi_x",
      subscriptionId: null,
    }),
    true,
  );
  assert.equal(
    kanBekrefteUtenStripeLeak({
      priceOre: 100,
      stripePaymentIntentId: null,
      subscriptionId: "sub_x",
    }),
    true,
  );
});

test("booking: COACH låses til egne bookinger (direkte + via tjenestetype)", () => {
  const w = coachBookingScope(staff("coach-a", "COACH"));
  // Coachen skal aldri få et tomt filter — tomt = hele systemet.
  assert.notDeepEqual(w, {});
  const grener = w.OR ?? [];
  assert.equal(grener.length, 2);
  assert.equal(grener[0]?.coachId, "coach-a");
  assert.equal(grener[1]?.serviceType?.coachUserId, "coach-a");
});

test("booking: COACH-filteret nevner ingen annen coach enn seg selv", () => {
  // IDOR-kjernen: coach A sitt filter skal ikke kunne treffe coach B sine rader.
  const w = coachBookingScope(staff("coach-a", "COACH"));
  assert.equal(JSON.stringify(w).includes("coach-b"), false);
});

test("booking: staff-tilgang gis ALDRI via booking.userId", () => {
  // Å være spilleren på bookingen er ikke staff-tilgang. Det gamle speilet i
  // denne filen hadde en `booking.userId === user.id`-gren; den finnes ikke
  // i produksjonskoden, og skal ikke snike seg inn igjen.
  const w = coachBookingScope(staff("coach-a", "COACH"));
  assert.equal(JSON.stringify(w).includes("userId"), false);
});

test("booking: ADMIN har tomt filter (ser alt)", () => {
  assert.deepEqual(coachBookingScope(staff("admin-1", "ADMIN")), {});
});

test("coachScopedPlayerWhere: COACH har deletedAt null + coachId-filter", () => {
  const w = coachScopedPlayerWhere({ id: "c1", role: "COACH" });
  assert.equal(w.deletedAt, null);
  assert.equal(w.role, "PLAYER");
  const enr = (w.OR ?? []).find((g) => "enrollmentsAsPlayer" in g) as {
    enrollmentsAsPlayer: { some: { coachId: string } };
  };
  assert.equal(enr.enrollmentsAsPlayer.some.coachId, "c1");
});

test("coachScopedPlayerWhere: ADMIN har ikke coachId-filter (ser alle coachede)", () => {
  const w = coachScopedPlayerWhere({ id: "admin-1", role: "ADMIN" });
  assert.equal(w.role, "PLAYER");
  assert.equal(w.deletedAt, null);
  const enr = (w.OR ?? []).find((g) => "enrollmentsAsPlayer" in g) as {
    enrollmentsAsPlayer: { some: { coachId?: string } };
  };
  // ADMIN scope = coachedPlayerWhere — ingen coachId-lås
  assert.equal(enr.enrollmentsAsPlayer.some.coachId, undefined);
});
