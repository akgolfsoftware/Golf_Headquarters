# Funksjonskart — PlayerHQ, Forelder og Auth (redesign v2)

> **Hva dette er:** Funksjons- og informasjonsinventar per skjermfamilie — grunnlag for komplett
> visuelt redesign. Beskriver HVA hver familie viser og gjør, ikke hvordan den ser ut.
> **Kilder:** `docs/MASTER-SKJERMPLAN.md` (autoritativ ruteliste), faktisk kode i `src/app/portal/**`,
> `src/app/forelder/**`, `src/app/auth/**` + `plans/skjermplan-master.md` (produktløkken).
> **Produktløkken:** Analyse → Plan (Workbench) → Live-økt → Gjennomføring → ny Analyse.
> **35 skjermfamilier totalt:** PlayerHQ 27 · Forelder 4 · Auth 4.
> **Prioritet:** P1 = 11 familier (kjerneløkka Hjem/Plan/Gjør/Analysere/Meg + innlogging/onboarding) ·
> P2 = 18 familier (dybde, coach-kontakt, booking, abonnement, forelder-kjernen) ·
> P3 = 6 familier (utfordringer, putte-lab, baneguide, hjelp, talent, forelder-økonomi).
> Låst: Planlegge = ETT trykkpunkt til Workbench · Analysere = ÉN flate med faner · anbefalinger, aldri sperrer.

---

# PlayerHQ (`/portal`)

## Hjem — `/portal`
- **Jobb:** Spilleren ser på 5 sekunder hva som skjer i dag og hvor hen står — og hopper rett videre.
- **Data inn:** Hilsen + ukenummer; dagens økter (alle); ukeoversikt; siste aktivitet (5); mål (topp 3); uleste varsler + siste coach-melding; stats-snapshot (HCP, SG-snitt, siste runder); KPI-tall; neste turnering; ukeplan-progresjon; trenings-heatmap.
- **Handlinger:** Starte dagens økt; hurtighandlinger til Plan/Gjør/Analysere; åpne varsel/melding; navigere til mål og turnering.
- **Varianter:** `/portal` (Hjem) · `/portal/varsler` (full varselliste med les/kvitter).
- **Prioritet:** P1.

## Planlegge (trykkpunkt) — `/portal/planlegge`
- **Jobb:** Ett trykkpunkt inn til all planlegging (ikke en meny av kort) — viser plan-status og sender til Workbench.
- **Data inn:** Aktiv treningsplan + status (DRAFT → PENDING_PLAYER → ACCEPTED → ACTIVE); ukens økter; coachens plan-forslag som venter svar.
- **Handlinger:** Gå til Workbench; godta/avvise coach-plan med kommentar.
- **Varianter:** `/portal/planlegge` (mobil-inngangen).
- **Prioritet:** P1.

## Workbench (planlegging) — `/portal/planlegge/workbench`
- **Jobb:** Spilleren (og coach i samme implementasjon, rolle-prop) bygger og justerer treningsuka si — hele planleggingen bor her.
- **Data inn:** 8 faner: Teknisk plan · Sesongmål · Maler · Standardøkter · Gantt (År) · Uke · Dag · Økt. Ukens økter (TrainingPlanSession = kanon, V2-speil merged); øktmaler/ukemaler med SG-effekt-tall; drillbank; aktiv periode (GRUNN/SPES/TURN) med mal-anbefaling; pyramide-budsjett fra drill-minutter; compliance- og fokus-innløp (SG-gap → foreslått fokus); avviks-chips (CANON-anbefalinger — aldri sperrer).
- **Handlinger:** Dra-og-slipp økter i uka; navigere uker (forrige/neste); bruke mal; duplisere forrige uke; komponere økt på drill-nivå (drill fra bank → repstype: svinger uten ball / baller / tid / sett×reps → volum, alle 6 akser per drill + bulk-apply); plassere økt på klokkeslett i Dag-fanen; publisere plan til coach/spiller.
- **Varianter:** `/portal/planlegge/workbench` (`?uke=N`); samme komposisjon gjenbrukes i coachens `/admin/spillere/[id]/workbench`.
- **Prioritet:** P1.

## Årsplan og perioder — `/portal/tren/aarsplan`
- **Jobb:** Se og redigere sesongen som helhet — perioder, faser og turneringsmarkering på tidslinje.
- **Data inn:** SeasonPlan + PeriodBlock (Gantt over året); periodetype (GRUNN/SPES/TURN); turneringer i sesongen; CANON-periode-anbefaling (aksefordeling per periode).
- **Handlinger:** Opprette/redigere/slette periode; navigere Gantt → periode; se avviks-chip mot anbefalt fordeling (lagring aldri blokkert).
- **Varianter:** `/portal/tren/aarsplan` · `.../periode/[id]/rediger` · `.../periode/ny`.
- **Prioritet:** P2.

## Mål og milepæler — `/portal/mal`
- **Jobb:** Sette, følge og feire sesong- og delmål.
- **Data inn:** Goal (måltype, målverdi, frist, fremdrift); milepæler; leaderboard mot andre spillere; AI-forslag til mål.
- **Handlinger:** Bygge mål i wizard (manuelt eller AI-assistert); redigere/fullføre mål; se milepæl-status; sammenligne på leaderboard.
- **Varianter:** `/portal/mal` · `/portal/mal/bygger` · `/portal/mal/goal/[id]` · `/portal/mal/milepaeler` · `/portal/mal/leaderboard` · `/portal/ai/mal-bygger`.
- **Prioritet:** P2.

## Teknisk plan og fys-plan — `/portal/tren/teknisk-plan`
- **Jobb:** Se sin tekniske utviklingsplan (P1–P10-svingposisjoner) og fysiske treningsprogram.
- **Data inn:** TechnicalPlan (posisjonsoppgaver, rep-mål per hastighet, TrackMan-mål); FysOkt/FysOvelseRad-hierarki (splitt, øvelser, sett/reps/kg/tid/sone). Fagkoder oversettes til klarspråk for spiller.
- **Handlinger:** Åpne plan-detalj; kvittere oppgaver; følge progresjon per posisjon/øvelse.
- **Varianter:** `/portal/tren/teknisk-plan` + `/[planId]` · `/portal/tren/fys-plan` + `/[planId]`.
- **Prioritet:** P2.

## Drillbibliotek — `/portal/drills`
- **Jobb:** Finne øvelser å trene på — plattformens drillbank er sannhetskilden.
- **Data inn:** Drill-katalog (navn, pyramideområde, kategori, miljø/fasilitet, CS-nivå, beskrivelse, video); filtrert på spillerens tilgjengelige fasiliteter; AI-drillforslag koblet mot SG-svakhet («din svakhet → denne øvelsen»).
- **Handlinger:** Søke/filtrere; åpne drill-detalj; legge drill i økt (via Workbench); be AI foreslå drill.
- **Varianter:** `/portal/drills` · `/portal/drills/[id]` · `/portal/ai/foresla-drill` · (redirect: `/portal/tren/ovelser(/[id])`).
- **Prioritet:** P2.

## Turneringer — `/portal/tren/turneringer`
- **Jobb:** Holde oversikt over egne turneringer og planlegge mot dem.
- **Data inn:** TournamentEntry (navn, dato, bane, status); resultat (plassering, score til par); kobling til sesongplan; AI-forslag til passende turneringer.
- **Handlinger:** Legge til turnering; åpne detalj; be AI foreslå turnering.
- **Varianter:** `/portal/tren/turneringer` · `/[id]` · `/ny` · `/portal/ai/foresla-turnering`.
- **Prioritet:** P2.

## Utfordringer — `/portal/utfordringer`
- **Jobb:** Gjennomføre drill-utfordringer med score og sammenligning.
- **Data inn:** DrillChallenge (utfordring, regler, scoreformat, deltakere, resultat).
- **Handlinger:** Opprette utfordring (wizard); registrere score; se resultat/rangering.
- **Varianter:** `/portal/utfordringer` · `/ny` · `/[id]`.
- **Prioritet:** P3.

## Gjennomføre (dagens program) — `/portal/gjennomfore`
- **Jobb:** Se hva som skal gjøres i dag og sette i gang — trening, kalender og booking i én flate.
- **Data inn:** Faner I dag / Kalender / Booking. I dag: Neste økt (featured med mål/drills) · resten av dagen · fullført i dag; økt-detalj viser V2-økt fra coach (drills, reps, miljø); kalendervisning av planlagte økter og bookinger; volumlogg per SG-kategori.
- **Handlinger:** Starte live-økt; kvittere økt som gjennomført; logge treningsvolum manuelt; be coach om ønsket økt (skjema + bekreftelse); opprette egen økt (handlingsvalg); se feiring når plan fullføres.
- **Varianter:** `/portal/gjennomfore` · `/[id]` (økt-detalj) · `/portal/ny-okt` · `/portal/onskeligokt(/bekreftet)` · `/portal/tren/[sessionId](/planlagt)` · `/portal/tren/feiring/[planId]` · `/portal/trening/logg` · `/portal/kalender` + `/portal/tren/kalender` (kalender-varianter).
- **Prioritet:** P1.

## Live-økt (fullskjerm) — `/portal/(fullscreen)/live/[sessionId]`
- **Jobb:** Gjennomføre en hel treningsøkt på mobilen uten å forlate flaten — brief, logging, oppsummering.
- **Data inn:** Brief: øktens mål, fokus og drilliste. Aktiv: drill-sjekkliste med aktiv drill ekspandert, timer (total + per drill), planlagt repstype/volum vs. faktisk, spørsmål til coach (tekst/video/stemme). Oppsummering: reps/tid/drills-KPI, faktisk-vs-planlagt. Skal fungere offline med synk etterpå.
- **Handlinger:** Starte økt (PLANNED → IN_PROGRESS); logge reps (+5/+10/+20); huke av sett; stille spørsmål/laste opp video; fullføre økt → oppsummering; hurtiglogge i drill-logger og score-tapper.
- **Varianter:** `.../brief` · `.../active` · `.../logger` · `.../tapper` · `.../summary` · `/portal/(fullscreen)/tren`.
- **Prioritet:** P1.

## Putte-laboratoriet og break-tabell — `/portal/trening/putte-laboratoriet`
- **Jobb:** Regne på putting-fysikk — break, fart og green-lesing som treningsverktøy.
- **Data inn:** Fysikkberegninger fra putt-core (ingen persondata): tre putte-verktøy (Greenen/Kjeden/Kontroll) + break-matrise med heatmap, interaktiv break-kalkulator (opp/ned-fart), hastighets-sammenligning. Putting i fot (CANON).
- **Handlinger:** Justere parametre (avstand, helning, stimp); lese av break/fart; veksle mellom verktøy.
- **Varianter:** `/portal/trening/putte-laboratoriet` · `/portal/trening/break-tabell`.
- **Prioritet:** P3.

## Analysere (samlet analyseflate) — `/portal/analysere`
- **Jobb:** Spilleren får dommen: hva koster meg slag, hva skal jeg trene, og virker det. Analytikerkjeden Resultat → Mønster → Årsak → Prioritet → Trening, alltid med «Planlegg dette».
- **Data inn:** **ÉN flate med 5 faner: SG · Statistikk · Trening · TrackMan · Tester.**
  - **SG:** SG-total og per kategori (OTT/APP/ARG/PUTT) med fortegn + «slag» + navngitt baseline; trend; slag-lekkasje/diagnose; AI-innsiktsfortelling (SgInsight); neste fokus.
  - **Statistikk:** scoringsnitt, fairway/GIR/putts, metrikk-trender, Tiger Five, sammenligning.
  - **Trening (pivot):** treningsanalyse som pivottabell — filtrer på akse (PYR/Område/CS/Læringstrinn/Situasjon/Press), kategori, miljø og økt-/repstype, og sammenlign segmenter; nøkkeltall (baller slått, svinger uten ball, CS-fordeling, M/PR-eksponering); planlagt vs. gjennomført.
  - **TrackMan (PER KØLLE):** tall per kølle i baggen med spillervalgte parametere — smash, ballhastighet, klubbhastighet, spinn, bære, topphøyde, landingsvinkel, side; trend og stabilitet per kølle; bias ≠ spredning, meter med V/H.
  - **Tester:** testresultater med benchmark-nivå og progresjonstrend per test.
- **Handlinger:** Bytte fane; velge/lagre hvilke TrackMan-parametere som vises; pivotere/filtrere trening; drille ned til runde-/sesjon-/test-detalj; «Planlegg dette» → Workbench. Datagrunnlag alltid synlig; progressiv dybde (nybegynner/øvet/elite).
- **Varianter:** `/portal/analysere` (hovedadresse). Absorberer dagens separate ruter som faner: `/portal/statistikk` (+ `/[metric]`, `/sammenlign`) · `/portal/mal/sg-hub` · `/portal/mal/trackman` · `/portal/tren/tester`-oversikten · `/portal/mal/statistikk` (gml.) · redirects `/portal/analyse`, `/portal/stats`. NB: dagens kode har 6 faner (SG/Fokus/Runder/Baggen/Putting/Nivå) — redesignmålet er de 5 fanene over.
- **Prioritet:** P1.

## SG-dybde (Strokes Gained-underskjermer) — `/portal/mal/sg-hub/*`
- **Jobb:** Gå i dybden på ÉN SG-dimensjon: kølle, utstyr, avstander, forhold, strategi, benchmark.
- **Data inn:** SG per kølle (kølle-detalj); benchmark mot PGA/DataGolf-baseline; beste periode vs. nå; utstyrseffekt; avstandsgapping (yardage); vær-/baneforhold; strategianbefalinger; SG-vs-trening-punktsky med regresjon.
- **Handlinger:** Velge kølle/dimensjon; veksle ENKEL/AVANSERT; gå fra svakhet til drill («gap-to-drill»); «Planlegg dette».
- **Varianter:** `.../[club]` · `benchmark` · `best-vs-now` · `equipment` · `yardage` · `conditions` · `strategy` · coach-visninger `coach/[spillerId](/[club])(/equipment)`.
- **Prioritet:** P2.

## Runder — `/portal/mal/runder`
- **Jobb:** Logge runder og forstå dem — score, SG og hull-for-hull.
- **Data inn:** Runde-liste (dato, bane, brutto score — aldri netto); runde-detalj med SG per kategori, per-hull (strokes, putts, fairway, GIR); slag-for-slag (kølle, distanse, lie, resultat); hull-analyse på tvers av runder (varmekart).
- **Handlinger:** Logge ny runde; registrere slag i wizard (UpGame-mønster); føre slag live under runden; dele runde; drille fra runde → hull → slag.
- **Varianter:** `/portal/mal/runder` · `/[id]` · `/[id]/shot-by-shot` · `/[id]/slag` · `/ny` · `/portal/(fullscreen)/runde-logg` · `/portal/statistikk/runder/[runId]/del` · `/portal/analysere/hull`.
- **Prioritet:** P1.

## TrackMan-sesjon (detalj) — `/portal/mal/trackman/[id]`
- **Jobb:** Se én TrackMan-økt i detalj — hvert slag, hver kølle, stabilitet.
- **Data inn:** TrackManSession + TrackManShot: per slag ballhastighet, spinn, launch, carry, side; per kølle snitt og varians; stabilitets-score med varians-heatmap (parameter × kølle); bias/spredning-minikart; kobling til teknisk plan (posisjons-matching).
- **Handlinger:** Bytte kølle; se enkeltslag; sammenligne mot egne snitt; navigere til per-kølle-visningen i Analysere.
- **Varianter:** `/portal/mal/trackman/[id]` · `/portal/trackman/[sessionId]` (alt. adresse — skal ryddes til én).
- **Prioritet:** P2.

## Tester — `/portal/tren/tester`
- **Jobb:** Gjennomføre tildelte tester og følge egen progresjon mot benchmark.
- **Data inn:** Tildelte tester med frist og coach-kommentar (TestAssignment); test-detalj (protokoll, formel, pyramideområde, historikk, benchmark-nivå); testkatalog (30+ NGF/AK-tester); resultat med trend. FYS-referanseverdier er plassholder til Anders låser formelen.
- **Handlinger:** Starte test; føre scorekort under gjennomføring (også fullskjerm live); se oppsummering; bla i katalog; lage egen test.
- **Varianter:** `/portal/tren/tester` · `/[testId]` · `/[testId]/gjennomfor` · `/katalog` · `/ny(/egen)` · `/portal/(fullscreen)/test/[testId]/live` + `/summary`.
- **Prioritet:** P1.

## Baneguide — `/portal/baneguide`
- **Jobb:** Forberede seg på en bane — hull for hull, med egen spredning på sikt (dispersion-planen).
- **Data inn:** Bane-bibliotek; bane-detalj (hull, par, lengder); hull-detalj (layout, strategi); planlagt: dispersion-overlegg på banekart (Mapbox/OSM — data-blokkert i dag).
- **Handlinger:** Velge bane; bla hull for hull; (fremtid: legge egen spredning over hullet).
- **Varianter:** `/portal/baneguide` · `/[baneId]` · `/[baneId]/hull/[nr]` · `/portal/mal/baner(/[id])`.
- **Prioritet:** P3.

## Coach-hub og meldinger — `/portal/coach`
- **Jobb:** Spillerens kontakt med coachen — dialog, spørsmål og forespørsler ett sted.
- **Data inn:** Coach-hub (kommende coaching-økter, siste meldinger, delte dokumenter); meldingsinnboks med tråder (CaddieMessage); vedlegg per tråd; spørsmål-til-coach-liste med status (Åpent/Besvart); coach-profil.
- **Handlinger:** Sende ny melding (tekst, video, vedlegg); svare i tråd; stille spørsmål; se coach-profil; chatte med coach-AI.
- **Varianter:** `/portal/coach` · `/[coachId]` · `/melding` · `/melding/ny` · `/melding/[id](/vedlegg)` · `/sporsmal(/ny)(/[id])` · `/ai`.
- **Prioritet:** P2.

## Coach-delt innhold — `/portal/coach/plans`
- **Jobb:** Se det coachen har laget for deg — planer, øvelser, videoer og notater.
- **Data inn:** Coach-planer med perioder og økter (TrainingPlan/PlanSession); coach-øvelser (direktiver, drill-maler); video-feedback (SessionVideo/opptak); coach-notater delt med spiller.
- **Handlinger:** Åpne plan-detalj; foreslå ny økt i plan; se video; lese notat; opprette/redigere egen øvelse i coach-biblioteket.
- **Varianter:** `/portal/coach/plans` · `/[planId]` · `/[planId]/ny-okt` · `/perioder` · `/ovelser(/ny)(/[id]/rediger)` · `/videoer` · `/notes(/[noteId])`.
- **Prioritet:** P2.

## Booking — `/portal/booking`
- **Jobb:** Bestille coaching-time med riktig tjeneste, coach, anlegg og tid — betalt med kort eller klipp.
- **Data inn:** Kredittmåler («X klipp igjen» med saldo/brukt/gjenstår); tjenestetyper med pris; coach-profil og tilgjengelighet; anleggsinfo; bookingdetalj (tid, sted, status, betaling); mine bookinger med historikk.
- **Handlinger:** Velge tjeneste → coach → anlegg → tid (wizard); bekrefte og betale (Stripe eller abonnements-kreditt); endre tid (reschedule); avbestille (>24 t = kreditt tilbake); se kvittering.
- **Varianter:** `/portal/booking` · `/ny(/bekreft)` · `/[bookingId]` · `/coach/[coachId]` · `/anlegg/[anleggId]` · `/bekreftet` · `/portal/meg/bookinger(/reschedule/[bookingId])`.
- **Prioritet:** P2.

## Meg (profil) — `/portal/meg`
- **Jobb:** Spillerens identitet og eiendeler — hvem jeg er, hva jeg har i baggen, mine dokumenter.
- **Data inn:** Profil (navn, avatar, HCP, hjemmeklubb, nivå A–K, ambisjon, spilleår, skole); utstyrsbag (køller med spesifikasjoner og per-kølle-avstander — mater TrackMan-fanen); dokumenter (kontrakter, planer); foresatt-info (koblede foreldre + invitasjon).
- **Handlinger:** Redigere profil og avatar; administrere køller i baggen; åpne/laste ned dokument; invitere forelder.
- **Varianter:** `/portal/meg` · `/profil(/rediger)` · `/utstyrsbag` · `/dokumenter` · `/foreldre`.
- **Prioritet:** P1.

## Abonnement og betaling — `/portal/meg/abonnement`
- **Jobb:** Se og styre abonnementet: gratis eller 299 kr/mnd — ingen tier-nivåer, ELITE finnes ikke i UI.
- **Data inn:** Abonnementsstatus (gratis-grunnlag: prøvemåned / coaching-pakke / gruppe — eller 299 kr/mnd); betalingskort; fakturahistorikk med detalj; månedlige kreditter (klipp).
- **Handlinger:** Oppgradere (flyt med Stripe-checkout); avbestille; legge til nytt kort; åpne faktura.
- **Varianter:** `/portal/meg/abonnement` · `/oppgrader(/flyt)` · `/avbestill` · `/kort/ny` · `/faktura/[id]`.
- **Prioritet:** P2.

## Helse — `/portal/meg/helse`
- **Jobb:** Spore restitusjon og melde symptomer/skade så treningen kan tilpasses.
- **Data inn:** HealthEntry (hvilepuls, søvn, vekt); status (AKTIV/PERMISJON/SKADET) med periode og rehab-plan; symptomlogg.
- **Handlinger:** Registrere dagsverdier; melde nytt symptom; se trend.
- **Varianter:** `/portal/meg/helse` · `/symptom/ny`.
- **Prioritet:** P2.

## Innstillinger og sikkerhet — `/portal/meg/innstillinger`
- **Jobb:** Styre varsler, personvern, tilkoblinger og kontosikkerhet.
- **Data inn:** Varslingspreferanser (in-app/push/e-post); personvern + GDPR-eksport; språk; foretrukne anlegg (filtrerer drills); integrasjoner (Google Calendar); aktive innloggingsøkter; 2FA-status.
- **Handlinger:** Slå varsler av/på; eksportere data; koble/frakoble integrasjoner; bytte passord; aktivere 2FA; logge ut økter.
- **Varianter:** `/portal/meg/innstillinger` + undersider (`varsler`, `personvern`, `sikkerhet`, `sprak`, `anlegg`, `integrasjoner`, `eksport`, `okter`) · `/portal/meg/sikkerhet(/2fa)`.
- **Prioritet:** P2.

## Hjelp og feedback — `/portal/meg/help`
- **Jobb:** Finne svar selv eller nå support — og gi tilbakemelding på appen.
- **Data inn:** Hjelpesenter med kategorier og artikler; kontaktskjema; feedback-skjema.
- **Handlinger:** Søke/bla i artikler; sende henvendelse; sende feedback.
- **Varianter:** `/portal/meg/help` · `/artikkel/[slug]` · `/kategori/[slug]` · `/kontakt` · `/portal/meg/feedback`.
- **Prioritet:** P3.

## Talent (Elite Fase 2 — bevisst utsatt) — `/portal/talent`
- **Jobb:** Elite-spillerens utviklingsspor: nivå, roadmap og sammenligning mot kohort.
- **Data inn:** TalentTracking (radar 5 akser); nivåstige/percentiler; roadmap med milepæler; kohort-sammenligning; egen plan.
- **Handlinger:** Se nivå og progresjon; utforske roadmap; sammenligne seg.
- **Varianter:** `/portal/talent` · `/min-plan` · `/mitt-niva` · `/roadmap` · `/sammenligning` (+ visning av annen spiller `/portal/spiller/[spillerId]`).
- **Prioritet:** P3.

---

# Forelder (`/forelder`)

## Forelder-hjem og ukerapport — `/forelder`
- **Jobb:** Forelderen forstår på ett blikk hvordan det går med barnet — i klarspråk, aldri fagkoder. Lesevisning.
- **Data inn:** Samtykke-status; narrativ ukerapport (aktivitet + fremgang i ord); 8-ukers SG-trend; coach-notat til foreldre; varsler.
- **Handlinger:** Lese rapport; åpne varsler; navigere til barn-detalj. (Read-only — ingen redigering av barnets data.)
- **Varianter:** `/forelder` · `/forelder/ukerapport` · `/forelder/varsler`.
- **Prioritet:** P2.

## Barn (progresjon) — `/forelder/barn`
- **Jobb:** Følge hvert barns utvikling — trening, runder og nivå i foreldrevennlig språk.
- **Data inn:** Barneliste; per barn: HCP, siste runder, SG-status, treningsaktivitet (pyramidefordeling av økter), neste turnering, coach-tilknytning.
- **Handlinger:** Velge barn; se detalj; (lesevisning — klarspråk-laget gjelder: Situasjon/Læringstrinn i hverdagsord).
- **Varianter:** `/forelder/barn` · `/forelder/barn/[childId]`.
- **Prioritet:** P2.

## Forelder-økonomi — `/forelder/okonomi`
- **Jobb:** Full oversikt over hva coaching koster — bookinger, fakturaer og betalinger for barna.
- **Data inn:** KPI-tall (betalt, utestående); fakturaliste; bookinger (kommende og historiske) med pris og status; betalingsmetode.
- **Handlinger:** Åpne faktura; se bookingdetalj; (betaling håndteres via Stripe-flyt).
- **Varianter:** `/forelder/okonomi` · `/forelder/fakturaer` · `/forelder/bookinger`.
- **Prioritet:** P3.

## Samtykke, coach og innstillinger — `/forelder/samtykke`
- **Jobb:** Gi og administrere GDPR art. 8-samtykke for mindreårige, og styre egen konto.
- **Data inn:** Samtykke per barn (status, dato, hva det omfatter); coach-info og kontakt; kontoinnstillinger og varslingspreferanser; invitasjons-token-flyt (pending-rader claimes ved verifisert e-post).
- **Handlinger:** Gi/trekke samtykke; kontakte coach; endre innstillinger; akseptere forelder-invitasjon via token-lenke.
- **Varianter:** `/forelder/samtykke` · `/forelder/coach` · `/forelder/innstillinger` · `/inviter/forelder/[token]`.
- **Prioritet:** P2.

---

# Auth (`/auth`)

## Innlogging og registrering — `/auth/login`
- **Jobb:** Komme inn i plattformen — trygt og raskt, på riktig rolle (spiller/coach/forelder).
- **Data inn:** E-post/passord (Supabase Auth); BankID-verifisering; rolle-basert videresending (PLAYER → `/portal`, PARENT → `/forelder`, COACH/ADMIN → `/admin`); logget-ut-bekreftelse.
- **Handlinger:** Logge inn; registrere konto; verifisere med BankID; logge ut.
- **Varianter:** `/auth/login` · `/auth/signup` · `/auth/bankid` · `/auth/logget-ut`.
- **Prioritet:** P1.

## Passord og e-postverifisering — `/auth/forgot-password`
- **Jobb:** Få tilbake tilgangen når passordet er glemt eller e-post må bekreftes.
- **Data inn:** E-postadresse; tilbakestillings-token; «sjekk e-posten»-tilstand.
- **Handlinger:** Be om tilbakestillingslenke; sette nytt passord; åpne e-post-bekreftelse på nytt.
- **Varianter:** `/auth/forgot-password` · `/auth/reset-password` · `/auth/check-email`.
- **Prioritet:** P2.

## Onboarding spiller — `/auth/onboarding`
- **Jobb:** Ny spiller settes opp riktig: profil, nivåplassering og eventuelt kjøp — lanseringskritisk for selvbetjent 299 kr-salg.
- **Data inn:** 8-stegs wizard med state-machine (auto-resume fra siste steg); profildata (HCP, klubb, ambisjon); nivåplasserings-quiz (ett spørsmål per skjerm → setter dybde-prop nybegynner/øvet/elite); abonnementsvalg (`?subscribe`); Stripe-checkout-gjenopptak.
- **Handlinger:** Fylle steg for steg; svare quiz; velge gratis/betalt; fullføre kjøp; hoppe tilbake dit man slapp.
- **Varianter:** `/auth/onboarding` · `/auth/checkout-resume`.
- **Prioritet:** P1.

## Onboarding forelder og foreldresamtykke — `/auth/onboarding/forelder`
- **Jobb:** Forelder kobles til barnet og gir gyldig samtykke før den mindreårige kan bruke plattformen.
- **Data inn:** Forelder-onboarding (kontaktinfo, kobling til barn); samtykke-token fra invitasjon (guardian-consent); vente-tilstand for spilleren til samtykke foreligger (getCurrentUser-gate).
- **Handlinger:** Fullføre forelder-oppsett; gi samtykke via token-lenke; spilleren ser vente-skjerm med status.
- **Varianter:** `/auth/onboarding/forelder` · `/auth/guardian-consent/[token]` · `/auth/samtykke-venter`.
- **Prioritet:** P2.

---

## Inventar-notater for redesignet (avvik kode ↔ mål)

1. **Analysere:** koden har i dag 6 faner (SG/Fokus/Runder/Baggen/Putting/Nivå) + separate ruter for statistikk/sg-hub/trackman/tester. Redesignmålet er ÉN flate med 5 faner (SG · Statistikk · Trening · TrackMan · Tester) — Trening-fanen (pivot) finnes ikke som egen flate i dag (kun `/portal/trening/logg` for føring).
2. **TrackMan per kølle med spillervalgte parametere** er delvis: per-kølle-trend og stabilitet finnes, men brukervalg av parametersett (smash/ball/klubb/spinn/bære/topphøyde/landingsvinkel/side) må bygges.
3. **Dobbeltadresser som skal ryddes til én i redesignet:** `/portal/stats`→statistikk, `/portal/analyse`→analysere, `/portal/tren/ovelser`→drills, `/portal/kalender` vs `/portal/tren/kalender`, `/portal/mal/trackman/[id]` vs `/portal/trackman/[sessionId]`.
4. **Data-blokkert (ikke design-blokkert):** shot-map/dispersion, scorecard hull-for-hull per turneringsrunde, live turnerings-tracking.
5. **Talent-familien** er «Elite Fase 2» — bevisst utsatt, tas ikke i første redesignbølge.
