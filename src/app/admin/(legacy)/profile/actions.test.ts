/**
 * R-I: admin/(legacy)/profile/actions.ts. `oppdaterCoachProfil` oppdaterer
 * ALLTID den innloggede coachens egen bruker (`me.id` fra
 * `requireCoachActionUser`, ingen ekstern id fra klienten) — vernet er
 * derfor rollegrensen og valideringen, ikke et eierskapslag. Testen dekker
 * feltvalidering (navn, e-post, bio, hcp), at e-post som allerede er tatt
 * av en ANNEN bruker avvises, og at eksisterende `preferences`-JSON slås
 * sammen med de nye chip-feltene i stedet for å overskrives.
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

type Rolle = "PLAYER" | "COACH" | "ADMIN" | "PARENT";

let bruker: { id: string; role: Rolle; name: string } | null = {
  id: "coach-a",
  role: "COACH",
  name: "Coach A",
};

const brukere: Record<string, { id: string; email: string; preferences: unknown }> = {
  "coach-a": { id: "coach-a", email: "coach-a@example.com", preferences: { tema: "mork" } },
  "coach-b": { id: "coach-b", email: "opptatt@example.com", preferences: null },
};

let userUpdates: Array<{ id: string; data: Record<string, unknown> }> = [];
let auditWrites: Array<{ action: string; target: string }> = [];

function nullstill() {
  bruker = { id: "coach-a", role: "COACH", name: "Coach A" };
  userUpdates = [];
  auditWrites = [];
}

function formData(felter: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(felter)) fd.set(k, v);
  return fd;
}

mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });
mock.module("@/lib/auth/action-guards", {
  namedExports: {
    requireCoachActionUser: async () => {
      if (!bruker) throw new Error("unauthenticated");
      if (bruker.role !== "COACH" && bruker.role !== "ADMIN") throw new Error("forbidden");
      return bruker;
    },
  },
});
mock.module("@/lib/audit", {
  namedExports: {
    audit: async (input: { action: string; target: string }) => {
      auditWrites.push(input);
    },
  },
});
const prismaMock: Record<string, unknown> = {};
mock.module("@/lib/prisma", { namedExports: { prisma: prismaMock } });
Object.assign(prismaMock, {
  user: {
    findFirst: async ({ where }: { where: { email: string; NOT: { id: string } } }) =>
      Object.values(brukere).find((u) => u.email === where.email && u.id !== where.NOT.id) ?? null,
    findUnique: async ({ where }: { where: { id: string } }) => {
      const u = brukere[where.id];
      return u ? { preferences: u.preferences } : null;
    },
    update: async ({ where, data }: { where: { id: string }; data: Record<string, unknown> }) => {
      userUpdates.push({ id: where.id, data });
      return { id: where.id };
    },
  },
});

async function actions() {
  return import("./actions");
}

const gyldigSkjema = {
  navn: "Coach Coachson",
  epost: "coach-a@example.com",
  phone: "12345678",
  homeClub: "Fredrikstad GK",
  hcp: "5.4",
  bio: "En kort bio",
  certifications: "PGA, EGF",
  languages: "norsk, engelsk",
  clubs: "Fredrikstad GK",
};

test.beforeEach(() => {
  nullstill();
});

test("oppdaterCoachProfil avviser PLAYER uten å skrive", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { oppdaterCoachProfil } = await actions();
  await assert.rejects(() => oppdaterCoachProfil(formData(gyldigSkjema)));
  assert.equal(userUpdates.length, 0);
});

test("oppdaterCoachProfil avviser uinnlogget uten å skrive", async () => {
  bruker = null;
  const { oppdaterCoachProfil } = await actions();
  await assert.rejects(() => oppdaterCoachProfil(formData(gyldigSkjema)));
  assert.equal(userUpdates.length, 0);
});

test("oppdaterCoachProfil avviser for kort navn", async () => {
  const { oppdaterCoachProfil } = await actions();
  const svar = await oppdaterCoachProfil(formData({ ...gyldigSkjema, navn: "A" }));
  assert.equal(svar.ok, false);
  assert.ok(svar.fieldErrors?.navn);
  assert.equal(userUpdates.length, 0);
});

test("oppdaterCoachProfil avviser ugyldig e-post", async () => {
  const { oppdaterCoachProfil } = await actions();
  const svar = await oppdaterCoachProfil(formData({ ...gyldigSkjema, epost: "ikke-en-epost" }));
  assert.equal(svar.ok, false);
  assert.ok(svar.fieldErrors?.epost);
  assert.equal(userUpdates.length, 0);
});

test("oppdaterCoachProfil avviser for lang bio", async () => {
  const { oppdaterCoachProfil } = await actions();
  const svar = await oppdaterCoachProfil(formData({ ...gyldigSkjema, bio: "x".repeat(281) }));
  assert.equal(svar.ok, false);
  assert.ok(svar.fieldErrors?.bio);
});

test("oppdaterCoachProfil avviser ugyldig handicap", async () => {
  const { oppdaterCoachProfil } = await actions();
  const svar = await oppdaterCoachProfil(formData({ ...gyldigSkjema, hcp: "ikke-tall" }));
  assert.equal(svar.ok, false);
  assert.ok(svar.fieldErrors?.hcp);
});

test("oppdaterCoachProfil avviser e-post som allerede er tatt av en annen bruker", async () => {
  const { oppdaterCoachProfil } = await actions();
  const svar = await oppdaterCoachProfil(formData({ ...gyldigSkjema, epost: "opptatt@example.com" }));
  assert.equal(svar.ok, false);
  assert.ok(svar.fieldErrors?.epost);
  assert.equal(userUpdates.length, 0);
});

test("oppdaterCoachProfil oppdaterer kun egen bruker for COACH", async () => {
  const { oppdaterCoachProfil } = await actions();
  const svar = await oppdaterCoachProfil(formData(gyldigSkjema));
  assert.equal(svar.ok, true);
  assert.equal(userUpdates.length, 1);
  assert.equal(userUpdates[0]?.id, "coach-a");
  assert.equal(auditWrites.at(-1)?.action, "coach.profile.updated");
});

test("oppdaterCoachProfil slår sammen eksisterende preferences med nye chip-felt", async () => {
  const { oppdaterCoachProfil } = await actions();
  await oppdaterCoachProfil(formData(gyldigSkjema));
  const prefs = userUpdates[0]?.data.preferences as Record<string, unknown>;
  assert.equal(prefs.tema, "mork"); // bevart fra eksisterende
  assert.deepEqual(prefs.certifications, ["PGA", "EGF"]);
  assert.deepEqual(prefs.languages, ["norsk", "engelsk"]);
});
