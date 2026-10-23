import assert from "node:assert/strict";
import { beforeEach, mock, test } from "node:test";
let bruker = { id: "syntetisk-spiller", role: "PLAYER" };
let tillatt = true;
let lagret: unknown[][] = [];
let oppdatert: unknown[] = [];
mock.module("next/cache", { namedExports: { revalidatePath: (...args: unknown[]) => oppdatert.push(args) } });
mock.module("@/lib/auth/action-guards", { namedExports: {
  requireSpillerActionUser: async () => { if (bruker.role !== "PLAYER") throw Error("forbidden"); return bruker; },
  requireParentActionUser: async () => { if (bruker.role !== "PARENT") throw Error("forbidden"); return bruker; },
} });
mock.module("@/lib/deling/ak-profil-valg", { namedExports: {
  settAkProfilValg: async (...args: unknown[]) => { lagret.push(args); return tillatt ? { ok: true } : { ok: false, feil: "Avslått" }; },
} });
beforeEach(() => { bruker = { id: "syntetisk-spiller", role: "PLAYER" }; tillatt = true; lagret = []; oppdatert = []; });
test("egen handling bruker innlogget identitet og oppdaterer visning først etter lagring", async () => {
  const { svarAkProfil } = await import("./ak-profil-actions");
  const input = { gruppeId: "gruppe-a", gitt: true };
  await svarAkProfil(input);
  assert.deepEqual(lagret, [[bruker, bruker.id, input]]);
  assert.equal(oppdatert.length, 3);
});
test("forelder-handling krever forelder og sender barnet til sentral relasjonskontroll", async () => {
  const { svarAkProfilForBarn } = await import("./ak-profil-actions");
  await assert.rejects(() => svarAkProfilForBarn("syntetisk-barn", {}), /forbidden/);
  assert.equal(lagret.length, 0);
  bruker = { id: "syntetisk-forelder", role: "PARENT" };
  await svarAkProfilForBarn("syntetisk-barn", {});
  assert.deepEqual(lagret, [[bruker, "syntetisk-barn", {}]]);
});
test("avslått valg oppdaterer ikke visningen som om det var lagret", async () => {
  const { svarAkProfil } = await import("./ak-profil-actions"); tillatt = false;
  assert.deepEqual(await svarAkProfil({}), { ok: false, feil: "Avslått" });
  assert.deepEqual(oppdatert, []);
});
