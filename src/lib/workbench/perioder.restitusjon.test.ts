import assert from "node:assert/strict";
import { test } from "node:test";
import { LPhase, PeriodeType } from "@/generated/prisma/enums";
import { LPHASE_FARGE, LPHASE_LABEL, LPHASE_REKKEFOLGE } from "@/lib/labels/taxonomy";
import { PeriodeTypeSchema } from "@/lib/portal/training/ak-taxonomy";
import { periodeTypeFraNavn } from "@/lib/portal/training/periode-navn";
import { PeriodeInputSchema } from "./perioder";

// Anders 28.09.2026 (beslutninger.md §PERIODENE HETER): Restitusjon er niende periodetype.

test("en restitusjonsperiode godtas når årsplanen lagres", () => {
  const res = PeriodeInputSchema.safeParse({
    lPhase: "RESTITUSJON",
    startDato: "2026-10-05",
    sluttDato: "2026-10-11",
  });
  assert.equal(res.success, true);
});

test("Restitusjon har navn og farge fra designverdiene, og kan velges", () => {
  assert.equal(LPHASE_LABEL.RESTITUSJON, "Restitusjon");
  assert.match(LPHASE_FARGE.RESTITUSJON, /^var\(--/);
  assert.ok(LPHASE_REKKEFOLGE.includes("RESTITUSJON"));
});

test("valglistene dekker alle periodetypene i databaseskjemaet", () => {
  assert.deepEqual([...LPHASE_REKKEFOLGE].sort(), Object.values(LPhase).sort());
  assert.deepEqual([...PeriodeTypeSchema.options].sort(), Object.values(PeriodeType).sort());
});

test("periodenavnet «Restitusjon» gjenkjennes", () => {
  assert.equal(periodeTypeFraNavn("Restitusjon"), "RESTITUSJON");
});
