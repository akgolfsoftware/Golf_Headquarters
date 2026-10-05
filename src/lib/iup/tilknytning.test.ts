import assert from "node:assert/strict";
import { test } from "node:test";
import { aktivIupTilknytningWhere, iupSynligForSpillerWhere } from "./tilknytning";

test("IUP er synlig bare med aktivt WANG-/TN-medlemskap, ikke med gamle svar alene", () => {
  const where = iupSynligForSpillerWhere("syntetisk-spiller");
  assert.equal(where.id, "syntetisk-spiller");
  assert.equal(where.deletedAt, null);
  assert.equal(where.anonymisertAt, null);
  assert.deepEqual(where.groupMemberships, { some: aktivIupTilknytningWhere() });
  // Den gamle regelen slapp inn eiere av tidligere besvarelser. Den finnes ikke lenger.
  assert.equal("OR" in where, false);
  assert.equal("iupBesvarelser" in where, false);
});

test("tilknytningen krever avsluttet = null og WANG- eller Team Norway-gruppe", () => {
  const where = aktivIupTilknytningWhere();
  assert.equal(where.endedAt, null);
  const gruppe = where.group as { arkivertAt: null; OR: unknown[] };
  assert.equal(gruppe.arkivertAt, null);
  assert.equal(gruppe.OR.length, 2);
});
