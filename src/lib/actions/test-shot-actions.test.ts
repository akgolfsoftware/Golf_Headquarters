/**
 * S1 (seniorgjennomgangen 07.10): alle fem eksportene i test-shot-actions.ts
 * sjekker innlogget bruker mot testresultatet før noe leses eller skrives.
 *
 * Prisma-mocken evaluerer where-fragmentet fra akCoachRelasjonWhere mot et lite
 * datasett, så testen låser selve regelen: eier og egen AK-coach slipper inn,
 * trenermedlemskap og WANG/Team Norway gjør det aldri, og samtykke til deling
 * gir aldri rå skrivetilgang.
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

type Bruker = { id: string; role: "PLAYER" | "COACH" | "ADMIN" | "PARENT" };
type Gruppe = {
  coachId: string | null;
  managedByAkGolf: boolean;
  program: string | null;
  arkivertAt: Date | null;
};
type Spiller = {
  role: string;
  deletedAt: Date | null;
  enrollments: Array<{ coachId: string | null; program: string; endedAt: Date | null }>;
  medlemskap: Array<{ role: string; endedAt: Date | null; group: Gruppe }>;
};

const AVSLUTTET = new Date("2026-09-01T00:00:00Z");
const akGruppeCoachA: Gruppe = { coachId: "coach-a", managedByAkGolf: true, program: "AK_ACADEMY", arkivertAt: null };
const wangGruppe: Gruppe = { coachId: "wang-trener", managedByAkGolf: true, program: "WANG_TOPPIDRETT", arkivertAt: null };
const tnGruppe: Gruppe = { coachId: "tn-trener", managedByAkGolf: false, program: null, arkivertAt: null };

const spillere: Record<string, Spiller> = {
  "spiller-a": {
    role: "PLAYER",
    deletedAt: null,
    enrollments: [{ coachId: "coach-a", program: "AK_ACADEMY", endedAt: null }],
    medlemskap: [
      { role: "PLAYER", endedAt: null, group: wangGruppe },
      { role: "PLAYER", endedAt: null, group: tnGruppe },
    ],
  },
  "spiller-b": { role: "PLAYER", deletedAt: null, enrollments: [], medlemskap: [] },
  // Bare med i AK-gruppa til coach-a, men medlemskapet er avsluttet.
  "spiller-utmeldt": {
    role: "PLAYER",
    deletedAt: null,
    enrollments: [{ coachId: "coach-a", program: "AK_ACADEMY", endedAt: AVSLUTTET }],
    medlemskap: [{ role: "PLAYER", endedAt: AVSLUTTET, group: akGruppeCoachA }],
  },
  // Coachet av coach-a bare via gruppa coachen eier.
  "spiller-gruppe": {
    role: "PLAYER",
    deletedAt: null,
    enrollments: [],
    medlemskap: [{ role: "PLAYER", endedAt: null, group: akGruppeCoachA }],
  },
};

const testResultater: Record<string, { id: string; userId: string; details?: unknown }> = {
  "tr-a": { id: "tr-a", userId: "spiller-a", details: { shots: [{ pei: 0.04 }] } },
  "tr-b": { id: "tr-b", userId: "spiller-b" },
  "tr-utmeldt": { id: "tr-utmeldt", userId: "spiller-utmeldt" },
  "tr-gruppe": { id: "tr-gruppe", userId: "spiller-gruppe" },
};

let bruker: Bruker | null = null;
let prismaKall: string[] = [];

type Where = Record<string, unknown>;
const ikkeIn = (verdi: unknown, liste: unknown) => !(liste as unknown[]).includes(verdi);

function gruppeTreff(g: Gruppe, w: Where): boolean {
  if ("coachId" in w && g.coachId !== w.coachId) return false;
  if (w.managedByAkGolf !== undefined && g.managedByAkGolf !== w.managedByAkGolf) return false;
  if ("arkivertAt" in w && g.arkivertAt !== w.arkivertAt) return false;
  const or = w.OR as Where[] | undefined;
  if (or) {
    const ok = or.some((del) => {
      const p = del.program as null | { notIn: string[] };
      if (p === null) return g.program === null;
      return g.program !== null && ikkeIn(g.program, p.notIn);
    });
    if (!ok) return false;
  }
  return true;
}

function spillerTreff(id: string, w: Where): boolean {
  const s = spillere[id];
  if (!s) return false;
  if (w.role && s.role !== w.role) return false;
  if ("deletedAt" in w && s.deletedAt !== w.deletedAt) return false;
  return (w.OR as Where[]).some((gren) => {
    if (gren.enrollmentsAsPlayer) {
      const e = (gren.enrollmentsAsPlayer as { some: Where }).some;
      return s.enrollments.some(
        (r) =>
          r.endedAt === e.endedAt &&
          ikkeIn(r.program, (e.program as { notIn: string[] }).notIn) &&
          (!("coachId" in e) || r.coachId === e.coachId),
      );
    }
    const m = (gren.groupMemberships as { some: Where }).some;
    return s.medlemskap.some(
      (r) => r.endedAt === m.endedAt && r.role === m.role && gruppeTreff(r.group, m.group as Where),
    );
  });
}

const prismaMock = {
  testResult: {
    findMany: async ({ where }: { where: { id: { in: string[] } } }) => {
      prismaKall.push("testResult.findMany");
      return where.id.in.filter((id) => testResultater[id]).map((id) => testResultater[id]);
    },
    findUniqueOrThrow: async ({ where }: { where: { id: string } }) => {
      prismaKall.push("testResult.findUniqueOrThrow");
      return testResultater[where.id];
    },
  },
  user: {
    findMany: async ({ where }: { where: { AND: [{ id: { in: string[] } }, Where] } }) => {
      prismaKall.push("user.findMany");
      const [{ id }, relasjon] = where.AND;
      return id.in.filter((sid) => spillerTreff(sid, relasjon)).map((sid) => ({ id: sid }));
    },
  },
  testShot: {
    create: (args: unknown) => {
      prismaKall.push("testShot.create");
      return args;
    },
    findMany: async () => {
      prismaKall.push("testShot.findMany");
      return [];
    },
    deleteMany: async () => {
      prismaKall.push("testShot.deleteMany");
      return { count: 0 };
    },
    count: async () => {
      prismaKall.push("testShot.count");
      return 0;
    },
  },
  $transaction: async (ops: unknown[]) => {
    prismaKall.push("$transaction");
    return ops;
  },
};

mock.module("server-only", { namedExports: {} });
mock.module("@/lib/prisma", { namedExports: { prisma: prismaMock } });
mock.module("@/lib/auth/getCurrentUser", { namedExports: { getCurrentUser: async () => bruker } });
mock.module("@/lib/auth/action-guards", { namedExports: { publicAction: () => undefined } });

const last = () => import("./test-shot-actions");

const skrivTil = (id: string) => ({ testResultId: id, shotNumber: 1 });
const ALLE: Array<[string, (id: string) => Promise<unknown>]> = [
  ["createTestShot", (id) => last().then((a) => a.createTestShot(skrivTil(id)))],
  ["createTestShotsTransaction", (id) => last().then((a) => a.createTestShotsTransaction([skrivTil(id)]))],
  ["getTestShots", (id) => last().then((a) => a.getTestShots(id))],
  ["deleteTestShotsForResult", (id) => last().then((a) => a.deleteTestShotsForResult(id))],
  ["migrateDetailsJsonToTestShots", (id) => last().then((a) => a.migrateDetailsJsonToTestShots(id))],
];

function som(b: Bruker | null) {
  bruker = b;
  prismaKall = [];
}

const ingenSkriving = () =>
  assert.deepEqual(
    prismaKall.filter((k) => k.startsWith("testShot") || k === "$transaction"),
    [],
  );

for (const [navn, kall] of ALLE) {
  test(`${navn}: uten sesjon avvises før Prisma`, async () => {
    som(null);
    await assert.rejects(kall("tr-a"), /Ikke innlogget/);
    assert.deepEqual(prismaKall, []);
  });

  test(`${navn}: eieren slipper inn`, async () => {
    som({ id: "spiller-a", role: "PLAYER" });
    await kall("tr-a");
  });

  test(`${navn}: spiller B avvises mot A`, async () => {
    som({ id: "spiller-b", role: "PLAYER" });
    await assert.rejects(kall("tr-a"), /Ingen tilgang/);
    ingenSkriving();
  });

  test(`${navn}: egen AK-coach slipper inn`, async () => {
    som({ id: "coach-a", role: "COACH" });
    await kall("tr-a");
  });

  test(`${navn}: coach B avvises mot A`, async () => {
    som({ id: "coach-b", role: "COACH" });
    await assert.rejects(kall("tr-a"), /Ingen tilgang/);
    ingenSkriving();
  });

  test(`${navn}: forelder uten relasjon avvises`, async () => {
    som({ id: "forelder-x", role: "PARENT" });
    await assert.rejects(kall("tr-a"), /Ingen tilgang/);
    ingenSkriving();
  });

  test(`${navn}: WANG-trener som eier elevens skolegruppe avvises`, async () => {
    som({ id: "wang-trener", role: "COACH" });
    await assert.rejects(kall("tr-a"), /Ingen tilgang/);
    ingenSkriving();
  });

  test(`${navn}: Team Norway-trener avvises`, async () => {
    som({ id: "tn-trener", role: "COACH" });
    await assert.rejects(kall("tr-a"), /Ingen tilgang/);
    ingenSkriving();
  });

  test(`${navn}: coach avvises når enrollment og medlemskap er avsluttet`, async () => {
    som({ id: "coach-a", role: "COACH" });
    await assert.rejects(kall("tr-utmeldt"), /Ingen tilgang/);
    ingenSkriving();
  });

  test(`${navn}: ukjent testresultat avvises`, async () => {
    som({ id: "spiller-a", role: "PLAYER" });
    await assert.rejects(kall("finnes-ikke"), /finnes ikke/);
    ingenSkriving();
  });
}

test("coach som eier spillerens AK-gruppe slipper inn", async () => {
  som({ id: "coach-a", role: "COACH" });
  await (await last()).getTestShots("tr-gruppe");
});

test("WANG- og TN-trener avvises uansett delingssamtykke: samtykke gir bare innsyn via delingsporten", async () => {
  // Datasettet har ingen samtykke-tabell, og vakten leser den aldri. Et gitt,
  // trukket eller manglende samtykke gir derfor samme svar her: avvist.
  for (const id of ["wang-trener", "tn-trener"]) {
    som({ id, role: "COACH" });
    await assert.rejects((await last()).getTestShots("tr-a"), /Ingen tilgang/);
  }
});

test("batch: én fremmed id avviser hele batchen, ingenting lagres", async () => {
  som({ id: "spiller-a", role: "PLAYER" });
  await assert.rejects(
    (await last()).createTestShotsTransaction([skrivTil("tr-a"), skrivTil("tr-b")]),
    /Ingen tilgang/,
  );
  ingenSkriving();
});

test("batch: alle egne ider lagres i én transaksjon", async () => {
  som({ id: "spiller-a", role: "PLAYER" });
  const rader = await (await last()).createTestShotsTransaction([skrivTil("tr-a"), { ...skrivTil("tr-a"), shotNumber: 2 }]);
  assert.equal(rader.length, 2);
  assert.equal(prismaKall.filter((k) => k === "$transaction").length, 1);
});

test("ADMIN slipper inn hos AK-coachet spiller, men ikke hos spiller uten AK-forhold", async () => {
  som({ id: "admin", role: "ADMIN" });
  await (await last()).getTestShots("tr-a");
  await assert.rejects((await last()).getTestShots("tr-b"), /Ingen tilgang/);
});
