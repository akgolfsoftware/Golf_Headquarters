import assert from "node:assert/strict";
import { test } from "node:test";
import { beregnFullfortHistorikk, tellUke } from "./ph01-fullfort";

// Mandag 28.09.2026 er uke 40. Uke 39 starter 21.09, uke 38 14.09, uke 37 07.09.
const naa = new Date("2026-09-28T10:00:00Z");
const d = (iso: string) => new Date(`${iso}T08:00:00Z`);
const uke = (mandag: string, ferdig: number, totalt: number) =>
  Array.from({ length: totalt }, (_, i) => ({ dato: d(mandag), status: i < ferdig ? "COMPLETED" : "PUBLISHED" }));

test("rekka teller hele uker over 70 % bakover fra forrige uke", () => {
  const h = beregnFullfortHistorikk([...uke("2026-09-07", 1, 4), ...uke("2026-09-14", 3, 4), ...uke("2026-09-21", 7, 10)], naa);
  assert.equal(h.rekke, 2);
  assert.deepEqual(h.rekkeUker, { fra: 38, til: 39 });
});

test("en uke uten økter bryter rekka, og inneværende uke teller ikke", () => {
  const h = beregnFullfortHistorikk([...uke("2026-09-07", 4, 4), ...uke("2026-09-28", 0, 3)], naa);
  assert.equal(h.rekke, 0);
  assert.equal(h.rekkeUker, null);
});

test("avlyste økter teller ikke, hoppet over teller i nevneren", () => {
  const okter = [...uke("2026-09-21", 2, 2), { dato: d("2026-09-22"), status: "CANCELLED" }, { dato: d("2026-09-23"), status: "SKIPPED" }];
  // 2 av 3 = 67 % — under terskelen
  assert.equal(beregnFullfortHistorikk(okter, naa).rekke, 0);
});

test("milepæler får datoen for den N-te gjennomførte økta, ellers null", () => {
  const okter = Array.from({ length: 12 }, (_, i) => ({ dato: new Date(Date.UTC(2026, 5, 1 + i)), status: "COMPLETED" }));
  const h = beregnFullfortHistorikk(okter, naa);
  assert.equal(h.total, 12);
  assert.deepEqual(h.forste, new Date(Date.UTC(2026, 5, 1)));
  assert.deepEqual(h.milepaeler.map((m) => m.naadd), [new Date(Date.UTC(2026, 5, 10)), null, null]);
});

test("tellUke: gjennomført, igjen og hoppet over", () => {
  assert.deepEqual(tellUke(["COMPLETED", "PUBLISHED", "PLANNED", "SKIPPED", "CANCELLED", "IN_PROGRESS"]), { gjennomfort: 1, totalt: 5, igjen: 3, hoppetOver: 1 });
});
