# Master-skjermplan — AK Golf HQ

> Autoritativ oversikt over alle skjermer i plattformen. Én plass å se alt. **Sist oppdatert: 6. juli 2026.**

> **OPPDATERT KANON (2026-07-08):** Design-kanon er nå UTELUKKENDE det levende Claude Design-
> prosjektet (`claude.ai/design/p/bb9b2b1d-ce2b-4757-be37-ee2096ba9d0d`), hentet direkte via
> DesignSync — se `.claude/rules/design-system-regel.md`. Ingen "andre lag"-unntak for
> driftsskjermer lenger; alt bygges mot dette til slutt. «Design=✓» måler mot faktisk 1:1-
> komposisjon fra `src/components/athletic/golfdata/` (portet fra prosjektets `components/`).
> `plans/design-bolgeplan.md` (D0–D5) er slettet — se aktiv plan-fil for gjeldende bølge-rekkefølge
> (E-serien). Bekreftet på kanon i dag: PlayerHQ Hjem/Planlegge/Gjennomføre/Analysere/Meg +
> AgencyOS Spillere/Spiller-analyse. Resten gjenstår.

> **Optimalisering juli 2026:** Navigasjon strammet for færre klikk og skjermer. 
> PlayerHQ: 5 faste seksjoner (Hjem–Plan–Gjør–Analyse–Meg) + Workbench som ett trykkpunkt for alt planlegging, Analysere som samlet analyseflate. 
> Direkte hurtighandlinger fra Hjem. 
> AgencyOS: Flate primær-punkter for Planlegge og Kalender&Bookinger, sterk cockpit med "Ett klikk"-bar. Duplikate adresser og dype grupper redusert. Logisk sted å trykke = alltid hovedseksjonene eller synlige hurtigknapper. Se også .claude/rules/arkitektur.md.

**Booking:** Acuity (`akgolfgroup.as.me`) er midlertidig booking frem til HQ-bookingen lanseres. Sett `BOOKING_ACTIVE=true` i Vercel for å aktivere den innebygde flyten.

---

## Slik bruker vi denne (regel)

Før noen rører en skjerm: finn raden her, jobb mot den, oppdater hakene i samme commit. En skjerm er ikke ferdig før alle seks haker er grønne (✓). Alt Claude Design har tegnet skal kobles — sjekk «drop-off»-lista.

**De seks hakene:**
1. **Design** — ser ut som den skal (riktig utseende, riktig oppsett)
2. **Mob/Desk/iPad** — fungerer fint på tre størrelser. Tre tegn, f.eks. `✓✓–` = mobil og desktop OK, iPad ikke sjekket
3. **Adresse-ok** — riktig nettadresse, ikke bare forhåndsvisning
4. **Flyt** — knappene tar deg dit de skal
5. **Data** — viser ekte tall fra databasen
6. **Funker** — testet, knekker ikke

Tegnforklaring: ✓ = ferdig · ~ = delvis / i arbeid · – = ikke startet

† = bygd + koblet til ekte data + tsc/build grønt — men ikke nettleser-testet ende-til-ende ennå

★ = kjerneskjerm (høy prioritet for design og data)

---

## Status akkurat nå — 17. juni 2026

### Kodebase (kartlagt 17. juni)

**404 sider implementert i Next.js App Router:**

| Type | Antall | Forklaring |
|---|---|---|
| FULL | 383 | Ekte innhold, koblet til data |
| STUB | 17 | Minimal placeholder — trenger ferdigstilling |
| SHELL | 3 | Tomt skall — trenger bygging |
| REDIRECT | 1 | `/admin/spillere/[id]/fremgang` → redirect |

**Backend:** 48 API-endepunkter · 23 cron-agenter (Vercel Cron) · 120+ server-action-filer · ~170 Prisma-modeller

### Design-status (v13-baseline, 6. juli 2026)

Bekreftet komponert fra v13-kit (Design=✓):
- **PlayerHQ:** Hjem (`/portal`) · Planlegge · Gjennomføre · Analysere · Meg
- **AgencyOS:** Spillere (`/admin/spillere`) · Spiller-analyse (`/admin/spillere/[id]/analyse`)

Alt annet er funksjonelt bygget (se FULL-tellingen over), men ikke re-komponert mot dagens
golfdata-kanon ennå. Rekkefølge og fremdrift styres av den aktive E-serie-planen (se plan-fil).

**Mangler design (–):** de fleste sub-sider og sekundærskjermer — se tabellene nedenfor.

---

## Design-fokus for neste sprint

Skjermer som er implementert i kode men IKKE ferdig gjennom design-porting-gaten. Prioritert rekkefølge for Claude Design-arbeid.

### Prioritet 1 — Sub-sider til allerede portede kjerneskjermer

| Område | Skjermer (–) | Data tilgjengelig i Prisma |
|---|---|---|
| PlayerHQ Planlegge | Mål-hub, Mål-bygger, Teknisk plan, Fys-plan, Utfordringer, AI-assistenter | `Goal`, `TechnicalPlan`, `FysiskPlan`, `DrillChallenge`, `SeasonPlan`, `PeriodBlock` |
| PlayerHQ Analysere | SG-Hub sub-sider (equipment/yardage/strategy/conditions/benchmark), Slag-for-slag, TrackMan-sesjon-detalj, Statistikk sub-sider | `Shot`, `HoleScore`, `BrukerSgInput`, `SgInsight`, `ClubMetricTrend`, `TrackManSession`, `TrackManShot` |
| PlayerHQ Gjennomføre | Ny økt (handlingsvalg), Ønsket økt, Økt-detalj, Kalender, Feiring | `TrainingSessionV2`, `SessionParticipant`, `TrainingPlanSessionLog` |
| PlayerHQ Booking | Booking-detalj, Ny booking bekreft, Coach-profil (booking), Anlegg-detalj | `Booking`, `CoachingSession`, `ServiceType`, `Facility`, `Payment` |
| AgencyOS Stall | Spiller-profil, Ny spiller, Tildel test (skjema), Gruppe-detalj | `User`, `Group`, `GroupMember`, `TestAssignment`, `TalentTracking` |
| AgencyOS Planlegge | Plan-detalj, Plan-mal detalj, Drill-detalj, Teknisk plan, Ny turnering | `TrainingPlan`, `PlanTemplate`, `PlanEffectiveness`, `TechnicalPlan`, `Tournament` |

### Prioritet 2 — Coach-seksjonen (PlayerHQ) — hele seksjonen mangler design

Spillerens kontakt med coachen er implementert i kode men har **Design=– på samtlige skjermer**.

| Skjerm | Adresse | Data |
|---|---|---|
| Coach-hub | `/portal/coach` | `CoachingSession`, `SessionRequest`, `Document` |
| Meldinger (innboks) | `/portal/coach/melding` | `CaddieMessage`, `Notification` |
| Meldingstråd | `/portal/coach/melding/[id]` | `CaddieMessage`, `Document` |
| Coach-planer | `/portal/coach/plans/[planId]` | `TrainingPlan`, `PeriodBlock`, `PlanSession` |
| Coach-øvelser | `/portal/coach/ovelser` | `ExerciseDefinition`, `CoachDrillDirectiv`, `DrillMal` |
| Coach-videoer | `/portal/coach/videoer` | `SessionVideo`, `SessionRecording` |
| Spørsmål til coach | `/portal/coach/sporsmal/[id]` | `CoachNote`, `Document` |

### Prioritet 3 — AgencyOS sekundærskjermer

| Område | Mangler design | Data |
|---|---|---|
| Innsikt | Innsikt-hub, Runder, Tilstander, Analytics | `SgInsight`, `Signal`, `Round`, `HealthEntry` |
| Admin/org | Team, AI-agenter, E-postmaler, Audit-log, Klubb-innstillinger | `ApiKey`, `AuditLog`, `AgentRun`, `EmailTemplate` |
| Gjennomføre | Daglig drift-hub, Økt-detalj, Ny booking, TrackMan på tvers | `TrainingSessionV2`, `TrackManSession` |
| Workspace | Workspace-hub, Prosjekter, Notion-sync | `OppgaveCache`, `ProsjektCache`, `NotionConnection` |

### Prioritet 4 — Booking-flyt (selvstendig)

`/booking/[slug]` (ekstern booking via slug) + full intern booking-flyt i portal. Egne server actions for kreditbooking.

### Prioritet 5 — Marketing-sider

`/om-oss` · `/coaching` · `/priser` · `/playerhq` · `/cases` · `/suksess` · `/treningsfilosofi` · blogg-layout · coacher-profil

---

## Skjermene — PlayerHQ

PlayerHQ er spillerens eget verktøy: «hva skal JEG gjøre i dag?» Adressene begynner med `/portal`.

### Hjem

| Skjerm | Adresse | Design | Mob/Desk/iPad | Adresse-ok | Flyt | Data | Funker |
|---|---|---|---|---|---|---|---|
| Hjem (Workbench-hjem) ★ | `/portal` | ✓ | ✓✓✓ | ✓ | ✓ | ✓ | ✓ |
| Varsler ★ | `/portal/varsler` | – | ✓✓✓ | ✓ | ✓ | ✓ | ✓ |

### Planlegge

| Skjerm | Adresse | Design | Mob/Desk/iPad | Adresse-ok | Flyt | Data | Funker |
|---|---|---|---|---|---|---|---|
| Planlegge (= Workbench mobil) ★ | `/portal/planlegge` | ✓ | ✓✓✓ | ✓ | ✓ | ✓ | ✓ |
| **Workbench (planlegging)** ★ | `/portal/planlegge/workbench` | – | ✓✓✓ | ✓ | ✓ | ✓ | ✓ |
| Årsplan | `/portal/tren/aarsplan` | – | ✓✓– | ✓ | ~ | ✓ | ✓ |
| · Rediger periode | `/portal/tren/aarsplan/periode/[id]/rediger` | ~ | --- | ✓ | ✓ | ✓ | ~ |
| · Ny periode | `/portal/tren/aarsplan/periode/ny` | ~ | --- | ✓ | ✓ | ✓ | ~ |
| Teknisk plan (liste) | `/portal/tren/teknisk-plan` | – | --- | ✓ | ~ | ~ | ✓ |
| · Teknisk plan detalj | `/portal/tren/teknisk-plan/[planId]` | – | --- | ✓ | ~ | ~ | ✓ |
| Fys-plan (liste) | `/portal/tren/fys-plan` | – | --- | ✓ | ~ | ~ | ✓ |
| · Fys-plan detalj/bygger | `/portal/tren/fys-plan/[planId]` | – | --- | ✓ | ~ | ~ | ✓ |
| Drills (bibliotek) | `/portal/drills` | – | ✓✓– | ✓ | ~ | ✓ | ✓ |
| · Drill-detalj | `/portal/drills/[id]` | – | ✓✓– | ✓ | ~ | ✓ | ✓ |
| Mål-hub | `/portal/mal` | – | --- | ✓ | ~ | ~ | ✓ |
| · Mål-bygger (wizard) | `/portal/mal/bygger` | – | --- | ✓ | ~ | ~ | ~ |
| · Mål-detalj | `/portal/mal/goal/[id]` | – | --- | ✓ | ~ | ~ | ~ |
| · Milepæler | `/portal/mal/milepaeler` | – | --- | ✓ | ~ | ~ | ~ |
| · Leaderboard | `/portal/mal/leaderboard` | – | --- | ✓ | ~ | ~ | ~ |
| Turneringer (mine) ★ | `/portal/tren/turneringer` | – | ✓✓✓ | ✓ | ✓ | ✓ | ✓ |
| · Turnering-detalj | `/portal/tren/turneringer/[id]` | – | ✓✓– | ~ | ~ | – | ~ |
| · Ny turnering | `/portal/tren/turneringer/ny` | – | --- | ✓ | ~ | ~ | ~ |
| Utfordringer | `/portal/utfordringer` | ~ | --- | ✓ | ~ | ~ | ~ |
| · Ny utfordring (wizard) | `/portal/utfordringer/ny` | – | --- | ✓ | ~ | ~ | ~ |
| · Utfordring-detalj | `/portal/utfordringer/[id]` | ~ | --- | ✓ | ~ | ~ | ~ |
| AI: mål-bygger | `/portal/ai/mal-bygger` | – | --- | ✓ | ~ | ~ | ~ |
| AI: foreslå drill | `/portal/ai/foresla-drill` | – | --- | ✓ | ~ | ~ | ~ |
| AI: foreslå turnering | `/portal/ai/foresla-turnering` | – | --- | ✓ | ~ | ~ | ~ |

### Gjennomføre (inkl. live-økt)

| Skjerm | Adresse | Design | Mob/Desk/iPad | Adresse-ok | Flyt | Data | Funker |
|---|---|---|---|---|---|---|---|
| Gjennomføre (I dag/Kalender/Booking) ★ | `/portal/gjennomfore` | ✓ | ✓✓✓ | ✓ | ✓ | ✓ | ✓ |
| · Økt-detalj (V2-økt fra coach) | `/portal/gjennomfore/[id]` | – | ✓✓✓ | ✓ | ✓ | ✓ | ✓ |
| Kalender | `/portal/kalender` | – | --- | ✓ | ~ | ~ | ✓ |
| Kalender (alt. adresse) | `/portal/tren/kalender` | – | --- | ✓ | ~ | ~ | ✓ |
| Ny økt (handlingsvalg) | `/portal/ny-okt` | – | --- | ✓ | ~ | ~ | ✓ |
| Logg treningsøkt (volum per SG) † | `/portal/trening/logg` | – | ✓✓– | ✓ | ✓ | ✓ | ~ |
| **Putte-laboratoriet** (3 verktøy) | `/portal/trening/putte-laboratoriet` | – | ✓✓– | ✓ | ✓ | – | ✓ |
| **Break-tabell** (3 varianter) | `/portal/trening/break-tabell` | – | ✓✓– | ✓ | ✓ | – | ✓ |
| Ønsket økt (be coach) | `/portal/onskeligokt` | – | --- | ✓ | ~ | ~ | ~ |
| · Ønsket økt bekreftet | `/portal/onskeligokt/bekreftet` | – | --- | ✓ | ~ | ~ | ~ |
| Live-økt: brief † | `/portal/(fullscreen)/live/[sessionId]/brief` | – | ✓✓– | ✓ | ✓ | ✓ | ✓ |
| Live-økt: aktiv † | `/portal/(fullscreen)/live/[sessionId]/active` | – | ✓✓– | ✓ | ✓ | ✓ | ✓ |
| Live-økt: oppsummering † | `/portal/(fullscreen)/live/[sessionId]/summary` | – | ✓✓– | ✓ | ✓ | ✓ | ✓ |
| Live-økt: drill-logger | `/portal/(fullscreen)/live/[sessionId]/logger` | – | ✓✓– | ✓ | ~ | ~ | ✓ |
| Live-økt: score-tapper | `/portal/(fullscreen)/live/[sessionId]/tapper` | – | ✓✓– | ✓ | ~ | ~ | ✓ |
| Tren (fullskjerm) | `/portal/(fullscreen)/tren` | – | --- | ✓ | ~ | ~ | ~ |
| Økt-detalj | `/portal/tren/[sessionId]` | – | --- | ✓ | ~ | ~ | ✓ |
| · Planlagt økt | `/portal/tren/[sessionId]/planlagt` | – | --- | ✓ | ~ | ~ | ✓ |
| Feiring (etter plan ferdig) | `/portal/tren/feiring/[planId]` | – | --- | ✓ | ~ | ~ | ~ |

### Analysere

| Skjerm | Adresse | Design | Mob/Desk/iPad | Adresse-ok | Flyt | Data | Funker |
|---|---|---|---|---|---|---|---|
| Analysere = «Min golf» (6 faner: SG · Fokus · Runder · Baggen · Putting · Nivå — v13 golfdata, bølge 1 2026-07-04) ★ | `/portal/analysere` | ✓ | ✓✓– | ✓ | ✓ | ✓ | † |
| · Hull-analyse | `/portal/analysere/hull` | – | ✓✓– | ✓ | ~ | ✓ | ✓ |
| Statistikk (oversikt) | `/portal/statistikk` | ~ | ✓✓– | ✓ | ✓ | ✓ | ✓ |
| · Metrikk-detalj | `/portal/statistikk/[metric]` | – | --- | ✓ | ~ | ~ | ~ |
| · Sammenlign | `/portal/statistikk/sammenlign` | – | --- | ✓ | ~ | ~ | ~ |
| · Del runde | `/portal/statistikk/runder/[runId]/del` | – | --- | ✓ | ~ | ~ | ~ |
| **SG-Hub (Strokes Gained)** ★ | `/portal/mal/sg-hub` | – | ✓✓– | ✓ | ✓ | ✓ | ✓ |
| · Kølle-detalj | `/portal/mal/sg-hub/[club]` | – | --- | ✓ | ~ | ~ | ~ |
| · Benchmark | `/portal/mal/sg-hub/benchmark` | – | --- | ✓ | ~ | ✓ | ✓ |
| · Best vs nå | `/portal/mal/sg-hub/best-vs-now` | – | --- | ✓ | ~ | ~ | ~ |
| · Utstyr | `/portal/mal/sg-hub/equipment` | – | --- | ✓ | ~ | ~ | ~ |
| · Avstander (yardage) | `/portal/mal/sg-hub/yardage` | – | --- | ✓ | ~ | ~ | ~ |
| · Forhold (vær/bane) | `/portal/mal/sg-hub/conditions` | – | --- | ✓ | ~ | ~ | ~ |
| · Strategi | `/portal/mal/sg-hub/strategy` | – | --- | ✓ | ~ | ~ | ~ |
| · Coach ser spiller-SG | `/portal/mal/sg-hub/coach/[spillerId]` | – | --- | ✓ | ~ | ~ | ~ |
| · Coach: kølle | `/portal/mal/sg-hub/coach/[spillerId]/[club]` | – | --- | ✓ | ~ | ~ | ~ |
| · Coach: utstyr | `/portal/mal/sg-hub/coach/[spillerId]/equipment` | – | --- | ✓ | ~ | ~ | ~ |
| Runder (liste) | `/portal/mal/runder` | – | ✓✓– | ✓ | ~ | ✓ | ✓ |
| · Runde-detalj ★ | `/portal/mal/runder/[id]` | – | ✓✓✓ | ✓ | ✓ | ✓ | ✓ |
| · Slag-for-slag (visning) | `/portal/mal/runder/[id]/shot-by-shot` | – | --- | ✓ | ~ | ~ | ~ |
| · Slag-registrering (wizard + UpGame) | `/portal/mal/runder/[id]/slag` | – | ✓-- | ✓ | ✓ | ✓ | ✓ |
| · Logg ny runde ★ | `/portal/mal/runder/ny` | – | ✓✓✓ | ✓ | ✓ | ✓ | ✓ |
| · Live slag-føring (runde-logg) ★ | `/portal/(fullscreen)/runde-logg` | – | --- | – | – | ~ | ~ |
| TrackMan (liste) | `/portal/mal/trackman` | – | ✓✓– | ✓ | ~ | ✓ | ✓ |
| · TrackMan-sesjon | `/portal/mal/trackman/[id]` | – | ✓✓– | ✓ | ~ | ~ | ~ |
| · TrackMan (alt. adresse) | `/portal/trackman/[sessionId]` | – | ✓✓– | ✓ | ~ | ~ | ~ |
| Tester (oversikt) ★ | `/portal/tren/tester` | – | ✓✓~ | ✓ | ✓ | ✓ | ✓ |
| · Test-detalj ★ | `/portal/tren/tester/[testId]` | – | ✓✓~ | ✓ | ✓ | ✓ | ✓ |
| · Test-gjennomføring (scorekort) ★ | `/portal/tren/tester/[testId]/gjennomfor` | – | ✓✓~ | ✓ | ✓ | ✓ | ✓ |
| · Test-katalog (NGF) | `/portal/tren/tester/katalog` | – | --- | ✓ | ~ | ~ | ~ |
| · Ny test | `/portal/tren/tester/ny` | – | --- | ✓ | ~ | ~ | ~ |
| · Ny egen test | `/portal/tren/tester/ny/egen` | – | --- | ✓ | ~ | ~ | ~ |
| · Test live (fullskjerm) | `/portal/(fullscreen)/test/[testId]/live` | – | --- | ✓ | ~ | ~ | ~ |
| · Test oppsummering | `/portal/(fullscreen)/test/[testId]/summary` | – | --- | ✓ | ~ | ~ | ~ |
| Bane-bibliotek | `/portal/mal/baner` | – | --- | ✓ | ~ | ~ | ~ |
| · Bane-detalj | `/portal/mal/baner/[id]` | – | --- | ✓ | ~ | ~ | ~ |
| Statistikk-side (gml.) | `/portal/mal/statistikk` | – | --- | ✓ | ~ | ~ | ~ |

### Coach (spillerens kontakt med coach)

| Skjerm | Adresse | Design | Mob/Desk/iPad | Adresse-ok | Flyt | Data | Funker |
|---|---|---|---|---|---|---|---|
| Coach-hub | `/portal/coach` | ~ | --- | ✓ | ~ | ~ | ✓ |
| · Coach-profil | `/portal/coach/[coachId]` | – | --- | ✓ | ~ | ~ | ~ |
| Meldinger (innboks) | `/portal/coach/melding` | ~ | --- | ✓ | ~ | ~ | ✓ |
| · Ny melding | `/portal/coach/melding/ny` | – | --- | ✓ | ~ | ~ | ~ |
| · Meldingstråd | `/portal/coach/melding/[id]` | – | --- | ✓ | ~ | ~ | ~ |
| · Vedlegg | `/portal/coach/melding/[id]/vedlegg` | – | --- | ✓ | ~ | ~ | ~ |
| Coach-planer | `/portal/coach/plans` | ~ | --- | ✓ | ~ | ~ | ~ |
| · Plan-detalj | `/portal/coach/plans/[planId]` | – | --- | ✓ | ~ | ~ | ~ |
| · Ny økt i plan | `/portal/coach/plans/[planId]/ny-okt` | – | --- | ✓ | ~ | ~ | ~ |
| · Perioder | `/portal/coach/plans/perioder` | – | --- | ✓ | ~ | ~ | ~ |
| Coach-øvelser | `/portal/coach/ovelser` | ~ | --- | ✓ | ~ | ~ | ~ |
| · Ny øvelse | `/portal/coach/ovelser/ny` | – | --- | ✓ | ~ | ~ | ~ |
| · Rediger øvelse | `/portal/coach/ovelser/[id]/rediger` | – | --- | ✓ | ~ | ~ | ~ |
| Coach-videoer | `/portal/coach/videoer` | ~ | --- | ✓ | ~ | ~ | ~ |
| Coach-notater | `/portal/coach/notes` | – | --- | ✓ | ~ | ~ | ~ |
| · Notat-detalj | `/portal/coach/notes/[noteId]` | – | --- | ✓ | ~ | ~ | ~ |
| Spørsmål til coach (liste løftet D3; [id]-tråd ikke løftet) | `/portal/coach/sporsmal/[id]` | ~ | --- | ✓ | ~ | ~ | ~ |
| Coach-AI | `/portal/coach/ai` | – | --- | ✓ | ~ | ~ | ~ |

### Meg (profil og innstillinger)

| Skjerm | Adresse | Design | Mob/Desk/iPad | Adresse-ok | Flyt | Data | Funker |
|---|---|---|---|---|---|---|---|
| Meg (profil) ★ | `/portal/meg` | ✓ | ✓✓✓ | ✓ | ✓ | ✓ | ✓ |
| Rediger profil ★ | `/portal/meg/profil` | – | ✓✓✓ | ✓ | ✓ | ✓ | ✓ |
| Abonnement ★ | `/portal/meg/abonnement` | – | ✓✓✓ | ✓ | ✓ | ✓ | ✓ |
| · Oppgrader | `/portal/meg/abonnement/oppgrader` | – | --- | ✓ | ~ | ~ | ~ |
| · Oppgrader-flyt | `/portal/meg/abonnement/oppgrader/flyt` | – | --- | ✓ | ~ | ~ | ~ |
| · Avbestill | `/portal/meg/abonnement/avbestill` | – | --- | ✓ | ~ | ~ | ~ |
| · Nytt kort | `/portal/meg/abonnement/kort/ny` | – | --- | ✓ | ~ | ~ | ~ |
| · Faktura-detalj | `/portal/meg/abonnement/faktura/[id]` | – | --- | ✓ | ~ | ~ | ~ |
| Mine bookinger | `/portal/meg/bookinger` | – | --- | ✓ | ~ | ~ | ~ |
| · Endre tid | `/portal/meg/bookinger/reschedule/[bookingId]` | – | --- | ✓ | ~ | ~ | ~ |
| Helse ★ | `/portal/meg/helse` | – | ✓✓✓ | ✓ | ✓ | ✓ | ✓ |
| · Nytt symptom | `/portal/meg/helse/symptom/ny` | – | --- | ✓ | ~ | ~ | ~ |
| Innstillinger ★ | `/portal/meg/innstillinger` | – | ✓✓✓ | ✓ | ✓ | ✓ | ✓ |
| · Varsler | `/portal/meg/innstillinger/varsler` | – | --- | ✓ | ~ | ~ | ~ |
| · Personvern | `/portal/meg/innstillinger/personvern` | – | --- | ✓ | ~ | ~ | ~ |
| · Sikkerhet | `/portal/meg/innstillinger/sikkerhet` | – | --- | ✓ | ~ | ~ | ~ |
| · Språk | `/portal/meg/innstillinger/sprak` | – | --- | ✓ | ~ | ~ | ~ |
| · Anlegg | `/portal/meg/innstillinger/anlegg` | – | --- | ✓ | ~ | ~ | ~ |
| · Integrasjoner | `/portal/meg/innstillinger/integrasjoner` | – | --- | ✓ | ~ | ~ | ~ |
| · Eksport | `/portal/meg/innstillinger/eksport` | – | --- | ✓ | ~ | ~ | ~ |
| · Økter | `/portal/meg/innstillinger/okter` | – | --- | ✓ | ~ | ~ | ~ |
| Sikkerhet | `/portal/meg/sikkerhet` | – | --- | ✓ | ~ | ~ | ~ |
| · To-faktor (2FA) | `/portal/meg/sikkerhet/2fa` | – | --- | ✓ | ~ | ~ | ~ |
| Utstyrsbag ★ | `/portal/meg/utstyrsbag` | – | ✓✓✓ | ✓ | ✓ | ✓ | ✓ |
| Dokumenter ★ | `/portal/meg/dokumenter` | – | ✓✓✓ | ✓ | ✓ | ✓ | ✓ |
| Foreldre (foresatt-info) | `/portal/meg/foreldre` | – | ✓✓– | ✓ | ~ | ✓ | ✓ |
| Feedback | `/portal/meg/feedback` | – | --- | ✓ | ~ | ~ | ~ |
| Hjelpesenter ★ | `/portal/meg/help` | – | ✓✓✓ | ✓ | ✓ | ✓ | ✓ |
| · Hjelp-artikkel | `/portal/meg/help/artikkel/[slug]` | – | --- | ✓ | ~ | ~ | ~ |
| · Hjelp-kategori | `/portal/meg/help/kategori/[slug]` | – | --- | ✓ | ~ | ~ | ~ |
| · Kontakt | `/portal/meg/help/kontakt` | – | --- | ✓ | ~ | ~ | ~ |

### Booking

| Skjerm | Adresse | Design | Mob/Desk/iPad | Adresse-ok | Flyt | Data | Funker |
|---|---|---|---|---|---|---|---|
| Booking-hub | `/portal/booking` | – | ✓✓– | ~ | ~ | ✓ | ✓ |
| · Ny booking (wizard) | `/portal/booking/ny` | – | ✓✓– | ~ | ~ | ✓ | ✓ |
| · Ny booking bekreft | `/portal/booking/ny/bekreft` | – | --- | ✓ | ~ | ~ | ~ |
| · Booking-detalj | `/portal/booking/[bookingId]` | – | --- | ✓ | ~ | ~ | ~ |
| · Coach-profil (booking) | `/portal/booking/coach/[coachId]` | – | --- | ✓ | ~ | ~ | ~ |
| · Anlegg-detalj (booking) | `/portal/booking/anlegg/[anleggId]` | – | --- | ✓ | ~ | ~ | ~ |
| · Bekreftet | `/portal/booking/bekreftet` | – | --- | ✓ | ~ | ~ | ~ |

### Talent (elite-spor — egen del av PlayerHQ)

| Skjerm | Adresse | Design | Mob/Desk/iPad | Adresse-ok | Flyt | Data | Funker |
|---|---|---|---|---|---|---|---|
| Talent-hub | `/portal/talent` | – | --- | ✓ | ~ | ~ | ~ |
| · Min plan | `/portal/talent/min-plan` | – | --- | ✓ | ~ | ~ | ~ |
| · Mitt nivå | `/portal/talent/mitt-niva` | – | --- | ✓ | ~ | ~ | ~ |
| · Roadmap | `/portal/talent/roadmap` | – | --- | ✓ | ~ | ~ | ~ |
| · Sammenligning | `/portal/talent/sammenligning` | – | --- | ✓ | ~ | ~ | ~ |

> Merknad: Talent-delen er knyttet til «Elite Fase 2», som er bevisst utsatt. Disse adressene finnes, men er ikke prioritert nå.

### Aliaser og hjelpe-ruter (PlayerHQ)

Disse finnes i appen, men er enten eldre kortadresser som peker videre, eller små hjelpe-sider. Tatt med for å være komplett.

| Skjerm | Adresse | Design | Mob/Desk/iPad | Adresse-ok | Flyt | Data | Funker |
|---|---|---|---|---|---|---|---|
| Stats (alt. → redirect) | `/portal/stats` | – | --- | ✓ | ✓ | – | ✓ |
| Analyse (alt. → redirect) | `/portal/analyse` | – | --- | ✓ | ✓ | – | ✓ |
| Reach (oppsøk-verktøy) | `/portal/reach` | – | --- | ✓ | ~ | ~ | ~ |
| Agent-pipeline (AI internt) | `/portal/agent-pipeline` | – | --- | ✓ | ~ | ~ | ~ |
| Se annen spiller | `/portal/spiller/[spillerId]` | – | --- | ✓ | ~ | ~ | ~ |
| Øvelser (alt. → redirect) | `/portal/tren/ovelser` | – | --- | ✓ | ✓ | – | ✓ |
| · Øvelse-detalj (alt. → redirect) | `/portal/tren/ovelser/[id]` | – | --- | ✓ | ✓ | – | ✓ |

> Merknad: `/portal/stats` og `/portal/analyse` er kortadresser for `/portal/statistikk` og `/portal/analysere`, og `/portal/tren/ovelser` overlapper med `/portal/drills`. Disse bør ryddes til én adresse hver — se «Veien til 100%» (Bolk 4).

---

## Skjermene — AgencyOS

AgencyOS er coachens kontrolltårn: «hvem trenger MEG i dag?» Adressene begynner med `/admin`. (Het tidligere CoachHQ.)

### Oversikt (coachens hjem)

| Skjerm | Adresse | Design | Mob/Desk/iPad | Adresse-ok | Flyt | Data | Funker |
|---|---|---|---|---|---|---|---|
| **Cockpit (hjem)** ★ | `/admin/agencyos` | – | –✓– | ✓ | ✓ | ✓ | ✓ |
| · Uka (kanban) | `/admin/agencyos/uka` | ✓ | ✓✓– | ✓ | ~ | ✓ | ✓ | Design (grip + tcard + sc-t/sc-s + lane-hd-t + locked state from terminal design); Data (real prisma.booking.findMany); Funker (md:4 grid + build); brand in shell. |
| · Spillere (snarvei) | `/admin/agencyos/spillere` | – | ✓✓– | ✓ | ~ | ✓ | ✓ |
| · Økonomi | `/admin/agencyos/okonomi` | – | --- | ✓ | ~ | ~ | ~ |
| · Caddie (AI-chat) | `/admin/agencyos/caddie` | – | ✓✓– | ✓ | ~ | – | ✓ |
| · Caddie-aktivitet | `/admin/agencyos/caddie/aktivitet` | – | --- | ✓ | ~ | ~ | ~ |
| Admin-rot (gml. hjem) | `/admin` | – | --- | ✓ | ~ | ~ | ✓ |
| Daglig AI-brief | `/admin/brief` | – | --- | ✓ | ✓ | ~ | ~ |
| Coaching-board | `/admin/board` | – | --- | ✓ | ~ | ~ | ~ |
| Oppfølging | `/admin/oppfolging` | – | --- | ✓ | ~ | ~ | ~ |
| Oppgave-kø | `/admin/queue` | – | --- | ✓ | ~ | ~ | ~ |
| **Innboks** ★ | `/admin/innboks` | – | ✓✓– | ✓ | ✓ | ✓ | ✓ |
| Meldinger (alt. → redirect) | `/admin/messages` | – | --- | ✓ | ✓ | – | ✓ |
| Kommunikasjon-hub | `/admin/kommunikasjon` | – | --- | ✓ | ~ | ~ | ~ |
| Reach | `/admin/reach` | – | --- | ✓ | ~ | ~ | ~ |

### Min uke / Workspace

| Skjerm | Adresse | Design | Mob/Desk/iPad | Adresse-ok | Flyt | Data | Funker |
|---|---|---|---|---|---|---|---|
| Workspace-hub | `/admin/workspace` | ~ | --- | ✓ | ~ | ✓ | ✓ | Real tasks via getTasksForUser (Notion fallback + cache) + scoped to coach. Data full. 
| · Tildelt meg | `/admin/workspace/tildelt-meg` | – | –✓– | ✓ | ✓ | ✓ | ✓ |
| · Oppgaver | `/admin/workspace/oppgaver` | – | –✓– | ✓ | ✓ | ✓ | ✓ |
| · Oppgave-detalj | `/admin/workspace/oppgaver/[id]` | – | --- | ✓ | ~ | ~ | ~ |
| · Prosjekter | `/admin/workspace/prosjekter` | – | --- | ✓ | ~ | ~ | ~ |
| · Notion-sync | `/admin/workspace/notion` | – | --- | ✓ | ~ | ~ | ~ |

### Stall (spillere, grupper, talent)

| Skjerm | Adresse | Design | Mob/Desk/iPad | Adresse-ok | Flyt | Data | Funker |
|---|---|---|---|---|---|---|---|
| Stall-oversikt | `/admin/stall` | – | --- | ✓ | ~ | ~ | ✓ |
| **Spillere (alle)** = SpillerTilstandKort-liste (v13 golfdata, bølge 1 2026-07-04) ★ | `/admin/spillere` | ✓ | ✓✓– | ✓ | ✓ | ✓ | † |
| · Ny spiller | `/admin/spillere/ny` | – | --- | ✓ | ~ | ~ | ~ |
| **Spiller-detalj** ★ | `/admin/spillere/[id]` | – | ~✓– | ✓ | ✓ | ✓ | ✓ |
| · **Analyse (coach-dybde)** = golfdata elite-visning (v13, bølge 1 2026-07-04) ★ | `/admin/spillere/[id]/analyse` | ✓ | ✓✓– | ✓ | ✓ | ✓ | † |
| · Profil | `/admin/spillere/[id]/profil` | – | --- | ✓ | ~ | ~ | ~ |
| · **Workbench (coach-i-spiller)** ★ | `/admin/spillere/[id]/workbench` | – | ✓✓✓ | ✓ | ✓ | ✓ | ✓ |
| · Plan-detalj | `/admin/spillere/[id]/plan/[planId]` | – | --- | ✓ | ~ | ~ | ~ |
| · Fremgang (trening vs SG) † | `/admin/spillere/[id]/fremgang` | – | ✓✓– | ✓ | ✓ | ✓ | ~ |
| · Tester | `/admin/spillere/[id]/tester` | – | ✓✓– | ✓ | ✓ | ✓ | ~ |
| · Tildel test | `/admin/spillere/[id]/tildel-test` | – | --- | ✓ | ~ | ~ | ~ |
| · Rediger | `/admin/spillere/[id]/rediger` | – | --- | ✓ | ~ | ~ | ~ |
| Grupper | `/admin/grupper` | – | –✓– | ✓ | ✓ | ✓ | ✓ |
| · Gruppe-detalj (+ VG-trinn filter/badge, 2026-07-07) | `/admin/grupper/[id]` | – | --- | ✓ | ~ | ~ | ~ |
| · **WANG Toppidrett — åpen treningsplan** (offentlig, ingen innlogging) | `/team-wang` | ~ | --- | ✓ | ~ | ✓ | † |
| · **GFGK Junior — åpen treningsplan** (offentlig, 4 gruppefaner: Mini/Basis/Utvikling/Elite) | `/gfgk-junior` | ~ | --- | ✓ | ~ | ✓ | † |
| Talent-hub | `/admin/talent` | – | --- | ✓ | ~ | ~ | ~ |
| · Talent-detalj | `/admin/talent/[playerId]` | – | --- | ✓ | ~ | ~ | ~ |
| · Discovery | `/admin/talent/discovery` | – | --- | ✓ | ~ | ~ | ~ |
| · Radar | `/admin/talent/radar` | – | –✓– | ✓ | ✓ | ✓ | ✓ |
| · Radar per spiller | `/admin/talent/radar/[playerId]` | – | --- | ✓ | ~ | ~ | ~ |
| · Kohort | `/admin/talent/kohort` | – | --- | ✓ | ~ | ~ | ~ |
| · Region | `/admin/talent/region` | – | --- | ✓ | ~ | ~ | ~ |
| · Ressurser | `/admin/talent/ressurser` | – | --- | ✓ | ~ | ~ | ~ |
| · Sammenligning | `/admin/talent/sammenligning` | – | ~✓– | ✓ | ✓ | ✓ | ✓ |
| · WAGR-benchmark | `/admin/talent/wagr-benchmark` | – | --- | ✓ | ~ | ~ | ~ |
| · WAGR-import | `/admin/talent/wagr-import` | – | –✓– | ✓ | ✓ | ✓ | ✓ |

### Planlegge (lage planer FOR spillerne)

| Skjerm | Adresse | Design | Mob/Desk/iPad | Adresse-ok | Flyt | Data | Funker |
|---|---|---|---|---|---|---|---|
| Plan-sentral (hub) | `/admin/planlegge` | – | --- | ✓ | ~ | ✓ | ✓ | Real prisma lookup for first player + redirect to workbench. Full auth. 
| Planer (alle) | `/admin/plans` | – | –✓– | ✓ | ✓ | ✓ | ✓ |
| · Ny plan (Plan-bygger) | `/admin/plans/new` | – | –✓– | ✓ | ~ | ✓ | ~ |
| · Plan-detalj | `/admin/plans/[planId]` | – | --- | ✓ | ~ | ~ | ✓ |
| · Maler (alt. → redirect) | `/admin/plans/templates` | – | --- | ✓ | ✓ | – | ✓ |
| · Ny mal (alt. → redirect) | `/admin/plans/templates/ny` | – | --- | ✓ | ✓ | – | ✓ |
| · Rediger mal (alt. → redirect) | `/admin/plans/templates/[id]/rediger` | – | --- | ✓ | ✓ | – | ✓ |
| · Mal-effektivitet (alt. → redirect) | `/admin/plans/templates/[id]/effectiveness` | – | --- | ✓ | ✓ | – | ✓ |
| Plan-maler (alt.) | `/admin/plan-templates` | – | –✓– | ✓ | ✓ | ✓ | ✓ |
| · Plan-mal detalj | `/admin/plan-templates/[id]` | – | --- | ✓ | ~ | ~ | ~ |
| · Ny plan-mal | `/admin/plan-templates/ny` | – | --- | ✓ | ~ | ~ | ~ |
| · Rediger plan-mal | `/admin/plan-templates/[id]/rediger` | – | --- | ✓ | ~ | ~ | ~ |
| Drills (bibliotek) | `/admin/drills` | – | ~✓– | ✓ | ✓ | ✓ | ✓ |
| · Drill-detalj | `/admin/drills/[id]` | – | --- | ✓ | ~ | ~ | ~ |
| · Rediger drill | `/admin/drills/[id]/rediger` | – | --- | ✓ | ~ | ~ | ~ |
| Teknisk plan | `/admin/teknisk-plan` | – | --- | ✓ | ~ | ~ | ~ |
| · Per spiller | `/admin/teknisk-plan/[spillerId]` | – | --- | ✓ | ~ | ~ | ~ |
| **Turneringer** ★ | `/admin/tournaments` | – | ✓✓– | ✓ | ✓ | ✓ | ✓ |
| · Turnering-detalj | `/admin/tournaments/[id]` | – | ✓✓– | ✓ | ~ | ~ | ~ |
| · Ny turnering | `/admin/tournaments/ny` | – | --- | ✓ | ~ | ~ | ~ |
| · Dubletter (rydd) | `/admin/tournaments/dubletter` | – | --- | ✓ | ~ | ~ | ~ |
| Økter | `/admin/okter` | – | --- | ✓ | ~ | ~ | ~ |
| Videoer | `/admin/videoer` | – | --- | ✓ | ~ | ~ | ~ |
| Opptak | `/admin/recording` | – | --- | ✓ | ~ | ~ | ~ |

### Gjennomføre (daglig drift)

| Skjerm | Adresse | Design | Mob/Desk/iPad | Adresse-ok | Flyt | Data | Funker |
|---|---|---|---|---|---|---|---|
| Daglig drift (hub) | `/admin/gjennomfore` | ~ | --- | ✓ | ~ | ~ | ~ |
| · Økt-detalj | `/admin/gjennomfore/okter/[id]` | – | --- | ✓ | ~ | ~ | ~ |
| Kalender | `/admin/kalender` | – | –✓– | ✓ | ✓ | ✓ | ✓ |
| · Uke (redirect) | `/admin/kalender/uke` → `/admin/kalender` | – | –✓– | ✓ | ✓ | ✓ | ✓ |
| · Måned | `/admin/kalender/maned` | – | ✓✓– | ✓ | ~ | ✓ | ✓ |
| Kalender (alt. → redirect) | `/admin/calendar` | – | --- | ✓ | ✓ | – | ✓ |
| · Måned (alt. → redirect) | `/admin/calendar/maned` | – | --- | ✓ | ✓ | – | ✓ |
| **Bookinger** ★ | `/admin/bookinger` | – | –✓– | ✓ | ✓ | ✓ | ✓ |
| · Ny booking | `/admin/bookinger/ny` | – | --- | ✓ | ~ | ~ | ~ |
| Anlegg | `/admin/anlegg` | – | –✓– | ✓ | ✓ | ✓ | ✓ |
| · Anlegg-detalj | `/admin/anlegg/[id]` | – | --- | ✓ | ~ | ~ | ~ |
| Tilgjengelighet | `/admin/availability` | – | –✓– | ✓ | ✓ | ✓ | ✓ |
| Kapasitet | `/admin/kapasitet` | – | --- | ✓ | ~ | ~ | ~ |
| Tjenester/priser | `/admin/services` | – | –✓– | ✓ | ✓ | ✓ | ✓ |
| Fasiliteter (alt.) | `/admin/facilities` | – | --- | ✓ | ~ | ~ | ~ |
| · Fasilitet-detalj | `/admin/facilities/[id]` | – | --- | ✓ | ~ | ~ | ~ |
| Lokasjoner | `/admin/locations` | – | --- | ✓ | ~ | ~ | ~ |
| TrackMan (på tvers) | `/admin/trackman` | – | --- | ✓ | ~ | ~ | ~ |
| Live-økt: brief (coach) | `/admin/live/[sessionId]/brief` | – | --- | ✓ | ✓ | ✓ | ✓ |
| Live-økt: aktiv (coach) | `/admin/live/[sessionId]/active` | – | --- | ✓ | ✓ | ✓ | ✓ |
| Live-økt: oppsummering (coach) | `/admin/live/[sessionId]/summary` | – | --- | ✓ | ✓ | ✓ | ✓ |
| Coach-workbench (prototype) | `/admin/coach-workbench` | – | --- | ✓ | – | ~ | ~ |

### Innsikt (analyse på tvers)

| Skjerm | Adresse | Design | Mob/Desk/iPad | Adresse-ok | Flyt | Data | Funker |
|---|---|---|---|---|---|---|---|
| Innsikt-hub | `/admin/analysere` | ~ | --- | ✓ | ~ | ~ | ~ |
| · Compliance | `/admin/analysere/compliance` | – | ✓✓– | ✓ | ~ | ✓ | ✓ |
| Stall-analyse | `/admin/analyse` | – | ~✓– | ✓ | ✓ | ✓ | ✓ |
| Analytics | `/admin/analytics` | – | --- | ✓ | ~ | ~ | ~ |
| Lag-snitt | `/admin/lag-snitt` | – | ~✓– | ✓ | ✓ | ✓ | ✓ |
| · Fasiter (autosync) | `/admin/tester/benchmarks` | – | ✓✓– | ✓ | ✓ | ✓ | ✓ |
| Tester (på tvers) | `/admin/tester` | – | ✓✓– | ✓ | ✓ | ✓ | ✓ |
| · Test-detalj | `/admin/tester/[id]` | – | ✓✓– | ✓ | ✓ | ✓ | ~ |
| · Foreslåtte tester | `/admin/tester/foreslatte` | – | --- | ✓ | ~ | ~ | ~ |
| · Tildel test | `/admin/tester/tildel/[spillerId]` | – | ✓✓– | ✓ | ✓ | ✓ | ~ |
| Økt-forespørsler | `/admin/foresporsler` | – | –✓– | ✓ | ✓ | ✓ | ✓ |
| Godkjenninger | `/admin/godkjenninger` | – | –✓– | ✓ | ✓ | ✓ | ✓ |
| · Godkjenning-detalj | `/admin/godkjenninger/[id]` | – | --- | ✓ | ~ | ~ | ~ |
| Godkjenninger (alt. → redirect) | `/admin/approvals` | – | --- | ✓ | ✓ | – | ✓ |
| · Approval-detalj (alt. → redirect) | `/admin/approvals/[id]` | – | --- | ✓ | ✓ | – | ✓ |
| Rapporter | `/admin/reports` | – | –✓– | ✓ | ✓ | ✓ | ✓ |
| Runder (på tvers) | `/admin/runder` | ~ | --- | ✓ | ~ | ~ | ~ |
| Skader/sykdom (tilstander) | `/admin/tilstander` | – | --- | ✓ | ~ | ~ | ~ |
| Finans (alt. → redirect) | `/admin/finance` | – | --- | ✓ | ✓ | – | ✓ |
| **Økonomi (MRR/betalinger)** | `/admin/okonomi` | – | –✓– | ✓ | ~ | ✓ | ~ |
| Stats-oversikt | `/admin/stats/overview` | – | --- | ✓ | ~ | ~ | ~ |
| Stats-moderering | `/admin/stats/moderering` | – | --- | ✓ | ~ | ~ | ~ |

### Admin (organisasjon og innstillinger)

| Skjerm | Adresse | Design | Mob/Desk/iPad | Adresse-ok | Flyt | Data | Funker |
|---|---|---|---|---|---|---|---|
| Organisasjon-hub | `/admin/organisasjon` | – | --- | ✓ | ~ | ~ | ~ |
| Klubb-innstillinger | `/admin/klubb/innstillinger` | – | --- | ✓ | ~ | ~ | ~ |
| Integrasjoner | `/admin/integrasjoner` | – | --- | ✓ | ~ | ~ | ~ |
| Innstillinger | `/admin/settings` | – | –✓– | ✓ | ✓ | ✓ | ✓ |
| · API | `/admin/settings/api` | – | --- | ✓ | ~ | ~ | ~ |
| · Kalender | `/admin/settings/calendar` | – | --- | ✓ | ~ | ~ | ~ |
| · Sikkerhet | `/admin/settings/security` | – | --- | ✓ | ~ | ~ | ~ |
| · Tilgang | `/admin/settings/tilgang` | – | --- | ✓ | ~ | ~ | ~ |
| Team | `/admin/team` | – | --- | ✓ | ~ | ~ | ~ |
| · Inviter | `/admin/team/inviter` | – | --- | ✓ | ~ | ~ | ~ |
| Audit-log | `/admin/audit-log` | – | --- | ✓ | ~ | ~ | ~ |
| · Audit-detalj | `/admin/audit-log/[id]` | – | --- | ✓ | ~ | ~ | ~ |
| AI-agenter | `/admin/agents` | – | --- | ✓ | ~ | ~ | ~ |
| · Agent-detalj | `/admin/agents/[agentId]` | – | --- | ✓ | ~ | ~ | ~ |
| E-postmaler | `/admin/email-templates` | – | --- | ✓ | ~ | ~ | ~ |
| · Rediger e-postmal | `/admin/email-templates/[id]/rediger` | – | --- | ✓ | ~ | ~ | ~ |
| Profil | `/admin/profile` | – | --- | ✓ | ~ | ~ | ~ |
| Hjelp | `/admin/hjelp` | – | --- | ✓ | ~ | ~ | ~ |
| Caddie (alt. adresse) | `/admin/caddie` | – | --- | ✓ | ~ | ~ | ~ |
| Design-godkjenning | `/admin/godkjenn-portal` | – | --- | ✓ | ~ | ~ | ~ |
| · Koblinger | `/admin/godkjenn-portal/koblinger` | – | --- | ✓ | ~ | ~ | ~ |
| · Kobling-detalj | `/admin/godkjenn-portal/koblinger/[id]` | – | --- | ✓ | ~ | ~ | ~ |
| · Review | `/admin/godkjenn-portal/review` | – | --- | ✓ | ~ | ~ | ~ |

> Merknad: Flere AgencyOS-funksjoner finnes på to adresser samtidig (f.eks. `/admin/finance` og `/admin/okonomi`, `/admin/kalender` og `/admin/calendar`, `/admin/innboks` og `/admin/messages`, `/admin/godkjenninger` og `/admin/approvals`, `/admin/plans/templates` og `/admin/plan-templates`). Det er dobbeltarbeid som bør ryddes — se «Veien til 100%».

---

## Skjermene — Auth + Forelder + Marketing + System

### Auth (innlogging og oppstart)

| Skjerm | Adresse | Design | Mob/Desk/iPad | Adresse-ok | Flyt | Data | Funker |
|---|---|---|---|---|---|---|---|
| Logg inn ★ | `/auth/login` | – | ✓✓✓ | ✓ | ✓ | ✓ | ✓ |
| Registrer ★ | `/auth/signup` | – | ✓✓✓ | ✓ | ✓ | ✓ | ✓ |
| Glemt passord ★ | `/auth/forgot-password` | ✓ | ✓✓✓ | ✓ | ✓ | ✓ | ✓ |
| Tilbakestill passord | `/auth/reset-password` | ✓ | --- | ✓ | ~ | ~ | ~ |
| Sjekk e-post | `/auth/check-email` | ✓ | --- | ✓ | ~ | ~ | ~ |
| BankID ★ | `/auth/bankid` | – | ✓✓✓ | ✓ | ✓ | ✓ | ✓ |
| Onboarding (spiller, 8 steg) | `/auth/onboarding` | – | ✓✓– | ~ | ~ | – | ✓ |
| Onboarding (forelder) | `/auth/onboarding/forelder` | – | --- | ✓ | ~ | ~ | ~ |
| Foreldresamtykke (token) | `/auth/guardian-consent/[token]` | ✓ | --- | ✓ | ~ | ~ | ~ |
| Samtykke venter | `/auth/samtykke-venter` | ✓ | --- | ✓ | ~ | ~ | ~ |
| Logget ut | `/auth/logget-ut` | – | ✓✓– | ✓ | ~ | – | ✓ |

### Forelder (foreldreportal)

| Skjerm | Adresse | Design | Mob/Desk/iPad | Adresse-ok | Flyt | Data | Funker |
|---|---|---|---|---|---|---|---|
| Forelder-hjem | `/forelder` | – | ✓✓– | ✓ | ~ | – | ~ |
| Barn (oversikt) | `/forelder/barn` | – | ✓✓– | ✓ | ~ | ~ | ✓ |
| · Barn-detalj | `/forelder/barn/[childId]` | – | ✓✓– | ✓ | ~ | – | ~ |
| Bookinger | `/forelder/bookinger` | – | --- | ✓ | ~ | ~ | ~ |
| Coach | `/forelder/coach` | – | --- | ✓ | ~ | ~ | ~ |
| Fakturaer | `/forelder/fakturaer` | – | --- | ✓ | ~ | ~ | ~ |
| Økonomi | `/forelder/okonomi` | – | --- | ✓ | ~ | ~ | ~ |
| Samtykke | `/forelder/samtykke` | – | --- | ✓ | ~ | ~ | ~ |
| Ukerapport | `/forelder/ukerapport` | – | --- | ✓ | ~ | ~ | ~ |
| Innstillinger | `/forelder/innstillinger` | – | --- | ✓ | ~ | ~ | ~ |
| Varsler | `/forelder/varsler` | – | --- | ✓ | ~ | ~ | ~ |
| Inviter forelder (token) | `/inviter/forelder/[token]` | – | --- | ✓ | ~ | ~ | ~ |

### Marketing (akgolf.no — offentlige sider)

| Skjerm | Adresse | Design | Mob/Desk/iPad | Adresse-ok | Flyt | Data | Funker |
|---|---|---|---|---|---|---|---|
| Forside | `/(marketing)` | – | ✓✓– | ~ | ~ | – | ✓† | 
| Anlegg | `/(marketing)/anlegg` | – | --- | ✓ | ~ | ~ | ✓ |
| · Anlegg-detalj | `/(marketing)/anlegg/[slug]` | – | --- | ✓ | ~ | ~ | ✓ |
| Blogg | `/(marketing)/blogg` | ✓ | --- | ✓ | ~ | ~ | ✓ |
| · Blogg-innlegg | `/(marketing)/blogg/[slug]` | ✓ | --- | ✓ | ~ | ~ | ✓ |
| Booking | `/(marketing)/booking` | – | --- | ✓ | ~ | ~ | ✓ |
| · Booking-tjeneste | `/(marketing)/booking/[slug]` | – | --- | ✓ | ~ | ~ | ~ |
| · Booking bekreft | `/(marketing)/booking/[slug]/bekreft` | – | --- | ✓ | ~ | ~ | ~ |
| · Booking kvittering | `/(marketing)/booking/kvittering/[bookingId]` | – | --- | ✓ | ~ | ~ | ~ |
| Cases | `/(marketing)/cases` | ✓ | --- | ✓ | ~ | ~ | ✓ |
| Coacher | `/(marketing)/coacher` | ✓ | --- | ✓ | ~ | ~ | ✓ |
| · Coach-profil | `/(marketing)/coacher/[slug]` | – | --- | ✓ | ~ | ~ | ✓ |
| Coaching | `/(marketing)/coaching` | – | --- | ✓ | ~ | ~ | ✓ |
| Junior | `/(marketing)/junior` | – | --- | ✓ | ~ | ~ | ✓ |
| Priser | `/(marketing)/priser` | – | --- | ✓ | ~ | ~ | ✓ |
| PlayerHQ (salgsside) | `/(marketing)/playerhq` | – | --- | ✓ | ~ | ~ | ✓ |
| Om oss | `/(marketing)/om-oss` | ✓ | --- | ✓ | ~ | ~ | ✓ |
| Kontakt | `/(marketing)/kontakt` | ✓ | --- | ✓ | ~ | ~ | ✓ |
| Jobb | `/(marketing)/jobb` | – | --- | ✓ | ~ | ~ | ✓ |
| FAQ | `/(marketing)/faq` | – | --- | ✓ | ~ | ~ | ✓ |
| Suksess | `/(marketing)/suksess` | ✓ | --- | ✓ | ~ | ~ | ✓ |
| Treningsfilosofi | `/(marketing)/treningsfilosofi` | ✓ | --- | ✓ | ~ | ~ | ✓ |
| Turneringer | `/(marketing)/turneringer` | – | --- | ✓ | ~ | ~ | ✓ |
| · Turnering-detalj | `/(marketing)/turneringer/[slug]` | – | --- | ✓ | ~ | ~ | ✓ |
| Cookies | `/(marketing)/cookies` | – | --- | ✓ | ~ | ~ | ✓ |
| Personvern | `/(marketing)/personvern` | – | --- | ✓ | ~ | ~ | ✓ |
| Vilkår | `/(marketing)/vilkar` | – | --- | ✓ | ~ | ~ | ✓ |

#### Marketing → Stats (det store offentlige stats-universet)

Dette er en stor offentlig statistikk-seksjon (PGA-tall, norske spillere, verktøy osv.). Den er funksjonell med ekte data, men ikke pusset opp til v10-design. Gruppert kompakt her — alle adressene under begynner med `/(marketing)`:

| Område | Adresse(r) (under `/(marketing)/stats/...`) | Design | Adresse-ok | Data | Funker |
|---|---|---|---|---|---|
| Stats-forside + uka + 2026 | `stats`, `stats/uka`, `stats/2026` | – | ✓ | ~ | ✓ |
| Spillere + årgang | `stats/spillere`, `stats/spillere/[slug]`, `stats/aargang`, `stats/aargang/[aar]` | – | ✓ | ✓ | ✓ |
| Baner + klubber + regioner | `stats/baner(/[slug])`, `stats/klubber(/[slug])`, `stats/regions(/[slug])` | – | ✓ | ✓ | ✓ |
| Turneringer (offentlig) | `stats/turneringer(/[slug])(/statistikk)`, `stats/tour/[slug]` | – | ✓ | ✓ | ✓ |
| Leaderboards + norske + PGA | `stats/leaderboards`, `stats/norske`, `stats/pga` (+ drive-distance, fairway-pct, gir-pct, putt-explorer, putts-per-round, scoring-avg, sg-total, spillere, spillere/[dg_id]) | – | ✓ | ✓ | ✓ |
| Verktøy (kalkulatorer) | `stats/verktoy` (+ avstand, score-til-hcp, sg-estimator, tour-ekvivalent, whs-kalkulator) | – | ✓ | ✓ | ✓ |
| Sammenlign + SG-sammenlign | `stats/sammenlign-spillere`, `stats/sg-sammenlign(/start)(/resultat/[id])` | – | ✓ | ✓ | ✓ |
| Blogg + søk + quiz + wrapped + min progresjon | `stats/blogg(/[slug])`, `stats/sok`, `stats/quiz`, `stats/wrapped/[slug]`, `stats/min-progresjon` | – | ✓ | ✓ | ✓ |

### System + interne sider (ikke for vanlige brukere)

| Skjerm | Adresse | Merknad |
|---|---|---|
| Offline-side | `/offline` | Vises uten nett. Funker. Ingen v10-design nødvendig. |
| 404 (ikke funnet) | (system) | Nytt v10-design bygget i forhåndsvisning i natt (`mx-404.png`). Ikke koblet til appens ekte «ikke funnet»-side ennå. |
| Onboard coach | `/onboard/coach` | 4-stegs coach-oppstart. Ingen v10-design. |
| Onboard klubb | `/onboard/klubb` | 5-stegs klubb-oppstart. Ingen v10-design. |
| Design-system (internt) | `/(internal)/design-system`, `/design-system-v2` | Utviklerverktøy. Ikke en brukerskjerm. |
| Demoer (internt) | `/(internal)/demos/*` (newplan, ny-okt, plan-bygger, trackman-import) | Test-/demo-sider. Ikke ekte skjermer. |
| Komponent-demoer (internt) | `/intern/komponenter/*`, `/demo`, `/hull-demo`, `/kalender-demo`, `/kalender-maaned-demo`, `/lokasjoner-demo`, `/sesjon-opptak-demo`, `/talent-*-demo` | Interne testflater for komponenter. Ikke ekte skjermer — vurder å rydde bort før lansering. |

> Disse interne/demo-adressene (rundt 29 stk) er IKKE ekte brukerskjermer og teller ikke som «mangler design». De er verktøy for utvikling, og flere bør fjernes før lansering.

---

## Tegnet, men ikke brukt ennå (drop-off)

Dette er det viktigste å passe på: ting designeren (Claude Design) har tegnet ferdig, men som ennå IKKE har funnet veien inn i appen som en ekte, koblet skjerm. Målet er at denne lista skal bli tom.

### A. Ferdige skjermbilder uten en oppdatert ekte skjerm

Designeren leverte 44 ferdige skjermbilder. De fleste er nå bygget i forhåndsvisning (pulje 1 + 2) eller har en motpart i appen. Disse har et bilde, men skjermen i appen er enten ikke pusset opp eller ikke koblet til ekte adresse ennå:

| Tegnet skjermbilde | Hører hjemme på | Status |
|---|---|---|
| `mx-404.png` (404-side) | Appens «ikke funnet»-side | Bygget i forhåndsvisning. Mangler kobling til ekte side. Enkel jobb — bør gjøres. |
| `pl-onboarding.png` | `/auth/onboarding` | Bygget i forhåndsvisning (liksom-tall). Mangler ekte data + ekte adresse. |
| `pl-forelder.png` | `/portal/meg/foreldre` (eller foreldreportalen) | Bygget i forhåndsvisning (liksom-tall). Mangler ekte data + ekte adresse. |
| `pl-varsler.png` | `/portal/varsler` | Bygget i forhåndsvisning (liksom-tall). Mangler ekte data + ekte adresse. |
| `pl-innstillinger.png` | `/portal/meg/innstillinger` | Bygget i forhåndsvisning (liksom-tall). Mangler ekte data + ekte adresse. |
| `pl-trackman.png` | `/portal/mal/trackman` | Bygget i forhåndsvisning (liksom-tall). Mangler ekte data + ekte adresse. |
| `pl-turnering.png` | `/portal/tren/turneringer` | Bygget i forhåndsvisning (liksom-tall). Mangler ekte data + ekte adresse. |
| `fo-barn.png` (forelder ser barn) | `/forelder/barn` | Bygget i forhåndsvisning (liksom-tall). Mangler ekte data + ekte adresse. |
| `ag-caddie.png` (coach AI-chat) | `/admin/agencyos/caddie` | Bygget i forhåndsvisning (liksom-tall). Mangler ekte data + ekte adresse. |
| `ag-compare.png` (sammenlign spillere) | `/admin/talent/sammenligning` | Bygget i forhåndsvisning (liksom-tall). Mangler ekte data + ekte adresse. |
| `ag-compliance.png` | `/admin/analysere/compliance` | Bygget i forhåndsvisning (liksom-tall). Mangler ekte data + ekte adresse. |
| `ag-drift.png` (drift/anlegg) | `/admin/anlegg` / drift-sidene | Bygget i forhåndsvisning (liksom-tall). Mangler ekte data + ekte adresse. |
| `ag-kalender.png` | `/admin/kalender` | Bygget i forhåndsvisning (liksom-tall). Mangler ekte data + ekte adresse. |
| `ag-tester.png` | `/admin/tester` | Bygget i forhåndsvisning (liksom-tall). Mangler ekte data + ekte adresse. |
| `mk-forside.png` (marketing-forside) | `/(marketing)` | Bygget i forhåndsvisning (liksom-tall). Mangler ekte data + ekte adresse. |

> De øvrige skjermbildene (f.eks. `pl-hjem`, `pl-sghub`, `pl-runder`, `pl-live-*`, `ag-dashboard`, `ag-stallen`, `ag-innboks`, `ag-spiller`, `ag-workbench`, `au-login` m.fl.) er allerede tatt i bruk eller bygget i forhåndsvisning i natt — de er IKKE drop-off.

### B. Ferdige design-komponenter (HTML) uten en plass i appen

Designeren leverte 47 ferdige komponent-design (HTML-biter). Mange er brukt i skjermene over. Disse er IKKE tydelig tatt i bruk ennå, og bør finne et hjem:

**PlayerHQ-komponenter som ennå ikke er synlig brukt:**

| Tegnet komponent | Hva det er | Hører hjemme på |
|---|---|---|
| `components-voice-input.html` | Snakk-inn-tall (stemme-logging) | ✅ Bygget som `MicButton` (`src/components/shared/mic-button.tsx`): standalone + suffix-variant, Web Speech API norsk, 4 tilstander (idle/recording/transcribing/done). Integrert i live-meldingsfeltet (`/admin/live/[sessionId]/active`) — coach kan diktere meldinger. |
| `components-credit-indicator.html` | «Du har X klipp igjen»-måler | ✅ Bygget i Booking-hub (`/portal/booking`) som `CreditMeter` — segment-søyle med warn/danger-logikk + saldo/brukt/gjenstår. |
| `components-gap-to-drill.html` | «Din svakhet → denne øvelsen»-bro | ✅ Bygget i SG-Hub (`/portal/mal/sg-hub`) — kjede-strip DATA→DRILL→PLAN + drill-kort med lime-border + alternativer. Vises kun ved negative SG-data. |
| `components-insight-narrative.html` | AI-fortelling i ord om formen din | ✅ Bygget som `InsightNarrativeCard` (`src/components/portal/insight/insight-narrative-card.tsx`) — 7-del anatomi (strip · kicker · tittel · lede · pivots · rec-block · footnote), 5 strip-varianter (left-strip, ikke top). Koblet til (1) `/portal/analysere` fanen «Innsikt» via `InsightNarrativeData`-mapper i `analysere-data.ts`, og (2) `/portal/mal/sg-hub` via payload-mapper `mapInsightToCard` — topp 3 uløste SgInsights. |
| `components-season-timeline.html` | Tidslinje for hele sesongen | ✅ Bygget som `Aarsplan`-komponenten (`src/components/portal/aarsplan/aarsplan.tsx`) — Gantt-kart på `/portal/tren/aarsplan`. Portet fra fasit + skjerm-PNG. |
| `components-test-week.html` | «Testuke»-oppsett | ✅ Bygget som `TestUkeKommende` (spiller) + `TestUkeTrigger` (coach/admin). Aktiveres når TestWeek-modell kobles — returnerer null til da. Kobling: `/portal/tren/tester` + `/admin/tester`. |
| `components-course-heatmap.html` | Varmekart over banen | Hull-analyse (`/portal/analysere/hull`). Delvis. |
| `components-trackman-stability.html` | TrackMan stabilitet-graf | ✅ Bygget i `/portal/mal/trackman/[id]` som `StabilitetSeksjon`: varians-heatmap (6 param × N køller, 5-nivå fargeskala), stabilitets-score 1-10, callouts + bias/spredning SVG-minikart. |
| `components-trackman-trend.html` | TrackMan trend-graf | ✅ Bygget i `/portal/mal/trackman` som `TrackManTrendSeksjon` (KPI-strip avg. carry + klubbhastighet m/ sparklines, per-kølle carry-trender fra CLUB_AVG-signaler). |
| `components-sg-training-scatter.html` | SG vs trening punktsky | ✅ Bygget i `/portal/mal/sg-hub` som `SgTrainingScatter`: hero scatter (APP/innspill) + 4 mini-multiples per kategori, lineær regresjon, R², 95 %-konfidensband beregnet server-side fra TrainingLog + Round. Tom-tilstand når < 4 datapunkter. |

**AgencyOS-komponenter som ennå ikke er synlig brukt:**

| Tegnet komponent | Hva det er | Hører hjemme på |
|---|---|---|
| `components-co-agent.html` | Coachens AI-medhjelper-panel | ✅ Bygget på `/admin/caddie` som `CoAgent` — utkast/godkjenning, agent-fleet-tabell, audit-log. Kobler til `loadCoAgent` Prisma-data. |
| `components-multi-compare.html` | Sammenlign flere spillere side om side | ✅ Bygget og koblet til `/admin/talent/sammenligning` — v10 full 4-panel-komponent (side-om-side · pyramide · kohort-rangering · region-fordeling) via `mapCompareData`-mapper. |
| `components-coach-mobile.html` | Coach-visning på mobil | Mobil-utgave av AgencyOS. Ikke bygget (AgencyOS er laget for data/desktop først). |
| `components-foreldre.html` | Foreldre-komponent for coach | ✅ Bygget som `ForeldreInfo` på `/portal/meg/foreldre` — viser spillerens egne foresatte fra Prisma parentRelation. Invite-modal + server actions. |
| `components-cmdk.html` | Hurtigsøk-boks (⌘K) | ✅ `GlobalSearchModal` (`src/components/admin/global-search-modal.tsx`) — mountet i AdminShell. Cmd+K, debounced API, 17 hurtig-handlinger, spillere/planer/bookinger/ruter, tastaturnav, focus-trap. |

**Coach-flyter (flyt-spesifikasjon, ny i leveranse 3. juni):** `Coach-flyter.html` (+ offline-bundle)
er en interaktiv prototype som viser hvordan coachen navigerer GJENNOM AgencyOS-skjermene
(flere flyter: innboks → godkjenn → plan o.l.). Ikke nye enkeltskjermer — men fasit for
«Flyt»-haken når AgencyOS-skjermene kobles. Bruk den som referanse for knapp-til-knapp-flyt.
Arkivert kilde: `public/design-handover/ak-golf-hq-design-system-2026-06-03.zip`.

### C. Hele «Elite»-pakken er tegnet, men ikke i bruk

Designeren har levert en egen elite-mappe (spredningsverktøy for utslag — «dispersion»):

- `elite/DispersionTool.html`, `elite/Utslag-spredning.html`, `elite/components-trackman-dispersion.html`.
- `Break-tabell.html` — putting green-reading-/break-tabell. **BYGGET 11. juni** → `/portal/trening/break-tabell`. Tre varianter: komplett matrise med heatmap, interaktiv break-kalkulator (inkl. opp/ned-fart), og hastighets-sammenligning.
- `Putte-verktoy.html` — putting-verktøy (**BYGGET 11. juni** → `/portal/trening/putte-laboratoriet`). Alle tre retninger (Greenen/Kjeden/Kontroll) portert med ekte fysikkberegninger fra putt-core.ts. Desktop-verifisert.

Dette hører hjemme i elite-/talent-delen (f.eks. shot-map/dispersjon: `/portal/statistikk/shot-map` eller talent-radar). **Bevisst utsatt** — «Elite Fase 2» er parkert. Det er greit at den ligger ubrukt nå, men den må ikke glemmes når Elite Fase 2 starter.

### D. UI-kits (byggeklosser, ikke skjermer)

Designeren leverte fem komplette «verktøykasser» (UI-kits) med farger, knapper og maler: booking, coachhq, marketing, playerhq og en felles. Disse er IKKE enkeltskjermer, men grunnlaget alt bygges på. De brukes løpende når skjermene pusses opp. Ingen handling i seg selv — men sjekk at fargene og knappene faktisk matcher det vi bygger.

---

## Mangler helt

Skjermer/funksjoner som planen vår (manifestene) sier vi trenger, men som ikke har noen ferdig design eller ikke kan bygges ennå:

1. **Shot-map / spredningsplott** (`/portal/statistikk/shot-map`) — designet finnes (elite-pakken), men databasen mangler punkt-koordinater for hvert slag. Kan ikke vise ekte data før datamodellen utvides. (Notert som data-blokkert.)
2. **Scorecard per runde, hull-for-hull** (`/portal/tren/turneringer/[id]/runde/[nr]`) — mangler i databasen; `Round` har bare totalscore, ikke hull-for-hull. Data-blokkert.
3. **Live turnerings-tracking** (`/portal/tren/turneringer/[id]/live`) — hele live-scoring-dataflyten mangler. Data-blokkert.
4. **Fellesmelding til turneringsdeltakere** — planen for AgencyOS sier vi skal kunne sende én melding til alle deltakerne i en turnering. Flyten er beskrevet, men ingen ferdig design er levert for selve «velg deltakere → skriv → send»-stegene. Trenger design.
5. **Spiller↔gruppe-veksler** (player-picker alltid øverst i AgencyOS) — beskrevet i planen som en ny fast del av toppmenyen, men ikke levert som design. Trenger design.
6. **Fokus-spiller-blokk med pin + AI-forslag** — delvis bygget på cockpit, men «pin manuelt»-mekanismen + AI-forslagsfeltet er ikke ferdig designet. Trenger design.
7. **Mobil-utgave av Workbench og AgencyOS** — designet er laget for stor skjerm (desktop). Mobil-varianter er ikke tegnet for disse to. Spørsmål til deg: trengs mobil her før lansering, eller holder desktop?

---

## Veien til 100% (rekkefølge)

Enkle bolker, i den rekkefølgen som gir minst risiko og raskest synlig fremgang.

**Bolk 1 — Gjør ferdig det som ble bygget i natt (ingen nytt design trengs).**
De 43 skjermene som er tegnet og bygget i forhåndsvisning (PlayerHQ-hjem, SG-Hub, Live-økt, Runder, Statistikk, Analyse, Meg, Abonnement, Drills, Tester, Årsplan, Booking, Varsler, Innstillinger, TrackMan, Turneringer, Logg ny runde, Forelder-side, Onboarding + AgencyOS cockpit, Spillere, Innboks, Spiller-detalj, Kalender, Bookinger, Tester, Turneringer, Caddie, Sammenlign, Compliance, Drift + auth-sider + marketing-forside): flytt dem fra forhåndsvisning til ekte adresse, koble på ekte data, og test. Mål: alle seks haker grønne.

**Bolk 2 — Plukk de enkle drop-off-skjermbildene (kan bygges selv).**
404-siden mangler fortsatt kobling. Andre tegnede skjermbilder som ennå ikke er bygget kobles på. Disse er tegnet og venter — bare å koble på.

**Bolk 3 — Ta i bruk de tegnede komponentene (kan bygges selv).**
Bygg inn stemme-logging, credit-måler, svakhet-til-drill-bro, sesong-tidslinje, TrackMan-grafene og spiller-sammenligning der de hører hjemme (se drop-off-liste B). Da blir flere skjermer komplette samtidig.

**Bolk 4 — Rydd dobbeltadressene (kan bygges selv).**
Velg én adresse per funksjon der det finnes to (finance/okonomi, kalender/calendar, innboks/messages, plans-templates/plan-templates, godkjenninger/approvals, agencyos-spillere/spillere, og på spillersiden stats/statistikk, analyse/analysere, drills/ovelser). Behold én, la den andre peke videre. Mindre forvirring, mindre å vedlikeholde.

**Bolk 5 — Det som trenger nytt design fra deg (Anders).**
Disse kan vi ikke bygge riktig før du har godkjent et design:
- Fellesmelding til turneringsdeltakere (velg → skriv → send).
- Spiller↔gruppe-veksler øverst i AgencyOS.
- Fokus-spiller med manuell pin + AI-forslag.
- Avgjørelse: trengs mobil-utgave av Workbench/AgencyOS nå?

**Bolk 6 — Det som er data-blokkert (krever databasearbeid først).**
Shot-map/spredning, scorecard hull-for-hull, live turnerings-tracking. Her må vi bygge ut databasen og en måte å samle inn tallene på FØR skjermene kan vise ekte data. Ikke noe vi løser med design.

**Bolk 7 — Elite Fase 2 (bevisst utsatt).**
Hele talent-/elite-delen + den tegnede elite-spredningspakken tas når du sier fra. Designet ligger klart.

---

> Når en rad over endrer seg: oppdater de seks hakene her med en gang. Det er den eneste måten denne planen holder seg sann.

---

## Endringslogg

Full kronologisk byggehistorikk flyttet til [`docs/arkiv/master-skjermplan-endringslogg.md`](arkiv/master-skjermplan-endringslogg.md)
2026-07-06 — denne fila var 822 linjer og loggen drukna den faktiske statustabellen. Siste hendelser:

- 8. juli (opprydding Fase 4, bølge 1 — src/components → golfdata, branch `opprydding/token-konvergens`):
  **Delte komponenter over på golfdata-kanon.** Nye porter fra det levende Claude Design-prosjektet
  (DesignSync): `MaanedKalender` (varme + piller m/ DnD) og `FilterPills` → `golfdata/`.
  Migrert: Kommando-kalenderen (`/kommando/kalender`) og gruppe-kalenderen (`/team-wang`) fra gamle
  MonthGrid/WeekGrid til MaanedKalender (piller) + TidsGrid; StatusPill→Tag (spiller-panel),
  RoleBadge/PeriodeTag→Tag-komposisjoner m/ aksefarge-tokens (team-kit), FilterPillBar→FilterPills
  (drill-library/søkemodal). GAP MELDT (ikke improvisert, beholdt m/ disable): PulseDot/PresenceDot/
  SeverityDot (DS mangler status-dot-primitiv), PyrDistBar (DS mangler aksefordelings-bar),
  YearPlanGantt (DS Periodeplan er L-fase-låst — mangler AK-periode-årsgantt), VisningsVelger mangler
  «år»-visning, Tag mangler warn-variant (fra Fase 3). Kommando-kalender verifisert visuelt (piller +
  i dag + «+N flere» på ekte bookinger). NB: /team-wang 500-er pga. pre-eksisterende DB-drift
  (group_schedules.maxParticipants mangler i DB) — flagget som egen oppgave, urelatert til bølgen.
  tsc + eslint + hex-gate + build grønt, 342/342 tester, Playwright-diff mot Fase 0-baseline uendret.

- 7. juli (GFGK treningsplanlegger, del 2 av firepart-samarbeidet): **Ny åpen GFGK Junior-side.**
  `/gfgk-junior` viser alle 4 GFGK-aldersgrupper (Mini/Basis/Utvikling/Elite) med fanevalg —
  ekte `GroupSchedule`-data, ingen personlig spillerinfo. Delte kalender-byggeklosser omdøpt fra
  `wang-kalender`→`gruppe-kalender` (var WANG-navngitt, men egentlig generisk — nå bekreftet
  gjenbrukt for GFGK). Ny `FlereGrupperKalender`-komponent for fanevalg mellom flere grupper på
  samme side. Domenene `wanggolffredrikstad` (→ `/team-wang`) og `gfgkjunior.no` (→ `/gfgk-junior`)
  kan pekes hit i Vercel når Anders bekrefter DNS-steget. Bygget isolert på
  `feature/gfgk-treningsplan`-worktree. tsc 0 feil, build grønt, 326/326 tester.

- 7. juli (WANG treningsplanlegger, prosjektforespørsel): **WANG-gruppe seedet + ny åpen side + VG-filter.** `Group`/`GroupSchedule` for WANG Toppidrett + 4 GFGK-grupper skrevet til DB (var kun definert i seed.ts, aldri kjørt); ny `training_periods`-tabell + `User.schoolYear`-felt lagt til additivt (`db execute`, ikke migrate/push — se gotchas.md). Ny offentlig side `/team-wang` (ingen innlogging, ingen personlig spillerdata) viser årshjul/måned/uke fra ekte `GroupSchedule`+`TrainingPeriod`-data via gjenbrukte `YearPlanGantt`/`MonthGrid`/`WeekGrid`. VG-trinn (VG1/VG2/VG3) lagt til som redigerbart felt på spiller (`/admin/spillere/[id]/rediger`) + filter/badge på gruppe-roster (`/admin/grupper/[id]`). Bygget isolert på `feature/wang-treningsplanlegger`-worktree. tsc 0 feil, build grønt, 326/326 tester.

- 6. juli (design-bølge D3): **9 PlayerHQ-skjermer løftet til v13-referanseanatomien** (golfdata-scope-wrapper `max-w-[460px]→md:860`, Eyebrow-komponent + display-h1 med italic-em): `/portal/coach/sporsmal` re-komponert fra gammel CLI-stil til Card-rader med status-Tag (Besvart/Åpent) og avatar-initialer; `/portal/coach` + `melding` + `ovelser` (Tag-filterchips) + `videoer` + `plans` konsistens-pass; `/portal/statistikk`-hub wrapper; `/portal/utfordringer` + `[id]` (detalj: Eyebrow/h1-hero, golfdata Button/Card/KpiTile — kun token/anatomi-løft, score-registrering trenger ekte redesign, meldt som gap). Design-haker satt til ~ (golfdata-kit-komposisjon per prompt.md-kontraktene gjenstår). tsc + eslint grønt.
- 6. juli (design-bølge D2): **4 AgencyOS-skjermer kalibrert til ui.tsx-fasitstandarden** (`/admin/analysere`, `/admin/runder`, `/admin/gjennomfore`, `/admin/workspace`): AgPage + AgPageHead-anatomi, hub-nav-kort re-komponert med Tailwind-tokens (gamle HubFrame/hubs.css med rå hex ute av disse rutene), runder-tabellen på AgTable/AgPlayerCell + KPI-kort fra `/admin/analyse`-fasiten, workspace-hero/tabs/KPI på tokens (AthleticButton ut). Design-haken satt til ~ (ikke ✓) fordi v13-kriteriet i rebaselinen måler mot golfdata-kit-komposisjon — samme nivå som søsterskjermene `/admin/analyse`/`/admin/okonomi` som selv står på –. tsc + eslint grønt.
- 25. juni (Bølge 2, ★-verifisering): **SG-Hub ★ verifisert — Flyt ✓.** Playwright 430px: hovedhub rendrer med ekte data (SG-pipeline +0,6, 11 runder, 12 TrackMan-økter, ENKEL/AVANSERT-toggle). Render-sveip av 6 undersider (benchmark, best-vs-now, equipment, yardage, conditions, strategy) — alle rendrer uten console-/runtime-feil og er navigerbare fra hub-en (→ Flyt ✓ på hovedhub). Undersidenes egne Funker/Data/Design-haker står fortsatt på ~/– i påvente av per-side data- og design-gate (ikke ★, deprioritert).
- 25. juni (Bølge 2, ★-verifisering): **Live-økt-løkka (brief → aktiv → oppsummering) e2e-verifisert — Funker-haken ✓.** Playwright 430px på ekte PLANNED V2-økt: brief rendrer (mål/fokus/drills), aktiv auto-starter (PLANNED→IN_PROGRESS), «Logg rep» → DrillLogV2 persistert, «Fullfør økt» → `completeSession` → oppsummering (reps/tid/drills KPI + CTA). Ingen runtime-feil (kun benign dev-eval-CSP-støy). Testøkt gjenopprettet til PLANNED etterpå (logg slettet, completedSummary = DbNull). Hakene Adresse/Flyt/Data/Funker → ✓ for alle tre. (iPad-bredde gjenstår — Mob/Desk/iPad fortsatt ✓✓–.)
- 25. juni (Bølge 1, post-lansering): **Maler-kort viser ekte SG-effekt.** Øvre-høyre-plassholderen «—» på Maler-fanen leser nå `PlanTemplate.effectivenessAvg` (snitt SG-Total-delta fra `PlanEffectiveness`) — tone-farget +/− når data finnes, ærlig «—» når ingen fullført plan har brukt malen ennå. Ingen oppdiktede prosenter.
- 25. juni (Bølge 1, post-lansering): **Workbench uke-navigasjon (FORRIGE/NESTE) koblet.** `?uke=N`-offset gjennom hele kjeden: `loadWorkbenchData(userId, weekOffset)` (uke-anker + ekte datotall + i-dag kun på inneværende uke), begge sider (spiller + coach) leser `parseWeekOffset`, og drag-drop/«+»/palette persisterer til den uka som faktisk vises via `weekRefDate(offset)` → `executeSessionMove`/`dateForDayIndex`. Tom navigert uke viser nå grid + navigasjon (ikke onboarding-blindvei). Bevis: 18 enhetstester (dato-matte/anker/parse), Playwright 1280 klikk-runde (Uke 26→27→26, `?uke=1`-toggle), gate MOVE_DRAG-persistering PASS, 244 tester + tsc + build grønt.
- 25. juni (lansering 20:00): **Workbench lanserings-hub ferdig.** Maler «Bruk» persisterer PlanTemplate-uke-1 til TrainingPlanSession+V2; V2-merge-bug fikset (`merge-week-sessions`); publish DRAFT→PENDING_PLAYER; design-gate 0 udokumenterte avvik (spiller uten coach-sidebar, ukenavigasjon-shell, Økt/Std wb-10-blokker). Gate-bevis: Playwright 430+1280, smoke PASS, 230 tester, build grønt.
