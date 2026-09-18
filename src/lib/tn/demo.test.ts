import assert from "node:assert/strict";
import { test } from "node:test";
import { TN_SCREEN_ROLES } from "./access.ts";
import { OYVIND, SQUAD, TN_ACTORS, applyDemoCopy, dataFor } from "./demo.ts";

test("Øyvind er kanonisk demospiller", () => {
  assert.equal(OYVIND.navn, "Øyvind Royan");
  assert.equal(OYVIND.init, "ØR");
  assert.equal(OYVIND.foresatt, "Kari Royan");
  assert.equal(OYVIND.snitt, "74,2");
  assert.equal(SQUAD[0]?.id, "u-oyvind");
  assert.match(OYVIND.kildelinje, /Målt \d{2}\.\d{2}\.\d{4} · protokoll v\d+ · /);
});

test("SP-aktør er Øyvind, FO er Kari", () => {
  const sp = TN_ACTORS.find((a) => a.role === "SP");
  const fo = TN_ACTORS.find((a) => a.role === "FO");
  assert.equal(sp?.userId, "u-oyvind");
  assert.match(sp?.hint ?? "", /Øyvind Royan/);
  assert.equal(fo?.userId, "u-kari-royan");
  assert.match(fo?.hint ?? "", /Kari Royan/);
});

test("dataFor gir Øyvind på alle skjermer", () => {
  for (const id of Object.keys(TN_SCREEN_ROLES)) {
    const data = dataFor(id);
    const blob = JSON.stringify(data);
    assert.ok(blob.includes("Øyvind Royan"), id);
    assert.ok(Array.isArray(data.meny));
  }
});

test("applyDemoCopy retter navn, logo og språk", () => {
  const out = applyDemoCopy(
    `Emma Hovden <img src="../../assets/logo/team-norway-golf.png"> Elev session kortspill`,
  );
  assert.equal(out.includes("Emma"), false);
  assert.ok(out.includes("Øyvind Royan"));
  assert.ok(out.includes("/tn/team-norway-golf.png"));
  assert.equal(out.includes("session"), false);
  assert.equal(out.includes("kortspill"), false);
});
