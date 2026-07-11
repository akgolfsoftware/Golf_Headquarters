import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { planleggUkeKopi, planleggUkeVarighet, type UkeOkt } from "@/lib/plan-templates/uke-verktoy";

function mkOkt(over: Partial<UkeOkt> = {}): UkeOkt {
  return {
    id: "id1",
    ukeNr: 1,
    dagNr: 1,
    title: "Økt",
    varighetMin: 60,
    pyramidArea: "TEK",
    skillArea: null,
    environment: "RANGE",
    drillsJson: [{ exerciseId: "d1", sets: 3, reps: 10 }],
    focus: "Fokus",
    notes: null,
    ...over,
  };
}

describe("planleggUkeKopi", () => {
  it("tom kilde-uke → tom-kilde, ingenting skrives", () => {
    const res = planleggUkeKopi([], 2, [], false);
    assert.deepEqual(res, { status: "tom-kilde" });
  });

  it("mål-uke ikke tom uten overskriv → konflikt med antall", () => {
    const kilde = [mkOkt({ id: "k1" })];
    const maal = [mkOkt({ id: "m1" }), mkOkt({ id: "m2", dagNr: 2 })];
    const res = planleggUkeKopi(kilde, 3, maal, false);
    assert.deepEqual(res, { status: "konflikt", antallIMaal: 2 });
  });

  it("mål-uke tom → kopierer uten å slette noe", () => {
    const kilde = [mkOkt({ id: "k1", dagNr: 1 }), mkOkt({ id: "k2", dagNr: 3 })];
    const res = planleggUkeKopi(kilde, 2, [], false);
    assert.equal(res.status, "ok");
    if (res.status !== "ok") return;
    assert.deepEqual(res.slettIds, []);
    assert.equal(res.nyeRader.length, 2);
    assert.ok(res.nyeRader.every((r) => r.ukeNr === 2));
    assert.deepEqual(res.nyeRader.map((r) => r.dagNr), [1, 3]);
  });

  it("overskriv=true → planlegger sletting av mål-øktene + nye rader", () => {
    const kilde = [mkOkt({ id: "k1", title: "Ny økt" })];
    const maal = [mkOkt({ id: "gammel1" }), mkOkt({ id: "gammel2", dagNr: 5 })];
    const res = planleggUkeKopi(kilde, 4, maal, true);
    assert.equal(res.status, "ok");
    if (res.status !== "ok") return;
    assert.deepEqual(res.slettIds.sort(), ["gammel1", "gammel2"]);
    assert.equal(res.nyeRader.length, 1);
    assert.equal(res.nyeRader[0].title, "Ny økt");
    assert.equal(res.nyeRader[0].ukeNr, 4);
  });

  it("kloner alle felt inkl. drillsJson og notes", () => {
    const kilde = [
      mkOkt({
        id: "k1",
        title: "Wedge-matrise",
        varighetMin: 90,
        pyramidArea: "SLAG",
        skillArea: "TILNAERMING",
        environment: "BANE",
        drillsJson: [{ exerciseId: "d9", sets: 4, reps: 8, csTarget: 75 }],
        focus: "Distansekontroll",
        notes: "Fokus på 60-100m",
      }),
    ];
    const res = planleggUkeKopi(kilde, 2, [], false);
    assert.equal(res.status, "ok");
    if (res.status !== "ok") return;
    const [rad] = res.nyeRader;
    assert.equal(rad.title, "Wedge-matrise");
    assert.equal(rad.varighetMin, 90);
    assert.equal(rad.pyramidArea, "SLAG");
    assert.equal(rad.skillArea, "TILNAERMING");
    assert.equal(rad.environment, "BANE");
    assert.deepEqual(rad.drillsJson, [{ exerciseId: "d9", sets: 4, reps: 8, csTarget: 75 }]);
    assert.equal(rad.focus, "Distansekontroll");
    assert.equal(rad.notes, "Fokus på 60-100m");
    assert.ok(!("id" in rad));
  });
});

describe("planleggUkeVarighet", () => {
  it("tom uke → tom-uke", () => {
    assert.deepEqual(planleggUkeVarighet([]), { status: "tom-uke" });
  });

  it("returnerer id-ene til øktene som skal oppdateres", () => {
    const okter = [mkOkt({ id: "a" }), mkOkt({ id: "b", dagNr: 3 })];
    const res = planleggUkeVarighet(okter);
    assert.deepEqual(res, { status: "ok", oktIder: ["a", "b"] });
  });
});
