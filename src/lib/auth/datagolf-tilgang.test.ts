/**
 * Sidevakten for Data Golf (Anders 09.10.2026): uinnlogget sendes til
 * innlogging, spiller/forelder/gjest sendes bort, coach og admin slipper inn.
 */
import { mock, test } from "node:test";
import assert from "node:assert/strict";

type Rolle = "COACH" | "ADMIN" | "PLAYER" | "PARENT" | "GUEST";
let bruker: { id: string; role: Rolle } | null = null;
let kast = false;

class Videresendt extends Error {
  constructor(public til: string) {
    super(`redirect:${til}`);
  }
}

mock.module("next/navigation", {
  namedExports: {
    redirect: (til: string) => {
      throw new Videresendt(til);
    },
  },
});
mock.module("./getCurrentUser", {
  namedExports: {
    getCurrentUserRaw: async () => {
      if (kast) throw new Error("tilgangsdata utilgjengelig");
      return bruker;
    },
  },
});

const port = () => import("./datagolf-tilgang");

async function videresendtTil(fn: () => Promise<unknown>): Promise<string | null> {
  try {
    await fn();
    return null;
  } catch (e) {
    if (e instanceof Videresendt) return e.til;
    throw e;
  }
}

test("uinnlogget sendes til innlogging med retur", async () => {
  const { krevDataGolfBruker, innloggetKanSeDataGolf } = await port();
  bruker = null;
  assert.equal(
    await videresendtTil(() => krevDataGolfBruker("/stats/pga")),
    "/auth/login?next=%2Fstats%2Fpga",
  );
  assert.equal(await innloggetKanSeDataGolf(), false);
});

test("spiller sendes til portalen, forelder til forelderflaten, gjest til kalenderen", async () => {
  const { krevDataGolfBruker, hentDataGolfBruker, innloggetKanSeDataGolf } = await port();
  bruker = { id: "p1", role: "PLAYER" };
  assert.equal(await videresendtTil(() => krevDataGolfBruker("/stats/pga")), "/portal");
  assert.equal(await hentDataGolfBruker(), null);
  bruker = { id: "f1", role: "PARENT" };
  assert.equal(await videresendtTil(() => krevDataGolfBruker("/stats/pga")), "/forelder");
  assert.equal(await innloggetKanSeDataGolf(), false);
  bruker = { id: "g1", role: "GUEST" };
  assert.equal(await videresendtTil(() => krevDataGolfBruker("/stats/pga")), "/admin/kalender");
});

test("coach og admin slipper inn", async () => {
  const { krevDataGolfBruker, hentDataGolfBruker, innloggetKanSeDataGolf } = await port();
  for (const role of ["COACH", "ADMIN"] as const) {
    bruker = { id: "c1", role };
    assert.equal(await videresendtTil(() => krevDataGolfBruker("/stats/pga")), null);
    assert.deepEqual(await hentDataGolfBruker(), bruker);
    assert.equal(await innloggetKanSeDataGolf(), true);
  }
});

test("feiler brukeroppslaget, er svaret nei (fail-closed)", async () => {
  const { innloggetKanSeDataGolf } = await port();
  bruker = { id: "c1", role: "COACH" };
  kast = true;
  assert.equal(await innloggetKanSeDataGolf(), false);
  kast = false;
});
