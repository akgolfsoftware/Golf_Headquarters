import assert from "node:assert/strict";
import { before, beforeEach, mock, test } from "node:test";

let sportssjefMedlemskap = true;
let targetRad: { id: string; role: string; endedAt: Date | null } | null = {
  id: "medlem-1",
  role: "COACH",
  endedAt: null,
};
let andreAktiveCoacher = 0;
let antallSpillere = 4;
let updateKall = 0;
let upsertData: Record<string, unknown> | null = null;
let transaksjonsforsok = 0;
let feilkodeForsteForsok: string | null = null;
let bruktIsolationLevel: string | undefined;

const group = {
  findUnique: async ({ where }: { where: { slug?: string; id?: string } }) =>
    where.slug || where.id
      ? { id: "tn-gruppe", name: "Team Norway Golf" }
      : null,
};

const groupMember = {
  findFirst: async () =>
    sportssjefMedlemskap ? { id: "sportssjef-medlem" } : null,
  findUnique: async () => targetRad,
  count: async ({ where }: { where: { role?: string } }) =>
    where.role === "PLAYER" ? antallSpillere : andreAktiveCoacher,
  update: async () => {
    updateKall += 1;
  },
  upsert: async ({ create }: { create: Record<string, unknown> }) => {
    upsertData = create;
  },
};

mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      group,
      groupMember,
      $transaction: async (
        arbeid: (tx: { group: typeof group; groupMember: typeof groupMember }) => Promise<unknown>,
        options: { isolationLevel?: string },
      ) => {
        transaksjonsforsok += 1;
        bruktIsolationLevel = options.isolationLevel;
        if (feilkodeForsteForsok && transaksjonsforsok === 1) {
          throw Object.assign(new Error("serialization conflict"), {
            code: feilkodeForsteForsok,
          });
        }
        return arbeid({ group, groupMember });
      },
    },
  },
});

let avsluttTilgang: typeof import("./tn-tilgang").avsluttTilgang;
let settTilgang: typeof import("./tn-tilgang").settTilgang;

before(async () => {
  ({ avsluttTilgang, settTilgang } = await import("./tn-tilgang"));
});

beforeEach(() => {
  sportssjefMedlemskap = true;
  targetRad = { id: "medlem-1", role: "COACH", endedAt: null };
  andreAktiveCoacher = 0;
  antallSpillere = 4;
  updateKall = 0;
  upsertData = null;
  transaksjonsforsok = 0;
  feilkodeForsteForsok = null;
  bruktIsolationLevel = undefined;
});

test("vanlig coach kan ikke endre Team Norway-tilgang", async () => {
  sportssjefMedlemskap = false;
  await assert.rejects(
    avsluttTilgang({
      caller: { id: "vanlig-coach", role: "COACH" },
      groupId: "tn-gruppe",
      targetUserId: "trener-1",
    }),
    /ikke sportssjef/,
  );
  assert.equal(transaksjonsforsok, 0);
});

test("siste aktive coach kan ikke avsluttes", async () => {
  const resultat = await avsluttTilgang({
    caller: { id: "admin-1", role: "ADMIN" },
    groupId: "tn-gruppe",
    targetUserId: "trener-1",
  });

  assert.deepEqual(resultat, {
    ok: false,
    reason: "siste-trener",
    gruppeNavn: "Team Norway Golf",
    antallSpillere: 4,
  });
  assert.equal(updateKall, 0);
  assert.equal(bruktIsolationLevel, "Serializable");
});

test("coach kan avsluttes når gruppen har en annen aktiv coach", async () => {
  andreAktiveCoacher = 1;
  assert.deepEqual(
    await avsluttTilgang({
      caller: { id: "admin-1", role: "ADMIN" },
      groupId: "tn-gruppe",
      targetUserId: "trener-1",
    }),
    { ok: true },
  );
  assert.equal(updateKall, 1);
});

test("siste aktive coach kan ikke degraderes til assistent", async () => {
  const resultat = await settTilgang({
    caller: { id: "admin-1", role: "ADMIN" },
    groupId: "tn-gruppe",
    targetUserId: "trener-1",
    rolle: "ASSISTANT",
    fraIso: "2026-09-13",
    tilIso: null,
  });

  assert.equal(resultat.ok, false);
  assert.equal(upsertData, null);
});

test("tilgangsdatoer lagres som UTC-midnatt", async () => {
  targetRad = null;
  const resultat = await settTilgang({
    caller: { id: "admin-1", role: "ADMIN" },
    groupId: "tn-gruppe",
    targetUserId: "trener-2",
    rolle: "ASSISTANT",
    fraIso: "2026-09-13",
    tilIso: "2026-12-31",
  });

  assert.deepEqual(resultat, { ok: true });
  assert.equal(
    (upsertData?.joinedAt as Date).toISOString(),
    "2026-09-13T00:00:00.000Z",
  );
  assert.equal(
    (upsertData?.endedAt as Date).toISOString(),
    "2026-12-31T00:00:00.000Z",
  );
});

test("serialiseringskonflikt prøves på nytt", async () => {
  andreAktiveCoacher = 1;
  feilkodeForsteForsok = "P2034";
  await avsluttTilgang({
    caller: { id: "admin-1", role: "ADMIN" },
    groupId: "tn-gruppe",
    targetUserId: "trener-1",
  });
  assert.equal(transaksjonsforsok, 2);
  assert.equal(updateKall, 1);
});
