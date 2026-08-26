/**
 * Tester for zod-schemaene i `./schemas.ts` — validerer at realistiske
 * fixture-rader (kolonnenavn/-typer verifisert mot `information_schema` og
 * `pg_attribute` i `dashboard`-schemaet 26.08.2026) parses korrekt, og at
 * rader med feil form avvises. Ingen live DB-integrasjon her (se N2-DONE.md).
 *
 * Kjør med: npx tsx --test src/lib/dashboard-data/schemas.test.ts
 */

import test from "node:test";
import assert from "node:assert/strict";
import {
  dgSpillerSchema,
  dgRundeSchema,
  dgRundeSgSchema,
  dgRundeMedSgSchema,
  turneringsresultatSchema,
  kanoniskSpillerSchema,
  spillerAarsstatistikkSchema,
  kohortBaselineSchema,
  spillerVekstrateSchema,
  klubbAggregatSchema,
  collegePipelineSchema,
  kohortProgresjonSchema,
  spillerTidslinjeRadSchema,
} from "./schemas";

test("dgSpillerSchema — gyldig rad fra dg_players", () => {
  const r = dgSpillerSchema.safeParse({
    dg_id: 18417,
    name: "Rohjan, Oyvind",
    country_iso3: "NOR",
    birth_year: 2007,
    amateur: true,
    wagr_id: "123456",
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-02T00:00:00.000Z",
  });
  assert.equal(r.success, true);
});

test("dgSpillerSchema — nullable felt kan være null", () => {
  const r = dgSpillerSchema.safeParse({
    dg_id: 1,
    name: "Test Spiller",
    country_iso3: null,
    birth_year: null,
    amateur: false,
    wagr_id: null,
    created_at: new Date(),
    updated_at: new Date(),
  });
  assert.equal(r.success, true);
});

test("dgSpillerSchema — mangler påkrevd felt (name) avvises", () => {
  const r = dgSpillerSchema.safeParse({
    dg_id: 1,
    amateur: true,
    created_at: new Date(),
    updated_at: new Date(),
  });
  assert.equal(r.success, false);
});

test("dgRundeSchema — gyldig rad fra dg_rounds", () => {
  const r = dgRundeSchema.safeParse({
    id: 991234,
    event_id: "26-500-2026",
    dg_id: 18417,
    round_num: 1,
    course_id: 500,
    score: 71,
    to_par: -1,
    tee_time: "08:10",
    finish_pos: 3,
    made_cut: true,
    created_at: new Date(),
    score_type: "official",
  });
  assert.equal(r.success, true);
});

test("dgRundeSchema — feil type på score_type (tall i stedet for streng) avvises", () => {
  const r = dgRundeSchema.safeParse({
    id: 1,
    event_id: "e1",
    dg_id: 1,
    round_num: 1,
    course_id: null,
    score: null,
    to_par: null,
    tee_time: null,
    finish_pos: null,
    made_cut: null,
    created_at: new Date(),
    score_type: 42,
  });
  assert.equal(r.success, false);
});

test("dgRundeSgSchema — numeric-kolonner kommer som string fra pg-driver og coerces", () => {
  const r = dgRundeSgSchema.safeParse({
    round_id: 991234,
    sg_total: "1.87",
    sg_ott: "0.42",
    sg_app: "0.91",
    sg_arg: "0.10",
    sg_putt: "0.44",
    sg_t2g: "1.43",
    driving_dist_y: "289.3",
    driving_acc_pct: "0.61",
    gir_pct: "0.72",
    scrambling_pct: "0.55",
    prox_fw_y: "34.2",
    prox_rgh_y: "41.0",
  });
  assert.equal(r.success, true);
  if (r.success) {
    assert.equal(r.data.sg_total, 1.87);
    assert.equal(typeof r.data.sg_total, "number");
  }
});

test("dgRundeSgSchema — alle SG-felt kan være null (runde uten SG-data)", () => {
  const r = dgRundeSgSchema.safeParse({
    round_id: 1,
    sg_total: null,
    sg_ott: null,
    sg_app: null,
    sg_arg: null,
    sg_putt: null,
    sg_t2g: null,
    driving_dist_y: null,
    driving_acc_pct: null,
    gir_pct: null,
    scrambling_pct: null,
    prox_fw_y: null,
    prox_rgh_y: null,
  });
  assert.equal(r.success, true);
});

test("dgRundeMedSgSchema — join-formen (dg_rounds + dg_round_sg) parser", () => {
  const r = dgRundeMedSgSchema.safeParse({
    id: 1,
    event_id: "e1",
    dg_id: 1,
    round_num: 2,
    course_id: null,
    score: 70,
    to_par: -2,
    tee_time: null,
    finish_pos: 1,
    made_cut: true,
    created_at: new Date(),
    score_type: "official",
    sg_total: "2.10",
    sg_ott: null,
    sg_app: null,
    sg_arg: null,
    sg_putt: null,
    sg_t2g: null,
    driving_dist_y: null,
    driving_acc_pct: null,
    gir_pct: null,
    scrambling_pct: null,
    prox_fw_y: null,
    prox_rgh_y: null,
  });
  assert.equal(r.success, true);
});

test("turneringsresultatSchema — gyldig rad med jsonb rounds-felt", () => {
  const r = turneringsresultatSchema.safeParse({
    id: 1,
    tournament_id: 42,
    player_name: "Rohjan, Oyvind",
    dg_id: 18417,
    wagr_id: 123456,
    class_code: "M",
    segment: "junior",
    finish_pos: 5,
    total_score: 214,
    to_par: -2,
    rounds: [{ round: 1, score: 71 }, { round: 2, score: 72 }],
    created_at: new Date(),
    score_type: "golfbox",
  });
  assert.equal(r.success, true);
});

test("turneringsresultatSchema — rounds kan være null", () => {
  const r = turneringsresultatSchema.safeParse({
    id: 1,
    tournament_id: 42,
    player_name: "Test",
    dg_id: null,
    wagr_id: null,
    class_code: null,
    segment: null,
    finish_pos: null,
    total_score: null,
    to_par: null,
    rounds: null,
    created_at: new Date(),
    score_type: "golfbox",
  });
  assert.equal(r.success, true);
});

test("turneringsresultatSchema — mangler tournament_id avvises", () => {
  const r = turneringsresultatSchema.safeParse({
    id: 1,
    player_name: "Test",
    created_at: new Date(),
    score_type: "golfbox",
  });
  assert.equal(r.success, false);
});

test("kanoniskSpillerSchema — gyldig rad fra mv_canonical_players", () => {
  const r = kanoniskSpillerSchema.safeParse({
    canonical_id: "rohjan-oyvind-2007",
    birth_year: 2007,
    dg_id: 18417,
    wagr_id: 123456,
    has_ncaa: false,
    has_wagr: true,
    has_srixon: false,
    source_names: { dg: "Rohjan, Oyvind", wagr: "Oyvind Rohjan" },
  });
  assert.equal(r.success, true);
});

test("kanoniskSpillerSchema — has_wagr som streng (feil type) avvises", () => {
  const r = kanoniskSpillerSchema.safeParse({
    canonical_id: "x",
    birth_year: null,
    dg_id: null,
    wagr_id: null,
    has_ncaa: false,
    has_wagr: "true",
    has_srixon: false,
    source_names: null,
  });
  assert.equal(r.success, false);
});

test("spillerAarsstatistikkSchema — gyldig rad fra mv_player_yearly_stats", () => {
  const r = spillerAarsstatistikkSchema.safeParse({
    canonical_id: "rohjan-oyvind-2007",
    year: 2026,
    segment: "junior",
    n_rounds: 24,
    avg_score: "71.40",
    best_score: 66,
    avg_to_par: "-1.20",
    best_to_par: -6,
  });
  assert.equal(r.success, true);
});

test("kohortBaselineSchema — gyldig rad med percentiler fra mv_cohort_baselines", () => {
  const r = kohortBaselineSchema.safeParse({
    segment: "junior",
    year: 2026,
    n_players: 340,
    n_player_years: 340,
    avg: "73.50",
    stddev: "3.20",
    p10: "69.00",
    p25: "71.10",
    p50: "73.40",
    p75: "75.80",
    p90: "78.20",
    ci95_half_width: "0.35",
  });
  assert.equal(r.success, true);
});

test("spillerVekstrateSchema — gyldig rad fra mv_player_growth_rate", () => {
  const r = spillerVekstrateSchema.safeParse({
    canonical_id: "rohjan-oyvind-2007",
    year: 2026,
    segment: "junior",
    avg_score: "71.40",
    prev_year_score: "73.10",
    yoy_delta: "-1.70",
  });
  assert.equal(r.success, true);
});

test("spillerVekstrateSchema — første år uten forrige år gir null prev_year_score", () => {
  const r = spillerVekstrateSchema.safeParse({
    canonical_id: "x",
    year: 2020,
    segment: "junior",
    avg_score: "75.00",
    prev_year_score: null,
    yoy_delta: null,
  });
  assert.equal(r.success, true);
});

test("klubbAggregatSchema — gyldig rad fra mv_club_aggregates", () => {
  const r = klubbAggregatSchema.safeParse({
    club: "Gamle Fredrikstad Golfklubb",
    year: 2026,
    segment: "junior",
    n_players: 12,
    top25_count: 3,
    club_avg: "74.10",
  });
  assert.equal(r.success, true);
});

test("collegePipelineSchema — gyldig rad fra mv_college_pipeline", () => {
  const r = collegePipelineSchema.safeParse({
    university: "University of Nevada",
    division: "D1",
    gender: "M",
    graduation_year: 2028,
    n_norwegian: 2,
    pre_college_avg: "70.90",
  });
  assert.equal(r.success, true);
});

test("kohortProgresjonSchema — gyldig rad fra mv_cohort_progression", () => {
  const r = kohortProgresjonSchema.safeParse({
    birth_year: 2007,
    year: 2026,
    active: 45,
    top25: 8,
    has_wagr_count: 30,
    in_college: 2,
  });
  assert.equal(r.success, true);
});

test("spillerTidslinjeRadSchema — finish_pos er text i viewet (kan være 'T12')", () => {
  const r = spillerTidslinjeRadSchema.safeParse({
    row_id: 1,
    canonical_id: "rohjan-oyvind-2007",
    event_date: "2026-06-15",
    source: "golfbox",
    event_name: "Norgescup Fredrikstad",
    segment: "junior",
    score_to_par: -1,
    total_score: 215,
    finish_pos: "T12",
    sg_total: "1.10",
    provenance: "golfbox_sync",
  });
  assert.equal(r.success, true);
  if (r.success) {
    assert.equal(r.data.finish_pos, "T12");
  }
});

test("spillerTidslinjeRadSchema — mangler row_id avvises", () => {
  const r = spillerTidslinjeRadSchema.safeParse({
    canonical_id: "x",
    event_date: new Date(),
    source: null,
    event_name: null,
    segment: null,
    score_to_par: null,
    total_score: null,
    finish_pos: null,
    sg_total: null,
    provenance: null,
  });
  assert.equal(r.success, false);
});
