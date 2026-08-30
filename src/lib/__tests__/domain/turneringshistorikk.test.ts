import test from "node:test";
import assert from "node:assert/strict";

import {
  byggTurneringshistorikk,
  type TurneringsRad,
} from "@/lib/domain/turneringshistorikk";

function rad(o: Partial<TurneringsRad> & { navn: string; startDato: Date }): TurneringsRad {
  return {
    turneringId: o.turneringId ?? o.navn,
    navn: o.navn,
    // «in» og ikke ?? — ellers ville en eksplisitt null blitt overstyrt.
    kilde: "kilde" in o ? (o.kilde ?? null) : "GOLFBOX",
    tour: o.tour ?? "amateur-no",
    startDato: o.startDato,
    plassering: o.plassering ?? null,
    motPar: o.motPar ?? null,
    status: o.status ?? "FINISHED",
  };
}

// ── Tomme tilstander ───────────────────────────────────────────────────────

test("ukoblet spiller får en annen beskjed enn koblet uten turneringer", () => {
  const ukoblet = byggTurneringshistorikk([], false);
  const koblet = byggTurneringshistorikk([], true);

  assert.equal(ukoblet.harHistorikk, false);
  assert.equal(koblet.harHistorikk, false);
  assert.match(ukoblet.tomGrunn, /ikke koblet/);
  assert.match(koblet.tomGrunn, /[Ii]ngen registrerte turneringer/);
  assert.notEqual(ukoblet.tomGrunn, koblet.tomGrunn);
});

test("ukoblet med rader: koblingen mangler, radene brukes ikke", () => {
  const r = byggTurneringshistorikk([rad({ navn: "NM", startDato: new Date(2025, 5, 1) })], false);
  assert.equal(r.antall, 0);
  assert.equal(r.aar.length, 0);
});

// ── Gruppering ─────────────────────────────────────────────────────────────

test("grupperer per år, nyeste år først", () => {
  const r = byggTurneringshistorikk(
    [
      rad({ navn: "A", startDato: new Date(2023, 4, 1) }),
      rad({ navn: "B", startDato: new Date(2026, 4, 1) }),
      rad({ navn: "C", startDato: new Date(2024, 4, 1) }),
    ],
    true,
  );
  assert.deepEqual(r.aar.map((a) => a.aar), [2026, 2024, 2023]);
  assert.equal(r.spennFra, 2023);
  assert.equal(r.spennTil, 2026);
  assert.equal(r.antall, 3);
});

test("nyeste turnering først innenfor året", () => {
  const r = byggTurneringshistorikk(
    [
      rad({ navn: "Mai", startDato: new Date(2026, 4, 10) }),
      rad({ navn: "August", startDato: new Date(2026, 7, 20) }),
      rad({ navn: "Juni", startDato: new Date(2026, 5, 15) }),
    ],
    true,
  );
  assert.deepEqual(r.aar[0].turneringer.map((t) => t.navn), ["August", "Juni", "Mai"]);
});

// ── Plassering og TruthLayer ───────────────────────────────────────────────

test("beste plassering er laveste tall, per år og totalt", () => {
  const r = byggTurneringshistorikk(
    [
      rad({ navn: "A", startDato: new Date(2026, 4, 1), plassering: 12 }),
      rad({ navn: "B", startDato: new Date(2026, 6, 1), plassering: 4 }),
      rad({ navn: "C", startDato: new Date(2025, 6, 1), plassering: 31 }),
    ],
    true,
  );
  assert.equal(r.bestePlassering, 4);
  assert.equal(r.aar.find((a) => a.aar === 2026)!.bestePlassering, 4);
  assert.equal(r.aar.find((a) => a.aar === 2025)!.bestePlassering, 31);
});

test("trukket eller cuttet teller ALDRI som en plassering", () => {
  const r = byggTurneringshistorikk(
    [
      rad({ navn: "Trakk seg", startDato: new Date(2026, 4, 1), plassering: 2, status: "WITHDREW" }),
      rad({ navn: "Cut", startDato: new Date(2026, 5, 1), plassering: 1, status: "CUT" }),
      rad({ navn: "Påmeldt", startDato: new Date(2026, 6, 1), plassering: 1, status: "REGISTERED" }),
      rad({ navn: "Ekte", startDato: new Date(2026, 7, 1), plassering: 18, status: "FINISHED" }),
    ],
    true,
  );
  assert.equal(r.bestePlassering, 18, "de tre uten resultat teller ikke");
  assert.equal(r.medPlassering, 1);
  assert.equal(r.antall, 4, "men de vises fortsatt i historikken");
});

test("manglende plassering blir null, ikke et gjettet tall", () => {
  const r = byggTurneringshistorikk(
    [
      rad({ navn: "Uten resultat", startDato: new Date(2026, 4, 1) }),
      rad({ navn: "Også uten", startDato: new Date(2026, 5, 1) }),
    ],
    true,
  );
  assert.equal(r.bestePlassering, null);
  assert.equal(r.medPlassering, 0);
  assert.equal(r.harHistorikk, true, "historikken finnes selv uten plasseringer");
});

test("plassering 0 regnes ikke som en plassering", () => {
  const r = byggTurneringshistorikk(
    [rad({ navn: "Null", startDato: new Date(2026, 4, 1), plassering: 0 })],
    true,
  );
  assert.equal(r.bestePlassering, null);
  assert.equal(r.medPlassering, 0);
});

test("grunnlaget for beste plassering oppgis, ikke bare tallet", () => {
  const r = byggTurneringshistorikk(
    [
      rad({ navn: "A", startDato: new Date(2026, 4, 1), plassering: 9 }),
      rad({ navn: "B", startDato: new Date(2026, 5, 1), plassering: 22 }),
      rad({ navn: "C", startDato: new Date(2026, 6, 1) }),
    ],
    true,
  );
  assert.equal(r.bestePlassering, 9);
  assert.equal(r.medPlassering, 2, "2 av 3 rader har en plassering");
  assert.equal(r.antall, 3);
});

// ── Kilder ─────────────────────────────────────────────────────────────────

test("rad uten kilde bidrar ikke med en oppdiktet kilde", () => {
  const r = byggTurneringshistorikk(
    [
      rad({ navn: "A", startDato: new Date(2026, 4, 1), kilde: null }),
      rad({ navn: "B", startDato: new Date(2026, 5, 1), kilde: "NGF" }),
    ],
    true,
  );
  assert.deepEqual(r.kilder, ["NGF"]);
  assert.equal(r.antall, 2, "raden vises fortsatt");
});

test("kilder samles unikt og alfabetisk", () => {
  const r = byggTurneringshistorikk(
    [
      rad({ navn: "A", startDato: new Date(2026, 4, 1), kilde: "SRIXON" }),
      rad({ navn: "B", startDato: new Date(2026, 5, 1), kilde: "GOLFBOX" }),
      rad({ navn: "C", startDato: new Date(2026, 6, 1), kilde: "SRIXON" }),
      rad({ navn: "D", startDato: new Date(2025, 6, 1), kilde: "NGF" }),
    ],
    true,
  );
  assert.deepEqual(r.kilder, ["GOLFBOX", "NGF", "SRIXON"]);
});

test("historikk over mange år og kilder holder tellingen riktig", () => {
  const rader = Array.from({ length: 40 }, (_, i) =>
    rad({
      navn: `T${i}`,
      startDato: new Date(2020 + (i % 6), i % 12, 1 + (i % 27)),
      plassering: i % 5 === 0 ? null : (i % 40) + 1,
      kilde: i % 2 === 0 ? "GOLFBOX" : "NGF",
    }),
  );
  const r = byggTurneringshistorikk(rader, true);
  assert.equal(r.antall, 40);
  assert.equal(r.aar.reduce((s, a) => s + a.turneringer.length, 0), 40, "ingen rader mistes");
  assert.equal(r.spennFra, 2020);
  assert.equal(r.spennTil, 2025);
  assert.deepEqual(r.kilder, ["GOLFBOX", "NGF"]);
});
