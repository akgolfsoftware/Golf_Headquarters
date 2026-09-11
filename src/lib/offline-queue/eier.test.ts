import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  AKTIV_BRUKER_NOKKEL,
  filtrerEgne,
  fjernAktivBrukerId,
  harUlagretKladd,
  lesAktivBrukerId,
  settAktivBrukerId,
  tilhorerBruker,
} from "./eier";

function minneLager(): {
  getItem(k: string): string | null;
  setItem(k: string, v: string): void;
  removeItem(k: string): void;
} {
  const m = new Map<string, string>();
  return {
    getItem: (k) => m.get(k) ?? null,
    setItem: (k, v) => {
      m.set(k, v);
    },
    removeItem: (k) => {
      m.delete(k);
    },
  };
}

describe("offline-queue eier", () => {
  it("binder og fjerner aktiv bruker uten å røre andre nøkler", () => {
    const s = minneLager();
    s.setItem("annen", "x");
    settAktivBrukerId(s, "u-a");
    assert.equal(lesAktivBrukerId(s), "u-a");
    fjernAktivBrukerId(s);
    assert.equal(lesAktivBrukerId(s), null);
    assert.equal(s.getItem("annen"), "x");
    assert.equal(s.getItem(AKTIV_BRUKER_NOKKEL), null);
  });

  it("viser aldri rader uten innlogget eier, og aldri en annens rader", () => {
    const rader = [
      { userId: "u-a", id: "1" },
      { userId: "u-b", id: "2" },
      { id: "3" },
    ];
    assert.deepEqual(filtrerEgne(rader, null), []);
    assert.deepEqual(filtrerEgne(rader, "u-a").map((r) => r.id), ["1"]);
    assert.equal(tilhorerBruker({ userId: "u-a" }, "u-b"), false);
    assert.equal(harUlagretKladd(rader, "u-b"), true);
    assert.equal(harUlagretKladd(rader, "u-c"), false);
  });
});
