# Funksjonskart — AgencyOS (/admin) + Marketing (akgolf.no)

Inventar over HVA hver skjermfamilie viser og gjør — grunnlag for komplett visuelt redesign. Ikke et designdokument.
AgencyOS er coachens kontrolltårn («hvem trenger MEG i dag?») organisert i 13 huber; marketing er de offentlige
sidene på akgolf.no. Kilder: `docs/MASTER-SKJERMPLAN.md` (autoritativ), `src/app/admin/**`, `src/app/(marketing)/**`.
Alle planleggingsflater munner ut i **Workbench** — én implementasjon med rolle spiller|coach; «Planlegge» er ett
trykkpunkt dit, ikke en meny. Flere funksjoner har i dag dobbeltadresser (finance/okonomi, kalender/calendar,
innboks/messages, godkjenninger/approvals, plan-templates/plans-templates) — redesignet skal lande på ÉN adresse per familie.
Marketing beholder kanon-coach **Markus Røinås Pedersen**; demo-navn ellers er Øyvind Rohjan (spiller) og
Anders Kristiansen (coach). Stats-universet under `/stats` er stort, offentlig og datadrevet (SEO-motor) og
behandles som egen familie med under-familier. Prioritet: P1 = de 13 hubene + marketing forside/priser/booking,
P2 = sekundærflater med reell bruk, P3 = aliaser, interne verktøy og parkerte spor.

---

# Del 1 — AgencyOS (`/admin`)

## Cockpit (coachens hjem) — `/admin/agencyos`
- **Jobb:** Gi coachen ett blikk på dagen: hvem trenger oppmerksomhet, hva skjer i dag, og «ett klikk»-handlinger.
- **Data inn:** Daglig brief (loadDailyBrief/Prisma): dagens økter og bookinger, spillere med avvik/signaler, ventende godkjenninger, ulest innboks, kapasitetsring for uka, fokus-spiller.
- **Handlinger:** Hoppe til spiller/økt/innboks/godkjenning, starte dagens økt, pinne fokus-spiller, navigere til alle huber.
- **Varianter:** `/admin/agencyos/uka` (kanban over uka), `/admin/agencyos/spillere` (snarvei), `/admin` (gml. rot), `/admin/brief` (daglig AI-brief), `/admin/board` (coaching-board), `/admin/handlingssenter` (samlet handlingsliste i dag/i morgen), `/admin/queue` (oppgave-kø), `/admin/oppfolging`.
- **Prioritet:** P1.

## Caddie (coachens AI-medhjelper) — `/admin/agencyos/caddie`
- **Jobb:** Chat- og utkastflate der AI foreslår handlinger/meldinger som coachen godkjenner.
- **Data inn:** Chat-historikk, AI-utkast til godkjenning, agent-fleet-status, audit-spor (CoAgent-data fra Prisma).
- **Handlinger:** Stille spørsmål, godkjenne/avvise AI-utkast, se aktivitetslogg.
- **Varianter:** `/admin/agencyos/caddie/aktivitet`, `/admin/agencyos/caddie/dashbord`, `/admin/caddie` (alt. adresse med CoAgent-panel), `/admin/ai`.
- **Prioritet:** P2.

## Innboks (meldinger) — `/admin/innboks`
- **Jobb:** Samle all innkommende kommunikasjon fra spillere/foresatte på ett sted for rask triage.
- **Data inn:** Meldingstråder (CaddieMessage), avsender, ulest-status, vedlegg, kobling til spiller.
- **Handlinger:** Lese, svare, markere håndtert, hoppe til spillerens profil/workbench, starte ny melding.
- **Varianter:** `/admin/messages` (redirect), `/admin/kommunikasjon` (hub), `/admin/reach` (oppsøkende).
- **Prioritet:** P1 (triage-huben).

## Triage: forespørsler og godkjenninger — `/admin/godkjenninger`
- **Jobb:** Behandle alt som venter på coachens ja/nei: økt-forespørsler, plan-publiseringer, andre godkjenninger.
- **Data inn:** Ventende godkjenninger med type/spiller/dato, økt-forespørsler fra spillere (SessionRequest), status.
- **Handlinger:** Godkjenne, avvise, åpne detalj, hoppe videre til plan/økt/spiller.
- **Varianter:** `/admin/godkjenninger/[id]`, `/admin/foresporsler`, `/admin/approvals(/[id])` (redirect-aliaser).
- **Prioritet:** P1 (del av triage-huben).

## Varsler — `/admin/varsler`
- **Jobb:** Kronologisk feed av systemvarsler til coachen (avvik, hendelser, agent-resultater).
- **Data inn:** Notification/Signal-rader per coach med type, alvorsgrad, tidsstempel, kobling.
- **Handlinger:** Lese, markere lest, navigere til kilden (spiller, økt, agent-run).
- **Varianter:** —
- **Prioritet:** P2.

## Spillere (stall-liste) — `/admin/spillere`
- **Jobb:** Roster over alle coachens spillere med tilstand på ett blikk — inngangen til alt spillerarbeid.
- **Data inn:** Spillerliste (User via serviceType, ikke role) med SpillerTilstandKort: navn, gruppe, siste aktivitet, form/compliance-signal, HCP/kategori.
- **Handlinger:** Søke/filtrere, åpne spiller-detalj, opprette ny spiller (`/admin/spillere/ny`).
- **Varianter:** `/admin/stall` (oversikt), `/admin/agencyos/spillere` (snarvei fra cockpit).
- **Prioritet:** P1.

## Spiller-detalj (faner) — `/admin/spillere/[id]`
- **Jobb:** Alt om ÉN spiller: analyse, profil, fremgang, tester og planer samlet i faner.
- **Data inn:** Spillerprofil, SG-data (Round/BrukerSgInput/SgInsight), TrackMan, fremgang trening-vs-SG, testresultater (TestAssignment), aktive planer (TrainingPlan), helsestatus.
- **Handlinger:** Bytte fane, tildele test (`/tildel-test`), redigere spiller (`/rediger` inkl. VG-trinn), åpne plan-detalj, gå til spillerens Workbench.
- **Varianter:** `/analyse` (coach-dybde, v13-kanon), `/profil`, `/fremgang`, `/tester`, `/plan/[planId]`.
- **Prioritet:** P1.

## Spiller-Workbench (coach-i-spiller) — `/admin/spillere/[id]/workbench`
- **Jobb:** Coachens planleggingsbord for én spiller — ALL planlegging (økter, uker, maler, drills) skjer her.
- **Data inn:** Ukevisning med TrainingPlanSession (kanon for AK-formelen), drill-palette rangert på skillArea/SG-gap, fokus-innløp (coach-fokus vinner), compliance-innløp, plan-maler.
- **Handlinger:** Dra-og-slippe økter, legge til/flytte/slette økt, navigere uker (`?uke=N`), bruke mal, sette fokus, publisere plan (DRAFT→PENDING_PLAYER).
- **Varianter:** Samme implementasjon som spillerens `/portal/planlegge/workbench` (rolle spiller|coach). `/admin/coach-workbench` er prototype (P3, ryddes).
- **Prioritet:** P1. **Merk:** Redesignet må behandle Workbench som ÉN komposisjon med to roller — ikke to skjermer.

## Grupper — `/admin/grupper`
- **Jobb:** Administrere treningsgrupper (WANG, GFGK-junior m.fl.): medlemmer, timeplan, trinn.
- **Data inn:** Group/GroupMember/GroupSchedule, VG-trinn-badges, ukentlig timeplan per gruppe.
- **Handlinger:** Åpne gruppe, filtrere roster på VG-trinn, redigere timeplan.
- **Varianter:** `/admin/grupper/[id]`, `/admin/grupper/[id]/timeplan`; offentlige søsken `/team-wang` og `/gfgk-junior` (åpne treningsplaner uten innlogging, 4 gruppefaner for GFGK).
- **Prioritet:** P2.

## Planlegge (plan-sentral) — `/admin/planlegge`
- **Jobb:** Ett trykkpunkt inn til planlegging — slår opp spiller og sender coachen til riktig Workbench.
- **Data inn:** Spillerliste for valg, aktive planer (TrainingPlan) med status.
- **Handlinger:** Velge spiller → Workbench; se alle planer (`/admin/plans`), opprette plan (`/admin/plans/new`), åpne plan-detalj.
- **Varianter:** `/admin/plans`, `/admin/plans/[planId]`, `/admin/plans/new`. **Merk:** per låst beslutning skal dette IKKE re-designes som meny av kort — det er en dør inn til Workbench.
- **Prioritet:** P1 (som inngang; tyngden ligger i Workbench).

## Plan-maler — `/admin/plan-templates`
- **Jobb:** Bibliotek av gjenbrukbare treningsplan-maler med målt effekt.
- **Data inn:** PlanTemplate-liste, effectivenessAvg (SG-delta fra PlanEffectiveness), mal-innhold per uke.
- **Handlinger:** Opprette/redigere mal, se effektivitet, bruke mal på spiller (via Workbench).
- **Varianter:** `/[id]`, `/ny`, `/[id]/rediger`, `/[id]/effectiveness`; `/admin/plans/templates/*` er redirect-aliaser (ryddes).
- **Prioritet:** P2.

## Drills (øvelsesbibliotek) — `/admin/drills`
- **Jobb:** Coachens bibliotek av øvelser/driller som mates inn i planer og økter.
- **Data inn:** ExerciseDefinition/DrillMal med kategori (P1–P10/skillArea), beskrivelse, video, AI-forslag til nye driller.
- **Handlinger:** Søke/filtrere, opprette (`/ny`), redigere (`/[id]/rediger`), vurdere AI-forslag (`/forslag`).
- **Varianter:** `/admin/drills/[id]`, `/admin/videoer` (videobibliotek), `/admin/recording` (opptak).
- **Prioritet:** P1.

## Teknisk plan (coach) — `/admin/teknisk-plan`
- **Jobb:** Følge opp spillernes tekniske utviklingsplaner (MORAD/P1–P10-arbeid).
- **Data inn:** TechnicalPlan per spiller: fokusområder, faser, fremdrift.
- **Handlinger:** Åpne per spiller, redigere fokus/faser.
- **Varianter:** `/admin/teknisk-plan/[spillerId]`.
- **Prioritet:** P2.

## Turneringer — `/admin/tournaments`
- **Jobb:** Administrere turneringskalenderen på tvers av stallen: hvem spiller hva, når.
- **Data inn:** Tournament-liste med dato/bane/deltakere, resultater, dublett-kandidater.
- **Handlinger:** Opprette (`/ny`), åpne detalj, rydde dubletter (`/dubletter`); (fellesmelding til deltakere er planlagt, mangler design).
- **Varianter:** `/admin/tournaments/[id]`.
- **Prioritet:** P1.

## Kalender og bookinger — `/admin/kalender`
- **Jobb:** Coachens tidsstyring: uke-/månedskalender med økter og bookinger, pluss booking-administrasjon.
- **Data inn:** Bookinger (Booking/CoachingSession), planlagte økter, tilgjengelighet (availability-vinduer), kapasitet, booking-KPI-er med heatmap.
- **Handlinger:** Bytte uke/måned, opprette booking (`/admin/bookinger/ny`), endre/avlyse booking, sette tilgjengelighet, se kapasitet.
- **Varianter:** `/admin/kalender/maned`, `/admin/bookinger`, `/admin/availability`, `/admin/kapasitet`; `/admin/calendar(/maned)` er redirect-aliaser.
- **Prioritet:** P1.

## Anlegg og tjenester — `/admin/anlegg`
- **Jobb:** Administrere fysiske fasiliteter og tjeneste-/priskatalogen bookingen selger.
- **Data inn:** Facility/lokasjoner med utstyr og åpningstider, ServiceType med priser/varighet/kredittregler.
- **Handlinger:** Opprette/redigere anlegg og tjenester, koble tjeneste til anlegg.
- **Varianter:** `/admin/anlegg/[id]`, `/admin/services`, `/admin/facilities(/[id])`, `/admin/locations` (aliaser ryddes).
- **Prioritet:** P2.

## Gjennomføre (daglig drift) — `/admin/gjennomfore`
- **Jobb:** Hub for dagens gjennomføring: dagens økter, hva som skjer nå, snarveier til live-verktøy.
- **Data inn:** Dagens TrainingSessionV2 med deltakere og status, TrackMan-økter på tvers (`/admin/trackman`).
- **Handlinger:** Åpne økt-detalj, starte live-økt, hoppe til kalender/booking.
- **Varianter:** `/admin/gjennomfore/okter/[id]`, `/admin/okter` (liste).
- **Prioritet:** P2 (live-huben under er P1).

## Live-økt (coach) — `/admin/live/[sessionId]`
- **Jobb:** Kjøre en økt i sanntid: brief før, logging under, oppsummering etter.
- **Data inn:** Øktens mål/fokus/drills (brief), drill-logger og reps i sanntid (aktiv), samlet resultat + KPI (summary); stemme-diktering av meldinger (MicButton).
- **Handlinger:** Starte økt (PLANNED→IN_PROGRESS), logge repetisjoner/score, sende melding, fullføre økt (completeSession).
- **Varianter:** `/brief`, `/active`, `/summary` — speiler spillerens live-løkke i `/portal/(fullscreen)/live/*`.
- **Prioritet:** P1.

## Tester — `/admin/tester`
- **Jobb:** Administrere ferdighetstester på tvers av stallen: tildele, følge resultater, sammenligne mot fasit.
- **Data inn:** Testkatalog (NGF + egne), TestAssignment-status per spiller, resultater siste 7/30 dager, benchmarks/fasiter (autosync), lag-snitt. FYS-resultatformel er plassholder (låst opp, avventer verdier).
- **Handlinger:** Tildele test (`/tildel(/[spillerId])`), åpne test-detalj, vurdere foreslåtte tester, se benchmarks og lag-snitt.
- **Varianter:** `/admin/tester/[id]`, `/benchmarks`, `/foreslatte`, `/admin/lag-snitt`.
- **Prioritet:** P1.

## Innsikt (analyse på tvers) — `/admin/analysere`
- **Jobb:** Se mønstre over HELE stallen: compliance, runder, SG-utvikling, risiko og helse.
- **Data inn:** Plan-etterlevelse per spiller (compliance-regel i lib/workbench/compliance.ts), Round-liste på tvers, SgInsight/Signal-aggregater, skade-/sykdomstilstander (HealthEntry), risikoscore (inaktivitet, avvik), rapporter.
- **Handlinger:** Drille ned til spiller, filtrere på gruppe/periode, generere/lese rapporter, moderere offentlige stats-bidrag.
- **Varianter:** `/admin/analysere/compliance`, `/admin/analyse` (stall-analyse), `/admin/analytics`, `/admin/runder`, `/admin/tilstander`, `/admin/risiko`, `/admin/reports`, `/admin/stats/overview`, `/admin/stats/moderering`.
- **Prioritet:** P2 (samles trolig til færre flater i redesign).

## Økonomi — `/admin/okonomi`
- **Jobb:** Følge forretningen: MRR, betalinger, abonnementer og booking-inntekter.
- **Data inn:** Betalinger (Payment), MRR/periodesammenligning, abonnementsstatus (gratis vs 299 kr/mnd — ingen tier-nivåer, ELITE finnes ikke), utestående.
- **Handlinger:** Se transaksjoner, filtrere på periode, følge opp betalinger.
- **Varianter:** `/admin/finance` (redirect), `/admin/agencyos/okonomi` (cockpit-snarvei).
- **Prioritet:** P1.

## Talent — `/admin/talent`
- **Jobb:** Elite-/talentsporet: identifisere, benchmarke og sammenligne spillere mot nasjonale/internasjonale referanser.
- **Data inn:** TalentTracking, radar-profiler per spiller, kohort- og regionsdata, WAGR-rankinger (import + benchmark), 4-panels sammenligning (side-om-side, pyramide, kohort, region).
- **Handlinger:** Sammenligne spillere, importere WAGR, utforske discovery/kohort/region, åpne talent-detalj.
- **Varianter:** `/[playerId]`, `/discovery`, `/radar(/[playerId])`, `/kohort`, `/region`, `/ressurser`, `/sammenligning`, `/wagr-benchmark`, `/wagr-import`.
- **Prioritet:** P1 som hub — men Elite Fase 2 er bevisst parkert; redesignes sist av hubene.

## AI-agenter — `/admin/agents`
- **Jobb:** Overvåke og styre plattformens autonome agenter (cron-kjøringer, resultater, feil).
- **Data inn:** AgentRun-historikk per agent, status/feil, siste resultater, agent-team-oversikt.
- **Handlinger:** Åpne agent-detalj, se kjøringslogg, (re)aktivere agenter.
- **Varianter:** `/admin/agents/[agentId]`, `/admin/agent-team`, `/admin/agenter` (alias ryddes).
- **Prioritet:** P1 (hub) — men intern/teknisk flate.

## Workspace (oppgaver og prosjekter) — `/admin/workspace`
- **Jobb:** Coachens egen jobbliste utenom spillerarbeid: oppgaver, prosjekter, Notion-synk.
- **Data inn:** OppgaveCache/ProsjektCache (getTasksForUser med Notion-fallback), tildelt-meg-filter, prosjektstatus.
- **Handlinger:** Se/åpne oppgave, filtrere tildelt meg, følge prosjekter, styre Notion-synk.
- **Varianter:** `/tildelt-meg`, `/oppgaver(/[id])`, `/prosjekter`, `/notion`; `/admin/prosjekter` (alias).
- **Prioritet:** P2.

## Organisasjon og innstillinger — `/admin/organisasjon`
- **Jobb:** Alt administrativt: team, tilgang, integrasjoner, e-postmaler, revisjonslogg, klubb- og systeminnstillinger.
- **Data inn:** Teammedlemmer/invitasjoner, ApiKey, AuditLog, EmailTemplate, integrasjonsstatus (GolfBox m.fl.), CBAC-capabilities (gating på capability, ikke rolleliste).
- **Handlinger:** Invitere teammedlem, styre tilgang/API-nøkler, redigere e-postmaler, lese audit-log, endre innstillinger (inkl. lys/mørk-tema-toggle i topbar, cookie `ak-admin-theme`).
- **Varianter:** `/admin/klubb/innstillinger`, `/admin/settings(/api|/calendar|/security|/tilgang)`, `/admin/team(/inviter)`, `/admin/integrasjoner`, `/admin/email-templates(/[id]/rediger)`, `/admin/audit-log(/[id])`, `/admin/profile`, `/admin/hjelp`.
- **Prioritet:** P1 som hub (org); undersidene P2–P3.

## Interne verktøy (ikke bruker-skjermer) — `/admin/godkjenn-portal`
- **Jobb:** Design-godkjenning og interne testflater brukt under utvikling.
- **Data inn:** Design-koblinger og review-status.
- **Handlinger:** Godkjenne/avvise design-koblinger.
- **Varianter:** `/koblinger(/[id])`, `/review`; `/admin/mer` (mobil-meny).
- **Prioritet:** P3 (vurderes ryddet før lansering, redesignes ikke).

---

# Del 2 — Marketing (akgolf.no, `src/app/(marketing)/`)

## Forside — `/`
- **Jobb:** Selge AK Golf Academy på 5 sekunder: hva vi gjør, bevis, og tydelig vei til booking/priser.
- **Data inn:** Verdiløfte, tjeneste-highlights, sosiale bevis (cases/tall), CTA-er til booking, priser og PlayerHQ.
- **Handlinger:** Navigere til booking/priser/coaching, starte prøveperiode, kontakte.
- **Varianter:** —
- **Prioritet:** P1.

## Priser — `/priser`
- **Jobb:** Vise hele pris-/pakkestrukturen ærlig: coaching-pakker (Performance/Performance Pro = antall økter, IKKE app-nivåer) og PlayerHQ (gratis-vilkår eller 299 kr/mnd).
- **Data inn:** Pakker med pris/innhold, gratis-kriterier (prøveperiode, coaching-pakke, gruppe via AK Golf), FAQ om betaling.
- **Handlinger:** Velge pakke → booking/registrering.
- **Varianter:** —
- **Prioritet:** P1.

## Booking (offentlig flyt) — `/booking`
- **Jobb:** La en besøkende booke en tjeneste uten innlogging: velg tjeneste → tid → bekreft → kvittering.
- **Data inn:** ServiceType-katalog med pris/varighet, ledige tider (availability), bekreftelses- og kvitteringsdata (Booking/Payment). Acuity er midlertidig motor til `BOOKING_ACTIVE=true`.
- **Handlinger:** Velge tjeneste, velge tidspunkt, fylle inn kontaktinfo, betale/bekrefte, motta kvittering.
- **Varianter:** `/booking/[slug]`, `/booking/[slug]/bekreft`, `/booking/kvittering/[bookingId]`.
- **Prioritet:** P1.

## Coaching og tilbud — `/coaching`
- **Jobb:** Forklare coaching-tilbudet i dybden: metode, målgrupper og opplegg.
- **Data inn:** Tjenestebeskrivelser, treningsfilosofi (MORAD-forankret), juniortilbud.
- **Handlinger:** Gå til booking/priser/kontakt.
- **Varianter:** `/junior`, `/treningsfilosofi`.
- **Prioritet:** P2.

## Coacher — `/coacher`
- **Jobb:** Presentere coachene med profil og kompetanse — bygge tillit før booking.
- **Data inn:** Coach-profiler (navn, bilde, bakgrunn, spesialfelt). **Kanon: ekte coach «Markus Røinås Pedersen» beholdes — byttes aldri ut med demo-navn.**
- **Handlinger:** Åpne coach-profil, booke hos coach.
- **Varianter:** `/coacher/[slug]`.
- **Prioritet:** P2.

## PlayerHQ (salgsside) — `/playerhq`
- **Jobb:** Selge spillerappen: hva PlayerHQ gjør for spilleren, og hvordan man får tilgang (gratis-vilkår / 299 kr).
- **Data inn:** Funksjonspresentasjon (plan, økter, SG-analyse, coach-kontakt), tilgangsmodell.
- **Handlinger:** Registrere seg / starte prøveperiode, gå til priser.
- **Varianter:** —
- **Prioritet:** P2.

## Bevis og innhold — `/cases`
- **Jobb:** Dokumentere resultater og bygge autoritet: kundecase, suksesshistorier og fagblogg.
- **Data inn:** Case-artikler, suksesshistorier med tall, blogginnlegg med forfatter/dato.
- **Handlinger:** Lese artikkel, navigere videre til booking/kontakt.
- **Varianter:** `/suksess`, `/blogg`, `/blogg/[slug]`.
- **Prioritet:** P2.

## Om, kontakt og praktisk — `/om-oss`
- **Jobb:** Fortelle hvem AK Golf Group er og gjøre det lett å ta kontakt eller søke jobb.
- **Data inn:** Selskapsinfo, kontaktskjema/-info, ledige stillinger, ofte stilte spørsmål.
- **Handlinger:** Sende kontaktskjema, søke jobb, finne svar i FAQ.
- **Varianter:** `/kontakt`, `/jobb`, `/faq`.
- **Prioritet:** P2 (kontakt), P3 (jobb/faq).

## Anlegg og turneringer (offentlig) — `/anlegg`
- **Jobb:** Vise fysiske treningsanlegg og åpne turneringer/arrangementer.
- **Data inn:** Anleggsbeskrivelser med fasiliteter, turneringsliste med dato/bane/påmelding.
- **Handlinger:** Se anlegg-detalj, se turnering-detalj, melde interesse.
- **Varianter:** `/anlegg/[slug]`, `/turneringer`, `/turneringer/[slug]`.
- **Prioritet:** P3.

## Stats-universet (offentlig statistikk) — `/stats`
- **Jobb:** Stort åpent statistikk-bibliotek (norsk golf + PGA) som trafikk-/SEO-motor og faglig utstillingsvindu.
- **Data inn:** Ekte data: norske spillere/årganger/klubber/baner/regioner, turneringsresultater, leaderboards, PGA-metrikker (SG-total, scoring, driving, putting m.m. via DataGolf), ukens tall, quiz/wrapped, brukerens egen progresjon.
- **Handlinger:** Søke, bla i spillere/klubber/turneringer, sammenligne spillere, kjøre SG-sammenligning (start→resultat), bruke kalkulatorer, ta quiz, dele wrapped.
- **Varianter (under-familier):** Spillere/årgang (`spillere(/[slug])`, `aargang(/[aar])`); Baner/klubber/regioner (`baner`, `klubber`, `regions` + `[slug]`); Turneringer (`turneringer(/[slug])(/statistikk)`, `tour/[slug]`); PGA (`pga/*` + `spillere/[dg_id]`); Leaderboards/norske; Verktøy (`verktoy/*`: avstand, score-til-hcp, sg-estimator, tour-ekvivalent, whs-kalkulator); Sammenlign (`sammenlign-spillere`, `sg-sammenlign/*`); Innhold (`blogg`, `sok`, `quiz`, `wrapped/[slug]`, `min-progresjon`, `uka`, `2026`).
- **Prioritet:** P2 (forside + spillere/PGA/verktøy), P3 (resten).

## Juridisk — `/personvern`
- **Jobb:** Oppfylle lovkrav: personvern, vilkår, cookies.
- **Data inn:** Juridiske tekster, cookie-kategorier med samtykkestatus.
- **Handlinger:** Lese, endre cookie-samtykke.
- **Varianter:** `/vilkar`, `/cookies`.
- **Prioritet:** P3.
