import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { TN_REFERANSESPILLERE_URL } from "./tn-referansespillere";

// Til Referanse › WAGR er bygget i HQ, lenker menypunktet til teamnorwayref (Anders 21.10.2026).
test("Referansespillere lenker til teamnorwayref", () => {
  assert.equal(TN_REFERANSESPILLERE_URL, "https://teamnorwayref.vercel.app");
});

test("Referansespillere står under Referanse i tnHovedmeny", () => {
  const kilde = readFileSync(new URL("./tn-shell.tsx", import.meta.url), "utf8");
  const referanse = kilde.slice(kilde.indexOf('id: "referanse"'), kilde.indexOf('id: "fag"'));
  assert.match(referanse, /label: "Referansespillere", href: TN_REFERANSESPILLERE_URL/);
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
