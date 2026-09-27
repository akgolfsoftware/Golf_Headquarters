/**
 * Skrivelaget for Team Norway-knappene: bare trener i gruppen skriver, alt er
 * avgrenset til gruppen, og målinger slettes aldri.
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

type Kontekst = { gruppe: { id: string; name: string }; rolle: string; erSpiller: boolean; kanAdministrere: boolean } | null;

let kontekst: Kontekst = null;
let sisteWhere: unknown = null;
let oppdatert = 0;
let slettet = 0;
let ferdigeDeltakere = 0;

mock.module("@/lib/domain/tn-arbeidsflate", {
  namedExports: { hentTnArbeidskontekst: async () => kontekst },
});
mock.module("@/lib/storage/supabase-storage", { namedExports: { deleteFile: async () => undefined } });
mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      groupSchedule: {
        updateMany: async ({ where }: { where: unknown }) => {
          sisteWhere = where;
          oppdatert += 1;
          return { count: 1 };
        },
        create: async () => ({ id: "ny" }),
        deleteMany: async ({ where }: { where: unknown }) => {
          sisteWhere = where;
          return { count: 1 };
        },
      },
      testDay: {
        findFirst: async () => ({ participants: Array.from({ length: ferdigeDeltakere }, (_, i) => ({ id: `p${i}` })) }),
        delete: async () => {
          slettet += 1;
          return {};
        },
      },
      groupMember: { findFirst: async () => null },
    },
  },
});

const trener: Kontekst = { gruppe: { id: "tn", name: "Team Norway" }, rolle: "COACH", erSpiller: false, kanAdministrere: true };
const bruker = { id: "u1", role: "PLAYER" as const, name: "Trener" };
const samling = { tittel: "Høstsamling", fra: "2026-10-19", til: "2026-10-25" };

async function skriv() {
  return import("./tn-redigering");
}

test("Spiller og Assist Coach kan ikke lage samling", async () => {
  const { lagreSamling } = await skriv();
  kontekst = { ...trener!, rolle: "ASSISTANT", kanAdministrere: false };
  const r = await lagreSamling(bruker, null, samling);
  assert.equal(r.ok, false);
  kontekst = null;
  assert.equal((await lagreSamling(bruker, null, samling)).ok, false);
});

test("Trener i gruppen kan lage samling uten plattformrollen COACH", async () => {
  const { lagreSamling } = await skriv();
  kontekst = trener;
  const r = await lagreSamling(bruker, null, samling);
  assert.deepEqual(r, { ok: true, data: { id: "ny" } });
});

test("Sluttdato før startdato avvises før noe skrives", async () => {
  const { lagreSamling } = await skriv();
  kontekst = trener;
  const før = oppdatert;
  const r = await lagreSamling(bruker, "s1", { ...samling, til: "2026-10-01" });
  assert.equal(r.ok, false);
  assert.equal(oppdatert, før);
});

test("Endring av samling er låst til gruppen og typen SAMLING", async () => {
  const { lagreSamling } = await skriv();
  kontekst = trener;
  await lagreSamling(bruker, "s1", samling);
  assert.deepEqual(sisteWhere, { id: "s1", groupId: "tn", kind: "SAMLING" });
});

test("Økt uten type (kind null) treffes ved endring og sletting", async () => {
  const { lagreOkt, slettOkt } = await skriv();
  kontekst = trener;
  await lagreOkt(bruker, "o1", { tittel: "Teknikk", dato: "2026-10-06", fra: "16:00", til: "17:30" });
  assert.deepEqual(sisteWhere, { id: "o1", groupId: "tn", OR: [{ kind: null }, { kind: { not: "SAMLING" } }] });
  await slettOkt(bruker, "o1");
  assert.deepEqual(sisteWhere, { id: "o1", groupId: "tn", OR: [{ kind: null }, { kind: { not: "SAMLING" } }] });
});

test("Testdag med førte resultater slettes ikke", async () => {
  const { slettTestdag } = await skriv();
  kontekst = trener;
  ferdigeDeltakere = 2;
  const før = slettet;
  const r = await slettTestdag(bruker, "d1");
  assert.equal(r.ok, false);
  assert.equal(slettet, før);
  ferdigeDeltakere = 0;
  assert.equal((await slettTestdag(bruker, "d1")).ok, true);
  assert.equal(slettet, før + 1);
});

test("Uttak for en som ikke er spiller i gruppen avvises", async () => {
  const { lagreUttak } = await skriv();
  kontekst = trener;
  const r = await lagreUttak(bruker, { spillerId: "fremmed", arrangement: "EM 2027", status: "UTTATT" });
  assert.deepEqual(r, { ok: false, feil: "Spilleren er ikke med i gruppen." });
});
