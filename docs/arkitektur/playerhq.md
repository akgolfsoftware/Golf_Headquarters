# PlayerHQ — Spillerens flate

Dato: 26. september 2026  
Plassering i kodebasen: `src/app/portal/`, `src/components/portal/`, `src/lib/portal/`

---

## 1. Hva PlayerHQ er

PlayerHQ er utøverens personlige arbeidsflate i AK Golf HQ. Den dekker hverdagen til en golfspiller: hva som skal gjøres i dag, live registrering under trening og spill, planlagte økter og uker, statistikk, analyse (TrackMan og Strokes Gained), tester, mål, utstyrsbag og personlige innstillinger.

Grensesnittet er tilpasset mobil (390 px) og desktop, og benytter prosjektets gjeldende designsystem (Precision Athletics / Sand, Graphite, Signal Rust, 8 px radius, IBM Plex Sans og IBM Plex Mono).

---

## 2. Ruter og oppbygning (175 ruter)

Totalt eier `/portal` **175 ruter** (174 `page.tsx` og 1 `route.ts`). Rutene fordeler seg på tre tekniske lag:

- **v2 / Hovedruter (142 ruter):** Moderne ruter innrammet av `V2Shell` med `PLAYERHQ_NAV` (`/components/v2/shell.tsx`).
- **Fullscreen (12 ruter):** Spesialiserte fullskjermflater under `src/app/portal/(fullscreen)/` for uforstyrret registrering under økter, runder og tester (f.eks. live tapper og runde-logg).
- **Legacy (21 ruter):** Eldre ruter under `src/app/portal/(legacy)/`. Med unntak av én flate er disse rene 307-redirects til nyere v2-ruter.

### Tematisk fordeling av rutene

| Gruppe | Antall ruter | Eksempler på URL-er |
|---|---|---|
| **I dag / Oversikt** | 3 | `/portal` (rot), `/portal/ukesdigest`, `/portal/varsler` |
| **Trening / Gjennomføre / Live** | 33 | `/portal/gjennomfore`, `/portal/live/[sessionId]`, `/portal/drills`, `/portal/fysisk`, `/portal/trening/putte-laboratoriet` |
| **Planlegge / Workbench / Mal** | 15 | `/portal/planlegge`, `/portal/planlegge/workbench`, `/portal/kalender`, `/portal/ai/foresla-drill` |
| **Analysere / Stats / TrackMan / Gameplan** | 38 | `/portal/analysere`, `/portal/analysere/trackman`, `/portal/analysere/datagolf`, `/portal/gameplan/[baneId]`, `/portal/mal/runder` |
| **Meg / Profil / Innstillinger / Abonnement** | 43 | `/portal/meg`, `/portal/meg/profil`, `/portal/meg/abonnement`, `/portal/meg/helse`, `/portal/meg/utstyrsbag`, `/portal/meg/innstillinger` |
| **Coach-kontakt & Tilbakemelding** | 17 | `/portal/coach`, `/portal/coach/melding`, `/portal/coach/sporsmal`, `/portal/coach/tilbakemelding`, `/portal/coach/videoer` |
| **Booking** | 11 | `/portal/booking`, `/portal/booking/coach/[coachId]`, `/portal/booking/anlegg/[anleggId]`, `/portal/onskeligokt` |
| **Talent / Toppidrett / Utfordringer / Venner** | 14 | `/portal/talent`, `/portal/toppidrett`, `/portal/utfordringer`, `/portal/venner`, `/portal/utviklingsplan` |
| **Annet / Legacy** | 1 | `/portal/(legacy)/agent-pipeline` (redirect) |

---

## 3. Datamodeller som leses og skrives

PlayerHQ forholder seg til **90 unike Prisma-modeller** (81 leses, 40+ skrives):

- **Kjerne og plan:** `User`, `TrainingPlan`, `TrainingPlanSession`, `TrainingSessionV2`, `WorkbenchSession`, `WorkbenchDrill`, `PlanTemplate`.
- **Gjennomføring og logger:** `TrainingPlanSessionLog`, `TrainingLog`, `SessionBallLog`, `DrillLogV2`, `PositionTaskLog`, `FysOkt`, `FysOvelseRad`.
- **Runder og golfslag:** `Round`, `Shot`, `HoleScore`, `CourseDefinition`, `CourseHole`, `Bane`, `GameplanHull`.
- **Tester og TrackMan:** `TestDefinition`, `TestResult`, `TestSession`, `TestAssignment`, `TrackManSession`, `TrackManShot`.
- **Mål og oppfølging:** `Goal`, `Achievement`, `CoachingSession`, `CoachNote`, `Question`, `Notification`.
- **Konto, betaling og relasjoner:** `Subscription`, `Payment`, `ParentRelation`, `EquipmentBag`, `HealthEntry`, `DelingsSamtykke`.

---

## 4. Hva som virker faktisk i dag

1. **Dagens økt og «Neste handling» (`/portal`):** Viser reell dagsplan basert på publiserte økter i `WorkbenchSession` og `TrainingPlanSession`. Regelmotoren `src/lib/portal/neste-beste-handling.ts` beregner om utøveren skal godkjenne plan, starte økt eller planlegge uken.
2. **Live balltapper (`/portal/(fullscreen)/live/[sessionId]/tapper`):** Fungerer i sanntid. Spilleren tapper slag per kølle, og handlingen persisterer atomisk til `SessionBallLog` og oppdaterer øktstatus til `COMPLETED` (`tapper/actions.ts`).
3. **Slag-for-slag-føring (`/portal/mal/runder/ny` og `[id]/slag`):** Utøveren fører hull for hull. Server action `lagreLoggetRunde` (`src/app/portal/(legacy)/mal/runder/logg/actions.ts`) beregner ekte Strokes Gained mot Broadie-formler og lagrer runden med `Round`, `Shot` og `HoleScore`.
4. **Analyse-hub (`/portal/analysere`):** Koblet til `hentAnalyseHub` i `src/lib/portal-analyse/tm-hub-data.ts`. Viser reell SG-fordeling (Utslag, Innspill, Nærspill, Putt) og TrackMan-spredningsellipser når data foreligger.
5. **Fysisk trening (`/portal/fysisk`):** Bruker `StyrkeProgramView` og `FysiskPlan` til bølgeperiodisering, logging av baseløft og skivekalkulator.
6. **Tester (`/portal/tren/tester`):** Spilleren kan gjennomføre tildelte tester fra Team Norway-batteriet eller egne tester, og resultatene lagres i `TestResult`.

---

## 5. Hva som er uferdig, stubs eller avskåret

- **Prototype stats-sider sperret i produksjon:** 11 sider under statistikk (f.eks. `/stats/pga/*` og `/stats/regions`) har fabrikkerte mockup-tall og omdirigeres i `src/proxy.ts` til `/stats` i produksjon.
- **GolfBox-synk er en stub:** `src/lib/portal/neste-beste-handling.ts` linje 13–16 fastslår:
  > *«GolfBox-synk er en stub uten ekte API-tilgang (src/app/portal/(legacy)/mal/runder/actions.ts), og vi viser aldri en handling basert på data vi ikke faktisk har.»*
  GolfBox-data må hentes via manuell import eller scraper-oppdatering.
- **Symptom- og helselogg:** `src/app/portal/meg/helse/symptom/ny/actions.ts` linje 23 bekrefter at loggføring av enkelte symptomer kun er en stub som validerer auth uten dyp persitering.
- **Eldre treningsruter fanges av proxy:** `/portal/tren/aarsplan`, `/portal/tren/teknisk-plan`, `/portal/tren/kalender` osv. nås aldri fordi `src/proxy.ts` (linje 159) fanger dem og sender brukeren direkte til `/portal/planlegge/workbench` via `workbenchRedirectForTrenPath`.
