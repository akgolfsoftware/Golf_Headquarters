import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Capability } from "@/lib/auth/cbac";
import {
  KO_FANER,
  KO_STANDARDFANE,
  erKoFaneId,
  koHref,
  synligeFaner,
  velgFane,
} from "./faner";

/**
 * MASTERPLAN 15.1: seks adresser ble til én. Den farligste feilen i en slik
 * sammenslåing er at en fane arver SIDENS gate i stedet for sin egen — da får
 * plutselig alle coacher se agent-køen eller testforslagene. Disse testene
 * låser at det ikke skjer.
 */

const ALT = () => true;
const INGENTING = () => false;

test("hver fane peker på adressen den erstattet", () => {
  const gamle = KO_FANER.map((f) => f.gammelHref);
  assert.deepEqual(gamle, [
    "/admin/godkjenninger",
    "/admin/agenticos/ko",
    "/admin/agenticos/godkjenn",
    "/admin/tester/foreslatte",
    "/admin/tournaments/dubletter",
  ]);
  assert.equal(new Set(gamle).size, gamle.length, "ingen adresse to ganger");
});

test("/admin/queue er IKKE en Kø-fane — den hører i Stall (beslutning 6.6)", () => {
  assert.equal(
    KO_FANER.some((f) => f.gammelHref.startsWith("/admin/queue")),
    false,
  );
});

test("agent-fanene krever USE_AGENTS, testfanen MANAGE_TESTS", () => {
  const krav = Object.fromEntries(KO_FANER.map((f) => [f.id, f.krever]));
  assert.equal(krav.agentko, Capability.USE_AGENTS);
  assert.equal(krav.agentgodkjenn, Capability.USE_AGENTS);
  assert.equal(krav.tester, Capability.MANAGE_TESTS);
  // Disse to hadde kun ADMIN/COACH før — sammenslåingen skal ikke stramme heller.
  assert.equal(krav.godkjenninger, null);
  assert.equal(krav.dubletter, null);
});

test("uten capabilities ser du KUN fanene som aldri krevde noe", () => {
  const synlig = synligeFaner(INGENTING).map((f) => f.id);
  assert.deepEqual(synlig, ["godkjenninger", "dubletter"]);
});

test("med alle capabilities ser du alle fem", () => {
  assert.equal(synligeFaner(ALT).length, 5);
});

test("bare USE_AGENTS åpner agent-fanene, ikke testfanen", () => {
  const synlig = synligeFaner((c) => c === Capability.USE_AGENTS).map((f) => f.id);
  assert.deepEqual(synlig, ["godkjenninger", "agentko", "agentgodkjenn", "dubletter"]);
});

test("?fane= kan ALDRI åpne en fane du ikke har tilgang til", () => {
  const synlig = synligeFaner(INGENTING);
  for (const forsok of ["agentko", "agentgodkjenn", "tester"]) {
    assert.equal(velgFane(forsok, synlig), "godkjenninger", forsok);
  }
});

test("ukjent, tom eller manglende ?fane= faller til standardfanen", () => {
  const synlig = synligeFaner(ALT);
  for (const forsok of [undefined, "", "tull", "queue", "../admin"]) {
    assert.equal(velgFane(forsok, synlig), KO_STANDARDFANE);
  }
});

test("gyldig ?fane= respekteres når du har tilgang", () => {
  const synlig = synligeFaner(ALT);
  assert.equal(velgFane("tester", synlig), "tester");
  assert.equal(velgFane("dubletter", synlig), "dubletter");
});

test("faller til første synlige fane når standardfanen er borte", () => {
  const kunTester = KO_FANER.filter((f) => f.id === "tester");
  assert.equal(velgFane(undefined, kunTester), "tester");
  assert.equal(velgFane("godkjenninger", kunTester), "tester");
});

test("ingen synlige faner gir null — siden må da si ifra, ikke krasje", () => {
  assert.equal(velgFane("godkjenninger", []), null);
});

test("erKoFaneId avviser alt som ikke er en fane", () => {
  assert.equal(erKoFaneId("godkjenninger"), true);
  for (const s of [undefined, "", "queue", "Godkjenninger", "agent"]) {
    assert.equal(erKoFaneId(s), false, String(s));
  }
});

test("standardfanen har ren adresse, resten har ?fane=", () => {
  assert.equal(koHref("godkjenninger"), "/admin/ko");
  assert.equal(koHref("agentko"), "/admin/ko?fane=agentko");
  assert.equal(koHref("dubletter"), "/admin/ko?fane=dubletter");
});

/**
 * Kildeskann: låser at SIDEN faktisk bruker tilgangsregelen over. Uten dette
 * kunne noen fjerne `synligeFaner`/`canUser` fra page.tsx og testene over
 * ville fortsatt vært grønne — regelen ville vært riktig, men ubrukt.
 * Samme mønster som src/lib/__tests__/tilgang/admin-capability-kontrakt.test.ts.
 */
test("/admin/ko gater fanene: bruker synligeFaner + canUser på begge capabilities", () => {
  const src = readFileSync(join(process.cwd(), "src/app/admin/ko/page.tsx"), "utf8");
  const uten = src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");

  assert.match(uten, /requirePortalUser\(\{\s*allow:\s*\["ADMIN",\s*"COACH"\]\s*\}\)/,
    "siden må ha ADMIN/COACH som basisgate");
  assert.match(uten, /synligeFaner\(/, "siden må filtrere fanene på tilgang");
  assert.match(uten, /velgFane\(/, "siden må validere ?fane= mot de synlige fanene");
  assert.match(uten, /canUser\([^)]*Capability\.USE_AGENTS/, "agent-fanene må sjekkes");
  assert.match(uten, /canUser\([^)]*Capability\.MANAGE_TESTS/, "testfanen må sjekkes");
});
