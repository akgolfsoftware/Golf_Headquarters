import assert from "node:assert/strict";
import { test } from "node:test";
import { hentUtviklingssporsmal } from "./utviklingssjekk";
import { lesIupLagring } from "./lagringskontrakt";
import { lesLeverteIupForProfil } from "./trener-profil-lesing";

const requestId = "a8c07140-7f0b-47f5-b087-3f8992b40862";
function rad(overrides: Record<string, unknown> = {}) {
  const besvarelse = { versjon: "iup-2025", niva: "JUNIOR", status: "LEVERT", svar: Object.fromEntries(hentUtviklingssporsmal("iup-2025", "JUNIOR").map((s) => [s.id, 4])) };
  const lagring = lesIupLagring({ type: "UTVIKLINGSSJEKK", periodeStart: "2026-01-01", periodeSlutt: "2026-06-30", forventetRevisjon: 1, requestId, besvarelse });
  assert.equal(lagring.ok, true);
  if (!lagring.ok) throw new Error("syntetisk svar må være gyldig");
  return {
    id: "iup-1", type: "UTVIKLINGSSJEKK", versjon: "iup-2025", niva: "JUNIOR", periodeStart: new Date("2026-01-01T00:00:00Z"), periodeSlutt: new Date("2026-06-30T00:00:00Z"),
    levertRevisjon: 2, kildeSha256: lagring.data.kildeSha256,
    revisjoner: [{ revisjon: 2, requestId, requestHash: lagring.data.requestHash, payload: lagring.data.besvarelse, createdAt: new Date("2026-06-30T12:00:00Z") }],
    ...overrides,
  };
}
function txWith(rader: unknown[]) {
  let args: unknown;
  const tx = { iupBesvarelse: { findMany: async (query: unknown) => { args = query; return rader; } } };
  return { tx: tx as never, args: () => args };
}

test("profil-IUP spør bare etter leverte besvarelser og viser gyldig kildeinnhold", async () => {
  const db = txWith([rad()]);
  const resultat = await lesLeverteIupForProfil(db.tx, "synthetic-player");
  assert.deepEqual((db.args() as { where: { userId: string; levertRevisjon: { not: null } } }).where, { userId: "synthetic-player", user: { deletedAt: null, anonymisertAt: null }, levertRevisjon: { not: null } });
  assert.equal(resultat.length, 1);
  assert.equal(resultat[0]?.kildeEllerFormatAvviker, false);
  assert.equal(resultat[0]?.innhold?.status, "LEVERT");
});

test("avvikende eller nyere ikke-levert revisjon blir aldri vist som levert innhold", async () => {
  const avvik = rad({ levertRevisjon: 1 });
  const resultat = await lesLeverteIupForProfil(txWith([avvik]).tx, "synthetic-player");
  assert.equal(resultat[0]?.kildeEllerFormatAvviker, true);
  assert.equal(resultat[0]?.innhold, null);
});

test("uten leverte besvarelser returneres tom profiloversikt", async () => {
  assert.deepEqual(await lesLeverteIupForProfil(txWith([]).tx, "synthetic-player"), []);
});
