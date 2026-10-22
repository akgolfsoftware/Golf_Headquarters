/**
 * Deling med Team Norway er ett nivå (beslutning 22.10, #1614, punkt 4): delingssidene i PlayerHQ og
 * foreldreportalen viser ikke «Tester og resultater» eller «Komplett profil» som valg for Team Norway.
 */
import { test, mock } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

mock.module("next/link", { defaultExport: ({ children, ...rest }: Record<string, unknown>) => createElement("a", rest, children as never) });
mock.module("next/image", { defaultExport: (p: { src: string }) => createElement("img", { src: p.src }) });

const settSamtykke = async () => ({ ok: true as const });
const tn = { gruppeId: "tn", navn: "Team Norway Golf", testerOgResultater: false, komplettProfil: false };
const wang = { gruppeId: "w", navn: "WANG Toppidrett Fredrikstad", testerOgResultater: false, komplettProfil: false };

test("PlayerHQ: Team Norway har ingen nivåbrytere, WANG har dem fortsatt", async () => {
  const { PH27Deling } = await import("@/components/portal/precision/PH27Deling");
  const data = { coach: null, navngitte: [], foreldre: 0, krevesForesatt: false, venter: null };
  const bareTn = renderToStaticMarkup(createElement(PH27Deling, { data: { ...data, organisasjoner: [tn] }, settSamtykke }));
  assert.doesNotMatch(bareTn, /Tester og resultater|Komplett profil/);
  assert.match(bareTn, /ser hele IUP-en din/);
  const bareWang = renderToStaticMarkup(createElement(PH27Deling, { data: { ...data, organisasjoner: [wang] }, settSamtykke }));
  assert.match(bareWang, /Tester og resultater/);
});

test("Foreldreportalen: Team Norway har ingen nivåbrytere", async () => {
  const { FO05Deling } = await import("@/components/forelder/FO05Deling");
  const html = renderToStaticMarkup(createElement(FO05Deling, { organisasjoner: [tn], settSamtykke, barnFornavn: "Jørn" }));
  assert.doesNotMatch(html, /Tester og resultater|Komplett profil/);
  assert.match(html, /ser hele IUP-en til Jørn/);
});
