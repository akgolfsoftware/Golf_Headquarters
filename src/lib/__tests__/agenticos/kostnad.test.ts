// Tester aggregeringen i kostnadsoversikten. Spørringene selv er verifisert
// direkte mot databasen; det som kan gå galt i kode er hvordan radene bøttes,
// hvordan ukjent pris håndteres, og når en godkjenningsrate er meningsløs.
//
// Mønster: ett t.mock.module-oppsett med muterbar tilstand. Modulen under test
// importeres kun én gang per fil.

import { test } from "node:test";
import assert from "node:assert/strict";

type Rad = Record<string, unknown>;

// Prisma returnerer count()/sum() som bigint. Vi skriver BigInt(...) framfor
// `1n`-literaler: tsconfig har target under ES2020, og literalformen er en
// kompileringsfeil selv om tsx --test kjører den fint.

test("kostnadsoversikt — bøtting, ukjent pris og meningsløse rater", async (t) => {
  let svar: Rad[][] = [];
  let neste = 0;
  let skalKaste = false;

  t.mock.module("@/lib/prisma", {
    namedExports: {
      prisma: {
        $queryRaw: async () => {
          if (skalKaste) throw new Error('relation "ai_interaksjoner" does not exist');
          return svar[neste++] ?? [];
        },
      },
    },
  });

  const { hentMaanedsForbruk, hentPromptversjonStats, hentAgenticOsOversikt } = await import(
    "@/lib/agenticos/kostnad"
  );

  // ── Månedsforbruk: kjent pris, ukjent pris og gratis lokal modell ──
  neste = 0;
  svar = [
    [
      {
        maaned: "2026-08",
        modell: "claude-sonnet-4-5-20250514",
        antall: BigInt(2),
        tokens_inn: BigInt(1_000_000),
        tokens_ut: BigInt(100_000),
      },
      { maaned: "2026-08", modell: "claude-opus-4-8", antall: BigInt(3), tokens_inn: BigInt(500), tokens_ut: BigInt(100) },
      { maaned: "2026-08", modell: "llama3.1", antall: BigInt(1), tokens_inn: BigInt(900), tokens_ut: BigInt(50) },
      { maaned: "2026-07", modell: "claude-sonnet-4-5-20250514", antall: BigInt(1), tokens_inn: BigInt(0), tokens_ut: BigInt(0) },
    ],
  ];

  const maaneder = await hentMaanedsForbruk();
  assert.equal(maaneder.length, 2, "to måneder skal bli to bøtter");

  const aug = maaneder.find((m) => m.maaned === "2026-08");
  assert.ok(aug);
  assert.equal(aug.antall, 6, "antall summeres på tvers av modeller");

  // 1 Mtok inn à $3 + 0,1 Mtok ut à $15 = 3 + 1,5 = 4,50
  const sonnet = aug.perModell.find((m) => m.modell === "claude-sonnet-4-5-20250514");
  assert.ok(sonnet);
  assert.ok(Math.abs((sonnet.kostUsd ?? 0) - 4.5) < 1e-9);

  // Opus har ingen sats i PRISER — skal være null, ikke 0.
  const opus = aug.perModell.find((m) => m.modell === "claude-opus-4-8");
  assert.equal(opus?.kostUsd, null, "modell uten pris skal gi null, aldri 0");

  // Lokal modell koster ingenting i API-avgift.
  const lokal = aug.perModell.find((m) => m.modell === "llama3.1");
  assert.equal(lokal?.kostUsd, 0);

  assert.equal(aug.utenPris, 3, "interaksjoner uten pris telles separat");
  assert.ok(
    Math.abs(aug.kjentKostUsd - 4.5) < 1e-9,
    "kjent kost skal ikke inkludere modeller uten pris",
  );

  // ── Promptversjoner: rate kun når noe faktisk er avgjort ──
  neste = 0;
  svar = [
    [
      { promptId: "ai-plan", promptVersjon: 2, antall: BigInt(10), godkjent: BigInt(6), avvist: BigInt(2), ventende: BigInt(2) },
      { promptId: "daily-brief", promptVersjon: 1, antall: BigInt(5), godkjent: BigInt(0), avvist: BigInt(0), ventende: BigInt(5) },
    ],
  ];

  const stats = await hentPromptversjonStats();
  const plan = stats.find((s) => s.promptId === "ai-plan");
  assert.ok(plan);
  assert.equal(
    plan.godkjenningsrate,
    0.75,
    "raten regnes av avgjorte (6 av 8), ikke av totalen",
  );

  const brief = stats.find((s) => s.promptId === "daily-brief");
  assert.equal(
    brief?.godkjenningsrate,
    null,
    "flate uten godkjenningsflyt skal gi tom rate, ikke 0 %",
  );

  // ── Oversikten samler modeller uten pris ──
  neste = 0;
  svar = [
    [{ maaned: "2026-08", modell: "claude-opus-4-8", antall: BigInt(1), tokens_inn: BigInt(1), tokens_ut: BigInt(1) }],
    [],
    [],
  ];
  const oversikt = await hentAgenticOsOversikt();
  assert.deepEqual(oversikt?.modellerUtenPris, ["claude-opus-4-8"]);

  // ── Manglende tabell skal ikke velte agent-siden ──
  skalKaste = true;
  assert.equal(
    await hentAgenticOsOversikt(),
    null,
    "agent-siden skal laste selv om loggtabellen ikke er opprettet",
  );
});
