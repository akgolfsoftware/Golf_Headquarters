# AK Golf HQ — Design System

> Last inn som «Design system» i Claude Design. Alt som bygges skal følge dette.

## Farger — lyst tema (PlayerHQ, Marketing, Forelder)

| Token | HEX | Bruk |
|---|---|---|
| background | #FAFAF7 | Side-bakgrunn |
| foreground | #0A1F17 | Primær tekst |
| card | #FFFFFF | Kort-bakgrunn |
| primary (forest) | #005840 | CTA, hovedhandling |
| primary-foreground | #D1F843 | Tekst på primary (lime) |
| accent (lime) | #D1F843 | Highlights, badges |
| accent-foreground | #005840 | Tekst på accent |
| secondary (sand) | #F1EEE5 | Chips, sekundærflater |
| muted-foreground | #5E5C57 | Sekundærtekst |
| success | #1A7D56 | OK |
| warning | #B8852A | Advarsel |
| destructive | #A32D2D | Feil / slett |
| info | #2563EB | Info |
| border | #E5E3DD | Borders |

## Farger — mørkt tema (AgencyOS, alltid `.dark`)

Speil samme paletten mørkt: dyp forest-bakgrunn, lyse kort-flater, lime som aksent, semantiske farger lysnet
for kontrast. AgencyOS er **alltid mørkt** — ingen tema-toggle.

## Typografi

| Font | Bruk |
|---|---|
| Inter | UI og brødtekst (standard) |
| Inter Tight | Display og hero (editorial italic tillatt på del av headline) |
| JetBrains Mono | KPI-tall, tabulære tall, eyebrows |

Ingen andre fonter. Ingen Instrument Serif.

## Ikoner

Kun **Lucide**. 24px, 1.5px strek, currentColor. **INGEN emoji** noe sted.

## Spacing

8pt-grid (8/16/24/32…). Unntak: data-tette flater i AgencyOS (dashboards, tabeller, timelines, innboks-rader)
kan bruke 12/14px tetthet — følg skjermbildene.

## Komponenter (gjenbruk, ikke gjenoppfinn)

Hero · FeaturedCard · KPI-strip · PyramidProgress (treningspyramide) · Eyebrow · Badge (ok/warn/urgent/lime/
primary/neutral) · Button · ActionList / QueueItem · Avatar · PulseDot · Greeting · DayCal · kalendere
(month-grid, session-scheduler, streak, day-planner, heatmap, year-plan-gantt).

## Stemning

Editorial sport-analytics. Rolig, presis. **PlayerHQ:** mer luft og fokus, mobil-først.
**AgencyOS:** høy datatetthet, desktop-først, mørkt — «Bloomberg for golf-coaching».

## Språk

All UI-tekst på norsk bokmål med æ, ø, å.
