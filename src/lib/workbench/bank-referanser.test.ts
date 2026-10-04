import assert from "node:assert/strict";
import { before, mock, test } from "node:test";
const viewer = { id: "syntetisk-spiller", role: "PLAYER" };
const rows = [
  { id: "system", source: "SYSTEM", createdBy: null, visibility: "PRIVATE" },
  { id: "egen", source: "PLAYER", createdBy: viewer.id, visibility: "PRIVATE" },
  { id: "coach", source: "COACH", createdBy: "aktuell-coach", visibility: "COACH_PLAYERS" },
  { id: "fremmed", source: "COACH", createdBy: "annen-coach", visibility: "COACH_PLAYERS" },
  { id: "privat", source: "COACH", createdBy: "annen-coach", visibility: "PRIVATE" },
  { id: "coach-privat", source: "COACH", createdBy: "aktuell-coach", visibility: "PRIVATE" },
];
const db = {
  exerciseDefinition: { findUnique: async ({ where }: { where: { id: string } }) => rows.find(r => r.id === where.id) ?? null, findMany: async () => [{ createdBy: "aktuell-coach" }, { createdBy: "annen-coach" }] },
  positionTask: { findUnique: async ({ where }: { where: { id: string } }) => where.id.startsWith("task") ? { id: where.id } : null, findFirst: async ({ where }: { where: { id: string; position: { plan: { userId: string } } } }) => where.id === "task-own" && where.position.plan.userId === viewer.id ? { id: where.id } : null },
  playerEnrollment: { findMany: async () => [{ coachId: "aktuell-coach" }], findFirst: async ({ where }: { where: { coachId: string } }) => where.coachId === "aktuell-coach" ? { id: "syntetisk-enrollment" } : null },
};
mock.module("@/lib/prisma", { namedExports: { prisma: db } });
mock.module("@/lib/auth/coached", { namedExports: { harCoachTilgangTilSpiller: async ({ id }: { id: string }) => id === "aktuell-coach" } });
let api: typeof import("./bank-referanser");
before(async () => { api = await import("./bank-referanser"); });
test("bankfilter bruker samme system/egen/coach-grunnlag som enkeltkildens vakt", async () => {
  const where = await api.bankOvelseWhere(viewer, viewer.id);
  assert.deepEqual(where, { OR: [{ source: "SYSTEM" }, { createdBy: viewer.id }, { source: "COACH", visibility: "COACH_PLAYERS", createdBy: { in: ["aktuell-coach"] } }, { source: "COACH", visibility: "PRIVATE", createdBy: { in: ["aktuell-coach"] } }] });
  for (const id of ["system", "egen", "coach", "coach-privat"]) assert.equal((await api.lastBankOvelse(id, viewer, viewer.id))?.id, id);
  for (const id of ["fremmed", "privat", "ukjent"]) assert.equal(await api.lastBankOvelse(id, viewer, viewer.id), null);
});
test("referanse avledes fra autorisert kilde; fri ID gir ingen tilgang", async () => {
  assert.deepEqual(await api.hentBankReferanser({ sourceId: "system" }, viewer, viewer.id), { ok: true, data: { sourceId: "system", exerciseId: "system", positionTaskId: undefined } });
  assert.equal((await api.hentBankReferanser({ sourceId: "drill:fremmed" }, viewer, viewer.id)).ok, false);
  assert.equal((await api.hentBankReferanser({ exerciseId: "privat" }, viewer, viewer.id)).ok, false);
  assert.equal((await api.hentBankReferanser({ sourceId: "drill:system", exerciseId: "egen" }, viewer, viewer.id)).ok, false);
  assert.equal((await api.hentBankReferanser({ exerciseId: "system", positionTaskId: "task-own" }, viewer, viewer.id)).ok, false);
  assert.equal((await api.hentBankReferanser({ sourceId: "tek:task-foreign" }, viewer, viewer.id)).ok, false);
  assert.equal((await api.hentBankReferanser({ sourceId: "tek:task-own" }, viewer, viewer.id)).ok, true);
  assert.deepEqual(await api.hentBankReferanser({ sourceId: "syntetisk-gammel-proveniens" }, viewer, viewer.id), { ok: true, data: { sourceId: "syntetisk-gammel-proveniens", exerciseId: undefined, positionTaskId: undefined } });
});
// Ingen ekte konto, bankrad eller database benyttes i disse enhetsprøvene.
