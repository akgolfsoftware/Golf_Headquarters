# N2 — dashboard-data-bro (talenthq → akgolf-hq)

Dato: 2026-08-26. Gren: `claude/n2-dashboard-data-bridge` (fra `origin/main`).

## Hva ble bygget

Read-only lesemodul under `src/lib/dashboard-data/` som leser fra `dashboard.*`-
schemaet i akgolf-hq sin egen Supabase-database (`dcnxoztjtdqoidaekxry`, London)
via `prisma.$queryRaw` (tagged template — ingen strengkonkatenering av input).
Prisma sitt `schema.prisma` er **ikke** endret — ingen `multiSchema`, ingen nye
modeller. `dashboard` er talenthq sitt gamle DataGolf-schema, adskilt fra
`public` som Prisma eier.

Filer:
- `src/lib/dashboard-data/schemas.ts` — zod-schemaer for hver tabell/view.
- `src/lib/dashboard-data/queries.ts` — de faktiske lesefunksjonene.
- `src/lib/dashboard-data/schemas.test.ts` — 22 fixture-baserte enhetstester
  (node:test), verifiserer at gyldige rader parses og at rader med feil
  form/manglende felt avvises.
- `src/lib/dashboard-data/index.ts` — samlet eksport.

Ikke koblet til noen skjerm eller UI (kommer i N12, egen sesjon).

## Funksjoner bygget (én+ per tabell/view, 12 datakilder totalt)

| Kilde | Funksjon(er) |
|---|---|
| `dg_players` | `hentDgSpiller(dgId)`, `sokDgSpillere(navnSok, opts)` |
| `dg_rounds` + `dg_round_sg` (join) | `hentDgRunderForSpiller(dgId, opts)`, `hentDgRunderForEvent(eventId)` |
| `tournament_results` | `hentTurneringsresultaterForSpiller(dgId, opts)`, `hentTurneringsresultaterForTurnering(turneringId)` |
| `mv_canonical_players` | `hentKanoniskSpillerForDgId(dgId)`, `hentKanoniskSpiller(canonicalId)` |
| `mv_player_yearly_stats` | `hentSpillerAarsstatistikk(canonicalId)` |
| `mv_cohort_baselines` | `hentKohortBaseline(segment, year)` |
| `mv_player_growth_rate` | `hentSpillerVekstrate(canonicalId)` |
| `mv_club_aggregates` | `hentKlubbAggregaterForAar(year)` |
| `mv_college_pipeline` | `hentCollegePipelineForAar(graduationYear)` |
| `mv_cohort_progression` | `hentKohortProgresjon(birthYear)` |
| `mv_player_unified_timeline` | `hentSpillerTidslinje(canonicalId, opts)` |

Paginering (`limit`/`offset`, default 100, maks 500) er lagt på funksjonene som
naturlig kan returnere mange rader (runder, turneringsresultater, tidslinje).

## Faktiske kolonnenavn (introspeksjon 26.08.2026)

Introspeksjon kjørt mot `information_schema.columns` (tabeller) og
`pg_attribute`/`pg_class` (materialiserte views — disse er IKKE synlige i
`information_schema.columns`, siden `relkind = 'm'` ikke er en standard SQL-
objekttype). Ingen store overraskelser i selve navnene — alt var `snake_case`
og forholdsvis forutsigbart — men noen presiseringer:

- **`dg_rounds` har ikke egen dato-kolonne for spilledato.** Eneste
  tidsstempel er `created_at` (når raden ble lastet inn i DB) — `tee_time` er
  en fri tekststreng (`character varying`, f.eks. "08:10"), ikke et
  tidsstempel. `fraDato`/`tilDato`-filteret i `hentDgRunderForSpiller` filtrerer
  derfor på `created_at`, ikke faktisk rundedato — presisert i kode-kommentaren.
- **`tournament_results.rounds` er `jsonb` uten fastsatt form** — validert
  løst med `z.unknown()` i denne omgangen. Bør strammes inn med et konkret
  zod-schema når den faktiske JSON-strukturen er dokumentert (ikke gjort her,
  utenfor scope for N2).
- **`mv_player_unified_timeline.finish_pos` er `text`**, mens `finish_pos` i
  `dg_rounds` og `tournament_results` er `smallint`. Viewet blander tydeligvis
  kilder som skriver plassering som streng (f.eks. "T12"). Schemaet for
  tidslinjen bruker derfor `nullable string`, ikke tall — kommentert i koden
  slik at ingen senere "fikser" det til et tall uten å sjekke på nytt.
- **`dg_round_sg` er en egen tabell** (ikke kolonner direkte på `dg_rounds`),
  koblet via `round_id = dg_rounds.id`. `hentDgRunderForSpiller`/
  `hentDgRunderForEvent` gjør derfor en `left join` og returnerer én flat,
  slått sammen rad (`dgRundeMedSgSchema`) — venstre-join fordi ikke alle
  runder har SG-data.
- Alle `numeric`-kolonner (SG-verdier, percentiler, snitt) kommer over
  pg-driveren som `string`, ikke `number` — håndtert med `z.coerce.number()`
  gjennomgående. Testet eksplisitt i `schemas.test.ts`.
- De 8 materialiserte viewene fantes alle med de forespurte navnene og hadde
  ingen skjulte/duplikate kolonner utover det introspeksjonen viste.

## Verifikasjon

- `npx tsc --noEmit` — grønn.
- `npx tsx --test src/lib/dashboard-data/schemas.test.ts` — 22/22 tester grønne.
- `npm run verify` — grønn (kjørt i worktree med dummy `DATABASE_URL`/`DIRECT_URL`
  kun for `prisma generate`/build, jf. gotcha "Aldri kopier `.env*` inn i en
  worktree"). Prisma-feilmeldinger i build-loggen (`User was denied access on
  the database`) er forventet støy fra dummy-credentials mot ikke-relaterte
  `public.*`-modeller under statisk sidegenerering — ikke fra denne modulen,
  og ikke noe verify-pipelinen flagget som feil (exit 0).

## Ikke i scope her (N12)

- Kobling til noen PlayerHQ/AgencyOS-skjerm.
- Fastsatt zod-schema for `tournament_results.rounds`-JSON-strukturen.
- Live DB-integrasjonstest mot faktiske `dashboard.*`-rader.
