/**
 * PlayerHQ-lenken til Team Norway (beslutninger.md §TEAM NORWAY-TRENERFLATEN BYGGES I HQ, punkt 6):
 * finnes for Team Norway-spillere og ikke for andre, på begge delingssidene.
 */
import { test, mock } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";

mock.module("next/link", { defaultExport: ({ children, ...rest }: Record<string, unknown>) => createElement("a", rest, children as never) });

test("lenken vises for en spiller i en Team Norway-gruppe", async () => {
  const { TnInnsynLenke } = await import("@/components/portal/precision/TnInnsynLenke");
  const html = renderToStaticMarkup(createElement(TnInnsynLenke, { tnGrupper: [{ id: "tn", navn: "Team Norway Golf" }] }));
  assert.match(html, /href="\/portal\/meg\/deling\/team-norway"[^>]*>Se hva Team Norway ser/);
});

test("lenken vises ikke for andre spillere", async () => {
  const { TnInnsynLenke } = await import("@/components/portal/precision/TnInnsynLenke");
  assert.equal(renderToStaticMarkup(createElement(TnInnsynLenke, { tnGrupper: [] })), "");
});

test("begge delingssidene henter Team Norway-gruppene og viser lenken ut fra dem", () => {
  for (const side of ["src/app/portal/meg/deling/page.tsx", "src/app/portal/meg/innstillinger/personvern/deling/page.tsx"]) {
    const kilde = readFileSync(new URL(`../../${side}`, import.meta.url), "utf8");
    assert.match(kilde, /hentTnSpillergrupper\(/, side);
    assert.match(kilde, /<TnInnsynLenke tnGrupper=\{tnGrupper\} \/>/, side);
  }
  const innsyn = readFileSync(new URL("../../src/app/portal/meg/deling/team-norway/page.tsx", import.meta.url), "utf8");
  assert.match(innsyn, /if \(grupper\.length === 0\) notFound\(\);/);
});

test("hentTnSpillergrupper teller bare aktive spillermedlemskap i Team Norway-grupper", () => {
  const kilde = readFileSync(new URL("../../src/lib/deling/team-norway-spiller.ts", import.meta.url), "utf8");
  assert.match(kilde, /aktivtSpillerMedlemskapWhere\(\)/);
  assert.match(kilde, /slug: \{ in: \[TEAM_NORWAY_SLUG, TN_DEMO_SLUG\] \}/);
});
