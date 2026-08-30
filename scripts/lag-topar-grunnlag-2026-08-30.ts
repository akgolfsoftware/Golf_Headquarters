/**
 * Del A steg 5 — pargrunnlaget (Anders 30.08.2026).
 *
 * Oppretter `dashboard.mv_topar_grunnlag`: én rad per (spiller, turnering) med
 * til-par, normalisert slik at flerrundeturneringer kan sammenlignes med
 * endagsturneringer.
 *
 * ── HVORFOR IKKE SLIK KARTLEGGINGEN BESKREV ─────────────────────────────────
 * Datakartleggingen anbefalte å lese til-par rått fra
 * `public_player_entries.scoreToPar`. Målt 30.08.2026 er det feltet en
 * FLERRUNDE-TOTAL, ikke en rundescore — snittet stiger med antall runder:
 *
 *     1 runde  → 14,1      3 runder → 20,7
 *     2 runder → 20,1      5 runder → 37,1
 *
 * Brukes det rått som «runde», gjentas nøyaktig feilen som ødela
 * `mv_cohort_baselines` (J19 2025: snitt 155,3 = flerrundetotaler behandlet
 * som enkeltrunder). Derfor deler dette viewet totalen på antall gyldige
 * runder og eksponerer resultatet som `topar_snitt_runde` — et SNITT, aldri
 * kalt en rundescore.
 *
 * Per-runde til-par finnes ikke som alternativ: `public_player_rounds.toPar`
 * er utfylt på 25 av 942 299 rader (0,00 %).
 *
 * Par utledes ALDRI fra baneregisteret (kartleggingens grunnlagsbeslutning:
 * treffer eksakt i 39,7 %, systematisk avvik −1,02 slag fordi juniorer spiller
 * kortere tee — ville framstilt juniorer 1–7 slag dårligere enn de er).
 *
 * ── KJENT BEGRENSNING: BRUTTO/NETTO ─────────────────────────────────────────
 * Netto-hvitlista (13 faktiske nettokoder) kan IKKE anvendes her. Klassekode
 * finnes kun i `dashboard.tournament_results` og mangler helt i
 * `public`-tabellene dette viewet leser. Viewet kan derfor inneholde
 * nettoresultater. Fikses når klassekoden tas vare på i scraperen
 * (`src/lib/scrapers/golfbox.ts` forkaster den i dag).
 *
 * MATERIALISERT fordi et vanlig view over 942 299 runder tidsavbrøt (57014) på
 * en enkel telling. Oppfriskes når scraperen har hentet nye resultater:
 *
 *     refresh materialized view concurrently dashboard.mv_topar_grunnlag;
 *
 * Gotcha: `prisma migrate dev`/`db push`/`migrate deploy` er ALLE blokkert
 * (.claude/rules/gotchas.md §Schema-endringer). Kirurgisk DDL mot DIRECT_URL
 * er den dokumenterte veien. Viewet er additivt og rører ingen tabelldata.
 *
 *   npx tsx scripts/lag-topar-grunnlag-2026-08-30.ts
 *   npx tsx scripts/lag-topar-grunnlag-2026-08-30.ts --rollback
 */
import { Client } from "pg";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

const direct = process.env.DIRECT_URL;
if (!direct) {
  console.error("DIRECT_URL mangler i .env.local");
  process.exit(1);
}

/** Rundescore utenfor dette vinduet er registreringsfeil, ikke golf. */
const SCORE_MIN = 55;
const SCORE_MAKS = 130;

/**
 * Grense mot søppel i `scoreToPar`. Basen har 202 entries uten runder der
 * feltet har snitt 4 957,6 — åpenbart feilplasserte verdier. En femrunders
 * turnering på +24 per runde gir 120; alt utenfor [-40, 120] er ikke golf.
 */
const TOPAR_MIN = -40;
const TOPAR_MAKS = 120;

const OPPRETT_SQL = `
drop materialized view if exists dashboard.mv_topar_grunnlag;
create materialized view dashboard.mv_topar_grunnlag as
with gyldige_runder as (
  select
    r."entryId"      as entry_id,
    count(*)         as antall_runder,
    min(r.score)     as beste_rundescore,
    max(r.score)     as verste_rundescore,
    sum(r.score)     as sum_score
  from public.public_player_rounds r
  where r.score between ${SCORE_MIN} and ${SCORE_MAKS}
  group by r."entryId"
)
select
  e.id                                              as entry_id,
  p.id                                              as player_id,
  p.slug                                            as player_slug,
  p.name                                            as player_name,
  p.country,
  p."birthYear"                                     as birth_year,
  p."dataGolfId"                                    as data_golf_id,
  t.id                                              as tournament_id,
  t.name                                            as tournament_name,
  t.tour,
  t."sourceOrigin"                                  as kilde,
  t."startDate"                                     as start_date,
  extract(year from t."startDate")::int             as sesong,
  g.antall_runder,
  e."scoreToPar"                                    as topar_total,
  -- SNITT per runde, ikke en rundescore. Se filhodet.
  round(e."scoreToPar"::numeric / g.antall_runder, 2) as topar_snitt_runde,
  g.beste_rundescore,
  g.verste_rundescore,
  g.sum_score,
  e.position,
  e.status
from public.public_player_entries e
join gyldige_runder g          on g.entry_id = e.id
join public.public_players p   on p.id = e."playerId"
join public.tournaments t      on t.id = e."tournamentId"
where t."mergedIntoId" is null
  and e."scoreToPar" is not null
  and e."scoreToPar" between ${TOPAR_MIN} and ${TOPAR_MAKS};

create unique index mv_topar_grunnlag_entry_idx
  on dashboard.mv_topar_grunnlag (entry_id);
-- Spillerens egen kurve over tid (PlayerHQ «Min kurve», AgencyOS «Innsikt»).
create index mv_topar_grunnlag_spiller_dato_idx
  on dashboard.mv_topar_grunnlag (player_id, start_date);
-- Kohort-oppslag per fødselsår og sesong (kun coach-flater).
create index mv_topar_grunnlag_kohort_idx
  on dashboard.mv_topar_grunnlag (country, birth_year, sesong);

comment on materialized view dashboard.mv_topar_grunnlag is
  'Til-par per (spiller, turnering). topar_snitt_runde er et SNITT over turneringens runder, aldri en enkeltrundescore. Kan inneholde netto — klassekode finnes ikke i public-tabellene. Oppfrisk med: refresh materialized view concurrently dashboard.mv_topar_grunnlag. Se scripts/lag-topar-grunnlag-2026-08-30.ts.';
`;

const ROLLBACK_SQL = `drop materialized view if exists dashboard.mv_topar_grunnlag;`;

async function main() {
  const rollback = process.argv.includes("--rollback");
  const client = new Client({ connectionString: direct });
  await client.connect();
  try {
    await client.query(rollback ? ROLLBACK_SQL : OPPRETT_SQL);
    console.log(rollback ? "Viewet er fjernet." : "dashboard.mv_topar_grunnlag opprettet.");

    if (!rollback) {
      const { rows } = await client.query(`
        select
          count(*)                                              as rader,
          count(*) filter (where country = 'NO')                as norske,
          count(distinct player_id)                             as spillere,
          count(distinct tournament_id)                         as turneringer,
          min(sesong)                                           as fra,
          max(sesong)                                           as til,
          round(avg(topar_snitt_runde) filter (where country = 'NO'), 2) as snitt_no
        from dashboard.mv_topar_grunnlag;
      `);
      console.table(rows);
    }
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
