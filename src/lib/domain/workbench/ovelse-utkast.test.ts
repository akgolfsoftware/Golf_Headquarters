import assert from "node:assert/strict";
import { test } from "node:test";

import { AkFormelSchema } from "@/lib/domain/workbench/schemas";
import { byggOvelse, FORESLATT_OMRADE, tomtUtkast, tommeUtkast, utkastFraOvelse } from "@/lib/domain/workbench/ovelse-utkast";
import type { Drill } from "@/lib/domain/workbench/types";

const FELLES = { title: "Lengdekontroll 100–150", durationMinutes: 20, description: "" };

test("forhåndsutfylling leser alle kjente felter og beholder registrerte nuller i fysisk mengde", () => {
  const drill: Drill = { id: "syntetisk", order: 0, title: "Syntetisk", description: "Gjennomføring", durationMinutes: 20,
    techniqueFocus: "Målsetning", akFormel: { pyramid: "FYS", area: "STYRKE", label: "Fysisk", detaljer: {
      sted: { hoved: "FYSISK_TRENINGSSTED", delvalg: "Styrkerom" },
      mengde: { enhet: "SERIER", antall: 4, reps: 6, vektKg: 0, rir: 0, pauseSek: 0 },
      mal: { malsetning: "Målsetning", malemetode: "Metode", resultatkrav: "Krav", notat: "Notat" },
    } } };
  const utkast = utkastFraOvelse(drill);
  assert.equal(utkast.FYS.rir, "0"); assert.equal(utkast.FYS.vektKg, "0"); assert.equal(utkast.FYS.pauseSek, "0");
  assert.equal(utkast.FYS.stedDelvalg, "Styrkerom"); assert.equal(utkast.FYS.malsetning, "Målsetning");
  assert.equal(utkast.TEK.malsetning, "");
  const result = byggOvelse("FYS", utkast.FYS, { title: drill.title, description: drill.description ?? "", durationMinutes: drill.durationMinutes }, drill);
  assert.ok(result.ok);
  if (result.ok) { assert.deepEqual(result.ovelse.akFormel.detaljer, drill.akFormel.detaljer); assert.equal(result.ovelse.techniqueFocus, drill.techniqueFocus); }
});

test("redigering av navn mister ikke lagrede fysiske dosefelt når antall serier er uavklart", () => {
  const drill: Drill = { id: "syntetisk", order: 0, title: "Syntetisk", durationMinutes: 20,
    akFormel: { pyramid: "FYS", area: "STYRKE", label: "Fysisk", detaljer: { mengde: { enhet: "SERIER", reps: 6, vektKg: 60, rir: 0 } } } };
  const result = byggOvelse("FYS", utkastFraOvelse(drill).FYS, { title: "Endret navn", description: "", durationMinutes: 20 });
  assert.ok(result.ok);
  if (result.ok) assert.deepEqual(result.ovelse.akFormel.detaljer?.mengde, drill.akFormel.detaljer?.mengde);
});

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
    mal: { malsetning: "Jevn lengde", resultatkrav: "20 av 30 innenfor målområdet" },
  });
  assert.equal(r.ovelse.akFormel.detaljer?.mal?.malsetning, "Jevn lengde");
  assert.equal(r.ovelse.techniqueFocus, undefined);
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

test("P-posisjon blir aldri forhåndsutfylt som mål, og ny målsetning bevarer rå historisk fokus", () => {
  const original: Drill = { id: "syntetisk", order: 0, title: "Syntetisk", durationMinutes: 20, techniqueFocus: "P4.0", positionTaskId: "syntetisk-task", akFormel: { pyramid: "TEK", area: "TEE_TOTAL", label: "Syntetisk" } };
  const u = utkastFraOvelse(original).TEK; assert.equal(u.malsetning, "");
  u.malsetning = "Syntetisk nytt mål";
  const built = byggOvelse("TEK", u, FELLES, original); assert.ok(built.ok);
  if (built.ok) { assert.equal(built.ovelse.techniqueFocus, "P4.0"); assert.equal(built.ovelse.akFormel.detaljer?.mal?.malsetning, "Syntetisk nytt mål"); }
});
