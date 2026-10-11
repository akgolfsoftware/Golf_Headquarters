import { test } from "node:test";
import assert from "node:assert/strict";
import { filtrerSynligeDiscovery, filtrerSynligeTalenter } from "./personvern-filter";

test("født 2008 eller senere uten samtykke skjules, og manglende fødselsår skjules", () => {
  const synlige = filtrerSynligeTalenter([
    { id: "a", born: 2007, consent: false },
    { id: "b", born: 2008, consent: false },
    { id: "c", born: 2010, consent: true },
    { id: "d", born: null, consent: true },
    { id: "e", born: 2012, consent: false },
  ]).map((p) => p.id);
  assert.deepEqual(synlige, ["a", "c"]);
});

test("samme regel gjelder discovery-rader", () => {
  const synlige = filtrerSynligeDiscovery([
    { id: "a", fodt: 2006, samtykke: false },
    { id: "b", fodt: 2013, samtykke: false },
    { id: "c", fodt: 2013, samtykke: true },
    { id: "d", fodt: null, samtykke: true },
  ]).map((r) => r.id);
  assert.deepEqual(synlige, ["a", "c"]);
});
