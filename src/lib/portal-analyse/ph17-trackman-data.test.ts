import test from "node:test";
import assert from "node:assert/strict";
import {
  formaterDesimal,
  formaterHeltall,
  beregnGappingRader,
  STANDARD_PH17_DATA,
} from "./ph17-trackman-data";

test("ph17-trackman-data", async (t) => {
  await t.test("formaterer desimaltall korrekt uten .toFixed med komma", () => {
    assert.equal(formaterDesimal(150.4), "150,4");
    assert.equal(formaterDesimal(1.37, 2), "1,37");
    assert.equal(formaterDesimal(-3.2), "−3,2");
    assert.equal(formaterDesimal(null), "—");
  });

  await t.test("formaterer heltall med mellomrom som tusenskille", () => {
    assert.equal(formaterHeltall(9180), "9 180");
    assert.equal(formaterHeltall(6480), "6 480");
    assert.equal(formaterHeltall(-617), "−617");
    assert.equal(formaterHeltall(null), "—");
  });

  await t.test("beregner gapping-rader og flagger overlapp og hull riktig", () => {
    const kilde: Array<[string, number, number]> = [
      ["Driver", 228.4, 18.2],
      ["3W", 201.0, 14.6], // gap: 27.4 -> Hull (> 18)
      ["5W", 195.0, 12.1], // gap: 6.0 -> Overlapp (< 8)
      ["7i", 150.0, 8.1],
    ];
    const rader = beregnGappingRader(kilde);
    assert.equal(rader.length, 4);
    assert.equal(rader[0].flag, "Hull");
    assert.equal(rader[1].flag, "Overlapp");
    assert.equal(rader[3].gapTilNeste, null);
    assert.equal(rader[3].flag, null);
  });

  await t.test("leverer komplett datamodell for de fire delene i TrackMan", () => {
    assert.equal(STANDARD_PH17_DATA.sessions.length, 3);
    assert.ok(STANDARD_PH17_DATA.gapping.length > 0);
    assert.ok(STANDARD_PH17_DATA.gear.length > 0);
    assert.equal(STANDARD_PH17_DATA.station.rows.length, 7);
  });
});
