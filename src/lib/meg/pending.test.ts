/**
 * npx tsx --conditions=react-server --experimental-test-module-mocks --test src/lib/meg/pending.test.ts
 *
 * Tester harVentendePending — helpern bak triage-agentens «kun én BEKREFT-bar
 * sak om gangen»-regel: scripts/saker-innsamling/triage.ts hopper over
 * createPending når denne returnerer true. Selve triage.ts kjører main() ved
 * import og kan derfor ikke importeres i en test — grenevalget dekkes via
 * helpern den bygger på.
 *
 * VIKTIG: modulen importeres kun ÉN gang, etter t.mock.module() (samme
 * fallgruve som bane-bro.test.ts — Node re-evaluerer ikke en allerede lastet
 * ES-modul).
 */
import { test } from "node:test";
import assert from "node:assert/strict";

type QuerySvar = { count: number | null; error: { message: string } | null };

type QueryStub = {
  select: (kolonner: string, opts?: { count?: string; head?: boolean }) => QueryStub;
  eq: (kolonne: string, verdi: unknown) => QueryStub;
  gt: (kolonne: string, verdi: unknown) => QueryStub;
  then: (resolve: (v: QuerySvar) => void) => void;
};

test("harVentendePending — ukonfigurert, treff, tom, feil", async (t) => {
  let svar: QuerySvar = { count: 0, error: null };
  let konfigurert = false;
  const filtre: Record<string, unknown> = {};

  function lagQueryStub(): QueryStub {
    const builder: QueryStub = {
      select: () => builder,
      eq: (kolonne, verdi) => {
        filtre[kolonne] = verdi;
        return builder;
      },
      gt: (kolonne, verdi) => {
        filtre[kolonne] = verdi;
        return builder;
      },
      then: (resolve) => resolve(svar),
    };
    return builder;
  }

  t.mock.module("@/lib/meg/supabase", {
    namedExports: {
      megSupabase: () => (konfigurert ? { from: () => lagQueryStub() } : null),
    },
  });
  t.mock.module("@/lib/error-tracking", {
    namedExports: { logError: async () => undefined },
  });

  const { harVentendePending } = await import("./pending");

  // 1) Meg ikke konfigurert (megSupabase → null) → false, krasjer aldri.
  assert.equal(await harVentendePending("tg:123", "sak_godkjenn"), false);

  // 2) Én åpen pending finnes → true, og filtrene treffer riktig person/verktøy.
  konfigurert = true;
  svar = { count: 1, error: null };
  assert.equal(await harVentendePending("tg:123", "sak_godkjenn"), true);
  assert.equal(filtre.subject, "tg:123");
  assert.equal(filtre.tool_name, "sak_godkjenn");
  assert.equal(filtre.status, "pending");
  assert.ok(typeof filtre.expires_at === "string" && filtre.expires_at.length > 0);

  // 3) Ingen åpne (count 0 eller null) → false.
  svar = { count: 0, error: null };
  assert.equal(await harVentendePending("tg:123", "sak_godkjenn"), false);
  svar = { count: null, error: null };
  assert.equal(await harVentendePending("tg:123", "sak_godkjenn"), false);

  // 4) Supabase-feil → false (triage registrerer da en pending som normalt —
  //    samme «krasj aldri»-holdning som resten av pending.ts).
  svar = { count: 3, error: { message: "nede" } };
  assert.equal(await harVentendePending("tg:123", "sak_godkjenn"), false);
});
