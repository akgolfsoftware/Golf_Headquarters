/**
 * Gavekort (bookingplanen steg 7): kjøpet. Betalt Stripe-økt gir ett gavekort og én e-post med koden;
 * en gjentatt levering av samme event lager ikke et nytt kort og sender ikke koden to ganger.
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

type Kort = Record<string, unknown> & { stripeCheckoutSessionId: string; emailSentAt: Date | null; expiresAt: Date };
let kort: Kort[] = [];
let sendt: Array<{ to: string; subject: string; html: string }> = [];
let sendeFeil = false;

mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      giftCard: {
        upsert: async ({ where, create }: { where: { stripeCheckoutSessionId: string }; create: Record<string, unknown> }) => {
          const finnes = kort.find((k) => k.stripeCheckoutSessionId === where.stripeCheckoutSessionId);
          if (finnes) return finnes;
          const ny = { ...create, emailSentAt: null } as Kort;
          kort.push(ny);
          return ny;
        },
        updateMany: async ({ where, data }: { where: { stripeCheckoutSessionId: string; emailSentAt?: null }; data: { emailSentAt: Date | null } }) => {
          const k = kort.find((x) => x.stripeCheckoutSessionId === where.stripeCheckoutSessionId && (where.emailSentAt === undefined || x.emailSentAt === null));
          if (!k) return { count: 0 };
          k.emailSentAt = data.emailSentAt;
          return { count: 1 };
        },
        findUniqueOrThrow: async ({ where }: { where: { stripeCheckoutSessionId: string } }) => kort.find((x) => x.stripeCheckoutSessionId === where.stripeCheckoutSessionId)!,
      },
    },
  },
});
mock.module("@/lib/email", {
  namedExports: {
    FRA_EPOST: "test@example.invalid",
    resendKlient: () => ({
      emails: {
        send: async (m: { to: string; subject: string; html: string }) => {
          if (sendeFeil) return { error: { message: "nei" } };
          sendt.push(m);
          return { error: null };
        },
      },
    }),
  },
});
mock.module("@/lib/error-tracking", { namedExports: { logError: async () => undefined } });

const session = (over: Record<string, unknown> = {}, meta: Record<string, string> = {}) =>
  ({
    id: "cs_test_gave1", payment_status: "paid", currency: "nok", amount_total: 100_000, customer_details: null,
    metadata: { gavekort: "1", gavekortOre: "100000", kjoperEpost: "kjoper@example.invalid", kjoperNavn: "Kari", ...meta },
    ...over,
  }) as never;

test.beforeEach(() => {
  kort = [];
  sendt = [];
  sendeFeil = false;
  process.env.CRON_SECRET = "test-cron-secret-som-er-lang-nok-123";
});

test("betalt økt gir ett gavekort med full saldo, 3 års frist, og koden i e-posten (aldri lagret i klartekst)", async () => {
  const { opprettGavekortFraSession } = await import("./gavekort-kjop");
  const { normaliserGavekode, hashGavekode } = await import("./gavekort");
  await opprettGavekortFraSession(session());
  assert.equal(kort.length, 1);
  assert.equal(kort[0].initialOre, 100_000);
  assert.equal(kort[0].balanceOre, 100_000);
  assert.ok((kort[0].expiresAt.getTime() - Date.now()) / 86_400_000 > 3 * 365 - 2);
  assert.equal(sendt.length, 1);
  assert.equal(sendt[0].to, "kjoper@example.invalid");
  const kode = /([0-9A-HJKMNP-TV-Z]{4}(?:-[0-9A-HJKMNP-TV-Z]{4}){3})/.exec(sendt[0].html)?.[1];
  assert.ok(kode, "koden står i e-posten");
  assert.equal(hashGavekode(normaliserGavekode(kode)!), kort[0].codeHash);
  assert.ok(!JSON.stringify(kort[0]).includes(kode.replace(/-/g, "")), "klartekstkoden lagres ikke");
});

test("gjentatt levering lager ikke nytt kort og sender ikke koden to ganger", async () => {
  const { opprettGavekortFraSession } = await import("./gavekort-kjop");
  await opprettGavekortFraSession(session());
  await opprettGavekortFraSession(session());
  assert.equal(kort.length, 1);
  assert.equal(sendt.length, 1);
});

test("gave til en annen: koden går til mottakeren, kjøperen får kvittering uten kode", async () => {
  const { opprettGavekortFraSession } = await import("./gavekort-kjop");
  await opprettGavekortFraSession(session({}, { mottakerEpost: "mottaker@example.invalid", melding: "Gratulerer!" }));
  assert.equal(sendt.length, 2);
  assert.equal(sendt[0].to, "mottaker@example.invalid");
  assert.ok(sendt[0].html.includes("Gratulerer!"));
  assert.equal(sendt[1].to, "kjoper@example.invalid");
  assert.ok(!/[0-9A-Z]{4}-[0-9A-Z]{4}-[0-9A-Z]{4}-[0-9A-Z]{4}/.test(sendt[1].html), "ingen kode i kvitteringen");
});

test("e-postfeil gir feil (webhooken prøver igjen), og neste forsøk sender", async () => {
  const { opprettGavekortFraSession } = await import("./gavekort-kjop");
  sendeFeil = true;
  await assert.rejects(() => opprettGavekortFraSession(session()));
  assert.equal(kort.length, 1);
  sendeFeil = false;
  await opprettGavekortFraSession(session());
  assert.equal(kort.length, 1);
  assert.equal(sendt.length, 1);
});

test("ubetalt økt og beløp som ikke stemmer, gir ikke gavekort", async () => {
  const { opprettGavekortFraSession } = await import("./gavekort-kjop");
  await opprettGavekortFraSession(session({ payment_status: "unpaid" }));
  assert.equal(kort.length, 0);
  await assert.rejects(() => opprettGavekortFraSession(session({ amount_total: 5_000 })));
  await assert.rejects(() => opprettGavekortFraSession(session({}, { gavekortOre: "100050" })));
  assert.equal(kort.length, 0);
});
