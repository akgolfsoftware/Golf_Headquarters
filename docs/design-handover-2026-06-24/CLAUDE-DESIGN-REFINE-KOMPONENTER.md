# Refine-prompt til Claude Design — komponenter 3/10 → 10/10

> **Bruk:** Lim inn i design-system-prosjektet etter at komponentene er bygget første gang. Den hever
> håndverket fra «skisse» til produksjonsgrad. Behold identiteten — dette er craft, ikke ommaling.

---

```
Komponentene er nå ca. 3/10 — for flate, generiske og upresise. Hev ALLE til 10/10. Behold identiteten (forest #005840 / lime #D1F843 / cream #FAFAF7, Inter + Inter Tight + JetBrains Mono). Dette handler om HÅNDVERK, ikke ommaling.

DE 10 TINGENE SOM SKILLER 3/10 FRA 10/10 — anvend på HVER komponent:
1. Knivskarpt hierarki. Tallet/diagnosen er den utvilsomme helten. Rekkefølge: Eyebrow (mono uppercase, muted, tracking 0.1em) → Display-tall (stort, Inter Tight, tett tracking) → kontekst (liten muted). Aldri to elementer som konkurrerer om blikket.
2. Typografi-presisjon. Eksakte størrelser fra skalaen (Display-XL 56–72 / L 36–44 / Title 20–24 / Body 14–16 / Mono-data 11–14 / Eyebrow 10–11). Display-tall med tett tracking (−0.02 til −0.04em) og italic-aksent på nøkkeltallet. ALLE tall i JetBrains Mono tabular-nums. Ingen default-fonter, ingen tilfeldige størrelser.
3. Struktur via hårfine 1px-linjer + justering — ikke bokser. Tabeller/rader/celler organiseres av hårlinjer. Maks ett kort-nivå; aldri boks-i-boks.
4. Lime KUN som signal. Maks ett lime-element i synsfeltet per komponent, på det aller viktigste (aktiv / nå / haster / fremgang). Resten forest eller nøytralt. For mye lime leses umiddelbart som amatør.
5. Dybde uten farge. Bruk nøytral-rampen (cream → paper → sand → border → #C9C6BD → muted → ink) + varm lav elevasjon (0 1px 2px / 0 2px 8px rgba(10,31,23,.04)) til å lagdele. Aldri flatt. Aldri kald grå skygge.
6. Tetthet med pust. Tett, men streng 4/8-rytme. Padding/gap fra skalaen, aldri vilkårlige px-verdier.
7. Alle fire tilstander designet med samme omhu: innhold · tom (med «neste handling») · laster (skeleton som matcher innholdets form, aldri spinner) · feil.
8. Mikro-detalj. Konsekvent radius (8/14/20/28/full). Lucide-ikoner 1.5px stroke, ens størrelse. Signert delta med farge + ▲▼. Baseline-justert tekst. Identiske dimensjoner per komponent-type.
9. Begge temaer like polert (PlayerHQ/Forelder/Marketing lyst · AgencyOS mørk + lys).
10. Piksel-presisjon. Alt på rutenett. Ingen skjeve marginer, ingen «nesten».

PER KATEGORI — det spesifikke løftet:
- Atomer (Button/Badge/Avatar/Eyebrow/Delta/BadgeShelf): knapper rounded-full pill, mono 12px bold uppercase, ens høyde (≥44px mobil). Badges stramme piller. Avatar med subtil ring, tone regelstyrt. Delta fargelagt med ▲▼.
- KPI & progresjon (KpiCard/KpiStrip/StatTile/KpiRing/MasteryRing/LevelLadder/StreakTracker): tallet dominerer kortet (display-størrelse), eyebrow over, signert delta under. Ringer med mono senter-tall, lime-bue kun for fremgang. Hårlinje mellom KPI-er i strip.
- Data-viz (SgBar/SgBreakdown/TrendBand/Sparkline/PyramidProgress/PercentileGauge/SkillRadarLive/DispersionMap/RiskHeatmap/ClubMetricGrid/HoleStrip/RoundScorecard): hårfine gridlinjer, mono akse-tall, lime/forest fyll, INGEN tunge rammer. Innsikten skal leses på 1 sekund. Pyramide med de fem akse-fargene rent.
- Kort & hero (PageHero/PhotoHero/AthleticCard/FeaturedCard/InsightCard/WellnessCard/TournamentCard): editorial display-tittel med italic-aksent, KPI-stripe, foto/forest-hero med ekte dybde. IKKE flate hvite bokser.
- Tabeller & tavler (DataTable Pro/KanbanBoard/InboxList/SettingsList): hårfine rad-skiller, mono tabular-kolonner, avatar-celle, tydelig hover-tilstand, ingen tunge cellebordere. Rad ≥md → kort <md. Kanban-kort med status-farge, ikke fylte bokser.
- Kalendere & tidslinjer (DayCal/WeekGrid/MonthGrid/YearPlanGantt/PeriodTimeline): rene rutenett organisert av hårlinjer, tette men lesbare celler, «i dag»-markering (forest-ring), aktivitet via lime-prikker/heatmap. Gantt med periode-bånd i akse-farger.

ARBEIDSMÅTE — selv-vurder og iterer:
- Etter hver komponent: gi den en karakter 1–10 mot de 10 punktene over, og skriv én linje om hva som mangler.
- Er den under 9: iterer til den er 9–10. Vis før/etter.
- IKKE lever før ALLE komponenter er ≥9. Konsistens på tvers er en del av karakteren — to komponenter som ikke deler spacing/typografi/knappestil kan ikke begge være 10.
```

---

*Mål: hver komponent skal kunne stå alene som et produksjons-eksempel. Tallet er helten, hårlinjer organiserer, lime er signal, dybde uten farge.*
