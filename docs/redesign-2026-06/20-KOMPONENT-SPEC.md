# Komponent-bibliotek — komplett spec (data-drevet · interaktivt · gamifisert)

> Master-designer-spec for hele AK Golf HQ. Mål: vise data, kunnskap og fremgang på en måte som er **kul, interaktiv og givende** — inspirert av gamification — men med **ett konsistent språk** (hybrid: editorial-lys for spiller, terminal-mørk for coach, lime som signatur). Bygger på eksisterende ~80 komponenter (re-skinnes) + nye visninger.

## Designprinsipper for «gamification uten å bli barnslig»

1. **Elite-spill, ikke Candy Crush.** Belønning = mestring, fremgang, percentil, streak, «neste nivå» — for seriøse utøvere. Aldri pyntete maskoter eller emoji.
2. **Tallet er belønningen.** Mono-tall som teller opp, deltaer som lyser grønt, percentil som stiger. Lime = «du leverte».
3. **Bevegelse med mening.** Progresjon animeres (fyller seg, teller opp), aldri pynt-animasjon. 150–250 ms.
4. **Alltid «hva nå».** Hver visning peker mot neste handling/mål — fremgang skal føles retningsbestemt.
5. **Samme språk overalt.** En badge, en ring, en graf ser lik ut i PlayerHQ og AgencyOS (bare tema-skin skiller).

---

## 1 · Eksisterende (~80) — behold, re-skin i hybrid
Hele settet fra forrige handover beholdes som dekning og re-skinnes: KPI (KpiCard/Strip/Ring/StatTile/Sparkline/Delta/GhostNumber), kort (Athletic/Featured/Hub/Insight/Tournament/Wellness/Partner), data (DataTable/PyramidProgress/PyramidRadar/SgBar/SgTrendLine/HcpTrend/RoundScorecard/ShotMap/ClubMetricGrid/TestMatrix), kalender (Day/Week/Month/YearPlanGantt/PeriodTimeline/SessionScheduler), hero (Photo/Page/Detail), identitet/status, lister/handling, tilstander, + alle primitiver (Tabs/Modal/Drawer/Popover/Command/Sidebar/BottomNav osv.).

---

## 2 · Nye data-visninger (Notion-stil) — det vi MANGLER

| Komponent | Hva den viser | Interaksjon | Datakilde |
|---|---|---|---|
| **ViewSwitcher** | Samme datasett som Tabell / Board / Kalender / Tidslinje / Galleri / Liste | Ett klikk bytter visning, beholder filter/sort | enhver liste (planer, spillere, drills, turneringer) |
| **KanbanBoard** | Kort i kolonner per status | Dra mellom kolonner (der lov), kollaps kolonne, tell per kolonne | TrainingPlan-status, spiller-pipeline, oppgaver |
| **GalleryView** | Data som bilde-/kortrutenett | Hover-preview, tett/luftig toggle | drills, turneringer, spillere, baner |
| **DataTable Pro** | Avansert tabell | Gruppering, inline sort/filter, kolonnetyper, ekspander rad, sticky | runder, spillere, bookinger, tester |
| **EventTimeline** | Hendelser horisontalt/vertikalt | Zoom (dag/uke/sesong), klikk → detalj | aktivitet, sesong, turneringskalender |
| **HeatmapCalendar** | Aktivitet per dag, intensitetsfarge (GitHub-stil) | Hover = dagens økter, klikk → dag | TrainingSession-logg, consistency |

---

## 3 · Golf-data-viz (interaktiv — «moaten») — det datadrevne wow-et

| Komponent | Hva den viser | Interaksjon / gamification-vri | Datakilde |
|---|---|---|---|
| **SgBreakdown** | Strokes gained, drill-down kategori → kølle → slag | Klikk en bar for å bore inn; grønn over benchmark, rød under | Round (SG-felt), Shot, SgInsight |
| **DispersionMap** | Slag-spredning (scatter + ellipse) | Filtrer per kølle, animer mot mål-sone, «treff-rate» teller | TrackManShot, Shot |
| **SkillRadarLive** | Pyramide-akser nå vs mål vs forrige | Overlay-sammenligning, dra mål-punkt, «gap til mål» highlight | PyramidRadar-data, Goal |
| **TrendBand** | Trend med benchmark-bånd (PGA / Team Norway) | Hover-annotasjon, marker PB, scrub tidslinje | HcpTrend, SgTrendLine, Round |
| **HoleStrip** | Hull-for-hull, fargekodet score + SG per hull | Hover hull → slag-liste, «birdie-streak»-highlight | HoleScore, Round |
| **GappingChart** | Kølle-distanser, gap og overlapp | Dra for å se ideelt gap, flagg hull i baggen | ClubMetricTrend, EquipmentBag |
| **PuttLab** | Break/green-lesing interaktivt | Sett helning/avstand → forventet linje + make-% | break-tabell / putte-lab-data |

---

## 4 · Gamification & motivasjon — gjør det givende

| Komponent | Hva den viser | Gamification-mekanikk | Datakilde |
|---|---|---|---|
| **MasteryRing** | Mestring per ferdighet (XP-stil) | Fyller seg, «nivå opp»-puls når terskel nås | Goal, TestResultat, drill hit-rate |
| **StreakTracker** | Sammenhengende dager/uker trent | Flamme/streak-tall, «ikke bryt kjeden», milepæl-glimt | TrainingSession-logg |
| **BadgeShelf** | Oppnådde milepæler (collectibles) | Låst/ulåst, ny-badge-reveal, progresjon mot neste | milepæler avledet av data (første sub-par, 100 drills…) |
| **LevelLadder** | A–K nivå-stige (snittscore-bånd) | Visuell stige, «du er her», hva kreves for neste trinn | A–K-kategori (avventer 11 grenser), snittscore |
| **GoalProgress** | Fremdrift mot et mål | Animert fyll + milepæler underveis, ETA | Goal, SeasonPlan, PeriodBlock |
| **JourneyMap** | Utviklingsvei (roadmap som «verdenskart») | Sjekkpunkter, neste etappe lyser, låste fremtidige | TalentTracking, roadmap |
| **ChallengeCard** | Drill-utfordring: mål vs ditt resultat | «Slå din beste», belønning ved bestått, retry | DrillChallenge |
| **PersonalBest** | Highlight når noe slår rekord | Rolig, premium «PB»-øyeblikk (ingen konfetti), lime-glød | Round, Test, drill |
| **PercentileGauge** | Hvor du rangerer vs tour/kohort | Nålen stiger, «topp X %», mot neste percentil | benchmark, kohort |
| **LiveRepPulse** | Sanntids rep-/treff-teller i live-økt | Puls per logget rep, instant grønt ved treff | live-økt (TrainingSessionV2) |

---

## 5 · Kunnskap & innsikt — gjør data til forståelse

| Komponent | Hva den viser | Interaksjon | Datakilde |
|---|---|---|---|
| **InsightCard Pro** | AI-innsikt som fordøyelig «derfor»-kort | Utvid for forklaring, «handle nå»-knapp | SgInsight, Signal |
| **CoachingTip** | Liten coaching-leksjon/kunnskap | Bla-kort, «forstått»-kvittering | kunnskapsbase / AI |
| **CompareH2H** | Du vs pro/peer side ved side | Bytt motstander, akse-for-akse delta | benchmark, kohort, sammenligning |
| **GapToNext** | Hva som skiller deg fra neste nivå/mål | Konkret «3 ting»-liste avledet av data | Goal, A–K, benchmark |

---

## 6 · Coach-side (AgencyOS) — data-kontroll

| Komponent | Hva den viser | Interaksjon | Datakilde |
|---|---|---|---|
| **PlayerPipeline** | Spillere som board per status/risiko | Dra, bulk-handling, «hvem trenger meg» | User, Enrollment, aktivitet |
| **RiskHeatmap** | Stall som intensitets-rutenett (aktiv/risiko) | Klikk celle → spiller, sorter på risiko | aktivitet, plan-compliance |
| **StableMatrix** | Spillere × dimensjoner (SG/HCP/tester) | Sorter kolonne, fargeskala, drill-inn | User, Round, Test, SG |

---

## Bygge-rekkefølge (forslag)
1. **ViewSwitcher + Kanban + DataTable Pro + HeatmapCalendar** (fundamentet du mangler mest).
2. **SgBreakdown + DispersionMap + SkillRadarLive + HoleStrip** (datadrevet wow).
3. **MasteryRing + StreakTracker + BadgeShelf + GoalProgress + JourneyMap** (gamification-laget).
4. Resten etter behov per skjerm.

Alt re-bruker hybrid-tokens (lime låst), mono-tall, Lucide-ikoner, samme tilstander (tomt/laster/feil). Gamification = elite-følelse, aldri barnslig.
