import assert from "node:assert/strict";
import { test } from "node:test";
import {
  alleUkerIMaaned, gjeldendeOverstyringer, maanedKvittering, overstyrteUkenokler, parseUkeOverstyringer, ukerForMaaned,
} from "./maanedsplan-regler";

test("uke hører til måneden der torsdagen ligger", () => {
  // Oktober 2026: torsdagene er 1., 8., 15., 22., 29. → uke 40–44.
  const uker = alleUkerIMaaned(2026, 10).map((u) => u.weekNumber);
  assert.deepEqual(uker, [40, 41, 42, 43, 44]);
  // Uke 44 (26.–1. nov) hører til oktober; uke 45 (2. nov) hører til november.
  assert.equal(alleUkerIMaaned(2026, 11)[0].weekNumber, 45);
});

test("gåtte uker er ikke med", () => {
  const uker = ukerForMaaned(2026, 10, "2026-10-14").map((u) => u.weekNumber);
  assert.deepEqual(uker, [42, 43, 44]);
});

test("parseUkeOverstyringer dropper ugyldige og tomme oppføringer", () => {
  const r = parseUkeOverstyringer({ "2026-U42": { FYS: 120 }, "2026-U43": {}, "feil": { FYS: 60 }, "2026-U44": { FYS: 7 } });
  assert.deepEqual(r, { "2026-U42": { FYS: 120 } });
  assert.deepEqual(parseUkeOverstyringer(null), {});
  assert.deepEqual(parseUkeOverstyringer([1]), {});
});

test("gjeldendeOverstyringer tar bare kommende uker i måneden", () => {
  const o = { "2026-U41": { FYS: 60 }, "2026-U43": { FYS: 120 }, "2026-U45": { FYS: 30 } };
  const g = gjeldendeOverstyringer(o, 2026, 10, "2026-10-14");
  assert.deepEqual(g.map((x) => x.uke.weekNumber), [43]);
});

test("overstyrteUkenokler samler på tvers av måneder", () => {
  const n = overstyrteUkenokler([{ weekAxisMinutes: { "2026-U42": { FYS: 60 } } }, { weekAxisMinutes: null }, { weekAxisMinutes: { "2026-U46": { TEK: 60 } } }]);
  assert.deepEqual([...n].sort(), ["2026-U42", "2026-U46"]);
});

test("kvittering", () => {
  assert.equal(maanedKvittering({ antallUker: 0, fraUke: null, tilUke: null }), "Måneden er lagret.");
  assert.match(maanedKvittering({ antallUker: 3, fraUke: "2026-U42", tilUke: "2026-U44" }), /3 uker oppdatert/);
  assert.match(maanedKvittering(undefined, true), /ikke oppdatert/);
});
