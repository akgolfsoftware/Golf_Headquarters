import { describe, test, mock } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { summerTreningsvolum, type TreningsvolumOkt } from "@/lib/workbench/treningsvolum";
import type { S360Iup, S360Stats } from "@/lib/admin-spiller/spiller360-typer";
import { snittscore } from "@/lib/admin-spiller/spiller360-visning";

mock.module("@/styles/precision-a8.css", { namedExports: {} });
mock.module("@/app/portal/analysere/actions", { namedExports: {
  hentTreningsHistorikkFiltrert: async () => { throw new Error("Historikk skal ikke hentes ved statisk visning"); },
} });
describe("Spiller360 treningsvolum", async () => {
const { TreningsvolumVisning } = await import("@/components/admin/precision/TreningsvolumVisning");
const { AG08Stats } = await import("@/components/admin/precision/AG08Stats");
const { AG08Iup } = await import("@/components/admin/precision/AG08Faner");

const vindu = { fraDato: new Date("2026-09-28T00:00:00Z"), tilDato: new Date("2026-10-05T00:00:00Z"), naa: new Date("2026-10-02T12:20:00Z") };
function okt(id: string, pyramid: string, actualMinutes: number | null, ekstra: Partial<TreningsvolumOkt> = {}): TreningsvolumOkt {
  return { id, pyramid, actualMinutes, date: new Date("2026-09-29T00:00:00Z"), startMinute: 600, durationMinutes: 60, status: "COMPLETED", ...ekstra };
}
const volum = summerTreningsvolum([
  okt("registrert", "TEK", 45), okt("ukjent", "TEK", null), okt("null-minutter", "FYS", 0),
  okt("estimat", "SLAG", null, { kilde: "legacy", legacyAnslagMinutter: 30 }),
  okt("framtid", "SPILL", null, { date: new Date("2026-10-04T00:00:00Z"), status: "PUBLISHED" }),
], vindu);
const trening: S360Stats["trening"] = {
  analyse: null, volumOmrader: [], volumTotal: 0, volumUker: [], korrelasjon: [], planMotFaktisk: [],
  volumMetadata: volum, planKilde: "WORKBENCH · DENNE UKA",
};
function stats(t = trening) {
  const d: S360Stats = {
    snitt: { ...snittscore([]), kilde: "SYNTETISK GRUNNLAG" }, runder: [], tigerFive: [],
    sg: {
      verdi: null, trend: null, runder: 0, baseline: "SYNTETISK GRUNNLAG", grunnlag: null, kilde: null,
      datagrunnlag: "ingen", omrader: [], stallKilde: "SYNTETISK GRUNNLAG",
      motSegSelv: { harSvar: false, grunnlag: "Ingen runder", akser: [], verst: null }, nesteFokus: null, uker: [],
    },
    trening: t, trackman: { koller: [], okter: [] }, putting: { band: [], baseline: "SYNTETISK GRUNNLAG" },
    progresjon: null,
    vekstrate: { egenRate: null, kohortRate: null, fraAar: null, tilAar: null, harSvar: false, harKohort: false, grunnlag: "Ingen runder" },
    turneringer: { antall: 0, bestePlassering: null, kilder: [], tomGrunn: "Ingen turneringer", aar: [] }, tester: [],
  };
  return renderToStaticMarkup(createElement(AG08Stats, { d, tom: false, spillerId: "syntetisk-spiller", start: "tren" }));
}
const iup: S360Iup = {
  ak: false,
  person: { navn: "Syntetisk spiller", fodt: null, klubb: null, skole: null, hovedcoach: null, telefon: null, epost: "syntetisk@example.invalid", spilteAar: null, ambisjon: null, grupper: [] },
  foreldre: [], ranking: [], resultatmaal: [], prosessmaal: [], perioder: [], turneringer: [], uke: [],
  trening: { gjennomfort: 4, planlagt: 5, timer: [], kilde: "WORKBENCH · 4 UKER", volumMetadata: volum },
  tester: [], teknikk: [], teknikkKilde: null, fys: [],
};
const text = (html: string) => html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ");

test("Stats beholder plan og alle fem områder selv uten eldre faktisk-rader", () => {
  const html = stats();
  for (const akse of ["FYS", "TEK", "SLAG", "SPILL", "TURN"]) assert.ok(html.includes(akse));
  assert.ok(!html.includes("Ingen plan denne uka"));
  assert.ok(html.includes("0 / 60 min"), "Uttrykkelig null vises som null minutter");
  assert.ok(html.includes("— / 60 min"), "Uregistrert tid vises som tankestrek");
  assert.ok(html.includes("45 / 120 min"), "Registrert del beholder hele planen");
  assert.match(text(html), /Planlagt 300 min/);
  assert.ok(html.includes("DELVIS REGISTRERING"));
  assert.ok(html.includes("UKJENT 1 ØKTER"));
  assert.ok(html.includes("KOMMER 60 MIN"));
  assert.ok(html.includes("ESTIMAT 30 MIN"));
  assert.match(text(html), /Faktisk registrert 45 min/);
  assert.match(text(html), /Registreringsgrad 50 %/);
});

test("bare framtidig plan gir ingen prosent eller oppdiktet registrert null", () => {
  const framtid = summerTreningsvolum([okt("kommer", "TURN", null, { date: new Date("2026-10-04T00:00:00Z"), status: "PUBLISHED" })], vindu);
  const html = text(renderToStaticMarkup(createElement(TreningsvolumVisning, { volum: framtid })));
  assert.match(html, /Faktisk registrert —/);
  assert.match(html, /Registreringsgrad —/);
  assert.ok(!html.includes("0 %"));
  assert.ok(!html.includes("100 %"));
  assert.ok(html.includes("KOMMER 60 MIN"));
});

test("IUP bruker samme grunnlag med timer, ukjent og estimat separat", () => {
  const html = renderToStaticMarkup(createElement(AG08Iup, { d: iup, tom: false }));
  assert.match(text(html), /Planlagt 5,0 t/);
  assert.match(text(html), /Faktisk registrert 0,8 t/);
  assert.ok(html.includes("0,0 / 1,0 t"));
  assert.ok(html.includes("— / 1,0 t"));
  assert.ok(html.includes("KOMMER 1,0 T"));
  assert.ok(html.includes("ESTIMAT 0,5 T"));
  assert.ok(html.includes("DELVIS REGISTRERING"));
});

test("registreringsgrad viser to av tre og teller hoppet over og avbrutt separat", () => {
  const grunnlag = summerTreningsvolum([
    okt("en", "TEK", 45), okt("to", "FYS", 0), okt("mangler", "SLAG", null, { status: "PUBLISHED" }),
    okt("hoppet-over", "SPILL", 30, { status: "SKIPPED" }), okt("avbrutt", "TURN", 30, { status: "ABANDONED" }),
    okt("aktiv", "TEK", null, { status: "IN_PROGRESS", date: new Date("2026-10-02T00:00:00Z"), startMinute: 14 * 60 }),
  ], vindu);
  const html = text(renderToStaticMarkup(createElement(TreningsvolumVisning, { volum: grunnlag })));
  assert.match(html, /Registreringsgrad 67 %/);
  assert.ok(html.includes("2 AV 3 ØKTER"));
  assert.ok(html.includes("HOPPET OVER 1 ØKTER"));
  assert.ok(html.includes("AVBRUTT 1 ØKTER"));
  assert.match(html, /Faktisk registrert 45 min/);
  assert.match(html, /Fullførte økter 2 \/ 6/);
});

test("ugyldig Oslo-tid varsler om retting og kan aldri gi falsk full registrering", () => {
  const grunnlag = summerTreningsvolum([
    okt("ugyldig", "TEK", 45, { date: new Date("2026-03-29T00:00:00Z"), startMinute: 150 }),
    okt("normal", "TEK", 45, { date: new Date("2026-03-29T00:00:00Z"), startMinute: 240 }),
  ], { fraDato: new Date("2026-03-23T00:00:00Z"), tilDato: new Date("2026-03-30T00:00:00Z"), naa: new Date("2026-03-29T12:00:00Z") });
  const html = text(renderToStaticMarkup(createElement(TreningsvolumVisning, { volum: grunnlag })));
  assert.match(html, /Planlagt 120 min/);
  assert.match(html, /Faktisk registrert 45 min/);
  assert.match(html, /Registreringsgrad —/);
  assert.ok(html.includes("RETT KLOKKESLETT ELLER VARIGHET"));
  assert.ok(html.includes("UGYLDIG TID 1 ØKTER"));
  assert.ok(html.includes("DELVIS REGISTRERING"));
  assert.ok(!html.includes("100 %"));
});

test("eldre Stats- og IUP-data uten metadata beholder den eksisterende visningen", () => {
  const html = stats({ ...trening, volumMetadata: undefined, planMotFaktisk: [{ akse: "fys", plan: 60, faktisk: 0 }] });
  assert.ok(html.includes("0 / 60"));
  const eldreIup = { ...iup, trening: { gjennomfort: 1, planlagt: 2, timer: [{ akse: "fys" as const, timer: 0 }], kilde: "ELDRE GRUNNLAG" } };
  const eldreHtml = renderToStaticMarkup(createElement(AG08Iup, { d: eldreIup, tom: false }));
  assert.ok(eldreHtml.includes("1 av 2"));
  assert.ok(eldreHtml.includes("0 t"));
});
});
