/**
 * Tester for Stripe-event-håndteringen (kvalitetsaudit 2026-08-02, tiltak 10).
 *
 * Dekker de to feilene herdingen fjernet:
 *  1. Et replayet `checkout.session.completed` sendte bekreftelses-e-post, kalender-push
 *     og coach-varsel på nytt, fordi sideeffektene bare hang på at eventet kom — ikke på
 *     om bookingen faktisk gikk fra PENDING til CONFIRMED.
 *  2. `markerBehandlet` er dedup-låsen: andre gang samme event kommer skal den si nei.
 *
 * Mock-mønster som resten av suiten (t.mock.module før dynamisk import). Modulen under
 * test importeres KUN ÉN GANG per fil — senere import av samme spesifikator rebindes
 * ikke til nye mocks — så scenarioene kjøres sekvensielt med mutérbar mock-tilstand.
 *
 * Kjør med: npm test
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import type Stripe from "stripe";

type UpdateManyArgs = { where: unknown; data: unknown };

test("stripe handle-event — dedup og sideeffekter", async (t) => {
  // --- mutérbar mock-tilstand ---
  let bookingUpdateCount = 0; // hva updateMany later som den traff
  const epostSendt: string[] = [];
  const kalenderPush: string[] = [];
  const coachVarsel: string[] = [];
  const bookingUpdates: UpdateManyArgs[] = [];
  let processedRader: { source: string; eventId: string }[] = [];

  t.mock.module("@/lib/prisma", {
    namedExports: {
      prisma: {
        booking: {
          updateMany: async (args: UpdateManyArgs) => {
            bookingUpdates.push(args);
            return { count: bookingUpdateCount };
          },
          findUnique: async () => ({
            id: "booking-1",
            userId: "user-1",
            guestName: null,
            startAt: new Date("2026-08-10T10:00:00Z"),
            serviceType: { name: "Time med coach", coachUserId: "coach-1" },
            user: { name: "Øyvind Rohjan" },
            location: { name: "Mulligan Indoor" },
          }),
        },
        processedWebhookEvent: {
          create: async ({ data }: { data: { source: string; eventId: string } }) => {
            const finnes = processedRader.some(
              (r) => r.source === data.source && r.eventId === data.eventId,
            );
            if (finnes) {
              // Samme form som Prisma sitt unique-brudd — koden er det handle-event
              // skiller på for å ikke forveksle «duplikat» med «databasen er nede».
              throw Object.assign(new Error("Unique constraint failed"), {
                code: "P2002",
              });
            }
            processedRader.push({ source: data.source, eventId: data.eventId });
            return data;
          },
          findUnique: async ({
            where,
          }: {
            where: { source_eventId: { source: string; eventId: string } };
          }) => {
            const { source, eventId } = where.source_eventId;
            return processedRader.find((r) => r.source === source && r.eventId === eventId)
              ? { id: "x" }
              : null;
          },
          deleteMany: async ({ where }: { where: { source: string; eventId: string } }) => {
            processedRader = processedRader.filter(
              (r) => !(r.source === where.source && r.eventId === where.eventId),
            );
            return { count: 1 };
          },
        },
        subscription: { findUnique: async () => null, upsert: async () => ({}) },
        user: { update: async () => ({}), findMany: async () => [] },
      },
    },
  });

  t.mock.module("@/lib/payments/record", {
    namedExports: {
      recordPaymentIntent: async () => undefined,
      recordCheckoutSession: async () => undefined,
      recordInvoice: async () => undefined,
      recordChargeRefund: async () => undefined,
    },
  });

  t.mock.module("@/lib/email/booking-emails", {
    namedExports: {
      sendBookingConfirmation: async (id: string) => {
        epostSendt.push(id);
      },
    },
  });

  t.mock.module("@/lib/google-calendar-kilder", {
    namedExports: {
      pushBooking: async (id: string) => {
        kalenderPush.push(id);
      },
    },
  });

  t.mock.module("@/lib/booking/varsle-ny-booking", {
    namedExports: {
      varsleNyBooking: async (id: string) => {
        coachVarsel.push(id);
      },
    },
  });

  t.mock.module("@/lib/notifications", {
    namedExports: { notify: async () => undefined },
  });

  t.mock.module("@/lib/email", {
    namedExports: {
      resendKlient: () => ({ emails: { send: async () => ({}) } }),
      FRA_EPOST: "test@akgolf.test",
    },
  });

  const { handleStripeEvent, markerBehandlet, angreBehandlet, harBehandlet } =
    await import("@/lib/stripe/handle-event");

  const stripe = {
    subscriptions: { retrieve: async () => ({}) },
  } as unknown as Stripe;

  function checkoutEvent(id: string): Stripe.Event {
    return {
      id,
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_test_1",
          object: "checkout.session",
          payment_status: "paid",
          payment_intent: "pi_test_1",
          metadata: { bookingId: "booking-1" },
          subscription: null,
        },
      },
    } as unknown as Stripe.Event;
  }

  // --- 1. Første levering: bookingen går PENDING → CONFIRMED, sideeffektene skal kjøre.
  bookingUpdateCount = 1;
  assert.equal(
    await markerBehandlet("evt_1", "checkout.session.completed"),
    true,
    "første gang skal slippe gjennom",
  );
  await handleStripeEvent(checkoutEvent("evt_1"), {
    stripe,
    ventPaaSideeffekter: true,
  });
  assert.deepEqual(epostSendt, ["booking-1"], "bekreftelses-e-post skal sendes én gang");
  assert.deepEqual(kalenderPush, ["booking-1"], "kalender-push skal skje én gang");
  assert.deepEqual(coachVarsel, ["booking-1"], "coach skal varsles én gang");

  // --- 2. Dedup: samme event igjen skal avvises av låsen.
  assert.equal(
    await markerBehandlet("evt_1", "checkout.session.completed"),
    false,
    "andre gang samme event skal avvises",
  );
  assert.equal(await harBehandlet("evt_1"), true);

  // --- 3. Replay som slipper forbi dedup (nytt event-id, samme booking):
  // updateMany treffer 0 rader fordi bookingen alt er CONFIRMED → ingen nye sideeffekter.
  bookingUpdateCount = 0;
  assert.equal(await markerBehandlet("evt_2", "checkout.session.completed"), true);
  await handleStripeEvent(checkoutEvent("evt_2"), {
    stripe,
    ventPaaSideeffekter: true,
  });
  assert.deepEqual(epostSendt, ["booking-1"], "ingen dobbel e-post ved replay");
  assert.deepEqual(kalenderPush, ["booking-1"], "ingen dobbel kalender-push ved replay");
  assert.deepEqual(coachVarsel, ["booking-1"], "ingen dobbelt coach-varsel ved replay");

  // --- 4. angreBehandlet slipper eventet fri igjen, så reprosessering kan prøve på nytt.
  await angreBehandlet("evt_2");
  assert.equal(await harBehandlet("evt_2"), false);
  assert.equal(
    await markerBehandlet("evt_2", "checkout.session.completed"),
    true,
    "etter angre skal eventet kunne behandles på nytt",
  );

  // --- 5. En ekte databasefeil skal IKKE forveksles med «allerede behandlet».
  // Svelges den, blir hver betaling stille avvist som duplikat og aldri registrert.
  const ekteFeil = Object.assign(new Error("relation does not exist"), {
    code: "P2021",
  });
  const original = processedRader;
  await assert.rejects(
    async () => {
      processedRader = new Proxy([] as { source: string; eventId: string }[], {
        get() {
          throw ekteFeil;
        },
      });
      await markerBehandlet("evt_3", "checkout.session.completed");
    },
    (e: unknown) => (e as { code?: string }).code === "P2021",
    "annen DB-feil enn unique-brudd skal kastes videre",
  );
  processedRader = original;

  // --- 6. Bookingen oppdateres alltid med PENDING-guard (aldri blind overskriving).
  for (const u of bookingUpdates) {
    const where = u.where as { status?: string };
    assert.equal(where.status, "PENDING", "updateMany skal kreve status PENDING");
  }
});
