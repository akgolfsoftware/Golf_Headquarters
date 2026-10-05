import assert from "node:assert/strict";
import { mock, test } from "node:test";
import Stripe from "stripe";

const signingSecret = "whsec_synthetic_codebase_audit";
const stripe = new Stripe("sk_test_synthetic_codebase_audit");
const event = { id: "evt_synthetic_audit", object: "event", type: "payment_intent.succeeded",
  data: { object: { id: "pi_synthetic_audit" } } };
let handlerFeiler = false;
let koFeiler = false;
let dedupFeiler = false;
let loggerFeiler = false;
let behandlinger = 0;
let koSkrivinger: Array<{ create: { errorMessage: string }; update: { errorMessage: string } }> = [];
let kvitteringer = new Set<string>();
let verifiseringer = 0;
const tidligereSecret = process.env.STRIPE_WEBHOOK_SECRET;

mock.module("@/lib/stripe", { namedExports: { stripeKlient: () => ({ webhooks: {
  constructEvent: (body: string, sig: string, secret: string) => {
    verifiseringer++;
    return stripe.webhooks.constructEvent(body, sig, secret);
  },
} }) } });
mock.module("@/lib/stripe/handle-event", { namedExports: {
  markerBehandlet: async (id: string) => {
    if (dedupFeiler) throw new Error("Syntetisk dedup-feil");
    if (kvitteringer.has(id)) return false;
    kvitteringer.add(id);
    return true;
  },
  angreBehandlet: async (id: string) => { kvitteringer.delete(id); },
  handleStripeEvent: async () => {
    behandlinger++;
    if (handlerFeiler) throw new Error("Syntetisk feil for spiller@example.invalid");
  },
} });
mock.module("@/lib/prisma", { namedExports: { prisma: { webhookFailure: {
  upsert: async (input: { create: { errorMessage: string }; update: { errorMessage: string } }) => {
    if (koFeiler) throw new Error("Syntetisk køfeil");
    koSkrivinger.push(input);
  },
} } } });
mock.module("@/lib/error-tracking", { namedExports: { logError: async () => {
  if (loggerFeiler) throw new Error("Syntetisk loggfeil");
} } });

function request(tuklet = false): Request {
  const body = JSON.stringify(event);
  const signature = stripe.webhooks.generateTestHeaderString({ payload: body, secret: signingSecret });
  return new Request("http://localhost/api/stripe/webhook", { method: "POST",
    body: tuklet ? `${body} ` : body, headers: { "stripe-signature": signature },
  });
}

test.beforeEach(() => {
  process.env.STRIPE_WEBHOOK_SECRET = signingSecret;
  handlerFeiler = koFeiler = dedupFeiler = loggerFeiler = false;
  behandlinger = verifiseringer = 0;
  koSkrivinger = [];
  kvitteringer = new Set();
});
test.after(() => {
  if (tidligereSecret === undefined) delete process.env.STRIPE_WEBHOOK_SECRET;
  else process.env.STRIPE_WEBHOOK_SECRET = tidligereSecret;
});

test("gyldig Stripe-signatur behandles uten køplass", async () => {
  const { POST } = await import("./route");
  const res = await POST(request());
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { received: true });
  assert.equal(behandlinger, 1);
  assert.equal(koSkrivinger.length, 0);
});

test("tuklet rå body avvises uten detaljert signaturfeil eller sideeffekter", async () => {
  const { POST } = await import("./route");
  const res = await POST(request(true));
  assert.equal(res.status, 400);
  assert.deepEqual(await res.json(), { error: "bad-signature" });
  assert.equal(behandlinger, 0);
  assert.equal(koSkrivinger.length, 0);
});

test("manglende signatur eller konfigurasjon stopper før behandling", async () => {
  const { POST } = await import("./route");
  const utenSignatur = await POST(new Request("http://localhost", { method: "POST", body: "{}" }));
  assert.equal(utenSignatur.status, 400);
  delete process.env.STRIPE_WEBHOOK_SECRET;
  assert.equal((await POST(request())).status, 500);
  assert.equal(verifiseringer, 0);
  assert.equal(behandlinger, 0);
});

test("duplikat behandles ikke på nytt", async () => {
  const { POST } = await import("./route");
  await POST(request());
  const res = await POST(request());
  assert.deepEqual(await res.json(), { received: true, duplicate: true });
  assert.equal(behandlinger, 1);
});

test("behandlingsfeil kvitteres bare etter lagret køplass; feiltekst anonymiseres", async () => {
  handlerFeiler = true;
  const { POST } = await import("./route");
  const res = await POST(request());
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { received: true, queued: true });
  assert.equal(koSkrivinger.length, 1);
  assert.ok(!koSkrivinger[0].create.errorMessage.includes("spiller@example.invalid"));
  assert.ok(!koSkrivinger[0].update.errorMessage.includes("spiller@example.invalid"));
  assert.equal(kvitteringer.size, 0);
});

test("feil i både behandling og kø gir 503 og kan leveres på nytt", async () => {
  handlerFeiler = koFeiler = true;
  const { POST } = await import("./route");
  const res = await POST(request());
  assert.equal(res.status, 503);
  assert.deepEqual(await res.json(), { error: "retry-storage-unavailable" });
  assert.equal(koSkrivinger.length, 0);
  assert.equal(kvitteringer.size, 0);
  handlerFeiler = koFeiler = false;
  const nyLevering = await POST(request());
  assert.equal(nyLevering.status, 200);
  assert.deepEqual(await nyLevering.json(), { received: true });
  assert.equal(behandlinger, 2);
});

test("feil i dedup og kø gir 503 uten å behandle betalingen", async () => {
  dedupFeiler = koFeiler = true;
  const { POST } = await import("./route");
  assert.equal((await POST(request())).status, 503);
  assert.equal(behandlinger, 0);
});

test("feilloggens eget bortfall skjuler ikke behovet for ny levering", async () => {
  handlerFeiler = koFeiler = loggerFeiler = true;
  const { POST } = await import("./route");
  assert.equal((await POST(request())).status, 503);
});
