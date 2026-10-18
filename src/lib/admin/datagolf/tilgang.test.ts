/**
 * Data Golf i AgencyOS (pakke 10): bare coach og admin. Låser at en spiller og en
 * uinnlogget avvises (beslutninger.md §DATA GOLF VISES ALDRI TIL KUNDER), og at hver side
 * under /admin/datagolf går gjennom sidevakten `krevDataGolfBruker`.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { kanSeDataGolf } from "@/lib/auth/datagolf-regel";

test("spiller, forelder og uinnlogget ser ikke Data Golf; coach og admin gjør", () => {
  assert.equal(kanSeDataGolf(null), false);
  assert.equal(kanSeDataGolf(undefined), false);
  assert.equal(kanSeDataGolf({ role: "PLAYER" }), false);
  assert.equal(kanSeDataGolf({ role: "PARENT" }), false);
  assert.equal(kanSeDataGolf({ role: "COACH" }), true);
  assert.equal(kanSeDataGolf({ role: "ADMIN" }), true);
});

function sider(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? sider(p) : n === "page.tsx" ? [p] : [];
  });
}

test("hver side under /admin/datagolf kaller krevDataGolfBruker før data hentes", () => {
  const alle = sider("src/app/admin/datagolf");
  assert.ok(alle.length >= 6, `fant ${alle.length} sider`);
  for (const p of alle) {
    const kilde = readFileSync(p, "utf8");
    const vakt = kilde.indexOf("await krevDataGolfBruker(");
    assert.ok(vakt > 0, `${p} mangler krevDataGolfBruker`);
    const hent = kilde.search(/await hent[A-ZÆØÅ]/);
    assert.ok(hent === -1 || hent > vakt, `${p} henter data før vakten`);
  }
});
