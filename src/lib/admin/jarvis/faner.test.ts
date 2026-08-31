import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  JARVIS_FANER,
  JARVIS_STANDARDFANE,
  erJarvisFaneId,
  jarvisHref,
  velgJarvisFane,
} from "./faner";

test("fire faner, i rekkefølgen fra canvasen Anders godkjente", () => {
  assert.deepEqual(JARVIS_FANER.map((f) => f.id), ["ko", "prosjekter", "skills", "runtimes"]);
  assert.deepEqual(JARVIS_FANER.map((f) => f.label), ["Kø", "Prosjekter", "Skills", "Runtimes"]);
});

test("hver fane peker på adressen den erstattet", () => {
  const m = Object.fromEntries(JARVIS_FANER.map((f) => [f.id, f.gammelHref]));
  assert.equal(m.ko, "/admin/agenticos");
  assert.equal(m.prosjekter, "/admin/agenticos/projects");
  assert.equal(m.skills, "/admin/agenticos/skills");
  assert.equal(m.runtimes, "/admin/agenticos/runtimes");
});

test("ukjent, tom eller manglende ?fane= faller til standardfanen", () => {
  for (const f of [undefined, "", "tull", "cockpit", "godkjenn", "../admin", "Kø"]) {
    assert.equal(velgJarvisFane(f), JARVIS_STANDARDFANE, String(f));
  }
});

test("gyldig ?fane= respekteres", () => {
  assert.equal(velgJarvisFane("prosjekter"), "prosjekter");
  assert.equal(velgJarvisFane("skills"), "skills");
  assert.equal(velgJarvisFane("runtimes"), "runtimes");
});

test("erJarvisFaneId avviser alt som ikke er en fane", () => {
  assert.equal(erJarvisFaneId("ko"), true);
  for (const s of [undefined, "", "Ko", "jarvis", "agentko", "godkjenn"]) {
    assert.equal(erJarvisFaneId(s), false, String(s));
  }
});

test("standardfanen har ren adresse, resten har ?fane=", () => {
  assert.equal(jarvisHref("ko"), "/admin/jarvis");
  assert.equal(jarvisHref("prosjekter"), "/admin/jarvis?fane=prosjekter");
  assert.equal(jarvisHref("skills"), "/admin/jarvis?fane=skills");
  assert.equal(jarvisHref("runtimes"), "/admin/jarvis?fane=runtimes");
});

/**
 * Kildeskann: låser at siden faktisk bruker modulen og gater likt som de
 * fire sidene den erstatter (alle fire brukte
 * `requireCapability(Capability.USE_AGENTS)`) — en sammenslåing skal aldri
 * utvide tilgang.
 */
test("/admin/jarvis gater USE_AGENTS og bruker fanemodulen", () => {
  const src = readFileSync(join(process.cwd(), "src/app/admin/jarvis/page.tsx"), "utf8");
  const uten = src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");
  assert.match(uten, /requireCapability\(Capability\.USE_AGENTS\)/);
  assert.match(uten, /velgJarvisFane\(/);
});

/**
 * Kildeskann: hver av de fire gamle adressene redirecter til /admin/jarvis
 * (med riktig `?fane=` der det trengs) — ingen lenke skal brekke.
 */
test("alle fire gamle adresser redirecter til /admin/jarvis", () => {
  const les = (p: string) => readFileSync(join(process.cwd(), p), "utf8");
  assert.match(les("src/app/admin/agenticos/page.tsx"), /redirect\("\/admin\/jarvis"\)/);
  assert.match(
    les("src/app/admin/agenticos/projects/page.tsx"),
    /redirect\("\/admin\/jarvis\?fane=prosjekter"\)/,
  );
  assert.match(
    les("src/app/admin/agenticos/runtimes/page.tsx"),
    /redirect\("\/admin\/jarvis\?fane=runtimes"\)/,
  );
  assert.match(
    les("src/app/admin/agenticos/skills/page.tsx"),
    /redirect\("\/admin\/jarvis\?fane=skills"\)/,
  );
});
