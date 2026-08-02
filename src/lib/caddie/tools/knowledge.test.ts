import { test } from "node:test";
import assert from "node:assert/strict";
import { KNOWLEDGE_TOOLS } from "./knowledge";
import { CADDIE_SYSTEM_PROMPT } from "../system-prompt";
import type { Kilde, Oppgavetype } from "@/lib/masterbrain";

type ToolResultat = {
  emne: Oppgavetype;
  kunnskap: string;
  kilder: Kilde[];
  utelatt: Kilde[];
  versjon: string;
};

async function kjor(emne: Oppgavetype): Promise<ToolResultat> {
  const execute = KNOWLEDGE_TOOLS.getGolfKnowledge.execute;
  assert.ok(execute, "getGolfKnowledge mangler execute");
  const svar = await execute(
    { emne },
    { toolCallId: "test", messages: [] },
  );
  assert.ok(!("error" in svar), `getGolfKnowledge feilet for ${emne}`);
  return svar as ToolResultat;
}

test("getGolfKnowledge svarer på alle fem emnene", async () => {
  const emner: Oppgavetype[] = [
    "terminologi",
    "sg-diagnose",
    "periodisering",
    "plan-generering",
    "drill-forslag",
  ];
  for (const emne of emner) {
    const r = await kjor(emne);
    assert.equal(r.emne, emne);
    assert.ok(r.kunnskap.length > 0, `${emne} ga tom kunnskap`);
    assert.ok(r.kilder.length > 0, `${emne} ga ingen kilder`);
    assert.ok(r.versjon.length > 0, `${emne} mangler versjon`);
  }
});

test("terminologi gir hele ordboka innenfor taket", async () => {
  const r = await kjor("terminologi");
  assert.ok(r.kilder.some((k) => k.fil.endsWith("ordbok.json")));
  assert.match(r.kunnskap, /MORAD fagspråk/);
});

test("utelatte filer rapporteres, ikke skjules", async () => {
  // Terminologi er ordbok (13 483) + posisjoner (17 035). Med taket på 16 000
  // skal posisjonene ryke — og det skal stå i svaret.
  const r = await kjor("terminologi");
  assert.ok(r.utelatt.length > 0, "posisjoner burde vært utelatt");
  assert.match(r.kunnskap, /fikk ikke plass/);
});

test("sg-diagnose bærer hypotese-regelen", async () => {
  const r = await kjor("sg-diagnose");
  assert.match(r.kunnskap, /HYPOTESE/i);
  assert.match(r.kunnskap, /video/i);
});

test("Caddie-prompten pålegger oppslag før golffaglige svar", () => {
  assert.match(CADDIE_SYSTEM_PROMPT, /getGolfKnowledge/);
  assert.match(CADDIE_SYSTEM_PROMPT, /Finn aldri på metodikk/);
  assert.match(CADDIE_SYSTEM_PROMPT, /hypotese, ikke en diagnose/);
});

test("regelnumrene i Caddie-prompten er i stigende rekkefølge", () => {
  const numre = [...CADDIE_SYSTEM_PROMPT.matchAll(/^(\d+)\. /gm)].map((m) =>
    Number(m[1]),
  );
  assert.deepEqual(numre, [...numre].sort((a, b) => a - b), "regler er ute av rekkefølge");
  assert.equal(new Set(numre).size, numre.length, "duplikate regelnumre");
});
