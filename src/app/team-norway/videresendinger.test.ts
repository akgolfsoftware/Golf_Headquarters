/**
 * Pakke g (docs/design-system/utkast-tn/trenerflate/README.md §3): ingen gammel /team-norway-adresse gir 404.
 * Hver gammel adresse har en side som sender videre til den nye.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const VIDERE: [string, RegExp][] = [
  ["spiller/[spillerId]/oversikt", /redirect\(`\/team-norway\/spiller\/\$\{spillerId\}`\)/],
  ["spiller/[spillerId]/profil", /redirect\(`\/team-norway\/spiller\/\$\{spillerId\}`\)/],
  ["spiller/[spillerId]/analyse", /redirect\(`\/team-norway\/spiller\/\$\{spillerId\}\/tester\?visning=utvikling`\)/],
  ["referansenivaer", /Redirect\("\/team-norway\/referanse\/tester"\)/],
  ["apparatet", /Redirect\("\/team-norway\/fagapparat"\)/],
  ["turneringer/ny", /redirect\("\/portal\/tren\/turneringer"\)/],
  ["spiller", /redirect\("\/team-norway\/spillere"\)/],
];

for (const [sti, mal] of VIDERE) {
  test(`/team-norway/${sti} sender videre`, () => {
    const fil = new URL(`./${sti}/page.tsx`, import.meta.url);
    assert.ok(existsSync(fil), `mangler side for /team-norway/${sti}`);
    assert.match(readFileSync(fil, "utf8"), mal);
  });
}

test("/team-norway/workbench?spiller= sender til IUP › Trening", () => {
  const kilde = readFileSync(new URL("./workbench/page.tsx", import.meta.url), "utf8");
  assert.match(kilde, /redirect\(`\/team-norway\/spiller\/\$\{encodeURIComponent\(spillerParam\)\}\/trening`\)/);
});
