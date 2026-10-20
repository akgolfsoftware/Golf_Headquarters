import assert from "node:assert/strict";
import { test } from "node:test";
import { forsteLedigeRom } from "./rom";

const t = (h: number, m = 0) => new Date(Date.UTC(2026, 9, 21, h, m));
const sim1 = { id: "sim1", capacity: 1 };
const sim2 = { id: "sim2", capacity: 1 };
const range = { id: "range", capacity: 3 };

test("første rom velges når alle er ledige", () => {
  assert.equal(forsteLedigeRom([sim1, sim2], [], t(10), t(11)), "sim1");
});

test("opptatt rom hoppes over", () => {
  const belegg = [{ facilityId: "sim1", startAt: t(10), endAt: t(11) }];
  assert.equal(forsteLedigeRom([sim1, sim2], belegg, t(10, 30), t(11, 30)), "sim2");
});

test("alle rom fulle gir null", () => {
  const belegg = [
    { facilityId: "sim1", startAt: t(10), endAt: t(11) },
    { facilityId: "sim2", startAt: t(10), endAt: t(11) },
  ];
  assert.equal(forsteLedigeRom([sim1, sim2], belegg, t(10), t(11)), null);
});

test("back-to-back er ikke overlapp", () => {
  const belegg = [{ facilityId: "sim1", startAt: t(9), endAt: t(10) }];
  assert.equal(forsteLedigeRom([sim1], belegg, t(10), t(11)), "sim1");
});

test("rom med kapasitet over én tar flere samtidig", () => {
  const belegg = [
    { facilityId: "range", startAt: t(10), endAt: t(11) },
    { facilityId: "range", startAt: t(10), endAt: t(11) },
  ];
  assert.equal(forsteLedigeRom([range], belegg, t(10), t(11)), "range");
  belegg.push({ facilityId: "range", startAt: t(10), endAt: t(11) });
  assert.equal(forsteLedigeRom([range], belegg, t(10), t(11)), null);
});

test("bookinger uten rom teller ikke mot rommene", () => {
  const belegg = [{ facilityId: null, startAt: t(10), endAt: t(11) }];
  assert.equal(forsteLedigeRom([sim1], belegg, t(10), t(11)), "sim1");
});
