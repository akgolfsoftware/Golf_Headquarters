# Funksjonskart — PlayerHQ (spiller)

> **Hva dette er:** Kart over *alt spiller-appen kan gjøre*, gruppert etter **spillerens oppgaver** — ikke etter
> dagens skjermer. Grunnlag for å designe færre, tettere skjermer uten å miste funksjon.
>
> **Kilde (kode-verifisert):** 156 PlayerHQ-skjermer (`portal.json`) + **176 server-handlinger** (`actions.ts` under
> `src/app/portal`). «Potensial/mangler» = forslag, tydelig merket. PlayerHQ er **alltid lyst tema** (låst).
> Generert 2026-06-30. READ-ONLY.

---

## Sammendrag — 10 oppgave-områder (5 hovedfaner + 5 sidespor)

Den låste IA-en er **5-fane bunnbar: Hjem · Planlegge · Gjennomføre · Analysere · Meg**. Alt annet er sidespor.

| # | Oppgave (spillerens jobb) | Hovedfane | Skjermer i dag | Handlinger | Kan samles til |
|---|---|---|---|--:|--:|
| 1 | **Hjem** — hva skal JEG gjøre i dag | Hjem ★ | ~3 | (lese) | 1 flate |
| 2 | **Planlegge** — min trening (plan/periodisering/mål) | Planlegge ★ | ~30 | ~45 | 1 Workbench m/zoom |
| 3 | **Gjennomføre** — dagens økt, kalender, live | Gjennomføre ★ | ~18 | ~30 | 1 hub m/faner |
| 4 | **Analysere** — SG, runder, TrackMan, tester | Analysere ★ | ~35 | ~25 | 1 flate m/faner |
| 5 | **Meg** — profil, abonnement, helse, innstillinger | Meg ★ | ~33 | ~25 | 1 hub m/seksjoner |
| 6 | **Coach-dialog** — meldinger, spørsmål, AI-coach | (sidespor) | ~22 | ~20 | 1 coach-flate |
| 7 | **Booking** — book coach/anlegg | (sidespor) | ~8 | ~6 | 1 booking-flyt |
| 8 | **Mål & motivasjon** — mål, utfordringer, leaderboard | (i Planlegge/Hjem) | ~10 | ~10 | inn i Hjem/Planlegge |
| 9 | **Talent** (Elite, utsatt) | (sidespor) | ~5 | ~3 | 1 hub (senere) |
| 10 | **Varsler** | (global) | ~1 | ~3 | global bjelle |

**~156 skjermer → 5 hovedfaner + ~5 sidespor.** Ingen funksjon forsvinner — de blir faner/zoom/states.

---

## 1. Hjem — «hva skal JEG gjøre i dag»

| Funksjon | Handling | Hvor i dag | Datakomponent |
|---|---|---|---|
| Dagens fokus (dagens økt, SG-fordeling, coach-notat, nytt) | `getDashboardData`, `getTodaysSession`, `getStatsSnapshot`, `getLatestCoachMessage`, `getRecentActivity` | `/portal` | hero + dagens-økt-kort + SG-mini |
| Pin/løft favoritt-økt | `pinSession`, `unpinSession` | hjem | kort |
| Hva er nytt | `getUnreadNotifications` | hjem | varsel-stripe |

**Potensial/mangler:** Hjem er allerede fokusert. 10/10-løftet: gjøre den **proaktiv** («jobb med X i dag») — krever benchmark/fokus-motor (se forslag-dok).

## 2. Planlegge — «min trening» (Workbench)

| Funksjon | Handling | Hvor i dag | Datakomponent |
|---|---|---|---|
| Workbench (all planlegging, zoom årsplan→dag) | `getWorkbenchData`, `addWorkbenchSession`, `moveWorkbenchSession`, `removeWorkbenchSession` | `/portal/planlegge/workbench` | hub-faner + zoom |
| Treningsplaner | `createTrainingPlan`, `opprettPlan`, `lagrePlan`, `setActivePlan`, `setActivePlanVariant`, `listTrainingPlans` | `/portal/coach/plans`, workbench | plan-liste/detalj |
| Periodisering / årsplan | `opprettSeasonPlan`, `oppdaterSeasonPlan`, `createPeriod`, `oppdaterPeriod`, `opprettPeriodBlock`, `oppdaterPeriodBlock`, `slettPeriodBlock`, `koblTilArsplan`, `bulkKoblTurneringerTilArsplan` | `/portal/tren/aarsplan(/periode/[id]/rediger)` | Gantt/periode-tidslinje |
| Teknisk plan | lese/redigere | `/portal/tren/teknisk-plan(/[planId])` | L-fase-tidslinje |
| Fys-plan | `createTrainingPlanSession` m.fl. | `/portal/tren/fys-plan(/[planId])` | plan-bygger |
| Mål (mål-hub, bygger, milepæler) | `getGoals`, `lagreMalForslag`, `genererPlanForslag`, `hentByggerKontekst` | `/portal/mal*`, `/portal/ai/mal-bygger` | mål-kort + wizard |
| Driller i plan (be om / dele) | `requestDrillInPlan`, `addDrill`, `shareDrillWithCoach`, `rateDrill`, `saveDrillNote` | `/portal/drills*` | drill-grid |
| Treningsleir | `createTrainingCamp`, `listTrainingCamps` | (workbench) | leir-kort |
| Plan-endring-forespørsel | `createPlanChangeRequest`, `getPlanChangeRequests`, `beOmEndring`, `trekkTilbakeAvvisning` | coach/plan | forespørsel |

**Potensial/mangler:** Største spredning — plan/periodisering/teknisk/fys/mål ligger på **fire ulike adresse-trær** (`coach/plans`, `tren/aarsplan`, `tren/teknisk-plan`, `tren/fys-plan`, `mal/*`). Låst beslutning: alt skal i **Workbench**. Bør være faner/zoom der, ikke separate sider.

## 3. Gjennomføre — «dagens økt, kalender, live»

| Funksjon | Handling | Hvor i dag | Datakomponent |
|---|---|---|---|
| I dag / kalender / booking (faner) | `getAllTodaysSessions`, `getUpcomingSessions`, `getWeekOverview` | `/portal/gjennomfore`, `/portal/kalender` | fane-flate + kalender |
| Live-økt (brief→aktiv→logger→tapper→summary) | `loadLiveSession`, `startSession`, `completeDrill`, `logRep(s)`, `logDrillReps`, `completeSet`, `addSet`, `completeSession`, `finishSession`, `freezeSessionSummary`, `loggFullfortOkt` | `/portal/(fullscreen)/live/[id]/*` | fullskjerm terminal |
| Ny økt / rask økt / ad-hoc | `createAdHocSession`, `opprettRaskOkt`, `createSession`, `leggTilOkt` | `/portal/ny-okt` | handlingsvalg |
| Ønsket økt (be coach) | `sendOnskeligOkt` | `/portal/onskeligokt` | skjema |
| Logg treningsøkt (volum per SG) | `logDrillAsSession`, `registrerMestringsOkt`, `logReps` | `/portal/trening/logg` | volum-input |
| Standardøkt til kalender | `addStandardSessionToCalendar` | gjennomføre | kort |
| Putte-lab / break-tabell | (verktøy) | `/portal/trening/putte-laboratoriet`, `/break-tabell` | verktøy |

**Potensial/mangler:** Live-økt er solid (5 steg). `trening/*`-verktøyene (putte-lab, break-tabell, logg) er løse sidesider — kan bli verktøy *inne i* Gjennomføre eller en økt.

## 4. Analysere — «les tallene» (SG/runder/TrackMan/tester)

| Funksjon | Handling | Hvor i dag | Datakomponent |
|---|---|---|---|
| Analyse-flate (SG/Runder/TrackMan/Tester-faner) | `loadAnalyticsWorkbenchData`, `getStatsSnapshot` | `/portal/analysere(/hull)` | fane-flate |
| SG-Hub (kølle/benchmark/best-vs-nå/forhold/utstyr/strategi/yardage) | `lagreSgDiagnose` | `/portal/mal/sg-hub/*` (10 undersider) | SG-paneler |
| Runder (logg, detalj, slag-for-slag, del) | `createRound`, `logRoundManual`, `saveRoundStats`, `getRoundDetail`, `getRoundStats`, `saveShot`, `deleteShot`, `deleteRound`, `shareRound`, `exportRounds` | `/portal/mal/runder/*`, `/portal/statistikk/*` | runde-tabell + shot-view |
| TrackMan (liste, sesjon, import) | `importTrackManCsv`, `importTrackManHtml`, `getTrackManData` | `/portal/mal/trackman/*`, `/portal/trackman/[id]` | data-tabell |
| Tester (oversikt, katalog, ny, egen) | `logTest`, `lagreTestResultat`, `opprettCustomTest` | `/portal/tren/tester/*` | test-tabell |
| Statistikk (metrikk-detalj, sammenlign) | `getKpiStats`, `getTrainingStats` | `/portal/statistikk/*` | metrikk-kort |
| Import: GolfBox / UpGame | `importFromGolfBox`, `previewGolfBoxRounds`, `importUpGameShots` | runder/slag | import-flyt |

**Potensial/mangler:** **Låst beslutning: Analyse = én flate med faner.** Men SG-Hub (10 undersider under `mal/sg-hub`), runder (under `mal/runder` OG `statistikk`), TrackMan (to adresser) og tester (under `tren`) er **fortsatt spredt**. Dublett: `statistikk` ↔ `mal/runder`, `trackman/[id]` ↔ `mal/trackman/[id]`, `analyse` ↔ `analysere`, `stats` ↔ `statistikk`. Bør samles til **én Analysere-flate** med faner (SG · Runder · TrackMan · Tester · Statistikk).

## 5. Meg — «profil, abonnement, helse, innstillinger»

| Funksjon | Handling | Hvor i dag | Datakomponent |
|---|---|---|---|
| Profil (visning/rediger) | `hentProfil`, `oppdaterProfil`, `updateProfile`, `oppdaterPreferences` | `/portal/meg(/profil/rediger)` | profil-kort + skjema |
| Abonnement (gratis/300kr, faktura, kort, oppgrader, avbestill) | `requestProUpgrade`, `cancelPro`, `sendFakturaPaaEpost` | `/portal/meg/abonnement/*` | abonnement-panel |
| Helse (symptom/belastning) | `lagreHelseEntry`, `logSymptom` | `/portal/meg/helse(/symptom/ny)` | helse-logg |
| Innstillinger (anlegg, integrasjoner, økter, personvern, sikkerhet, språk, varsler, AI-coach) | `lagreFasilitetProfil`, `saveFacilities`, `lagreUtstyrsbag` | `/portal/meg/innstillinger/*` (10) | innstillings-rader |
| Utstyrsbag | `lagreUtstyrsbag` | `/portal/meg/utstyrsbag` | utstyr-liste |
| Sikkerhet / 2FA | (Setup2FA) | `/portal/meg/sikkerhet/2fa` | 2FA |
| Dokumenter, hjelp, feedback, kontakt | `submitFeedback`, `submitSupportTicket` | `/portal/meg/dokumenter`, `/help/*`, `/feedback` | liste/artikkel |
| Foreldre / personvern (samtykke, eksport, slett konto) | `inviterForelder`, `fjernForelderTilgang`, `exportUserData`, `requestDataExport`, `requestAccountDeletion`, `deleteUserAccount`, `toggleAnonymiser` | `/portal/meg/foreldre`, `/innstillinger/personvern` | samtykke/GDPR |

**Potensial/mangler:** ~33 skjermer i Meg — mest innstillings-rader som ikke trenger egne sider. Bør være **én Meg-flate** med seksjoner + få modaler (abonnement-flyt, GDPR).

## 6. Coach-dialog (sidespor)

| Funksjon | Handling | Hvor i dag | Datakomponent |
|---|---|---|---|
| Meldinger (innboks/tråd/ny/vedlegg) | `getMessages`, `sendMessage`, `sendReply`, `sendCoachMelding`, `uploadMessageAttachment`, `lastOppVedlegg`, `slettVedlegg` | `/portal/coach/melding/*` | innboks |
| Spørsmål til coach | `stillSporsmal`, `svarPaSporsmal` | `/portal/coach/sporsmal/*` | spørsmål-tråd |
| Coach-AI | (chat) | `/portal/coach/ai` | chat |
| Coach-notater / øvelser / planer / videoer | `getCoachNotes`, `oppdaterOvelse`, `opprettOvelse`, `slettOvelse`, `createCustomExercise` | `/portal/coach/*` | liste |

**Potensial/mangler:** Meldinger + spørsmål er **to innbokser for samme jobb** (snakk med coach). Bør samles. Mye av `coach/*` (notater/øvelser/planer) er egentlig coach-verktøy som lekker inn i spiller-appen — avklar hva spilleren faktisk trenger.

## 7. Booking (sidespor)

| Funksjon | Handling | Hvor i dag | Datakomponent |
|---|---|---|---|
| Book coach/anlegg (hub→ny→bekreft) | (booking-flyt) | `/portal/booking/*` | wizard |
| Mine bookinger + endre tid | `cancelBooking`, `rescheduleBooking` | `/portal/meg/bookinger(/reschedule)` | booking-liste |

## 8. Mål & motivasjon (i Hjem/Planlegge)

| Funksjon | Handling | Hvor i dag | Datakomponent |
|---|---|---|---|
| Mål + milepæler | `getGoals`, `lagreMalForslag` | `/portal/mal/goal/[id]`, `/milepaeler` | mål-kort |
| Leaderboard | (lese) | `/portal/mal/leaderboard` | rangering |
| Utfordringer | `opprettUtfordring`, `opprettCustomChallenge`, `bliMed`, `avsluttUtfordring` | `/portal/utfordringer/*` | utfordring-kort |
| Feiring (etter plan) | (lese) | `/portal/tren/feiring/[planId]` | feiring |

**Potensial/mangler:** Motivasjons-laget (streaks, leaderboard, utfordringer, feiring) er **spredt og underutnyttet**. Stort 10/10-potensial (engasjement) — bør samles og løftes inn i Hjem.

## 9. Talent (Elite, utsatt) & 10. Varsler
Talent (`/portal/talent/*`, 5 skjermer) er Elite Fase 2 — utsatt. Varsler (`/portal/varsler`): `markNotificationsRead`, `deleteNotifications` — global bjelle.

---

## «Blanke ark» — forslag til konsolidert skjerm-sett (PlayerHQ)

Den låste 5-fane-IA-en står. Konsolideringen er å samle de 156 skjermene *under* fanene:

| Fane / spor | Erstatter (dagens ruter) |
|---|---|
| **Hjem ★** | `/portal` + motivasjon (mål/utfordringer/leaderboard/feiring løftet hit som kort) |
| **Planlegge ★** (Workbench) | planlegge/workbench, coach/plans(+perioder), tren/aarsplan, tren/teknisk-plan, tren/fys-plan, mal/* (mål/bygger/milepæler), drills |
| **Gjennomføre ★** | gjennomfore, kalender, ny-okt, onskeligokt, live/*, trening/* (logg/putte-lab/break-tabell) |
| **Analysere ★** | analysere, mal/sg-hub/* (10), mal/runder/*, statistikk/*, mal/trackman/*, trackman/*, tren/tester/* |
| **Meg ★** | meg + alle meg/* (abonnement/helse/innstillinger/utstyrsbag/dokumenter/sikkerhet/foreldre/help) |
| **Coach** (sidespor) | coach/melding/* + coach/sporsmal/* (slått sammen) + coach/ai |
| **Booking** (sidespor) | booking/*, meg/bookinger/* |
| **Talent** (sidespor, utsatt) | talent/* |
| **Varsler** (global bjelle) | varsler |

**Resultat:** 5 faner + 4 sidespor + modaler/wizarder/live-fullskjerm — mot 156 ruter. Alle 176 handlinger beholdt.

**Rydd opp i dubletter:** `analyse↔analysere`, `stats↔statistikk`, `tren/ovelser↔drills`, `tren/kalender↔kalender`, `trackman/[id]↔mal/trackman/[id]`, `statistikk/runder↔mal/runder`, og fjern «IKKE i MASTER»-rutene (baneguide, coach/sg-hub, coach/sporsmal) eller adopter dem bevisst.

---

## Neste
Se `funksjonsforslag-10-10-playerhq.md` (nye funksjoner mot 10/10), `implementeringsplan-playerhq.md` og
`spesifikasjon-faser-playerhq.md` (design + bygg per fase).
