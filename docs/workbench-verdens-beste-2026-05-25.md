# Workbench: Verdens beste treningsplanlegger for golf

**Komplett review av PlayerHQ + CoachHQ workbench — 2026-05-25**

> **Premiss:** Vi ønsker at AK Golf HQ skal være verdens beste treningsplanlegger for golf — ikke "én av flere". Det krever å overgå hver eneste konkurrent på minst ÉN dimensjon, og være på nivå med alle på resten.

---

## Del 1 — Hva vi har i dag

### 1.1 PlayerHQ Workbench (`/portal`)

**Eksisterende:**
- Hero med profilbilde (PlayerHero)
- "Dagens fokus"-kort (statisk for nå)
- Snarveier til hubs (planlegge / gjennomføre / analysere / coach / talent / meg)
- Sidebar-navigering

**Planlagt (fra hand-off bundle):**
- Erstatte "Dagens fokus" med horisontal dagskalender (05:00–24:00)
- "NÅ"-tidsmarkør
- 5 fargekodede øktblokker (FYS/TEK/SLAG/SPILL/TURN)
- Hover-popover med drill-innhold + handlinger
- Fortid-økter nedtonet

### 1.2 CoachHQ Workbench (`/admin/agencyos`)

**Eksisterende:**
- 5 tabs: I dag · Uka · Spillere · Økonomi · Caddie
- Daglig brief-agent
- Pyramide-snitt på lag
- KPI-rad med spillerantall, økonomi, etc.
- Caddie-chat (AI-assistent)

### 1.3 Underliggende systemer (hva som støtter Workbench)

**Implementert:**
- HubFrame for hubs (12 stk)
- DetailShell for detalj-sider
- FullScreenTemplate for live-økt + test
- Domain-logikk: HCP, SG, CS, pyramide-vekting, plan-effektivitet
- 25 notifikasjons-triggere
- Global søk (⌘K)
- Cookie-banner + GDPR
- Auth med roller (SPILLER/COACH/ADMIN/FORELDER)
- Prisma + Supabase + Resend + Stripe
- Booking-system
- 11 duplikat-sider slettet (Dagens beta-prep)
- Mobile-responsive på 130+ sider (Dagens beta-prep)

**Mangler/uferdig:**
- FYS-plan modul (Prisma-schema staget, kode ikke skrevet)
- AI-agent-trening (spec ferdig, ikke implementert)
- Recurring events (RRULE)
- Drag-and-drop kalender
- Treningssamlinger
- WANG-program-tilknytning

---

## Del 2 — Konkurranse-landskap: 10 verdens-ledere

### 2.1 DECADE Golf (Scott Fawcett)
**Hva de gjør best:** Statistisk strategi for course management. Lærer hva slag som er optimalt på hver hull.
**Mangler:** Trenings-planlegging, AI, coaching-flyt.
**Vår fordel:** Vi har coaching + trening, ikke kun strategi.

### 2.2 TrackMan Performance Studio
**Hva de gjør best:** Radar-data, biomechanics, swing-analyse i sanntid.
**Mangler:** Trenings-plan, sosial, AI-assistent.
**Vår fordel:** Bruk TrackMan som DATA-KILDE, ikke som hovedprodukt.

### 2.3 Arccos Golf
**Hva de gjør best:** Auto-shot-tracking via sensor i kølle-grip. SG-data per kølle.
**Mangler:** Coaching, plan, trening.
**Vår fordel:** Integrere Arccos-data → ekte SG i analysere-hub.

### 2.4 18Birdies
**Hva de gjør best:** Sosial app, score-tracking, GPS, leaderboards.
**Mangler:** Coaching, dybde-data, AI, plan-system.
**Vår fordel:** Vi har dypde + coaching, de er overflate.

### 2.5 Shot Scope
**Hva de gjør best:** GPS + auto-tracking + analytics. Rimelig pris.
**Mangler:** Coaching, AI, trenings-plan.
**Vår fordel:** Bruk deres data, ikke konkurrer på hardware.

### 2.6 Hudl
**Hva de gjør best:** Video-analyse for sport. PGA-coacher bruker det.
**Mangler:** Golf-spesifikt, plan-system, AI.
**Vår fordel:** Vi kan bygge golf-Hudl med AI-assistert video.

### 2.7 GolfLogix / Golfshot
**Hva de gjør best:** GPS + scoring + statistics.
**Mangler:** Coaching, AI, plan.
**Vår fordel:** Vi går mye dypere på utvikling.

### 2.8 Whoop
**Hva de gjør best:** Recovery-tracking (HRV, søvn, strain). Brukes av PGA-spillere.
**Mangler:** Golf-spesifikt, plan-integrasjon.
**Vår fordel:** Bruk Whoop-data → tilpass plan-intensitet.

### 2.9 Strava
**Hva de gjør best:** Trenings-community. Følger venner, kudos, leaderboards.
**Mangler:** Golf-spesifikt, AI-coaching.
**Vår fordel:** Bygg "Strava for golf" innenfor akademi.

### 2.10 TPI (Titleist Performance Institute)
**Hva de gjør best:** Physical screening, golf-spesifikk fysisk vurdering, protokoller.
**Mangler:** Software-plattform, AI, sosial.
**Vår fordel:** Integrere TPI-screen som onboarding → personalisert FYS-plan.

---

## Del 3 — Hvor AK Golf HQ allerede er overlegen

1. **Pyramide-modell** (FYS/TEK/SLAG/SPILL/TURN) — proprietær metodologi
2. **Mac O'Grady-fundament** — coaching-filosofi fra én av historiens beste lærere
3. **AK Golf-taksonomi** — strukturert kunnskaps-arkiv
4. **NGF-integrasjon** — norsk kontekst, lokale baner, lokal handicap
5. **WAGR + DataGolf-integrasjon** — verdens-data
6. **Live-økt-modus** — fullskjerm utførelse (tablet-optimalisert)
7. **AI-agenter** — Caddie + plan-agent + vinn-tilbake (designet)
8. **Coach-spiller-link** — coach-godkjennings-flyter
9. **Foreldreportal** — for ungdoms-spillere
10. **WANG-toppidrett-integrasjon** — eksklusiv tilgang til norsk talentdatabase
11. **Norsk språk** + lokal coaching-kultur
12. **Holistisk plattform** — booking + plan + analyse + coaching i ett (ikke 6 apper)

---

## Del 4 — De 40 features som ville gjøre AK Golf HQ til verdens beste

### Gruppe A — Data-innhenting (8 features)

1. **Auto-import fra Garmin/Apple Watch** — HRV, søvn, energi, hjertefrekvens
2. **TrackMan live-integrasjon** — radar-data direkte til plattform under økt
3. **Arccos shot-tracking import** — automatisk SG-data per slag
4. **Apple Health / Google Fit** — wellness-data i én sync
5. **Weather API** — vind, temperatur, fuktighet inn i SG-justering
6. **Course data** (Golfbox + NGF-courses) — alle banehjelp + hull-detaljer
7. **Equipment-tracking** — kølle-statistikk per kølle (lengde, accuracy)
8. **Video-opplasting** — spilleren laster opp swing for coach-review

### Gruppe B — AI / Analytics (12 features)

9. **Pattern recognition** på swing-data (TrackMan + video)
10. **Predictive HCP-projeksjon** (basert på trening + alder + erfaring)
11. **Skadeforebyggende ML** (HRV + smerte-logg + treningsbelastning → flagg)
12. **Performance peaking-predictor** (når skal jeg peake til Sørlandsåpent?)
13. **Mental-state-tracking** (humør før/etter økt, mestrings-følelse)
14. **Sleep-quality vs performance-korrelasjon** (hvor mye må jeg sove før turnering?)
15. **Weather-justering av SG** (rettferdig sammenligning på tvers av runder)
16. **AI-assistert plan-revisjon** (under turnering: "Du spilte over par på dag 1 — endre fokus til putt for dag 2")
17. **Drill-effektivitet på person-nivå** (hvilke drills funker for meg historisk)
18. **Kohort-analyse** (sammenligning med "samme alder + nivå"-spillere)
19. **Pacing-anbefaling under runde** (hold rytme, ikke speed up etter dårlig hull)
20. **Personalisert pre-shot routine** (basert på spillerens psykologiske profil)

### Gruppe C — Sosiale features (6 features)

21. **Trene sammen** (delte økter — pågående backlog)
22. **Mentor-mentee-system** (eldre spiller hjelper yngre)
23. **Akademi-feed** (sosial feed innenfor klubb — som Strava)
24. **Challenge-leaderboards** (spillere konkurrerer i utfordringer)
25. **Coach-team-koordinering** (flere coacher per spiller — hovedcoach + spesialister)
26. **Live-streaming av økt til coach** (for ekstern/fjern-coaching)

### Gruppe D — Visualisering (5 features)

27. **3D-bane-visualisering** for course management
28. **Heat-maps** (hvor på banen er svakheter)
29. **SG-radar-charter** (visuelle 4-akser-diagrammer)
30. **Time-lapse av HCP-utvikling** (animasjon over år)
31. **AR-drill-instruksjoner** (kamera + overlay viser hvor stå, hvordan svinge)

### Gruppe E — Onboarding (4 features)

32. **TPI-screen** integrasjon (fysisk vurdering ved oppstart)
33. **Personality-assessment** (DISC eller Big Five for mental profile)
34. **BSMART goal-setting-wizard** (psykologisk framework)
35. **Mentor-matching ved start** (kobles til eldre spiller i akademi)

### Gruppe F — Recovery + wellness (5 features)

36. **HRV-basert recovery-anbefaling** (etter HR-data fra wearable)
37. **Søvn-tracker** (auto-import fra Apple Health)
38. **Stress-monitorering** (HRV-volatilitet)
39. **Ernærings-tracker** (basic: protein, karbo, hydrering)
40. **Mindfulness-protokoller** (Headspace-style 5-10 min sessions)

---

## Del 5 — De 10 features med størst impact

Ranket etter "impact for effort":

| # | Feature | Impact | Effort | Begrunnelse |
|---|---|---|---|---|
| 1 | **Auto-data-import** (Garmin/Apple/TrackMan/Arccos) | Massiv | 2-3 uker | Spillerne slipper manuell logging — automatisk ekte data |
| 2 | **AI swing-pattern-analyse** (video) | Massiv | 4-6 uker | Demokratiserer coaching — alle får ekspert-tilbakemelding |
| 3 | **Skadeforebyggende ML** | Stor | 2-3 uker | Reduserer skader 30-50 % når data finnes |
| 4 | **Performance peaking** | Stor | 1-2 uker | Direkte påvirkning på turneringsresultater |
| 5 | **Trene sammen** | Stor | 1 uke | Motivasjon + retention |
| 6 | **3D bane-visualisering + course management** | Stor | 3-4 uker | Strategi-fordel ingen norske apper har |
| 7 | **SG-radar-charter** med AI-tolkning | Middels | 1 uke | Visuell + intuitive innsikt |
| 8 | **TPI-screen** ved onboarding | Stor | 2 uker | Fra dag 1: vet hva spilleren trenger |
| 9 | **HRV recovery** (wearables) | Middels | 1 uke | Forhindrer overtrening |
| 10 | **Mentor-matching** | Middels | 2 uker | Sosial bonding + retention |

---

## Del 6 — Konkrete arkitektur-anbefalinger

### 6.1 PlayerHQ Workbench (verdens beste versjon)

**Layout (mobile + desktop):**

```
┌──────────────────────────────────────────────────────────────┐
│ HERO                                                          │
│ ┌──────┐  Hei, Markus  ▼                                      │
│ │ AVA  │  A1 · HCP -2.1 (↗ +0.3) · 21 dager til Sørlandsåpent │
│ │ +PRO │                                                       │
│ └──────┘  Energi: 7/10 · Søvn: 8.2t · HRV: 67 (↗)             │
├──────────────────────────────────────────────────────────────┤
│ I DAG (horisontal kalender)                                   │
│ 06 — 09 — 12 — 14 — 17 — 20                                   │
│       NÅ   [TEK·90min·GFGK]  [FYS·45min]                      │
├──────────────────────────────────────────────────────────────┤
│ AI-INNSIKT                                                    │
│ 🤖 Du har trent 2 ganger TEK denne uka. SG-PUTT er -1.4       │
│    siste 5 runder. Foreslår: Gate-drill 50cm i morgen 08:00.  │
├──────────────────────────────────────────────────────────────┤
│ UKAS PROGRESJON                                               │
│ Pyramide-vekting: ████░░ TEK 60% (mål 30%)                    │
│                   ██░░░░ FYS 20% (mål 30%)                    │
│                   ██░░░░ SLAG 20% (mål 25%)                   │
│ Anbefaling: Mer FYS + SLAG denne uka                          │
├──────────────────────────────────────────────────────────────┤
│ SNARVEIER                                                     │
│ [Logg runde] [Start økt] [Be om coach] [Last opp video]       │
├──────────────────────────────────────────────────────────────┤
│ TRENINGSKOMPISER                                              │
│ Tobias · I dag 14:00 SLAG (vil du joine?)                    │
│ Markus L. · I morgen 09:00 FYS                                │
└──────────────────────────────────────────────────────────────┘
```

### 6.2 CoachHQ Workbench (verdens beste versjon)

```
┌──────────────────────────────────────────────────────────────┐
│ DAGENS BRIEF (AI-generert kl 06:00)                           │
│ 3 spillere har økter i dag. 1 mangler bekreftelse.            │
│ Markus R.P. fullførte TEK-økt med SG-OTT -0.4 (forventet 0)   │
│ — sjekk swing-video lastet opp 22:14.                         │
│ Sofie hopper over FYS for 3. uke — vurder samtale.            │
├──────────────────────────────────────────────────────────────┤
│ STALL-PYRAMIDE (snitt) — Q2                                   │
│ FYS ████░░ 35% · TEK █████░ 45% · SLAG ██░░░ 12%              │
│ Trend siste 30d: FYS↓, TEK↑, SLAG↓                            │
├──────────────────────────────────────────────────────────────┤
│ AKTIVE BLAFFER                                                │
│ • Markus R.P.: SG-PUTT -1.6 (akutt) — foreslå 4 ukers fokus   │
│ • Tobias: Sleep 5.8t/natt (↓) — risk for overtrening          │
│ • Sofie: HRV-fall 14% denne uka — vurder lett uke             │
├──────────────────────────────────────────────────────────────┤
│ UKA — KOMMENDE TURNERINGER                                    │
│ Sørlandsåpent (28. mai) — 4 spillere: Markus, Tobias, ...     │
│ NM Mid-Amateur (15. juni) — 2 spillere: Anders, Sofie          │
├──────────────────────────────────────────────────────────────┤
│ CADDIE-CHAT                                                    │
│ "Hvilke spillere bør jeg ringe i dag?"                        │
│ [chat-input]                                                  │
└──────────────────────────────────────────────────────────────┘
```

### 6.3 Data-arkitektur for å støtte dette

**Nye Prisma-modeller:**
- `WearableSync` (Garmin/Apple/Whoop)
- `WeatherData` per runde
- `EquipmentUsage` per slag
- `VideoUpload` med AI-analyse-resultat
- `MentalState` daglig logg
- `Trinity` (mind+body+game state)
- `MentorMatch` (kobling)
- `AcademyFeed` (sosial)

**Nye AI-tjenester:**
- `SwingAnalyzer` (video → biomechanics)
- `RecoveryAdvisor` (HRV+sleep → plan-justering)
- `PerformancePredictor` (HCP, peaking)
- `SocialMatcher` (mentor-matching)

---

## Del 7 — 90-dagers roadmap (fra "god app" til "verdens beste")

### Måned 1 (juni 2026) — Foundation
**Mål:** FYS-plan v2, egen-test/challenge, trene-sammen, AI coach-trening start.

- Uke 1: FYS-plan v2 (med 10 forbedringer fra backlog)
- Uke 2: Egen-test + egen-challenge
- Uke 3: Trene sammen-feature
- Uke 4: ak-second-brain pgvector + Caddie-trening start

### Måned 2 (juli 2026) — Data-integrasjon
**Mål:** Garmin/Apple/TrackMan/Arccos-import, weather, course data.

- Uke 5: Garmin + Apple Health integrasjon
- Uke 6: TrackMan live + Arccos import
- Uke 7: Weather API + course data (Golfbox)
- Uke 8: Auto-data → analyse-hub

### Måned 3 (august 2026) — AI + visualisering
**Mål:** AI swing-analyse, skadeforebyggende, 3D-bane, SG-radar.

- Uke 9-10: AI swing-pattern-analyse (video upload)
- Uke 11: Skadeforebyggende ML + performance peaking
- Uke 12: 3D bane-visualisering + heat-maps + SG-radar

**Etter 90 dager:** AK Golf HQ har 30+ features ingen konkurrent har samlet. Vi er ikke "ny app" — vi er ny standard.

---

## Del 8 — Hvordan måle "verdens beste"?

### 8.1 Spillerresultater
- Snitt HCP-fall per spiller per år > 1.5 strokes
- Snitt SG-forbedring > 0.5 per kategori per år
- Turneringsresultater (top-10-andel)

### 8.2 Plattform-bruk
- Daily active users > 80 %
- Økt-fullføringsrate > 90 %
- AI-forslag aksept-rate > 70 %
- Mobile-andel > 60 %

### 8.3 Konkurranseanalyse
- Hvilke features har vi som konkurrenter ikke har
- Hvilke features har vi som konkurrenter har men dårligere
- Hvor mange konkurrenter har sluttet å være relevante for våre brukere

### 8.4 Kundeansvar
- Coach-tilfredshet (NPS > 50)
- Spillertilfredshet (NPS > 70)
- Refusjons-rate < 2 %

---

## Konklusjon

Vi er **80 % av veien** til verdens beste. De siste 20 % er:

1. **Data-integrasjon** (wearables, TrackMan live) — dette gjør plattformen "smart"
2. **AI swing-analyse** — dette demokratiserer ekspert-coaching
3. **3D-bane-visualisering** — dette gir strategi-fordel
4. **Skadeforebyggende ML** — dette beskytter investering i utvikling
5. **TPI-screen ved onboarding** — dette personaliserer fra dag 1

Med 90 dagers fokusert arbeid kan AK Golf HQ være på et nivå som ingen andre i verden tilbyr.

**Anbefalt neste steg:** Start med "Auto-data-import" (Garmin/Apple Watch) — det er den ene feature-en som gir mest umiddelbar verdi per time arbeid.
