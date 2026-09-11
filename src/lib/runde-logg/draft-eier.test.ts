import assert from "node:assert/strict";
import { test } from "node:test";
import { lagreKladd, lesKladd } from "./draft";

test("rundeutkast fra én bruker er usynlig for neste bruker på samme enhet", () => {
  const lagring = new Map<string, string>();
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      localStorage: {
        getItem: (key: string) => lagring.get(key) ?? null,
        setItem: (key: string, value: string) => lagring.set(key, value),
        removeItem: (key: string) => lagring.delete(key),
      },
    },
  });

  try {
    const lagret = lagreKladd("bruker-a", {
      versjon: 1,
      modus: "live",
      foringsModus: "hurtig",
      steg: "foring",
      oppsett: {
        courseId: "bane-1",
        courseNavn: "Syntetisk testbane",
        roundType: "trening",
        hullValg: "18",
        playedAt: "2026-09-11",
      },
      hullData: [],
      aktivtHullIdx: 0,
    });

    assert.equal(lagret, true);
    assert.equal(lesKladd("bruker-b"), null);
    assert.equal(lesKladd("bruker-a")?.oppsett.courseNavn, "Syntetisk testbane");
    assert.equal([...lagring.keys()].some((key) => key.endsWith(":bruker-a")), true);
  } finally {
    if (originalWindow) Object.defineProperty(globalThis, "window", originalWindow);
    else Reflect.deleteProperty(globalThis, "window");
  }
});
