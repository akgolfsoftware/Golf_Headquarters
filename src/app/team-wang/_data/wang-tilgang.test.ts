import assert from "node:assert/strict";
import { mock, test } from "node:test";

let gruppeFeil: Error | null = null;
let gruppeFinnes = true;
let elevAktiv = true;
let trenergruppe: string | null = "wang-top-id";
let forelderGodkjent = true;
const kall: Array<Record<string, unknown>> = [];
const medlemskapskall: Array<Record<string, unknown>> = [];

mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      group: {
        findUnique: async (args: Record<string, unknown>) => {
          kall.push(args);
          if (gruppeFeil) throw gruppeFeil;
          return gruppeFinnes ? { id: "wang-top-id" } : null;
        },
      },
      groupMember: {
        findFirst: async ({ where }: { where: Record<string, unknown> }) => {
          medlemskapskall.push(where);
          if (where.userId === "elev-1") return elevAktiv ? { id: "elev-medlem" } : null;
          return where.groupId === trenergruppe ? { id: "trener-medlem" } : null;
        },
      },
      parentRelation: {
        findUnique: async () => ({ approved: forelderGodkjent }),
      },
    },
  },
});

async function tilgang() {
  return import("./wang-tilgang");
}

test.beforeEach(() => {
  gruppeFeil = null;
  gruppeFinnes = true;
  elevAktiv = true;
  trenergruppe = "wang-top-id";
  forelderGodkjent = true;
  kall.length = 0;
  medlemskapskall.length = 0;
});

test("coachside tillater admin og aktiv coach/assistant i nøyaktig Toppidrett-gruppe", async () => {
  const { hentWangCoachGruppeId } = await tilgang();
  assert.equal(await hentWangCoachGruppeId({ id: "admin", role: "ADMIN" }), "wang-top-id");
  assert.equal(await hentWangCoachGruppeId({ id: "coach", role: "COACH" }), "wang-top-id");
  assert.deepEqual(kall[0], {
    where: { slug: "wang-toppidrett" },
    select: { id: true },
  });
  assert.deepEqual(medlemskapskall[0], {
    groupId: "wang-top-id",
    userId: "coach",
    role: { in: ["COACH", "ASSISTANT"] },
    endedAt: null,
  });
});

test("medlemskap bare i WANG Ung gir ikke tilgang til Toppidrett-listen", async () => {
  const { hentWangCoachGruppeId } = await tilgang();
  trenergruppe = "wang-ung-id";
  assert.equal(await hentWangCoachGruppeId({ id: "coach", role: "COACH" }), null);
});

test("utmeldt trener og manglende Toppidrett-gruppe avvises", async () => {
  const { hentWangCoachGruppeId } = await tilgang();
  trenergruppe = null;
  assert.equal(await hentWangCoachGruppeId({ id: "coach", role: "COACH" }), null);
  gruppeFinnes = false;
  assert.equal(await hentWangCoachGruppeId({ id: "admin", role: "ADMIN" }), null);
});

test("IUP tillater elev selv, godkjent foresatt, admin og trener i samme gruppe", async () => {
  const { hentWangElevGruppeId } = await tilgang();
  for (const bruker of [
    { id: "elev-1", role: "PLAYER" as const },
    { id: "forelder", role: "PARENT" as const },
    { id: "admin", role: "ADMIN" as const },
    { id: "coach", role: "COACH" as const },
  ]) {
    assert.equal(await hentWangElevGruppeId(bruker, "elev-1"), "wang-top-id");
  }
});

test("IUP avviser annen elev, ubekreftet foresatt, WANG Ung-coach og elev uten aktivt medlemskap", async () => {
  const { hentWangElevGruppeId } = await tilgang();
  assert.equal(await hentWangElevGruppeId({ id: "elev-2", role: "PLAYER" }, "elev-1"), null);
  forelderGodkjent = false;
  assert.equal(await hentWangElevGruppeId({ id: "forelder", role: "PARENT" }, "elev-1"), null);
  trenergruppe = "wang-ung-id";
  assert.equal(await hentWangElevGruppeId({ id: "coach", role: "COACH" }, "elev-1"), null);
  elevAktiv = false;
  assert.equal(await hentWangElevGruppeId({ id: "admin", role: "ADMIN" }, "elev-1"), null);
});

test("databasefeil blir trygg feil uten tekniske detaljer", async () => {
  const { hentWangCoachGruppeId, WangDataUtilgjengeligError } = await tilgang();
  gruppeFeil = new Error("postgresql://secret@database/internal_table");
  await assert.rejects(
    hentWangCoachGruppeId({ id: "coach", role: "COACH" }),
    (error: unknown) => {
      assert.ok(error instanceof WangDataUtilgjengeligError);
      assert.equal(error.message, "Kunne ikke hente WANG-data akkurat nå. Prøv igjen.");
      assert.doesNotMatch(error.message, /postgres|secret|internal_table/i);
      return true;
    },
  );
});
