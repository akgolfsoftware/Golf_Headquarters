import { before, mock, test } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AppRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { IUP_NIVAAER, IUP_VERSJONER, hentUtviklingssporsmal } from "@/lib/iup/utviklingssjekk";
import { hentSesongsporsmal } from "@/lib/iup/sesongevaluering";

for (const path of ["src/styles/iup-evaluering.css", "src/styles/precision-athletics.css", "src/styles/precision-live.css", "src/styles/precision-player-coach-upgrade.css"]) {
  mock.module(new URL(`../../${path}`, import.meta.url).pathname, { defaultExport: {} });
}
mock.module(new URL("../../src/app/portal/mal/evaluering/actions.ts", import.meta.url).pathname, {
  namedExports: { lagreIupAction() { throw Error("Ikke en lagringstest"); }, finnIupAction() {}, hentIupHistorikkAction() {} },
});
mock.module(new URL("../../src/app/team-wang/coach/iup/[elevId]/iup-samtale.module.css", import.meta.url).pathname, { defaultExport: {} });
mock.module(new URL("../../src/app/team-wang/coach/iup/[elevId]/actions.ts", import.meta.url).pathname, { namedExports: { lagreIupSamtale() { throw Error("Ingen lagring i visningskontrollen"); } } });
let WangIup: typeof import("@/app/team-wang/coach/iup/[elevId]/iup-samtale").IupSamtale;
let Felt: typeof import("@/components/portal/precision/iup-evaluering").IupSvarFelt;
let Side: typeof import("@/components/portal/precision/iup-evaluering").PHIupEvaluering;
before(async () => { const m = await import("@/components/portal/precision/iup-evaluering"); Felt = m.IupSvarFelt; Side = m.PHIupEvaluering; WangIup = (await import("@/app/team-wang/coach/iup/[elevId]/iup-samtale")).IupSamtale; });
const router = { back() {}, forward() {}, refresh() {}, push() {}, replace() {}, prefetch() {}, bfcacheId: "syntetisk" };
const render = (el: ReturnType<typeof createElement>) => renderToStaticMarkup(createElement(AppRouterContext.Provider, { value: router }, el));
const escaped = (tekst: string) => renderToStaticMarkup(createElement("span", {}, tekst)).slice(6, -7);

for (const versjon of IUP_VERSJONER) for (const niva of IUP_NIVAAER) {
  test(`${versjon}/${niva}: hvert originalspørsmål vises med fem svar, uten kollisjon mellom nåværende og historisk skjema`, () => {
    const sporsmal = hentUtviklingssporsmal(versjon, niva);
    const svar = { versjon, niva, status: "UTKAST" as const, svar: {} };
    const html = render(createElement("div", {}, createElement(Felt, { svar, laast: false, onEndre() {} }), createElement(Felt, { svar, laast: true, onEndre() {} })));
    for (const s of sporsmal) assert.ok(html.includes(escaped(s.tekst)), s.id);
    assert.equal([...html.matchAll(/type="radio"/g)].length, sporsmal.length * 10);
    const grupper = [...html.matchAll(/name="([^"]+)"/g)].map((m) => m[1]);
    assert.equal(new Set(grupper).size, sporsmal.length * 2);
    for (const navn of new Set(grupper)) assert.equal(grupper.filter((v) => v === navn).length, 5);
    assert.equal([...html.matchAll(/class="iup-sporsmal" disabled=""/g)].length, sporsmal.length);
    assert.ok(!html.includes("1–8"));
  });
}
for (const versjon of IUP_VERSJONER) test(`${versjon}: sesong viser 3 fritekster, 10 vurderinger, to fordelinger og tre forbedringer`, () => {
  const html = render(createElement(Felt, { laast: false, onEndre() {}, svar: {
    versjon, sesongStart: "2026-01-01", sesongSlutt: "2026-10-31", status: "UTKAST", fritekst: {}, vurderinger: {}, fordelingFaktisk: { FYS: 0 }, fordelingPlanlagt: {}, forbedringspunkter: ["", "", ""],
  } }));
  for (const s of hentSesongsporsmal(versjon)) assert.ok(html.includes(escaped(s.tekst)), s.id);
  assert.equal([...html.matchAll(/<textarea/g)].length, 6);
  assert.equal([...html.matchAll(/type="radio"/g)].length, 40);
  const prosent = [...html.matchAll(/<input type="number"[^>]+value="([^"]*)"/g)].map((m) => m[1]);
  assert.equal(prosent.length, 10); assert.equal(prosent[0], "0"); assert.deepEqual(prosent.slice(1), Array(9).fill(""));
});
test("tidligere deltaker kan lese listen, men får ikke opprett-knapper", () => {
  const html = render(createElement(Side, { oversikt: { kanSvare: false, besvarelser: [], nesteSide: null }, historikk: null, nyType: "UTVIKLINGSSJEKK", uleste: 0 }));
  assert.ok(html.includes("Tidligere besvarelser er fortsatt tilgjengelige"));
  assert.ok(!html.includes("Velg periode og spørsmål")); assert.ok(!html.includes("Ny utviklingssjekk"));
});
test("kildeavvik gir forklaring og ingen redigerbar erstatningsbesvarelse", () => {
  const html = render(createElement(Side, { oversikt: { kanSvare: true, besvarelser: [], nesteSide: null }, historikk: {
    id: "syntetisk-iup", type: "UTVIKLINGSSJEKK", versjon: "iup-2025", niva: "UNG", periodeStart: "2026-10-01", periodeSlutt: "2026-10-28", revisjon: 1, levertRevisjon: null, nesteRevisjon: null,
    revisjoner: [{ revisjon: 1, status: "UTKAST", createdAt: "2026-10-01T12:00:00.000Z", innhold: null, kildeEllerFormatAvviker: true }],
  }, nyType: null, uleste: 0 }));
  assert.ok(html.includes("kilde- eller formatavvik")); assert.ok(!html.includes("Lagre utkast")); assert.ok(!html.includes('type="radio"'));
});

const wangIupProps = {
  elevId: "syntetisk-elev", elevNavn: "Test Spiller",
  avsluttende: { id: "syntetisk-avsluttende", navn: "Grunnperiode", startIso: "2026-09-01", sluttIso: "2026-10-12", fokus: null },
  neste: { id: "syntetisk-neste", navn: "Spesialperiode", startIso: "2026-10-13", sluttIso: "2026-11-30", fokus: null },
  evalueringer: [{ id: "syntetisk-fokus", akse: "TEK" as const, tittel: "Startlinje", egentidMinUke: 60, maalemetode: "Treff av ti", status: "PAA_VEI" as const, egenvurdering: 3, trenervurdering: 4, kommentar: null }],
  nyeStart: [{ akse: "SLAG" as const, tittel: "Balltreff", egentidMinUke: 60, maalemetode: "Treff av ti" }], maalinger: [],
};
for (const [rolle, tilbakeHref] of [["PLAYER", "/portal"], ["PARENT", "/forelder"]]) test(`WANG IUP ${rolle}: delt samtale beholdes, alle endringskontroller er lukket og tilbakeveien passer rollen`, () => {
  const html = render(createElement(WangIup, { ...wangIupProps, kanRedigere: false, tilbakeHref }));
  assert.ok(html.includes(`href="${tilbakeHref}"`));
  assert.ok(html.includes("Du leser den delte IUP-samtalen"));
  assert.ok(html.includes("Startlinje") && html.includes("Balltreff"));
  assert.ok(!html.includes("Lagre og del") && !html.includes("Fjern fokusområde") && !html.includes("Legg til"));
  const controls = [...html.matchAll(/<(button|input|select|textarea)\b[^>]*>/g)].map(m => m[0]);
  assert.equal(controls.length, 0, "Lesetilgangen viser tekst uten redigeringskontroller");
  assert.ok(html.includes("3 av 5") && html.includes("4 av 5"), "Lagrede vurderinger er synlige i lesevisningen");
  assert.ok(html.includes("Treff av ti"));
});
test("WANG IUP trener: begge vurderinger, status og nye fokus bevares som arbeidsflate", () => {
  const html = render(createElement(WangIup, wangIupProps));
  assert.ok(html.includes("Lagre og del med Test"));
  assert.equal([...html.matchAll(/aria-label="(?:Egenvurdering|Trener) [1-5] av 5"/g)].length, 10);
  assert.ok(!html.includes('disabled=""'));
});
