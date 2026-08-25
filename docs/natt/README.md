# Natt-plan 24–25.08.2026 (Train-lock · Workbench)

Denne mappen er **kanon for bølge 1** (A1–A4 + økt-pakke) og **bølge 2** (loop 5–14). Den superseder Paper-port-plan for Player HQ-look og Workbench-kjerne.

| Fil | Bruk |
|-----|------|
| `KOMPLETT-PLAN.md` | Rydd v1 vs greenfield, publisering, horisonter |
| `UTVIKLINGSPLAN-LANSERING.md` | A1–A4 sjekkliste |
| `OVERNIGHT-CODING-LOOP.md` | Bølge 1: loop 1–4 + 2S/2T/3S/3T |
| `OVERNIGHT-CODING-LOOP-BOLGE2.md` | Bølge 2: loop 5–14 + lim-inn |
| `LOOP-1-PROMPT.md` | **Start her i Claude Code** |
| `workbench/` | Domain, labels, actions-kontrakt, STEP-1 |

## Workbench-spec (`workbench/`)

| Fil | Innhold |
|-----|---------|
| `ACCESS-AND-GROUPS.md` | Låst tilgang + gruppe-propagasjon |
| `domain/types.ts` | Domain-typer |
| `domain/operations.ts` | Pure create/move/publish/drill/budget |
| `domain/operations.test.ts` | node:test |
| `ui/labels.ts` | Norske strenger |
| `ui/state-machine.ts` | UI reducer |
| `ui/components.md` | Komponentkontrakt |
| `store/actions.ts` | Server-action-kontrakt + Prisma-skisse |
| `integration/player-hq.md` | I dag + approval |
| `CLAUDE-CODE-PROMPT.md` | Alternativ A4-prompt |
| `STEP-1-EXECUTION.md` | Sjekkliste steg 1 |

## På Mini

```bash
git fetch origin
git checkout docs/natt-plan-2026-08-25
# eller merge PR #575 til main
```

Ny Claude-session → lim inn `docs/natt/LOOP-1-PROMPT.md`.

Repo: `akgolfsoftware/Golf_Headquarters` — ikke AKGolf2.0.
