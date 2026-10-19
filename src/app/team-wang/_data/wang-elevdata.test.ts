import assert from "node:assert/strict";
import { mock, test } from "node:test";

import { hentUtviklingssporsmal } from "@/lib/iup/utviklingssjekk";
import { lesIupLagring } from "@/lib/iup/lagringskontrakt";
import { UTEN_KLASSE, elevLinje, filtrerElever, klasserIGruppa, visHcp, type WangElevdata } from "./wang-elevdata-visning";

mock.module("server-only", { defaultExport: {} });
mock.module("@/lib/prisma", { namedExports: { prisma: {} } });
// Delingsporten byttes ut per test (harTilgang-parameteren); denne skal aldri kalles.
mock.module("@/lib/deling/navngitt", {
  namedExports: {
    krevNavngittTrener: async () => { throw new Error("forbidden"); },
    navngittTrenerHarTilgang: async () => { throw new Error("standardporten skal ikke brukes i testen"); },
  },
});
const modul = () => import("./wang-elevdata");

const elever = [
  { id: "e1", navn: "Syntetisk Alfa" },
  { id: "e2", navn: "Syntetisk Beta" },
  { id: "e3", navn: "Syntetisk Gamma" },
];
const elevdata: WangElevdata = {
  e1: { klasse: "VG1", delt: true, hcp: 4.2, kategori: "F" },
  e2: { klasse: "VG2", delt: false, hcp: null, kategori: null },
  e3: { klasse: null, delt: false, hcp: null, kategori: null },
};

test("klassefilteret viser bare elever i valgt klasse, og søket virker sammen med det", () => {
  assert.deepEqual(filtrerElever(elever, elevdata, { sok: "", klasse: "" }).map((e) => e.id), ["e1", "e2", "e3"]);
  assert.deepEqual(filtrerElever(elever, elevdata, { sok: "", klasse: "VG1" }).map((e) => e.id), ["e1"]);
  assert.deepEqual(filtrerElever(elever, elevdata, { sok: "", klasse: UTEN_KLASSE }).map((e) => e.id), ["e3"]);
  assert.deepEqual(filtrerElever(elever, elevdata, { sok: "beta", klasse: "VG1" }), []);
  assert.deepEqual(filtrerElever(elever, elevdata, { sok: "beta", klasse: "VG2" }).map((e) => e.id), ["e2"]);
  assert.deepEqual(klasserIGruppa(elever, elevdata), ["VG1", "VG2"]);
});

test("Elevlista viser HCP og kategori bare for elever som har delt", () => {
  assert.equal(elevLinje(elevdata.e1), "VG1 · Kategori F · HCP 4,2");
  assert.equal(elevLinje(elevdata.e2), "VG2 · Ikke delt");
  assert.equal(elevLinje(elevdata.e3), "Klasse ikke satt · Ikke delt");
  assert.equal(visHcp(-1.3), "+1,3");
  assert.equal(visHcp(null), "—");
});

const trener = { id: "trener-1", epost: "trener@wang.no" };

function levertRad() {
  const requestId = "a8c07140-7f0b-47f5-b087-3f8992b40862";
  const sporsmal = hentUtviklingssporsmal("iup-2027", "JUNIOR");
  const besvarelse = {
    versjon: "iup-2027", niva: "JUNIOR", status: "LEVERT",
    svar: Object.fromEntries(sporsmal.map((s) => [s.id, 4])),
    prosessmal: { "mal-1": "JA" },
  };
  const lagring = lesIupLagring({ type: "UTVIKLINGSSJEKK", periodeStart: "2026-09-28", periodeSlutt: "2026-10-25", forventetRevisjon: 0, requestId, besvarelse });
  if (!lagring.ok) throw new Error("syntetisk svar må være gyldig");
  return {
    id: "iup-1", type: "UTVIKLINGSSJEKK", versjon: "iup-2027", niva: "JUNIOR",
    periodeStart: new Date("2026-09-28T00:00:00Z"), periodeSlutt: new Date("2026-10-25T00:00:00Z"),
    levertRevisjon: 1, kildeSha256: lagring.data.kildeSha256,
    revisjoner: [{ revisjon: 1, requestId, requestHash: lagring.data.requestHash, payload: lagring.data.besvarelse, createdAt: new Date("2026-10-18T12:00:00Z") }],
  };
}

function fakeTx() {
  const kall: string[] = [];
  const tx = {
    iupBesvarelse: { findMany: async () => { kall.push("iup"); return [levertRad()]; } },
    goal: { findMany: async () => { kall.push("goal"); return [{ id: "mal-1", title: "Rutine før slag" }]; } },
    user: { findUnique: async () => { kall.push("user"); return { hcp: 4.2 }; } },
    round: { findMany: async () => { kall.push("round"); return []; } },
  };
  return { tx: tx as never, kall };
}

test("fireukerssjekken vises bare når eleven har delt med treneren, og elevdata leses ikke uten deling", async () => {
  const { lesWangFireukerssjekk } = await modul();
  const uten = fakeTx();
  assert.deepEqual(await lesWangFireukerssjekk(uten.tx, trener, "e1", "g1", async () => false), { status: "ikke-delt" });
  assert.deepEqual(await lesWangFireukerssjekk(uten.tx, null, "e1", "g1", async () => true), { status: "ikke-delt" });
  assert.deepEqual(uten.kall, [], "ingen elevdata leses når delingen mangler");

  const med = fakeTx();
  const sjekk = await lesWangFireukerssjekk(med.tx, trener, "e1", "g1", async (_tx, t, spiller, gruppe) =>
    t.id === trener.id && spiller === "e1" && gruppe === "g1");
  assert.equal(sjekk.status, "delt");
  if (sjekk.status !== "delt") return;
  assert.equal(sjekk.runder.length, 1);
  assert.equal(sjekk.runder[0]?.innhold?.status, "LEVERT");
  assert.equal(sjekk.prosessmal["mal-1"], "Rutine før slag");
});

test("HCP og kategori leses bare når eleven har delt", async () => {
  const { lesDeltElevinfo } = await modul();
  const uten = fakeTx();
  assert.deepEqual(await lesDeltElevinfo(uten.tx, trener, "e1", "g1", 2026, async () => false), { delt: false, hcp: null, kategori: null });
  assert.deepEqual(uten.kall, []);

  const med = fakeTx();
  const info = await lesDeltElevinfo(med.tx, trener, "e1", "g1", 2026, async () => true);
  assert.equal(info.delt, true);
  assert.equal(info.hcp, 4.2);
  assert.match(info.kategori ?? "", /^[A-K]$/);
});
