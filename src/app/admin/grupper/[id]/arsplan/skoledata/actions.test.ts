/**
 * R-I: admin/grupper/[id]/arsplan/skoledata/actions.ts. `importerSkoledata`
 * er gated på `Capability.EDIT_GROUP_PLANS` (i COACH-defaulten) — testen
 * bekrefter at COACH med capabiliteten eksplisitt REVOKEt avvises (kastes
 * ufanget, ikke fanget i try/catch her). Dekker også hele parseren:
 * ugyldig skoleår-format, per-linje-validering (dato/kategori/trinn/
 * tittel), at ugyldige linjer rapporteres uten å stoppe importen av de
 * gyldige, og at tomt trinn tolkes som «gjelder alle trinn».
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

type Rolle = "PLAYER" | "COACH" | "ADMIN" | "PARENT";

let bruker: { id: string; role: Rolle; name: string } | null = {
  id: "coach-a",
  role: "COACH",
  name: "Coach A",
};

/** Simulerer effektiv EDIT_GROUP_PLANS-tilgang (default true for COACH). */
let coachHarEditGroupPlans = true;

let entryCreates: unknown[] = [];

function nullstill() {
  bruker = { id: "coach-a", role: "COACH", name: "Coach A" };
  coachHarEditGroupPlans = true;
  entryCreates = [];
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
mock.module("@/lib/auth/effective-capabilities", {
  namedExports: {
    assertCapability: async (user: { role: Rolle }) => {
      if (user.role === "ADMIN") return;
      if (!coachHarEditGroupPlans) throw new Error("forbidden");
    },
  },
});
const prismaMock: Record<string, unknown> = {};
mock.module("@/lib/prisma", { namedExports: { prisma: prismaMock } });
Object.assign(prismaMock, {
  schoolScheduleEntry: {
    createMany: async ({ data }: { data: unknown[] }) => {
      entryCreates.push(...data);
      return { count: data.length };
    },
  },
});

async function actions() {
  return import("./actions");
}

test.beforeEach(() => {
  nullstill();
});

test("importerSkoledata avviser PLAYER uten å importere", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { importerSkoledata } = await actions();
  await assert.rejects(() =>
    importerSkoledata("gruppe-a", formData({ schoolYear: "2026/2027", data: "2026-09-20|VG1|TIME|Norsk" })),
  );
  assert.equal(entryCreates.length, 0);
});

test("importerSkoledata avviser uinnlogget uten å importere", async () => {
  bruker = null;
  const { importerSkoledata } = await actions();
  await assert.rejects(() =>
    importerSkoledata("gruppe-a", formData({ schoolYear: "2026/2027", data: "2026-09-20|VG1|TIME|Norsk" })),
  );
  assert.equal(entryCreates.length, 0);
});

test("importerSkoledata avviser COACH med revoket EDIT_GROUP_PLANS", async () => {
  coachHarEditGroupPlans = false;
  const { importerSkoledata } = await actions();
  await assert.rejects(
    () => importerSkoledata("gruppe-a", formData({ schoolYear: "2026/2027", data: "2026-09-20|VG1|TIME|Norsk" })),
    /forbidden/,
  );
  assert.equal(entryCreates.length, 0);
});

test("importerSkoledata avviser ugyldig skoleår-format", async () => {
  const { importerSkoledata } = await actions();
  const svar = await importerSkoledata("gruppe-a", formData({ schoolYear: "2026", data: "2026-09-20|VG1|TIME|Norsk" }));
  assert.equal(svar.ok, false);
  assert.equal(entryCreates.length, 0);
});

test("importerSkoledata avviser når ingen gyldige rader finnes", async () => {
  const { importerSkoledata } = await actions();
  const svar = await importerSkoledata("gruppe-a", formData({ schoolYear: "2026/2027", data: "ikke gyldig data" }));
  assert.equal(svar.ok, false);
  assert.equal(entryCreates.length, 0);
});

test("importerSkoledata rapporterer feil per linje uten å stoppe gyldige rader", async () => {
  const rader = [
    "2026-09-20|VG1|TIME|Norsk",
    "ugyldig-dato|VG1|TIME|Matte",
    "2026-09-22|VG9|TIME|Ukjent trinn",
    "2026-09-23|VG1|UKJENT_KATEGORI|Feil",
    "2026-09-24|VG1|TIME|",
    "# kommentar, hoppes over",
    "",
  ].join("\n");
  const { importerSkoledata } = await actions();
  const svar = await importerSkoledata("gruppe-a", formData({ schoolYear: "2026/2027", data: rader }));
  assert.equal(svar.ok, true);
  if (svar.ok) {
    assert.equal(svar.antall, 1);
    assert.equal(svar.feil.length, 4);
  }
  assert.equal(entryCreates.length, 1);
});

test("importerSkoledata tolker tomt trinn som «gjelder alle trinn»", async () => {
  const { importerSkoledata } = await actions();
  await importerSkoledata("gruppe-a", formData({ schoolYear: "2026/2027", data: "2026-09-20||HELDAGSPROVE|Fellesprøve" }));
  assert.equal((entryCreates[0] as { classYear: string | null }).classYear, null);
});

test("importerSkoledata importerer gyldige rader og revaliderer riktige stier", async () => {
  const { importerSkoledata } = await actions();
  const svar = await importerSkoledata(
    "gruppe-a",
    formData({ schoolYear: "2026/2027", data: "2026-09-20|VG2|EKSAMEN|Skriftlig eksamen|Rom 204" }),
  );
  assert.equal(svar.ok, true);
  if (svar.ok) assert.equal(svar.antall, 1);
  assert.equal(entryCreates.length, 1);
  const rad = entryCreates[0] as { category: string; note: string | null; schoolYear: string };
  assert.equal(rad.category, "EKSAMEN");
  assert.equal(rad.note, "Rom 204");
  assert.equal(rad.schoolYear, "2026/2027");
});
