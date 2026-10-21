import assert from "node:assert/strict";
import { before, beforeEach, mock, test } from "node:test";

const GRUPPE = { id: "tn-gruppe", name: "Team Norway Golf" };
let erSpiller = false;
let delteIder: string[] = [];
let forslagSporring: { userId?: { in: string[] }; coachId?: string } | null = null;

mock.module("./tn-arbeidsflate", {
  namedExports: {
    hentTnArbeidskontekst: async () => ({ gruppe: GRUPPE, rolle: erSpiller ? "PLAYER" : "COACH", erSpiller, kanAdministrere: false }),
  },
});

mock.module("@/lib/deling/profil-lesing", {
  namedExports: {
    lesNavngitteProfiler: async (_bruker: string, _gruppe: string, les: (tx: unknown, id: string) => Promise<unknown>) => {
      const tx = { user: { findFirst: async ({ where }: { where: { id: string } }) => ({ name: `Spiller ${where.id}` }) } };
      return (await Promise.all(delteIder.map((id) => les(tx, id)))).filter(Boolean);
    },
  },
});

mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      user: { findUnique: async () => ({ name: "Eva Trener", email: "eva@golfforbundet.no", phone: null }) },
      groupMember: {
        findFirst: async () => ({ role: "COACH", joinedAt: new Date("2025-03-01T00:00:00Z") }),
        count: async () => 14,
      },
      planAction: {
        findMany: async ({ where }: { where: { userId: { in: string[] }; coachId: string } }) => {
          forslagSporring = where;
          return where.userId.in.map((id, i) => ({ id: `f${i}`, userId: id, status: "PENDING", createdAt: new Date("2026-10-20T00:00:00Z") }));
        },
      },
    },
  },
});

let hentTnTrenerprofil: typeof import("./tn-trenerprofil").hentTnTrenerprofil;
before(async () => { ({ hentTnTrenerprofil } = await import("./tn-trenerprofil")); });
beforeEach(() => { erSpiller = false; delteIder = []; forslagSporring = null; });

const TRENER = { id: "trener-1", role: "COACH" as const, name: "Eva Trener" };

test("spiller i TN-gruppa får ingen trenerprofil", async () => {
  erSpiller = true;
  assert.equal(await hentTnTrenerprofil(TRENER), null);
});

test("profilen viser bare spillere som deler, og forslag bare for dem", async () => {
  delteIder = ["b", "a"];
  const p = await hentTnTrenerprofil(TRENER);
  assert.ok(p);
  assert.deepEqual(p.delte.map((d) => d.id), ["a", "b"]);
  assert.equal(p.spillereIGruppa, 14);
  assert.deepEqual(forslagSporring?.userId?.in.sort(), ["a", "b"]);
  assert.equal(forslagSporring?.coachId, "trener-1");
  assert.equal(p.forslag[0].status, "Venter på spilleren");
});

test("uten deling leses ingen forslag, og telefon mangler vises som null", async () => {
  const p = await hentTnTrenerprofil(TRENER);
  assert.ok(p);
  assert.equal(p.delte.length, 0);
  assert.equal(forslagSporring, null);
  assert.equal(p.telefon, null);
});
