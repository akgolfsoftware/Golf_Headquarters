import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { OvelseSkjema } from "@/components/workbench/OvelseSkjema";

function tegn(standardPyramide: "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN") {
  return renderToStaticMarkup(createElement(OvelseSkjema, { standardPyramide, disabled: false, onSubmit: () => undefined }));
}

test("Teknikk starter på Utslag og viser læringssteg, måleutstyr, treningsmåte og press", () => {
  const html = tegn("TEK");
  for (const tekst of ["1 · Hensikt", "Læringssteg", "Måleutstyr", "Treningsmåte", "Hvem ser på?", "Teknisk fokus", "Sikte og oppstilling", "Slag"]) {
    assert.ok(html.includes(tekst), `mangler «${tekst}»`);
  }
  assert.ok(!html.includes("Repetisjoner"), "fysiske felt skal ikke vises i Teknikk");
  assert.ok(!html.includes("RIR"));
});

test("Fysisk starter på Styrke og viser fysiske felt, men ingen golffelt", () => {
  const html = tegn("FYS");
  for (const tekst of ["Serier", "Repetisjoner", "Belastning (kg)", "RIR", "Pause (sek)"]) {
    assert.ok(html.includes(tekst), `mangler «${tekst}»`);
  }
  for (const tekst of ["Læringssteg", "Måleutstyr", "Treningsmåte", "Hvem ser på?", "Teknisk fokus"]) {
    assert.ok(!html.includes(tekst), `«${tekst}» skal ikke vises i Fysisk`);
  }
});

test("Spill starter på Banespill med hull eller minutter, uten læringssteg og måleutstyr", () => {
  const html = tegn("SPILL");
  assert.ok(html.includes("Spilleformat"));
  assert.ok(html.includes("Hull"));
  assert.ok(html.includes("Minutter"));
  assert.ok(html.includes("Hvem ser på?"));
  assert.ok(!html.includes("Læringssteg"));
  assert.ok(!html.includes("Måleutstyr"));
});

test("Sted foreslås i grenens rekkefølge, og alle seks hovedmiljøer er valgbare", () => {
  const html = tegn("SPILL");
  assert.ok(html.indexOf("Golfbane") < html.indexOf("Innendørs golf"));
  for (const t of ["Utendørs treningsområde", "Golfbane", "Innendørs golf", "Fysisk treningssted", "Hjemme / eget sted", "Annet sted"]) {
    assert.ok(html.includes(t), `mangler «${t}»`);
  }
});
