import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { SlagLekkasje } from "@/components/v2/datavis";

test("overlappende manuelle pitch/lob-tall vises uten en oppdiktet samlet SG", () => {
  const html = renderToStaticMarkup(createElement(SlagLekkasje, {
    baand: [{ id: "pitch", label: "Pitch", sg: -0.5 }, { id: "lob", label: "Lob", sg: -0.3 }],
    visSum: false, desimaler: 2,
  }));
  assert.ok(html.includes("Pitch")); assert.ok(html.includes("Lob"));
  assert.ok(html.includes("Detaljområdene kan overlappe"));
  assert.ok(!html.includes("Sum "));
});
