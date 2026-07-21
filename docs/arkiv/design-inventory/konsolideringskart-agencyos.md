# Konsolideringskart — AgencyOS (trener)

> **Hva dette er:** Et 1-til-1-kart fra **hver av dagens 146 admin-skjermer** til **hvilken av de 13 hubene**
> den havner i, og **hva den blir** der (egen hub-flate, fane, visnings-bytte, modal/wizard, sammenslått,
> eller redirect/drop). Dette er broa mellom dagens kode (`admin.json`) og mål-IA-en (`ia-fasit.md`).
>
> **Kilder:** `admin.json` (146 skjermer, fasit for at alle ruter er med), `ia-fasit.md` (13 huber + 5 regler),
> `funksjonskart-agencyos.md` («blanke ark»-tabellen er utgangspunkt for hub-tilordning).
>
> **READ-ONLY:** Ingen kildekode endret. Dette er et planleggings-/IA-dokument. Generert **2026-06-30**.

## «Blir til»-kodene (brukt konsekvent)

- **HUB-PRIMÆR** = selve hovedflaten for huben (det man lander på).
- **FANE** = blir en fane i huben.
- **VISNINGS-BYTTE** = blir en visning/filter på en delt flate (f.eks. risiko/kø/grupper på Stall).
- **MODAL/WIZARD** = blir en modal eller wizard som lever *inni* huben.
- **SLÅTT SAMMEN → {rute}** = smelter inn i en annen skjerm.
- **REDIRECT/DROP** = ren redirect-stub eller dev-/internverktøy som forsvinner fra hoved-IA (flytte-mål notert).

De 5 bindende reglene styrer tilordningen: Cockpit = se / Innboks = gjøre · Stall = én liste med briller ·
Workbench = bibliotek + plan-fra-spiller · rolle-filtrert IA · mobil = 5 + Mer. Dev-verktøy
(`godkjenn-portal`, `tilstander`, `stats/*`) ut av hoved-IA til egen `/admin/dev`.

---

## 1. Cockpit

Start dagen — se hva som skjer og hva som haster. Cockpit **viser og peker videre**; alt som krever handling bor i Innboks.

| Dagens rute | Jobb (kort) | Blir til | Begrunnelse |
|---|---|---|---|
| `/admin` | Redirect til `/admin/agencyos` | REDIRECT/DROP | Ren redirect-stub; landings-rute blir Cockpit-flaten. |
| `/admin/agencyos` | AgencyOS-cockpit (3-kol Bloomberg, daglig brief-data) | **HUB-PRIMÆR** | Selve cockpit-flaten — soner: i dag · haster · varsler · live. |
| `/admin/brief` | Daglig AI-morgenbrief (sammendrag + KPI + agentforslag) | FANE | Brief er en sone/fane i Cockpit (samme «start dagen»-jobb). Eksport/send-brief blir handlinger her. |
| `/admin/agencyos/uka` | 7-dagers ukekanban med bookinger per dag | FANE | «Uka»-visningen av cockpiten; samme se-jobb, annen tidshorisont. |
| `/admin/agencyos/live` | Mission Control — live-ops-dashboard (statisk skall) | FANE | Live-sonen i Cockpit. Krever ekte data; live-økt-kjøring bor i Drift. |
| `/admin/mer` | Mobil «Mer»-flate (lenkeliste = desktop-sidebar) | VISNINGS-BYTTE | Mobil-navigasjons-skall (regel 5: 5 + Mer). Ikke egen hub — del av cockpit-/shell-navet. |

---

## 2. Stall

Oversikt over alle spillere og grupper. **Én liste med briller** — roster/risiko/kø/grupper er visnings-bytter på samme spillerliste.

| Dagens rute | Jobb (kort) | Blir til | Begrunnelse |
|---|---|---|---|
| `/admin/spillere` | Alle spillere — stall-tabell (HCP, SG, økter, status) | **HUB-PRIMÆR** | Den kanoniske roster-flaten. De to andre spillertabellene smelter hit. |
| `/admin/stall` | Stall hybrid-terminal: roster + 360-panel | SLÅTT SAMMEN → `/admin/spillere` | Samme jobb som `spillere`; 360-panelet beholdes som detalj-rute (Spiller 360). |
| `/admin/agencyos/spillere` | Data-tett spillertabell (HCP/SG/pakke/betaling) | SLÅTT SAMMEN → `/admin/spillere` | Tredje variant av samme tabell — kolonnene (pakke/betaling) blir kolonne-valg på roster. |
| `/admin/board` | Redirect til `spillere?view=tavle` | VISNINGS-BYTTE | Tavle/kanban = visnings-bytte på roster (redirect finnes allerede). |
| `/admin/risiko` | Risiko-stallkart (heatmap + oppfølging) | VISNINGS-BYTTE | «Risiko-brillen» på roster (regel 2). |
| `/admin/reach` | Engasjement/rekkevidde per spiller | VISNINGS-BYTTE | «Engasjement-brillen» på roster. |
| `/admin/queue` | Oppfølgingskø (kanban over spillere som trenger samtale) | VISNINGS-BYTTE | «Kø-brillen» på roster. |
| `/admin/oppfolging` | Alias som re-eksporterer `queue` | REDIRECT/DROP | Ren alias av `queue` — forsvinner som egen adresse. |
| `/admin/grupper` | Grupper-oversikt (gruppe-grid) | VISNINGS-BYTTE | «Grupper-brillen» på Stall. |
| `/admin/grupper/[id]` | Gruppe-detalj (spillere, plan, statistikk) | FANE | Gruppe-detalj som flate inne i Stall (gruppe-context). |
| `/admin/grupper/[id]/timeplan` | Gruppe-timeplan (ukentlig GroupSchedule-liste) | FANE | Fane/underseksjon i gruppe-detalj. |

---

## 3. Spiller 360

Alt om én spiller — profil, fremgang, tester, plan, meldinger. Åpnes fra Stall.

| Dagens rute | Jobb (kort) | Blir til | Begrunnelse |
|---|---|---|---|
| `/admin/spillere/[id]` | Spillerprofil 360° (hero + seksjons-stack) | **HUB-PRIMÆR** | Selve 360-flaten for én spiller. |
| `/admin/spillere/[id]/profil` | Full profil + DNA-radar + skadehistorikk | FANE | «Profil»-fanen i 360. |
| `/admin/spillere/[id]/fremgang` | SG-sparkline + volum-korrelasjon | FANE | «Fremgang»-fanen i 360. |
| `/admin/spillere/[id]/tester` | Coach-view av spillerens tester | FANE | «Tester»-fanen i 360 (stall-bredt testbilde bor i Innsikt). |
| `/admin/spillere/[id]/tildel-test` | Tildel test (spiller + TestDefinition-liste) | MODAL/WIZARD | Tildel-test som modal i 360/tester-fanen (route-variant: `/admin/tester/tildel/[spillerId]` under Innsikt). |
| `/admin/spillere/[id]/plan` | Plan-indeks (coach-context) | FANE | «Plan»-inngang i 360 → åpner Workbench for spilleren (regel 3). |
| `/admin/spillere/[id]/plan/[planId]` | Spiller-plan detalj (5 tabs) | FANE | Plan-detalj i 360/Workbench-context. |
| `/admin/spillere/[id]/rediger` | Rediger spiller (form + sticky save) | MODAL/WIZARD | Rediger-form som modal/panel i 360. |
| `/admin/spillere/[id]/workbench` | Coach-Workbench for spilleren (planleggings-hub) | FANE | Workbench åpnet fra Spiller 360 (regel 3 — plan-fra-spiller). |
| `/admin/spillere/ny` | Spiller-onboarding wizard | MODAL/WIZARD | Ny spiller = wizard som starter fra Stall/360. |

---

## 4. Workbench

Bygg trening — bibliotek (maler/driller/standardøkter) + plan-fra-spiller. Faner/zoom: Plan · Maler · Driller · Standardøkter · Teknisk · Gantt · Uke · Økt.

| Dagens rute | Jobb (kort) | Blir til | Begrunnelse |
|---|---|---|---|
| `/admin/planlegge` | Redirect til spillerens workbench | **HUB-PRIMÆR** | Trykkpunktet «Planlegge» = inngang til Workbench-hub (regel 3). |
| `/admin/plans` | Treningsplaner kanban (Utkast/Aktiv/Fullført) | FANE | «Plan»-fanen i Workbench. |
| `/admin/plans/[planId]` | Plan-detalj (Oversikt/Øvelser/Notater/Rapport) | FANE | Plan-detalj i Workbench. |
| `/admin/plans/new` | Ny plan (legacy wizard) | MODAL/WIZARD | Plan-bygger-wizard inne i Workbench. |
| `/admin/plans/templates` | Redirect til `plan-templates` | REDIRECT/DROP | Legacy-redirect (allerede konsolidert). |
| `/admin/plans/templates/[id]/effectiveness` | Redirect til `plan-templates/[id]/effectiveness` | REDIRECT/DROP | Legacy-redirect. |
| `/admin/plans/templates/[id]/rediger` | Redirect til `plan-templates/[id]/rediger` | REDIRECT/DROP | Legacy-redirect. |
| `/admin/plans/templates/ny` | Redirect til `plan-templates/ny` | REDIRECT/DROP | Legacy-redirect. |
| `/admin/plan-templates` | Plan-maler grid (L-fase, «Brukt N×») | FANE | «Maler»-fanen i Workbench (stall-felles bibliotek). |
| `/admin/plan-templates/[id]` | Mal-detalj (økter + drill-navn) | FANE | Mal-detalj i Workbench. |
| `/admin/plan-templates/[id]/effectiveness` | Mal-effekt (PlanEffectiveness, SG-deltas) | FANE | Effekt-undervisning i mal-detalj. |
| `/admin/plan-templates/[id]/rediger` | Mal-redaktør | MODAL/WIZARD | Mal-editor inne i Workbench. |
| `/admin/plan-templates/ny` | Ny mal (NewTemplateForm) | MODAL/WIZARD | Ny-mal-wizard inne i Workbench. |
| `/admin/drills` | Drill-bibliotek (kategori-grid) | FANE | «Driller»-fanen i Workbench. |
| `/admin/drills/[id]` | Drill-detalj | FANE | Drill-detalj i Workbench. |
| `/admin/drills/[id]/rediger` | Drill-redaktør | MODAL/WIZARD | Drill-editor inne i Workbench. |
| `/admin/drills/ny` | Ny drill (DrillCreateForm) | MODAL/WIZARD | Ny-drill-wizard inne i Workbench. |
| `/admin/drills/forslag` | AI drill-forslag (PENDING CaddieDraft-kø) | FANE | Drill-forslags-kø i Workbench/Driller (godkjenn/avvis). |
| `/admin/okter` | Økter denne uka (TrainingPlanSession-instanser) | FANE | «Uke»-/«Økt»-zoom i Workbench. |
| `/admin/teknisk-plan` | Teknisk-plan oversikt (alle spillere) | FANE | «Teknisk»-fanen i Workbench. |
| `/admin/teknisk-plan/[spillerId]` | Teknisk plan for én spiller (L-fase) | FANE | Teknisk-plan i spiller-context (Workbench/360). |

---

## 5. Drift

Drifte dagene — kalender, booking, anlegg, tilgjengelighet, tjenester, live-økt. Faner: Kalender · Bookinger · Anlegg · Tjenester + live-modus.

| Dagens rute | Jobb (kort) | Blir til | Begrunnelse |
|---|---|---|---|
| `/admin/gjennomfore` | Gjennomføre-hub (kort for kalender/booking/anlegg/live) | **HUB-PRIMÆR** | Eksisterende drift-hub = Drift-landingen. |
| `/admin/kalender` | Coach-kalender (hybrid: ukegrid + dag) | FANE | «Kalender»-fanen i Drift. |
| `/admin/kalender/maned` | Måned-visning av alle bookinger | VISNINGS-BYTTE | Måned = zoom-bytte på kalender-fanen. |
| `/admin/kalender/uke` | Redirect til `kalender` | REDIRECT/DROP | Ren redirect-stub. |
| `/admin/calendar` | Redirect til `kalender` | REDIRECT/DROP | Engelsk-dublett redirect. |
| `/admin/calendar/maned` | Redirect til `kalender/maned` | REDIRECT/DROP | Engelsk-dublett redirect. |
| `/admin/bookinger` | Bookinger & kapasitet (KPI + heatmap + liste) | FANE | «Bookinger»-fanen i Drift (kapasitet inkludert). |
| `/admin/bookinger/ny` | Manuell booking-oppretting (5-stegs wizard) | MODAL/WIZARD | Ny-booking-wizard inne i Drift. |
| `/admin/kapasitet` | Redirect til `bookinger` | REDIRECT/DROP | Allerede sammenslått med bookinger. |
| `/admin/anlegg` | Anlegg-oversikt (fasilitet-tiles) | FANE | «Anlegg»-fanen i Drift. |
| `/admin/anlegg/[id]` | Anlegg-detalj (kart/kalender per fasilitet) | FANE | Anlegg-detalj i Drift. |
| `/admin/availability` | Tilgjengelighet (åpne-for-booking måned-kalender) | VISNINGS-BYTTE | Tilgjengelighet = lag/visning på kalender-/bookinger-flaten. |
| `/admin/services` | Tjenester-tabell (bookbare, pris/varighet) | FANE | «Tjenester»-fanen i Drift. (Pris deles med Økonomi.) |
| `/admin/trackman` | TrackMan-sesjoner (stall, data-tett tabell) | FANE | Driftsdata fra anlegg/økter — TrackMan-fane i Drift (analyse-bildet ligger i Innsikt). |
| `/admin/recording` | Sesjon-opptak (Deepgram-transkripsjon) | FANE | Opptak skjer under gjennomføring → Drift-fane (delt med AI-senter for transkripsjon). |
| `/admin/videoer` | Coaching-videoer (last opp/del med spillere) | FANE | Mediedeling knyttet til økt-gjennomføring → Drift-fane. |
| `/admin/gjennomfore/okter/[id]` | Økt-detalj (coach-context) | FANE | Økt-detalj-flate i Drift. |
| `/admin/live/[sessionId]/brief` | Live-økt: brief (fokuspunkt før start) | MODAL/WIZARD | Steg i live-økt-modus (fullskjerm) i Drift. |
| `/admin/live/[sessionId]/active` | Live-økt: aktiv (følg i sanntid) | MODAL/WIZARD | Aktiv-steg i live-økt-modus. |
| `/admin/live/[sessionId]/summary` | Live-økt: summary (vurder + lagre) | MODAL/WIZARD | Summary-steg i live-økt-modus. |

---

## 6. Innsikt

Forstå hvordan stallen presterer. Faner: Stall · SG · Tester · Runder · Compliance · Rapporter.

| Dagens rute | Jobb (kort) | Blir til | Begrunnelse |
|---|---|---|---|
| `/admin/analysere` | Innsikt-hub (kort: spillere/tester/godkjenninger/runder/finance) | **HUB-PRIMÆR** | Eksisterende innsikt-hub = Innsikt-landingen. |
| `/admin/analyse` | Stall-analyse (KPI + pyramide-fordeling + per gruppe) | FANE | «Stall»-fanen i Innsikt. |
| `/admin/lag-snitt` | Lag-snitt (gruppekort + pyramide-barer) | SLÅTT SAMMEN → `/admin/analyse` | Samme pyramide-data per gruppe — del av stall-analyse-fanen. |
| `/admin/analysere/compliance` | Plan vs. faktisk (compliance) | FANE | «Compliance»-fanen i Innsikt. |
| `/admin/runder` | Runder (stall, score/SG-tabell) | FANE | «Runder»-fanen i Innsikt. |
| `/admin/tester` | Tester-oversikt (KPI + siste gjennomføring) | FANE | «Tester»-fanen i Innsikt. |
| `/admin/tester/[id]` | Test-resultat-detalj + historikk | FANE | Test-detalj i Innsikt/tester-fanen. |
| `/admin/tester/foreslatte` | Spiller-foreslåtte tester (godkjenn/avvis) | VISNINGS-BYTTE | Forslags-kø-visning i tester-fanen. |
| `/admin/tester/benchmarks` | Fasiter/nivåstiger (DataGolf-autosync) | FANE | «Benchmarks»-undervisning i tester-fanen. |
| `/admin/tester/tildel/[spillerId]` | Route-basert tildel-test-modal | MODAL/WIZARD | Tildel-test-modal (samme som 360-varianten, route-trigget). |
| `/admin/reports` | Rapporter (CSV-eksport-tiles) | FANE | «Rapporter»-fanen i Innsikt. |

---

## 7. Innboks

Alt som venter på svar. **Én kø med typefiltre:** Melding · Forespørsel · Godkjenning · Varsel (regel 1).

| Dagens rute | Jobb (kort) | Blir til | Begrunnelse |
|---|---|---|---|
| `/admin/innboks` | Meldings-innboks (master-detalj) | **HUB-PRIMÆR** | Selve innboks-flaten; typefiltre legges på. |
| `/admin/messages` | Redirect til `innboks` | REDIRECT/DROP | Engelsk-dublett redirect. |
| `/admin/foresporsler` | Forespørsler (booking-ønsker rad-liste) | VISNINGS-BYTTE | «Forespørsel»-filter i Innboks. |
| `/admin/godkjenninger` | Godkjenninger (PENDING PlanAction-kø) | VISNINGS-BYTTE | «Godkjenning»-filter i Innboks. |
| `/admin/godkjenninger/[id]` | Godkjenning-detalj (rationale + diff) | FANE | Godkjenning-detalj i Innboks. |
| `/admin/approvals` | Redirect til `godkjenninger` | REDIRECT/DROP | Engelsk-dublett redirect. |
| `/admin/approvals/[id]` | Redirect til `godkjenninger/[id]` | REDIRECT/DROP | Engelsk-dublett redirect. |
| `/admin/varsler` | Coach-varsler-senter (forslag/signaler/uleste) | VISNINGS-BYTTE | «Varsel»-filter i Innboks (delt datakilde med Cockpit-varsel-sone). |
| `/admin/kommunikasjon` | Kommunikasjon-hub (faner: Innboks/E-postmaler/Notion) | REDIRECT/DROP | Ren fane-lenke-hub — erstattes av Innboks selv; e-postmaler blir egen fane. |
| `/admin/email-templates` | E-postmaler (CRUD, slug-gruppert) | FANE | «E-postmaler»-fanen i Innboks (utgående kommunikasjon). |
| `/admin/email-templates/[id]/rediger` | Rediger e-postmal (2-pane editor) | MODAL/WIZARD | Mal-editor inne i Innboks/e-postmaler. |

---

## 8. Turneringer

Påmelding og resultater. Allerede tett.

| Dagens rute | Jobb (kort) | Blir til | Begrunnelse |
|---|---|---|---|
| `/admin/tournaments` | Turneringsliste (status-chip) | **HUB-PRIMÆR** | Turnerings-landingen. |
| `/admin/tournaments/[id]` | Turnering-detalj (påmeldte, resultater, KPI) | FANE | Turnering-detalj-flate. |
| `/admin/tournaments/ny` | Ny turnering (5-stegs wizard) | MODAL/WIZARD | Opprett-wizard inne i Turneringer. |
| `/admin/tournaments/dubletter` | Dublett-håndtering (manuell vs synk merge) | MODAL/WIZARD | Dublett-merge som modal i turneringslista. |

---

## 9. Talent

Følge talentene mot toppen. Faner: Radar · Kohort · Region · Sammenlign · WAGR · Ressurser.

| Dagens rute | Jobb (kort) | Blir til | Begrunnelse |
|---|---|---|---|
| `/admin/talent` | Talent Coach (radar/percentile/pyramide) | **HUB-PRIMÆR** | Talent-landingen. |
| `/admin/talent/[playerId]` | Talent 360-profil (radar + KPI) | FANE | Talent-spiller-profil i Talent-context. |
| `/admin/talent/radar` | Talent-radar (TalentTracking + WAGR-trend) | FANE | «Radar»-fanen i Talent. |
| `/admin/talent/radar/[playerId]` | Radar-vurdering per spiller (pentagon, 1–10) | FANE | Radar-vurdering i spiller-context. |
| `/admin/talent/discovery` | Scout-feed (ikke-sporede PLAYER-brukere) | VISNINGS-BYTTE | «Scout/oppdag»-visning i Talent. |
| `/admin/talent/kohort` | Kohort-analyse (U10–Senior) | FANE | «Kohort»-fanen i Talent. |
| `/admin/talent/region` | Regional pipeline (Norge-pin-kart) | FANE | «Region»-fanen i Talent. |
| `/admin/talent/sammenligning` | Sammenligning (inntil 4 spillere H2H) | FANE | «Sammenlign»-fanen i Talent. |
| `/admin/talent/wagr-benchmark` | WAGR-referansespillere (kalibrering) | FANE | «WAGR»-fanen i Talent. |
| `/admin/talent/wagr-import` | WAGR-import (matchede snapshots) | MODAL/WIZARD | Import-modal/handling i WAGR-fanen. |
| `/admin/talent/ressurser` | Ressurs-bibliotek (filter-grid) | FANE | «Ressurser»-fanen i Talent. |

---

## 10. Økonomi

MRR, fakturaer, betaling. ADMIN/finans-rolle (CBAC `VIEW_FINANCE`).

| Dagens rute | Jobb (kort) | Blir til | Begrunnelse |
|---|---|---|---|
| `/admin/okonomi` | Økonomi (KPI-stripe + fakturaer/betalinger-tabell) | **HUB-PRIMÆR** | Økonomi-landingen (kanonisk norsk rute). |
| `/admin/agencyos/okonomi` | Business-kontrolltårn (MRR + inntektsgraf + faktura) | SLÅTT SAMMEN → `/admin/okonomi` | Samme jobb, rikere graf — innholdet smelter inn i den ene økonomi-flaten. |
| `/admin/finance` | Redirect til `okonomi` | REDIRECT/DROP | Engelsk-dublett redirect. |

---

## 11. AI-senter

Caddie, agenter, brief, opptak. Mest ADMIN. Faner: Caddie · Agenter · Team · Aktivitet.

| Dagens rute | Jobb (kort) | Blir til | Begrunnelse |
|---|---|---|---|
| `/admin/agencyos/caddie/dashbord` | Caddie proaktiv + co-agent (utkast/fleet/audit) | **HUB-PRIMÆR** | Det rikeste Caddie-bildet = AI-senter-landingen. |
| `/admin/agencyos/caddie` | AI-Caddie personlig chat | FANE | «Caddie»-chat-fanen i AI-senter. |
| `/admin/caddie` | Redirect til `agencyos/caddie/dashbord` | REDIRECT/DROP | Ren redirect-stub. |
| `/admin/agencyos/caddie/aktivitet` | Caddie-aktivitet (tidslinje + AI-feil) | FANE | «Aktivitet»-fanen i AI-senter. |
| `/admin/agents` | Agent-pipeline (kjøringer, stats, trigger) | FANE | «Agenter»-fanen i AI-senter. |
| `/admin/agents/[agentId]` | Agent-detalj (konfig, kjøring, forslag) | FANE | Agent-detalj i AI-senter. |
| `/admin/agenter` | Fler-modell AI-chat (Claude/Gemini/Grok/Ollama) | FANE | «Chat»-fane i AI-senter (merget kommandosenter-chat). |
| `/admin/agent-team` | Agent-team (sekvensielt, flere AI-er) | FANE | «Team»-fanen i AI-senter. |

---

## 12. Arbeidsflyt

Oppgaver, prosjekter, Notion. Mest ADMIN. Faner: Min uke · Oppgaver · Prosjekter · Notion.

| Dagens rute | Jobb (kort) | Blir til | Begrunnelse |
|---|---|---|---|
| `/admin/workspace` | «Min uke» (I dag/Denne uka/Senere) | **HUB-PRIMÆR** | Arbeidsflyt-landingen. |
| `/admin/workspace/oppgaver` | Oppgaver (Liste/Kanban/Kalender-toggle) | FANE | «Oppgaver»-fanen i Arbeidsflyt. |
| `/admin/workspace/oppgaver/[id]` | Task-detalj (sub-tasks, aktivitet, metadata) | FANE | Oppgave-detalj i Arbeidsflyt. |
| `/admin/handlingssenter` | Oppgaver fra OppgaveCache (kanban/tabell/liste) | SLÅTT SAMMEN → `/admin/workspace/oppgaver` | Samme oppgave-data som workspace/oppgaver — én oppgaveflate. |
| `/admin/workspace/prosjekter` | Prosjekt-grid (ProsjektCache, filter + stats) | FANE | «Prosjekter»-fanen i Arbeidsflyt. |
| `/admin/prosjekter` | Prosjekt-liste (merget kommandosenter) | SLÅTT SAMMEN → `/admin/workspace/prosjekter` | Andre prosjekt-variant — slås sammen til én prosjektflate. |
| `/admin/workspace/tildelt-meg` | «Tildelt meg» (ventende godkj./foresp./oppgaver) | VISNINGS-BYTTE | Aggregat-visning på «Min uke». |
| `/admin/workspace/notion` | Notion-tilkobling (databaser, mapping, sync) | FANE | «Notion»-fanen i Arbeidsflyt. |

---

## 13. Oppsett

Org, team, integrasjoner, sikkerhet. ADMIN. Faner: Organisasjon · Team · Integrasjoner · API · Sikkerhet · Logg.
Dev-/internverktøy flyttes ut til egen `/admin/dev`.

| Dagens rute | Jobb (kort) | Blir til | Begrunnelse |
|---|---|---|---|
| `/admin/organisasjon` | Admin-hub (klubb/team/integrasjoner/innstillinger) | **HUB-PRIMÆR** | Oppsett-landingen. |
| `/admin/settings` | Admin-innstillinger (Org/Team/Tilgang segm-faner) | SLÅTT SAMMEN → `/admin/organisasjon` | Overlapper org-hub tungt — fanene smelter inn i Oppsett. |
| `/admin/klubb/innstillinger` | Klubb-innstillinger (multi-club) | FANE | «Organisasjon/klubb»-fanen i Oppsett. |
| `/admin/team` | Team (coacher/admin card-grid) | FANE | «Team»-fanen i Oppsett. |
| `/admin/team/inviter` | Inviter coach (skjema) | MODAL/WIZARD | Inviter-modal i Team-fanen. |
| `/admin/profile` | Coachens profil-side (personalia + rediger) | FANE | «Min profil»-fane i Oppsett (egen konto). |
| `/admin/integrasjoner` | Integrasjoner-dashboard (GCal/Stripe/Notion/…) | FANE | «Integrasjoner»-fanen i Oppsett. |
| `/admin/settings/calendar` | Google Calendar 2-way sync-innstillinger | FANE | Kalender-synk under Integrasjoner-fanen. |
| `/admin/settings/api` | API-nøkler (opprett/revoke/kopier) | FANE | «API»-fanen i Oppsett. |
| `/admin/settings/security` | Sikkerhet (rolle-oversikt + 2FA) | FANE | «Sikkerhet»-fanen i Oppsett. |
| `/admin/settings/tilgang` | CBAC-matrise (read-only) | FANE | «Tilgang»-fanen i Oppsett. |
| `/admin/audit-log` | Audit-log (hendelse-liste) | FANE | «Logg»-fanen i Oppsett. |
| `/admin/audit-log/[id]` | Audit-log-detalj (diff + rull tilbake) | FANE | Logg-detalj i Oppsett. |
| `/admin/hjelp` | Hjelpesenter (søk, kategorier, kontakt) | FANE | «Hjelp»-fane i Oppsett (statisk støtteinnhold). |
| `/admin/coach-workbench` | Legacy redirect til spiller-workbench | REDIRECT/DROP | Ren legacy redirect-stub. |
| `/admin/godkjenn-portal` | Manuell godkjenning av PlayerHQ mot design-handoff | REDIRECT/DROP → `/admin/dev` | Dev-verktøy ut av hoved-IA (regel: dev-krok). |
| `/admin/godkjenn-portal/koblinger` | DesignKobling-oversikt | REDIRECT/DROP → `/admin/dev` | Dev-verktøy. |
| `/admin/godkjenn-portal/koblinger/[id]` | Kobling-detalj (design/app-iframe-mapping) | REDIRECT/DROP → `/admin/dev` | Dev-verktøy. |
| `/admin/godkjenn-portal/review` | Side-ved-side design-godkjenning | REDIRECT/DROP → `/admin/dev` | Dev-verktøy. |
| `/admin/tilstander` | Design-system-katalog (9 økt-kort-tilstander) | REDIRECT/DROP → `/admin/dev` | Intern design-katalog, ikke trener-funksjon. |
| `/admin/stats/overview` | Admin stats-oversikt (tellinger + git-log) | REDIRECT/DROP → `/admin/dev` | Intern admin-statistikk, ikke trener-funksjon. |
| `/admin/stats/moderering` | Coach modereringskø (turneringer/resultater/profil) | REDIRECT/DROP → `/admin/dev` | Intern moderering, ut av hoved-IA. |

---

## Oppsummering

| # | Hub | Antall dagens ruter |
|---|---|--:|
| 1 | Cockpit | 6 |
| 2 | Stall | 11 |
| 3 | Spiller 360 | 10 |
| 4 | Workbench | 21 |
| 5 | Drift | 20 |
| 6 | Innsikt | 11 |
| 7 | Innboks | 11 |
| 8 | Turneringer | 4 |
| 9 | Talent | 11 |
| 10 | Økonomi | 3 |
| 11 | AI-senter | 8 |
| 12 | Arbeidsflyt | 8 |
| 13 | Oppsett | 22 |
| | **Total** | **146** |

**146 ruter → 13 huber.** Hver rute i `admin.json` er tilordnet nøyaktig én hub.

Fordeling av «blir til»-typer (grovt): ~13 HUB-PRIMÆR (én per hub), ~60 FANE, ~13 VISNINGS-BYTTE,
~17 MODAL/WIZARD, ~8 SLÅTT SAMMEN, ~28 REDIRECT/DROP (hvorav 7 → `/admin/dev`).

---

## Ingen funksjon mistet

Alle **REDIRECT/DROP** faller i én av tre trygge kategorier:

**A) Rene redirect-/alias-stubs (ingen egen funksjon — peker allerede videre i koden):**
`/admin`, `/admin/oppfolging` (alias for queue), `/admin/messages`, `/admin/approvals`, `/admin/approvals/[id]`,
`/admin/finance`, `/admin/caddie`, `/admin/calendar`, `/admin/calendar/maned`, `/admin/kalender/uke`,
`/admin/kapasitet`, `/admin/coach-workbench`, `/admin/plans/templates`, `/admin/plans/templates/[id]/effectiveness`,
`/admin/plans/templates/[id]/rediger`, `/admin/plans/templates/ny`. → Forsvinner som adresser; mål-flaten lever videre.

**B) Fane-lenke-hub uten egen funksjon:** `/admin/kommunikasjon` (kun fane-lenker til innboks/maler/Notion) →
funksjonen ER de underliggende flatene, som beholdes (Innboks + e-postmal-fane).

**C) Dev-/internverktøy flyttet til `/admin/dev` (ut av hoved-IA, men beholdt):**
`/admin/godkjenn-portal` (+`/koblinger`, `/koblinger/[id]`, `/review`), `/admin/tilstander`,
`/admin/stats/overview`, `/admin/stats/moderering`. → Funksjonen finnes fortsatt, bare i dev-kroken (regel fra ia-fasit).

**SLÅTT SAMMEN** beholder all funksjon — innholdet flyttes inn på en søsterflate som gjør samme jobb:
`stall` + `agencyos/spillere` → `spillere`; `lag-snitt` → `analyse`; `agencyos/okonomi` → `okonomi`;
`handlingssenter` → `workspace/oppgaver`; `prosjekter` → `workspace/prosjekter`; `settings` → `organisasjon`.

**Konklusjon:** Ingen ekte trener-funksjon forsvinner. Hver av de 146 rutene er enten en levende flate/fane/visning/modal
i en av de 13 hubene, en ren redirect-stub som allerede peker videre, eller et dev-verktøy bevisst flyttet til `/admin/dev`.
