import { before, mock, test } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AppRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";
for (const path of ["src/styles/navngitt-deling.css", "src/styles/precision-athletics.css"]) {
  mock.module(new URL(`../../${path}`, import.meta.url).pathname, { defaultExport: {} });
}
mock.module(new URL("../../src/app/portal/meg/deling/actions.ts", import.meta.url).pathname, {
  namedExports: { opprettNavngittDelingAction() { throw Error("Uventet automatisk deling"); }, trekkNavngittDelingAction() {}, hentNavngittDelingAction() {} },
});
mock.module(new URL("../../src/app/auth/trenerdeling/actions.ts", import.meta.url).pathname, {
  namedExports: { aksepterNavngittDelingAction() { throw Error("Uventet automatisk aksept"); } },
});
let Side: typeof import("@/components/portal/precision/navngitt-deling").NavngittDeling;
let Aksept: typeof import("@/components/portal/precision/trenerdeling-aksept").TrenerdelingAksept;
before(async () => {
  ({ NavngittDeling: Side } = await import("@/components/portal/precision/navngitt-deling"));
  ({ TrenerdelingAksept: Aksept } = await import("@/components/portal/precision/trenerdeling-aksept"));
});
const router = { back() {}, forward() {}, refresh() {}, push() {}, replace() {}, prefetch() {}, bfcacheId: "syntetisk" };
const render = (el: ReturnType<typeof createElement>) => renderToStaticMarkup(createElement(AppRouterContext.Provider, { value: router }, el));
const base = { spiller: { id: "syntetisk", name: "Syntetisk spiller" }, foresattVisning: false, kanGi: true,
  grupper: [{ id: "syntetisk-wang", navn: "Syntetisk skole", domene: "wang.no" }], nesteSide: null, invitasjoner: [] };
test("ny deling krever aktiv avkrysning og oppgir faktisk innsynsomfang", () => {
  const html = render(createElement(Side, { initial: base }));
  assert.match(html, /type="checkbox"/); assert.doesNotMatch(html, /checked=""/);
  assert.match(html, /type="submit"[^>]*disabled=""/);
  assert.match(html, /Øvrige profildeler er ikke tilgjengelige her ennå/);
  assert.match(html, /helseopplysninger og meldinger/);
});
test("mindreårig kan trekke eksisterende deling uten å få nytt samtykkeskjema", () => {
  const html = render(createElement(Side, { initial: { ...base, kanGi: false, invitasjoner: [{
    id: "deling", gruppeNavn: "Syntetisk skole", epost: "syntetisk@wang.no", gittAvRolle: "FORESATT", opprettet: "2026-10-01T12:00:00Z", utlop: "2026-10-08T12:00:00Z", status: "AKTIV",
  }] } }));
  assert.match(html, /Trekk tilbake/); assert.match(html, /godkjent foresatt/);
  assert.doesNotMatch(html, /type="submit"|type="checkbox"/);
});
test("avsluttet medlemskap beholder historikk og viser ingen ny deling", () => {
  const html = render(createElement(Side, { initial: { ...base, kanGi: false, grupper: [] } }));
  assert.match(html, /Tidligere delinger kan fortsatt trekkes/); assert.doesNotMatch(html, /<form/);
});
test("offentlig akseptside røper ingen spiller og krever innlogging med trenerkonto", () => {
  const html = render(createElement(Aksept, { innlogget: false, erTrener: false }));
  assert.match(html, /Logg inn med treneradressen/); assert.doesNotMatch(html, /spiller=|syntetisk|Godta deling<\/button/);
  const feilRolle = render(createElement(Aksept, { innlogget: true, erTrener: false }));
  assert.match(feilRolle, /riktig trenerkonto/); assert.doesNotMatch(feilRolle, /<button/);
});
