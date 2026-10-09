import assert from "node:assert/strict";
import { test } from "node:test";
import { hastighetForMotorikk, ovelseSnapshot, planlagtMengde } from "./wb-ovelse-logg";

test("snapshot henter område, sted, avstand, motorikk og belastning fra formelen", () => {
  assert.deepEqual(
    ovelseSnapshot({
      pyramid: "SLAG", area: "INNSPILL_100", motorikk: "AUTO", belastning: "TRENINGSOMRADE", label: "x",
      detaljer: { sted: { hoved: "GOLFBANE", delvalg: "Hull 3" } },
    }),
    { motorikk: "AUTO", omraade: "INNSPILL_100", sted: "Golfbane · Hull 3", avstand: "100–150 m", belastning: "TRENINGSOMRAADE" },
  );
});

test("område uten avstandsbånd og øvelse uten sted gir null, ikke gjetning", () => {
  const s = ovelseSnapshot({ pyramid: "SLAG", area: "CHIP", label: "x" });
  assert.equal(s.avstand, null);
  assert.equal(s.sted, null);
  assert.equal(s.motorikk, null);
  assert.equal(s.belastning, null);
});

test("ugyldig formel gir bare null-verdier", () => {
  assert.deepEqual(ovelseSnapshot({ ugyldig: true }), { motorikk: null, omraade: null, sted: null, avstand: null, belastning: null });
});

test("motorikk til hastighet i teknisk plan; ukjent teller ikke", () => {
  assert.equal(hastighetForMotorikk("UTEN_BALL"), "DRY");
  assert.equal(hastighetForMotorikk("LAV_HAST"), "LAV");
  assert.equal(hastighetForMotorikk("AUTO"), "FULL");
  assert.equal(hastighetForMotorikk(null), null);
});

test("planlagt mengde: antall, sett × reps, formelens mengde, ellers null", () => {
  assert.equal(planlagtMengde({ repAntall: 30, repSett: null, repReps: null, akFormel: {} }), 30);
  assert.equal(planlagtMengde({ repAntall: null, repSett: 3, repReps: 10, akFormel: {} }), 30);
  assert.equal(planlagtMengde({ repAntall: null, repSett: null, repReps: null,
    akFormel: { pyramid: "SLAG", area: "CHIP", label: "x", detaljer: { mengde: { enhet: "SLAG", antall: 40 } } } }), 40);
  assert.equal(planlagtMengde({ repAntall: 0, repSett: null, repReps: null, akFormel: {} }), null);
});
