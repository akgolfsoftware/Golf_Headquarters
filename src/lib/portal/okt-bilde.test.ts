import { test } from "node:test";
import assert from "node:assert/strict";
import { OKT_BILDER, oktBilde } from "./okt-bilde";

test("aksen styrer bildet for FYS, TEK, SPILL og TURN", () => {
  assert.equal(oktBilde("FYS", "Putting"), OKT_BILDER.fys);
  assert.equal(oktBilde("TEK"), OKT_BILDER.tek);
  assert.equal(oktBilde("SPILL"), OKT_BILDER.spill);
  assert.equal(oktBilde("TURN"), OKT_BILDER.turn);
});

test("SLAG velger treningsområdet fra navnet, ellers innspill", () => {
  assert.equal(oktBilde("SLAG", "Putting 5–10 fot · Puttinggreen"), OKT_BILDER.putting);
  assert.equal(oktBilde("SLAG", "Bunkerslag 20–40 m"), OKT_BILDER.bunker);
  assert.equal(oktBilde("SLAG", "Driver fra tee"), OKT_BILDER.utslag);
  assert.equal(oktBilde("SLAG", "Innspill og nærspill"), OKT_BILDER.innspill);
  assert.equal(oktBilde(null), OKT_BILDER.innspill);
});
