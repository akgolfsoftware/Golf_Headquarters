import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { INVARIANTER, kjorInvarianter, type KanonOkt, type KanonPeriode, type InvariantKontekst } from "./invarianter";

function inv(id: string) {
  const i = INVARIANTER.find((x) => x.id === id);
  if (!i) throw new Error(`Invariant ${id} mangler`);
  return i;
}

// Hjelpere for testdata
const d = (iso: string) => new Date(iso + "T10:00:00Z");
function okt(p: Partial<KanonOkt> & { dato: Date }): KanonOkt {
  return {
    id: p.id ?? "s1",
    dato: p.dato,
    varighetMin: p.varighetMin ?? 60,
    pyramide: p.pyramide ?? "TEK",
    lFase: p.lFase ?? null,
    csNivaa: p.csNivaa ?? null,
  };
}
const GRUNN: KanonPeriode = { type: "GRUNN", startDato: d("2026-01-01"), sluttDato: d("2026-03-31") };
const TURN: KanonPeriode = { type: "TURNERING", startDato: d("2026-06-01"), sluttDato: d("2026-08-31") };

describe("CANON-invarianter", () => {
  it("har 9 implementerte invarianter", () => {
    assert.equal(INVARIANTER.length, 9);
  });

  it("tek-min: TEK under min i GRUNN (25%) → brudd", () => {
    const ctx: InvariantKontekst = {
      perioder: [GRUNN],
      okter: [
        okt({ id: "a", dato: d("2026-01-10"), pyramide: "TEK", varighetMin: 30 }),
        okt({ id: "b", dato: d("2026-01-11"), pyramide: "FYS", varighetMin: 170 }),
      ],
    };
    const r = inv("tek-min").valider(ctx);
    assert.equal(r.ok, false);
    assert.equal(r.grense, 25);
    assert.ok((r.malt ?? 99) < 25);
  });

  it("tek-min: nok TEK → ok", () => {
    const ctx: InvariantKontekst = {
      perioder: [GRUNN],
      okter: [okt({ dato: d("2026-01-10"), pyramide: "TEK", varighetMin: 100 })],
    };
    assert.equal(inv("tek-min").valider(ctx).ok, true);
  });

  it("cs50-ballkontakt: SLAG-økt uten CS → brudd", () => {
    const ctx: InvariantKontekst = {
      perioder: [GRUNN],
      okter: [okt({ id: "x", dato: d("2026-01-10"), pyramide: "SLAG", csNivaa: null })],
    };
    const r = inv("cs50-ballkontakt").valider(ctx);
    assert.equal(r.ok, false);
    assert.deepEqual(r.sessionIds, ["x"]);
  });

  it("cs50-ballkontakt: SLAG-økt med CS satt → ok", () => {
    const ctx: InvariantKontekst = {
      perioder: [GRUNN],
      okter: [okt({ dato: d("2026-01-10"), pyramide: "SLAG", csNivaa: "CS70" })],
    };
    assert.equal(inv("cs50-ballkontakt").valider(ctx).ok, true);
  });

  it("alder-timer: 15 t/uke > 14 år → brudd; ukjent alder → ok", () => {
    // Man–fre i samme ISO-uke (12.–16. jan 2026), 5×180 = 900 min = 15 t
    const okter = Array.from({ length: 5 }, (_, i) =>
      okt({ id: `d${i}`, dato: new Date(Date.UTC(2026, 0, 12 + i, 10)), varighetMin: 180 }),
    );
    assert.equal(inv("alder-timer").valider({ perioder: [GRUNN], okter, spillerAlder: 14 }).ok, false);
    assert.equal(inv("alder-timer").valider({ perioder: [GRUNN], okter, spillerAlder: null }).ok, true);
  });

  it("maks-2-svingendringer: 3 innlærings-økter i TURNERING → brudd", () => {
    const okter = [
      okt({ id: "1", dato: d("2026-06-10"), lFase: "L_KROPP" }),
      okt({ id: "2", dato: d("2026-06-11"), lFase: "L_ARM" }),
      okt({ id: "3", dato: d("2026-06-12"), lFase: "L_KOLLE" }),
      okt({ id: "4", dato: d("2026-06-13"), lFase: "L_AUTO" }),
    ];
    const r = inv("maks-2-svingendringer-turnering").valider({ perioder: [TURN], okter });
    assert.equal(r.ok, false);
    assert.equal(r.malt, 3);
  });

  it("cs-tak: CS80 i GRUNN (tak 70) → brudd", () => {
    const ctx: InvariantKontekst = {
      perioder: [GRUNN],
      okter: [okt({ id: "h", dato: d("2026-01-10"), csNivaa: "CS80" })],
    };
    assert.equal(inv("cs-tak").valider(ctx).ok, false);
  });

  it("l-fase-tillatt: L_AUTO i GRUNN (ikke tillatt) → brudd", () => {
    const ctx: InvariantKontekst = {
      perioder: [GRUNN],
      okter: [okt({ dato: d("2026-01-10"), lFase: "L_AUTO" })],
    };
    assert.equal(inv("l-fase-tillatt").valider(ctx).ok, false);
  });

  it("hviledager (myk): trening alle 7 dager → brudd", () => {
    const okter = Array.from({ length: 7 }, (_, i) =>
      okt({ id: `h${i}`, dato: new Date(Date.UTC(2026, 0, 5 + i, 10)), varighetMin: 60 }),
    );
    const r = inv("hviledager-min").valider({ perioder: [GRUNN], okter });
    assert.equal(r.ok, false);
    assert.equal(inv("hviledager-min").alvorlighet, "myk");
  });

  it("kjorInvarianter returnerer kun brudd, filtrerbart på scope", () => {
    const ctx: InvariantKontekst = {
      perioder: [GRUNN],
      okter: [okt({ dato: d("2026-01-10"), pyramide: "SLAG", csNivaa: null })],
    };
    const alle = kjorInvarianter(ctx);
    assert.ok(alle.length >= 1);
    const kunOkt = kjorInvarianter(ctx, "okt");
    assert.ok(kunOkt.every((r) => r.invariant.scope === "okt"));
  });
});
