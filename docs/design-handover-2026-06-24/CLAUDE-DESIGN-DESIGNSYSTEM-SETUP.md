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

KOMPONENTER (bygg ALLE — dette er den EKTE katalogen fra design-systemet, ~57 komponenter + tillegg under. 100 % komplett, lyst OG mørkt tema):

A · Atomer & grunnelementer
- Button (lime/forest/ghost, rounded-full pill, mono 12px bold uppercase, ≥44px mobil)
- Badge · BadgeShelf (rad av badges/utmerkelser)
- Avatar (initialer/foto, tone regelstyrt: lime = aktiv i dag)
- Eyebrow (mono uppercase muted, tracking 0.1em)
- Delta (signert ▲▼-tall med farge) · GhostNumber (stort dempet bakgrunns-tall)
- ViewSwitcher (bytter liste/kanban/kalender) · StatusPill · Chip/FilterPill · Toggle · PulseDot · SearchField (⌘K-hint)
- EmptyState (med «neste handling») · Skeleton (puls, aldri spinner)

B · Hero & kort
- PageHero · PhotoHero (foto + greeting Inter Tight italic + KPI-stripe + tier-pill) · DetailHero
- AthleticCard (grunn-kort, AK-DNA) · FeaturedCard · HubCard (inngang til underseksjon) · InsightCard
- WellnessCard (søvn/hvilepuls/HRV) · TournamentCard · ShareCard (delbar resultat-grafikk) · AuthCard

C · KPI & progresjon
- KpiCard · KpiStrip (tett rad med flere KPI) · StatTile · KpiRing · MasteryRing (sirkulær ferdighet)
- GoalProgress (mål-fremdrift) · PersonalBest (rekord-kort) · LevelLadder (A–K nivå-stige) · StreakTracker (dager på rad)

D · Data-viz / stats (golf-spesifikt — ALLE visninger)
- SgBar · SgBreakdown (strokes-gained nedbrytning per område)
- Sparkline · TrendBand (HCP-/SG-utvikling over tid)
- PyramidProgress (5-akse: Fysisk/Teknisk/Golfslag/Spill/Turnering)
- PercentileGauge (persentil vs pro/Tour) · SkillRadarLive (radar, flere akser)
- DispersionMap (slag-spredning/treffbilde) · RiskHeatmap (risiko per kategori/tid)
- StableMatrix · TestMatrix (test-resultater i rutenett) · ClubMetricGrid (metrikk per kølle)
- HoleStrip (hull-for-hull-stripe) · RoundScorecard (scorekort) · JourneyMap (utviklingsreise)
- PlayerPipeline (stall-pipeline/kohort) · LiveRepPulse (live økt-/rep-puls)

E · Tabeller, lister & tavler
- DataTable Pro (tett tabell, hårfine rad-skiller, mono tabular, avatar-celle; rad ≥md → kort <md)
- KanbanBoard (TODO/DOING/BLOKKERT/DONE) · InboxList (innboks-rader) · SettingsList (innstillings-rader)

F · Kalendere & tidslinjer (ALLE visninger)
- DayCal (dag) · WeekGrid (uke) · MonthGrid (måned) · YearPlanGantt (årsplan/perioder)
- PeriodTimeline (periode-/fase-tidslinje) · ItineraryRow (tid + tittel + meta + varighet)

G · Kommunikasjon, kø & flyt
- MessageThread (chat-bobler meg vs coach) · QueueItem («hvem trenger meg nå»: avatar + grunn + status + delta)
- WizardShell (onboarding-stepper) · CommandPalette (⌘K) · Sidebar + BottomNav + SubNav/Tabs + CockpitTabBar

Tillegg (fra manifestet): 24 sammensatte «cards» + 12 startpunkter (hele skjermer) bygges av komponentene over. Hver komponent i lyst OG mørkt tema, identisk på tvers av skjermer. Forest = primærhandling, lime kun som signal, mono på alle tall, hårfine linjer organiserer.
```

---

*Etter at design systemet er satt opp: lim master-prompten (`CLAUDE-DESIGN-PROMPT-V2.md`) inn i skjerm-prosjektet ditt, og be om skjermer per pulje (`CLAUDE-DESIGN-PULJER.md`). Da bygges skjermene av disse byggeklossene.*
