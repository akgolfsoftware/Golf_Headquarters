import { test } from "node:test";
import assert from "node:assert/strict";
import { parseAppleHealth } from "@/lib/health/parse-apple-health";

type Punkt = Record<string, unknown>;

function payload(
  metrics: Array<{ name: string; units?: string; data: Punkt[] }>,
): unknown {
  return { data: { metrics } };
}

test("HRV-rad blir én rad med riktig dato, verdi og enhet", () => {
  const res = parseAppleHealth(
    payload([
      {
        name: "heart_rate_variability",
        units: "ms",
        data: [{ date: "2026-08-01 00:00:00 +0200", qty: 62.4 }],
      },
    ]),
  );

  assert.equal(res.rows.length, 1);
  assert.deepEqual(
    { ...res.rows[0], raw_json: undefined },
    {
      metric_date: "2026-08-01",
      metric: "hrv_sdnn",
      value_num: 62.4,
      unit: "ms",
      source: "apple",
      raw_json: undefined,
    },
  );
  assert.equal(res.skipped, 0);
});

test("måling kl. 00:30 +0200 beholder datoen fra strengen", () => {
  // Regresjonsvakt: new Date(...).toISOString() ville gitt 2026-07-31 her, og
  // dermed flyttet all søvndata én dag bakover.
  const res = parseAppleHealth(
    payload([
      {
        name: "heart_rate_variability",
        units: "ms",
        data: [{ date: "2026-08-01 00:30:00 +0200", qty: 55 }],
      },
    ]),
  );

  assert.equal(res.rows[0].metric_date, "2026-08-01");
});

test("sleep_analysis bruker asleep som verdi og beholder fasene i raw_json", () => {
  const punkt = {
    date: "2026-08-01 00:00:00 +0200",
    asleep: 7.2,
    inBed: 7.9,
    deep: 1.1,
    core: 4.3,
    rem: 1.8,
    awake: 0.7,
  };
  const res = parseAppleHealth(
    payload([{ name: "sleep_analysis", units: "hr", data: [punkt] }]),
  );

  assert.equal(res.rows.length, 1);
  assert.equal(res.rows[0].metric, "sleep_hours");
  assert.equal(res.rows[0].value_num, 7.2);
  assert.equal(res.rows[0].unit, "h");
  const raw = res.rows[0].raw_json as Record<string, unknown>;
  assert.equal(raw.deep, 1.1);
  assert.equal(raw.rem, 1.8);
  assert.equal(raw.core, 4.3);
});

test("ukjent metric-navn hoppes over uten å kaste", () => {
  const res = parseAppleHealth(
    payload([
      {
        name: "blood_glucose_sparkles",
        units: "mmol/L",
        data: [{ date: "2026-08-01 09:00:00 +0200", qty: 5.4 }],
      },
    ]),
  );

  assert.deepEqual(res.rows, []);
  assert.deepEqual(res.unknownMetrics, ["blood_glucose_sparkles"]);
  assert.deepEqual(res.unitMismatch, []);
});

test("manglende og ikke-numerisk verdi telles som skipped", () => {
  const res = parseAppleHealth(
    payload([
      {
        name: "step_count",
        units: "count",
        data: [
          { date: "2026-08-01 00:00:00 +0200", qty: null },
          { date: "2026-08-02 00:00:00 +0200", qty: "abc" },
        ],
      },
    ]),
  );

  assert.deepEqual(res.rows, []);
  assert.equal(res.skipped, 2);
});

test("body_mass i lb havner i unitMismatch, ikke i rows", () => {
  const res = parseAppleHealth(
    payload([
      {
        name: "body_mass",
        units: "lb",
        data: [{ date: "2026-08-01 07:00:00 +0200", qty: 176 }],
      },
    ]),
  );

  assert.deepEqual(res.rows, []);
  assert.deepEqual(res.unitMismatch, ["body_mass"]);
});

test("samme dato og metric to ganger gir én rad — siste verdi vinner", () => {
  const res = parseAppleHealth(
    payload([
      {
        name: "resting_heart_rate",
        units: "count/min",
        data: [
          { date: "2026-08-01 00:00:00 +0200", qty: 52 },
          { date: "2026-08-01 00:00:00 +0200", qty: 48 },
        ],
      },
    ]),
  );

  assert.equal(res.rows.length, 1);
  assert.equal(res.rows[0].value_num, 48);
});

test("tomt objekt som payload kaster TypeError", () => {
  assert.throws(() => parseAppleHealth({}), TypeError);
});
