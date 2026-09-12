/**
 * O06: samme betaling kan komme som session, intent og refusjon i vilkårlig
 * rekkefølge. savePayment slår dem sammen; motstrid avvises.
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

type Rad = {
  id: string;
  stripePaymentIntentId: string | null;
  stripeSessionId: string | null;
  stripeInvoiceId: string | null;
  stripeChargeId: string | null;
  stripeCustomerId: string | null;
  status: string;
  amountOre: number;
  amountRefundedOre: number;
  currency: string;
  type: string;
  userId: string | null;
  bookingId: string | null;
  subscriptionId: string | null;
  description: string | null;
  paidAt: Date | null;
  refundedAt: Date | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
};

let rader: Rad[] = [];

function treffer(
  where: { OR: Array<Record<string, string>> },
): Rad[] {
  return rader.filter((r) =>
    where.OR.some((del) =>
      Object.entries(del).every(([k, v]) => (r as Record<string, unknown>)[k] === v),
    ),
  );
}

mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      $transaction: async (fn: (tx: unknown) => Promise<unknown>) =>
        fn({
          $queryRaw: async () => undefined,
          payment: {
            findMany: async ({ where }: { where: { OR: Array<Record<string, string>> } }) =>
              treffer(where).sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()),
            create: async ({ data }: { data: Partial<Rad> }) => {
              const rad: Rad = {
                id: "pay-1",
                stripePaymentIntentId: null,
                stripeSessionId: null,
                stripeInvoiceId: null,
                stripeChargeId: null,
                stripeCustomerId: null,
                status: "PENDING",
                amountOre: 0,
                amountRefundedOre: 0,
                currency: "nok",
                type: "OTHER",
                userId: null,
                bookingId: null,
                subscriptionId: null,
                description: null,
                paidAt: null,
                refundedAt: null,
                metadata: {},
                createdAt: new Date("2026-09-12T10:00:00Z"),
                ...data,
              };
              rader.push(rad);
              return rad;
            },
            update: async ({
              where,
              data,
            }: {
              where: { id: string };
              data: Partial<Rad>;
            }) => {
              const i = rader.findIndex((r) => r.id === where.id);
              rader[i] = { ...rader[i]!, ...data };
              return rader[i];
            },
          },
        }),
    },
  },
});

async function save() {
  return (await import("./save")).savePayment;
}

test.beforeEach(() => {
  rader = [];
});

test("session først og intent etterpå slås sammen til én rad", async () => {
  const fn = await save();
  await fn({
    stripeSessionId: "cs_1",
    amountOre: 10000,
    currency: "nok",
    status: "PENDING",
    type: "BOOKING",
  });
  await fn({
    stripeSessionId: "cs_1",
    stripePaymentIntentId: "pi_1",
    amountOre: 10000,
    currency: "nok",
    status: "SUCCEEDED",
    type: "BOOKING",
  });
  assert.equal(rader.length, 1);
  assert.equal(rader[0]?.stripeSessionId, "cs_1");
  assert.equal(rader[0]?.stripePaymentIntentId, "pi_1");
  assert.equal(rader[0]?.status, "SUCCEEDED");
});

test("refusjon etter suksess senker ikke status og øker refundert beløp", async () => {
  const fn = await save();
  await fn({
    stripePaymentIntentId: "pi_1",
    amountOre: 10000,
    currency: "nok",
    status: "SUCCEEDED",
    type: "BOOKING",
  });
  await fn({
    stripePaymentIntentId: "pi_1",
    stripeChargeId: "ch_1",
    amountOre: 10000,
    amountRefundedOre: 10000,
    currency: "nok",
    status: "REFUNDED",
    type: "BOOKING",
    refundedAt: new Date("2026-09-12T12:00:00Z"),
  });
  assert.equal(rader.length, 1);
  assert.equal(rader[0]?.status, "REFUNDED");
  assert.equal(rader[0]?.amountRefundedOre, 10000);
  assert.equal(rader[0]?.stripeChargeId, "ch_1");
});

test("eldre PENDING etter SUCCEEDED overskriver ikke beløp eller status", async () => {
  const fn = await save();
  await fn({
    stripePaymentIntentId: "pi_1",
    amountOre: 10000,
    currency: "nok",
    status: "SUCCEEDED",
    type: "BOOKING",
  });
  await fn({
    stripePaymentIntentId: "pi_1",
    amountOre: 1,
    currency: "nok",
    status: "PENDING",
    type: "BOOKING",
  });
  assert.equal(rader[0]?.status, "SUCCEEDED");
  assert.equal(rader[0]?.amountOre, 10000);
});

test("motstridende Stripe-identiteter avvises", async () => {
  const fn = await save();
  await fn({
    stripePaymentIntentId: "pi_1",
    stripeSessionId: "cs_1",
    amountOre: 10000,
    currency: "nok",
    status: "SUCCEEDED",
    type: "BOOKING",
  });
  await assert.rejects(
    () =>
      fn({
        stripePaymentIntentId: "pi_1",
        stripeSessionId: "cs_annen",
        amountOre: 10000,
        currency: "nok",
        status: "SUCCEEDED",
        type: "BOOKING",
      }),
    /motstridende Stripe-identiteter/,
  );
});
