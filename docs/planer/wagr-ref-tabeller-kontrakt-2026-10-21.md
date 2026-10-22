# WAGR-referansetabellene: hva pipelines skriver (21.10.2026)

Anders 21.10: pipelines lagrer WAGR-tallene i nye tabeller i HQ-basen
(beslutninger.md §TEAM NORWAY-TRENERFLATEN BYGGES I HQ, punkt 5). HQ eier skjemaet
(`prisma/schema.prisma`, modellene `WagrRef*`) og laget tabellene med
`scripts/add-wagr-ref-tabeller-2026-10-21.ts` (kjørt 21.10, RLS på alle fire).
Referanse › WAGR (`/team-norway/referanse`) leser dem og viser «—» til de er fylt.

Pipelines (`ak-golf-pipelines`, ukejobben `wagr-ref.yml` torsdag 06:00 UTC, beslutninger.md §WAGR-REFERANSEN OPPDATERES HVER UKE) skriver fra de samme kildene som
teamnorwayref (`pipelines/wagr_profiler`, konfig `konfig-teamnorwayref.json`).
Ingen kolonner legges til fra pipelines-siden.

| Tabell | Én rad per | Fra profil-JSON |
|---|---|---|
| `wagr_ref_groups` | gruppe med `inn`-fil (junior, amator, norge) | `id`, `navn` → `name`, `tittel` → `title`, `utvalg` → `selection`, `kjonn` → `gender`, `kun_aar` → `onlyYear`, rekkefølgen i konfig → `sortOrder`, rankinguka → `wagrDate` |
| `wagr_ref_players` | spiller (`wagr_id`) | `navn` → `name`, `land` → `country`, `kjonn` → `gender`, `wagr_plass` → `rank`, `snitt_poeng` → `pointsAvg`, `divisor`, `beste_plass` → `bestRank`, `seire` → `wins`, `wagr_aarsslutt` → `yearEndRanks`, `aar` → `yearStats`, rankinguka → `wagrDate` |
| `wagr_ref_group_members` | spiller i gruppe | gruppe-id, `wagr_id`, `nivaa[navn]` → `level`, rekkefølgen i fila → `sortOrder` |
| `wagr_ref_results` | spiller og turnering (`event_id`) | `navn` → `name`, `aar` → `year`, `uke` → `week`, `dato` → `date`, `land` → `country`, `by` → `city`, `plassering` → `finish`, `power`, `poeng` → `points`, `type` → `eventType`, `format`, `runder` → `rounds`, `felt` → `fieldSize`, `wagr_foer` → `rankBefore`, `wagr_etter` → `rankAfter` |

Regler:

- Skriv i én transaksjon per kjøring: oppdater (upsert) spillere og resultater, og bytt
  ut medlemslistene for gruppene som er med. Spillere som ikke lenger er i noen gruppe kan stå.
- `id` i `wagr_ref_results` er tekst; bruk f.eks. `"<wagr_id>-<event_id>"`.
- Mangler et tall, skriv `null`. Aldri 0 eller et anslag.
- «Alle norske», «HCP Norge» og «Norsk golf» er ikke med her. De bygges i egne steg
  (punkt 4 i §TEAM NORWAY ER BARE FOR TRENERE).

Ferdig når en lesespørring mot `wagr_ref_players` gir samme plass og årsslutt som
teamnorwayref for samme uke, og `/team-norway/referanse` viser dem med kilde og dato.
