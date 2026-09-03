// Tester for parseTrackManPhoto (D4, AI-vision TrackMan-import).
//
// Mønster fra src/lib/portal/goals/progress.test.ts: t.mock.module for
// "@/lib/ai/client" + dynamisk import() ETTER mock-oppsettet, ETT
// mock.module-kall for hele filen (modulen under test importeres kun én
// gang), scenarioer varieres via en mutérbar "respons"-variabel som
// mock-implementasjonen leser lazily.
//
// Kjør med: npm test

import { test } from "node:test";
import assert from "node:assert/strict";

test("parseTrackManPhoto — vision-svar tolkes til TrackManShot[] og feil håndteres", async (t) => {
  let modellSvarTekst = "";

  t.mock.module("@/lib/ai/client", {
    namedExports: {
      anthropic: {
        messages: {
          create: async () => ({}),
        },
      },
      tekstFra: () => modellSvarTekst,
    },
  });

  const { parseTrackManPhoto } = await import("./parse-photo");

  await t.test("gyldig JSON med slag → ok:true, riktig felt-mapping", async () => {
    modellSvarTekst = JSON.stringify({
      shots: [
        { club: "7-jern", clubSpeed: 92, ballSpeed: 128, smashFactor: 1.39, carry: 148, total: 152, launchAngle: 18, spinRate: 6200, side: -3.5 },
        { club: null, clubSpeed: null, ballSpeed: null, smashFactor: null, carry: null, total: null, launchAngle: null, spinRate: null, side: null },
      ],
    });
    const result = await parseTrackManPhoto("QUJD", "image/jpeg");
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.shots.length, 2);
    assert.equal(result.shots[0].club, "7-jern");
    assert.equal(result.shots[0].clubSpeedMps, 92);
    assert.equal(result.shots[0].carryMeters, 148);
    assert.equal(result.shots[0].sideMeters, -3.5);
    assert.equal(result.shots[1].club, null);
  });

  await t.test("tomt shots-array → ok:false med fasit-teksten", async () => {
    modellSvarTekst = JSON.stringify({ shots: [] });
    const result = await parseTrackManPhoto("QUJD", "image/jpeg");
    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.equal(result.error, "Fant ingen tall. Rett på kortet. HEIC → JPG.");
  });

  await t.test("ugyldig JSON (ikke tall-svar) → ok:false, samme feiltekst", async () => {
    modellSvarTekst = "Dette er ikke et TrackMan-bilde.";
    const result = await parseTrackManPhoto("QUJD", "image/jpeg");
    assert.equal(result.ok, false);
  });

  await t.test("modell utelater et felt → optional/undefined faller til null, ikke krasj", async () => {
    modellSvarTekst = JSON.stringify({ shots: [{ club: "Driver" }] });
    const result = await parseTrackManPhoto("QUJD", "image/jpeg");
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.shots[0].club, "Driver");
    assert.equal(result.shots[0].clubSpeedMps, null);
  });
});
