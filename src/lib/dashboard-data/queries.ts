/**
 * Read-only lesemodul mot `dashboard`-schemaet i akgolf-hq sin egen Supabase-
 * database (prosjekt `dcnxoztjtdqoidaekxry`, London). `dashboard` er talenthq
 * sitt gamle DataGolf-schema, adskilt fra `public` som Prisma eier — Prisma
 * kjenner ikke til disse tabellene (multiSchema er bevisst IKKE aktivert).
 *
 * Alle spørringer går via `prisma.$queryRaw` (tagged template — ALDRI
 * strengkonkatenering av input, se CLAUDE.md). Hver rad valideres med zod
 * (`./schemas.ts`) FØR den returneres. Ingen skriving herfra — kun SELECT.
 *
 * Skjermkobling kommer i en senere sesjon (N12) — denne modulen brukes ikke
 * av noen UI ennå.
 */

import { prisma } from "@/lib/prisma";
import {
  dgSpillerSchema,
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
  type DgSpiller,
  type DgRundeMedSg,
  type Turneringsresultat,
  type KanoniskSpiller,
  type SpillerAarsstatistikk,
  type KohortBaseline,
  type SpillerVekstrate,
  type KlubbAggregat,
  type CollegePipeline,
  type KohortProgresjon,
  type SpillerTidslinjeRad,
} from "./schemas";
import { z } from "zod";

const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 500;

function trygLimit(limit: number | undefined): number {
  if (!limit || limit <= 0) return DEFAULT_LIMIT;
  return Math.min(limit, MAX_LIMIT);
}

/** Parser en rad-liste mot et zod-schema; kaster ved første ugyldige rad. */
function parseRader<T>(schema: z.ZodType<T>, rader: unknown[]): T[] {
  return rader.map((rad) => schema.parse(rad));
}

// ================================================================== dg_players

/** Ett enkelt DataGolf-spillersøk på `dg_id`. */
export async function hentDgSpiller(dgId: number): Promise<DgSpiller | null> {
  const rader = await prisma.$queryRaw<unknown[]>`
    select dg_id, name, country_iso3, birth_year, amateur, wagr_id, created_at, updated_at
    from dashboard.dg_players
    where dg_id = ${dgId}
    limit 1
  `;
  if (rader.length === 0) return null;
  return dgSpillerSchema.parse(rader[0]);
}

/** Søk på navn (case-insensitivt delvis treff), paginert. */
export async function sokDgSpillere(
  navnSok: string,
  opts: { limit?: number; offset?: number } = {},
): Promise<DgSpiller[]> {
  const limit = trygLimit(opts.limit);
  const offset = Math.max(0, opts.offset ?? 0);
  const rader = await prisma.$queryRaw<unknown[]>`
    select dg_id, name, country_iso3, birth_year, amateur, wagr_id, created_at, updated_at
    from dashboard.dg_players
    where name ilike ${"%" + navnSok + "%"}
    order by name asc
    limit ${limit} offset ${offset}
  `;
  return parseRader(dgSpillerSchema, rader);
}

// ================================================================== dg_rounds + dg_round_sg

/**
 * DataGolf-runder for én spiller, joinet med strokes-gained-detaljene,
 * nyeste først. `fraDato`/`tilDato` filtrerer på `dg_rounds.created_at`
 * (eneste tidsstempel på raden — `tee_time` er en ustrukturert tekststreng).
 */
export async function hentDgRunderForSpiller(
  dgId: number,
  opts: { limit?: number; offset?: number; fraDato?: Date; tilDato?: Date } = {},
): Promise<DgRundeMedSg[]> {
  const limit = trygLimit(opts.limit);
  const offset = Math.max(0, opts.offset ?? 0);
  const fraDato = opts.fraDato ?? null;
  const tilDato = opts.tilDato ?? null;

  const rader = await prisma.$queryRaw<unknown[]>`
    select
      r.id, r.event_id, r.dg_id, r.round_num, r.course_id, r.score, r.to_par,
      r.tee_time, r.finish_pos, r.made_cut, r.created_at, r.score_type,
      sg.sg_total, sg.sg_ott, sg.sg_app, sg.sg_arg, sg.sg_putt, sg.sg_t2g,
      sg.driving_dist_y, sg.driving_acc_pct, sg.gir_pct, sg.scrambling_pct,
      sg.prox_fw_y, sg.prox_rgh_y
    from dashboard.dg_rounds r
    left join dashboard.dg_round_sg sg on sg.round_id = r.id
    where r.dg_id = ${dgId}
      and (${fraDato}::timestamptz is null or r.created_at >= ${fraDato})
      and (${tilDato}::timestamptz is null or r.created_at <= ${tilDato})
    order by r.created_at desc
    limit ${limit} offset ${offset}
  `;
  return parseRader(dgRundeMedSgSchema, rader);
}

/** Alle runder (med SG) for én event, uansett spiller — brukt for feltoversikt. */
export async function hentDgRunderForEvent(eventId: string): Promise<DgRundeMedSg[]> {
  const rader = await prisma.$queryRaw<unknown[]>`
    select
      r.id, r.event_id, r.dg_id, r.round_num, r.course_id, r.score, r.to_par,
      r.tee_time, r.finish_pos, r.made_cut, r.created_at, r.score_type,
      sg.sg_total, sg.sg_ott, sg.sg_app, sg.sg_arg, sg.sg_putt, sg.sg_t2g,
      sg.driving_dist_y, sg.driving_acc_pct, sg.gir_pct, sg.scrambling_pct,
      sg.prox_fw_y, sg.prox_rgh_y
    from dashboard.dg_rounds r
    left join dashboard.dg_round_sg sg on sg.round_id = r.id
    where r.event_id = ${eventId}
    order by r.dg_id asc, r.round_num asc
  `;
  return parseRader(dgRundeMedSgSchema, rader);
}

// ================================================================== tournament_results

/** Turneringsresultater for én spiller (matchet på `dg_id`), nyeste først. */
export async function hentTurneringsresultaterForSpiller(
  dgId: number,
  opts: { limit?: number; offset?: number } = {},
): Promise<Turneringsresultat[]> {
  const limit = trygLimit(opts.limit);
  const offset = Math.max(0, opts.offset ?? 0);
  const rader = await prisma.$queryRaw<unknown[]>`
    select id, tournament_id, player_name, dg_id, wagr_id, class_code, segment,
      finish_pos, total_score, to_par, rounds, created_at, score_type
    from dashboard.tournament_results
    where dg_id = ${dgId}
    order by created_at desc
    limit ${limit} offset ${offset}
  `;
  return parseRader(turneringsresultatSchema, rader);
}

/** Alle resultater for én turnering (`tournament_id`), sortert på plassering. */
export async function hentTurneringsresultaterForTurnering(
  turneringId: number,
): Promise<Turneringsresultat[]> {
  const rader = await prisma.$queryRaw<unknown[]>`
    select id, tournament_id, player_name, dg_id, wagr_id, class_code, segment,
      finish_pos, total_score, to_par, rounds, created_at, score_type
    from dashboard.tournament_results
    where tournament_id = ${turneringId}
    order by finish_pos asc nulls last
  `;
  return parseRader(turneringsresultatSchema, rader);
}

// ================================================================== mv_canonical_players

/** Kanonisk spiller-mapping (DataGolf/WAGR/NCAA/Srixon) på `dg_id`. */
export async function hentKanoniskSpillerForDgId(dgId: number): Promise<KanoniskSpiller | null> {
  const rader = await prisma.$queryRaw<unknown[]>`
    select canonical_id, birth_year, dg_id, wagr_id, has_ncaa, has_wagr, has_srixon, source_names
    from dashboard.mv_canonical_players
    where dg_id = ${dgId}
    limit 1
  `;
  if (rader.length === 0) return null;
  return kanoniskSpillerSchema.parse(rader[0]);
}

/** Kanonisk spiller-mapping direkte på `canonical_id`. */
export async function hentKanoniskSpiller(canonicalId: string): Promise<KanoniskSpiller | null> {
  const rader = await prisma.$queryRaw<unknown[]>`
    select canonical_id, birth_year, dg_id, wagr_id, has_ncaa, has_wagr, has_srixon, source_names
    from dashboard.mv_canonical_players
    where canonical_id = ${canonicalId}
    limit 1
  `;
  if (rader.length === 0) return null;
  return kanoniskSpillerSchema.parse(rader[0]);
}

// ================================================================== mv_player_yearly_stats

/** Årsstatistikk for én spiller (`canonical_id`), alle segmenter, nyeste år først. */
export async function hentSpillerAarsstatistikk(
  canonicalId: string,
): Promise<SpillerAarsstatistikk[]> {
  const rader = await prisma.$queryRaw<unknown[]>`
    select canonical_id, year, segment, n_rounds, avg_score, best_score, avg_to_par, best_to_par
    from dashboard.mv_player_yearly_stats
    where canonical_id = ${canonicalId}
    order by year desc
  `;
  return parseRader(spillerAarsstatistikkSchema, rader);
}

// ================================================================== mv_cohort_baselines

/** Kohort-baseline (percentiler) for ett segment i ett år. */
export async function hentKohortBaseline(
  segment: string,
  year: number,
): Promise<KohortBaseline | null> {
  const rader = await prisma.$queryRaw<unknown[]>`
    select segment, year, n_players, n_player_years, avg, stddev, p10, p25, p50, p75, p90, ci95_half_width
    from dashboard.mv_cohort_baselines
    where segment = ${segment} and year = ${year}
    limit 1
  `;
  if (rader.length === 0) return null;
  return kohortBaselineSchema.parse(rader[0]);
}

// ================================================================== mv_player_growth_rate

/** År-over-år-vekst for én spiller, nyeste år først. */
export async function hentSpillerVekstrate(canonicalId: string): Promise<SpillerVekstrate[]> {
  const rader = await prisma.$queryRaw<unknown[]>`
    select canonical_id, year, segment, avg_score, prev_year_score, yoy_delta
    from dashboard.mv_player_growth_rate
    where canonical_id = ${canonicalId}
    order by year desc
  `;
  return parseRader(spillerVekstrateSchema, rader);
}

// ================================================================== mv_club_aggregates

/** Klubb-aggregater for ett år (alle klubber), sortert på snittscore. */
export async function hentKlubbAggregaterForAar(year: number): Promise<KlubbAggregat[]> {
  const rader = await prisma.$queryRaw<unknown[]>`
    select club, year, segment, n_players, top25_count, club_avg
    from dashboard.mv_club_aggregates
    where year = ${year}
    order by club_avg asc nulls last
  `;
  return parseRader(klubbAggregatSchema, rader);
}

// ================================================================== mv_college_pipeline

/** College-pipeline for norske spillere, ett uteksamineringsår. */
export async function hentCollegePipelineForAar(
  graduationYear: number,
): Promise<CollegePipeline[]> {
  const rader = await prisma.$queryRaw<unknown[]>`
    select university, division, gender, graduation_year, n_norwegian, pre_college_avg
    from dashboard.mv_college_pipeline
    where graduation_year = ${graduationYear}
    order by n_norwegian desc
  `;
  return parseRader(collegePipelineSchema, rader);
}

// ================================================================== mv_cohort_progression

/** Progresjon for ett fødselsår, alle år, eldste først. */
export async function hentKohortProgresjon(birthYear: number): Promise<KohortProgresjon[]> {
  const rader = await prisma.$queryRaw<unknown[]>`
    select birth_year, year, active, top25, has_wagr_count, in_college
    from dashboard.mv_cohort_progression
    where birth_year = ${birthYear}
    order by year asc
  `;
  return parseRader(kohortProgresjonSchema, rader);
}

// ================================================================== mv_player_unified_timeline

/** Samlet tidslinje for én spiller (alle kilder), nyeste hendelse først. */
export async function hentSpillerTidslinje(
  canonicalId: string,
  opts: { limit?: number; offset?: number } = {},
): Promise<SpillerTidslinjeRad[]> {
  const limit = trygLimit(opts.limit);
  const offset = Math.max(0, opts.offset ?? 0);
  const rader = await prisma.$queryRaw<unknown[]>`
    select row_id, canonical_id, event_date, source, event_name, segment,
      score_to_par, total_score, finish_pos, sg_total, provenance
    from dashboard.mv_player_unified_timeline
    where canonical_id = ${canonicalId}
    order by event_date desc
    limit ${limit} offset ${offset}
  `;
  return parseRader(spillerTidslinjeRadSchema, rader);
}
