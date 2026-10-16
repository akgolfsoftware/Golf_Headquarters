import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  kategoriserKolle,
  analyserGap,
  tilIsoDato,
  beregnProfilKompletthet,
} from "./ph24-data";

describe("ph24-data", () => {
  describe("kategoriserKolle", () => {
    it("kategoriserer kjente køllenavn riktig", () => {
      assert.equal(kategoriserKolle("Driver Qi10"), "driver");
      assert.equal(kategoriserKolle("3W Stealth 2"), "wood");
      assert.equal(kategoriserKolle("Hybrid 4H"), "hybrid");
      assert.equal(kategoriserKolle("7-jern P770"), "jern");
      assert.equal(kategoriserKolle("56° SM9 Sand Wedge"), "wedge");
      assert.equal(kategoriserKolle("Putter Spider GT"), "putter");
      assert.equal(kategoriserKolle("Uspesifisert dings"), "annet");
    });
  });

  describe("analyserGap", () => {
    it("oppdager normale avstandsgap", () => {
      const gap = analyserGap("8i", "7i", 140, 151);
      assert.equal(gap.meter, 11);
      assert.equal(gap.status, "normal");
    });

    it("oppdager for tette gap under 7 meter", () => {
      const gap = analyserGap("3W", "Driver", 225, 230);
      assert.equal(gap.meter, 5);
      assert.equal(gap.status, "for-tett");
    });

    it("oppdager for store gap over 16 meter", () => {
      const gap = analyserGap("5i", "4H", 170, 190);
      assert.equal(gap.meter, 20);
      assert.equal(gap.status, "for-stort");
    });
  });

  describe("tilIsoDato", () => {
    it("formaterer dato korrekt til ISO", () => {
      const d = new Date("2005-04-12T00:00:00Z");
      assert.equal(tilIsoDato(d), "2005-04-12");
      assert.equal(tilIsoDato(null), "");
    });
  });

  describe("beregnProfilKompletthet", () => {
    it("gir 100 % når alle 5 kjernefelter er utfylt", () => {
      const res = beregnProfilKompletthet({
        navn: "Viktor Hovland",
        epost: "viktor@example.com",
        mobil: "+4798765432",
        fodselsdatoISO: "1997-09-18",
        homeClub: "Miklagard Golf",
      });
      assert.equal(res.prosent, 100);
      assert.equal(res.mangler.length, 0);
    });

    it("identifiserer manglende felt og prosent", () => {
      const res = beregnProfilKompletthet({
        navn: "Ola Nordmann",
        epost: "ola@example.com",
        mobil: null,
        fodselsdatoISO: null,
        homeClub: "",
      });
      assert.equal(res.prosent, 40);
      assert.deepEqual(res.mangler, ["Mobilnummer", "Fødselsdato", "Hjemmeklubb"]);
    });
  });
});
