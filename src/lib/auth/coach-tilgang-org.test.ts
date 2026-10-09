/**
 * PR 1a (TO-01, TO-02, TO-15): WANG-/Team Norway-trenere får ikke innsyn eller
 * skriverett via gruppemedlemskap. Lesing krever uttrykkelig deling (D-04),
 * skriving krever egen coach-relasjon (D-25, D-49). Gruppas trener kan
 * fortsatt endre gruppeplanen, men ikke rulle ut i spillernes egne planer.
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

type Where = Record<string, unknown>;

/** Hvilke spillere databasen «finner» for et gitt where — styres per test. */
let finnSpiller: (where: Where) => boolean = () => false;
let invitasjoner: { mottakerGruppeId: string }[] = [];
let delteGrupper = new Set<string>();
const delingssjekker: string[] = [];

mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      user: {
        findFirst: async ({ where }: { where: Where }) => (finnSpiller(where) ? { id: "spiller-1" } : null),
      },
      trenerDelingsInvitasjon: { findMany: async () => invitasjoner },
    },
  },
});
mock.module("@/lib/deling/profil-lesing", {
  namedExports: {
    medNavngittProfil: async (trenerId: string, spillerId: string, gruppeId: string, les: () => Promise<boolean>) => {
      delingssjekker.push(`${trenerId}:${spillerId}:${gruppeId}`);
      return delteGrupper.has(gruppeId) ? les() : null;
    },
  },
});

/** Finnes gren 3 (trener-medlemskap) i where-treet? Da er det lese-scopet. */
function harMedlemskapsgren(where: Where): boolean {
  return JSON.stringify(where).includes("\"members\"");
}

const orgTrener = { id: "wang-trener", role: "COACH" };

function nullstill() {
  finnSpiller = () => false;
  invitasjoner = [];
  delteGrupper = new Set();
  delingssjekker.length = 0;
}

test("org-trener uten deling: ingen lesing og ingen skriving", async () => {
  nullstill();
  const { harCoachLesetilgangTilSpiller, harCoachTilgangTilSpiller } = await import("./coached");
  assert.equal(await harCoachLesetilgangTilSpiller(orgTrener, "spiller-1"), false);
  assert.equal(await harCoachTilgangTilSpiller(orgTrener, "spiller-1"), false);
});

test("org-trener med gyldig deling: kan lese, men aldri skrive", async () => {
  nullstill();
  invitasjoner = [{ mottakerGruppeId: "wang-gruppe" }];
  delteGrupper = new Set(["wang-gruppe"]);
  const { harCoachLesetilgangTilSpiller, harCoachTilgangTilSpiller, assertCoachTilgangTilSpiller } = await import("./coached");
  assert.equal(await harCoachLesetilgangTilSpiller(orgTrener, "spiller-1"), true);
  assert.deepEqual(delingssjekker, ["wang-trener:spiller-1:wang-gruppe"], "delingen kontrolleres på oppslaget");
  assert.equal(await harCoachTilgangTilSpiller(orgTrener, "spiller-1"), false);
  await assert.rejects(assertCoachTilgangTilSpiller(orgTrener, "spiller-1"));
});

test("trukket deling (invitasjon finnes, men samtykket gjelder ikke lenger): ingen lesing", async () => {
  nullstill();
  invitasjoner = [{ mottakerGruppeId: "tn-gruppe" }];
  const { harCoachLesetilgangTilSpiller } = await import("./coached");
  assert.equal(await harCoachLesetilgangTilSpiller(orgTrener, "spiller-1"), false);
});

test("egen AK-coach (enrollment eller eid gruppe): leser og skriver som før, uten delingsoppslag", async () => {
  nullstill();
  finnSpiller = () => true;
  const { harCoachLesetilgangTilSpiller, harCoachTilgangTilSpiller } = await import("./coached");
  const coach = { id: "ak-coach", role: "COACH" };
  assert.equal(await harCoachTilgangTilSpiller(coach, "spiller-1"), true);
  assert.equal(await harCoachLesetilgangTilSpiller(coach, "spiller-1"), true);
  assert.equal(delingssjekker.length, 0);
});

test("trener-medlem i AK-gruppe: lesing via medlemskapsgrenen, aldri skriving (D-25)", async () => {
  nullstill();
  // Databasen finner spilleren bare når medlemskapsgrenen er med i spørringen.
  finnSpiller = harMedlemskapsgren;
  const { harCoachLesetilgangTilSpiller, harCoachTilgangTilSpiller } = await import("./coached");
  const assistent = { id: "ak-assistent", role: "COACH" };
  assert.equal(await harCoachLesetilgangTilSpiller(assistent, "spiller-1"), true);
  assert.equal(await harCoachTilgangTilSpiller(assistent, "spiller-1"), false);
});

test("ADMIN og spillere går aldri via delingsgrenen", async () => {
  nullstill();
  invitasjoner = [{ mottakerGruppeId: "wang-gruppe" }];
  delteGrupper = new Set(["wang-gruppe"]);
  const { harCoachLesetilgangTilSpiller } = await import("./coached");
  assert.equal(await harCoachLesetilgangTilSpiller({ id: "p", role: "PLAYER" }, "spiller-1"), false);
  assert.equal(await harCoachLesetilgangTilSpiller({ id: "a", role: "ADMIN" }, "spiller-1"), false);
  assert.equal(delingssjekker.length, 0);
});

test("gruppeplan (D-49): trener-medlem kan endre gruppeplanen, men ikke rulle ut i spillernes egne planer", async () => {
  const { editableGroupWhere, canWriteMemberPlans } = await import("@/lib/workbench/group-scope");
  const trener = { id: "wang-trener", role: "COACH" };
  // Gruppeplanen: eier ELLER aktivt COACH-medlem, også i WANG/TN-grupper.
  assert.deepEqual(editableGroupWhere(trener), {
    arkivertAt: null,
    OR: [{ coachId: "wang-trener" }, { members: { some: { userId: "wang-trener", role: "COACH", endedAt: null } } }],
  });
  // Spillernes egne planer: bare eier (coachId) eller ADMIN.
  let sisteWhere: Where | null = null;
  const db = {
    group: { findFirst: async ({ where }: { where: Where }) => { sisteWhere = where; return null; } },
  } as unknown as Parameters<typeof canWriteMemberPlans>[2];
  assert.equal(await canWriteMemberPlans(trener, "g1", db), false);
  assert.deepEqual(sisteWhere, { id: "g1", arkivertAt: null, coachId: "wang-trener" });
  assert.equal(harMedlemskapsgren(sisteWhere ?? {}), false, "medlemskap teller ikke");
  await canWriteMemberPlans({ id: "a", role: "ADMIN" }, "g1", db);
  assert.deepEqual(sisteWhere, { id: "g1", arkivertAt: null });
  assert.equal(await canWriteMemberPlans({ id: "p", role: "PLAYER" }, "g1", db), false);
});
