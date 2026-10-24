import assert from "node:assert/strict";
import { test } from "node:test";
import { AkUkeforslagKanIkkeGodkjennes, AkBeslutningAlleredeBehandlet, medAkBeslutningskvittering, krevRegistrertAkBeslutning } from "./ak-beslutningskvittering";

test("only a matching recorded decision can produce an interactive success", () => {
  for (const valg of ["ACCEPTED", "REJECTED"] as const) {
    assert.doesNotThrow(() => krevRegistrertAkBeslutning({ status: valg }, valg));
    for (const status of ["UNCHANGED", "PROCESSING", "SUPERSEDED", "PENDING", "ACCEPTED", "REJECTED"]) {
      if (status !== valg) assert.throws(() => krevRegistrertAkBeslutning({ status }, valg), /allerede behandlet eller erstattet/);
    }
  }
});

test("question receipt distinguishes recorded question from a no-op without deciding the proposal", () => {
  assert.doesNotThrow(() => krevRegistrertAkBeslutning({ status: "UNCHANGED", questionRecorded: true }, "QUESTION"));
  for (const result of [{ status: "UNCHANGED" }, { status: "UNCHANGED", questionRecorded: false },
    { status: "ACCEPTED", questionRecorded: true }, { status: "REJECTED" }]) {
    assert.throws(() => krevRegistrertAkBeslutning(result, "QUESTION"), /allerede behandlet eller erstattet/);
  }
});


test("client receipt serializes only the known no-op and never arbitrary error details", async () => {
  assert.deepEqual(await medAkBeslutningskvittering(async () => {}), { ok: true });
  const receipt = await medAkBeslutningskvittering(async () => {
    krevRegistrertAkBeslutning({ status: "UNCHANGED" }, "ACCEPTED");
  });
  assert.deepEqual(JSON.parse(JSON.stringify(receipt)), {
    ok: false, kode: "ALLEREDE_BEHANDLET",
    feil: "Forslaget er allerede behandlet eller erstattet. Oppdater oversikten før du prøver igjen.", oppdater: true,
  });
  for (const error of [new Error("forbidden"), new Error("synthetic private database detail"),
    new Error(new AkBeslutningAlleredeBehandlet().message)]) {
    await assert.rejects(medAkBeslutningskvittering(async () => { throw error; }), e => e === error);
  }
});


test("known proposal blockers produce fixed receipts without serializing exception details", async () => {
  const cases = [
    ["utdatert-ukegrunnlag", "UKEGRUNNLAG_ENDRET"],
    ["utdatert-bankgrunnlag", "BANKGRUNNLAG_ENDRET"],
    ["utdatert-faglig-vurdering", "FAGLIG_VURDERING_ENDRET"],
    ["maneds-ukevalg-ikke-stottet", "PLANVALG_KREVER_GJENNOMGANG"],
  ] as const;
  for (const [grunn, kode] of cases) {
    const error = new AkUkeforslagKanIkkeGodkjennes(grunn);
    error.message = "synthetic private detail";
    const result = await medAkBeslutningskvittering(async () => { throw error; });
    assert.equal(result.ok, false); assert.ok(!result.ok);
    assert.equal(result.kode, kode); assert.equal(result.oppdater, true);
    assert.doesNotMatch(JSON.stringify(result), /private detail|stack|spillerId|Ingenting er lagret/);
    assert.match(result.feil, /på nytt|gjennomgås/);
    for (const impostor of [new Error(grunn), { grunn, message: grunn }]) {
      await assert.rejects(medAkBeslutningskvittering(async () => { throw impostor; }), e => e === impostor);
    }
  }
});
