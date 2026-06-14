# PlayerHQ — produkt-brief (spillerportal)

> **Rute:** `/portal` · **Enhet:** mobil-først (desktop som utvidelse) · **Tema:** alltid lyst.
> **Bruker:** utøveren. Mental modus: «hva skal JEG gjøre i dag?» Bygg fra komponentene i `01-DESIGNSYSTEM.md`.

## IA — navigasjon
- **Bunn-nav, 5 faner (fast):** **Oversikt · Planlegg · Gjør · Analyser · Coach**.
- **Topbar:** PLAYERHQ-merke (venstre), varselbjelle + avatar (høyre). Avatar → **Meg** (profil/abonnement/innstillinger). Bjelle → Varsler.
- ≤2-trykk-løftene: *start dagens økt* fra Oversikt (1–2 trykk), *logg resultat* (1 trykk), *kom tilbake der jeg var*.

## Skjermer

### Oversikt (hjem) — `/portal`
Dagens dashboard. **Hero** med profilbilde + tier-pill («PlayerHQ · {tier}») + greeting. Deretter: **dagens økt-kort** (stor primær-CTA «Start økt»), **KpiStrip** (HCP, SG-snitt 90d, snittscore), neste booking, siste innsikt (`InsightCard`), mål-fremdrift (`PyramidProgress`). Komponenter: PhotoHero, KpiStrip, AthleticCard, InsightCard, PyramidProgress, ItineraryList. Tomt: EmptyState «ingen økt planlagt → planlegg».

### Planlegg → Workbench — `/portal/planlegge` (ETT trykkpunkt)
Åpner spillerens **Workbench** direkte (ingen meny av kort). Tre zoom: **År** (`YearPlanGantt` — periodisering grunn/spes/turnering) → **Uke** (`WeekGrid` med dra-og-slipp) → **Økt** (`DayCal`/`SessionScheduler` + inspector). Delt kjerne med coachens Workbench: coach-endringer dukker opp som «venter godkjenning» (badge) → spiller godtar/avslår inline. Bunnbar viser planlagt vs mål vs faktisk (pyramide) i sanntid. «Legg til økt» på ≤2 trykk. Se Workbench-utviklingsplanen for ambisjon (Balansér, generer uke, mål→drill).

### Gjør (gjennomføre/Live-økt) — `/portal/gjennomfore` + fullskjerm `/portal/(fullscreen)/live/[id]`
Dagens/kommende økter + **isolert fullskjerms live-flyt**: brief → aktiv (logg reps/tid, kølle, drill-scoring) → oppsummering. Ekte pause/avbryt. Komponenter: SessionScheduler, ActionList, store touch-knapper. Live-flyten skal ALDRI konsolideres inn i en annen skjerm — egen fullskjerm.

### Analyser — `/portal/analysere` (ÉN flate, faner)
Faner: **SG · Runder · TrackMan · Tester · Innsikt**. Mål bor i Oversikt, redigeres i Workbench — ikke egen modul. Komponenter: SgBar, SgTrendLine, HcpTrend, RoundScorecard, ShotMap, ClubMetricGrid, TestMatrix, DataTable, InsightCard. Undersider: **Runde-detalj** (RoundScorecard + ShotMap + hull-for-hull) og **Logg runde** (1-trykks inngang fra Runder-fanen).

### Coach — `/portal/coach`
Dialog med coach: **Meldinger · Notater · Planer · Videoer · AI Coach · Be om økt**. Komponenter: QueueList, AthleticCard, ActionList. «Be om økt» = ≤2 trykk (trekker credit hvis coaching-pakke). Forfatterverktøy hører hjemme i AgencyOS, ikke her.

### Meg — `/portal/meg` (via avatar)
Profil + **abonnement** (koblet Stripe-rad: GRATIS/PRO, oppgrader-CTA der relevant — aldri ELITE/Performance som app-nivå) + **ÉN innstillingsside med seksjoner** (varsler, personvern, integrasjoner, språk, sikkerhet, helse, utstyrsbag, foreldre, dokumenter, hjelp). Komponenter: DetailHero, ActionList, StatusPill.

### Turneringer — `/portal/turneringer` (+ detalj)
Kommende/påmeldte turneringer + forberedelse. Komponenter: TournamentCard, PeriodTimeline. Detalj: DetailHero + leaderboard.

### Varsler — `/portal/varsler`
Tidslinje av varsler/forespørsler. Komponenter: QueueList, PulseDot. Hver rad → handle inline.

## Design-direksjon (PlayerHQ)
Luftig, tommelvennlig, rolig. Hero med foto. Tall i mono. Lime kun på aktiv fane + dagens-økt-puls. Alt skal kunne nås på få trykk; planen skal føles som en sparringpartner, ikke en sjef.
