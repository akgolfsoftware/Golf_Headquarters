import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { describe, it } from "node:test";

/**
 * Merkereglene for markedssidene i Precision Athletics (beslutninger.md og
 * BUSINESS-RULES.md): Book time, ingen kartleggingsøkt, ingen vitnesbyrd eller
 * sitater, MORAD nevnes aldri, priser skrives aldri inn for hånd.
 * Nye sider legges til i SIDER når de bygges.
 */

const SIDER = [
  "PriserPrecision.tsx",
  "CoachingPrecision.tsx",
  "CoacherPrecision.tsx",
  "OmOssPrecision.tsx",
  "KontaktPrecision.tsx",
  "FaqPrecision.tsx",
  "JuniorPrecision.tsx",
  "PlayerHQPrecision.tsx",
];

/** Kildetekst uten kommentarlinjer, så dokumentasjonen kan nevne det som er utelatt. */
function kode(fil: string): string {
  return readFileSync(new URL(`./${fil}`, import.meta.url), "utf8")
    .split("\n")
    .filter((l) => {
      const t = l.trim();
      return !t.startsWith("*") && !t.startsWith("//") && !t.startsWith("/**");
    })
    .join("\n");
}

const FORBUDT = [
  /kartlegg/i,
  /morad/i,
  /o'grady/i,
  /virkedag/i,
  /sitat/i,
  /<blockquote/i,
  /stjerne/i,
  /vitnesbyrd/i,
  /neste niv/i,
  /passion/i,
  /angrerett/i,
  /\bvipps\b/i,
  /bankid/i,
  /\bELITE\b/,
  /Mest valgt/i,
];

describe("Markedssidene: merke- og prisregler", () => {
  for (const fil of SIDER) {
    describe(fil, () => {
      it("finnes", () => {
        assert.ok(existsSync(new URL(`./${fil}`, import.meta.url)));
      });

      it("har ingen forbudte ord", () => {
        const k = kode(fil);
        for (const ord of FORBUDT) {
          assert.doesNotMatch(k, ord, `Forbudt ord ${ord} i ${fil}`);
        }
      });

      it("skriver ikke kronebeløp inn for hånd", () => {
        assert.doesNotMatch(kode(fil), /\b[1-9][\d ]*\s?kr\b/, `Hardkodet pris i ${fil}`);
        assert.doesNotMatch(kode(fil), /\b(299|2 ?690|1 ?300|2 ?300)\b/);
      });

      it("har hovedknappen «Book time»", () => {
        assert.match(kode(fil), /Book time/);
      });
    });
  }

  it("prissiden leser pris fra abonnementsdomenet og ServiceType", () => {
    const k = readFileSync(new URL("./PriserPrecision.tsx", import.meta.url), "utf8");
    assert.match(k, /PLAYERHQ_PRIS_MND_ORE/);
    assert.match(k, /PLAYERHQ_PRIS_AAR_ORE/);
    assert.match(k, /hentTjenester/);
    const felles = readFileSync(new URL("./felles.tsx", import.meta.url), "utf8");
    assert.match(felles, /priceOre/);
  });

  it("nivåene heter Gratis og Full, ikke Pro eller Premium", () => {
    const k = kode("PriserPrecision.tsx");
    assert.match(k, /"Gratis"/);
    assert.match(k, /"Full"/);
    assert.doesNotMatch(k, /Premium|"Pro"/);
  });

  it("prøveuken er én uke", () => {
    for (const fil of ["PriserPrecision.tsx", "FaqPrecision.tsx", "PlayerHQPrecision.tsx"]) {
      const k = kode(fil);
      assert.match(k, /én uke/, fil);
      assert.doesNotMatch(k, /30 dager|første måned/i, fil);
    }
  });

  it("PlayerHQ har fanene I dag, Plan, Stats og Meg", () => {
    const k = kode("PlayerHQPrecision.tsx");
    for (const fane of ["I dag", "Plan", "Stats", "Meg"]) {
      assert.match(k, new RegExp(`tittel: "${fane}"`));
    }
    assert.doesNotMatch(k, /tittel: "Analyse"/);
  });

  it("kontaktsiden lover ingen svartid", () => {
    assert.doesNotMatch(kode("KontaktPrecision.tsx"), /svarer innen|samme dag/i);
    assert.doesNotMatch(kode("FaqPrecision.tsx"), /svarer innen|samme dag/i);
  });
});
