import assert from "node:assert/strict";
import { before, beforeEach, mock, test } from "node:test";

let aktivDeling = true;
let actorRole = "ADMIN";
let administrativTilgang = true;
let failLock = false;
let writes = 0;
let handlingKall = 0;
let scopeRead: unknown;
const tx = {
  user: {
    findFirst: async (query: unknown) => { scopeRead = query; return aktivDeling ? { id: "synthetic-player" } : null; },
    findUnique: async () => ({ id: "synthetic-player", deletedAt: null }),
  },
  notification: { create: async () => { writes++; return { id: "notification" }; } },
};
mock.module("@/lib/prisma", { namedExports: { prisma: {
  user: { findFirst: async ({ where }: { where: { id?: string } }) => where.id === "admin"
    ? ["ADMIN", "COACH"].includes(actorRole) ? { id: "admin", role: actorRole } : null
    : administrativTilgang ? { id: "synthetic-player" } : null },
  notification: { create: async () => { throw Error("Profilhandling må bruke transaksjonen"); } },
} } });
mock.module("@/lib/caddie/administrativ-tilgang", { namedExports: {
  medCaddieAdministrasjon: async (_id: string, _ressurs: unknown, run: (tx: object) => Promise<unknown>) => {
    if (!administrativTilgang) throw Error("Du har ikke tilgang til denne ressursen.");
    return run(tx);
  },
} });
// Faktiske medlems-/samtykkelåser prøves separat i ak-profildeling.test.ts.
mock.module("@/lib/deling/ak-profil-lesing", { namedExports: {
  medAkProfiler: async (viewer: { id: string; role: string }, run: (tx: object, scope: object) => Promise<unknown>, modus: string) => {
    handlingKall++; assert.equal(modus, "handling"); assert.equal(viewer.role, actorRole);
    if (failLock) throw Error("syntetisk låsefeil");
    return run(tx, { id: { in: aktivDeling ? ["synthetic-player"] : [] } });
  },
} });
let execute: typeof import("./approval-executor").executeApprovedTool;
before(async () => { ({ executeApprovedTool: execute } = await import("./approval-executor")); });
beforeEach(() => { actorRole = "ADMIN"; aktivDeling = true; administrativTilgang = true; failLock = false; writes = 0; handlingKall = 0; scopeRead = null; });
const inputs = [
  ["draftPlayerMessage", { playerId: "synthetic-player", subject: "Golf", body: "Tren carry" }],
  ["draftPlayerNote", { playerId: "synthetic-player", note: "Golfnotat" }],
  ["draftPlanAdjustment", { playerId: "synthetic-player", change: "Golfplan", reason: "Syntetisk" }],
  ["reengageInactivePlayer", { spillerId: "synthetic-player", foreslattMelding: "Golfoppfølging" }],
] as const;
test("alle fire godkjente profilhandlinger skriver gjennom samme beskyttede transaksjon", async () => {
  for (const [name, input] of inputs) await execute(name, input, "admin");
  assert.equal(writes, 4); assert.equal(handlingKall, 4);
  assert(JSON.stringify(scopeRead).includes("synthetic-player"));
});
test("trekk mellom forslag og godkjenning stanser alle fire handlinger før mutasjon", async () => {
  aktivDeling = false;
  for (const [name, input] of inputs) await assert.rejects(execute(name, input, "admin"), /ikke tilgang/);
  assert.equal(writes, 0); assert.equal(handlingKall, 4);
});
test("ugyldig spiller-ID eller låsefeil gir ingen reservehandling", async () => {
  for (const id of [undefined, null, "", " ", 123]) {
    await assert.rejects(execute("draftPlayerMessage", { playerId: id, subject: "Golf", body: "Golf" }, "admin"), /ikke tilgang/);
  }
  assert.equal(handlingKall, 0);
  failLock = true;
  await assert.rejects(execute("draftPlayerNote", inputs[1][1], "admin"), /låsefeil/);
  assert.equal(writes, 0);
});
test("booking bruker separat administrativ port", async () => {
  administrativTilgang = false;
  await assert.rejects(execute("draftBookingProposal", { playerId: "synthetic-player" }, "admin"), /ikke tilgang/);
  assert.equal(handlingKall, 0); assert.equal(writes, 0);
});

test("dashboardets trener bruker faktisk COACH-rolle, ikke en konstruert ADMIN-rolle", async () => {
  actorRole = "COACH";
  await execute("draftPlayerMessage", inputs[0][1], "admin");
  assert.equal(writes, 1); assert.equal(handlingKall, 1);
  actorRole = "PLAYER";
  await assert.rejects(execute("draftPlayerMessage", inputs[0][1], "admin"), /ikke tilgang/);
  assert.equal(writes, 1); assert.equal(handlingKall, 1);
});

test("manglende aktør-ID kan ikke bli et uavgrenset oppslag på første administrator", async () => {
  for (const id of [undefined, null, "", " "]) {
    await assert.rejects(Reflect.apply(execute, null, ["draftPlayerMessage", inputs[0][1], id]), /ikke tilgang/);
  }
  assert.equal(writes, 0); assert.equal(handlingKall, 0);
});
