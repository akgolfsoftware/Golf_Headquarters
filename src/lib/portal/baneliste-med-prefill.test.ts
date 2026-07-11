import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { medForst } from "./baneliste-med-prefill";

describe("medForst", () => {
  it("flytter treff til første plass", () => {
    const liste = [{ id: "a" }, { id: "b" }, { id: "c" }];
    assert.deepEqual(medForst(liste, "c"), [{ id: "c" }, { id: "a" }, { id: "b" }]);
  });

  it("uendret når forstId er null", () => {
    const liste = [{ id: "a" }, { id: "b" }];
    assert.deepEqual(medForst(liste, null), liste);
  });

  it("uendret når forstId ikke finnes i listen", () => {
    const liste = [{ id: "a" }, { id: "b" }];
    assert.deepEqual(medForst(liste, "x"), liste);
  });

  it("uendret når forstId allerede er først", () => {
    const liste = [{ id: "a" }, { id: "b" }];
    assert.deepEqual(medForst(liste, "a"), liste);
  });

  it("bevarer resten av rekkefølgen", () => {
    const liste = [{ id: "a" }, { id: "b" }, { id: "c" }, { id: "d" }];
    assert.deepEqual(medForst(liste, "b"), [{ id: "b" }, { id: "a" }, { id: "c" }, { id: "d" }]);
  });
});
