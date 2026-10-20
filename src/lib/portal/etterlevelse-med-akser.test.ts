import { test } from "node:test";
import assert from "node:assert/strict";
import { etterlevelseMedAkser } from "./etterlevelse-data";
import { etterlevelse } from "@/lib/domain/etterlevelse";

const naa = new Date("2026-10-20T12:00:00Z");
const okt = (dagerSiden: number, min: number, status: "COMPLETED" | "SKIPPED", akse: "TEK" | "FYS") => ({
  startTime: new Date(naa.getTime() - dagerSiden * 86_400_000), durationMin: min, status, pyramidArea: akse,
});

test("eksisterende felt er uendret: samme som etterlevelse() over alle øktene", () => {
  const s = [okt(20, 60, "COMPLETED", "TEK"), okt(10, 60, "SKIPPED", "FYS"), okt(3, 90, "COMPLETED", "TEK")];
  const r = etterlevelseMedAkser(s, naa);
  const fasit = etterlevelse(s.map((x) => ({ scheduledAt: x.startTime, durationMin: x.durationMin, status: x.status })), naa);
  for (const k of Object.keys(fasit) as (keyof typeof fasit)[]) assert.deepEqual(r[k], fasit[k], k);
  assert.equal(r.pct, 71);
  assert.deepEqual([...r.perAkse.keys()], ["FYS", "TEK", "SLAG", "SPILL", "TURN"]);
  assert.equal(r.perAkse.get("TEK")!.pct, 100);
  assert.equal(r.perAkse.get("SLAG")!.pct, null);
});

test("tillegget `okter` er øktene i etterlevelsesform, i samme rekkefølge", () => {
  const s = [okt(5, 45, "COMPLETED", "FYS")];
  assert.deepEqual(etterlevelseMedAkser(s, naa).okter, [{ scheduledAt: s[0].startTime, durationMin: 45, status: "COMPLETED" }]);
});
