import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { TimeGrid } from "@/components/v2/time-grid";

test("kalenderens første HTML er stabil selv om minuttet skifter før nettleseren starter", t => {
  t.mock.timers.enable({ apis: ["Date"], now: new Date(2026, 9, 1, 10, 0) });
  const render = () => renderToStaticMarkup(createElement(TimeGrid, {
    days: [{ id: "today", dow: "Tor", date: "1", today: true }],
    renderDay: () => null,
    showNowLine: true,
  }));
  const before = render();
  t.mock.timers.setTime(new Date(2026, 9, 1, 10, 1).getTime());
  assert.equal(render(), before);
  assert.ok(before.includes("data-time-grid"));
});
