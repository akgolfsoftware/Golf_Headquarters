/**
 * Enhetstester for Team Norway-post-reglene (Claw batch 3): synlighet for
 * gruppe- vs. 1:1-poster, og lesekvittering-brøken. Kjøres av `npm test`.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { beregnLesekvittering, erTnPostKind, kanSeGruppepost, kanSeSpillerpost } from "./tn-post-regler";

describe("erTnPostKind", () => {
  it("godtar kanoniske kinder", () => {
    assert.equal(erTnPostKind("TEKST"), true);
    assert.equal(erTnPostKind("REISE"), true);
  });
  it("avviser ukjent kind", () => {
    assert.equal(erTnPostKind("CHAT"), false);
  });
});

describe("kanSeGruppepost", () => {
  it("kun aktive medlemmer ser gruppeposten", () => {
    assert.equal(kanSeGruppepost(true), true);
    assert.equal(kanSeGruppepost(false), false);
  });
});

describe("kanSeSpillerpost", () => {
  it("spilleren selv ser alltid egen post", () => {
    assert.equal(
      kanSeSpillerpost({ viewerId: "spiller-1", spillerId: "spiller-1", viewerErGodkjentForesattForSpilleren: false }),
      true,
    );
  });

  it("godkjent foresatt ser 1:1-posten — idrettens åpenhetsprinsipp", () => {
    assert.equal(
      kanSeSpillerpost({ viewerId: "foresatt-1", spillerId: "spiller-1", viewerErGodkjentForesattForSpilleren: true }),
      true,
    );
  });

  it("en tilfeldig bruker ser ikke posten", () => {
    assert.equal(
      kanSeSpillerpost({ viewerId: "annen-bruker", spillerId: "spiller-1", viewerErGodkjentForesattForSpilleren: false }),
      false,
    );
  });
});

describe("beregnLesekvittering", () => {
  it("ingen har lest — 0 av N, alle mangler", () => {
    const kv = beregnLesekvittering(["a", "b", "c"], []);
    assert.equal(kv.totalt, 3);
    assert.equal(kv.apnet, 0);
    assert.deepEqual(kv.manglerIder.sort(), ["a", "b", "c"]);
  });

  it("delvis lest — brøken og navnelisten stemmer", () => {
    const kv = beregnLesekvittering(["a", "b", "c", "d"], ["b", "d"]);
    assert.equal(kv.totalt, 4);
    assert.equal(kv.apnet, 2);
    assert.deepEqual(kv.manglerIder.sort(), ["a", "c"]);
  });

  it("alle har lest — ingen mangler", () => {
    const kv = beregnLesekvittering(["a", "b"], ["a", "b"]);
    assert.equal(kv.apnet, kv.totalt);
    assert.deepEqual(kv.manglerIder, []);
  });

  it("en lesekvittering fra noen utenfor mottakerlista teller ikke med", () => {
    const kv = beregnLesekvittering(["a", "b"], ["a", "utenfor-lista"]);
    assert.equal(kv.apnet, 1);
    assert.deepEqual(kv.manglerIder, ["b"]);
  });
});
