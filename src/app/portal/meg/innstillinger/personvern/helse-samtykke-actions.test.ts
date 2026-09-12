/**
 * R-J: spillerens eget helsesamtykke. Ingen userId-parameter.
 * Mindreårig SELV-gi avvises i regel-laget; tilbaketrekking skriver.
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

let bruker = { id: "spiller-a", role: "PLAYER" as string };
let registrert: Array<Record<string, unknown>> = [];
let kaster: Error | null = null;

mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });
mock.module("@/lib/auth/action-guards", {
  namedExports: {
    requireSpillerActionUser: async () => {
      if (bruker.role !== "PLAYER" && bruker.role !== "COACH" && bruker.role !== "ADMIN") {
        throw new Error("forbidden");
      }
      return bruker;
    },
  },
});
mock.module("@/lib/health/samtykke", {
  namedExports: {
    registrerHelseSamtykke: async (input: Record<string, unknown>) => {
      if (kaster) throw kaster;
      registrert.push(input);
    },
  },
});

async function actions() {
  return import("./helse-samtykke-actions");
}

test.beforeEach(() => {
  bruker = { id: "spiller-a", role: "PLAYER" };
  registrert = [];
  kaster = null;
});

test("settEgetHelseSamtykke avviser ukjent type uten skriving", async () => {
  const { settEgetHelseSamtykke } = await actions();
  const svar = await settEgetHelseSamtykke("UKJENT", true);
  assert.equal(svar.ok, false);
  if (!svar.ok) assert.match(svar.feil, /Ukjent/);
  assert.equal(registrert.length, 0);
});

test("settEgetHelseSamtykke avviser forelder-rolle", async () => {
  bruker = { id: "forelder-a", role: "PARENT" };
  const { settEgetHelseSamtykke } = await actions();
  await assert.rejects(() => settEgetHelseSamtykke("MANUELL_HELSE", true), /forbidden/);
  assert.equal(registrert.length, 0);
});

test("settEgetHelseSamtykke skriver kun innlogget spiller som SELV", async () => {
  const { settEgetHelseSamtykke } = await actions();
  const svar = await settEgetHelseSamtykke("MANUELL_HELSE", true);
  assert.equal(svar.ok, true);
  assert.equal(registrert.length, 1);
  assert.equal(registrert[0]?.userId, "spiller-a");
  assert.equal(registrert[0]?.gittAvUserId, "spiller-a");
  assert.equal(registrert[0]?.gittAvRolle, "SELV");
  assert.equal(registrert[0]?.gitt, true);
});

test("settEgetHelseSamtykke viser regel-feil uten å late som lagret", async () => {
  kaster = new Error("Du er under 16 år, så en foresatt må godkjenne dette for deg.");
  const { settEgetHelseSamtykke } = await actions();
  const svar = await settEgetHelseSamtykke("WEARABLE_HELSE", true);
  assert.equal(svar.ok, false);
  if (!svar.ok) assert.match(svar.feil, /under 16/);
  assert.equal(registrert.length, 0);
});
