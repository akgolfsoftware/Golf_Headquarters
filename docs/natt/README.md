# Natt-plan 24–25.08.2026 (Train-lock · Workbench)

> **Supersedert 30.08.2026:** `LAUNCH-PLAN-FULL-2026-08-25.md` (denne mappens plandokument) og
> `LANSERINGSPLAN-KOMPLETT-2026-08-27.md` er begge slettet — alt gjenstående arbeid derfra
> er flettet inn i `docs/MASTERPLAN-GJENSTAAENDE.md`, som nå er DEN gjeldende planen. Denne
> fila står som historikk over bølge 1/2-tankegangen, ikke som gjeldende kjøreplan.

Denne mappen var **kanon for bølge 1** (A1–A4 + økt-pakke) og **bølge 2** (loop 5–14).
Den superserte Paper-port-plan. **Design 25.08.2026 (Anders): Train-lock er fasit for ALLE
skjermer i PlayerHQ OG AgencyOS** — se CLAUDE.md invariant 2 og `.claude/rules/beslutninger.md`.

**Status og kjøreplan:** se `docs/MASTERPLAN-GJENSTAAENDE.md` (gjeldende) og `docs/STATUS-NÅ.md`
(snapshot). `LAUNCH-PLAN-FULL-2026-08-25.md` (slettet) var detaljgrunnlag for T-/C-radene —
innholdet ligger nå i masterplanen.

| Fil | Bruk |
|-----|------|
| `LAUNCH-PLAN-FULL-2026-08-25.md` | **SLETTET 30.08.2026** — var: inventory, opprydding, bølger, session-tabell. Innholdet ligger nå i `docs/MASTERPLAN-GJENSTAAENDE.md`, som er gjeldende plan. |
| `BOLGE-N-TALENTHQ-INN-2026-08-26.md` | **TalentHQ inn i PlayerHQ** — levende plan, 10 steg. Eget spor, ikke lansering |
| `LEVERANSELOGG.md` | Komprimert kvittering for hver leverte loop/rad (erstatter 24 enkelt-DONE-filer + LOOP-1-PROMPT, opprydding 27.08) |
| `KOMPLETT-PLAN.md` | Historikk — rydd v1 vs greenfield, publisering, horisonter (supersedert av LAUNCH-PLAN) |
| `UTVIKLINGSPLAN-LANSERING.md` | Historikk — A1–A4 sjekkliste (supersedert av LAUNCH-PLAN) |
| `OVERNIGHT-CODING-LOOP.md` | Historikk — ferdig brukt, ikke lim inn på nytt |
| `OVERNIGHT-CODING-LOOP-BOLGE2.md` | Bølge 2: loop 5–14 + lim-inn |
| `SKJERM-STATUS-2026-08-26.md` | Målt Train-lock-dekning per skjerm |
| `D-LYS-OG-5T-BESLUTNING.md`, `D2-TOKENS-DONE.md`, `D2-UNDERLAG-2026-08-25.md` | Design-token- og lys/mørk-beslutninger — gjelder fortsatt |
| `workbench/` | ACCESS-AND-GROUPS (gjelder), integration, store-kontrakt |

## Workbench-spec (`workbench/`)

**Koden er fasit:** domain i `src/lib/domain/workbench/`, actions i `src/lib/workbench/wb-actions.ts`.

| Fil | Innhold |
|-----|---------|
| `ACCESS-AND-GROUPS.md` | Låst tilgang + gruppe-propagasjon — **gjelder fortsatt** |
| `integration/player-hq.md` | I dag + approval |
| `store/actions.ts` | Historisk kontrakt-skisse (se header — wb-actions.ts er mønsteret) |
| `ui/components.md` | Komponentkontrakt (ikke portert 1:1) |
| `STEP-1-EXECUTION.md` | Sjekkliste steg 1 (historikk) |
| `arkiv/` | Frossen Loop 1-spec (domain, labels, state-machine) — ALDRI kilde for src/ |

## Git-tilstand (oppdatert 26.08.2026)

**Alt av bølge 1 er i `main` og live i prod** (akgolf-hq.vercel.app): Loop 1/2/2S/3S,
B2-release (#583), B3 (#584), B4 (#582). RLS er KJØRT og verifisert aktiv i prod (#593).
Smoke manuelt grønn 7/8 (TM-steget venter på B7). Design: Train-lock-tokens i kode
(#586, font #597), skallet avgjort = AX-01 (#590). Gjeldende rekkefølge:
`LAUNCH-PLAN-FULL-2026-08-25.md` §0.2. T1 (skallet) pågår på `claude/t1-agency-skall-tl`.

**B5 (kilder/drag/serie) er FERDIG BYGGET 26.08, IKKE ennå merget:** PR
[#601](https://github.com/akgolfsoftware/Golf_Headquarters/pull/601), gren
`claude/wb-b5-kilder-serie-c90b5c`. `npm run verify` + `npm test` (1619/1619) grønn.
Additiv DDL (`seriesId`/`seriesIndex`/`isTemplate` på `workbench_sessions`) er ALLEREDE
kjørt mot prod — ikke bare skrevet — så en gren som starter fra `main` uten #601 vil
mangle disse kolonnene i `schema.prisma`/generert klient selv om databasen har dem. Detalj:
`natt/LEVERANSELOGG.md`. **B6/T5/T6 (som avhenger av B5) bør branche fra en gren som
inkluderer #601**, ikke fra `main`/`release` alene, for å unngå å bygge kilder/drag/serie
på nytt.

Repo: `akgolfsoftware/Golf_Headquarters` — ikke AKGolf2.0.
