// Tester for benchmark-provider — SG-benchmarks hentes fra AK Golf Intelligence
// sitt `/api/v1/sg/benchmarks` (via ./client), ikke lenger direkte SQL mot
// dashboard.sg_benchmarks.
//
// Mønster fra src/lib/portal/goals/progress.test.ts: t.mock.module for
// "@/lib/prisma" + dynamisk import() ETTER mock-oppsettet. fetch mockes med
// t.mock.method(globalThis, "fetch") og ekte Response-objekter. client.ts leser
// INTELLIGENCE_API_URL/KEY lazily, så env kan varieres per scenario.
//
// Kjør med: npm test

import { test } from "node:test";
import assert from "node:assert/strict";

const API_URL = "https://intel.example.test/";
const API_KEY = "test-nokkel";

type FetchCall = { url: string; authorization: string | null };

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

// Delsett av stigen slik TalentHQ-API-et returnerer den (Drizzle-serialisering:
// camelCase, numerics som strenger).
const apiRows = [
  { id: 1, handicapLevel: 0, category: "APP", expectedStrokes: "-0.800", pgaTourEquivalent: "0.000", avgScore72: null, createdAt: "2026-01-01T00:00:00Z" },
  { id: 2, handicapLevel: 5, category: "APP", expectedStrokes: "-2.000", pgaTourEquivalent: "0.000", avgScore72: "75.50", createdAt: "2026-01-01T00:00:00Z" },
  { id: 3, handicapLevel: 5, category: "OTT", expectedStrokes: "-1.200", pgaTourEquivalent: "0.000", avgScore72: null, createdAt: "2026-01-01T00:00:00Z" },
  { id: 4, handicapLevel: 10, category: "APP", expectedStrokes: "-3.500", pgaTourEquivalent: "0.000", avgScore72: null, createdAt: "2026-01-01T00:00:00Z" },
  { id: 5, handicapLevel: 15, category: "APP", expectedStrokes: "-5.000", pgaTourEquivalent: "0.000", avgScore72: null, createdAt: "2026-01-01T00:00:00Z" },
];

test("benchmark-provider mot /api/v1 — env, suksess, nedetid, spiller-gap", async (t) => {
  const savedUrl = process.env.INTELLIGENCE_API_URL;
  const savedKey = process.env.INTELLIGENCE_API_KEY;
  t.after(() => {
    if (savedUrl === undefined) delete process.env.INTELLIGENCE_API_URL;
    else process.env.INTELLIGENCE_API_URL = savedUrl;
    if (savedKey === undefined) delete process.env.INTELLIGENCE_API_KEY;
    else process.env.INTELLIGENCE_API_KEY = savedKey;
  });

  // Mutérbar mock-tilstand for prisma (kun brukt av getPlayerBenchmarkGaps).
  let latestSg: { sgOtt: number | null; sgApp: number | null; sgArg: number | null; sgPutt: number | null } | null = null;
  t.mock.module("@/lib/prisma", {
    namedExports: {
      prisma: {
        brukerSgInput: {
          findFirst: async () => latestSg,
        },
      },
    },
  });

  // Mutérbar fetch-mock: handler byttes per scenario, kall logges.
  const calls: FetchCall[] = [];
  let handler: (url: string) => Promise<Response> = async () => jsonResponse({ data: [] });
  t.mock.method(globalThis, "fetch", async (input: string | URL | Request, init?: RequestInit) => {
    const url = String(input);
    const headers = new Headers(init?.headers);
    calls.push({ url, authorization: headers.get("authorization") });
    return handler(url);
  });

  const provider = await import("./benchmark-provider");

  // ── 1. Manglende env → tom fallback, ingen fetch-kall ───────────────
  {
    delete process.env.INTELLIGENCE_API_URL;
    delete process.env.INTELLIGENCE_API_KEY;
    calls.length = 0;

    const rows = await provider.getSgBenchmarks();
    assert.deepEqual(rows, [], "ukonfigurert API → tom liste");
    assert.equal(await provider.benchmarksAvailable(), false);
    assert.equal(calls.length, 0, "skal ikke kalle fetch uten konfig");
  }

  // ── 2. Suksess — mapping, typer, trailing slash i base-URL ──────────
  {
    process.env.INTELLIGENCE_API_URL = API_URL; // med trailing slash
    process.env.INTELLIGENCE_API_KEY = API_KEY;
    handler = async () => jsonResponse({ data: apiRows });
    calls.length = 0;

    const rows = await provider.getSgBenchmarks();
    assert.equal(calls.length, 1);
    assert.equal(
      calls[0].url,
      "https://intel.example.test/api/v1/sg/benchmarks",
      "base-URL med trailing slash skal ikke gi dobbel slash",
    );
    assert.equal(calls[0].authorization, `Bearer ${API_KEY}`);

    assert.equal(rows.length, 5);
    const app5 = rows.find((r) => r.handicapLevel === 5 && r.category === "APP")!;
    assert.equal(app5.expectedStrokes, -2.0, "streng-numeric parses til tall");
    assert.equal(app5.pgaTourEquivalent, 0);
    assert.equal(app5.avgScore72, 75.5);
    assert.equal(await provider.benchmarksAvailable(), true);
  }

  // ── 3. handicapLevel sendes som query-param ──────────────────────────
  {
    handler = async () =>
      jsonResponse({ data: apiRows.filter((r) => r.handicapLevel === 5) });
    calls.length = 0;

    const rows = await provider.getSgBenchmarks(5);
    assert.equal(calls[0].url, "https://intel.example.test/api/v1/sg/benchmarks?handicapLevel=5");
    assert.deepEqual(
      rows.map((r) => r.category),
      ["APP", "OTT"],
    );
  }

  // ── 4. API-nedetid (503) → tom fallback, ikke krasj ─────────────────
  {
    handler = async () => jsonResponse({ error: "API ikke konfigurert" }, 503);
    const rows = await provider.getSgBenchmarks();
    assert.deepEqual(rows, [], "503 → tom liste");
    assert.equal(await provider.benchmarksAvailable(), false);
  }

  // ── 5. Nettverksfeil (fetch rejecter) → tom fallback ────────────────
  {
    handler = async () => {
      throw new TypeError("fetch failed");
    };
    const rows = await provider.getSgBenchmarks();
    assert.deepEqual(rows, [], "nettverksfeil → tom liste");
    assert.equal(await provider.benchmarksAvailable(), false);
  }

  // ── 6. getPlayerBenchmarkGaps — SG fra prisma + stige fra API ───────
  {
    handler = async () => jsonResponse({ data: apiRows });
    latestSg = { sgOtt: null, sgApp: -2.5, sgArg: null, sgPutt: null };

    const gaps = await provider.getPlayerBenchmarkGaps("user-1");
    assert.equal(gaps.length, 4);
    const app = gaps.find((g) => g.category === "APP")!;
    assert.equal(app.nextLevel, 5);
    assert.equal(app.slagGap, 0.5);

    // Spiller uten SG-data → tom liste
    latestSg = null;
    assert.deepEqual(await provider.getPlayerBenchmarkGaps("user-1"), []);

    // API nede → tom liste (tom-tilstand)
    latestSg = { sgOtt: 0, sgApp: 0, sgArg: 0, sgPutt: 0 };
    handler = async () => jsonResponse({ error: "nede" }, 503);
    assert.deepEqual(await provider.getPlayerBenchmarkGaps("user-1"), []);
  }

  // ── 7. Ukjent kategori i API-svar filtreres bort ────────────────────
  {
    handler = async () =>
      jsonResponse({
        data: [
          ...apiRows.filter((r) => r.handicapLevel === 5),
          { id: 99, handicapLevel: 5, category: "T2G", expectedStrokes: "-3.0", pgaTourEquivalent: null, avgScore72: null },
        ],
      });
    const rows = await provider.getSgBenchmarks(5);
    assert.deepEqual(
      rows.map((r) => r.category),
      ["APP", "OTT"],
      "T2G er ikke en gyldig provider-kategori og droppes",
    );
  }
});
