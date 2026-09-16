/**
 * R-I: admin/(legacy)/bookinger/actions.ts. Rolle (COACH) alene er ikke
 * nok — en coach skal kun kunne bekrefte/avvise/fullføre egne bookinger
 * (coachId eller serviceType.coachUserId), aldri en annen coachs, mens
 * ADMIN rører alt. Bekreftelse skal aldri gi bort en ubetalt time
 * (kanBekrefteUtenStripeLeak). Dette er den mest følsomme av de tidligere
 * udekkede admin-mutasjonsfilene — den bekrefter reell betaling.
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

type Rolle = "PLAYER" | "COACH" | "ADMIN" | "PARENT";

let bruker: { id: string; role: Rolle; name: string } | null = {
  id: "coach-a",
  role: "COACH",
  name: "Coach A",
};

type Booking = {
  id: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  coachId: string | null;
  serviceType: { coachUserId: string } | null;
  priceOre: number;
  stripePaymentIntentId: string | null;
  subscriptionId: string | null;
};

let bookings: Record<string, Booking> = {};

function nullstill() {
  bruker = { id: "coach-a", role: "COACH", name: "Coach A" };
  bookings = {
    "booking-a-betalt": {
      id: "booking-a-betalt",
      status: "PENDING",
      coachId: "coach-a",
      serviceType: { coachUserId: "coach-a" },
      priceOre: 50000,
      stripePaymentIntentId: null,
      subscriptionId: null,
    },
    "booking-a-gratis": {
      id: "booking-a-gratis",
      status: "PENDING",
      coachId: "coach-a",
      serviceType: { coachUserId: "coach-a" },
      priceOre: 0,
      stripePaymentIntentId: null,
      subscriptionId: null,
    },
    "booking-a-confirmed": {
      id: "booking-a-confirmed",
      status: "CONFIRMED",
      coachId: "coach-a",
      serviceType: { coachUserId: "coach-a" },
      priceOre: 0,
      stripePaymentIntentId: null,
      subscriptionId: null,
    },
    "booking-b-gratis": {
      id: "booking-b-gratis",
      status: "PENDING",
      coachId: "coach-b",
      serviceType: { coachUserId: "coach-b" },
      priceOre: 0,
      stripePaymentIntentId: null,
      subscriptionId: null,
    },
    "booking-b-confirmed": {
      id: "booking-b-confirmed",
      status: "CONFIRMED",
      coachId: "coach-b",
      serviceType: { coachUserId: "coach-b" },
      priceOre: 0,
      stripePaymentIntentId: null,
      subscriptionId: null,
    },
  };
}

// Generisk predikat-evaluator som dekker de where-formene actions.ts faktisk
// sender: felt-likhet, OR/AND-lister, {lte}/{not} og nøstet serviceType.
function matches(b: Booking, where: Record<string, unknown>): boolean {
  for (const [key, val] of Object.entries(where)) {
    if (key === "OR") {
      if (!(val as Record<string, unknown>[]).some((c) => matches(b, c))) return false;
    } else if (key === "AND") {
      if (!(val as Record<string, unknown>[]).every((c) => matches(b, c))) return false;
    } else if (key === "serviceType") {
      const clause = val as { coachUserId: string };
      if (b.serviceType?.coachUserId !== clause.coachUserId) return false;
    } else if (val && typeof val === "object" && "lte" in (val as Record<string, unknown>)) {
      if (!(b[key as keyof Booking] as number <= (val as { lte: number }).lte)) return false;
    } else if (val && typeof val === "object" && "not" in (val as Record<string, unknown>)) {
      if (b[key as keyof Booking] === (val as { not: unknown }).not) return false;
    } else {
      if (b[key as keyof Booking] !== val) return false;
    }
  }
  return true;
}

mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });
mock.module("@/lib/auth/action-guards", {
  namedExports: {
    requireCoachActionUser: async () => {
      if (!bruker) throw new Error("unauthenticated");
      if (bruker.role !== "COACH" && bruker.role !== "ADMIN") throw new Error("forbidden");
      return bruker;
    },
  },
});
mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      booking: {
        findFirst: async ({ where, select }: { where: Record<string, unknown>; select?: Record<string, boolean> }) => {
          const funnet = Object.values(bookings).find((b) => matches(b, where));
          if (!funnet) return null;
          if (!select) return funnet;
          const utvalg: Record<string, unknown> = {};
          for (const felt of Object.keys(select)) {
            utvalg[felt] = funnet[felt as keyof Booking];
          }
          return utvalg;
        },
        updateMany: async ({ where, data }: { where: Record<string, unknown>; data: Partial<Booking> }) => {
          let count = 0;
          for (const b of Object.values(bookings)) {
            if (matches(b, where)) {
              Object.assign(b, data);
              count++;
            }
          }
          return { count };
        },
      },
    },
  },
});

async function actions() {
  return import("./actions");
}

test.beforeEach(() => {
  nullstill();
});

test("bekreftBooking avviser PLAYER uten å endre status", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { bekreftBooking } = await actions();
  await assert.rejects(() => bekreftBooking("booking-a-gratis"));
  assert.equal(bookings["booking-a-gratis"].status, "PENDING");
});

test("bekreftBooking gjør ingenting når booking tilhører en annen coach", async () => {
  const { bekreftBooking } = await actions();
  await bekreftBooking("booking-b-gratis");
  assert.equal(bookings["booking-b-gratis"].status, "PENDING");
});

test("bekreftBooking bekrefter egen gratis booking", async () => {
  const { bekreftBooking } = await actions();
  await bekreftBooking("booking-a-gratis");
  assert.equal(bookings["booking-a-gratis"].status, "CONFIRMED");
});

test("bekreftBooking nekter å bekrefte egen ubetalt booking (Stripe-leak-vern)", async () => {
  const { bekreftBooking } = await actions();
  await assert.rejects(() => bekreftBooking("booking-a-betalt"), /mangler betaling/);
  assert.equal(bookings["booking-a-betalt"].status, "PENDING");
});

test("avvisBooking avviser PLAYER uten å endre status", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { avvisBooking } = await actions();
  await assert.rejects(() => avvisBooking("booking-a-gratis"));
  assert.equal(bookings["booking-a-gratis"].status, "PENDING");
});

test("avvisBooking rører ikke en annen coachs booking", async () => {
  const { avvisBooking } = await actions();
  await avvisBooking("booking-b-gratis");
  assert.equal(bookings["booking-b-gratis"].status, "PENDING");
});

test("avvisBooking avviser egen booking", async () => {
  const { avvisBooking } = await actions();
  await avvisBooking("booking-a-gratis");
  assert.equal(bookings["booking-a-gratis"].status, "CANCELLED");
});

test("bekreftAllePending treffer kun egne kvalifiserte bookinger, aldri en annen coachs", async () => {
  const { bekreftAllePending } = await actions();
  await bekreftAllePending();
  assert.equal(bookings["booking-a-gratis"].status, "CONFIRMED");
  assert.equal(bookings["booking-a-betalt"].status, "PENDING", "ubetalt skal ikke bulk-bekreftes");
  assert.equal(bookings["booking-b-gratis"].status, "PENDING", "fremmed booking skal ikke røres");
});

test("avvisAllePending treffer kun egne, aldri en annen coachs", async () => {
  const { avvisAllePending } = await actions();
  await avvisAllePending();
  assert.equal(bookings["booking-a-gratis"].status, "CANCELLED");
  assert.equal(bookings["booking-b-gratis"].status, "PENDING");
});

test("markerAlleConfirmedSomCompleted treffer kun egne CONFIRMED, aldri en annen coachs", async () => {
  const { markerAlleConfirmedSomCompleted } = await actions();
  await markerAlleConfirmedSomCompleted();
  assert.equal(bookings["booking-a-confirmed"].status, "COMPLETED");
  assert.equal(bookings["booking-b-confirmed"].status, "CONFIRMED");
});

test("ADMIN kan bekrefte en annen coachs booking", async () => {
  bruker = { id: "admin-a", role: "ADMIN", name: "Admin A" };
  const { bekreftBooking } = await actions();
  await bekreftBooking("booking-b-gratis");
  assert.equal(bookings["booking-b-gratis"].status, "CONFIRMED");
});

test("ADMIN sin bulk-fullføring treffer alle coachers CONFIRMED-bookinger", async () => {
  bruker = { id: "admin-a", role: "ADMIN", name: "Admin A" };
  const { markerAlleConfirmedSomCompleted } = await actions();
  await markerAlleConfirmedSomCompleted();
  assert.equal(bookings["booking-a-confirmed"].status, "COMPLETED");
  assert.equal(bookings["booking-b-confirmed"].status, "COMPLETED");
});
