import assert from "node:assert/strict";
import { mock, test } from "node:test";
let innlogget = false;
let kall: unknown[] = [];
mock.module("@/lib/auth/getCurrentUser", { namedExports: { getCurrentUserRaw: async () => innlogget ? { id: "innlogget-test" } : null } });
mock.module("@/lib/gdpr/kontoavtale/register", { namedExports: {
  registrerEgenKontoAvtale: async (...args: unknown[]) => { kall = args; return { ok: true }; },
} });
test("handlingen krever innlogging og bruker serverens identitet", async () => {
  const { bekreftEgenKontoAvtale } = await import("./kontoavtale-actions");
  assert.equal((await bekreftEgenKontoAvtale({})).ok, false);
  assert.equal(kall.length, 0);
  innlogget = true;
  const input = { userId: "forsøkt-annen-konto" };
  await bekreftEgenKontoAvtale(input);
  assert.deepEqual(kall, ["innlogget-test", input]);
});
