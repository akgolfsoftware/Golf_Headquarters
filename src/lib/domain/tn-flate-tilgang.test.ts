import assert from "node:assert/strict";
import { mock, test } from "node:test";

type Bruker = { id: string; role: "ADMIN" | "COACH" | "PLAYER"; email: string; name: string };
type Kontekst = { gruppe: { id: string; name: string }; rolle: string; erSpiller: boolean; kanAdministrere: boolean };

let bruker: Bruker | null = null;
let kontekst: Kontekst | null = null;

class Omdirigert extends Error {
  constructor(readonly til: string) {
    super(`redirect:${til}`);
  }
}

mock.module("next/navigation", {
  namedExports: {
    redirect: (til: string) => {
      throw new Omdirigert(til);
    },
  },
});
mock.module("@/lib/auth/getCurrentUser", { namedExports: { getCurrentUserRaw: async () => bruker } });
mock.module("@/lib/domain/tn-arbeidsflate", { namedExports: { hentTnArbeidskontekst: async () => kontekst } });

async function omdirigering(fn: () => Promise<unknown>): Promise<string> {
  try {
    await fn();
  } catch (e) {
    if (e instanceof Omdirigert) return e.til;
    throw e;
  }
  return "(ingen)";
}

const TRENER: Kontekst = { gruppe: { id: "tn", name: "Team Norway Golf" }, rolle: "COACH", erSpiller: false, kanAdministrere: true };

test.beforeEach(() => {
  bruker = null;
  kontekst = null;
});

test("uten innlogging: til Team Norway-innloggingen", async () => {
  const { krevTnTrenerflate } = await import("./tn-flate-tilgang");
  assert.equal(await omdirigering(krevTnTrenerflate), "/team-norway/logg-inn");
});

test("@golfforbundet.no med trenerrolle slipper inn", async () => {
  const { krevTnTrenerflate } = await import("./tn-flate-tilgang");
  bruker = { id: "t", role: "COACH", email: " Trener@GolfForbundet.no", name: "T" };
  kontekst = TRENER;
  assert.equal((await krevTnTrenerflate()).kontekst.gruppe.id, "tn");
});

test("Olympiatoppen og lignende domener avvises selv med trenerrolle", async () => {
  const { krevTnTrenerflate } = await import("./tn-flate-tilgang");
  kontekst = TRENER;
  for (const epost of ["fysio@olympiatoppen.no", "t@golfforbundet.no.evil.com", "t@xgolfforbundet.no", "t@gmail.com"]) {
    bruker = { id: "t", role: "COACH", email: epost, name: "T" };
    assert.equal(await omdirigering(krevTnTrenerflate), "/team-norway/logg-inn?avvist=domene", epost);
  }
});

test("spiller med riktig domene slipper ikke inn — spillere bruker PlayerHQ", async () => {
  const { krevTnTrenerflate } = await import("./tn-flate-tilgang");
  bruker = { id: "s", role: "PLAYER", email: "s@golfforbundet.no", name: "S" };
  kontekst = { ...TRENER, rolle: "PLAYER", erSpiller: true };
  assert.equal(await omdirigering(krevTnTrenerflate), "/team-norway/logg-inn?avvist=rolle");
});

test("trener uten medlemskap i gruppen avvises med rolle", async () => {
  const { krevTnTrenerflate } = await import("./tn-flate-tilgang");
  bruker = { id: "t", role: "COACH", email: "t@golfforbundet.no", name: "T" };
  assert.equal(await omdirigering(krevTnTrenerflate), "/team-norway/logg-inn?avvist=rolle");
});

test("ADMIN slipper inn uansett domene", async () => {
  const { krevTnTrenerflate } = await import("./tn-flate-tilgang");
  bruker = { id: "a", role: "ADMIN", email: "anders@gmail.com", name: "A" };
  kontekst = { ...TRENER, rolle: "ADMIN" };
  assert.equal((await krevTnTrenerflate()).bruker.id, "a");
});
