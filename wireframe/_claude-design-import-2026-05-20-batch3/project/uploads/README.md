# Claude Design — Workbench prompts

3 filer å bruke i Claude Design for å generere PlayerHQ workbench + Live Session Logger.

## Slik bruker du dem (rekkefølge er VIKTIG)

### Steg 1: Last inn design-systemet

Åpne en ny chat i Claude Design. Lim inn HELE innholdet i `00-design.md`. Claude svarer:
> "AK Golf design system loaded. Klar for skjerm-prompt."

### Steg 2: Generer Workbench-skjermen

Når design-systemet er lastet, lim inn HELE `01-prompt-workbench-unified.md`. Claude genererer én komplett HTML-fil med:
- 220px Linear sidebar (PlayerHQ, Markus R.P.)
- Topbar med ⌘K + breadcrumb
- 7 vertikale seksjoner: Hero · Årsplan-Gantt · 3-pane workbench · Mål-tracker-rad · Insight-strip · TrackMan-timeline · Sticky footer

### Steg 3: Generer Live Session Logger

I en NY chat (ikke samme som steg 2). Lim inn `00-design.md` igjen. Vent på bekreftelse. Så lim inn `02-prompt-live-session-logger.md`. Claude genererer iPhone-mockup med:
- Venstre frame: aktiv drill + sett-tabell + shortcut-rad
- Høyre frame: "1-og-1"-modus med pulserende sirkel

## Filer

| Fil | Bruk |
|---|---|
| `00-design.md` | Design system (limes inn FØRST i hver Claude Design-session) |
| `01-prompt-workbench-unified.md` | Genererer workbench-skjermen (desktop 1600×variabel) |
| `02-prompt-live-session-logger.md` | Genererer Live Session Logger (mobile, 2 iPhone-frames) |

## Hva du får

To HTML-filer som du kan:
- Åpne direkte i nettleser
- Ta screenshots av
- Vise på iPhone via Drive
- Lime inn i Cursor/Claude Code for å konvertere til React-komponenter

## Hvis Claude Design ikke følger design-systemet

Hvis output bruker feil farger, feil fonter, eller emojier — påminn med:
> "Du brøt design-systemet på [konkret eksempel]. Følg `00-design.md` strengt."

## Hvis Claude Design ikke vil generere

Hvis Claude Design avviser pga. lengde, del opp prompten i seksjoner:
- Først: bare sidebar + topbar + hero
- Så: legg til Gantt
- Så: legg til 3-pane
- Etc.

## Spec-kilde

Disse prompts er destillert fra design-specs i akgolf-hq-repoet:
- `docs/superpowers/specs/2026-05-19-workbench-unified-design.md`
- `docs/superpowers/specs/2026-05-19-live-session-logger-design.md`

Hvis du endrer brand eller layout — oppdater spec FØRST, så reflekter endringene i `00-design.md`.
