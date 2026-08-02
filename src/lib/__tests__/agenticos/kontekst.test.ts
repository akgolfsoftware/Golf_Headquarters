import assert from "node:assert/strict";
import test from "node:test";
import { byggFasitKontekst } from "@/lib/agenticos/kontekst";
import type { Klassifisering } from "@/lib/agenticos/typer";

function k(over: Partial<Klassifisering> = {}): Klassifisering {
  return {
    intent: "tolk-tall",
    domene: "SG",
    rolle: "SPILLER",
    mindreaarig: false,
    confidence: 1,
    ...over,
  };
}

test("SG-domenet gir SG-kategorier og APP-bånd fra fasiten", () => {
  const b = byggFasitKontekst(k({ domene: "SG" }));
  assert.ok(b);
  assert.equal(b.kilde, "FASIT");
  assert.match(b.innhold, /SG-kategorier/);
  assert.match(b.innhold, /APP-bånd/);
});

test("kandidatfeil for et SG-område framstilles som hypotese, aldri diagnose", () => {
  const b = byggFasitKontekst(k({ domene: "SG" }), { sgOmrade: "APP" });
  assert.ok(b);
  assert.match(b.innhold, /Kandidatfeil for SG APP/);
  assert.match(b.innhold, /HYPOTESER/);
  assert.match(b.innhold, /må bekreftes med videoanalyse/i);
  assert.match(b.innhold, /ikke en rangering/);
});

test("PUTT sier eksplisitt at MORAD ikke dekker putting", () => {
  const b = byggFasitKontekst(k({ domene: "SG" }), { sgOmrade: "PUTT" });
  assert.ok(b);
  assert.match(b.innhold, /dekker ikke putting/);
  assert.doesNotMatch(b.innhold, /Kandidatfeil for SG PUTT/);
});

test("APP-bånd med lav sikkerhet merkes som retningssignal", () => {
  const b = byggFasitKontekst(k({ domene: "SG" }));
  assert.ok(b);
  // 200+ yards har confidence 0.7 i fasiten og skal flagges.
  assert.match(b.innhold, /retningssignal/);
});

test("TEKNIKK gir MORAD-feil og P-posisjoner", () => {
  const b = byggFasitKontekst(k({ domene: "TEKNIKK", intent: "teknikk" }));
  assert.ok(b);
  assert.match(b.innhold, /MORAD-svingfeil/);
  assert.match(b.innhold, /over_the_top/);
  assert.match(b.innhold, /P-posisjoner/);
  assert.match(b.innhold, /P1\.0/);
});

test("faultId snevrer inn til én feil", () => {
  const b = byggFasitKontekst(k({ domene: "TEKNIKK" }), { faultId: "over_the_top" });
  assert.ok(b);
  assert.match(b.innhold, /over_the_top/);
  assert.doesNotMatch(b.innhold, /- left_elbow_stall/);
});

test("PLAN gir CANON-perioder og advarer mot rå periodestreng", () => {
  const b = byggFasitKontekst(k({ domene: "PLAN", intent: "plan" }));
  assert.ok(b);
  assert.match(b.innhold, /CANON-perioder/);
  assert.match(
    b.innhold,
    /Skriv aldri CANON-strengen rått/,
    "periodenavn-fella må stå eksplisitt i konteksten",
  );
});

test("PLAN med akKategori henter riktig pyramidefordeling", () => {
  const b = byggFasitKontekst(k({ domene: "PLAN" }), { akKategori: "A" });
  assert.ok(b);
  assert.match(b.innhold, /CANON-kategori A/);
  assert.match(b.innhold, /Standard pyramidefordeling: FYS \d+%/);
});

test("ukjent akKategori faller pent tilbake uten å kaste", () => {
  const b = byggFasitKontekst(k({ domene: "PLAN" }), { akKategori: "ZZ" });
  assert.ok(b);
  assert.doesNotMatch(b.innhold, /CANON-kategori ZZ/);
  assert.match(b.innhold, /CANON-perioder/);
});

test("tom drill-bank meldes i alle domener som har innhold", () => {
  for (const domene of ["SG", "TEKNIKK", "PLAN"] as const) {
    const b = byggFasitKontekst(k({ domene }));
    assert.ok(b, `${domene} skal gi en blokk`);
    assert.match(
      b.innhold,
      /Drill-banken er tom/,
      `${domene} må si fra at banken er tom`,
    );
  }
});

test("domener uten fasit gir null i stedet for en tom blokk", () => {
  assert.equal(byggFasitKontekst(k({ domene: "BOOKING", intent: "drift" })), null);
  assert.equal(byggFasitKontekst(k({ domene: "OKONOMI", intent: "drift" })), null);
});

test("GENERELT gir kun drill-status, ikke fagfasit", () => {
  const b = byggFasitKontekst(k({ domene: "GENERELT", intent: "fritekst" }));
  assert.ok(b);
  assert.match(b.innhold, /Drill-banken er tom/);
  assert.doesNotMatch(b.innhold, /CANON-perioder/);
});
