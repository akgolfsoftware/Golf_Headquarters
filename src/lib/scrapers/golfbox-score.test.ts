/**
 * GolfBox score-pipeline: alltid brutto, aldri netto-klasser.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  erNettoKlasse,
  extractRoundScore,
  golfboxKlasseNavn,
  sumHoleScores,
  parseCompetitionClasses,
  velgBruttoKlasser,
  getLeaderboard,
} from "./golfbox";

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

test("erNettoKlasse: ender på N / Net / Netto", () => {
  assert.equal(erNettoKlasse("Scratch N"), true);
  assert.equal(erNettoKlasse("Herrer N"), true);
  assert.equal(erNettoKlasse("Amatør-N"), true);
  assert.equal(erNettoKlasse("Class (N)"), true);
  assert.equal(erNettoKlasse("Senior Net"), true);
  assert.equal(erNettoKlasse("Netto"), true);
  assert.equal(erNettoKlasse("  damer n  "), true);
});

test("erNettoKlasse: brutto-klasser passerer", () => {
  assert.equal(erNettoKlasse("Scratch"), false);
  assert.equal(erNettoKlasse("Herrer"), false);
  assert.equal(erNettoKlasse("Junior GU16"), false);
  assert.equal(erNettoKlasse("Norge"), false); // ender ikke på N som klasse-suffix
  assert.equal(erNettoKlasse(""), false);
  assert.equal(erNettoKlasse(null), false);
});

test("extractRoundScore: ActualText (brutto), ikke NetText", () => {
  assert.equal(
    extractRoundScore({
      ResultSum: { ActualText: "72", NetText: "68", ActualValue: 720000, NetValue: 680000 },
    }),
    72,
  );
  assert.equal(
    extractRoundScore({ ResultSum: { ActualValue: 750000 } }),
    75,
  );
  // Kun netto-felt → null (vi henter ikke netto)
  assert.equal(extractRoundScore({ ResultSum: { NetText: "68", NetValue: 680000 } }), null);
  assert.equal(extractRoundScore(null), null);
  assert.equal(extractRoundScore({}), null);
});

// Bygg et HoleScores-dict slik GolfBox leverer det (H1..H18 + H-OUT/H-IN).
function lagHoleScores(scores: (number | null)[]): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  scores.forEach((s, i) => {
    out[`H${i + 1}`] = { Score: s == null ? { Text: null, Value: null } : { Text: String(s), Value: s } };
  });
  out["H-OUT"] = { Score: { Text: null, Value: null } };
  out["H-IN"] = { Score: { Text: null, Value: null } };
  return out;
}

test("sumHoleScores: summerer H1–H18, hopper over H-OUT/H-IN", () => {
  const scores = [4, 3, 5, 3, 5, 4, 2, 5, 4, 6, 3, 4, 4, 4, 4, 4, 5, 3]; // = 72
  assert.equal(sumHoleScores({ HoleScores: lagHoleScores(scores), IsCompleted: true }), 72);
});

test("sumHoleScores: ufullstendig runde (hull uten score) → null", () => {
  const scores = [4, 3, 5, null, 5, 4, 2, 5, 4, 6, 3, 4, 4, 4, 4, 4, 5, 3];
  assert.equal(sumHoleScores({ HoleScores: lagHoleScores(scores) }), null);
});

test("sumHoleScores: IsCompleted=false eller manglende data → null", () => {
  const scores = Array(18).fill(4);
  assert.equal(sumHoleScores({ HoleScores: lagHoleScores(scores), IsCompleted: false }), null);
  assert.equal(sumHoleScores({}), null);
  assert.equal(sumHoleScores(null), null);
  assert.equal(sumHoleScores({ HoleScores: {} }), null); // < 9 hull
});

test("extractRoundScore: fallback til hullsum når ResultSum mangler (Olyo/Østlandstour)", () => {
  const scores = Array(18).fill(4); // = 72
  assert.equal(extractRoundScore({ HoleScores: lagHoleScores(scores), IsCompleted: true }), 72);
  // Kun netto i ResultSum + komplette hullscorer → hullsummen er brutto
  assert.equal(
    extractRoundScore({
      ResultSum: { NetText: "68", NetValue: 680000 },
      HoleScores: lagHoleScores(scores),
    }),
    72,
  );
});

test("parseCompetitionClasses + velgBruttoKlasser: alle spillerklasser, også netto-navngitte (egne felt-lister)", () => {
  const raw = {
    CompetitionData: {
      Classes: [
        { Id: 1, Name: "G19 Brutto", ShortName: "G19" },
        { Id: 2, Name: "G19 Netto", ShortName: "G19N" },
        { Id: 3, Name: "J19 Brutto", ShortName: "J19", ClassType: "PlayerClass" },
        { Id: 4, Name: "Jenter 13-15 Netto", ShortName: "J15N" },
        { Id: 5, Name: "G12-klassen", ShortName: "G12" },
        { Id: 6, Name: "Lag", ShortName: "LAG", ClassType: "TeamClass" },
      ],
    },
  };
  const alle = parseCompetitionClasses(raw);
  assert.equal(alle.length, 6);
  // Netto-navngitte klasser (2, 4) er egne påmeldingslister (f.eks. Østlandstour
  // «Damer netto») og skal hentes på lik linje med brutto-klassene — kun
  // lagklasser (TeamClass) ekskluderes. AK-regelen «alltid brutto» håndheves i
  // stedet på score-nivå (extractRoundScore), ikke ved å droppe hele klassen.
  const brutto = velgBruttoKlasser(alle).map((c) => c.id);
  assert.deepEqual(brutto, [1, 2, 3, 4, 5]);
});

test("parseCompetitionClasses: manglende/ugyldig CompetitionData → tom liste", () => {
  assert.deepEqual(parseCompetitionClasses({}), []);
  assert.deepEqual(parseCompetitionClasses(null), []);
  assert.deepEqual(parseCompetitionClasses({ CompetitionData: { Classes: "x" } }), []);
});

test("golfboxKlasseNavn: Name-felt eller dict-nøkkel", () => {
  assert.equal(golfboxKlasseNavn({ Name: "Scratch N" }, "0"), "Scratch N");
  assert.equal(golfboxKlasseNavn({}, "Herrer"), "Herrer");
  assert.equal(golfboxKlasseNavn({ ClassName: "Junior" }), "Junior");
});

test("getLeaderboard: klubb og klassenavn følger med hver entry (STEG 16.6 — tidligere kastet)", async (t) => {
  t.mock.method(globalThis, "fetch", async () =>
    jsonResponse({
      CompetitionData: {
        Classes: [{ Id: 1, Name: "Herrer", ShortName: "H", ClassType: "PlayerClass" }],
      },
      Classes: {
        C1: {
          Name: "Herrer",
          Leaderboard: {
            RoundNames: ["R1"],
            ActiveRoundNumber: 1,
            IsScoringOpen: true,
            Entries: {
              e1: {
                FirstName: "Ola",
                LastName: "Nordmann",
                Nationality: "NO",
                BirthYear: 2008,
                ClubName: "Fredrikstad GK",
                ScoringToPar: { ToParText: "-2", TodayText: "-2" },
                Position: { Actual: 1 },
                Rounds: { R1: { Score: { Text: "70" } } },
              },
            },
          },
        },
      },
    }),
  );

  const lb = await getLeaderboard(123);
  assert.ok(lb);
  assert.equal(lb!.entries.length, 1);
  assert.equal(lb!.entries[0].clubName, "Fredrikstad GK");
  assert.equal(lb!.entries[0].klasseNavn, "Herrer");
});

// Syntetiske varianter av det offentlige GolfBox-formatet kontrollert 10.09.2026.
import { golfBoxRoundDetails, orderedGolfBoxRounds, parseGolfBox, parseGolfBoxDate } from "./golfbox";

const fullRound = (score = 72) => ({ Number: 1, ScoringMethod: 0, IsCompleted: true,
  Holes: Object.fromEntries(Array.from({ length: 18 }, (_, i) => [`H${i + 1}`, { Number: i + 1 }])),
  ResultSum: { ActualText: String(score), ToParText: String(score - 72) } });

test("delvis runde med ResultSum, ugyldig score og poeng er ikke brutto fullrunde", () => {
  assert.equal(extractRoundScore({ ...fullRound(), IsCompleted: false }), null);
  assert.equal(extractRoundScore({ ...fullRound(), ResultSum: { ActualText: "72 DQ" } }), null);
  assert.equal(extractRoundScore({ ...fullRound(), ScoringMethod: 1, ResultSum: { ActualText: "36" } }), null);
  assert.equal(extractRoundScore({ ...fullRound(), ResultSum: { ActualValue: 720001 } }), null);
});

test("rundenummer beholdes ved uordnet dict og hull i rekken", () => {
  const rounds = orderedGolfBoxRounds({ R3: { ...fullRound(70), Number: 3 }, R1: fullRound(72) });
  assert.deepEqual(rounds.map(extractRoundScore), [72, null, 70]);
  assert.deepEqual(orderedGolfBoxRounds({ R999999: fullRound(), x: {} }).length, 1);
});

test("faktisk hullantall og til-par følger rundescore", () => {
  assert.deepEqual(golfBoxRoundDetails(fullRound(74)), { score: 74, toPar: 2, holes: 18, completed: true });
  assert.equal(sumHoleScores({ IsCompleted: true, Holes: fullRound().Holes, HoleScores: lagHoleScores(Array(9).fill(4)) }), null);
});

test("GolfBox-parseren bevarer tekst og avviser umulige datoer", () => {
  assert.deepEqual(parseGolfBox('{"label":"X:!0,","flags":[!0,!1,!0]}'), { label: "X:!0,", flags: [true, false, true] });
  assert.equal(parseGolfBoxDate("20260230T000000"), null);
  assert.equal(parseGolfBoxDate("20261301T000000"), null);
});

test("netto-standardklasse erstattes av brutto, lag og anonyme hoppes over, klassefeil vises", async t => {
  const classes = [{ Id: 1, Name: "Netto", ClassType: "PlayerClass" }, { Id: 2, Name: "Brutto", ClassType: "PlayerClass" }, { Id: 3, Name: "Damer", ClassType: "PlayerClass" }, { Id: 4, Name: "Lag", ClassType: "TeamClass" }];
  const player = { FirstName: "Test", LastName: "Spiller", Nationality: "NO", BirthYear: 2005, Position: { Actual: 2, Calculated: "T2" }, ScoringToPar: { ToParText: "-6" }, Rounds: { R1: fullRound(74) } };
  t.mock.method(globalThis, "fetch", async (url: string | URL | Request) => {
    if (String(url).includes("/ClassId/3/")) return new Response("feil", { status: 503 });
    if (String(url).includes("/ClassId/2/")) return jsonResponse({ Classes: { C2: { Name: "Brutto", Leaderboard: { RoundNames: ["R1", "R2"], Entries: { p: player } } } } });
    return jsonResponse({ CompetitionData: { Classes: classes }, Classes: {
      C1: { Name: "Netto", Leaderboard: { RoundNames: ["R1"], Entries: { p: player, hidden: { ...player, FirstName: "Skjult", IsAnonymous: true } } } },
      C4: { Name: "Lag", Leaderboard: { Entries: { p: { ...player, FirstName: "Lag" } } } },
    } });
  });
  const result = await getLeaderboard(1);
  assert.deepEqual(result?.failedClasses, [3]);
  assert.equal(result?.entries.length, 1);
  assert.equal(result?.entries[0].grossRanking, true);
  assert.equal(result?.entries[0].klasseNavn, "Brutto");
  assert.deepEqual(result?.entries[0].roundScores, [74, null]);
  assert.deepEqual(result?.entries[0].roundCompleted, [true, false]);
});

test("klasseobjekt uten leaderboard hentes på nytt og feil merkes", async t => {
  let requests = 0;
  t.mock.method(globalThis, "fetch", async () => { requests++; return jsonResponse({
    CompetitionData: { Classes: [{ Id: 1, Name: "Brutto" }] }, Classes: { C1: {} },
  }); });
  const result = await getLeaderboard(1);
  assert.equal(requests, 2); assert.deepEqual(result?.failedClasses, [1]);
});
