# Readiness-matrise — har vi databaser + kode for designet?

> For hver skjerm/funksjon i BETA-designet: finnes datamodell (Prisma) + kode (rute + server action) i repoet? Audit mot faktisk kode 2026-06-14.
> **KLAR** = rute + ekte data + modell · **DELVIS** = rute finnes, men mock/ufullstendig · **MANGLER** = ingen rute/kode.

## Kort svar
- **Databaser: så godt som komplett.** 124 Prisma-modeller dekker ALLE domener designet trenger (plan, SG, TrackMan, runder, tester, booking, abonnement, turnering, talent, helse, kommunikasjon). Data-modellen er **ikke** flaskehalsen.
- **Kode: de fleste ruter finnes, men hull i funksjoner + sanntid.** PlayerHQ er ~80 % klar med ekte data. AgencyOS har alle ruter, men flere flater viser fortsatt mock-data, og noen kjernefunksjoner er ikke bygget.
- **Konklusjon:** Designet KAN bygges på dagens fundament. Det som gjenstår er **kode/logikk + sanntid + datakobling**, ikke databaser.

---

## PlayerHQ — readiness (≈20 KLAR · 3 DELVIS · 1 MANGLER)
| Skjerm | Status | Gap |
|---|---|---|
| home, workbench, analysere, round-detail, log-round, me + alle me-sub, tournaments, tournament-detail, varsler, utstyr, dokumenter, helse | **KLAR** | Ekte Prisma-data koblet (helse = plassholder pga FYS-formel) |
| gjennomføre (execute) | **DELVIS** | «I dag»-fane ekte; «Kalender» + «Booking»-faner viser mock-struktur |
| analyse (sub-faner SG/Runder/TrackMan/Tester) | **DELVIS** | Lastes generisk; splitting per under-fane ikke ferdig |
| live-økt (coach-visning) | **DELVIS** | Spiller-flyt ekte; coach-visning er read-only brief |
| auth-BankID | **MANGLER** | Rute finnes, men ingen backend-flyt |

## AgencyOS — readiness (≈17 KLAR · ≈10 DELVIS · 1 MANGLER)
| Skjerm | Status | Gap |
|---|---|---|
| dashboard, players, groups, training-plans, plan-templates, drills, tournaments, calendar, bookings, availability, services, lag-snitt, team, økter, reports, forespørsler, godkjenninger | **KLAR** | Ekte data + actions |
| workbench | **DELVIS** | Spillervalg + metrikker ekte, men flere tab-paneler får tom/mock-data |
| plan-builder | **DELVIS** | Hub-grid finnes; **«Generér uke» + «Balansér» + dra-og-slipp-bygger MANGLER** |
| player-profile (360) | **DELVIS** | Grunndata ekte; 360-grafikk/historikk ikke koblet |
| talent-radar, comparison | **DELVIS** | Grunn-radar finnes; sammenligning-logikk delvis |
| facilities, tests, admin, mobil | **DELVIS** | Readonly/mock på deler; tests = plassholder (FYS-formel) |
| WAGR-skjerm | **MANGLER** | Modell (WagrSnapshot) finnes, men ingen egen `/admin/wagr`-rute |

---

## Datamodell — domene-coverage
| Domene | Status | Merknad |
|---|---|---|
| Planlegging/Workbench | DEKKET (modell) | TrainingPlan/Session/SeasonPlan/PeriodBlock/Goal/Fysisk/Teknisk — **men generér-uke-logikk mangler** |
| SG / analyse | DEKKET | SgBaseline, SgInsight, Round (+granulære SG-felt), Shot |
| TrackMan | DEKKET | TrackManSession/Shot, ClubMetricTrend — CSV-import-UI i portal mangler |
| Runder/tester | DEKKET | Round, HoleScore, Test*-modeller — bulk-test-til-gruppe mangler |
| Booking | DEKKET | Booking, ServiceType, Location, Facility, Availability, Subscription/credits |
| Turneringer | DELVIS | Modeller komplette; **melding-til-deltakere + prep-AI mangler** |
| Talent | DEKKET | TalentTracking, WagrSnapshot |
| Kommunikasjon/innboks | DELVIS | SessionRequest + PlanAction finnes, men **2 separate flater** (ikke samlet innboks); coach↔spiller-chat finnes |
| Coach-cockpit/scope | DELVIS | Group/GroupMember/PlayerEnrollment finnes; **bulk-tildel + pin-spiller-persist mangler** |
| Live-økt | DELVIS | To spor (TrainingPlanSession vs TrainingSessionV2) — **migrasjon uavklart** |
| Meg/helse/utstyr | DEKKET | HealthEntry, EquipmentBag, Document (Garmin/Apple Health-import = v2) |
| **Realtime** | **MANGLER** | **Supabase Realtime ikke konfigurert — cockpit + chat er polling (kan vise gammel data)** |

---

## De viktigste gapene før designet er en komplett, kjørende app
Rangert. Dette er KODE/logikk, ikke databaser.

1. **Sanntid (KRITISK).** Coach-cockpit + chat oppdaterer ikke live (ingen Supabase Realtime). Avgjørende for «hvem trenger meg nå»-cockpiten.
2. **«Generér uke» + «Balansér».** Kjernen i Workbench-løftet — ingen server-logikk finnes ennå.
3. **Workbench-paneler med ekte data.** Flere AgencyOS-Workbench-paneler får mock/tom data.
4. **Bulk-operasjoner for gruppe.** Tildel plan/test til hel gruppe + fellesmelding til turneringsdeltakere — modeller finnes, actions mangler.
5. **Samle forespørsler + godkjenninger + meldinger** til én innboks (i dag to separate flater).
6. **WAGR-skjerm** (rute mangler), **BankID-backend** (PlayerHQ), **live-økt V1/V2-konsolidering**.

## Ærlig forbehold
Dette er en kode-grunnet audit (agenter mot faktiske filer). Eksakte filstier kan variere noe — verifiser per skjerm før bygging. Statusene (KLAR/DELVIS/MANGLER) og gapene er pålitelige på funksjonsnivå.
