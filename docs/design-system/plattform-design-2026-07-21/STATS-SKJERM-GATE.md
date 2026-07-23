# Stats skjerm-gate (offentlig `/stats`)

Oppdatert 2026-07-22 — B-pass bølge 1.

## Mål
Offentlig stats skal på 5 sekunder vise: **hva er status** + **hva er neste steg** (én primær CTA).

## Ferdig i denne bølgen

| Skjerm | Fil | B-pass |
|---|---|---|
| Hub `/stats` | `MarkedStatsHubV2` | Status (norske i aksjon) + primær CTA |
| Spillere | `StatsSpillereV2` | Status + CTA sammenlign |
| Verktøy hub | `VerktoyHubV2` | Status + CTA score→HCP |
| Baner | `StatsBanerV2` | Status |
| Klubber | `StatsKlubberV2` | Status + CTA toppklubb |
| Turneringer | `StatsTurneringerV2` | Status |
| Norske i aksjon | `StatsNorskeV2` | Status (live) |
| Uka | `StatsUkaV2` | Status + CTA |
| PGA hub | `stats/pga/page.tsx` | Status + primær CTA |
| Felles | `stats-ramme` | `StatsStatusBar` + status på Liste/Detalj |

## Allerede V2 (TomTilstand m.m.)
Alle 45 ruter bruker StatsRamme / marketing V2 eller StatsLegacyShell.

## Neste bølge (valgfritt)
- PGA-underkategorier (drive, GIR, putt …) — egen status-linje
- Leaderboards, SG-sammenlign, quiz, wrapped, blogg, søk — samme mønster
- Erstatte hardkodede tall på hub (1175 turneringer) med live props der mulig

## Typecheck
`npx tsc --noEmit` — grønn.
