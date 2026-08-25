# Bølge 1 — smoke GRØNN (25.08.2026)

Manuelt testet av Anders i produksjon (`https://akgolf-hq.vercel.app`, main @ `c353e554`).

## Testet og bekreftet

| Steg | Resultat |
|---|---|
| Coach: opprett økt | Blir UTKAST |
| Coach: flytt økt | Blir liggende på ny dag |
| Coach: publiser | Blir PUBLISERT |
| Coach: legg til øvelse (Loop 2S drill-editor) | Lagres |
| Spiller: `/portal/tren/wb` | Ser KUN publisert økt — DRAFT er usynlig |
| Spiller: ser øvelsen i økta | Ja |
| Spiller: Start → Fullfør | IN_PROGRESS → COMPLETED |

Mål-smoken i `CLAUDE.md` §Nåværende spor er dermed oppfylt for alt unntatt
TrackMan-detalj (1σ-ellipse + caddie-setning + prikk → slag-ark), som er Loop 4 / B7.

## Konsekvens

Anti-scope-sperren mot bølge 2 (C1–C10) er løftet.

## Grener som kan ryddes

`release/workbench-b1` er merget (#583) og slettet. Disse er delmengder av main og
kan slettes — ikke gjort her, flere har egne worktrees stående:
`claude/agency-workbench-uke-ui-c4d2a4`, `claude/sessioninspector-drill-ui-125d70`,
`claude/workbench-rls-policies-8b054b`, `claude/workbench-actions-check-8399ef`,
`claude/natt-a1-a4-2026-08-24`, `claude/workbench-launch-plan-7503ff`,
`chore/docs-rydding-natt`.

## Kjent gjenstående i bølge 1-flatene

- Ekte «I dag» er IKKE koblet til `loadPlayerDay` — spiller må bruke `/portal/tren/wb` (B4).
- Mobil-inspector skjult under `lg` (B3).
- Kilder-panelet er tomt (B5).
