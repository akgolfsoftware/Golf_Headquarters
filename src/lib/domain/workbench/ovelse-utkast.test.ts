import assert from "node:assert/strict";
import { test } from "node:test";

import { AkFormelSchema } from "@/lib/domain/workbench/schemas";
import { byggOvelse, FORESLATT_OMRADE, tomtUtkast, tommeUtkast } from "@/lib/domain/workbench/ovelse-utkast";

const FELLES = { title: "Lengdekontroll 100–150", durationMinutes: 20, description: "" };

test("pyramiden foreslår område, men alle utkast er egne", () => {
  assert.equal(FORESLATT_OMRADE.FYS, "STYRKE");
  assert.equal(FORESLATT_OMRADE.SPILL, "BANE");
  const u = tommeUtkast();
  u.TEK.stedHoved = "GOLFBANE";
  assert.equal(u.SLAG.stedHoved, "");
  assert.notEqual(u.TEK, u.SLAG);
});

test("teknikkøvelse bygges med hastighet, sted, måleutstyr, mengde og mål", () => {
  const r = byggOvelse(
    "TEK",
    {
      ...tomtUtkast("TEK"),
      area: "INNSPILL_100",
      stedHoved: "INNENDORS_GOLF",
      stedDelvalg: "Simulator",
      maaleutstyr: "MED_TRACKMAN",
      motorikk: "LAV_HAST",
      hastighet: "50",
      tekniskFokus: "LENGDEKONTROLL",
      treningsmaate: "BLOKK",
      press: "OBSERVERT",
      antall: "30",
      malsetning: "Jevn lengde",
      resultatkrav: "20 av 30 innenfor målområdet",
    },
    FELLES,
  );
  assert.equal(r.ok, true);
  if (!r.ok) return;
  const f = r.ovelse.akFormel;
  assert.equal(f.label, "TEK · Innspill 100–150 m");
  assert.equal(f.motorikk, "LAV_HAST");
  assert.equal(f.press, "OBSERVERT");
  assert.equal(f.belastning, "INNENDORS");
  assert.deepEqual(f.detaljer, {
    hastighetProsent: 50,
    tekniskFokus: "LENGDEKONTROLL",
    sted: { hoved: "INNENDORS_GOLF", delvalg: "Simulator" },
    maaleutstyr: "MED_TRACKMAN",
    treningsmaate: "BLOKK",
    mengde: { enhet: "SLAG", antall: 30 },
    mal: { resultatkrav: "20 av 30 innenfor målområdet" },
  });
  assert.equal(r.ovelse.techniqueFocus, "Jevn lengde");
  assert.equal(AkFormelSchema.safeParse(f).success, true);
});

test("Treningsområde gir riktig grov miljøverdi som Workbench skriver den", () => {
  const r = byggOvelse("TEK", { ...tomtUtkast("TEK"), stedHoved: "UTENDORS_TRENINGSOMRAADE" }, FELLES);
  assert.equal(r.ok && r.ovelse.akFormel.belastning, "TRENINGSOMRADE");
});

test("Fysisk styrke tar med serier og vekt, men ingen golffelt selv om de er fylt ut", () => {
  const r = byggOvelse(
    "FYS",
    { ...tomtUtkast("FYS"), motorikk: "AUTO", hastighet: "100", press: "OBSERVERT", maaleutstyr: "MED_TRACKMAN", antall: "4", reps: "6", vektKg: "60", rir: "2", pauseSek: "90" },
    { title: "Knebøy", durationMinutes: 25, description: "Tung" },
  );
  assert.equal(r.ok, true);
  if (!r.ok) return;
  assert.equal(r.ovelse.akFormel.motorikk, undefined);
  assert.equal(r.ovelse.akFormel.press, undefined);
  assert.deepEqual(r.ovelse.akFormel.detaljer, { mengde: { enhet: "SERIER", antall: 4, reps: 6, vektKg: 60, rir: 2, pauseSek: 90 } });
  assert.equal(r.ovelse.description, "Tung");
});

test("hastighet uten passende læringssteg forkastes", () => {
  const r = byggOvelse("TEK", { ...tomtUtkast("TEK"), motorikk: "AUTO", hastighet: "50" }, FELLES);
  assert.equal(r.ok && r.ovelse.akFormel.detaljer, undefined);
});

test("mangler navn eller varighet gir norsk feilmelding", () => {
  assert.deepEqual(byggOvelse("TEK", tomtUtkast("TEK"), { ...FELLES, title: "  " }), { ok: false, feil: "Øvelsen må ha et navn." });
  assert.equal(byggOvelse("TEK", tomtUtkast("TEK"), { ...FELLES, durationMinutes: 0 }).ok, false);
});

test("tom øvelse uten detaljer gir ingen detaljer-felt", () => {
  const r = byggOvelse("SLAG", tomtUtkast("SLAG"), FELLES);
  assert.equal(r.ok && "detaljer" in r.ovelse.akFormel, false);
});
