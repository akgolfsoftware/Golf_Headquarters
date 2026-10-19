import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { before, describe, it, mock } from "node:test";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { DgSgRunde } from "../../src/lib/datagolf/visning";

mock.module("@/styles/datagolf-komponenter.css", { namedExports: {} });

type Komp = typeof import("../../src/components/datagolf");
let K: Komp;
before(async () => { K = await import("../../src/components/datagolf"); });

const runde = (id: number, o: Partial<DgSgRunde> = {}): DgSgRunde => ({
  id, dato: `2026-02-${String(id).padStart(2, "0")}`, tour: "euro", arrangement: "Test", runde: 1,
  total: 1, ott: null, app: null, arg: null, putt: null, ...o,
});
const html = (e: React.ReactElement) => renderToStaticMarkup(e);
const el = (e: React.ReactElement) => html(e).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ");

describe("Data Golf-komponenter: tilstander", () => {
  it("ingen-tilgang rendrer ingenting, ikke engang rammen", () => {
    assert.equal(html(React.createElement(K.SgProfil, { resultat: { tilstand: "ingen-tilgang" } })), "");
    assert.equal(html(React.createElement(K.SpillerKort, { resultat: { tilstand: "ingen-tilgang" } })), "");
  });
  it("laster, tom, feil og ikke-konfigurert har egen tekst og lisensmerke", () => {
    const t = (tilstand: "laster" | "tom" | "feil" | "ikke-konfigurert") =>
      el(React.createElement(K.RundeTrend, { resultat: { tilstand } }));
    assert.match(t("laster"), /Henter/);
    assert.match(t("tom"), /Ingen runder med SG/);
    assert.match(t("feil"), /Kunne ikke hente/);
    assert.match(t("ikke-konfigurert"), /ikke satt opp/);
    for (const s of ["laster", "tom", "feil", "ikke-konfigurert"] as const) assert.match(t(s), /vises ikke til spillere/);
  });
  it("feiltilstanden lekker ingen feiltekst", () => {
    assert.doesNotMatch(el(React.createElement(K.TourDekning, { resultat: { tilstand: "feil" } })), /postgres|prisma|password|:\/\//i);
  });
});

describe("Data Golf-komponenter: ærlig om manglende data", () => {
  it("SgProfil uten kategori viser forklaring og strek, ikke 0", () => {
    const t = el(React.createElement(K.SgProfil, { resultat: { tilstand: "klar", data: [runde(1), runde(2)] } }));
    assert.match(t, /Kategori-SG finnes bare for PGA Tour og LIV/);
    assert.match(t, /ingen runder/);
    assert.doesNotMatch(t, /0,00/);
  });
  it("RundeTrend med bare nullrunder blir tom", () => {
    const t = el(React.createElement(K.RundeTrend, { resultat: { tilstand: "klar", data: [runde(1, { total: null })] } }));
    assert.match(t, /Ingen runder med SG/);
  });
  it("ApproachSkill uten tall blir tom, og tom payload dikter ikke opp bøtter", () => {
    const t = el(React.createElement(K.ApproachSkill, { resultat: { tilstand: "klar", data: { asOf: "2026-10-19", period: "l24", payload: {} } } }));
    assert.match(t, /Ingen approach-skill/);
    assert.doesNotMatch(t, /Fairway 50/);
  });
  it("ApproachSkill viser kildebøttene og markerer tynt grunnlag", () => {
    const t = el(React.createElement(K.ApproachSkill, { resultat: { tilstand: "klar", data: { asOf: "2026-10-19", period: "l24", payload: {
      "100_150_fw_sg_per_shot": 0.1, "100_150_fw_shot_count": 500, "over_150_rgh_sg_per_shot": -0.2, "over_150_rgh_shot_count": 5,
    } } } }));
    assert.match(t, /Fairway 100–150 yd/);
    assert.match(t, /Rough over 150 yd/);
    assert.match(t, /tynt grunnlag/);
  });
  it("TourDekning sier at kategori-SG ikke finnes for tourer utenom PGA og LIV", () => {
    const t = el(React.createElement(K.TourDekning, { resultat: { tilstand: "klar", data: [
      { tour: "euro", antallRunder: 10, medTotal: 10, medKategori: 0, fraAar: 2017, tilAar: 2026 }] } }));
    assert.match(t, /finnes ikke/);
    assert.match(t, /Ingen fordelinger|Fordelinger finnes/);
  });
});

describe("Data Golf-komponenter: bruk bare bak Data Golf-porten", () => {
  const TILLATT = [
    "src/app/admin/", "src/app/(internal)/", "src/app/team-wang/coach/",
    "src/app/portal/analysere/datagolf/", "src/app/portal/datagolf/",
  ];
  const rot = join(__dirname, "../..");
  function filer(mappe: string): string[] {
    return readdirSync(mappe).flatMap(n => {
      const p = join(mappe, n);
      return statSync(p).isDirectory() ? filer(p) : /\.(ts|tsx)$/.test(n) ? [p] : [];
    });
  }
  it("ingen annen flate importerer komponentene eller datalaget", () => {
    const brudd = filer(join(rot, "src")).map(f => relative(rot, f))
      .filter(f => !f.startsWith("src/components/datagolf/") && !f.startsWith("src/lib/datagolf/"))
      .filter(f => /@\/components\/datagolf(?:\/(?:index|DgRamme|SgProfil|RundeTrend|TourDekning|ApproachSkill|SpillerKort))?["']|@\/lib\/datagolf\/komponent-data/.test(readFileSync(join(rot, f), "utf8")))
      .filter(f => !TILLATT.some(t => f.startsWith(t)));
    assert.deepEqual(brudd, [], `Data Golf-komponentene er importert utenfor porten: ${brudd.join(", ")}`);
  });
  it("datalaget sjekker tilgang selv", () => {
    const kilde = readFileSync(join(rot, "src/lib/datagolf/komponent-data.ts"), "utf8");
    assert.match(kilde, /hentDataGolfBruker/);
    assert.match(kilde, /ingen-tilgang/);
  });
});
