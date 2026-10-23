import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { TN_REFERANSESPILLERE_URL } from "./tn-referansespillere";

// Teamnorwayref er fortsatt kilden for det som ikke er i basen (Norsk golf, HCP Norge).
test("teamnorwayref-lenken peker til teamnorwayref", () => {
  assert.equal(TN_REFERANSESPILLERE_URL, "https://teamnorwayref.vercel.app");
});

// Beslutningen 21.10, punkt 7: menypunktet peker til den nye Referanse-delen når den finnes.
test("Referanse i menyen åpner sidene i HQ, ikke teamnorwayref", () => {
  const kilde = readFileSync(new URL("./tn-shell.tsx", import.meta.url), "utf8");
  const referanse = kilde.slice(kilde.indexOf('id: "referanse"'), kilde.indexOf('id: "fag"'));
  const punkter = [...referanse.matchAll(/lenke\("([^"]+)", "([^"]+)"/g)].map((m) => [m[1], m[2]]);
  assert.deepEqual(punkter, [
    ["WAGR", "/team-norway/referanse"],
    ["Sammenlign", "/team-norway/referanse/sammenlign"],
    ["Søk", "/team-norway/referanse/sok"],
    ["Norsk golf", "/team-norway/referanse/norsk-golf"],
    ["HCP Norge", "/team-norway/referanse/hcp"],
    ["Tester", "/team-norway/referanse/tester"],
  ]);
  assert.doesNotMatch(referanse, /TN_REFERANSESPILLERE_URL/);
});

// Anders 21.10.2026: seks hovedpunkter, og Team Norway er bare for trenere.
test("menyen har seks hovedpunkter i fast rekkefølge, uten spillervariant", () => {
  const kilde = readFileSync(new URL("./tn-shell.tsx", import.meta.url), "utf8");
  const meny = kilde.slice(kilde.indexOf("export function tnHovedmeny"), kilde.indexOf("export function tnBunnmeny"));
  const etiketter = [...meny.matchAll(/^      label: "([^"]+)",$/gm)].map((m) => m[1]);
  assert.deepEqual(etiketter, ["Hjem", "Spillere", "Samlinger og testing", "Turneringer", "Referanse", "Fag og administrasjon"]);
  assert.doesNotMatch(meny, /visTrenerflater/);
});

// Referanse › WAGR er bygget i HQ (beslutninger.md §TEAM NORWAY ER BARE FOR TRENERE, punkt 3).
test("WAGR står først under Referanse og åpner siden i HQ", () => {
  const kilde = readFileSync(new URL("./tn-shell.tsx", import.meta.url), "utf8");
  const referanse = kilde.slice(kilde.indexOf('id: "referanse"'), kilde.indexOf('id: "fag"'));
  const forste = referanse.match(/lenke\("([^"]+)", "([^"]+)"/);
  assert.deepEqual(forste?.slice(1), ["WAGR", "/team-norway/referanse"]);
});
