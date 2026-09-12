import assert from "node:assert/strict";
import { mock, test } from "node:test";

const writes: Array<{ data: Record<string, unknown> }> = [];
let createFeiler = false;

mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      errorLog: {
        create: async (args: { data: Record<string, unknown> }) => {
          if (createFeiler) {
            throw new Error(
              "connect postgresql://produser:SuperHemmeligPassord@db.supabase.co:5432/postgres",
            );
          }
          writes.push(args);
          return { id: "log-1" };
        },
      },
    },
  },
});

mock.module("./slack-alert", {
  namedExports: {
    sendSlackAlert: async () => undefined,
  },
});

async function last() {
  return import("./error-tracking");
}

const EPOST = "anders@akgolf.no";
const DB_URL =
  "postgresql://produser:SuperHemmeligPassord@db.dcnxoztjtdqoidaekxry.supabase.co:5432/postgres";
const STRIPE = "sk_test_51HemmeligNokkelXYZABC";

function lekkasje(s: string): string[] {
  return [EPOST, DB_URL, STRIPE, "SuperHemmeligPassord"].filter((h) =>
    s.includes(h),
  );
}

test("logError skriver sanitert melding og meta uten hemmeligheter", async () => {
  writes.length = 0;
  const logs: string[] = [];
  const orig = console.error;
  console.error = (...args: unknown[]) => {
    logs.push(args.map((a) => (typeof a === "string" ? a : JSON.stringify(a))).join(" "));
  };
  const { logError } = await last();
  try {
    await logError({
      context: "stripe.webhook",
      error: new Error(`Betaling feilet for ${EPOST} ${DB_URL} ${STRIPE}`),
      meta: {
        email: EPOST,
        password: "passord-verdi-xyz",
        stripeSecretKey: STRIPE,
        DATABASE_URL: DB_URL,
        bookingId: "bk_ok",
      },
      severity: "error",
    });
  } finally {
    console.error = orig;
  }
  const dump = JSON.stringify({ writes, logs });
  assert.deepEqual(lekkasje(dump), []);
  assert.equal(dump.includes("passord-verdi-xyz"), false);
  assert.equal(writes.length, 1);
  assert.equal((writes[0].data.meta as { bookingId: string }).bookingId, "bk_ok");
  assert.match(String(writes[0].data.message), /e-post-fjernet|db-url-fjernet|nøkkel-fjernet/);
});

test("logError tåler at ErrorLog-skriving feiler uten å lekke db-url", async () => {
  createFeiler = true;
  const logs: string[] = [];
  const orig = console.error;
  console.error = (...args: unknown[]) => {
    logs.push(args.map(String).join(" "));
  };
  const { logError } = await last();
  try {
    await logError({
      context: "test.db",
      error: new Error("ordinær feil"),
      severity: "warn",
    });
  } finally {
    console.error = orig;
    createFeiler = false;
  }
  const dump = logs.join("\n");
  assert.match(dump, /ErrorLog write failed/);
  assert.deepEqual(lekkasje(dump), []);
});

test("tryLog returnerer null ved feil og logger sanitert", async () => {
  writes.length = 0;
  const { tryLog } = await last();
  const orig = console.error;
  console.error = () => undefined;
  try {
    const resultat = await tryLog("test.try", async () => {
      throw new Error(`nøkkel ${STRIPE}`);
    });
    assert.equal(resultat, null);
  } finally {
    console.error = orig;
  }
  assert.equal(writes.length, 1);
  assert.deepEqual(lekkasje(JSON.stringify(writes)), []);
});
