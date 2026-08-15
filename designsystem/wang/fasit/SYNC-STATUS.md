# WANG-fasit — synkstatus

| | |
|---|---|
| Claude Design-prosjekt | `6061a53c-659e-42a9-ae34-031a69b61843` — «WANG årsplan redesign» |
| Fil | `WANG Golf - Redesign 2026.dc.html` |
| Speilet | 2026-08-15 |
| Hentet med | `DesignSync` (`get_file`) |

## Hva dette er

Speilet av årsplan-redesignet. Originalen ligger i Claude Design og vinner ved uenighet.
Speilet oppdateres når Anders leverer en ny versjon, ikke før hver skjerm.

## Forholdet til `designsystem/wang/skjermer/`

Mappa `skjermer/` er et **eldre** speil av prosjektet `3935e216` («WANG Golf — Årsplan
(redesign 2026)»), utpekt som fasit i `docs/port/plan-design-wang-arsplan.md` §B2 den
10.08.2026. Anders leverte `6061a53c` den 15.08.2026, og **den gjelder for de skjermene den
dekker**. `3935e216` er ikke slettet — den dekker skjermer (`a1-skall`, `a2-hjem`) som det
nye prosjektet ikke tar for seg.

Ved konflikt om en skjerm begge dekker: `6061a53c` vinner.

## Skjermer i denne fasiten

Alle vises i to bredder (mobil 390 · desktop 1280) og fire tilstander
(Suksess · Laster · Tom · Feil), med designnotat «slik er det i dag / slik blir det» per skjerm.

| Nøkkel | Skjerm |
|---|---|
| `plan_sesong` | Plan · Sesong — årsplanen som to spor |
| `plan_kalender` | Plan · Kalender |
| `plan_samlinger` | Plan · Samlinger |
| `skole_rute` | Skole · Skoleår |
| `skole_timeplan` | Skole · Timeplan |
| `skole_vurdering` | Skole · Vurdering |
| `foreldre` | Foreldre |
| `okt` | Økt-detalj |
| `iup` | IUP-samtale (ny skjerm) |
| `trener` | Trener · årsplan |

## Ny tabell som fasiten forutsetter

`GroupPeriodGoal` — ett fokusområde per elev per periode (akse, tittel, egentid, målemetode,
status, egenvurdering, trenervurdering). Uten den har elevsporet «Min utviklingsplan» og hele
IUP-samtalen ingen kilde.
