/**
 * R-I fortsettelse: profilskriving krever spillerrolle.
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

let rolle = "PLAYER";
let profilSkrevet = 0;
let fodselsdato: Date | null = null;

mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });
mock.module("@/lib/auth/action-guards", {
  namedExports: {
    requireSpillerActionUser: async () => {
      if (rolle !== "PLAYER" && rolle !== "COACH" && rolle !== "ADMIN") {
        throw new Error("forbidden");
      }
      return { id: "spiller-a", role: rolle, dateOfBirth: fodselsdato };
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
  fodselsdato = null;
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

// D-63/TP-02: spilleren kan sette fødselsdatoen én gang, aldri endre den.
test("lagreProfil setter fødselsdato når den mangler", async () => {
  const fn = await action();
  const svar = await fn({ ...gyldig, fodselsdato: "2012-03-04" });
  assert.equal(svar.ok, true);
  assert.equal(profilSkrevet, 1);
});

test("lagreProfil avviser ny fødselsdato når den er satt", async () => {
  fodselsdato = new Date(Date.UTC(2012, 2, 4));
  const fn = await action();
  const svar = await fn({ ...gyldig, fodselsdato: "1990-03-04" });
  assert.equal(svar.ok, false);
  assert.equal(profilSkrevet, 0);
});

test("lagreProfil godtar samme fødselsdato som før", async () => {
  fodselsdato = new Date(Date.UTC(2012, 2, 4));
  const fn = await action();
  const svar = await fn({ ...gyldig, fodselsdato: "2012-03-04" });
  assert.equal(svar.ok, true);
  assert.equal(profilSkrevet, 1);
});
