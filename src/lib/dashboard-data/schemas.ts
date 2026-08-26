/**
 * Zod-schemaer for `dashboard`-schemaet i Supabase (DataGolf-data).
 *
 * `dashboard` er et eget Postgres-schema, adskilt fra `public` som Prisma eier.
 * Prisma sitt schema.prisma har ingen modeller for `dashboard` (multiSchema er
 * bevisst IKKE aktivert, se docs/natt/N2-DONE.md). Rader hentes derfor med
 * `prisma.$queryRaw` og valideres her FØR de returneres til kalleren — se
 * `.claude/rules/gotchas.md` "JSON-blobs MÅ valideres med zod" (samme prinsipp
 * gjelder alt fra dette fremmede schemaet, ikke bare JSON-felt).
 *
 * Numeriske Postgres-typer (`numeric`) kommer over pg-drivern som string —
 * `zod.coerce.number()` håndterer det. `null` fra DB skal forbli `null`,
 * ikke bli til `undefined` eller `0`.
 */

import { z } from "zod";

const nullableNumber = z.coerce.number().nullable();
const nullableInt = z.coerce.number().int().nullable();
const nullableString = z.string().nullable();

// ---------------------------------------------------------------- dg_players

export const dgSpillerSchema = z.object({
  dg_id: z.coerce.number().int(),
  name: z.string(),
  country_iso3: nullableString,
  birth_year: nullableInt,
  amateur: z.boolean(),
  wagr_id: nullableString,
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});
export type DgSpiller = z.infer<typeof dgSpillerSchema>;

// ---------------------------------------------------------------- dg_rounds

export const dgRundeSchema = z.object({
  id: z.coerce.number().int(),
  event_id: z.string(),
  dg_id: z.coerce.number().int(),
  round_num: z.coerce.number().int(),
  course_id: nullableInt,
  score: nullableInt,
  to_par: nullableInt,
  tee_time: nullableString,
  finish_pos: nullableInt,
  made_cut: z.boolean().nullable(),
  created_at: z.coerce.date(),
  score_type: z.string(),
});
export type DgRunde = z.infer<typeof dgRundeSchema>;

// ---------------------------------------------------------------- dg_round_sg

export const dgRundeSgSchema = z.object({
  round_id: z.coerce.number().int(),
  sg_total: nullableNumber,
  sg_ott: nullableNumber,
  sg_app: nullableNumber,
  sg_arg: nullableNumber,
  sg_putt: nullableNumber,
  sg_t2g: nullableNumber,
  driving_dist_y: nullableNumber,
  driving_acc_pct: nullableNumber,
  gir_pct: nullableNumber,
  scrambling_pct: nullableNumber,
  prox_fw_y: nullableNumber,
  prox_rgh_y: nullableNumber,
});
export type DgRundeSg = z.infer<typeof dgRundeSgSchema>;

/** `dg_rounds` joinet med `dg_round_sg` (samme `round_id` = `dg_rounds.id`). */
export const dgRundeMedSgSchema = dgRundeSchema.extend({
  sg_total: nullableNumber,
  sg_ott: nullableNumber,
  sg_app: nullableNumber,
  sg_arg: nullableNumber,
  sg_putt: nullableNumber,
  sg_t2g: nullableNumber,
  driving_dist_y: nullableNumber,
  driving_acc_pct: nullableNumber,
  gir_pct: nullableNumber,
  scrambling_pct: nullableNumber,
  prox_fw_y: nullableNumber,
  prox_rgh_y: nullableNumber,
});
export type DgRundeMedSg = z.infer<typeof dgRundeMedSgSchema>;

// ---------------------------------------------------------------- tournament_results

/** `rounds`-kolonnen er `jsonb` uten kjent, håndhevet form i databasen — valider løst. */
export const turneringsrundeJsonSchema = z.unknown();

export const turneringsresultatSchema = z.object({
  id: z.coerce.number().int(),
  tournament_id: z.coerce.number().int(),
  player_name: z.string(),
  dg_id: nullableInt,
  wagr_id: nullableInt,
  class_code: nullableString,
  segment: nullableString,
  finish_pos: nullableInt,
  total_score: nullableInt,
  to_par: nullableInt,
  rounds: turneringsrundeJsonSchema.nullable(),
  created_at: z.coerce.date(),
  score_type: z.string(),
});
export type Turneringsresultat = z.infer<typeof turneringsresultatSchema>;

// ---------------------------------------------------------------- mv_canonical_players

export const kanoniskSpillerSchema = z.object({
  canonical_id: z.string(),
  birth_year: nullableInt,
  dg_id: nullableInt,
  wagr_id: nullableInt,
  has_ncaa: z.boolean(),
  has_wagr: z.boolean(),
  has_srixon: z.boolean(),
  source_names: z.unknown().nullable(),
});
export type KanoniskSpiller = z.infer<typeof kanoniskSpillerSchema>;

// ---------------------------------------------------------------- mv_player_yearly_stats

export const spillerAarsstatistikkSchema = z.object({
  canonical_id: z.string(),
  year: z.coerce.number().int(),
  segment: nullableString,
  n_rounds: z.coerce.number().int(),
  avg_score: nullableNumber,
  best_score: nullableInt,
  avg_to_par: nullableNumber,
  best_to_par: nullableInt,
});
export type SpillerAarsstatistikk = z.infer<typeof spillerAarsstatistikkSchema>;

// ---------------------------------------------------------------- mv_cohort_baselines

export const kohortBaselineSchema = z.object({
  segment: nullableString,
  year: z.coerce.number().int(),
  n_players: z.coerce.number().int(),
  n_player_years: z.coerce.number().int(),
  avg: nullableNumber,
  stddev: nullableNumber,
  p10: nullableNumber,
  p25: nullableNumber,
  p50: nullableNumber,
  p75: nullableNumber,
  p90: nullableNumber,
  ci95_half_width: nullableNumber,
});
export type KohortBaseline = z.infer<typeof kohortBaselineSchema>;

// ---------------------------------------------------------------- mv_player_growth_rate

export const spillerVekstrateSchema = z.object({
  canonical_id: z.string(),
  year: z.coerce.number().int(),
  segment: nullableString,
  avg_score: nullableNumber,
  prev_year_score: nullableNumber,
  yoy_delta: nullableNumber,
});
export type SpillerVekstrate = z.infer<typeof spillerVekstrateSchema>;

// ---------------------------------------------------------------- mv_club_aggregates

export const klubbAggregatSchema = z.object({
  club: nullableString,
  year: z.coerce.number().int(),
  segment: nullableString,
  n_players: z.coerce.number().int(),
  top25_count: z.coerce.number().int(),
  club_avg: nullableNumber,
});
export type KlubbAggregat = z.infer<typeof klubbAggregatSchema>;

// ---------------------------------------------------------------- mv_college_pipeline

export const collegePipelineSchema = z.object({
  university: nullableString,
  division: nullableString,
  gender: nullableString,
  graduation_year: nullableInt,
  n_norwegian: z.coerce.number().int(),
  pre_college_avg: nullableNumber,
});
export type CollegePipeline = z.infer<typeof collegePipelineSchema>;

// ---------------------------------------------------------------- mv_cohort_progression

export const kohortProgresjonSchema = z.object({
  birth_year: nullableInt,
  year: z.coerce.number().int(),
  active: z.coerce.number().int(),
  top25: z.coerce.number().int(),
  has_wagr_count: z.coerce.number().int(),
  in_college: z.coerce.number().int(),
});
export type KohortProgresjon = z.infer<typeof kohortProgresjonSchema>;

// ---------------------------------------------------------------- mv_player_unified_timeline

export const spillerTidslinjeRadSchema = z.object({
  row_id: z.coerce.number().int(),
  canonical_id: z.string(),
  event_date: z.coerce.date(),
  source: nullableString,
  event_name: nullableString,
  segment: nullableString,
  score_to_par: nullableInt,
  total_score: nullableInt,
  // `finish_pos` er `text` i viewet (ikke `smallint` som i tabellene) —
  // kilder blander tallformat og strenger som "T12".
  finish_pos: nullableString,
  sg_total: nullableNumber,
  provenance: nullableString,
});
export type SpillerTidslinjeRad = z.infer<typeof spillerTidslinjeRadSchema>;
