import { test } from "node:test";
import assert from "node:assert/strict";
import {
  byggFeltRader,
  erDataGolfKilde,
  fmtDatoNb,
  fmtDgTall,
  initialer,
  klassifiserKilde,
  kunDataGolf,
  pgaPuttKildeTekst,
  restAv,
  snitt,
  svakesteBotte,
  BROADIE_PUTT_KILDE,
} from "./datagolf-kort";

test("klassifiserKilde skiller de tre motorene", () => {
  assert.equal(klassifiserKilde("DATAGOLF"), "DATAGOLF");
  assert.equal(klassifiserKilde("datagolf-approach-skill-2026-08"), "DATAGOLF");
  assert.equal(klassifiserKilde(BROADIE_PUTT_KILDE), "BROADIE");
  assert.equal(klassifiserKilde("broadie-estimate"), "BROADIE");
  assert.equal(klassifiserKilde("PEI"), "PEI");
  assert.equal(klassifiserKilde("PLAYERHQ"), "UKJENT");
  assert.equal(klassifiserKilde(null), "UKJENT");
});

test("kunDataGolf dropper Broadie og PEI — aldri i samme felt", () => {
  const rader = [
    { id: "a", source: "DATAGOLF", sg: 0.4 },
    { id: "b", source: "broadie-estimate", sg: 1.2 },
    { id: "c", source: "PEI", sg: -0.3 },
    { id: "d", source: "NGF", sg: 0.1 },
  ];
  const kun = kunDataGolf(rader);
  assert.deepEqual(
    kun.map((r) => r.id),
    ["a"],
  );
  assert.equal(erDataGolfKilde("DATAGOLF"), true);
  assert.equal(erDataGolfKilde("broadie-estimate"), false);
});

test("pgaPuttKildeTekst merker Broadie-tabellen", () => {
  assert.match(pgaPuttKildeTekst("broadie-estimate"), /Broadie-tabell/);
  assert.match(pgaPuttKildeTekst("broadie-estimate"), /ikke DataGolf/);
  assert.match(pgaPuttKildeTekst("datagolf"), /DataGolf/);
  assert.match(pgaPuttKildeTekst(null), /mangler/);
});

test("snitt ignorerer null og tom liste", () => {
  assert.equal(snitt([]), null);
  assert.equal(snitt([null, undefined]), null);
  assert.ok(Math.abs((snitt([0.4, 0.2, null]) ?? 0) - 0.3) < 1e-9);
});

test("restAv krever begge DataGolf-tall", () => {
  assert.ok(Math.abs((restAv(0.38, 0.41) ?? 0) - -0.03) < 1e-9);
  assert.equal(restAv(null, 0.41), null);
  assert.equal(restAv(0.38, null), null);
});

test("fmtDgTall er norsk og sier mangler — aldri 0 for null", () => {
  assert.equal(fmtDgTall(0.41), "+0,41");
  assert.equal(fmtDgTall(-0.05), "−0,05");
  assert.equal(fmtDgTall(0), "0,00");
  assert.equal(fmtDgTall(null), "mangler");
  assert.equal(fmtDgTall(undefined), "mangler");
});

test("byggFeltRader anonymiserer og krever minst to", () => {
  assert.deepEqual(byggFeltRader([{ id: "du", erDu: true, verdi: 0.4 }], 0.4), []);
  const vis = byggFeltRader(
    [
      { id: "du", erDu: true, verdi: 0.41 },
      { id: "a", erDu: false, verdi: 0.74 },
      { id: "b", erDu: false, verdi: -0.05 },
    ],
    0.3666666666666667,
  );
  assert.equal(vis[0]?.label, "Spiller A");
  assert.equal(vis[1]?.label, "Du");
  assert.equal(vis[1]?.erDu, true);
  assert.equal(vis[2]?.label, "Spiller B");
  assert.equal(vis.length, 3);
});

test("svakesteBotte er den mest negative — tom når alle mangler", () => {
  assert.equal(svakesteBotte([{ label: "125–150", verdi: null }]), null);
  const s = svakesteBotte([
    { label: "50–75", verdi: 0.12 },
    { label: "125–150", verdi: -0.64 },
    { label: "175+", verdi: 0.04 },
  ]);
  assert.equal(s?.label, "125–150");
  assert.equal(s?.verdi, -0.64);
});

test("initialer fra fullt navn", () => {
  assert.equal(initialer("Øyvind Rohjan"), "ØR");
  assert.equal(initialer("Filip"), "FI");
  assert.equal(initialer("  "), "");
});

test("fmtDatoNb er Oslo-dato DD.MM.ÅÅÅÅ", () => {
  assert.equal(fmtDatoNb(new Date("2026-08-22T00:30:00Z")), "22.08.2026");
});
