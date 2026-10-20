import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { byggTesterOversikt, manglerFlest, type OversiktResultat } from "./oversikt-bygg";

const now = new Date("2026-10-20T10:00:00Z");
const dager = (n: number) => new Date(now.getTime() - n * 86_400_000);
let nr = 0;
const r = (userId: string, name: string, dagerSiden: number, x: Partial<OversiktResultat> = {}): OversiktResultat => ({
  id: `r${++nr}`, userId, takenAt: dager(dagerSiden), test: { id: `def-${name}`, name }, recordedById: null, witnessStatus: "PENDING", visning: "—", ...x,
});

describe("byggTesterOversikt", () => {
  const spillere = [{ id: "a", navn: "Ada" }, { id: "b", navn: "Bo" }];
  const res = [
    r("a", "Driver Basic", 3, { recordedById: "coach" }),
    r("a", "Benkpress", 5),
    r("a", "TN Putt Gate", 60),
    r("a", "Inspill Basis", 10, { witnessStatus: "ATTESTED" }),
    r("b", "Min egen test", 1),
    r("x", "Driver Basic", 1),
  ];
  const d = byggTesterOversikt(spillere, res, now);
  const celle = (spiller: number, navn: string) => d.rader[spiller].celler[["Driver Basic", "Inspill Basic", "Wedge Variation", "8-balls variation", "Putt 1–3 m", "Golfslag på banen", "18 hulls inspill", "9 hull lengde", "Driver Gate", "Wedge Gate", "Putt Gate", "Nærspill Gate", "VISA Express", "Putt Speed 1 × 5", "Benkpress", "Markløft trapbar", "Lengdehopp", "Rotasjonskast", "Club Speed"].indexOf(navn)];

  it("ført av trener eller merket kontrollert er K, egenført er E, eldre enn seks uker er G, ellers M", () => {
    assert.equal(celle(0, "Driver Basic").status, "K");
    assert.equal(celle(0, "Inspill Basic").status, "K");
    assert.equal(celle(0, "Benkpress").status, "E");
    assert.equal(celle(0, "Putt Gate").status, "G");
    assert.equal(celle(0, "Club Speed").status, "M");
  });
  it("prioriterte viser fremdrift mot minstekravet, andre dato", () => {
    assert.equal(celle(0, "Inspill Basic").tekst, "1 av 2");
    assert.equal(celle(0, "Driver Basic").tekst, "1 av 1");
    assert.equal(celle(0, "Benkpress").tekst, "15.10");
    assert.equal(celle(0, "Club Speed").tekst, "—");
  });
  it("teller tatt, dekning og prioriterte; tester utenfor batteriet og andres spillere telles ikke", () => {
    assert.equal(d.rader[0].tatt, 3);
    assert.equal(d.rader[1].tatt, 0);
    assert.equal(d.tall.mulig, 38);
    assert.equal(d.tall.dekning, 8);
    assert.equal(d.tall.prioritertOppfylt, 0);
    assert.ok(d.rader[0].underMinste.includes("Inspill Basic 1 av 2"));
  });
  it("til kontroll er bare egenført, ukontrollert og innen seks uker", () => {
    assert.deepEqual(d.tilKontroll.map((t) => [t.spillerNavn, t.test]), [["Ada", "Benkpress"]]);
  });
  it("mangler flest sorterer flest mangler først", () => {
    assert.deepEqual(manglerFlest(d.rader).map((x) => x.navn), ["Bo", "Ada"]);
  });
  it("tom stall gir dekning «—»", () => {
    assert.equal(byggTesterOversikt([], [], now).tall.dekning, null);
  });
});
