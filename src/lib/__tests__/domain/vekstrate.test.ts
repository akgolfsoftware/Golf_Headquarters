import test from "node:test";
import assert from "node:assert/strict";

import {
  beregnVekstrate,
  grupperPerSesong,
  MIN_SESONGER,
  MIN_SPILLERE_KOHORT,
  type KohortSesongSnitt,
} from "@/lib/domain/vekstrate";

function punkt(aar: number, snitt: number, dagIAar = 1): { dato: Date; snitt: number } {
  return { dato: new Date(aar, 0, dagIAar), snitt };
}

function kohort(aar: number, snitt: number, antallSpillere = MIN_SPILLERE_KOHORT): KohortSesongSnitt {
  return { aar, snitt, antallSpillere };
}

// ── For lite data ──────────────────────────────────────────────────────────

test("ingen punkter: ærlig tomt svar, ingen rate", () => {
  const r = beregnVekstrate([]);
  assert.equal(r.harSvar, false);
  assert.equal(r.egenRate, null);
  assert.equal(r.kohortRate, null);
  assert.match(r.grunnlag, /[Ii]ngen turneringer/);
});

test("kun én sesong: sier at det trengs minst to", () => {
  const r = beregnVekstrate([punkt(2026, 10), punkt(2026, 8)]);
  assert.equal(r.harSvar, false);
  assert.equal(r.egenRate, null);
  assert.match(r.grunnlag, /2026/);
  assert.match(r.grunnlag, /minst to sesonger/);
  assert.equal(r.punkter.length, 1);
});

test("MIN_SESONGER er 2 — dokumenterer grensen testene bygger på", () => {
  assert.equal(MIN_SESONGER, 2);
});

// ── Gruppering ───────────────────────────────────────────────────────────

test("grupperPerSesong: snitter flere turneringer i samme år, sortert stigende", () => {
  const g = grupperPerSesong([punkt(2025, 10), punkt(2024, 20), punkt(2024, 10)]);
  assert.deepEqual(
    g.map((s) => s.aar),
    [2024, 2025],
  );
  assert.equal(g[0].snitt, 15); // (20+10)/2
  assert.equal(g[0].antallTurneringer, 2);
  assert.equal(g[1].snitt, 10);
});

// ── Egen rate ────────────────────────────────────────────────────────────

test("forbedring over tid gir negativ rate (lavere til-par er bedre)", () => {
  const r = beregnVekstrate([punkt(2024, 14.8), punkt(2025, 12.1), punkt(2026, 8.4)]);
  assert.equal(r.harSvar, true);
  assert.equal(r.fraAar, 2024);
  assert.equal(r.tilAar, 2026);
  // (8,4 - 14,8) / 2 = -3,2
  assert.equal(r.egenRate, -3.2);
  assert.equal(r.punkter.length, 3);
});

test("tilbakegang gir positiv rate", () => {
  const r = beregnVekstrate([punkt(2024, 8), punkt(2026, 12)]);
  assert.equal(r.egenRate, 2);
});

test("rate deles på faktisk årsspenn, ikke antall punkter (hull i historikken telles med)", () => {
  // 2024 og 2027 — tre års spenn, ett hull (2025/2026 uten turnering).
  const r = beregnVekstrate([punkt(2024, 15), punkt(2027, 6)]);
  assert.equal(r.fraAar, 2024);
  assert.equal(r.tilAar, 2027);
  // (6 - 15) / 3 = -3
  assert.equal(r.egenRate, -3);
});

test("grunnlag nevner årsspennet og totalt antall turneringer", () => {
  const r = beregnVekstrate([punkt(2024, 10), punkt(2024, 12), punkt(2026, 8)]);
  assert.match(r.grunnlag, /2024→2026/);
  assert.match(r.grunnlag, /3 turneringer/);
});

// ── Kohort — coach-only referanse ──────────────────────────────────────────

test("uten kohortdata: egen rate vises, harKohort er false", () => {
  const r = beregnVekstrate([punkt(2024, 14), punkt(2026, 8)]);
  assert.equal(r.harSvar, true);
  assert.equal(r.harKohort, false);
  assert.equal(r.kohortRate, null);
  assert.ok(r.punkter.every((p) => p.kohort === null));
});

test("med gyldig kohort: kohortRate regnes over samme spenn som spilleren", () => {
  const r = beregnVekstrate(
    [punkt(2024, 14.8), punkt(2025, 12.1), punkt(2026, 8.4)],
    [kohort(2024, 13.4), kohort(2025, 12.4), kohort(2026, 11.1)],
  );
  assert.equal(r.harKohort, true);
  // (11,1 - 13,4) / 2 = -1,15 → avrundet -1,2
  assert.equal(r.kohortRate, -1.2);
  assert.equal(r.punkter[0].kohort, 13.4);
  assert.equal(r.punkter[2].kohort, 11.1);
});

test("kohort-sesong under MIN_SPILLERE_KOHORT teller ikke — for tynt til å stå for et snitt", () => {
  const r = beregnVekstrate(
    [punkt(2024, 14), punkt(2026, 8)],
    [kohort(2024, 13, MIN_SPILLERE_KOHORT - 1), kohort(2026, 11, MIN_SPILLERE_KOHORT)],
  );
  assert.equal(r.harKohort, false);
  assert.equal(r.kohortRate, null);
  // 2024-punktet mangler kohortsnitt fordi det ikke var nok spillere det året.
  assert.equal(r.punkter[0].kohort, null);
});

test("kohortdata utenfor spillerens årsspenn brukes ikke til raten", () => {
  const r = beregnVekstrate(
    [punkt(2025, 14), punkt(2026, 8)],
    [kohort(2024, 20), kohort(2025, 13), kohort(2026, 11)],
  );
  // Spennet er 2025→2026 — 2024-kohorten er irrelevant for raten.
  assert.equal(r.harKohort, true);
  assert.equal(r.kohortRate, -2); // (11-13)/1
});
