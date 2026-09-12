import assert from "node:assert/strict";
import { test } from "node:test";

import { GDPR_SAMTYKKE_ALDER } from "@/lib/auth/minor";
import { DELING_SCOPES } from "@/lib/deling/samtykke-regler";
import { HELSE_SAMTYKKE_TYPER } from "@/lib/health/samtykke-regler";
import {
  DELING_FORMÅL,
  HELSE_FORMÅL,
  SAMTYKKE_ALDER,
  SAMTYKKE_REGISTER,
} from "./samtykke-register";

test("samtykkealderen er 16, ikke 13", () => {
  assert.equal(SAMTYKKE_ALDER, 16);
  assert.equal(GDPR_SAMTYKKE_ALDER, 16);
  for (const rad of SAMTYKKE_REGISTER) {
    assert.equal(rad.alder, 16, rad.id);
  }
});

test("helse- og delingsformål i registeret matcher koden", () => {
  assert.deepEqual([...HELSE_FORMÅL], [...HELSE_SAMTYKKE_TYPER]);
  assert.deepEqual([...DELING_FORMÅL], [...DELING_SCOPES]);
});

test("helse og deling er append-only; lyd oppdaterer én rad", () => {
  assert.equal(SAMTYKKE_REGISTER.find((r) => r.id === "helse")?.historikk, "append-only");
  assert.equal(SAMTYKKE_REGISTER.find((r) => r.id === "deling")?.historikk, "append-only");
  assert.equal(SAMTYKKE_REGISTER.find((r) => r.id === "lyd")?.historikk, "oppdater-rad");
});

test("registeret oppgir lagringssted for hvert formål", () => {
  assert.equal(SAMTYKKE_REGISTER.length, 4);
  for (const rad of SAMTYKKE_REGISTER) {
    assert.ok(rad.lagringssted.length > 0, rad.id);
    assert.ok(rad.deling.length > 0, rad.id);
    assert.ok(rad.roller.length > 0, rad.id);
  }
});
