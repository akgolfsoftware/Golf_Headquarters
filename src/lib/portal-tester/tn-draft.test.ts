import assert from "node:assert/strict";
import { test } from "node:test";
import { tnProtocol } from "./tn-catalog";
import { tnNewDraft, tnPrepare, tnAcknowledge, tnReadRaw, TnDraftSchema } from "./tn-draft";
const p = tnProtocol("putt-1-3m")!;
const session = "b7f0d4a8-70d6-4d7a-8a73-682ed75ac000";
test("null, reelt nulltall og ugyldig tall holdes adskilt i utkast", () => {
  const result = tnReadRaw(p, { "1": { strokes: "0" }, "2": { strokes: "" }, "3": { strokes: "abc" } });
  assert.equal(result.values["1"].strokes, 0);
  assert.equal(result.values["2"].strokes, null);
  assert.ok(result.error);
});
test("køen fryser sendt operasjon selv om spilleren registrerer neste forsøk", () => {
  const original = { ...tnNewDraft("owner-a", session, p), localRevision: 1, raw: { "1": { strokes: "1" } } };
  const sent = tnPrepare(original, p, "draft");
  assert.ok(sent.pending?.input.mutationId);
  assert.equal(sent.pending?.input.ownerId, "owner-a");
  const edited = { ...sent, localRevision: 2, raw: { ...sent.raw, "2": { strokes: "2" } } };
  assert.deepEqual(tnPrepare(edited, p, "draft").pending, sent.pending);
  const ack = tnAcknowledge(edited, sent.pending!.input.mutationId!, { ok: true, revision: 1 });
  assert.equal(ack.localRevision, 2); assert.equal(ack.syncedRevision, 1);
  assert.equal(ack.raw["2"].strokes, "2");
  const next = tnPrepare(ack, p, "draft");
  assert.equal(next.pending?.input.revision, 1);
  assert.equal(next.pending?.input.values["2"].strokes, 2);
  assert.notEqual(next.pending?.input.mutationId, sent.pending?.input.mutationId);
});
test("nettbrudd og omstart bevarer samme sending; fullføring venter på utkastkvittering", () => {
  const original = { ...tnNewDraft("owner-a", session, p), localRevision: 1, raw: Object.fromEntries(p.rows.map((_, i) => [String(i + 1), { strokes: "1" }])) };
  const sent = tnPrepare(original, p, "draft");
  const restored = TnDraftSchema.parse(JSON.parse(JSON.stringify(sent)));
  const close = tnPrepare(restored, p, "complete");
  assert.equal(close.pending?.input.intent, "draft");
  assert.deepEqual(close.pending, sent.pending);
  const ack = tnAcknowledge(close, close.pending!.input.mutationId!, { ok: true, revision: 1 });
  const complete = tnPrepare(ack, p, "complete");
  assert.equal(complete.pending?.input.intent, "complete");
  const completed = tnAcknowledge(complete, complete.pending!.input.mutationId!, { ok: true, revision: 2 });
  assert.equal(completed.status, "COMPLETED");
  assert.throws(() => tnPrepare(completed, p, "draft"));
});
test("feil kvittering eller ufullstendige verdier kan ikke fullføre", () => {
  const original = { ...tnNewDraft("owner-a", session, p), localRevision: 1, raw: { "1": { strokes: "1" } } };
  assert.throws(() => tnPrepare(original, p, "complete"));
  const sent = tnPrepare(original, p, "draft");
  assert.throws(() => tnAcknowledge(sent, crypto.randomUUID(), { ok: true, revision: 1 }));
  assert.equal(sent.pending?.input.revision, 0);
});


test("en uavklart fullføring kan ikke kvittere nyere lokale endringer som fullført", () => {
  const original = { ...tnNewDraft("owner-a", session, p), localRevision: 1, raw: Object.fromEntries(p.rows.map((_, i) => [String(i + 1), { strokes: "1" }])) };
  const closing = tnPrepare(original, p, "complete");
  const changed = { ...closing, localRevision: 2, raw: { ...closing.raw, "1": { strokes: "2" } } };
  assert.throws(() => tnAcknowledge(changed, closing.pending!.input.mutationId!, { ok: true, revision: 1 }), /Lokale endringer/);
  assert.equal(tnAcknowledge(closing, closing.pending!.input.mutationId!, { ok: true, revision: 1 }).status, "COMPLETED");
});
