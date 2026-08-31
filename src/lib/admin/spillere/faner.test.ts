import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  SPILLERE_FANER,
  SPILLERE_STANDARDFANE,
  erSpillereFaneId,
  spillereHref,
  velgSpillereFane,
} from "./faner";

/**
 * MASTERPLAN 15.11: to adresser ble til én. `/admin/queue` er IKKE Kø
 * (beslutning 6.6) — den hører i Stall. Testene låser at fanelogikken
 * aldri utvider gaten kildesidene hadde (ADMIN/COACH), og at fanen peker
 * på adressen den erstattet.
 */

test("to faner, i canvas-rekkefølgen", () => {
  assert.deepEqual(
    SPILLERE_FANER.map((f) => f.id),
    ["stall", "oppfolging"],
  );
});

test("oppfølging peker på adressen den erstattet", () => {
  const gamle = SPILLERE_FANER.map((f) => f.gammelHref);
  assert.deepEqual(gamle, [null, "/admin/queue"]);
});

test("erSpillereFaneId avviser alt som ikke er en fane", () => {
  assert.equal(erSpillereFaneId("stall"), true);
  assert.equal(erSpillereFaneId("oppfolging"), true);
  for (const s of [undefined, "", "queue", "Stall", "tull"]) {
    assert.equal(erSpillereFaneId(s), false, String(s));
  }
});

test("ukjent, tom eller manglende ?fane= faller til standardfanen", () => {
  for (const forsok of [undefined, "", "tull", "queue", "../admin"]) {
    assert.equal(velgSpillereFane(forsok), SPILLERE_STANDARDFANE, String(forsok));
  }
});

test("gyldig ?fane= respekteres", () => {
  assert.equal(velgSpillereFane("oppfolging"), "oppfolging");
  assert.equal(velgSpillereFane("stall"), "stall");
});

test("standardfanen har ren adresse, oppfølging har ?fane=", () => {
  assert.equal(spillereHref("stall"), "/admin/spillere");
  assert.equal(spillereHref("oppfolging"), "/admin/spillere?fane=oppfolging");
});

/**
 * Kildeskann: låser at SIDEN faktisk bruker ADMIN/COACH som basisgate og
 * fanelogikken over — samme mønster som src/lib/admin/turnering/faner.test.ts.
 */
test("/admin/spillere gater på ADMIN/COACH og bruker fanelogikken", () => {
  const src = readFileSync(join(process.cwd(), "src/app/admin/spillere/page.tsx"), "utf8");
  const uten = src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");

  assert.match(
    uten,
    /requirePortalUser\(\{\s*allow:\s*\["ADMIN",\s*"COACH"\]\s*\}\)/,
    "siden må ha ADMIN/COACH som basisgate",
  );
  assert.match(uten, /velgSpillereFane\(/, "siden må velge fane via fanelogikken");
});

test("/admin/queue er en ren redirect til /admin/spillere?fane=oppfolging", () => {
  const src = readFileSync(join(process.cwd(), "src/app/admin/queue/page.tsx"), "utf8");
  assert.match(src, /redirect\("\/admin\/spillere\?fane=oppfolging"\)/);
});
