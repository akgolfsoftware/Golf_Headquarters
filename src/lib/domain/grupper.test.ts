/**
 * G1 · Kanonisk gruppetaksonomi + aktivt-medlemskap-fragmenter.
 * Fragment-formen er en KONTRAKT (resolveTilgang/A3 og coached.ts bygger på
 * den) — endres formen, skal disse testene tvinge en bevisst beslutning.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  KANONISKE_GRUPPER,
  kanoniskGruppe,
  aktivtMedlemskapWhere,
  aktivtSpillerMedlemskapWhere,
  aktivtAkGruppeMedlemskapWhere,
  harAktivtAkGruppeMedlemskapWhere,
} from "@/lib/domain/grupper";

test("taksonomien har de ni kanoniske gruppene med unike slugs", () => {
  assert.equal(KANONISKE_GRUPPER.length, 9);
  const slugs = KANONISKE_GRUPPER.map((g) => g.slug);
  assert.equal(new Set(slugs).size, 9, "slugs er unike");
  for (const forventet of [
    "gfgk-mini",
    "gfgk-basis",
    "gfgk-utvikling",
    "gfgk-elite",
    "wang-toppidrett",
    "wang-ung",
    "ak-golf-academy",
    "ak-golf-junior-academy",
    "team-norway",
  ]) {
    assert.ok(slugs.includes(forventet as (typeof slugs)[number]), `${forventet} finnes`);
  }
});

test("alle kanoniske grupper har navn og gyldig kind", () => {
  for (const g of KANONISKE_GRUPPER) {
    assert.ok(g.navn.length > 0, `${g.slug} har navn`);
    assert.ok(["kontrakt", "program", "ekstern"].includes(g.kind), `${g.slug} har gyldig kind`);
  }
});

test("kun eksterne organisasjoner (Team Norway) mangler program og er ikke managedByAkGolf", () => {
  for (const g of KANONISKE_GRUPPER) {
    if (g.kind === "ekstern") {
      assert.equal(g.program, null, `${g.slug} (ekstern) har intet AK-coachingprogram`);
      assert.equal(g.managedByAkGolf, false, `${g.slug} (ekstern) gir aldri gratis tilgang via medlemskap`);
    } else {
      assert.ok(g.program !== null && g.program.length > 0, `${g.slug} har program`);
      assert.equal(g.managedByAkGolf, true, `${g.slug} er AK Golf-administrert`);
    }
  }
});

test("Team Norway er kanonisk gruppe med slug team-norway, kind ekstern, ikke AK-administrert", () => {
  const tn = kanoniskGruppe("team-norway");
  assert.equal(tn.kind, "ekstern");
  assert.equal(tn.program, null);
  assert.equal(tn.managedByAkGolf, false);
});

test("GFGK-stigen har riktige nivåer (A5→A2) og WANG-gruppene er kontrakt", () => {
  assert.equal(kanoniskGruppe("gfgk-mini").level, "A5");
  assert.equal(kanoniskGruppe("gfgk-basis").level, "A4");
  assert.equal(kanoniskGruppe("gfgk-utvikling").level, "A3");
  assert.equal(kanoniskGruppe("gfgk-elite").level, "A2");
  assert.equal(kanoniskGruppe("wang-toppidrett").kind, "kontrakt");
  assert.equal(kanoniskGruppe("wang-ung").kind, "kontrakt");
});

test("kanoniskGruppe kaster på ukjent slug", () => {
  assert.throws(() => kanoniskGruppe("finnes-ikke" as never), /Ukjent kanonisk gruppe-slug/);
});

test("aktivtMedlemskapWhere krever kun endedAt null (alle roller)", () => {
  assert.deepEqual(aktivtMedlemskapWhere(), { endedAt: null });
});

test("aktivtSpillerMedlemskapWhere krever endedAt null OG role PLAYER", () => {
  assert.deepEqual(aktivtSpillerMedlemskapWhere(), { endedAt: null, role: "PLAYER" });
});

test("AK-gruppe-fragmentet (A3-kontrakten) krever aktivt spiller-medlemskap i managedByAkGolf-gruppe", () => {
  assert.deepEqual(aktivtAkGruppeMedlemskapWhere(), {
    endedAt: null,
    role: "PLAYER",
    group: { managedByAkGolf: true },
  });
});

test("user-fragmentet pakker AK-gruppe-fragmentet i groupMemberships.some", () => {
  assert.deepEqual(harAktivtAkGruppeMedlemskapWhere(), {
    groupMemberships: { some: aktivtAkGruppeMedlemskapWhere() },
  });
});
