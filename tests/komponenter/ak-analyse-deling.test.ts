import { before, mock, test } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
mock.module("@/app/portal/meg/innstillinger/personvern/ak-analyse-actions", { namedExports: {
  svarAkAnalyse() { throw Error("Ingen automatisk tillatelse"); },
  svarAkAnalyseForBarn() { throw Error("Ingen automatisk foreldretillatelse"); },
} });
let Side: typeof import("@/components/portal/precision/AkAnalyseDeling").AkAnalyseDeling;
before(async () => { ({ AkAnalyseDeling: Side } = await import("@/components/portal/precision/AkAnalyseDeling")); });
const valg = { gruppeId: "syntetisk-gruppe", gruppeNavn: "Syntetisk gruppe", deler: false, kanGi: true, kreverForesatt: false, forelderKanEndre: false };
const html = (props: Parameters<typeof Side>[0]) => renderToStaticMarkup(createElement(Side, props));
test("voksen får aktivt delingsvalg med eget formål, aldri forhåndsvalgt samtykke", () => {
  const side = html({ valg });
  assert.match(side, /Deler ikke/); assert.match(side, /Del treningsgrunnlaget/);
  assert.match(side, /ikke tillatelse til å trene AI-modeller/);
  assert.match(side, /også egne økter utenfor gruppetreningene/);
  assert.match(side, /endrer ikke andre delinger/);
  assert.doesNotMatch(side, /Trekk delingen/);
});
test("barn får ikke gi selv, men kan trekke eksisterende deling", () => {
  const barn = { ...valg, kreverForesatt: true };
  assert.doesNotMatch(html({ valg: barn }), /Del treningsgrunnlaget<\/button/);
  assert.match(html({ valg: { ...barn, deler: true } }), /Trekk delingen/);
});
test("foresatt får valg for barn; voksen spiller bestemmer selv", () => {
  assert.match(html({ valg: { ...valg, kreverForesatt: true, forelderKanEndre: true }, childId: "syntetisk-barn" }), /Del treningsgrunnlaget/);
  const voksen = html({ valg: { ...valg, deler: true }, childId: "syntetisk-voksen" });
  assert.match(voksen, /Foreldre kan ikke endre dette valget nå/);
  assert.doesNotMatch(voksen, /<button/);
});
test("etter utmelding kan spilleren trekke, men ikke gi ny tillatelse", () => {
  assert.match(html({ valg: { ...valg, kanGi: false, deler: true } }), /Trekk delingen/);
  assert.doesNotMatch(html({ valg: { ...valg, kanGi: false } }), /<button/);
});
