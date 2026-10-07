import { describe, test, mock } from "node:test";
import assert from "node:assert/strict";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";

mock.module("server-only", { defaultExport: {} });

for (const css of [
  "precision-a2.css",
  "precision-a4.css",
  "precision-a5.css",
  "precision-a7.css",
  "precision-a17.css",
  "precision-a18.css",
  "precision-a19.css",
  "precision-a21.css",
  "precision-a22.css",
  "precision-komponenter.css",
  "precision-athletics.css",
]) {
  mock.module(`@/styles/${css}`, { namedExports: {} });
}

mock.module("next/navigation", {
  namedExports: {
    useRouter: () => ({ push() {}, replace() {} }),
  },
});
mock.module("next/link", { defaultExport: "a" });

describe("AG22InnsiktTalent (Innsikt og talent)", async () => {
  const { AG22InnsiktTalent } = await import("@/components/admin/precision/AG22InnsiktTalent");
  const vis = (props: Record<string, unknown>) =>
    renderToStaticMarkup(React.createElement(AG22InnsiktTalent, props as never));

  const data = {
    src: "TESTER · ESTIMAT",
    axes: ["FYS", "TEK", "SLAG", "SPILL", "TURN"],
    peer: { label: "Peer-snitt", v: [60, 60, 60, 60, 60] },
    players: [
      { id: "a", name: "Voksen Spiller", born: 2005, consent: false, v: [60, 61, 62, 63, 64] },
      { id: "b", name: "Barn Uten Samtykke", born: 2010, consent: false, v: [50, 50, 50, 50, 50] },
      { id: "c", name: "Barn Med Samtykke", born: 2010, consent: true, v: [55, 55, 55, 55, 55] },
      { id: "d", name: "Ukjent Alder", born: null, consent: true, v: [50, 50, 50, 50, 50] },
    ],
    discovery: [
      { id: "x", kilde: "Talentdag", spiller: "Skjult Barn", fodt: 2013, resultat: "—", samtykke: false },
      { id: "y", kilde: "Talentdag", spiller: "Synlig Barn", fodt: 2013, resultat: "—", samtykke: true },
    ],
    wagr: null,
  };

  test("personvernregelen gjelder ekte data: født 2008+ uten samtykke og manglende fødselsår skjules", () => {
    const html = vis({ tilstand: "data", startFane: "radar", data });
    assert.match(html, /Voksen Spiller/);
    assert.match(html, /Barn Med Samtykke/);
    assert.doesNotMatch(html, /Barn Uten Samtykke|Ukjent Alder/);
    assert.match(html, /2 spillere er skjult/);
  });

  test("discovery skjuler barn uten samtykke", () => {
    const html = vis({ tilstand: "data", startFane: "disc", data });
    assert.match(html, /Synlig Barn/);
    assert.doesNotMatch(html, /Skjult Barn/);
  });

  test("WAGR uten importert fil viser ingen oppdiktet fil", () => {
    const html = vis({ tilstand: "data", startFane: "wagr", data });
    assert.match(html, /INGEN FIL IMPORTERT/);
    assert.doesNotMatch(html, /wagr-export|Emil Strand/);
  });

  test("uten data vises ingen demospillere", () => {
    const html = vis({ tilstand: "tom", startFane: "radar" });
    assert.match(html, /Ingen talentprofiler/);
    assert.doesNotMatch(html, /Tobias|Magnus|Ingrid|Henrik/);
    const standard = vis({ startFane: "radar" });
    assert.doesNotMatch(standard, /Tobias|Magnus|Ingrid|Henrik/);
  });

  test("laster og feil", () => {
    assert.match(vis({ tilstand: "laster" }), /Henter talentprofiler/);
    assert.match(vis({ tilstand: "feil" }), /Talentdata kunne ikke hentes/);
  });
});
