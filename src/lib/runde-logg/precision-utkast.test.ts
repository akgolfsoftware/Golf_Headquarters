import assert from "node:assert/strict";
import { test } from "node:test";
import { lagreKladd, lesKladd, type RundeKladd } from "./draft";
import { precisionHullSchema, type UtkastSlag } from "./precision-utkast";

const slag: UtkastSlag[] = [
  { id: "s1", dist: 360, lie: "TEE", club: "Driver", pen: 1, putt: null },
  { id: "s2", dist: 12, lie: "GREEN", club: "Putter", pen: 0,
    putt: { brk: "VENSTRE_HOYRE", hel: "SVAK", res: "miss", fart: "Kort", miss: "På linja" } },
];
const kladd: Omit<RundeKladd, "oppdatert"> = {
  versjon: 1, modus: "live", foringsModus: "slag", steg: "foring",
  oppsett: { courseId: "syntetisk-bane", courseNavn: "Syntetisk bane", roundType: "trening", hullValg: "inn", playedAt: "2026-10-02" },
  hullData: [{ holeNumber: 10, par: 4, lengdeMeter: 360, slag: [] }],
  aktivtHullIdx: 0, precisionHull: { 0: slag },
};

function medLagring(fn: (lagring: Map<string, string>) => void) {
  const lagring = new Map<string, string>();
  const original = Object.getOwnPropertyDescriptor(globalThis, "window");
  Object.defineProperty(globalThis, "window", { configurable: true, value: { localStorage: {
    getItem: (k: string) => lagring.get(k) ?? null,
    setItem: (k: string, v: string) => lagring.set(k, v),
    removeItem: (k: string) => lagring.delete(k),
  } } });
  try { fn(lagring); }
  finally {
    if (original) Object.defineProperty(globalThis, "window", original);
    else Reflect.deleteProperty(globalThis, "window");
  }
}

test("pågående slag, straffe og putt overlever ny lesing uten å fullføre hull", () => medLagring(() => {
  assert.equal(lagreKladd("spiller-a", kladd), true);
  const lest = lesKladd("spiller-a");
  assert.deepEqual(lest?.precisionHull?.[0], slag);
  assert.deepEqual(lest?.hullData[0].slag, []);
  assert.equal(lest?.hullData[0].holeNumber, 10);
  assert.equal(lesKladd("spiller-b"), null);
}));

test("rettelse og angre erstatter bare utkastet til valgt hull", () => medLagring(() => {
  const rettet = { ...slag[0], dist: 365 };
  lagreKladd("spiller-a", { ...kladd, precisionHull: { 0: [rettet], 1: [slag[0]] } });
  assert.deepEqual(lesKladd("spiller-a")?.precisionHull, { 0: [rettet], 1: [slag[0]] });
  lagreKladd("spiller-a", { ...kladd, precisionHull: { 0: [], 1: [slag[0]] } });
  assert.deepEqual(lesKladd("spiller-a")?.precisionHull, { 0: [], 1: [slag[0]] });
}));

test("gamle utkast uten Precision-felt leses fortsatt", () => medLagring(() => {
  lagreKladd("spiller-a", { ...kladd, precisionHull: undefined });
  assert.equal(lesKladd("spiller-a")?.hullData[0].holeNumber, 10);
  assert.equal(lesKladd("spiller-a")?.precisionHull, undefined);
}));

test("ugyldige lokale slagdata forkastes ved gjenoppretting", () => medLagring(lagring => {
  lagreKladd("spiller-a", kladd);
  const [key, value] = [...lagring][0];
  const modified = JSON.parse(value);
  modified.precisionHull[0][0].dist = -1;
  lagring.set(key, JSON.stringify(modified));
  assert.equal(lesKladd("spiller-a"), null);
}));

test("schema avviser ubegrenset hullindeks og for mange slag", () => {
  assert.equal(precisionHullSchema.safeParse({ 18: slag }).success, false);
  assert.equal(precisionHullSchema.safeParse({ 0: Array(26).fill(slag[0]) }).success, false);
});
