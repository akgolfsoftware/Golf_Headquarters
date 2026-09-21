/**
 * PH-12-kontroll 21.09.2026: hva en venn får se om en økt.
 *
 * Regelen (`actions.ts`-hodet, og kontrakten for Meg-fordypningen): venner
 * ser KUN at en økt skjedde — aldri plan, fagdata, helse eller coachnotater.
 *
 * Fram til 21.09.2026 gjorde feeden det motsatte av sin egen dokumentasjon:
 * den viste `practiceType` («Repetisjon», «Variasjon», «Konkurranse») og
 * `miljo` («Simulator», «Bane-simulering», «Turnering») — AK-taksonomi
 * oversatt til norsk, altså coachens treningsopplegg lest utenfra.
 *
 * Testen holder på `byggOktFeedElement`, som er den rene regelen. Selve
 * spørringen er dekket av auth-guarden i `hentVennProfil`.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { byggOktFeedElement } from "./feed";

const dato = new Date("2026-09-18T17:30:00Z");

describe("øktelement i vennefeeden", () => {
  it("sier at en økt skjedde, og når", () => {
    const e = byggOktFeedElement({ id: "okt-1", startTime: dato });
    assert.equal(e.slag, "okt");
    assert.equal(e.id, "okt-okt-1");
    assert.equal(e.dato, dato.toISOString());
    assert.match(e.tittel, /trente/i);
  });

  it("røper ikke praksistype eller miljø", () => {
    const e = byggOktFeedElement({ id: "okt-1", startTime: dato });
    const tekst = `${e.tittel} ${e.detalj}`.toLowerCase();
    for (const fagord of [
      "repetisjon",
      "variasjon",
      "konkurranse",
      "spilltest",
      "simulator",
      "bane-simulering",
      "slow-motion",
      "statisk",
      "turnering",
    ]) {
      assert.ok(
        !tekst.includes(fagord),
        `«${fagord}» er fagdata og skal ikke stå i en vennefeed`,
      );
    }
  });

  it("har ingen detaljtekst å lekke gjennom", () => {
    assert.equal(byggOktFeedElement({ id: "okt-1", startTime: dato }).detalj, "");
  });
});
