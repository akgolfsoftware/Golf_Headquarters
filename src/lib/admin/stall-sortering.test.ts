import assert from "node:assert/strict";
import { test } from "node:test";
import { hcpSomTall, sorterHcp, sorterNavn } from "./stall-sortering";

test("pluss-handicap er bedre enn scratch", () => {
  assert.equal(hcpSomTall("+1,2"), -1.2);
  assert.equal(hcpSomTall("2,1"), 2.1);
  assert.equal(hcpSomTall("0,0"), 0);
  assert.equal(hcpSomTall("—"), null);
});

test("handicap: lavest først, ukjent sist", () => {
  const r = [
    { name: "B", hcp: "12,1" },
    { name: "A", hcp: "—" },
    { name: "C", hcp: "+0,4" },
    { name: "D", hcp: "2,8" },
  ];
  assert.deepEqual(sorterHcp(r).map((x) => x.name), ["C", "D", "B", "A"]);
});

test("navn sorteres norsk, Å etter Z", () => {
  const r = [{ name: "Åse" }, { name: "Zeb" }, { name: "Ola" }];
  assert.deepEqual(sorterNavn(r).map((x) => x.name), ["Ola", "Zeb", "Åse"]);
});
