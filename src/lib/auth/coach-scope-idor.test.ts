/**
 * IDOR-regresjoner — rene enhetstester uten DB.
 * Speiler reglene vi innførte i booking/agents/coachScoped.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { coachScopedPlayerWhere } from "./coached";

/** Speil av kanBekrefteUtenStripeLeak i bookinger/actions. */
function kanBekrefteUtenStripeLeak(b: {
  priceOre: number;
  stripePaymentIntentId: string | null;
  subscriptionId: string | null;
}): boolean {
  if (b.priceOre <= 0) return true;
  if (b.stripePaymentIntentId) return true;
  if (b.subscriptionId) return true;
  return false;
}

/** Speil av booking staff-eierskap. */
function coachKanRoreBooking(
  user: { id: string; role: string },
  booking: { userId: string | null; coachId: string | null; serviceCoachId: string | null },
): boolean {
  if (booking.userId === user.id) return true;
  if (user.role === "ADMIN") return true;
  if (user.role !== "COACH") return false;
  return booking.coachId === user.id || booking.serviceCoachId === user.id;
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

test("booking: coach A kan ikke røre coach B sin booking", () => {
  const coachA = { id: "coach-a", role: "COACH" };
  const bookingB = {
    userId: "player-1",
    coachId: "coach-b",
    serviceCoachId: "coach-b",
  };
  assert.equal(coachKanRoreBooking(coachA, bookingB), false);
  assert.equal(
    coachKanRoreBooking(
      { id: "coach-b", role: "COACH" },
      bookingB,
    ),
    true,
  );
  assert.equal(
    coachKanRoreBooking({ id: "admin", role: "ADMIN" }, bookingB),
    true,
  );
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
