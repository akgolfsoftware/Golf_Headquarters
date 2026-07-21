# Funksjonskart — AgencyOS (trener)

> **Hva dette er:** Et kart over *alt trener-appen kan gjøre*, gruppert etter **trenerens oppgaver** —
> ikke etter dagens skjermer. Snudd andre veien fra inventaret: «funksjon → hvor den hører hjemme»,
> ikke «skjerm → hvilke funksjoner».
>
> **Hvorfor:** Grunnlag for å designe **færre, tettere skjermer** uten å miste en eneste funksjon.
> Skjerm-antallet (146 i dag) er en konsekvens av gruppering, ikke et tall vi skal bevare.
>
> **Kilde (kode-verifisert):** 146 admin-skjermer (`admin.json`) + **148 ekte server-handlinger**
> (eksporterte `actions.ts`-funksjoner under `src/app/admin`). «Potensial/mangler» = mine forslag,
> tydelig merket — ikke kode som finnes.
>
> Generert 2026-06-30. READ-ONLY: ingen kildekode endret.

---

## Sammendrag — 13 oppgave-områder

| # | Oppgave-område (trenerens jobb) | Skjermer i dag | Ekte handlinger | Kan samles til |
|---|---|--:|--:|--:|
| 1 | **Cockpit** — start dagen, se hva som haster | ~6 | (lese + trigge) | 1 flate |
| 2 | **Stall** — oversikt over alle spillere/grupper | ~9 | ~6 | 1 flate |
| 3 | **Spiller 360** — alt om én spiller | ~10 | ~12 | 1 flate m/faner |
| 4 | **Planlegge (Workbench)** — bygg trening | ~24 | ~55 | 1 hub m/zoom |
| 5 | **Gjennomføre** — kalender, booking, anlegg, live | ~22 | ~25 | 1 hub m/faner |
| 6 | **Innsikt** — analyse, SG, tester, runder | ~14 | ~10 | 1 hub m/faner |
| 7 | **Kommunikasjon** — meldinger, godkjenninger | ~10 | ~16 | 1 innboks |
| 8 | **Turneringer** — påmelding, resultater | ~4 | ~10 | 1 flate m/detalj |
| 9 | **Talent** — toppidrett/scouting | ~12 | ~5 | 1 hub m/faner |
| 10 | **Økonomi** — MRR, fakturaer, betaling | ~3 | (lese + tjeneste-pris) | 1 flate |
| 11 | **AI-senter** — Caddie, agenter, brief, opptak | ~9 | ~5 | 1 flate |
| 12 | **Arbeidsflyt** — oppgaver, prosjekter, Notion | ~7 | ~4 | 1 flate |
| 13 | **Admin & oppsett** — org, team, integrasjoner | ~16 | ~12 | 1 flate m/faner |

**~146 skjermer i dag → ~13 tette arbeidsflater** (pluss noen modaler/wizarder som lever *inni* dem).
Ingen funksjon forsvinner — de flyttes inn på riktig flate.

---

## 1. Cockpit — «start dagen, se hva som haster»

**Trenerens jobb:** Åpne appen og umiddelbart se: hva skjer i dag, hva haster, hvilke spillere trenger meg.

| Funksjon | Handling i dag | Hvor i dag | Datakomponent |
|---|---|---|---|
| Daglig AI-morgenbrief | `loadDailyBrief` (lese) | `/admin/agencyos`, `/admin/brief` | AI-sammendrag + KPI-strip |
| Dagens/ukas økter | lese bookinger per dag | `/admin/agencyos/uka` | 7-dagers kanban |
| Live-ops (pågående nå) | lese (Mission Control) | `/admin/agencyos/live` | live-dashboard |
| Varsler samlet (forslag/signaler/uleste) | `markerVarselLest` | `/admin/varsler` | varsel-liste |
| Eksporter brief-rapport | `exportBriefReport` | `/admin/brief` | CSV/PDF |
| Send brief til spiller | `sendBriefTilSpiller` | brief | knapp → spiller |

**Potensial/mangler:** Cockpit, brief, uka, live og varsler er **fem skjermer for samme jobb**. Bør være
**én cockpit** med soner (i dag · haster · varsler · live). Live er i dag statisk seed-skall — trenger ekte data.

---

## 2. Stall — «oversikt over alle spillere og grupper»

**Trenerens jobb:** Se hele stallen, hvem henger etter, og bore inn i én spiller eller gruppe.

| Funksjon | Handling i dag | Hvor i dag | Datakomponent |
|---|---|---|---|
| Spiller-roster (HCP, SG-trend, pakke, betaling, status) | lese | `/admin/spillere`, `/admin/stall`, `/admin/agencyos/spillere` | data-tett tabell + 360-panel |
| Tavle-visning | lese | `/admin/board` (→ spillere?view=tavle) | kanban |
| Risiko-stallkart (hvem trenger oppfølging) | lese | `/admin/risiko` | heatmap (8-kol) |
| Engasjement/rekkevidde per spiller | lese | `/admin/reach` | aggregat-liste |
| Oppfølgingskø | `oppdaterPrioritet` | `/admin/queue`, `/admin/oppfolging` | kanban |
| Grupper (nivå, medlemstall, HCP-snitt) | `leggTilGruppemedlem`, `fjernGruppemedlem` | `/admin/grupper`, `/admin/grupper/[id]` | gruppe-grid |
| Gruppe-timeplan | lese (GroupSchedule) | `/admin/grupper/[id]/timeplan` | ukentlig liste |

**Potensial/mangler:** Tre ulike spillertabeller (`spillere`, `stall`, `agencyos/spillere`) gjør **samme jobb**
med liten variasjon. Risiko + reach + queue er **filtre/visninger av samme roster**, ikke egne skjermer.
Bør være **én stall-flate** med roster + 360-panel + visnings-bytte (tabell/risiko/kø/grupper).

---

## 3. Spiller 360 — «alt om én spiller»

**Trenerens jobb:** Stå i én spiller og se/endre alt: profil, fremgang, tester, plan, meldinger.

| Funksjon | Handling i dag | Hvor i dag | Datakomponent |
|---|---|---|---|
| 360-profil (hero, pyramide, runder, tester, mål) | lese | `/admin/spillere/[id]` | hero + seksjons-stack |
| Full profil + DNA-radar + skadehistorikk | `lagreSpillerDNA`, `lagreSpillerFasiliteter` | `/admin/spillere/[id]/profil` | radar + paneler |
| Rediger spiller | `lagreSpiller`, `endreSpillerStatus`, `slettSpiller` | `/admin/spillere/[id]/rediger` | form + sticky save |
| Onboarde ny spiller | `createSpiller` | `/admin/spillere/ny` | wizard |
| Fremgang (SG-sparkline, volum-korrelasjon) | `getFysProgression`, `getTrendData` | `/admin/spillere/[id]/fremgang` | sparkline + bars |
| Tester (per spiller) | `tildelTest` | `/admin/spillere/[id]/tester`, `/tildel-test` | test-tabell + modal |
| Plan-indeks + plan-detalj (5 faner) | (se område 4) | `/admin/spillere/[id]/plan(/[planId])` | tabs |
| Coach-notat / direktiv | `lagreCoachNotat`, `lagreCoachDirektiv`, `slettCoachDirektiv` | spiller-flater | notat-felt |
| Logg milepæl | `loggMilepael` | talent/profil | timeline |
| Inviter forelder | `inviterForelderForSpiller` | profil | knapp |
| Legg i talent-sporing | `leggTilITalent` | spiller/talent | knapp |

**Potensial/mangler:** ~10 underruter for én spiller. Profil/fremgang/tester/plan er **faner i samme 360-view**,
ikke separate sider. Workbench (område 4) bør være en fane/zoom her, ikke en egen adresse.

---

## 4. Planlegge (Workbench) — «bygg trening»

**Trenerens jobb:** Lage og styre treningen — fra årsplan ned til enkeltøkt, via maler, driller og standardøkter.
**(Låst beslutning: all planlegging bor i Workbench — ett trykkpunkt.)**

| Funksjon | Ekte handlinger | Hvor i dag | Datakomponent |
|---|---|---|---|
| Treningsplaner (faser: utkast/aktiv/fullført) | `createPlan`, `opprettPlan`, `savePlanDraft`, `publishPlan`, `endPlan`, `pausePlan`, `resumePlan`, `arkiverPlan`, `slettPlan`, `dupliserPlan`, `kopierPlan`, `togglePlanActive`, `markPlanCompleted`, `markerSomNyttUtkast`, `markerSomPlanlagt` | `/admin/plans`, `/admin/plans/[planId]`, `/admin/plans/new` | kanban + 5-fane detalj |
| Tildel plan til flere spillere | `assignPlanToPlayers` | plan-detalj | multi-select |
| AI-generert plan | `opprettPlanFraAiForslag`, `opprettPlanFraByggere`, `godtaPlanAction`, `avvisPlanAction`, `godkjennPlan` | Workbench | AI-panel |
| Plan-maler (CRUD + effekt) | `createTemplate`, `saveTemplate`, `updateTemplate`, `deleteTemplate`, `archiveTemplate`, `unarchiveTemplate`, `duplicateTemplate`, `addTemplateSession`, `updateTemplateSession`, `deleteTemplateSession`, `rateEffectiveness`, `lagreSomMal`, `hentMalForhandsutfylling` | `/admin/plan-templates/*` | mal-grid + editor |
| Drill-bibliotek (CRUD + bruk) | `createDrill`, `updateDrill`, `deleteDrill`, `duplicateDrill`, `opprettExerciseDefinition`, `getDrillUsage` | `/admin/drills/*` | tile-grid + editor |
| AI drill-forslag | `godkjennDrillForslag`, `avvisDrillForslag` | `/admin/drills/forslag` | forslags-kø |
| Økter (denne uka, flytt, opprett) | `leggTilOkt`, `oppdaterOkt`, `slettOkt`, `flyttOkt`, `moveSession`, `createSessionFromCalendar`, `opprettOktPaaTid` | `/admin/okter`, Workbench | uke time-grid |
| Standardøkter / palette | (palette-drag i Workbench) | Workbench | palette-sidebar |
| Teknisk plan (L-fase-periodisert) | lese + mål-redigering | `/admin/teknisk-plan(/[spillerId])` | periode-tidslinje |
| Periodisering (årsplan→år→måned→uke→dag) | zoom i Workbench | Workbench | Gantt + zoom-rail |

**Potensial/mangler:** Dette er det **største området** — ~24 skjermer + 55 handlinger. Workbench er allerede
hub-en, men `plans`, `plan-templates`, `drills`, `okter`, `teknisk-plan` lever fortsatt som **egne adresser
ved siden av**. Bør være **faner/zoom-nivåer inne i Workbench**: Plan · Maler · Driller · Standardøkter ·
Teknisk · Gantt · Uke · Økt. Dubletter: `plans/templates/*` redirecter allerede til `plan-templates/*`.

---

## 5. Gjennomføre — «kalender, booking, anlegg, live-økt»

**Trenerens jobb:** Drifte dagene — hvem kommer når, hvor, og følge økter som skjer nå.

| Funksjon | Ekte handlinger | Hvor i dag | Datakomponent |
|---|---|---|---|
| Coach-kalender (uke/måned/dag) | lese | `/admin/kalender(/maned)` | split kalender |
| Bookinger + kapasitet | `bekreftBooking`, `avvisBooking`, `kansellerBooking` | `/admin/bookinger`, `/admin/bookinger/ny` | KPI + heatmap + liste |
| Fasilitet-booking | `createFacilityBooking`, `cancelFacilityBooking`, `moveFacilityBooking`, `getFacilityStats`, `getCelleSessions` | `/admin/anlegg(/[id])` | kart + kalender |
| Tilgjengelighet (åpne for booking) | `addSlot`, `updateSlot`, `deleteSlot` | `/admin/availability` | måned-kalender |
| Tjenester (bookbare, pris/varighet) | `createService`, `updateService`, `deleteService` | `/admin/services` | tabell |
| Live-økt (brief→aktiv→summary) | `startOkt`, `cancelSession`, `sendLiveMelding`, `sendBriefTilSpiller`, `lagreCoachVurdering`, `sendOktFeedback`, `gisFeedback` | `/admin/live/[id]/*`, `/admin/gjennomfore/okter/[id]` | hybrid terminal |
| TrackMan-sesjoner (stall) | lese | `/admin/trackman` | data-tett tabell |
| Opptak + transkripsjon | lese (Deepgram-pipeline) | `/admin/recording` | opptak-liste |
| Google Calendar 2-veis-synk | `disconnectGoogleCalendar`, `refreshCalendarList`, `oppdaterSubscriptions`, `setAsDefault` | `/admin/settings/calendar` | synk-oppsett |

**Potensial/mangler:** ~22 skjermer for «driften». Kalender + bookinger + kapasitet + anlegg + availability
er **samme tidsakse sett på ulike måter**. Bør være **én drift-hub** med faner (Kalender · Bookinger ·
Anlegg · Tjenester) + live-økt som fullskjerm-modus. `kapasitet` og `calendar/*` er allerede redirects.

---

## 6. Innsikt — «analyse, SG, tester, runder»

**Trenerens jobb:** Forstå hvordan stallen presterer og utvikler seg.

| Funksjon | Ekte handlinger | Hvor i dag | Datakomponent |
|---|---|---|---|
| Stall-analyse (pyramide-fordeling per gruppe) | `getAnalysisOverview`, `getKrysstabulering` | `/admin/analyse`, `/admin/lag-snitt` | KPI + pyramide |
| Plan vs. faktisk (compliance) | `getPlanVsActual` | `/admin/analysere/compliance` | plan-vs-reps |
| SG-kobling (hvor slag vinnes/tapes) | `getSGCoupling` | innsikt | SG-graf |
| Trender over tid | `getTrendData`, `getFysProgression` | fremgang/analyse | linjegraf |
| Runder (stall) | lese | `/admin/runder` | tabell + SG-sparkline |
| Tester-oversikt + detalj + trend | `tildelTest` | `/admin/tester(/[id])` | KPI + trend-graf |
| Foreslåtte tester (spiller→coach) | `godkjennForslag`, `avvisForslag` | `/admin/tester/foreslatte` | forslags-kø |
| Benchmarks (DataGolf-fasit, nivåstiger) | `approveBenchmarkPending`, `rejectBenchmarkPending`, `runBenchmarkSyncNow` | `/admin/tester/benchmarks` | nivåstige + synk |
| Rapporter (CSV-eksport) | `exportAnalyticsReport`, `exportTournamentsReport` | `/admin/reports` | tile-grid |

**Potensial/mangler:** ~14 skjermer. **Låst beslutning sier analyse skal være én flate med faner** —
men `analyse`, `lag-snitt`, `compliance`, `runder`, `tester`, `reports` er fortsatt separate. Bør være
**én innsikt-hub** med faner (Stall · SG · Tester · Runder · Compliance · Rapporter). **FYS-formel ikke låst**
— resultat-chips er nøytrale til Anders gir grønt lys.

---

## 7. Kommunikasjon — «meldinger, godkjenninger, forespørsler»

**Trenerens jobb:** Svare spillere, godkjenne forespørsler, holde innboksen ren.

| Funksjon | Ekte handlinger | Hvor i dag | Datakomponent |
|---|---|---|---|
| Innboks (les/svar, AI-utkast) | `sendMelding`, `sendTilSpiller`, `markInboxItemsRead`, `markInboxItemDone` | `/admin/innboks` | master-detalj |
| Forespørsler (booking-ønsker) | `approveRequestDetailed`, `declineRequestDetailed`, `requestMoreInfo`, `avslaaForesp` | `/admin/foresporsler` | rad-liste |
| Godkjenninger (AI-plan-endringer) | `godtaPlanAction`, `avvisPlanAction`, `batchApproveLowRisk`, `setApprovalStatus`, `avvisProaktivtForslag` | `/admin/godkjenninger(/[id])` | godkjenn-kø |
| Varsler-senter | `markerVarselLest` | `/admin/varsler` | (delt med Cockpit) |
| E-postmaler (CRUD + test) | `sendTestEmail` + mal-CRUD | `/admin/email-templates(/[id]/rediger)` | 2-pane editor |
| Kommunikasjon-hub (faner) | lese | `/admin/kommunikasjon` | fane-lenker |

**Potensial/mangler:** Innboks + forespørsler + godkjenninger + varsler er **fire køer for samme jobb**
(«ting som venter på meg»). Bør være **én innboks** med typefiltre (Melding · Forespørsel · Godkjenning · Varsel).
Fasit-beslutning utestår på om meldinger/råd unionnes inn (IA).

---

## 8. Turneringer — «påmelding og resultater»

| Funksjon | Ekte handlinger | Hvor i dag | Datakomponent |
|---|---|---|---|
| Turneringsliste (status-chip) | lese | `/admin/tournaments` | tabell/kortliste |
| Opprett turnering (wizard) | `createTournament`, `updateTournament`, `deleteTournament` | `/admin/tournaments/ny`, `/[id]` | 5-stegs wizard |
| Meld på / fjern spillere | `meldPaSpillere`, `fjernPamelding` | turnering-detalj | multi-select |
| Resultater | `addResult`, `deleteResult` | turnering-detalj | resultat-tabell |
| Fellesmelding til påmeldte | `sendTournamentFellesmelding` | turnering-detalj | knapp |
| Dublett-håndtering (manuell vs synk) | `mergeTurneringer`, `unmergeTurnering` | `/admin/tournaments/dubletter` | merge-liste |

**Potensial/mangler:** Allerede ganske tett (4 skjermer). Dubletter kan bli en modal inne i lista.

---

## 9. Talent — «toppidrett, scouting, WAGR»

**Trenerens jobb:** Følge talentene mot toppen — radar, kohort, region, sammenligning, eksterne referanser.

| Funksjon | Ekte handlinger | Hvor i dag | Datakomponent |
|---|---|---|---|
| Talent-radar + 360-profil (K4) | `oppdaterRadar` | `/admin/talent`, `/talent/[playerId]`, `/talent/radar(/[playerId])` | pentagon-radar |
| Scout-feed (ikke-sporet) (K2) | `leggTilITalent` | `/admin/talent/discovery` | søk + form |
| Kohort-analyse (U10–Senior) (K3) | lese | `/admin/talent/kohort` | snitt-radar |
| Regional pipeline (K3) | lese | `/admin/talent/region` | Norge-pin-kart |
| Sammenligning (inntil 4) | lese | `/admin/talent/sammenligning` | H2H-radar |
| WAGR-referanser + import | `importerWagrSpiller`, `slettWagrSnapshot` | `/admin/talent/wagr-benchmark`, `/wagr-import` | referanse-liste |
| Ressurs-bibliotek (K4) | `leggTilRessurs` | `/admin/talent/ressurser` | filter-grid |
| Logg milepæl | `loggMilepael`, `oppdaterPrioritet` | talent-profil | timeline |

**Potensial/mangler:** ~12 skjermer for talent. Radar/kohort/region/sammenligning er **visninger av samme
TalentTracking-data**. Bør være **én talent-hub** med faner (Radar · Kohort · Region · Sammenlign · WAGR · Ressurser).

---

## 10. Økonomi — «MRR, fakturaer, betaling»

| Funksjon | Handling i dag | Hvor i dag | Datakomponent |
|---|---|---|---|
| Business-kontrolltårn (MRR/innbetalt/utestående) | lese (Payment) | `/admin/agencyos/okonomi`, `/admin/okonomi` | KPI + inntektsgraf |
| Fakturaer/betalinger | lese | okonomi | tabell |
| Tjeneste-priser | `createService`/`updateService` | services | (delt med drift) |

**Potensial/mangler:** To økonomi-skjermer (`agencyos/okonomi` + `okonomi`) gjør samme jobb — slå sammen til én.
**Mangler:** ekte Stripe-kobling for betalingsstatus, fakturautsending. Mest lese i dag.

---

## 11. AI-senter — «Caddie, agenter, brief, opptak»

| Funksjon | Ekte handlinger | Hvor i dag | Datakomponent |
|---|---|---|---|
| AI-Caddie (personlig chat) | lese/chat | `/admin/agencyos/caddie` | chat |
| Caddie proaktiv + co-agent (utkast/fleet/audit) | `kjorCaddieProaktiv` | `/admin/agencyos/caddie/dashbord` | forslags-panel |
| Caddie-aktivitet (tidslinje + AI-feil) | lese | `/admin/agencyos/caddie/aktivitet` | tidslinje |
| Agent-pipeline (kjøringer, feedback) | `triggerAgentManually` | `/admin/agents(/[agentId])` | tabell + trigger |
| Fler-modell AI-chat | chat | `/admin/agenter` | chat |
| Agent-team (sekvensielt) | run | `/admin/agent-team` | team-runner |
| Morgenbrief (AI) | `sendBriefTilSpiller`, `exportBriefReport` | `/admin/brief` | (delt med Cockpit) |
| Opptak + transkripsjon | Deepgram-pipeline | `/admin/recording` | (delt med drift) |

**Potensial/mangler:** ~9 skjermer for AI. Caddie (3 ruter) + agenter + agent-team gjør beslektede ting.
Bør være **ett AI-senter** med faner (Caddie · Agenter · Team · Aktivitet). Mye av dette er ADMIN-only (Anders).

---

## 12. Arbeidsflyt — «oppgaver, prosjekter, Notion»

| Funksjon | Ekte handlinger | Hvor i dag | Datakomponent |
|---|---|---|---|
| Min uke (i dag/uke/senere) | lese | `/admin/workspace` | 3-kol |
| Oppgaver (liste/kanban/kalender) | `setNotes`, `markInboxItemDone` | `/admin/workspace/oppgaver(/[id])`, `/admin/handlingssenter` | view-toggle |
| Prosjekter | lese | `/admin/workspace/prosjekter`, `/admin/prosjekter` | grid |
| Tildelt meg (samlet) | lese | `/admin/workspace/tildelt-meg` | aggregat |
| Notion-tilkobling + synk | lese/synk | `/admin/workspace/notion` | synk-oppsett |

**Potensial/mangler:** ~7 skjermer. `handlingssenter` + `workspace/oppgaver` er samme oppgave-data;
`prosjekter` finnes i to varianter. Bør være **én arbeidsflate** (Min uke · Oppgaver · Prosjekter · Notion).

---

## 13. Admin & oppsett — «organisasjon, team, integrasjoner, sikkerhet»

| Funksjon | Ekte handlinger | Hvor i dag | Datakomponent |
|---|---|---|---|
| Org-hub + klubb-innstillinger (multi-club) | `addClub`, `removeClub`, `lagreClubSettings`, `updateClubSettings` | `/admin/organisasjon`, `/admin/klubb/innstillinger`, `/admin/settings` | hub + kort |
| Team (coacher/admin) + inviter | `inviterCoach`, `oppdaterCoachProfil` | `/admin/team(/inviter)`, `/admin/profile` | card-grid |
| Tilgang (CBAC-matrise, read-only) | lese (`can()`) | `/admin/settings/tilgang` | matrise |
| Integrasjoner (status: GCal/Stripe/Notion/Anthropic/Resend/Supabase) | `sjekkDbHelse`, `sendTestEmail` | `/admin/integrasjoner` | statuskort |
| API-nøkler | `createApiKey`, `revokeApiKey` | `/admin/settings/api` | nøkkel-liste |
| Sikkerhet (2FA) | (Setup2FA) | `/admin/settings/security` | 2FA-oppsett |
| Audit-log (hendelser + diff + rull tilbake) | lese | `/admin/audit-log(/[id])` | hendelse-liste |
| Design-godkjenning (PlayerHQ mot handoff) | `setButtonTarget`, `setConfirmedRoute`, `setKoblingStatus` | `/admin/godkjenn-portal/*` | iframe-diff |
| Stats-moderering + admin-stats | lese | `/admin/stats/*` | kø + tellinger |
| Hjelpesenter + design-katalog (tilstander) | statisk | `/admin/hjelp`, `/admin/tilstander` | statisk |

**Potensial/mangler:** ~16 skjermer. `organisasjon` + `settings` + `klubb` + `team` overlapper tungt. Bør være
**én oppsett-flate** med faner (Organisasjon · Team · Integrasjoner · API · Sikkerhet · Logg). `godkjenn-portal`
og `tilstander` er interne dev-verktøy — kan skjules fra hoved-IA.

---

## «Blanke ark» — forslag til konsolidert skjerm-sett

Ikke låst — utgangspunkt for design. Hver hub er **én tett flate** (Bloomberg-tetthet) med faner/zoom internt:

| Ny flate | Erstatter (dagens ruter) |
|---|---|
| **1. Cockpit** | agencyos, brief, uka, live, varsler |
| **2. Stall** | spillere, stall, agencyos/spillere, board, risiko, reach, queue, grupper(+detalj/timeplan) |
| **3. Spiller 360** | spillere/[id] + profil/fremgang/tester/plan/rediger/tildel-test/ny |
| **4. Workbench** | plans(+detalj/new), plan-templates(+alle), drills(+alle), okter, teknisk-plan, planlegge |
| **5. Drift** | kalender(+maned), bookinger(+ny), anlegg(+[id]), availability, services, trackman, recording, live-økt |
| **6. Innsikt** | analyse, lag-snitt, compliance, runder, tester(+detalj/foreslatte/benchmarks), reports |
| **7. Innboks** | innboks, foresporsler, godkjenninger(+detalj), kommunikasjon, email-templates |
| **8. Turneringer** | tournaments(+ny/[id]/dubletter) |
| **9. Talent** | talent + alle talent/* |
| **10. Økonomi** | agencyos/okonomi, okonomi |
| **11. AI-senter** | caddie(+dashbord/aktivitet), agents(+[id]), agenter, agent-team |
| **12. Arbeidsflyt** | workspace(+oppgaver/prosjekter/notion/tildelt-meg), handlingssenter, prosjekter |
| **13. Oppsett** | organisasjon, settings(+alle), klubb, team(+inviter), profile, integrasjoner, audit-log, stats, godkjenn-portal, hjelp, tilstander |

**Resultat:** 13 hovedflater + ~10 modaler/wizarder som lever inni dem (ny spiller, ny booking, ny turnering,
tildel test, plan-bygger osv.) — mot 146 ruter i dag. **Alle 148 handlinger beholdt**, bare flyttet til riktig flate.

---

## Neste steg (forslag)
1. Du sier ja/justerer på de 13 hubene over.
2. For den første huben tegner vi **datakomponent-skisse** (hvilke kort/tabeller/kalendere/knapper på flaten),
   basert på funksjonene i området + komponentbiblioteket (`komponenter.md`).
3. Gjenta per hub. Samme metode for PlayerHQ etterpå.
