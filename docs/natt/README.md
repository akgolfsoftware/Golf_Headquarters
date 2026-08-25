# Natt-plan 24–25.08.2026 (Train-lock · Workbench)

Denne mappen er **kanon for bølge 1** (A1–A4 + økt-pakke) og **bølge 2** (loop 5–14).
Den superseder Paper-port-plan. **Design 25.08.2026 (Anders): Train-lock er fasit for ALLE
skjermer i PlayerHQ OG AgencyOS** — se CLAUDE.md invariant 2 og `.claude/rules/beslutninger.md`.

**Status og kjøreplan: `LAUNCH-PLAN-FULL-2026-08-25.md` — start der.**

| Fil | Bruk |
|-----|------|
| `LAUNCH-PLAN-FULL-2026-08-25.md` | **Gjeldende plan**: inventory, opprydding, bølger, session-tabell |
| `KOMPLETT-PLAN.md` | Rydd v1 vs greenfield, publisering, horisonter |
| `UTVIKLINGSPLAN-LANSERING.md` | A1–A4 sjekkliste |
| `OVERNIGHT-CODING-LOOP.md` | Bølge 1: loop 1–4 + 2S/2T/3S/3T |
| `OVERNIGHT-CODING-LOOP-BOLGE2.md` | Bølge 2: loop 5–14 + lim-inn |
| `LOOP-1-PROMPT.md` | FERDIG BRUKT — historikk, ikke lim inn på nytt |
| `LOOP-*-DONE.md` | Leveranserapporter per loop |
| `workbench/` | ACCESS (gjelder), integration, store-kontrakt; `arkiv/` = frossen spec |

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

## Git-tilstand (25.08.2026)

Loop 1+2+3S ligger på `claude/agency-workbench-uke-ui-c4d2a4`-linjen, Loop 2S på PR #577,
RLS-kode (ukjørt) på `claude/workbench-rls-policies-8b054b`. Samles i release-gren per
LAUNCH-PLAN session B2. PR #575 er superseded. Ingenting er merget til main.

Repo: `akgolfsoftware/Golf_Headquarters` — ikke AKGolf2.0.
