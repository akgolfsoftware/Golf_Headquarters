import test from "node:test";
import assert from "node:assert/strict";
import { trainLockVersjonForRute } from "@/lib/v2/valgt-design";

test("valgt Train-lock følger alle PlayerHQ- og AgencyOS-ruter", () => {
  for (const path of ["/portal", "/portal/tren/live/123", "/portal/meg", "/admin", "/admin/agencyos", "/admin/workbench"]) {
    assert.equal(trainLockVersjonForRute(path), "4", path);
  }
});

test("Team Norway, WANG og øvrige flater beholder egne profiler", () => {
  for (const path of ["/team-norway", "/team-norway/tilgang", "/team-wang/coach", "/", "/forelder", "/auth/login", "/administrasjon", "/portalen", ""]) {
    assert.equal(trainLockVersjonForRute(path), undefined, path);
  }
});
