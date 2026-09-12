/**
 * R-I: kaller bekreftSkoletidAction. Forelder kan bare bekrefte egne barn.
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

let bruker = { id: "forelder-a", role: "PARENT" as const };
let barnIder = ["barn-a"];
let skrevet = 0;

mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });
mock.module("next/navigation", {
  namedExports: {
    redirect: (to: string) => {
      throw new Error(`REDIRECT:${to}`);
    },
  },
});
mock.module("@/lib/auth/requirePortalUser", {
  namedExports: { requirePortalUser: async () => bruker },
});
mock.module("@/lib/forelder", {
  namedExports: {
    hentBarnForForelder: async () => barnIder.map((id) => ({ child: { id } })),
  },
});
mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      skoletidBekreftelse: {
        upsert: async () => {
          skrevet += 1;
          return {};
        },
      },
    },
  },
});

async function action() {
  return (await import("./skoletid-actions")).bekreftSkoletidAction;
}

test.beforeEach(() => {
  bruker = { id: "forelder-a", role: "PARENT" };
  barnIder = ["barn-a"];
  skrevet = 0;
});

test("bekreftSkoletidAction avviser andres barn og skriver ingenting", async () => {
  const fn = await action();
  const svar = await fn("barn-b");
  assert.equal(svar.ok, false);
  assert.match(svar.melding, /egne barn/);
  assert.equal(skrevet, 0);
});

test("bekreftSkoletidAction lagrer for eget barn", async () => {
  const fn = await action();
  const svar = await fn("barn-a");
  assert.equal(svar.ok, true);
  assert.equal(skrevet, 1);
});
