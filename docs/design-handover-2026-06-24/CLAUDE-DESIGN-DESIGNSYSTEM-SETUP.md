# Design-system-oppsett for Claude Design — AK Golf HQ

> **Bruk:** Opprett et NYTT design-system-prosjekt i Claude Design (atskilt fra skjerm-prosjektet ditt).
> Lim inn blokken under. Da bygger Claude Design tokens + komponenter som gjenbrukbare byggeklosser,
> og fremtidige skjerm-design arver dem automatisk. (Erstatter ikke skjermene dine — lever ved siden av.)

---

```
Opprett et design system for AK Golf HQ — en data-tett golf-coaching-plattform. Definer tokens + gjenbrukbare komponenter i lyst OG mørkt tema, så hver fremtidig skjerm arver dem og blir konsekvent.

TOKENS
Farger: cream #FAFAF7 (base, aldri ren hvit) · paper #FFFFFF (kort) · sand #F1EEE5 · border #E5E3DD · #C9C6BD (sterkere skille) · muted #5E5C57 · ink #0A1F17 (tekst) · forest #005840 (merke/primær) · lime #D1F843 (signal). Status: ok #1A7D56 · warn #B8852A · urgent #A32D2D · info #2563EB. Pyramide-akser: Fysisk forest · Teknisk warn · Golfslag info · Spill lime · Turnering urgent.
Type: Inter (UI/brødtekst) · Inter Tight (display/hero, tett tracking, italic-aksent) · JetBrains Mono (ALLE tall/eyebrows/KPI, tabular-nums). Skala: Display-XL 56–72 · Display-L 36–44 · Title 20–24 · Body 14–16 (line-height 1.5) · Caption 12–13 · Mono-data 11–14 · Eyebrow 10–11 uppercase tracking 0.1em.
Nøytral-rampe (dybde uten farge): cream → paper → sand → border → #C9C6BD → muted → ink.
Elevasjon (varm, lav): hvile = kun hårlinje · kort = 0 1px 2px rgba(10,31,23,.04), 0 2px 8px rgba(10,31,23,.04) · overlay = 0 8px 24px rgba(10,31,23,.10). Aldri kald grå skygge.
Spacing: 8pt-grid (8/16/24/32/48/64), data-tett 12/14. Radius: 8/14/20/28/full (knapper helt runde). Hårfine 1px-linjer organiserer rader/celler — ikke bokser overalt.
Regler: lime kun som signal (ALDRI lime tekst på lys bakgrunn — mørk tekst på lime). Tallet er helten. Tett men organisert. Kun Lucide-ikoner (1,5px). Ingen emoji. Tema: PlayerHQ lyst · AgencyOS mørk «terminal» + lys-toggle · Forelder/Marketing lyst.

KOMPONENTER (bygg ALLE som gjenbrukbare, lyst + mørkt — dette skal være 100 % komplett):

A · Grunnelementer
- Button (lime / forest / ghost, rounded-full pill, mono 12px bold uppercase, ≥44px på mobil)
- Badge (ok / warn / urgent / lime / primary / neutral)
- StatusPill (status + farget prikk: lime = aktiv/nå, urgent = haster)
- Eyebrow (mono uppercase, muted, tracking 0.1em)
- Avatar (initialer/foto, sirkel, tone regelstyrt: lime = aktiv i dag)
- Chip / FilterPill (filtrering med valgt-tilstand)
- Toggle (av/på) · SegmentedControl (2–4 valg, f.eks. liste/kanban/kalender)
- PulseDot (live-indikator) · SearchField (med ⌘K-hint)

B · Kort & blokker
- KpiCard (eyebrow + stort mono-tall + signert delta ▲▼, hårlinje-skille)
- Hero / PhotoHero (greeting Inter Tight italic + KPI-stripe + tier-pill)
- FeaturedCard · InsightCard
- DiagnoseCard (nivå + 2–3 gap-punkter rangert etter slag-gevinst)
- CoachInsightCard (avatar + ukes-fokus + CTA-rad)
- EmptyState (med «neste handling») + Skeleton (puls, matcher innholdsform — aldri spinner)

C · Data-viz (ALLE mulige visninger av stats/data)
- SgBar (strokes-gained per område, lime fyll + mono verdi)
- PyramidProgress (5-akse: Fysisk/Teknisk/Golfslag/Spill/Turnering med akse-fargene)
- KpiRing / MasteryRing (sirkulær progress, mono senter-tall)
- TrendChart / Sparkline (HCP- og SG-utvikling, hårfine gridlinjer)
- BarChart · AreaChart
- RadarChart (talent-radar, flere akser)
- BenchmarkBar (persentil vs pro / Tour-snitt)
- Heatmap (intensitet over tid/kategori)
- Distribution / Histogram (spredning)
- StreakTracker (dager på rad)
- StatStrip / Ticker (tett rad med mono-nøkkeltall + delta)

D · Tabeller & tavler
- StatTable (tett, hårfine rad-skiller, mono tabular, avatar-celle; rad ≥md → kort <md)
- KanbanBoard (kolonner TODO/DOING/BLOKKERT/DONE, kort med status)
- ListView (rad-liste med høyre-justert metrikk)

E · Kalendere (ALLE visninger)
- DayView (dag-planlegger, time-rader)
- WeekView (uke-rutenett)
- MonthGrid (måned)
- YearGantt (årsplan, perioder over måneder)
- HeatmapCalendar (aktivitet per dag)
- StreakCalendar (siste N dager, fylt/tom)
- SessionScheduler (book/tildel økt i tid)

F · Tidslinjer
- DayTimeline (dagens økter, tids-prikker)
- SessionTimeline (økt-struktur: oppvarming → hovedfase → avslutning)
- EventTimeline (kommende hendelser med prikker)
- ItineraryRow (tid + tittel + meta + varighet)

G · Navigasjon
- Sidebar (gruppert, desktop) + BottomNav (mobil, 5 seksjoner)
- SubNav / Tabs (fane-rad) · CockpitTabBar (AgencyOS dashboard-faner)
- CommandPalette (⌘K, søk + hurtighandlinger)

H · Kommunikasjon & kø
- MessageThread (chat-bobler, meg vs coach)
- QueueItem («hvem trenger meg nå»: avatar + grunn + status + delta)
- ActionList / NotificationRow (varsler med ikon + status)

Hver komponent bygges i lyst OG mørkt tema og skal se IDENTISK ut på tvers av alle skjermer — det er det som gir konsistens. Forest = primærhandling, lime kun som signal, mono på alle tall, hårfine linjer organiserer.
```

---

*Etter at design systemet er satt opp: lim master-prompten (`CLAUDE-DESIGN-PROMPT-V2.md`) inn i skjerm-prosjektet ditt, og be om skjermer per pulje (`CLAUDE-DESIGN-PULJER.md`). Da bygges skjermene av disse byggeklossene.*
