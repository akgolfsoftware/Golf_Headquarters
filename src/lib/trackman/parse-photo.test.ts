import { test } from "node:test";
import assert from "node:assert/strict";
import { csvShotsToCanonical } from "./canonical";
import { trackManShotsForPreview } from "./preview";

test("fotoavlesning bevarer kildeenheter og avviser usikre modellresultater", async (t) => {
  let response = "";
  let modelError = false;
  t.mock.module("@/lib/ai/client", {
    namedExports: {
      anthropic: { messages: { create: async () => {
        if (modelError) throw new Error("Syntetisk leverandørfeil");
        return {};
      } } },
      tekstFra: () => response,
    },
  });
  const { parseTrackManPhoto } = await import("./parse-photo");
  const parse = async (shots: unknown[]) => {
    response = JSON.stringify({ shots });
    return parseTrackManPhoto("QUJD", "image/jpeg");
  };

  await t.test("råverdier beholdes og blandede enheter konverteres én gang", async () => {
    const result = await parse([{
      club: "  7-jern  ", clubSpeed: 60, ballSpeed: 70, carry: 330, total: 320, side: -5,
      sourceUnits: { clubSpeed: "mph", ballSpeed: "m/s", carry: "m", total: "yd", side: "yd" },
    }]);
    assert.ok(result.ok);
    assert.equal(result.shots[0].club, "7-jern");
    assert.equal(result.shots[0].ballSpeedMps, 70);
    assert.equal(result.shots[0].totalMeters, 320);
    const canonical = csvShotsToCanonical(result.shots)[0];
    assert.equal(canonical.clubSpeedMph, 60);
    assert.equal(canonical.ballSpeedMph, 156.59);
    assert.equal(canonical.carryMeters, 330);
    assert.equal(canonical.totalMeters, 292.61);
    assert.equal(canonical.sideMeters, -4.57);
    assert.deepEqual(trackManShotsForPreview(result.shots)[0], canonical);
  });

  await t.test("enhet gjelder hvert felt og hver rad, også ved gamle terskler", async () => {
    const result = await parse([
      { clubSpeed: 60, ballSpeed: 70, carry: 320, total: 330, sourceUnits: { clubSpeed: "m/s", ballSpeed: "mph", carry: "yd", total: "m" } },
      { clubSpeed: 60, ballSpeed: 70, carry: 320, total: 330, sourceUnits: { clubSpeed: "mph", ballSpeed: "m/s", carry: "m", total: "yd" } },
    ]);
    assert.ok(result.ok);
    const [first, second] = csvShotsToCanonical(result.shots);
    assert.deepEqual([first.clubSpeedMph, first.ballSpeedMph, first.carryMeters, first.totalMeters], [134.22, 70, 292.61, 330]);
    assert.deepEqual([second.clubSpeedMph, second.ballSpeedMph, second.carryMeters, second.totalMeters], [60, 156.59, 320, 301.75]);
  });

  await t.test("manglende og tvetydige enheter blir null i import og forhåndsvisning", async () => {
    for (const sourceUnits of [undefined, null, {}, { clubSpeed: null, ballSpeed: "unknown", carry: "unknown" }]) {
      const result = await parse([{ clubSpeed: 60, ballSpeed: 70, carry: 330, total: 320, side: 4, smashFactor: 1.4, sourceUnits }]);
      assert.ok(result.ok);
      assert.equal(result.shots[0].carryMeters, 330, "lesbar råverdi bevares");
      assert.equal(result.shots[0].sourceUnits?.carry, "unknown");
      const canonical = csvShotsToCanonical(result.shots)[0];
      assert.deepEqual([canonical.clubSpeedMph, canonical.ballSpeedMph, canonical.carryMeters, canonical.totalMeters, canonical.sideMeters], [null, null, null, null, null]);
      assert.equal(canonical.smashFactor, 1.4);
      assert.deepEqual(trackManShotsForPreview(result.shots)[0], canonical);
    }
  });

  await t.test("km/t og andre enheter uten støtte avvises uten feil konvertering", async () => {
    for (const unit of ["km/h", "km/t", "feet", "mph eller m/s"]) {
      const result = await parse([{ ballSpeed: 240, sourceUnits: { ballSpeed: unit } }]);
      assert.equal(result.ok, false);
    }
    const result = await parse([{ ballSpeed: 240, sourceUnits: { ballSpeed: "unknown" } }]);
    assert.equal(result.ok, false);
    if (!result.ok) assert.match(result.error, /måleenhetene vises/);
  });

  await t.test("ingen brukbare mål blir ikke en vellykket tom import", async () => {
    for (const shot of [{}, { club: "Driver" }, { carry: null }, { carry: 150 }, { carry: 150, sourceUnits: { carry: "unknown" } }]) {
      assert.equal((await parse([shot])).ok, false);
    }
  });

  await t.test("tomme rader fjernes, null forblir ukjent og avvik på 0 meter beholdes", async () => {
    const result = await parse([{ club: "Driver" }, { side: 0, total: null, sourceUnits: { side: "m" } }]);
    assert.ok(result.ok);
    assert.equal(result.shots.length, 1);
    assert.equal(result.shots[0].sideMeters, 0);
    assert.equal(result.shots[0].totalMeters, null);
  });

  await t.test("tom liste, ugyldig JSON og tall som tekst avvises", async () => {
    assert.equal((await parse([])).ok, false);
    assert.equal((await parse([{ carry: "150", sourceUnits: { carry: "m" } }])).ok, false);
    response = "Dette er ikke slagdata";
    assert.equal((await parseTrackManPhoto("QUJD", "image/jpeg")).ok, false);
    response = '{"shots":[{"carry":1e999,"sourceUnits":{"carry":"m"}}]}';
    assert.equal((await parseTrackManPhoto("QUJD", "image/jpeg")).ok, false);
  });

  await t.test("modellfeil returnerer trygg feiltekst", async () => {
    modelError = true;
    const result = await parse([{ smashFactor: 1.4 }]);
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.error, "Kunne ikke lese bildet akkurat nå. Prøv igjen.");
  });
});
