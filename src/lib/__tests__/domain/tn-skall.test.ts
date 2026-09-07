import test from "node:test";
import assert from "node:assert/strict";
import { tnAktivFraPath } from "@/lib/domain/tn-skall";

test("gruppepost-siden gir 'oversikt' som aktiv rad", () => {
  assert.equal(tnAktivFraPath("/team-norway/abc123"), "oversikt");
});

test("dokumenter-undersiden gir samme aktiv-id som selve gruppen (ingen egen rad i menyen ennå)", () => {
  assert.equal(tnAktivFraPath("/team-norway/abc123/dokumenter"), "oversikt");
});

test("spillerpost-siden gir null - den ligger ikke i railens meny", () => {
  assert.equal(tnAktivFraPath("/team-norway/spiller/xyz"), null);
});

test("root-siden /team-norway gir 'oversikt'", () => {
  assert.equal(tnAktivFraPath("/team-norway"), "oversikt");
});

test("ukjent sti gir null, ikke en gjetning", () => {
  assert.equal(tnAktivFraPath("/admin/spillere"), null);
});
