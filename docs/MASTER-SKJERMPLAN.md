# Master-skjermplan — AK Golf HQ

> Autoritativ oversikt over alle skjermer i plattformen. Én plass å se alt. **Sist oppdatert: 25. juni 2026.**

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

### Design-status

Kjerne-skjermer gjennom design-porting-gaten (Design=✓):
- **PlayerHQ:** De fem hovedskjermene (Hjem, Planlegge, Gjennomføre, Analysere, Meg) + Workbench + Tester + Drills + Runder + SG-Hub + TrackMan + Årsplan + Statistikk + Varsler + Meg-undersider + Utstyrsbag + Helse + Turneringer + Logg treningsøkt + Live-økt (brief/aktiv/summary) + Break-tabell + Putte-laboratoriet
- **AgencyOS:** Cockpit + Innboks + Spillere + Spiller-detalj + Spiller-Workbench + Kalender + Bookinger + Anlegg + Availability + Tjenester + Tester + Lag-snitt + Stall-analyse + Rapporter + Turneringer + Forespørsler + Godkjenninger + Compliance + Innstillinger + Grupper + Talent-radar + Talent-sammenligning + WAGR-import + Plans + Planer ny + Plan-maler + Drills + Fremgang + Tildel test + Økonomi (delvis)
- **Auth:** Alle (login, signup, BankID, reset, onboarding)
- **Forelder:** Alle (10 sider FULL)

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
| Varsler ★ | `/portal/varsler` | ✓ | ✓✓✓ | ✓ | ✓ | ✓ | ✓ |

### Planlegge

| Skjerm | Adresse | Design | Mob/Desk/iPad | Adresse-ok | Flyt | Data | Funker |
|---|---|---|---|---|---|---|---|
| Planlegge (= Workbench mobil) ★ | `/portal/planlegge` | ✓ | ✓✓✓ | ✓ | ✓ | ✓ | ✓ |
| **Workbench (planlegging)** ★ | `/portal/planlegge/workbench` | ✓ | ✓✓✓ | ✓ | ✓ | ✓ | ✓ |
| Årsplan | `/portal/tren/aarsplan` | ✓ | ✓✓– | ✓ | ~ | ✓ | ✓ |
| · Rediger periode | `/portal/tren/aarsplan/periode/[id]/rediger` | – | --- | ✓ | – | – | ~ |
| Teknisk plan (liste) | `/portal/tren/teknisk-plan` | – | --- | ✓ | ~ | ~ | ✓ |
| · Teknisk plan detalj | `/portal/tren/teknisk-plan/[planId]` | – | --- | ✓ | ~ | ~ | ✓ |
| Fys-plan (liste) | `/portal/tren/fys-plan` | – | --- | ✓ | ~ | ~ | ✓ |
| · Fys-plan detalj/bygger | `/portal/tren/fys-plan/[planId]` | – | --- | ✓ | ~ | ~ | ✓ |
| Drills (bibliotek) | `/portal/drills` | ✓ | ✓✓– | ✓ | ~ | ✓ | ✓ |
| · Drill-detalj | `/portal/drills/[id]` | ✓ | ✓✓– | ✓ | ~ | ✓ | ✓ |
| Mål-hub | `/portal/mal` | – | --- | ✓ | ~ | ~ | ✓ |
| · Mål-bygger (wizard) | `/portal/mal/bygger` | – | --- | ✓ | ~ | ~ | ~ |
| · Mål-detalj | `/portal/mal/goal/[id]` | – | --- | ✓ | ~ | ~ | ~ |
| · Milepæler | `/portal/mal/milepaeler` | – | --- | ✓ | ~ | ~ | ~ |
| · Leaderboard | `/portal/mal/leaderboard` | – | --- | ✓ | ~ | ~ | ~ |
| Turneringer (mine) ★ | `/portal/tren/turneringer` | ✓ | ✓✓✓ | ✓ | ✓ | ✓ | ✓ |
| · Turnering-detalj | `/portal/tren/turneringer/[id]` | ~ | ✓✓– | ~ | ~ | – | ~ |
| · Ny turnering | `/portal/tren/turneringer/ny` | – | --- | ✓ | ~ | ~ | ~ |
| Utfordringer | `/portal/utfordringer` | – | --- | ✓ | ~ | ~ | ~ |
| · Ny utfordring (wizard) | `/portal/utfordringer/ny` | – | --- | ✓ | ~ | ~ | ~ |
| · Utfordring-detalj | `/portal/utfordringer/[id]` | – | --- | ✓ | ~ | ~ | ~ |
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
| Logg treningsøkt (volum per SG) † | `/portal/trening/logg` | ✓ | ✓✓– | ✓ | ✓ | ✓ | ~ |
| **Putte-laboratoriet** (3 verktøy) | `/portal/trening/putte-laboratoriet` | ✓ | ✓✓– | ✓ | ✓ | – | ✓ |
| **Break-tabell** (3 varianter) | `/portal/trening/break-tabell` | ✓ | ✓✓– | ✓ | ✓ | – | ✓ |
| Ønsket økt (be coach) | `/portal/onskeligokt` | – | --- | ✓ | ~ | ~ | ~ |
| · Ønsket økt bekreftet | `/portal/onskeligokt/bekreftet` | – | --- | ✓ | ~ | ~ | ~ |
| Live-økt: brief † | `/portal/(fullscreen)/live/[sessionId]/brief` | ✓ | ✓✓– | ~ | ~ | ✓ | ~ |
| Live-økt: aktiv † | `/portal/(fullscreen)/live/[sessionId]/active` | ✓ | ✓✓– | ~ | ~ | ~ | ~ |
| Live-økt: oppsummering † | `/portal/(fullscreen)/live/[sessionId]/summary` | ✓ | ✓✓– | ~ | ~ | ✓ | ~ |
| Live-økt: drill-logger | `/portal/(fullscreen)/live/[sessionId]/logger` | ~ | ✓✓– | ✓ | ~ | ~ | ✓ |
| Live-økt: score-tapper | `/portal/(fullscreen)/live/[sessionId]/tapper` | ~ | ✓✓– | ✓ | ~ | ~ | ✓ |
| Tren (fullskjerm) | `/portal/(fullscreen)/tren` | – | --- | ✓ | ~ | ~ | ~ |
| Økt-detalj | `/portal/tren/[sessionId]` | – | --- | ✓ | ~ | ~ | ✓ |
| · Planlagt økt | `/portal/tren/[sessionId]/planlagt` | – | --- | ✓ | ~ | ~ | ✓ |
| Feiring (etter plan ferdig) | `/portal/tren/feiring/[planId]` | – | --- | ✓ | ~ | ~ | ~ |

### Analysere

| Skjerm | Adresse | Design | Mob/Desk/iPad | Adresse-ok | Flyt | Data | Funker |
|---|---|---|---|---|---|---|---|
| Analysere (Les tallene · faner) ★ | `/portal/analysere` | ✓ | ✓✓✓ | ✓ | ✓ | ✓ | ✓ |
| · Hull-analyse | `/portal/analysere/hull` | ~ | ✓✓– | ✓ | ~ | ✓ | ✓ |
| Statistikk (oversikt) | `/portal/statistikk` | ✓ | ✓✓– | ✓ | ✓ | ✓ | ✓ |
| · Metrikk-detalj | `/portal/statistikk/[metric]` | – | --- | ✓ | ~ | ~ | ~ |
| · Sammenlign | `/portal/statistikk/sammenlign` | – | --- | ✓ | ~ | ~ | ~ |
| · Del runde | `/portal/statistikk/runder/[runId]/del` | – | --- | ✓ | ~ | ~ | ~ |
| **SG-Hub (Strokes Gained)** ★ | `/portal/mal/sg-hub` | ✓ | ✓✓– | ✓ | ~ | ✓ | ✓ |
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
| Runder (liste) | `/portal/mal/runder` | ✓ | ✓✓– | ✓ | ~ | ✓ | ✓ |
| · Runde-detalj ★ | `/portal/mal/runder/[id]` | ✓ | ✓✓✓ | ✓ | ✓ | ✓ | ✓ |
| · Slag-for-slag (visning) | `/portal/mal/runder/[id]/shot-by-shot` | – | --- | ✓ | ~ | ~ | ~ |
| · Slag-registrering (wizard + UpGame) | `/portal/mal/runder/[id]/slag` | – | ✓-- | ✓ | ✓ | ✓ | ✓ |
| · Logg ny runde ★ | `/portal/mal/runder/ny` | ✓ | ✓✓✓ | ✓ | ✓ | ✓ | ✓ |
| TrackMan (liste) | `/portal/mal/trackman` | ✓ | ✓✓– | ✓ | ~ | ✓ | ✓ |
| · TrackMan-sesjon | `/portal/mal/trackman/[id]` | ~ | ✓✓– | ✓ | ~ | ~ | ~ |
| · TrackMan (alt. adresse) | `/portal/trackman/[sessionId]` | ~ | ✓✓– | ✓ | ~ | ~ | ~ |
| Tester (oversikt) ★ | `/portal/tren/tester` | ✓ | ✓✓~ | ✓ | ✓ | ✓ | ✓ |
| · Test-detalj ★ | `/portal/tren/tester/[testId]` | ✓ | ✓✓~ | ✓ | ✓ | ✓ | ✓ |
| · Test-gjennomføring (scorekort) ★ | `/portal/tren/tester/[testId]/gjennomfor` | ✓ | ✓✓~ | ✓ | ✓ | ✓ | ✓ |
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
| Coach-hub | `/portal/coach` | – | --- | ✓ | ~ | ~ | ✓ |
| · Coach-profil | `/portal/coach/[coachId]` | – | --- | ✓ | ~ | ~ | ~ |
| Meldinger (innboks) | `/portal/coach/melding` | – | --- | ✓ | ~ | ~ | ✓ |
| · Ny melding | `/portal/coach/melding/ny` | – | --- | ✓ | ~ | ~ | ~ |
| · Meldingstråd | `/portal/coach/melding/[id]` | – | --- | ✓ | ~ | ~ | ~ |
| · Vedlegg | `/portal/coach/melding/[id]/vedlegg` | – | --- | ✓ | ~ | ~ | ~ |
| Coach-planer | `/portal/coach/plans` | – | --- | ✓ | ~ | ~ | ~ |
| · Plan-detalj | `/portal/coach/plans/[planId]` | – | --- | ✓ | ~ | ~ | ~ |
| · Ny økt i plan | `/portal/coach/plans/[planId]/ny-okt` | – | --- | ✓ | ~ | ~ | ~ |
| · Perioder | `/portal/coach/plans/perioder` | – | --- | ✓ | ~ | ~ | ~ |
| Coach-øvelser | `/portal/coach/ovelser` | – | --- | ✓ | ~ | ~ | ~ |
| · Ny øvelse | `/portal/coach/ovelser/ny` | – | --- | ✓ | ~ | ~ | ~ |
| · Rediger øvelse | `/portal/coach/ovelser/[id]/rediger` | – | --- | ✓ | ~ | ~ | ~ |
| Coach-videoer | `/portal/coach/videoer` | – | --- | ✓ | ~ | ~ | ~ |
| Coach-notater | `/portal/coach/notes` | – | --- | ✓ | ~ | ~ | ~ |
| · Notat-detalj | `/portal/coach/notes/[noteId]` | – | --- | ✓ | ~ | ~ | ~ |
| Spørsmål til coach | `/portal/coach/sporsmal/[id]` | – | --- | ✓ | ~ | ~ | ~ |
| Coach-AI | `/portal/coach/ai` | – | --- | ✓ | ~ | ~ | ~ |

### Meg (profil og innstillinger)

| Skjerm | Adresse | Design | Mob/Desk/iPad | Adresse-ok | Flyt | Data | Funker |
|---|---|---|---|---|---|---|---|
| Meg (profil) ★ | `/portal/meg` | ✓ | ✓✓✓ | ✓ | ✓ | ✓ | ✓ |
| Rediger profil ★ | `/portal/meg/profil` | ✓ | ✓✓✓ | ✓ | ✓ | ✓ | ✓ |
| Abonnement ★ | `/portal/meg/abonnement` | ✓ | ✓✓✓ | ✓ | ✓ | ✓ | ✓ |
| · Oppgrader | `/portal/meg/abonnement/oppgrader` | – | --- | ✓ | ~ | ~ | ~ |
| · Oppgrader-flyt | `/portal/meg/abonnement/oppgrader/flyt` | – | --- | ✓ | ~ | ~ | ~ |
| · Avbestill | `/portal/meg/abonnement/avbestill` | – | --- | ✓ | ~ | ~ | ~ |
| · Nytt kort | `/portal/meg/abonnement/kort/ny` | – | --- | ✓ | ~ | ~ | ~ |
| · Faktura-detalj | `/portal/meg/abonnement/faktura/[id]` | – | --- | ✓ | ~ | ~ | ~ |
| Mine bookinger | `/portal/meg/bookinger` | – | --- | ✓ | ~ | ~ | ~ |
| · Endre tid | `/portal/meg/bookinger/reschedule/[bookingId]` | – | --- | ✓ | ~ | ~ | ~ |
| Helse ★ | `/portal/meg/helse` | ✓ | ✓✓✓ | ✓ | ✓ | ✓ | ✓ |
| · Nytt symptom | `/portal/meg/helse/symptom/ny` | – | --- | ✓ | ~ | ~ | ~ |
| Innstillinger ★ | `/portal/meg/innstillinger` | ✓ | ✓✓✓ | ✓ | ✓ | ✓ | ✓ |
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
| Utstyrsbag ★ | `/portal/meg/utstyrsbag` | ✓ | ✓✓✓ | ✓ | ✓ | ✓ | ✓ |
| Dokumenter ★ | `/portal/meg/dokumenter` | ✓ | ✓✓✓ | ✓ | ✓ | ✓ | ✓ |
| Foreldre (foresatt-info) | `/portal/meg/foreldre` | ✓ | ✓✓– | ✓ | ~ | ✓ | ✓ |
| Feedback | `/portal/meg/feedback` | – | --- | ✓ | ~ | ~ | ~ |
| Hjelpesenter ★ | `/portal/meg/help` | ✓ | ✓✓✓ | ✓ | ✓ | ✓ | ✓ |
| · Hjelp-artikkel | `/portal/meg/help/artikkel/[slug]` | – | --- | ✓ | ~ | ~ | ~ |
| · Hjelp-kategori | `/portal/meg/help/kategori/[slug]` | – | --- | ✓ | ~ | ~ | ~ |
| · Kontakt | `/portal/meg/help/kontakt` | – | --- | ✓ | ~ | ~ | ~ |

### Booking

| Skjerm | Adresse | Design | Mob/Desk/iPad | Adresse-ok | Flyt | Data | Funker |
|---|---|---|---|---|---|---|---|
| Booking-hub | `/portal/booking` | ~ | ✓✓– | ~ | ~ | ✓ | ✓ |
| · Ny booking (wizard) | `/portal/booking/ny` | ~ | ✓✓– | ~ | ~ | ✓ | ✓ |
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
| **Cockpit (hjem)** ★ | `/admin/agencyos` | ✓ | –✓– | ✓ | ✓ | ✓ | ✓ |
| · Uka (kanban) | `/admin/agencyos/uka` | ✓ | ✓✓– | ✓ | ~ | ✓ | ✓ | Design (grip + tcard + sc-t/sc-s + lane-hd-t + locked state from terminal design); Data (real prisma.booking.findMany); Funker (md:4 grid + build); brand in shell. |
| · Spillere (snarvei) | `/admin/agencyos/spillere` | ✓ | ✓✓– | ✓ | ~ | ✓ | ✓ |
| · Økonomi | `/admin/agencyos/okonomi` | – | --- | ✓ | ~ | ~ | ~ |
| · Caddie (AI-chat) | `/admin/agencyos/caddie` | ✓ | ✓✓– | ✓ | ~ | – | ✓ |
| · Caddie-aktivitet | `/admin/agencyos/caddie/aktivitet` | – | --- | ✓ | ~ | ~ | ~ |
| Admin-rot (gml. hjem) | `/admin` | – | --- | ✓ | ~ | ~ | ✓ |
| Daglig AI-brief | `/admin/brief` | – | --- | ✓ | ✓ | ~ | ~ |
| Coaching-board | `/admin/board` | – | --- | ✓ | ~ | ~ | ~ |
| Oppfølging | `/admin/oppfolging` | – | --- | ✓ | ~ | ~ | ~ |
| Oppgave-kø | `/admin/queue` | – | --- | ✓ | ~ | ~ | ~ |
| **Innboks** ★ | `/admin/innboks` | ✓ | ✓✓– | ✓ | ✓ | ✓ | ✓ |
| Meldinger (alt. → redirect) | `/admin/messages` | – | --- | ✓ | ✓ | – | ✓ |
| Kommunikasjon-hub | `/admin/kommunikasjon` | – | --- | ✓ | ~ | ~ | ~ |
| Reach | `/admin/reach` | – | --- | ✓ | ~ | ~ | ~ |

### Min uke / Workspace

| Skjerm | Adresse | Design | Mob/Desk/iPad | Adresse-ok | Flyt | Data | Funker |
|---|---|---|---|---|---|---|---|
| Workspace-hub | `/admin/workspace` | – | --- | ✓ | ~ | ~ | ~ |
| · Tildelt meg | `/admin/workspace/tildelt-meg` | ✓ | –✓– | ✓ | ✓ | ✓ | ✓ |
| · Oppgaver | `/admin/workspace/oppgaver` | ✓ | –✓– | ✓ | ✓ | ✓ | ✓ |
| · Oppgave-detalj | `/admin/workspace/oppgaver/[id]` | – | --- | ✓ | ~ | ~ | ~ |
| · Prosjekter | `/admin/workspace/prosjekter` | – | --- | ✓ | ~ | ~ | ~ |
| · Notion-sync | `/admin/workspace/notion` | – | --- | ✓ | ~ | ~ | ~ |

### Stall (spillere, grupper, talent)

| Skjerm | Adresse | Design | Mob/Desk/iPad | Adresse-ok | Flyt | Data | Funker |
|---|---|---|---|---|---|---|---|
| Stall-oversikt | `/admin/stall` | – | --- | ✓ | ~ | ~ | ✓ |
| **Spillere (alle)** ★ | `/admin/spillere` | ✓ | –✓– | ✓ | ✓ | ✓ | ✓ |
| · Ny spiller | `/admin/spillere/ny` | – | --- | ✓ | ~ | ~ | ~ |
| **Spiller-detalj** ★ | `/admin/spillere/[id]` | ✓ | ~✓– | ✓ | ✓ | ✓ | ✓ |
| · Profil | `/admin/spillere/[id]/profil` | – | --- | ✓ | ~ | ~ | ~ |
| · **Workbench (coach-i-spiller)** ★ | `/admin/spillere/[id]/workbench` | ✓ | ✓✓✓ | ✓ | ✓ | ✓ | ✓ |
| · Plan-detalj | `/admin/spillere/[id]/plan/[planId]` | – | --- | ✓ | ~ | ~ | ~ |
| · Fremgang (trening vs SG) † | `/admin/spillere/[id]/fremgang` | ✓ | ✓✓– | ✓ | ✓ | ✓ | ~ |
| · Tester | `/admin/spillere/[id]/tester` | ✓ | ✓✓– | ✓ | ✓ | ✓ | ~ |
| · Tildel test | `/admin/spillere/[id]/tildel-test` | – | --- | ✓ | ~ | ~ | ~ |
| · Rediger | `/admin/spillere/[id]/rediger` | – | --- | ✓ | ~ | ~ | ~ |
| Grupper | `/admin/grupper` | ✓ | –✓– | ✓ | ✓ | ✓ | ✓ |
| · Gruppe-detalj | `/admin/grupper/[id]` | – | --- | ✓ | ~ | ~ | ~ |
| Talent-hub | `/admin/talent` | – | --- | ✓ | ~ | ~ | ~ |
| · Talent-detalj | `/admin/talent/[playerId]` | – | --- | ✓ | ~ | ~ | ~ |
| · Discovery | `/admin/talent/discovery` | – | --- | ✓ | ~ | ~ | ~ |
| · Radar | `/admin/talent/radar` | ✓ | –✓– | ✓ | ✓ | ✓ | ✓ |
| · Radar per spiller | `/admin/talent/radar/[playerId]` | – | --- | ✓ | ~ | ~ | ~ |
| · Kohort | `/admin/talent/kohort` | – | --- | ✓ | ~ | ~ | ~ |
| · Region | `/admin/talent/region` | – | --- | ✓ | ~ | ~ | ~ |
| · Ressurser | `/admin/talent/ressurser` | – | --- | ✓ | ~ | ~ | ~ |
| · Sammenligning | `/admin/talent/sammenligning` | ✓ | ~✓– | ✓ | ✓ | ✓ | ✓ |
| · WAGR-benchmark | `/admin/talent/wagr-benchmark` | – | --- | ✓ | ~ | ~ | ~ |
| · WAGR-import | `/admin/talent/wagr-import` | ✓ | –✓– | ✓ | ✓ | ✓ | ✓ |

### Planlegge (lage planer FOR spillerne)

| Skjerm | Adresse | Design | Mob/Desk/iPad | Adresse-ok | Flyt | Data | Funker |
|---|---|---|---|---|---|---|---|
| Plan-sentral (hub) | `/admin/planlegge` | – | --- | ✓ | ~ | ~ | ~ |
| Planer (alle) | `/admin/plans` | ✓ | –✓– | ✓ | ✓ | ✓ | ✓ |
| · Ny plan (Plan-bygger) | `/admin/plans/new` | ✓ | –✓– | ✓ | ~ | ✓ | ~ |
| · Plan-detalj | `/admin/plans/[planId]` | – | --- | ✓ | ~ | ~ | ✓ |
| · Maler (alt. → redirect) | `/admin/plans/templates` | – | --- | ✓ | ✓ | – | ✓ |
| · Ny mal (alt. → redirect) | `/admin/plans/templates/ny` | – | --- | ✓ | ✓ | – | ✓ |
| · Rediger mal (alt. → redirect) | `/admin/plans/templates/[id]/rediger` | – | --- | ✓ | ✓ | – | ✓ |
| · Mal-effektivitet (alt. → redirect) | `/admin/plans/templates/[id]/effectiveness` | – | --- | ✓ | ✓ | – | ✓ |
| Plan-maler (alt.) | `/admin/plan-templates` | ✓ | –✓– | ✓ | ✓ | ✓ | ✓ |
| · Plan-mal detalj | `/admin/plan-templates/[id]` | – | --- | ✓ | ~ | ~ | ~ |
| · Ny plan-mal | `/admin/plan-templates/ny` | – | --- | ✓ | ~ | ~ | ~ |
| · Rediger plan-mal | `/admin/plan-templates/[id]/rediger` | – | --- | ✓ | ~ | ~ | ~ |
| Drills (bibliotek) | `/admin/drills` | ✓ | ~✓– | ✓ | ✓ | ✓ | ✓ |
| · Drill-detalj | `/admin/drills/[id]` | – | --- | ✓ | ~ | ~ | ~ |
| · Rediger drill | `/admin/drills/[id]/rediger` | – | --- | ✓ | ~ | ~ | ~ |
| Teknisk plan | `/admin/teknisk-plan` | – | --- | ✓ | ~ | ~ | ~ |
| · Per spiller | `/admin/teknisk-plan/[spillerId]` | – | --- | ✓ | ~ | ~ | ~ |
| **Turneringer** ★ | `/admin/tournaments` | ✓ | ✓✓– | ✓ | ✓ | ✓ | ✓ |
| · Turnering-detalj | `/admin/tournaments/[id]` | ~ | ✓✓– | ✓ | ~ | ~ | ~ |
| · Ny turnering | `/admin/tournaments/ny` | – | --- | ✓ | ~ | ~ | ~ |
| · Dubletter (rydd) | `/admin/tournaments/dubletter` | – | --- | ✓ | ~ | ~ | ~ |
| Økter | `/admin/okter` | – | --- | ✓ | ~ | ~ | ~ |
| Videoer | `/admin/videoer` | – | --- | ✓ | ~ | ~ | ~ |
| Opptak | `/admin/recording` | – | --- | ✓ | ~ | ~ | ~ |

### Gjennomføre (daglig drift)

| Skjerm | Adresse | Design | Mob/Desk/iPad | Adresse-ok | Flyt | Data | Funker |
|---|---|---|---|---|---|---|---|
| Daglig drift (hub) | `/admin/gjennomfore` | – | --- | ✓ | ~ | ~ | ~ |
| · Økt-detalj | `/admin/gjennomfore/okter/[id]` | – | --- | ✓ | ~ | ~ | ~ |
| Kalender | `/admin/kalender` | ✓ | –✓– | ✓ | ✓ | ✓ | ✓ |
| · Uke (redirect) | `/admin/kalender/uke` → `/admin/kalender` | ✓ | –✓– | ✓ | ✓ | ✓ | ✓ |
| · Måned | `/admin/kalender/maned` | ✓ | ✓✓– | ✓ | ~ | ✓ | ✓ |
| Kalender (alt. → redirect) | `/admin/calendar` | – | --- | ✓ | ✓ | – | ✓ |
| · Måned (alt. → redirect) | `/admin/calendar/maned` | – | --- | ✓ | ✓ | – | ✓ |
| **Bookinger** ★ | `/admin/bookinger` | ✓ | –✓– | ✓ | ✓ | ✓ | ✓ |
| · Ny booking | `/admin/bookinger/ny` | – | --- | ✓ | ~ | ~ | ~ |
| Anlegg | `/admin/anlegg` | ✓ | –✓– | ✓ | ✓ | ✓ | ✓ |
| · Anlegg-detalj | `/admin/anlegg/[id]` | – | --- | ✓ | ~ | ~ | ~ |
| Tilgjengelighet | `/admin/availability` | ✓ | –✓– | ✓ | ✓ | ✓ | ✓ |
| Kapasitet | `/admin/kapasitet` | – | --- | ✓ | ~ | ~ | ~ |
| Tjenester/priser | `/admin/services` | ✓ | –✓– | ✓ | ✓ | ✓ | ✓ |
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
| Innsikt-hub | `/admin/analysere` | – | --- | ✓ | ~ | ~ | ~ |
| · Compliance | `/admin/analysere/compliance` | ✓ | ✓✓– | ✓ | ~ | ✓ | ✓ |
| Stall-analyse | `/admin/analyse` | ✓ | ~✓– | ✓ | ✓ | ✓ | ✓ |
| Analytics | `/admin/analytics` | – | --- | ✓ | ~ | ~ | ~ |
| Lag-snitt | `/admin/lag-snitt` | ✓ | ~✓– | ✓ | ✓ | ✓ | ✓ |
| · Fasiter (autosync) | `/admin/tester/benchmarks` | ~ | ✓✓– | ✓ | ✓ | ✓ | ✓ |
| Tester (på tvers) | `/admin/tester` | ✓ | ✓✓– | ✓ | ✓ | ✓ | ✓ |
| · Test-detalj | `/admin/tester/[id]` | ✓ | ✓✓– | ✓ | ✓ | ✓ | ~ |
| · Foreslåtte tester | `/admin/tester/foreslatte` | – | --- | ✓ | ~ | ~ | ~ |
| · Tildel test | `/admin/tester/tildel/[spillerId]` | ✓ | ✓✓– | ✓ | ✓ | ✓ | ~ |
| Økt-forespørsler | `/admin/foresporsler` | ✓ | –✓– | ✓ | ✓ | ✓ | ✓ |
| Godkjenninger | `/admin/godkjenninger` | ✓ | –✓– | ✓ | ✓ | ✓ | ✓ |
| · Godkjenning-detalj | `/admin/godkjenninger/[id]` | – | --- | ✓ | ~ | ~ | ~ |
| Godkjenninger (alt. → redirect) | `/admin/approvals` | – | --- | ✓ | ✓ | – | ✓ |
| · Approval-detalj (alt. → redirect) | `/admin/approvals/[id]` | – | --- | ✓ | ✓ | – | ✓ |
| Rapporter | `/admin/reports` | ✓ | –✓– | ✓ | ✓ | ✓ | ✓ |
| Runder (på tvers) | `/admin/runder` | – | --- | ✓ | ~ | ~ | ~ |
| Skader/sykdom (tilstander) | `/admin/tilstander` | – | --- | ✓ | ~ | ~ | ~ |
| Finans (alt. → redirect) | `/admin/finance` | – | --- | ✓ | ✓ | – | ✓ |
| **Økonomi (MRR/betalinger)** | `/admin/okonomi` | ~ | –✓– | ✓ | ~ | ✓ | ~ |
| Stats-oversikt | `/admin/stats/overview` | – | --- | ✓ | ~ | ~ | ~ |
| Stats-moderering | `/admin/stats/moderering` | – | --- | ✓ | ~ | ~ | ~ |

### Admin (organisasjon og innstillinger)

| Skjerm | Adresse | Design | Mob/Desk/iPad | Adresse-ok | Flyt | Data | Funker |
|---|---|---|---|---|---|---|---|
| Organisasjon-hub | `/admin/organisasjon` | – | --- | ✓ | ~ | ~ | ~ |
| Klubb-innstillinger | `/admin/klubb/innstillinger` | – | --- | ✓ | ~ | ~ | ~ |
| Integrasjoner | `/admin/integrasjoner` | – | --- | ✓ | ~ | ~ | ~ |
| Innstillinger | `/admin/settings` | ✓ | –✓– | ✓ | ✓ | ✓ | ✓ |
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
| Logg inn ★ | `/auth/login` | ✓ | ✓✓✓ | ✓ | ✓ | ✓ | ✓ |
| Registrer ★ | `/auth/signup` | ✓ | ✓✓✓ | ✓ | ✓ | ✓ | ✓ |
| Glemt passord ★ | `/auth/forgot-password` | ✓ | ✓✓✓ | ✓ | ✓ | ✓ | ✓ |
| Tilbakestill passord | `/auth/reset-password` | – | --- | ✓ | ~ | ~ | ~ |
| Sjekk e-post | `/auth/check-email` | – | --- | ✓ | ~ | ~ | ~ |
| BankID ★ | `/auth/bankid` | ✓ | ✓✓✓ | ✓ | ✓ | ✓ | ✓ |
| Onboarding (spiller, 8 steg) | `/auth/onboarding` | ~ | ✓✓– | ~ | ~ | – | ✓ |
| Onboarding (forelder) | `/auth/onboarding/forelder` | – | --- | ✓ | ~ | ~ | ~ |
| Foreldresamtykke (token) | `/auth/guardian-consent/[token]` | – | --- | ✓ | ~ | ~ | ~ |
| Samtykke venter | `/auth/samtykke-venter` | – | --- | ✓ | ~ | ~ | ~ |
| Logget ut | `/auth/logget-ut` | ~ | ✓✓– | ✓ | ~ | – | ✓ |

### Forelder (foreldreportal)

| Skjerm | Adresse | Design | Mob/Desk/iPad | Adresse-ok | Flyt | Data | Funker |
|---|---|---|---|---|---|---|---|
| Forelder-hjem | `/forelder` | ~ | ✓✓– | ✓ | ~ | – | ~ |
| Barn (oversikt) | `/forelder/barn` | ~ | ✓✓– | ✓ | ~ | ~ | ✓ |
| · Barn-detalj | `/forelder/barn/[childId]` | ~ | ✓✓– | ✓ | ~ | – | ~ |
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
| Forside | `/(marketing)` | ✓ | ✓✓– | ~ | ~ | – | ✓† | 
| Anlegg | `/(marketing)/anlegg` | – | --- | ✓ | ~ | ~ | ✓ |
| · Anlegg-detalj | `/(marketing)/anlegg/[slug]` | – | --- | ✓ | ~ | ~ | ✓ |
| Blogg | `/(marketing)/blogg` | – | --- | ✓ | ~ | ~ | ✓ |
| · Blogg-innlegg | `/(marketing)/blogg/[slug]` | – | --- | ✓ | ~ | ~ | ✓ |
| Booking | `/(marketing)/booking` | – | --- | ✓ | ~ | ~ | ✓ |
| · Booking-tjeneste | `/(marketing)/booking/[slug]` | – | --- | ✓ | ~ | ~ | ~ |
| · Booking bekreft | `/(marketing)/booking/[slug]/bekreft` | – | --- | ✓ | ~ | ~ | ~ |
| · Booking kvittering | `/(marketing)/booking/kvittering/[bookingId]` | – | --- | ✓ | ~ | ~ | ~ |
| Cases | `/(marketing)/cases` | – | --- | ✓ | ~ | ~ | ✓ |
| Coacher | `/(marketing)/coacher` | – | --- | ✓ | ~ | ~ | ✓ |
| · Coach-profil | `/(marketing)/coacher/[slug]` | – | --- | ✓ | ~ | ~ | ✓ |
| Coaching | `/(marketing)/coaching` | – | --- | ✓ | ~ | ~ | ✓ |
| Junior | `/(marketing)/junior` | – | --- | ✓ | ~ | ~ | ✓ |
| Priser | `/(marketing)/priser` | – | --- | ✓ | ~ | ~ | ✓ |
| PlayerHQ (salgsside) | `/(marketing)/playerhq` | – | --- | ✓ | ~ | ~ | ✓ |
| Om oss | `/(marketing)/om-oss` | – | --- | ✓ | ~ | ~ | ✓ |
| Kontakt | `/(marketing)/kontakt` | – | --- | ✓ | ~ | ~ | ✓ |
| Jobb | `/(marketing)/jobb` | – | --- | ✓ | ~ | ~ | ✓ |
| FAQ | `/(marketing)/faq` | – | --- | ✓ | ~ | ~ | ✓ |
| Suksess | `/(marketing)/suksess` | – | --- | ✓ | ~ | ~ | ✓ |
| Treningsfilosofi | `/(marketing)/treningsfilosofi` | – | --- | ✓ | ~ | ~ | ✓ |
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

- 25. juni (lansering 20:00): **Workbench lanserings-hub ferdig.** Maler «Bruk» persisterer PlanTemplate-uke-1 til TrainingPlanSession+V2; V2-merge-bug fikset (`merge-week-sessions`); publish DRAFT→PENDING_PLAYER; design-gate 0 udokumenterte avvik (spiller uten coach-sidebar, ukenavigasjon-shell, Økt/Std wb-10-blokker). Gate-bevis: Playwright 430+1280, smoke PASS, 230 tester, build grønt.
- 25. juni: **Workbench lanserings-hub (Bølge 1–2).** 7 hub-faner med ekte flater (Teknisk plan, Sesongmål, Maler fra PlanTemplate, Standardøkter fra mal-økter), mobil topbar-paritet (planStatus, Publiser, AI), TrainingSessionV2 merge i ukevisning + dual-write ved drag-drop, GroupSchedule i innsiktsstripe, `/portal/tren/*`→Workbench-redirects, turnerings-fellesmelding sender Notification til alle GroupMember-spillere i coachens grupper. Workbench-rader (spiller + coach): Mob/Desk/iPad → ✓✓✓. 222/222 tester, tsc, build grønt.
- 14. juni: **Testbatteriet koblet ende-til-ende (steg 1–6).**
  - **Server-side scoring-motor** (`src/lib/portal-tester/test-scoring.ts`): riktig formel per test (PEI = nærhet ÷ lengde, carry+side→avstand for fullslag; spread/maks/snitt/poeng/tid osv.), 16 enhetstester. Score regnes nå som fasit på server; klient-preview bruker samme motor. Lagring krever resultat på alle slag; kontekst (dato/lokasjon/vanskelighet/vær/greenfart/fasthet) fanges.
  - **Død dublett-flyt fjernet** (mockup `(fullscreen)/test/.../live|summary`, `live-test-runner`, foreldreløs `session-actions`, gammel `protokoll.ts`-parser). Gjennomfør-flyten flyttet til lyst, chrome-løst fullskjerm-lag.
  - **Spiller-progresjon** riktig for alle 30 tester (ny parser + motor-retning). **«Tildelt deg»-liste** på tester-katalogen.
  - **Coach-analyse ekte:** `/admin/tester/[id]` bruker ekte benchmark-nivåer (`test-benchmarks`) i stedet for sirkulær faktor; FYS-gate (ingen nivå uten benchmark); coach-notater lagres. `/admin/spillere/[id]/tester` fra hardkodet demo → ekte data (dekning per disiplin).
  - **`TestAssignment`-modell** + additiv prod-migrasjon (`20260614180000`): coach tildeler test (ekte, m/frist + notat) → spiller varsles → fullføring markerer tildeling COMPLETED + varsler coach. Forbedrings-loop (svakeste område → drill) dekkes av eksisterende `loadWeaknessSignals`→`foresla-drill`, nå på korrekt scoring.
  - Verifisert: 193/193 lib-tester, tsc 0 feil, full build grønn. Funker-haken ~ på de tre coach-radene = bygget+grønt, ikke ende-til-ende nettleser-testet ennå.
- 13. juni (lansering-dag): **Stor konsolidering + lansering-klargjøring.**
  - **AgencyOS Fase 4 mobil** flettet til main (mobilskall + WorkbenchMobile + mobilkortlister).
  - **KimiCode PlayerHQ-design** flettet inn (live-økt, workbench, analysere, portal-shell, tokens, ui-primitiver) + additiv DB-migrasjon (hole_scores, plan_change_requests, Shot-koordinater, drill-rep-felt) anvendt på prod med RLS. Data-blokkerte items DELVIS opplåst: scorecard hull-for-hull (`HoleScore`) + shot-map (Shot-koordinater) har nå lagringsplass i DB — gjenstår datafangst + visning i turnerings-scorecard/shot-map-skjerm.
  - **Abonnement-regler kodet** (`beregnEffektivTier`, betaling fra 1. juli): gratis for alle frem til 1. juli 2026, deretter coaching-pakke/gruppe/prøveperiode = gratis, ellers 300 kr/mnd. Beregnes sentralt i getCurrentUser — fikset «kalde gates» da PRO-for-alle-kampanjen utløp 1. juni.
  - **GDPR-fikser:** soft-slettet konto blokkeres fra innlogging (getCurrentUser→null); eksport-plassholder fjernet — `/innstillinger/eksport` redirecter til ekte eksport på `/personvern`.
  - **Booking via Acuity (midlertidig):** alle «Book»-knapper funnel-er til `/booking` → branded side med «Book time nå →» til `akgolfgroup.as.me` frem til AK Golf HQ-bookingen lanseres. Innebygd flyt parkert bak `BOOKING_ACTIVE`-flagget (portal credit-booking urørt).
  - **Opprydding:** slettet gamle design-arkiver (mai-handoff, wireframes) + død kode (mobile-drawer) + research-cache; arkivert 8 daterte planer til `docs/_arkiv`.
  - **Synlighet:** `npm run design-index` → klikkbar skjerm-oversikt (`public/design-handover/index.html`, lokal). Løser «jobbe i blinde».
  - **Restanse-review:** `docs/restanse-review-2026-06-13.md` — komplett gjennomgang av gjenstående arbeid utenom skjermer (data/sikkerhet/betaling/infra/juridisk/testing).
  - Alt deployet til prod (akgolf-hq.vercel.app), 177/177 tester grønne, sikkerhetsadvisor 0 ERROR.

- 12. juni (session 12): **InsightNarrative strip-fix + sg-hub-kobling.** `InsightNarrativeCard` hadde top-strip; rettet til left-strip (4px, `absolute left-0 top-0 h-full w-1`) + `pl-6` i container — matcher design-fasiten. Ny integrering: `InsightNarrativeCard` rendres nå også på `/portal/mal/sg-hub` (topp 3 uløste SgInsights, sortert etter severity). Payload-mapper (`mapInsightToCard`) inline i sg-hub/page.tsx. `components-insight-narrative.html` drop-off oppdatert med sg-hub-nevning.

- 12. juni (session 11b): **HØY review-funn fikset (K8/K6/B1/B3).** (K8) `timeZone: "Europe/Oslo"` i alle klokkeslett-/datoformatteringer på Hjem/Gjennomføre/Planlegge/Varsler; TZ-env i Vercel venter på Anders-godkjenning (dekker «i dag»-vinduene). (K6) Test-tilgang samlet i `src/lib/portal-tester/test-tilgang.ts` — katalog, test-detalj, gjennomfør-side og lagreTestResultat bruker nå samme regel (andres private tester → 404/avvist). (B1) PERSONVERN-seksjon re-etablert på /portal/meg/innstillinger med innganger til GDPR-dataeksport + kontosletting (var ulenket etter porting). (B3) Slag-registrering re-etablert: ny side `/portal/mal/runder/[id]/slag` (SlagWizard + UpGame-import, kun rundens eier) + innganger fra runde-detaljens scorecard («Registrer slag-for-slag» ved tom, «Rediger slag» ved data). Browser-verifisert.
- 12. juni (session 11): **Kritiske review-funn fikset (kodegjennomgang 2026-06-11).** (1) Ny side `/portal/gjennomfore/[id]` — alle «Start økt»-lenker fra Hjem/Planlegge/Gjennomføre pekte på en rute som ikke fantes (404). Viser V2-økt: dato, tid, status-chip, coach-brief («Fra coach»), notater, drill-liste, Kontakt coach/Se i planen. Eierskap håndhevet (fremmed økt → 404, bevist i browser). Mobil+desktop+iPad verifisert. (2) IDOR tettet i 3 coach-live-actions (brief/active/summary): oppslag scopet til `coachId = me.id` (ADMIN ser alle) + redirect-svelging i try/catch erstattet med direkte rolle-sjekk. (3) Brief/sluttrapport-kollisjon løst: spillerens freeze-guard validerer nå med zod (coach-brief gjør ikke lenger at snapshot aldri beregnes) og frysingen MERGER inn i completedSummary i stedet for å slette coachens brief/meldinger; tomt coach-notat nuller ikke lenger .notes.

- 12. juni (session 10): **TestUkeKommende + TestUkeTrigger bygget (Bolk 3).** `TestUkeKommende` (spiller countdown: SVG-ring, pyra-ikon per test, sted/tid) i `src/components/portal/tester/` og `TestUkeTrigger` (coach ukeribbon + berørte spillere + handlinger) i `src/components/admin/tester/`. Begge returnerer null inntil TestWeek-modell kobles — kobling lagt inn i `/portal/tren/tester/page.tsx` + `/admin/tester/page.tsx`. `components-test-week.html` drop-off → ✅. Gjenstår: `components-co-agent.html`.

- 12. juni (session 9): **SgTrainingScatter bygget (Bolk 3).** `SgTrainingScatter`-komponent på `/portal/mal/sg-hub`: hero scatter (timer trent per uke × SG-endring 90 d for innspill/APP) + 4 mini-multiples per SG-kategori. Server-side lineær regresjon, Pearson r, R², hellning, terskel og 95 %-konfidensband fra TrainingLog + Round-data. Vises kun ved ≥ 4 datapunkter, ellers ingen rendering. `components-sg-training-scatter.html` drop-off → ✅.

- 12. juni (session 8): **MicButton-komponent bygget (Bolk 3).** `MicButton` (`src/components/shared/mic-button.tsx`) — standalone (48px sirkel m/ waveform + hint-tekst) og suffix-variant (liten knapp inne i inputfelt). Web Speech API norsk (nb-NO), 4 tilstander: idle/recording/transcribing/done. Støtte-sjekk ved init (lazy state). Integrert som suffix-knapp i live-melding-feltet (`/admin/live/[sessionId]/active`) — coach kan diktere til spiller direkte. `components-voice-input.html` drop-off-mark → ✅.

- 12. juni (session 7): **TrackMan stabilitet-seksjon bygget (Bolk 3).** `StabilitetSeksjon`-komponent lagt til på `/portal/mal/trackman/[id]`: varians-heatmap (køller × 6 parametere, fargeskala v=1–5 med mode-invariante hex-farger), stabilitets-score 1–10 per kølle, callouts (mest stødig / trenger jobbing) og bias/spredning SVG-minikart. Server-side beregning fra rawJson.shots (stddev per parameter per kølle). `components-trackman-stability.html` drop-off-mark → ✅.

- 12. juni (session 7): **TrackMan trend-seksjon bygget (Bolk 3).** `TrackManTrendSeksjon`-komponent lagt til på `/portal/mal/trackman`-lista: KPI-strip (avg. carry + klubbhastighet m/ delta-chips og sparklines), per-kølle carry-trend fra `CLUB_AVG`-signaler. Vises kun ved ≥ 2 sesjoner. Alle tall fra ekte DB (rawJson.summary + Signal). `components-trackman-trend.html` drop-off-mark oppdatert → ✅.

- 12. juni (session 6): **`next.config.ts` stale-redirect fjernet.** Linje 79-80 (`/portal/statistikk` → `/portal/analysere?tab=statistikk`) blokkerte v10-siden fra å være nåbar — redirect ble lagt inn i mai 2026 før statistikk ble en egen side. Nå fjernet; `/portal/statistikk` returnerer HTTP 200 ✓. `/portal/tren/ovelser`-redirect oppdatert til `/portal/drills` (harmonisert med page.tsx). TypeScript 0 feil.

- 12. juni (session 5): **Bolk 4 ferdigstilt — alle 8 dobbeltadresser ryddet.** `/portal/stats` → `permanentRedirect("/portal/statistikk")`. `/admin/finance` → innhold flyttet til `/admin/okonomi` (kanonisk), `finance` er nå ren redirect. Adresse=✓ satt på Statistikk, SG-Hub, Runder, Drills (bibliotek + detalj), Årsplan — disse er nå entydig kanoniske etter at alias-rutene er ryddet.

- 11. juni (session 4): **Browser-testing fullført — 13 skjermer passert.** Playwright-screenshots tatt og gjennomgått for alle Fase 1-skjermer: Varsler ✓, Statistikk ✓, SG-Hub ✓, TrackMan ✓, Runder ✓, Årsplan ✓ (korrekt tom-tilstand), Foreldre ✓ (korrekt tom-tilstand), Drills-bibliotek ✓ (930 drills + filtre), Booking-hub ✓ (credits 3/4 PRO + coach-liste), Kalender uke ✓ (ekte bookingøkter uke 24), Kalender måned ✓ (juni 2026 m/ fargekoding), Compliance ✓ (84% plan-fullføring + spillertabell), Caddie ✓ (korrekt tom-tilstand). Funker=✓ satt på 9 skjermer som manglet det; † fjernet fra 7 skjermer. Compliance og Kalender måned fikk også Data=✓.

- 11. juni (session 3): **TypeScript-sjekk grønn — 0 feil.** `npx tsc --noEmit` kjørt over hele kodebasen og returnerer rent resultat. Ingen TypeScript-feil å fikse.

- 11. juni (session 3): **MASTER-SKJERMPLAN oppdatert med Fase 1 porting-gate-resultater.** Hakene for 21 skjermer oppdatert basert på gate-resultatene: Årsplan (Data ✓), Drill-detalj (Design ✓, Data ✓), Live-økt brief (Design ✓, Data ✓), Live-økt aktiv (Design/Data begge ~), Foreldre (Design/Data ✓), Varsler (allerede grønn), Statistikk (Design/Data ✓), SG-Hub (Data ✓, Design ~), Runder (Design/Data ✓), TrackMan (Design/Data ✓), Booking-hub (Design ~, Data ✓), Ny booking (Design ~, Data ✓), Caddie (Design ✓, Data –), Compliance (Design ✓, Data ~), Kalender uke (allerede ✓), Kalender måned (Design/Data ~), Onboarding spiller (Design ~ ned fra ✓), Logget ut (Design ~, Adresse ✓), Forelder-barn (Design ~, Adresse ✓), Forelder-hjem (Design ~). Gjenstående på de fleste: Flyt ~ og Funker ~ (ikke browser-testet).

- 11. juni (session 3): **Bolk 4 — 6 dobbeltadresser ryddet til redirect-stubs.** `/admin/calendar(+/maned)` → `/admin/kalender`, `/admin/messages` → `/admin/innboks`, `/admin/approvals(+[id])` → `/admin/godkjenninger(+[id])` (inkl. sirkulær import-fiks), `/admin/plans/templates(+ny+[id]/rediger+[id]/effectiveness)` → `/admin/plan-templates`, `/portal/analyse` → `/portal/analysere`, `/portal/tren/ovelser(+[id])` → `/portal/drills`. Disse er nå Flyt=✓ / Funker=✓ i tabellen (redirect er funksjonell).

- 11. juni: **Putte-laboratoriet** (`/portal/trening/putte-laboratoriet`) bygget fra `putting/Putte-verktoy.html`-fasiten. Tre interaktive verktøy: Greenen (SVG drag-simulator med break-at-speed-fysikk, putt-animasjon, in/miss-resultat), Kjeden (probability waterfall med range-sliders, svakeste-ledd-diagnose), Kontroll (SVG-sirkelskive med prosess-score + «ti putter»-simulering). Ekte TypeScript-port av `putt-core.js` i `src/lib/putt-core.ts`. Lenket fra PlayerHQ-sidebar under Planlegge. Verifisert alle tre verktøy på desktop 1280px.

- 10. juni: **Tester-matrisen** (`/admin/tester`) fikk DataGolf-fasiter v1: 12 av 20 tester i NGF-batteriet har nå strukturert nivåstige (PGA topp 40 → Scratch) i `protocol.benchmarks`; matrisen viser nivå-badge per målt celle med hele stigen i tooltip + «Data powered by DataGolf»-attribusjon i footer. Data-haken `–` → `~`: fasitene ligger klare i seed (`npx tsx prisma/scripts/seed-ngf-test-protocols.ts`), men seed-kjøring mot databasen gjenstår som bevisst eget steg. 8 tester (gates/speed + fysiske) venter på interne/NGF-normer i v2.

- 10. juni (del 2): **Benchmark-autosync live.** Seed kjørt mot prod (fasitene er aktive i matrisen). Ny cron-agent `benchmark-sync` (mandager 08:00 norsk sommertid) henter ferske DataGolf skill ratings og driver nivåstigene: Driver Basic + Driver Gate har egne ankere, CHS følger driver-lengden, PEI-/putt-testene er referanse-stabile. Endring ≤ 3 % skrives automatisk; større utslag venter på godkjenning på ny skjerm **Fasiter** (`/admin/tester/benchmarks`) med godkjenn/avvis + «Kjør synk nå». Telegram-rapport til Anders etter hver kjøring. Kalibrering + uendret-løp + pending-guardrail verifisert live mot prod-DB.

- 10. juni (test-modul): **Komplett test-flyt for spiller bygd fra Team Norway IUP-arket** (Drive/Data/team-norway-iup-2025.xlsx): katalog (36 tester per pyramide-område m/ søk), detalj (protokoll-steg, scoring, historikk m/ trend, NGF-lenke), gjennomføring m/ scorekort-motor (zod-parset protocol → Treff/Bom/steppere/tallfelt, per-forsøk lagret i TestResult.details). E2E-verifisert m/ ekte lagring. FYS-vekting fra IUP (1/1/0,5/0,166/1) vises som «foreslått» — formel fortsatt ikke låst. Ref-arket = SG-putting-baseline (0–18 m) — kandidat for SG-putt-rekalibreringen (kjent feilkalibrering).

- 10. juni (Fase 6): **iPad-sveip fullført — 0 brudd.** 21 portede ruter sjekket på 834px; 5 responsive brudd funnet og lukket (Planlegge mode-rail < 1280, Hjem/Meg én kolonne på iPad, runde-ny 6-kol hull-grid for touch). Alle portede PlayerHQ-skjermer + forsiden står nå med Mob/Desk/iPad ✓✓✓. PlayerHQ-sporet + marketing-forsiden er KOMPLETT; gjenstår: AgencyOS (Fase 3+4, egen sesjon) + bevisst utsatt (live-økt, coach-panel, marketing-undersider).

- 10. juni (Fase 5): **Marketing-forsiden portet til fersk fasit** (ui_kits/marketing, 8 seksjoner + footer), kritiker-loop 9→0. Ekte priser/org-nr/booking-data beholdt (fasitens 3 900/7 200-priser er demo — ev. prisendring er Anders-beslutning). Resten av marketing-sidene har ikke fersk fasit — uendret.

- 10. juni (pulje 4): **Runde-detalj + Loggfør runde portet — Fase 2 fullført for de fasit-dekkede skjermene.** Scorecard fra ekte Shot-data (seedet), live to-par-logging m/ realistisk par-miks, 11 kritiker-funn lukket. **Bevisst utsatt fra Fase 2:** live-økt (dual-track Spor A/B — rør ikke uoppfordret) + coach-panel (overlay-IA, egen sak). Neste: Fase 3/4 AgencyOS (egen sesjon), Fase 5 marketing, Fase 6 iPad-sveip.

- 10. juni (pulje 3): **Varsler + Turneringer + hele auth-flyten portet (Fase 2 pulje 2–3).** Varsler/Turneringer: fasit-struktur på ekte data, kritiker-loop (kort-container-funn lukket). Auth login/signup/glemt: ph-auth-fasit, KUN presentasjon (logikk/selektorer urørt, innlogging funksjonstestet etter porting); bankid/samtykke-venter/onboarding: fasit-chrome m/ dokumenterte avvik (BankID-flyt avventer ekte BankID-integrasjon; GDPR-grense 16; appens 7 onboarding-steg). Gate-unntak nedfelt: pill/mono-knappestil + global shell-topbar. NB: samtykke-venter/onboarding er flyt-låste (krever spesial-state) — bilde-diff utestår til E2E; kode-verifisert mot fasit.
- 10. juni (pulje 2): **Alle 7 Meg-undersider portet til paritet (mobil + desktop) — Fase 2 pulje 1.** Profil (NY side, ekte lagring), Abonnement (gratis-logikk RETTET: coaching-pakke ⇒ gratis; «PlayerHQ Pro» fjernet), Innstillinger (ekte preferences-toggles), Helse (ekte HealthEntry; Readiness «—» til FYS-formel låses), Utstyrsbag/Dokumenter (seedet + ekte data), Hjelp. 4 uavhengige kritikere → 0 avvik på alt. **App-bred KRITISK fiks:** ulaget `* { border-color }` i globals.css drepte alle border-farge-klasser (lime venstrekanter m.m.) — flyttet til @layer base; tokens rettet mot dokumentert hex (#005840/#F1EEE5/#E5E3DD). Delte primitiver: `meg-sub.tsx` + `toggle.tsx`.
- 11. juni: **AgencyOS Fase 4 mobil M1+M2+M3 — alle overflow-problemer løst, Workbench mobil ferdig.**
  M1: `AgPage` fikk `px-4 md:px-7` — riktig sidemargin på alle ~75 admin-sider.
  M2: `WorkbenchMobile` ny komponent med 4 kalendervisninger (År/Mnd/Uke/Dag), pyramide-fargede sessjonskort, sticky visningsveksler. `layout.tsx` gjort responsiv (`md:fixed`) så bunnbaren vises på mobil. Workbench-sidens Mob-hake: `✓✓–`.
  M3: Tester + Turneringer fikk dedikerte mobilkortlister (< md kortliste, md+ tabell). Drills-seg-kontroll scrollbar. Stall-analyse, Spiller-detalj, Lag-snitt, Talent/Sammenligning fikk `overflow-x-auto` og responsivt grid. Gjenstår: fullverdig mobilvisning for øvrige ~20 AgencyOS-sider + iPad.

- 10. juni: **De 5 PlayerHQ-hovedskjermene bygd til DESKTOP-paritet (Fase 1 av komplett-planen).** Mobil var ferdig 9. juni; nå er desktop-layoutene bygd fra desktop-fasiten (HomeDesktop/ExecuteScreen/AnalyzeScreen/MeScreen + full Workbench): hero med inline avatar+knapper + 5-KPI + 2-kol grid (Hjem), h1+lead + faner (Gjennomføre/Analysere), 2-kol header+konto+abonnement (Meg), full Workbench (Planlegge). Mobil-layout bevart urørt (md:hidden), desktop via egne komponenter/md:-breakpoints. Verktøy (`design-shot.mjs`/`app-shot.mjs`) utvidet til desktop+iPad. Kritiker: Hjem 0 avvik; Gjennomføre/Analysere/Meg rettet etter kritiker (fane-typografi sans/Title-Case/primary-underline matcher nå `.tab-btn`-fasit — gjaldt også mobil). Hakene: Mob/Desk/iPad nå `✓✓~` (iPad-responsiv-sjekk gjenstår i Fase 6). **Gjenstår:** PlayerHQ-undersider, AgencyOS (desktop + net-new mobil), marketing, iPad-sveip. Plan: `docs/plan-komplett-skjermer-2026-06-10.md`.
- 9. juni: **De 5 PlayerHQ-hovedskjermene portet til paritet mot den ferske Claude Design-fasiten (mobil 430px), via porting-gaten med uavhengig kritiker-agent per skjerm.** Avdekket at alle 5 fortsatt kjørte gammelt design/IA («feil skjerm»). Bygd om fra design-kilden, koblet til ekte data, kritiker-loop til 0 avvik hver (Hjem 14→0, Planlegge 8→0, Gjennomføre 11→0, Analysere 11→0, Meg 11→0).
  - **Hjem** (`/portal`): hero+display-headline, 3-KPI, Dagens fokus, Planlegg-i-Workbench, pyramide (5 rader), Resten av dagen, Neste tee, Neste turnering. Utvidet `getHjemData`. Slettet utdatert `hjem-oversikt.tsx`.
  - **Planlegge** (`/portal/planlegge`): mode-rail-Workbench (Treningsplan-tidslinje default, pyramide-fargede venstrekanter) — erstattet gammel hub-av-kort.
  - **Gjennomføre** (`/portal/gjennomfore`): faner (I dag/Kalender/Booking) + accent-kort med «Start nå» + dagens program med status-chips — erstattet modul-launcher.
  - **Analysere** (`/portal/analysere`): «Les tallene»-fane-flate (SG/Runder/TrackMan/Tester/Innsikt) + sesong-header — erstattet treningstimer-hub (feil skjerm).
  - **Meg** (`/portal/meg`): header + abonnement-kort + 3-KPI + KONTO-lenkeliste (7) + Logg ut — fjernet fane-rad (SubNav).
  - Verktøy: `app-shot.mjs` (login + per-rute mobil-shots), `design-shot.mjs` (fersk prototyp klikk-nav), `seed-screentest.ts` (innloggbar Øyvind Rohjan med rik data). Alle 5 committet på `design/komplett`. **Gjenstår:** desktop/iPad-paritet for de samme 5; resten av PlayerHQ + AgencyOS.
- 4. juni: To nye skjermer lagt til på ekte data (port av sprint3-arbeid):
  - **Logg treningsøkt** (`/portal/trening/logg`) — spiller logger treningstid per SG-område; lenket fra PlayerHQ-sidemenyen under «Planlegge».
  - **Fremgang** (`/admin/spillere/[id]/fremgang`) — coach-fane med SG-grafer, treningsvolum og korrelasjon trening↔SG; coach-beskyttet.
  - Begge: Design ✓ · `✓✓–` · Adresse ✓ · Flyt ✓ · Data ✓ · Funker `~` (tsc + build grønt, ikke nettleser-testet ende-til-ende ennå). Database-tabell `training_logs` opprettet i prod (RLS deny-all). Også: training-gap-cron-agent (varsler coach når svakeste SG-område får <20 % treningstid). De fire øvrige gamle feature-branchene ble forkastet som utdaterte.
- 12. juni: **Gap-to-drill (`components-gap-to-drill.html`) — drop-off koblet til SG-Hub.** `GapToDrillSeksjon` lagt til i `/portal/mal/sg-hub`: kjede-strip DATA→DRILL→PLAN, svakhet-kolonne (kategori + SG-verdi + tekst), primær drill-kort (lime-border, axis-chip, meta-grid, «Legg til i Workbench»-CTA), alternativ-drills-liste. Vises kun ved negative SG-data + minst én drill i biblioteket med matchende akse. Data hentes parallelt med øvrige SG-Hub-spørringer. TSC ren.
- 11. juni: **Drill-detalj (`/portal/drills/[id]`) — v10-fasit komplett.** Porting-gate kjørt mot `components-drill-detalj.html`. Fikset: hero meta-chips (clock/list/target), avkryssbare trinn med live-progresjon, media-faner (vis når fleire media), parameter-tabellnøkkel til `bg-background` (cream-50), coach-notat-blokk med avatar (AK-initialer), CTA-bar endret til «Legg til i plan»-primærknapp (→ Workbench) + bokmerke-ghost. Fjernet: feedback-chips, Registrer-knapp, CS-score-input, Kommentar-textarea (ikke i v10-fasit). Data: ✓ (ekte Prisma via loadDrillDetalj). TSC grønt.
- 11. juni: **Putte-laboratoriet + Break-tabell portet; AgencyOS coach-flyt (Fokus-spiller).** Break-tabell (`/portal/trening/break-tabell`) bygd med 3 varianter (matriks-heatmap, kalkulator, sammenligning) fra `Break-tabell.html`, delt fysikk i `putt-core.ts`. Daglig brief (`/admin/brief`) seksjon 04 oppgradert til `FokusSpillerPanel` — interaktiv pin/unpin + AI-Caddie-kort (BookØkt/Melding/Profil) drevet av ekte PlanAction-data. Sidebar-lenke til Break-tabell lagt til. TSC + ESLint + build grønne.
- 11. juni: **Kalender uke (`/admin/kalender/uke`) — porting-gate.** WeekCalendar (7-dager, kind-farger, legend, nav-row) avvek fra fasit (5-dager man-fre, pyramide-akse-farger, AgPageHead-mønster). Fikset: ruten redirecter nå til `/admin/kalender` (fasit-aligned uke-visning) med ?uke-param videresendt. Master-skjermplan oppdatert.
- 11. juni: **Plan-bygger (`/admin/plans/new`) portet fra `screens-planbuilder.jsx`** — Gantt-bånd (12 mnd, periode-blokker m/ forest-ramp), uke-chips, 7-dagers drag-and-drop-raster + palett (aksblokker/drill-bibliotek/hurtig-legg-til), tildel-modal (spiller/gruppe). Erstattet 6-stegs wizard med visuell plan-bygger. Ny server-action `opprettPlanFraByggere` skriver TrainingPlan + -sessions til DB. TSC + build grønn.
- 11. juni (natt): **AgencyOS Fase 3, Pulje E (desktop) — FASE 3 KOMPLETT** — siste 5 skjermer til 0 avvik (4 kritiker-runder): Stall-analyse (ekte KPI-er + pyramide + per gruppe), Lag-snitt (pyramide per gruppe), Tester (FYS-plassholder-regel håndhevet — nøytrale chips, ingen normverdier), Rapporter (ekte CSV-endepunkter, «Åpne →» der generator mangler), Admin/Innstillinger (org/team/tilgang-faner på ekte data). Redirect /admin/analyse→analysere fjernet (skygget ruta). Full produksjonsbygg grønn. PlayerHQ-koordineringsnotat i WORKLOG (globals.css-endringene krever re-screenshot på deres flater ved merge).
- 10. juni (sen kveld): **AgencyOS Fase 3, Pulje C+D (desktop)** — 9 skjermer til 0 avvik (3 kritiker-runder): Treningsplaner (kanban; «Ny plan»→Workbench per låst beslutning, wizard ulenket), Plan-maler (redirect i next.config fjernet — ruta rendrer nå), Drill-bibliotek (930 drills, pyr-fargede kategorier), Turneringer (m/ Fellesmelding-panel), Kalender (uke-grid m/ akse-kanter; Innspill-regex-bug fikset), Bookinger (ekte Bekreft/Avvis-actions), Anlegg, Tilgjengelighet (ekte coachAvailability), Tjenester. Verktøy-funn: Playwright-pekeren ga hover-artefakter (flyttes nå til 0,0); sticky sidebar kuttet Admin-punktet i full-page (unwrappes nå). Seed: turnerings-entries (6/14/4/2), availability-vinduer, PENDING-bookinger.
- 10. juni (kveld): **AgencyOS Fase 3, Pulje B (desktop)** — 6 stall/talent-skjermer portet til 0 avvik (3 kritiker-runder): Alle spillere (tabell m/ SG-sparkline, status-heuristikk, bulk-bar, CSV-eksport), Spiller-detalj (hero + coach-flagg + pyramide + runder/tester + aktiv plan), Grupper (tiles m/ ekte aktivitetsbar), Talent-radar (0 avvik første måling), Sammenligning, WAGR-import. Talent-feature-gaten fjernet (skjermene er ekte). Nye systemfunn fikset: unlayered `input{font-size:16px}` overstyrte tekst-utilities (→ @layer base); chip-ok/warn/alert bruker nå fasitens lyse tint-tokens. Seed: planer/runder/SG/tester for navngitte stall-spillere + WAGR-koblinger + talent-tracking (screentest urørt). Nye primitiver: AgTable-familien, AgSectionHead, AgSpark, AgPlayerCell, AgStatusDot, AgSeg.
- 10. juni: **AgencyOS Fase 3, Pulje A (desktop)** — skall + 5 skjermer portet fra fersk fasit til 0 reelle avvik (6 kritiker-runder). Nye delte primitiver i `src/components/admin/agencyos/ui.tsx` (AgPage/AgPageHead/AgChip/AgTypeChip/AgAvatar/agBtnClass). Coach-seed: 38 spillere, 4 grupper, dagens 4 økter, 4 forespørsler, 3 godkjenninger, 5 oppgaver (idempotent; demo-Øyvind er EGEN bruker `oyvind-rohjan@stall.akgolf.test` — aldri screentest-spilleren, etter en lekkasje som midlertidig endret PlayerHQ-sporets godkjente skjermer og ble reversert). Globale fikser: border-color inn i @layer base (vekket alle border-utilities), dynamiske success/warning-tokens, fasit-verdier i `.dark` (success #56C59A, info #84A9FF, border #2B4F42, secondary=card, muted-fg #9CA39E, destructive #F2908C). Verktøy: agencyos-shot (fasit-screenshots via #hash-deeplink), app-shot 2x + coach-login, restart-protokoll (kald .next + token-probe før gate-shots — Turbopack kunne serve stale CSS). Dashboard-underrutene (uka/økonomi/caddie/spillere) mistet fane-raden (fasiten har ingen) — nås via ⌘K til IA-beslutning.
- 3. juni (Bolk 1, workflow): 42 preview-skjermer kjørt gjennom port → adversarisk review. Resultat: **29 portet til ekte adresse med ekte data** (mapper-mønster fra pilot-Hjem), 5 allerede koblet, 8 blokkert. tsc + build grønn samlet. 41/42 godkjent av review.
  - **Krever oppfølging (komponent-fiks, ikke data):** `drill-detalj` — v10-komponenten mangler «Trinn»-liste + «Coach-notat», har feil primærknapp og en fabrikkert feedback-seksjon vs v10-fasit. Loaderen gir steps+coachNotes, men komponenten bruker dem ikke. Data-koblingen er teknisk OK; komponenten må utvides til full v10-fasit (egen oppgave, ikke Bolk 1).
  - **Blokkert (trenger mer enn data-kobling):** auth-login/signup/forgot (skjema-flyt), marketing-forside, runde-ny, booking-ny, forelder, trackman. Disse rørte agentene ikke — flagget for manuell/sekvensiell port.
  - **Fikset av orchestrator:** kalender-port importerte WeekCalendarProps fra feil modul (loader i stedet for komponent) → 3 tsc-feil, rettet.
- 3. juni (natt): Pulje 1 + 2 ferdig — 43 skjermer fikk nytt v10-design i forhåndsvisning (liksom-tall). Workbench eneste med ekte data. Neste: ekte data + koble til ekte adresser.
