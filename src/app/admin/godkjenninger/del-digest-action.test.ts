/**
 * R-I: admin/godkjenninger/del-digest-action.ts. «Deler kun med spillere
 * coachen faktisk har — samme scope som køen selv» (`coachScopedPlayerWhere`).
 * Testen dekker rollegrensen, at en coach uten spillere i scope får en
 * eksplisitt feilmelding uten å kalle delingsfunksjonen, og entall/flertall-
 * formuleringen i svaret (0/1/flere delt).
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

type Rolle = "PLAYER" | "COACH" | "ADMIN" | "PARENT";

let bruker: { id: string; role: Rolle; name: string } | null = {
  id: "coach-a",
  role: "COACH",
  name: "Coach A",
};

/** Spillere i coach-a sitt scope (mocket coachScopedPlayerWhere-resultat). */
let coachensSpillere: string[] = ["spiller-a", "spiller-b"];
/** Antall delUkesdigest skal late som ble faktisk delt med. */
let delAntall = 2;

let delKall: Array<{ coachId: string; spillerIds: string[] }> = [];

function nullstill() {
  bruker = { id: "coach-a", role: "COACH", name: "Coach A" };
  coachensSpillere = ["spiller-a", "spiller-b"];
  delAntall = 2;
  delKall = [];
}

mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });
mock.module("@/lib/auth/requirePortalUser", {
  namedExports: {
    requirePortalUser: async (options: { allow?: Rolle | Rolle[] }) => {
      if (!bruker) throw new Error("NEXT_REDIRECT");
      const tillatt = Array.isArray(options.allow) ? options.allow : options.allow ? [options.allow] : undefined;
      if (tillatt && !tillatt.includes(bruker.role)) throw new Error("NEXT_REDIRECT");
      return bruker;
    },
  },
});
mock.module("@/lib/auth/coached", {
  namedExports: {
    coachScopedPlayerWhere: (coach: { id: string }) => ({ __coach: coach.id }),
  },
});
mock.module("@/lib/admin/ukesrapport-deling", {
  namedExports: {
    delUkesdigest: async (coachId: string, spillerIds: string[]) => {
      delKall.push({ coachId, spillerIds });
      return delAntall;
    },
  },
});
const prismaMock: Record<string, unknown> = {};
mock.module("@/lib/prisma", { namedExports: { prisma: prismaMock } });
Object.assign(prismaMock, {
  user: {
    findMany: async () => coachensSpillere.map((id) => ({ id })),
  },
});

async function actions() {
  return import("./del-digest-action");
}

test.beforeEach(() => {
  nullstill();
});

test("delUkesdigestAction avviser PLAYER uten å dele", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { delUkesdigestAction } = await actions();
  await assert.rejects(() => delUkesdigestAction());
  assert.equal(delKall.length, 0);
});

test("delUkesdigestAction avviser uinnlogget uten å dele", async () => {
  bruker = null;
  const { delUkesdigestAction } = await actions();
  await assert.rejects(() => delUkesdigestAction());
  assert.equal(delKall.length, 0);
});

test("delUkesdigestAction avviser når coachen ikke har spillere i scope", async () => {
  coachensSpillere = [];
  const { delUkesdigestAction } = await actions();
  const svar = await delUkesdigestAction();
  assert.equal(svar.ok, false);
  assert.equal(svar.antall, 0);
  assert.match(svar.melding, /ingen spillere/);
  assert.equal(delKall.length, 0);
});

test("delUkesdigestAction deler kun med coachens egne spillere", async () => {
  const { delUkesdigestAction } = await actions();
  await delUkesdigestAction();
  assert.equal(delKall.length, 1);
  assert.equal(delKall[0]?.coachId, "coach-a");
  assert.deepEqual(delKall[0]?.spillerIds.sort(), ["spiller-a", "spiller-b"]);
});

test("delUkesdigestAction bruker entall for én delt spiller", async () => {
  delAntall = 1;
  const { delUkesdigestAction } = await actions();
  const svar = await delUkesdigestAction();
  assert.equal(svar.ok, true);
  assert.match(svar.melding, /1 spiller\./);
});

test("delUkesdigestAction bruker flertall for flere delte spillere", async () => {
  delAntall = 2;
  const { delUkesdigestAction } = await actions();
  const svar = await delUkesdigestAction();
  assert.equal(svar.ok, true);
  assert.match(svar.melding, /2 spillere\./);
});

test("delUkesdigestAction melder «allerede delt» når ingen fikk den på nytt", async () => {
  delAntall = 0;
  const { delUkesdigestAction } = await actions();
  const svar = await delUkesdigestAction();
  assert.equal(svar.ok, true);
  assert.equal(svar.antall, 0);
  assert.match(svar.melding, /allerede delt/);
});
