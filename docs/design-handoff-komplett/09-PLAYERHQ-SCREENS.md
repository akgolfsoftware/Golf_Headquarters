# 09 — PlayerHQ Screens

Komplett liste av alle PlayerHQ-skjermer som må bygges i prototypen.

---

## STRUKTUR (7 hoveddeler)

### 1. AUTH (innlogging + onboarding)
- Login (e-post + passord)
- Glemt passord
- Registrer (ny bruker)
- Onboarding-wizard (8 steg)
- Foreldresamtykke-flyt (mindreårige)
- 2FA-setup
- E-post-verifisering

### 2. WORKBENCH (hjem)
- `/portal` — Workbench med:
  - Hero (avatar + Øyvind + HCP-trend + turnering-countdown)
  - Kalender-widget (horisontal 05-24)
  - AI-Innsikt (3 kort)
  - Ukas progresjon (pyramide-vekting)
  - Snarveier (8 grid)
  - Treningskompiser
  - Neste turnering
  - Velvære (når wearable)

### 3. PLANLEGGE
- `/portal/planlegge` — hub
- `/portal/tren/aarsplan` — årsplan
- `/portal/tren/aarsplan/periode/[id]/rediger` — rediger periode
- `/portal/tren/teknisk-plan` — teknisk plan
- `/portal/tren/teknisk-plan/[planId]` — teknisk plan-detalj
- `/portal/tren/fys-plan` — FYS-plan liste
- `/portal/tren/fys-plan/[planId]` — FYS-plan builder
- `/portal/drills` — drill-bibliotek
- `/portal/drills/[id]` — drill-detalj (slide-in panel)
- `/portal/mal` — mål-hub
- `/portal/mal/bygger` — AI mål-bygger
- `/portal/mal/goal/[id]` — mål-detalj
- `/portal/mal/milepaeler` — milepæler
- `/portal/tren/turneringer` — turneringer liste
- `/portal/tren/turneringer/[id]` — turnerings-detalj
- `/portal/utfordringer` — utfordringer liste
- `/portal/utfordringer/ny` — egen-challenge wizard (6 steg)
- `/portal/utfordringer/[id]` — utfordring-detalj
- `/portal/ai/mal-bygger` — AI mål-bygger
- `/portal/ai/foresla-drill` — AI foreslå drill
- `/portal/ai/foresla-turnering` — AI foreslå turnering

### 4. GJENNOMFØRE
- `/portal/gjennomfore` — hub
- `/portal/kalender` — kalender
- `/portal/tren/kalender` — treningskalender
- `/portal/tren/[sessionId]` — sesjon-detalj
- `/portal/tren/[sessionId]/planlagt` — planlagt sesjon-preview
- `/portal/tren/feiring/[planId]` — feiring etter fullført plan
- `/portal/tren/ovelser` — øvelser
- `/portal/tren/ovelser/[id]` — øvelse-detalj
- `/portal/booking` — booking-hub
- `/portal/booking/ny` — ny booking wizard (5 steg)
- `/portal/booking/ny/bekreft` — bekreft booking
- `/portal/booking/bekreftet` — bekreftet booking
- `/portal/booking/[bookingId]` — booking-detalj
- `/portal/booking/coach/[coachId]` — coach-profil
- `/portal/booking/anlegg/[anleggId]` — anleggs-detalj
- `/portal/ny-okt` — ny økt wizard
- `/portal/onskeligokt` — ønsket økt
- `/portal/onskeligokt/bekreftet` — bekreftet
- `/portal/(fullscreen)/live/[sessionId]/active` — live-økt aktiv
- `/portal/(fullscreen)/live/[sessionId]/brief` — pre-økt brief
- `/portal/(fullscreen)/live/[sessionId]/logger` — drill-logger
- `/portal/(fullscreen)/live/[sessionId]/summary` — post-økt summary
- `/portal/(fullscreen)/live/[sessionId]/tapper` — score-tapper

### 5. ANALYSERE
- `/portal/analysere` — hub
- `/portal/statistikk` — statistikk
- `/portal/statistikk/[metric]` — metrikk-detalj
- `/portal/statistikk/sammenlign` — sammenlign
- `/portal/mal/runder` — runder liste
- `/portal/mal/runder/[id]` — runde-detalj
- `/portal/mal/runder/ny` — logg runde wizard (6 steg)
- `/portal/mal/runder/[id]/shot-by-shot` — shot-by-shot
- `/portal/mal/sg-hub` — SG-hub
- `/portal/mal/sg-hub/[club]` — SG per kølle (7 sub-ruter)
- `/portal/mal/trackman` — TrackMan sesjoner
- `/portal/mal/trackman/[id]` — TrackMan sesjon-detalj
- `/portal/trackman/[sessionId]` — TrackMan data
- `/portal/tren/tester` — mine tester
- `/portal/tren/tester/ny` — ny test wizard (5 steg)
- `/portal/tren/tester/ny/egen` — egen-test wizard (5 steg)
- `/portal/tren/tester/[testId]` — test-detalj
- `/portal/(fullscreen)/test/[testId]/live` — test-utførelse
- `/portal/(fullscreen)/test/[testId]/summary` — test-sammendrag
- `/portal/mal/baner` — baner
- `/portal/mal/baner/[id]` — bane-detalj
- `/portal/mal/leaderboard` — leaderboard
- `/portal/innsikt` — AI-innsikt
- `/portal/analyse` — analyse (legacy stub)

### 6. COACH
- `/portal/coach` — coach-hub
- `/portal/coach/[coachId]` — coach-detalj
- `/portal/coach/melding` — meldinger
- `/portal/coach/melding/ny` — ny melding
- `/portal/coach/melding/[id]` — melding-detalj (tråd)
- `/portal/coach/melding/[id]/vedlegg` — vedlegg
- `/portal/coach/notater` (eller `/notes`) — coach-notater
- `/portal/coach/notater/[id]` — notat-detalj
- `/portal/coach/ovelser` — coach-tildelte øvelser
- `/portal/coach/ovelser/ny` — ny øvelse
- `/portal/coach/ovelser/[id]/rediger` — rediger øvelse
- `/portal/coach/plans` — coach-planer
- `/portal/coach/plans/[planId]` — plan-detalj
- `/portal/coach/plans/[planId]/ny-okt` — legg til økt
- `/portal/coach/plans/perioder` — perioder
- `/portal/coach/sporsmal/[id]` — spørsmål til coach
- `/portal/coach/videoer` — coach-videoer
- `/portal/coach/ai` — AI-assistanse
- `/portal/spiller/[spillerId]` — spiller-profil (coach-view)
- `/portal/agent-pipeline` — AI-agent-pipeline

### 7. TALENT
- `/portal/talent` — talent-hub
- `/portal/talent/mitt-niva` — mitt nivå
- `/portal/talent/min-plan` — min plan
- `/portal/talent/roadmap` — karriere-roadmap
- `/portal/talent/sammenligning` — sammenligning

### 8. MEG (profil + innstillinger)
- `/portal/meg` — meg-hub
- `/portal/meg/profil/rediger` — rediger profil
- `/portal/profil` — profil (legacy)
- `/portal/meg/innstillinger` — innstillinger-hub
- `/portal/meg/innstillinger/personvern` — personvern
- `/portal/meg/innstillinger/integrasjoner` — integrasjoner (Garmin, Apple Health)
- `/portal/meg/innstillinger/sprak` — språk
- `/portal/meg/innstillinger/varsler` — varsler
- `/portal/meg/innstillinger/sikkerhet` — sikkerhet
- `/portal/meg/innstillinger/anlegg` — anlegg-preferanser
- `/portal/meg/innstillinger/okter` — økt-preferanser
- `/portal/meg/innstillinger/eksport` — data-eksport
- `/portal/meg/sikkerhet` — sikkerhet
- `/portal/meg/sikkerhet/2fa` — 2FA-setup
- `/portal/meg/abonnement` — abonnement
- `/portal/meg/abonnement/oppgrader` — oppgrader
- `/portal/meg/abonnement/flyt` — abonnement-flyt
- `/portal/meg/abonnement/kort/ny` — nytt betalingskort
- `/portal/meg/abonnement/faktura/[id]` — faktura-detalj
- `/portal/meg/abonnement/avbestill` — avbestill
- `/portal/meg/bookinger` — mine bookinger
- `/portal/meg/bookinger/reschedule/[bookingId]` — reschedule
- `/portal/meg/foreldre` — foreldre-referanser
- `/portal/meg/utstyrsbag` — utstyrsbag
- `/portal/meg/dokumenter` — dokumenter
- `/portal/meg/feedback` — feedback
- `/portal/meg/helse` — helse-tracker
- `/portal/meg/helse/symptom/ny` — logg symptom
- `/portal/meg/help` — hjelpesenter
- `/portal/meg/help/kategori/[slug]` — hjelp-kategori
- `/portal/meg/help/artikkel/[slug]` — hjelp-artikkel
- `/portal/meg/help/kontakt` — kontakt
- `/portal/varsler` — varselsenter
- `/portal/reach` — reach (sosial sharing)

---

## MODALER (åpnes fra skjermer)

- Cmd+K Global Søk
- Ny notat-modal (fra Coach-notater)
- InviteFriend-modal (fra Trene sammen)
- Reschedule-modal (fra booking-detalj)
- Bekreft-flyt (slett, avbestill)
- Eksport-modal (fra runder)
- Profil-rediger-modal
- Velg-fasilitet-modal
- Logg-symptom-modal
- Test-utfør-modal
- Drill-detail-panel (slide-in)
- Re-auth-modal (sensitive handlinger)

---

## TOTALER

| Type | Antall |
|---|---|
| Toppnivå hubs | 7 |
| Sub-sider | ~60 |
| Wizards (multi-step) | 6 |
| Modaler | 13 |
| Fullscreen-ruter | 7 |
| **TOTALT PlayerHQ-skjermer** | **~100** |

---

## NAVIGASJON-FLYT

### Mobile (iPhone)
1. **Bottom-nav** (5 tabs): Hjem / Planlegg / Gjennomfør / Analyser / Meg
2. **Hamburger-sheet** (fra topbar) → sidemeny med alle sub-seksjoner
3. **Tilbake** via ChevronLeft i Breadcrumb
4. **⌘K** finnes ikke (mobile har ikke fysisk tastatur), bruk Søk-knapp i topbar

### Desktop
1. **Sidebar** (sticky 256px) — alle 7 seksjoner + sub
2. **TopBar** med Søk-trigger + Bell + Profile-menu
3. **⌘K** for global søk
4. **Breadcrumb** øverst på hver sub-side

### Kombinert
- localStorage husker hvilken seksjon som er aktiv
- URL-state delbar (`?modus=...`, `?spiller=...`)
- Tilbake-knapp i browser respekteres
