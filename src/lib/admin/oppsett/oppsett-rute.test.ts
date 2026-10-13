import { describe, mock, test } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";

let rolle = "COACH";
let feil = false;
const kall: string[] = [];
mock.module("@/lib/auth/requirePortalUser", { namedExports: { requirePortalUser: async () => ({ id: "syntetisk-coach", role: rolle, name: "Testcoach" }) } });
mock.module("@/components/precision/AgencyOSSkall", { namedExports: { AgencyOSSkall: ({ children }: { children: React.ReactNode }) => createElement("main", null, children) } });
mock.module("@/components/admin/precision/agency-completion/CoachContent", { namedExports: { CoachContent: ({ children }: { children: React.ReactNode }) => createElement("div", null, children) } });
mock.module("@/components/admin/precision/AG23Oppsett", { namedExports: { AG23Oppsett: ({ children, faner }: { children: React.ReactNode; faner: Array<{ navn: string }> }) => createElement("section", null, faner.map(f => createElement("span", { key: f.navn }, f.navn)), children) } });
mock.module("@/components/precision/pa", { namedExports: { KnappLenke: ({ children }: { children: React.ReactNode }) => createElement("a", null, children) } });
for (const n of ["AdminOppsettHubTrainLock", "AdminKlubbInnstillingerTrainLock", "AdminKalenderSynkTrainLock", "AdminSecurityTrainLock", "AdminTilgangTrainLock", "AdminTilgangPerTrenerTrainLock", "AdminApiKeysTrainLock", "AdminIntegrasjonerTrainLock"]) {
  mock.module(`@/components/admin/v2/oppsett/${n}`, { namedExports: { [n]: () => createElement("article", null, n) } });
}
mock.module("@/components/admin/v2/PeriodeNavnV2", { namedExports: { PeriodeNavnV2: () => createElement("article", null, "PeriodeNavnV2") } });
const hent = (navn: string) => async () => { kall.push(navn); if (feil) throw new Error("Testet hentefeil"); return {}; };
mock.module("@/lib/admin/oppsett/lastere", { namedExports: { lastAkademiData: hent("akademi"), lastKalenderData: hent("kalender"), lastSikkerhetData: () => { kall.push("sikkerhet"); return {}; }, lastKlubbData: hent("klubb"), sjekkKlubbTilgang: hent("klubb-gate"), lastTilgangRoller: () => { kall.push("tilgang"); return {}; }, lastTilgangPerTrener: hent("tilgang-trenere"), lastApiData: hent("api"), lastPerioderData: hent("perioder"), lastIntegrasjonerData: hent("integrasjoner") } });
describe("Reell oppsett-fane og opprinnelige servertilganger", async () => {
  const { default: Page } = await import("@/app/admin/oppsett/page");
  const vis = async (fane: string) => { kall.length = 0; const tree = await Page({ searchParams: Promise.resolve({ fane }) }); const oppsett = tree.props.children.props.children[0]; return { innhold: oppsett.props.children.type.name, faner: oppsett.props.faner.map((f: { navn: string }) => f.navn).join(" ") }; };
  test("coach sikkerhet åpner eksisterende sikkerhet, ikke et lesekort med profil", async () => {
    rolle = "COACH"; const html = await vis("sikkerhet");
    assert.deepEqual(kall, ["sikkerhet"]); assert.equal(html.innhold, "AdminSecurityTrainLock"); assert.doesNotMatch(html.faner, /API|Akademi|Integrasjoner/);
  });
  test("kalender og perioder henter bare sin reelle funksjon", async () => {
    rolle = "COACH"; await vis("kalender"); assert.deepEqual(kall, ["kalender"]);
    await vis("perioder"); assert.deepEqual(kall, ["perioder"]);
  });
  test("coach kan ikke hente ADMIN-fane via adressen", async () => {
    rolle = "COACH";
    for (const fane of ["api", "tilgang", "klubb", "integrasjoner", "akademi"]) { await vis(fane); assert.deepEqual(kall, ["kalender"]); }
  });
  test("ADMIN klubb beholder sin særskilte capability-vakt før data", async () => {
    rolle = "ADMIN"; await vis("klubb"); assert.deepEqual(kall, ["klubb-gate", "klubb"]);
  });
  test("hentefeil behandles som feil, aldri som et tomt team", async () => {
    rolle = "ADMIN"; feil = true;
    try { await assert.rejects(vis("akademi"), /Testet hentefeil/); } finally { feil = false; }
  });
});
