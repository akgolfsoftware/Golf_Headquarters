import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { TN_REFERANSESPILLERE_URL } from "./tn-referansespillere";

// Anders 21.10.2026: teamnorwayref eier tallene, HQ-menyen lenker bare dit.
test("Referansespillere lenker til teamnorwayref", () => {
  assert.equal(TN_REFERANSESPILLERE_URL, "https://teamnorwayref.vercel.app");
});

test("Referansespillere står siste under Spillere i tnHovedmeny, uten egen rute i HQ", () => {
  const kilde = readFileSync(new URL("./tn-shell.tsx", import.meta.url), "utf8");
  const spillere = kilde.slice(kilde.indexOf('id: "spillere"'), kilde.indexOf('id: "uttak"'));
  assert.match(spillere, /label: "Referansespillere", href: TN_REFERANSESPILLERE_URL/);
  assert.ok(spillere.indexOf("Referansespillere") > spillere.indexOf("Skoleoversikt"));
  assert.doesNotMatch(kilde, /\/team-norway\/referansespillere/);
});
