/**
 * R-I fortsettelse: profilskriving krever spillerrolle.
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

let rolle = "PLAYER";
let profilSkrevet = 0;

mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });
mock.module("@/lib/auth/action-guards", {
  namedExports: {
    requireSpillerActionUser: async () => {
      if (rolle !== "PLAYER" && rolle !== "COACH" && rolle !== "ADMIN") {
        throw new Error("forbidden");
      }
      return { id: "spiller-a", role: rolle };
    },
  },
});
mock.module("@/app/portal/meg/actions", {
  namedExports: {
    oppdaterProfil: async () => {
      profilSkrevet += 1;
    },
  },
});

async function action() {
  return (await import("./actions")).lagreProfil;
}

const gyldig = {
  navn: "Øyvind Rohjan",
  fodselsdato: null,
  hjemmeklubb: null,
  maalTekst: null,
  mobil: null,
};

test.beforeEach(() => {
  rolle = "PLAYER";
  profilSkrevet = 0;
});

test("lagreProfil avviser forelder uten skriving", async () => {
  rolle = "PARENT";
  const fn = await action();
  await assert.rejects(() => fn(gyldig), /forbidden/);
  assert.equal(profilSkrevet, 0);
});

test("lagreProfil skriver for spiller", async () => {
  const fn = await action();
  const svar = await fn(gyldig);
  assert.equal(svar.ok, true);
  assert.equal(profilSkrevet, 1);
});
