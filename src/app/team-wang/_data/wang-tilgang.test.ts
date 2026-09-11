import { test, mock } from "node:test";
import assert from "node:assert/strict";

let medlemskap: { id: string } | null = null;
let prismaKaster = false;

mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      groupMember: {
        findFirst: async () => {
          if (prismaKaster) throw new Error("connect ECONNREFUSED");
          return medlemskap;
        },
      },
    },
  },
});

async function last() {
  return import("./wang-tilgang");
}

test("ADMIN er WANG-trener uten medlemskapsoppslag", async () => {
  const { erWangGruppeTrener } = await last();
  prismaKaster = true;
  try {
    assert.equal(await erWangGruppeTrener({ id: "a1", role: "ADMIN" }), true);
  } finally {
    prismaKaster = false;
  }
});

test("COACH uten WANG-medlemskap avvises", async () => {
  medlemskap = null;
  const { erWangGruppeTrener } = await last();
  assert.equal(await erWangGruppeTrener({ id: "c1", role: "COACH" }), false);
});

test("COACH med WANG-medlemskap slipper inn", async () => {
  medlemskap = { id: "m1" };
  const { erWangGruppeTrener } = await last();
  assert.equal(await erWangGruppeTrener({ id: "c1", role: "COACH" }), true);
});

test("PLAYER er aldri WANG-trener, selv med gruppemedlemskap", async () => {
  medlemskap = { id: "m1" };
  const { erWangGruppeTrener } = await last();
  assert.equal(await erWangGruppeTrener({ id: "p1", role: "PLAYER" }), false);
});

test("DB-feil kastes som WangGruppeHentefeil, ikke stille nei", async () => {
  prismaKaster = true;
  medlemskap = null;
  try {
    const { erWangGruppeTrener } = await last();
    const { WangGruppeHentefeil } = await import("./hent-wang-gruppe");
    await assert.rejects(
      () => erWangGruppeTrener({ id: "c1", role: "COACH" }),
      (e: unknown) => e instanceof WangGruppeHentefeil,
    );
  } finally {
    prismaKaster = false;
  }
});
