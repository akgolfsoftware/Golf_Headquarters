# Dekningskart — AK Golf HQ (1:1 produksjon)

> Levende sjekkliste. Kilde: `uploads/*-*.md` (produksjons-IA). Status settes manuelt etter hvert som skjermer bygges i kit-et.
> Status-nøkkel: ✅ bygget · 🟡 stub/delvis · ◆ dekket via system (komponenter + templates — bygges just-in-time) · 🛠 out-of-scope for design (dev-verktøy for Code) · ⬜ gjenstår · ↪︎ redirect (ingen UI)

## Sammendrag

- **Ekte skjermer å designe:** 387 (+ 26 redirects/stubs uten egen UI)
- **Per prioritet:** P0 10 · P1 71 · P2 173 · P3 132 · uklassifisert 27
- **Bygget i kit:** 29 ✅ + 2 🟡 (av 387 skjermer) — ryggraden står; resten følger P0→P3.
- **Per flate:** AgencyOS 143 · PlayerHQ 149 · Marketing 72 · Forelder 11 · Auth 38

### Fase 4 — statuslukking (3. jul 2026)
**Ingen rute uten status.** Klassifiseringspolicy for gjenstående ⬜:
- **🛠 Out-of-scope:** `/intern/komponenter/*` (7) + `/dev-banekart` = interne dev-/verktøyruter. Designes IKKE — de er Code sitt verktøy, ikke produkt. Dermed er **alle P0 lukket** (den ene ekte P0-produktruten er bygget).
- **◆ Dekket via system:** ubygde P1-produktruter som fullt ut kan settes sammen av eksisterende komponenter + de to templatene (`agencyos-dashboard`, `playerhq-skjerm`) uten ny skjermdesign. Bygges just-in-time av Code ved porting. Eksempler: liste-/detalj-varianter som gjenbruker `DataTable`/`SpillerKort`/`KpiTile`/`DetailShell`-mønsteret, coach-speil av eksisterende spillerflater, innstillings-underruter (`SetGroup/SetRow`).
- **⬜ Gjenstår (egen design):** ruter med genuint nytt komposisjons- eller interaksjonsmønster som IKKE finnes i systemet ennå — hver begrunnet i inventaret (wizard-flyter, kart-/regionvisninger, SG-Hub-underanalyser, live-tapper). Bevisst just-in-time-backlogg, ikke drift.
- **Tema/handoff-artefakter** (utenom produktruter): tema-bevis-ark, 3 referanseskjermer (workbench-lys, triage-lys, phq-uke-mørk), signatur-kort — se group «Tema»/«Signatur» + PORTING.md.

### Fase 5 — sluttføring (3. jul 2026)
- **Tilstandsgalleriet komplett** (`guidelines/tilstander.html`): utvidet fra 4 til **12 komponentfamilier** — Core, Forms, Overlays+kanon, Data (empty/loading), Datavisualisering (med data), TrackMan (med data), Kalender, Domene, Feedback, Struktur, Navigasjon, Marketing. Hele biblioteket (~97 komponenter) rendret med relevante tilstander side-om-side i **lys + mørk**, inkl. levende interaktive demoer (Modal/Drawer/Sheet/Popover/Tooltip/Toast). Familiene ligger i `tilstander-fam-{structure,data,kalender}.jsx`. ✅ verifisert i galleriet.
- **Bildekart** (`guidelines/bildekart.html`, group «Tema»): kuratert bildeprogram — hvilke flater får/aldri får foto, behandlingsregler, ekte foto (peak-misty + strength-training) med riktig scrim, og stripete plassholdere m/ mono-motiv der foto mangler. ✅
- **Eksporthygiene:** ingen v-dubletter i kanonisk lag (verifisert). Eksport = kun kanonisk lag jf. CLAUDE.md.
- **CLAUDE.md:** ny «Motion + dataliv»-seksjon med kanon-motion + dataliv-baren.
- **Fargedisiplin (Fase 2):** lime-eyebrow-disiplin håndhevet i AgencyOS — delt `Eyebrow`/`SectionTitle` (spillere-ui.jsx) + analyse, okonomi, agencyos-shell (Varsler/Dagens økter/Hurtigvalg), workbench-okt/zones/mobile/composer, turneringer, caddie degradert til muted. Lime på eyebrow beholdt kun som bevisst signal (AI-sparkles, fullført-suksess, overstyrt, NM-hovedmål-kort). Verifisert: Analyse + Cockpit-shell. Dataliv-count-up på hero-tall i Cockpit (triage) + Analyse (m/ setTimeout-fallback fordi preview struper rAF i bakgrunn).
- **Premium-paritet (Fase 4):** 1px top-sheen (`box-shadow: var(--sheen-top)`, samme som DS `Card`) lagt på alle AgencyOS lokale `Card`-hjelpere (spillere-ui delt + analyse, stall, okonomi, plans, agencyos-shell) → dekker cockpit, stall, spillere, drills, org, plans, okonomi, analyse. Polish, ikke redesign — komposisjon uendret. Verifisert: Cockpit-shell + Workbench.
- **Repo-kanon-forsoning (3. jul 2026):** brukeren limte inn produksjons-repoets designguide+ordbok som styrende; «go with defaults» → repo vinner, staget migrering. ✅ GJORT+VERIFISERT: (1) mørk CSS-neutral-rampe → near-black repo (bg #0A0B0A osv; viste seg å bare bringe CSS i samsvar med JS `T` som allerede var repo). (2) pyramide-aksepalett → repo forest/ochre/blå/lime/rød i CSS `--axis-*` (dark+lys) + JS `AX`/`AX_SOFT`; SPILL=lime bekreftet; verifisert workbench-kort. (3) ordbok-taksonomilabels: SG-kategori OTT «Tee-slag»/ARG «Nærspill», DNA-radar/talent-pentagon/styring-vekt/compliance «Kortspill»→«Nærspill»; verifisert talent-pentagon. ⬜ BACKLOG (CLAUDE.md «Repo-kanon-forsoning»): abonnement gratis/300-ingen-tiers, kategori A=nybegynner→K, ordbok-rest (putting m→ft, drill/økt-navn «Kortspill»→«Nærspill», SG→farge-mapping til repo).

---

## 🔴 P0 — bygg nå

- [x] **/admin/spillere/[id]/plan/[planId]** · AgencyOS — Spiller-plan-detalj med 5 faner (Oversikt/Periodisering/Drills(default)/Hit-rate/Effekt). Bygget som `spillere-plan.jsx` (Plan-fane i `stall.html`).
- 🛠 **/dev-banekart** · Auth — out-of-scope (internt banekart-verktøy for Code; ikke produkt-UI).
- 🛠 **/intern/komponenter** · Auth — out-of-scope (internt komponent-galleri = denne design-systemets rolle).
- 🛠 **/intern/komponenter/agency-kit** · Auth — out-of-scope (dev-galleri).
- 🛠 **/intern/komponenter/daglig-brief** · Auth — out-of-scope (dev-galleri).
- 🛠 **/intern/komponenter/forelder** · Auth — out-of-scope (dev-galleri).
- 🛠 **/intern/komponenter/hull-analyse** · Auth — out-of-scope (dev-galleri).
- 🛠 **/intern/komponenter/inbox-tester** · Auth — out-of-scope (dev-galleri).
- 🛠 **/intern/komponenter/spiller-panel** · Auth — out-of-scope (dev-galleri).
- 🛠 **/intern/komponenter/team-bookinger** · Auth — out-of-scope (dev-galleri).

**→ P0 lukket:** eneste ekte P0-produktrute er bygget; resten er 🛠 out-of-scope.

---

## Full inventar per flate

### AgencyOS — 143 ruter


**P0**

- ✅ **/admin/spillere/[id]/plan/[planId]** — Spiller-plan-detalj med 5 faner (Oversikt/Periodisering/Drills(default)/Hit-rate/Effekt). Bygget som `spillere-plan.jsx`.

**P1**

- ✅ **/admin/agencyos/live**
- ⬜ **/admin/agent-team** — Flere AI-er sekvensielt på én oppgave (output → neste steg).
- ⬜ **/admin/agenter** — Flermodell AI-chat (Claude/Gemini/Grok/Ollama), merget inn fra kommandosenteret.
- ⬜ **/admin/audit-log** — Sikkerhets-hendelseslogg (siste 50) med kategori/status fra action-prefiks.
- ⬜ **/admin/gjennomfore/okter/[id]** — Økt-detalj i coach-kontekst med live-status, planlagt innhold, notater og etter-økt.
- ⬜ **/admin/kommunikasjon** — Hub med 4 faner (Innboks/E-postmaler/Notion-prosjekter/Notion-oppgaver) som hver er ett «åpne»-kort.
- ⬜ **/admin/live/[sessionId]/brief**
- ⬜ **/admin/live/[sessionId]/summary**
- ✅ **/admin/organisasjon** — Admin-hub (klubb/team/integrasjoner/innstillinger/agenter/maler/audit/profil). Bygget som `org.html`.
- ⬜ **/admin/plans/new** — Plan-builder-wizard (klient) for å lage ny plan med disiplin-akse-fordeling.
- ✅ **/admin/plans** — Kanban (Utkast/Aktiv/Fullført) på tvers av stallen. Bygget som `plans.html`.
- ✅ **/admin/plans/[planId]** — Plan-detalj m/ faner Oversikt/Øvelser/Notater/Rapport, fase-timeline, fordeling. I `plans.html`.
- ✅ **/admin/grupper** — Gruppe-oversikt m/ medlemstall, HCP/SG-snitt, aktivitetsbar. Nå Grupper-visningen i `stall.html` (tidligere `grupper.html` slettet i Fase 1-opprydding).
- ✅ **/admin/grupper/[id]** — Gruppe-detalj m/ hero, KPI, neste samling, medlemsgrid, quick-stats. Del av `stall.html` sin Grupper-visning.
- ✅ **/admin/godkjenninger** — Agent-plan-endring-innboks m/ full før/etter-diff. Bygget som `godkjenninger.html`.
- ✅ **/admin/godkjenninger/[id]** — Detalj-diff m/ impact-strip, godkjenn/avvis m/ begrunnelse. I `godkjenninger.html`.
- ⬜ **/admin/prosjekter** — Kommando-prosjekter med oppgavetelling.
- ✅ **/admin/spillere/[id]/fremgang** — SG-fremgang siste 8 uker per område + treningsvolum + korrelasjon trening↔SG. Fremgang-fanen i `stall.html`.
- ✅ **/admin/spillere/[id]/plan** — Plan-fanen i `stall.html` (aktiv/tom-tilstand fra spillerens status).
- ✅ **/admin/spillere/[id]/profil** — Full stamdata-profil — personalia, foresatte, spiller-DNA-radar, aktive mål, skade-historikk, coach-vurdering. Profil-fanen i `stall.html`.
- ✅ **/admin/stall** — Stall — DET samlede spiller-navet: roster (liste ⇄ gruppe-tiles), søk/sortér (inkl. behov), full 360°-profil (Oversikt/Profil/Fremgang/Plan) + rediger-stamdata. Erstatter tidligere separate Spillere/Grupper-flater (`spillere.html`/`grupper.html` slettet i Fase 1-opprydding; delte jsx-filer gjenbrukes av `stall.html`).
- ✅ **/admin/talent** — Talent Coach — SkillRadar + PercentileGauge + Pyramide-balanse + H2H for valgt spiller. Bygget som `talent.html`.
- ⬜ **/admin/talent/[playerId]** — Talent 360-profil — hero + 5 KPI + stor radar + milepæler + notater + hurtigvalg.
- ⬜ **/admin/talent/radar/[playerId]** — Radar-vurdering per spiller — pentagon-radar (1–10) vs nivå-snitt + redigerings-form.
- ⬜ **/admin/tester/[id]** — Test-resultat-detalj — trend-graf + benchmark/nivå for ett TestResult.
- ⬜ **/admin/tester/foreslatte** — Spiller-foreslåtte custom-tester som venter coach-godkjenning.
- ✅ **/admin/tilstander** — Internt tilstandsgalleri (`guidelines/tilstander.html`): interaktive + databærende familier med alle tilstander (default/checked/error/disabled/loading/empty) side ved side i lys og mørk.
- ⬜ **/admin/workspace** — «Min uke» — oppgaver fordelt på I dag / Denne uka / Senere med brenner-strip.
- ⬜ **/admin/workspace/notion** — Notion-tilkobling: empty (oppsett-veiviser) vs. connected (databaser/feltkartlegging/synlighet/historikk).
- ⬜ **/admin/workspace/oppgaver/[id]** — Task-detalj med beskrivelse, sub-tasks, aktivitet og metadata-sidebar.

**P2**

- ✅ **/admin/agencyos**
- ⬜ **/admin/agencyos/okonomi**
- ⬜ **/admin/agencyos/spillere**
- ⬜ **/admin/agencyos/uka**
- ⬜ **/admin/agents** — Agent-pipeline-oversikt — registrerte agenter + siste 30 kjøringer.
- ✅ **/admin/analyse** — Stall-analyse — 4 KPI-kort + pyramide-fordeling (stall) + per-gruppe-tabell.
- ⬜ **/admin/analysere** — Innsikt-hub — 8 nav-kort til stall-statistikk/tester/godkjenninger/rapporter/økonomi/helse.
- ⬜ **/admin/availability** — Måned-kalender som viser coachens åpne booking-vinduer per ukedag.
- ⬜ **/admin/brief** — Daglig AI-morgenbrief — Anthropic-oppsummering + dagens KPI + agent-anbefalinger.
- ✅ **/admin/drills/[id]** — Full drill-detalj med nivå-range, csTarget per NGF-kategori og metadata. Bygget som inspektør-panel i `drills.html` (klikk en drill).
- ⬜ **/admin/gjennomfore** — Hub for daglig drift (kalender, bookinger, anlegg, kapasitet, TrackMan, live).
- ⬜ **/admin/godkjenn-portal** — Kvalitetssikring — liste alle PlayerHQ-ruter med godkjenningsstatus vs design-handoff.
- ⬜ **/admin/hjelp** — Hjelpesenter — søk, kategorier, populære artikler, kontakt-CTA.
- ✅ **/admin/innboks** — Master-detalj meldingsflate coach↔spiller/foresatt med svar + AI-utkast.
- ⬜ **/admin/kalender**
- ⬜ **/admin/kalender/maned**
- ⬜ **/admin/klubb/innstillinger** — Multi-club setup — klubber, fasiliteter, åpningstider, daglig leder.
- ⬜ **/admin/lag-snitt** — Pyramide-fordeling per gruppe — 3-kol grid av gruppekort.
- ⬜ **/admin/live/[sessionId]/active**
- ⬜ **/admin/okter** — Uke-oversikt over treningsøkter med pyramide-stripes per dag.
- ⬜ **/admin/plan-templates/[id]** — Mal-detalj med metadata, disiplin-fordeling og øktliste.
- ⬜ **/admin/plan-templates/[id]/effectiveness** — Effekt-analyse av mal: pre/post SG-deltas, completion, ratings + trendgraf.
- ⬜ **/admin/plan-templates/[id]/rediger** — Editor for mal + enkeltøkter med drill-valg.
- ⬜ **/admin/profile** — Coachens offentlige profil (personalia, bio, sertifiseringer, galleri).
- ⬜ **/admin/queue** — Oppfølgingskø — «hvem trenger en samtale denne uka» (Risiko/Watch/Sjekk inn/Løst).
- ⬜ **/admin/recording** — Coaching-opptak — Deepgram-transkripsjon + pipeline-status + historikk.
- ⬜ **/admin/risiko** — Risiko-/belastningskart — heatmap-grid over stallen + liste «trenger oppfølging nå».
- ⬜ **/admin/runder** — Coach-view over alle registrerte runder (score/vs par/SG).
- ⬜ **/admin/settings/security** — Konto-sikkerhet — 2FA, passord-flyt, (planlagt) aktive økter.
- ✅ **/admin/spillere** — Roster med behov-sortering — nå en sortérmodus («Behov») i `stall.html`, ikke egen flate.
- ✅ **/admin/spillere/[id]** — Spillerprofil 360° — hero + coach-flagg + pyramide + siste runder/tester + aktiv plan + meldinger. Oversikt-fanen, nå nådd fra `stall.html` (roster → spillerklikk).
- ✅ **/admin/spillere/[id]/rediger** — Rediger spiller-stamdata med sticky lagre-bar topp+bunn og endrings-historikk. Bygget som `spillere-rediger.jsx` (Rediger-knapp i spillerens header i `stall.html`).
- ⬜ **/admin/stats/moderering** — Moderering-/GDPR-kø (turneringer/resultater/profil-endringer/slett-forespørsler).
- ⬜ **/admin/stats/overview** — Admin-stats-dashbord (brukere/SG-data/turneringsdatabase/sync-status/git-commits).
- ⬜ **/admin/talent/discovery** — Scout-feed — PLAYER-brukere ikke i TalentTracking, m/ søk + HCP/klubb-filter + legg-til.
- ⬜ **/admin/talent/kohort** — Kohort-analyse — TalentTracking gruppert per nivå (U10–Senior), snitt-radar + 90d-progresjon.
- ⬜ **/admin/talent/radar** — Talent-radar-liste — talenter sortert på WAGR-rank m/ mini-pyramide (økter per akse).
- ⬜ **/admin/talent/region** — Regional pipeline — TalentTracking per region m/ forenklet Norge-pin-kart + tabell.
- ⬜ **/admin/talent/wagr-benchmark** — WAGR-referansespillere (topp 5 globalt + topp 5 norske) som NGF-kategori-kalibrering.
- ⬜ **/admin/talent/wagr-import** — WAGR-import — synk-status + matchede spillere-tabell.
- ⬜ **/admin/team** — Coach/admin-team som kort-grid med roller og stats.
- ⬜ **/admin/teknisk-plan** — Oversikt over teknisk plan-status (TEK-økter) per spiller + tilgjengelige maler.
- ⬜ **/admin/teknisk-plan/[spillerId]** — Spillerens tekniske plan periodisert per L-fase med CS-fremgang per øvelse.
- ⬜ **/admin/tester** — Tester-oversikt — 4 KPI + testresultat-tabell (delta/status) m/ mobil kortliste.
- ⬜ **/admin/tester/benchmarks** — DataGolf-fasiter — nivåstiger + synk-modus + ventende justeringer (drift > 3 %) for godkjenning.
- ⬜ **/admin/tester/tildel/[spillerId]** — Route-basert tildel-test-modal for valgt spiller.
- ⬜ **/admin/tournaments/dubletter** — Foreslå og merge MANUAL-turneringer mot synkroniserte (DATAGOLF/NGF) via dato- og navne-overlapp.
- ⬜ **/admin/tournaments/ny** — 5-stegs wizard for å opprette ny Tournament.
- ⬜ **/admin/trackman** — Coach-view over alle TrackMan-sesjoner (slag-volum/kilde/miljø).
- ⬜ **/admin/varsler** — Coach-varselsenter — agent-forslag/signaler/uleste meldinger samlet.
- ⬜ **/admin/workspace/oppgaver** — Oppgaveliste med Liste/Kanban/Kalender-visninger og filter.
- ⬜ **/admin/workspace/prosjekter** — Prosjekt-grid per selskap med fremdrift og filter.

**P3**

- ↪︎ **/admin**
- ⬜ **/admin/agencyos/caddie**
- ⬜ **/admin/agencyos/caddie/aktivitet**
- ✅ **/admin/agencyos/caddie/dashbord**
- ⬜ **/admin/agents/[agentId]** — Agent-detalj — konfig, siste AgentRun-kjøringer, tommel-feedback per kjøring.
- ⬜ **/admin/analysere/compliance** — Compliance-sporing — plan-økter vs. faktiske reps per spiller/stall.
- ⬜ **/admin/anlegg** — Fasilitets-grid med booking-trykk denne uka per anlegg.
- ⬜ **/admin/anlegg/[id]** — Anlegg-detalj per lokasjon med KART- og KALENDER-modus.
- ↪︎ **/admin/approvals** — `permanentRedirect` → `/admin/godkjenninger` (+ `/{id}`). NB: selve UI-komponentene (ApprovalActions m.fl.)…
- ⬜ **/admin/audit-log/[id]** — Detalj for én audit-event (før/etter-diff, relaterte events, eksport JSON).
- ↪︎ **/admin/board** — Stub — `redirect("/admin/spillere?view=tavle")`.
- ⬜ **/admin/bookinger** — Kombinert «Bookinger & kapasitet»-dashbord for inneværende uke (sammenslått med tidligere /admin/kapasitet).
- ⬜ **/admin/bookinger/ny** — 5-stegs manuell booking-oppretting for coach/admin.
- ↪︎ **/admin/caddie** — `permanentRedirect("/admin/agencyos/caddie/dashbord")` (konsolidert i caddie-skjerm).
- ↪︎ **/admin/calendar**
- ↪︎ **/admin/calendar/maned**
- ✅ **/admin/coach-workbench**
- ✅ **/admin/drills** — Drill-bibliotek med kategori-segmentkontroll og tile-grid. Bygget som `drills.html` (20 driller, søk + akse-filter).
- ✅ **/admin/drills/[id]/rediger** — Rediger-skjema for en drill (+ andre drills til prerequisites-multiselect). Bygget som komponist-modal i `drills.html`.
- ✅ **/admin/drills/forslag** — Kø av AI-genererte drill-forslag (PENDING) coachen kan godkjenne/avvise. Bygget som forslagskø-modal i `drills.html`.
- ✅ **/admin/drills/ny** — Opprett ny drill (blankt skjema, samme felt-sett som rediger). Samme komponist-modal i `drills.html`.
- ⬜ **/admin/email-templates** — CRUD over slug-baserte e-postmaler brukt av agent-pipeline.
- ⬜ **/admin/email-templates/[id]/rediger** — Rediger e-postmal med live preview.
- ↪︎ **/admin/finance** — `permanentRedirect("/admin/okonomi")`.
- ⬜ **/admin/foresporsler** — Booking-ønsker fra spillere (SessionRequest) — godta/avvis.
- ⬜ **/admin/godkjenn-portal/koblinger** — Oversikt over design-koblinger (DesignKobling) med status + foreslått rute (+ detalj per kobling).
- ⬜ **/admin/godkjenn-portal/review** — Side-ved-side godkjenning (live iframe vs designfil) m/forrige/neste-navigasjon.
- ⬜ **/admin/grupper/[id]/timeplan** — Gruppe-timeplan — alle GroupSchedule-rader (faste/kommende/tidligere) m/ `?focus=`-highlight.
- ⬜ **/admin/handlingssenter** — Oppgave-board synket fra Notion (OppgaveCache).
- ⬜ **/admin/integrasjoner** — Status-dashboard for tredjepartstjenester (Google/Stripe/Notion/Anthropic/Resend/Supabase).
- ↪︎ **/admin/kalender/uke**
- ↪︎ **/admin/kapasitet** — `redirect("/admin/bookinger")` — kapasitet er slått sammen dit.
- ⬜ **/admin/mer** — Mobil-lenkeliste som speiler desktop-sidebarens grupper.
- ↪︎ **/admin/messages** — `permanentRedirect("/admin/innboks")`. NB: `messages/_components/*` er den kanoniske komponentkilden for in…
- ✅ **/admin/okonomi** — Fakturaer/betalinger + abonnement med periode-filter.
- ⬜ **/admin/oppfolging** — Stub — re-eksport av `@/app/admin/queue/page` (oppfølgingskø).
- ⬜ **/admin/plan-templates** — Bibliotek av gjenbrukbare plan-maler som tiles.
- ⬜ **/admin/plan-templates/ny** — Opprett ny mal fra blankt skjema (metadata først, økter etterpå).
- ↪︎ **/admin/planlegge**
- ↪︎ **/admin/plans/templates**
- ⬜ **/admin/plans/templates/[id]/effectiveness**
- ⬜ **/admin/plans/templates/[id]/rediger**
- ↪︎ **/admin/plans/templates/ny**
- ⬜ **/admin/reach** — Engasjement-/rekkevidde-dashbord per spiller (compliance, lesefrekvens, feature-bruk, daglig aktivitet 30d).
- ⬜ **/admin/reports** — Rapport-tiles (CSV/PDF + interne analyse-flater).
- ⬜ **/admin/services** — Tabell over bookbare tjenester (pris/varighet/status).
- ⬜ **/admin/settings** — Admin-hub med 3 faner (Organisasjon / Team & roller / Tilgang).
- ⬜ **/admin/settings/api** — API-nøkkel-administrasjon (opprett/revoker, scopes).
- ⬜ **/admin/settings/tilgang** — Read-only CBAC capability×rolle-matrise.
- ⬜ **/admin/spillere/[id]/tester** — Coach-view av en spillers testbatteri (faner).
- ⬜ **/admin/spillere/[id]/tildel-test** — Modal for å tildele test til en spiller.
- ⬜ **/admin/spillere/[id]/workbench** — Coach-Workbench (lanserings-hub) for én spiller — planlegging, teknisk plan, gantt/uke/økt.
- ⬜ **/admin/spillere/ny** — Multi-steg onboarding-wizard for ny spiller.
- ⬜ **/admin/talent/ressurser** — Ressurs-bibliotek — filter på kategori/nivå/fokus, kort-grid, admin legg-til-form.
- ⬜ **/admin/talent/sammenligning** — Side-by-side sammenligning av inntil 4 talenter (radar/SG).
- ⬜ **/admin/team/inviter** — Inviter ny coach via e-post-link.
- ✅ **/admin/tournaments** — Liste turneringer stallen er påmeldt i + send fellesmelding til påmeldte.
- ⬜ **/admin/tournaments/[id]** — Turneringsdetalj — påmeldte, resultater, redigering, merge-håndtering.
- ⬜ **/admin/videoer** — Last opp og del coaching-videoer med spillere.
- ⬜ **/admin/workspace/tildelt-meg** — Samlet liste over alt som venter på handling fra coachen.

### PlayerHQ — 149 ruter


**P1**

- 🟡 **/portal/(fullscreen)/live/[sessionId]/active**
- ⬜ **/portal/booking/[bookingId]**
- ⬜ **/portal/booking/anlegg/[anleggId]**
- ⬜ **/portal/coach/[coachId]**
- ⬜ **/portal/coach/melding/ny**
- ⬜ **/portal/coach/ovelser**
- ⬜ **/portal/coach/plans**
- ⬜ **/portal/coach/plans/[planId]**
- ⬜ **/portal/coach/sg-hub**
- ⬜ **/portal/coach/videoer**
- ⬜ **/portal/kalender**
- ✅ **/portal/mal** — Vis spillerens aktive mål med fremdrift + siste milepæl, og inngang til å sette nye mål. Bygget som `phq-mal.jsx` (Mål-fane).
- ✅ **/portal/mal/goal/[id]** — Måldetalj med fremdrift, nivå-stige (A–G) og redigering for egne mål. Bygget i `phq-mal.jsx`.
- ✅ **/portal/mal/leaderboard** — Rangere Pro-spillere etter snitt-SG (siste 30 d) med din-rang-banner og kategori-faner. Bygget i `phq-mal.jsx`.
- ⬜ **/portal/mal/runder/[id]/shot-by-shot** — Full hull-for-hull-analyse av en runde med KPI, tabell, trend-charts og notat.
- ⬜ **/portal/mal/sg-hub/[club]** — Per-kølle TrackMan-analyse — D-Plane, strike-heatmap, smash-kurve, tempo, fatigue, og (advanced) slag-tabel…
- ⬜ **/portal/mal/sg-hub/benchmark** — Vis spillerens snitt-SG per område mot PGA Tour-baseline (midtlinje = 0/Tour-snitt).
- ⬜ **/portal/meg/abonnement/avbestill**
- ⬜ **/portal/meg/innstillinger/sikkerhet**
- ⬜ **/portal/meg/sikkerhet**
- ⬜ **/portal/statistikk/[metric]**
- ⬜ **/portal/talent**
- ⬜ **/portal/tren/[sessionId]**
- ⬜ **/portal/tren/fys-plan**
- 🟡 **/portal/tren/kalender**
- ⬜ **/portal/tren/teknisk-plan**
- ⬜ **/portal/tren/teknisk-plan/[planId]**
- ⬜ **/portal/tren/turneringer/[id]**
- ⬜ **/portal/trening/logg**

**P2**

- ✅ **/portal**
- ⬜ **/portal/(fullscreen)/live/[sessionId]/brief**
- ⬜ **/portal/(fullscreen)/live/[sessionId]/summary**
- ⬜ **/portal/(fullscreen)/live/[sessionId]/tapper**
- ⬜ **/portal/agent-pipeline**
- ✅ **/portal/analysere**
- ⬜ **/portal/analysere/hull**
- ✅ **/portal/baneguide** — Baneliste (Bærum/Oslo/Miklagard/GFGK/Losby) m/ par/slope/rating. Bygget som `phq-baneguide.jsx`.
- ✅ **/portal/baneguide/[baneId]** — Banedetalj — nøkkeltall + hull-for-hull (par/yardage/hcp-index/note). I `phq-baneguide.jsx`.
- ⬜ **/portal/booking**
- ⬜ **/portal/booking/coach/[coachId]**
- ⬜ **/portal/booking/ny**
- ⬜ **/portal/booking/ny/bekreft**
- ⬜ **/portal/coach**
- ⬜ **/portal/coach/ai**
- ⬜ **/portal/coach/melding**
- ⬜ **/portal/coach/melding/[id]**
- ⬜ **/portal/coach/notes**
- ⬜ **/portal/coach/notes/[noteId]**
- ⬜ **/portal/coach/ovelser/[id]/rediger**
- ⬜ **/portal/coach/ovelser/ny**
- ⬜ **/portal/coach/plans/[planId]/ny-okt**
- ⬜ **/portal/coach/plans/perioder**
- ⬜ **/portal/coach/sporsmal**
- ⬜ **/portal/coach/sporsmal/[id]**
- ⬜ **/portal/coach/sporsmal/ny**
- ⬜ **/portal/drills**
- ⬜ **/portal/drills/[id]**
- ⬜ **/portal/gjennomfore**
- ⬜ **/portal/gjennomfore/[id]**
- ⬜ **/portal/mal/bygger** — Wizard for å bygge/sette et nytt mål med kontekst (HCP, runder osv.).
- ⬜ **/portal/mal/milepaeler** — Samle achievements, aktive/oppnådde mål og HCP/score-trend på én flate.
- ⬜ **/portal/mal/runder/[id]/slag** — Registrere slag-for-slag manuelt eller importere fra UpGame.
- ⬜ **/portal/mal/sg-hub** — Sentral SG-flate — total + per disiplin (OTT/APP/ARG/PUTT) vs PGA Tour, innsikter, per-kølle-inngang og ver…
- ⬜ **/portal/mal/sg-hub/best-vs-now** — Sammenligne en valgt TrackMan-økt mot pinnet «best ever»-økt, metrikk for metrikk.
- ⬜ **/portal/mal/sg-hub/coach/[spillerId]** — Coach ser en spillers SG-Hub-oversikt (økter, køller, tier) med inngang til per-kølle/equipment.
- ⬜ **/portal/mal/sg-hub/coach/[spillerId]/[club]** — Coach-speil av per-kølle-analysen for en spiller (D-Plane/strike/smash + advanced slag-tabell).
- ⬜ **/portal/mal/sg-hub/conditions** — Slider-justering av temperatur/vind/høyde for å se hvordan stock-distanser endrer seg.
- ⬜ **/portal/mal/sg-hub/equipment** — Per-kølle helsesjekk av launch/spin/smash mot optimale target-vinduer.
- ⬜ **/portal/mal/sg-hub/strategy** — For en mål-distanse: rangere hvilken kølle som gir best Strokes Gained.
- ⬜ **/portal/mal/sg-hub/yardage** — Auto-generert yardage-kort (carry, 3/4, soft, apex, ±1σ per kølle) med PDF-eksport.
- ⬜ **/portal/mal/statistikk** — SG-utvikling over valgt periode — SG-kort med trend, score-trend-graf og runde-tabell.
- ⬜ **/portal/mal/trackman** — Liste alle importerte TrackMan-økter (nyeste først) + trend per kølle + import-inngang.
- ⬜ **/portal/mal/trackman/[id]** — TrackMan-økt-detalj — dispersjon, per-kølle snittdistanse, stabilitet.
- ✅ **/portal/meg**
- ⬜ **/portal/meg/bookinger**
- ⬜ **/portal/meg/feedback**
- ⬜ **/portal/meg/help/artikkel/[slug]**
- ⬜ **/portal/meg/help/kategori/[slug]**
- ⬜ **/portal/meg/help/kontakt**
- ⬜ **/portal/meg/innstillinger/ai-coach**
- ⬜ **/portal/meg/innstillinger/anlegg**
- ⬜ **/portal/meg/innstillinger/okter**
- ⬜ **/portal/meg/innstillinger/personvern**
- ⬜ **/portal/meg/innstillinger/sprak**
- ⬜ **/portal/meg/innstillinger/varsler**
- ⬜ **/portal/meg/profil/rediger**
- ⬜ **/portal/meg/sikkerhet/2fa**
- ⬜ **/portal/ny-okt**
- ⬜ **/portal/onskeligokt**
- ⬜ **/portal/onskeligokt/bekreftet**
- ⬜ **/portal/planlegge/workbench**
- ⬜ **/portal/spiller/[spillerId]**
- ⬜ **/portal/statistikk**
- ⬜ **/portal/talent/min-plan**
- ⬜ **/portal/talent/mitt-niva**
- ⬜ **/portal/talent/roadmap**
- ⬜ **/portal/talent/sammenligning**
- ⬜ **/portal/trackman/[sessionId]**
- ⬜ **/portal/tren/[sessionId]/planlagt**
- ⬜ **/portal/tren/feiring/[planId]**
- ⬜ **/portal/tren/fys-plan/[planId]**
- ⬜ **/portal/tren/tester**
- ⬜ **/portal/tren/tester/[testId]**
- ⬜ **/portal/tren/tester/katalog**
- ⬜ **/portal/tren/tester/ny**
- ⬜ **/portal/tren/tester/ny/egen**
- ⬜ **/portal/tren/turneringer**
- ⬜ **/portal/tren/aarsplan**
- ⬜ **/portal/trening/break-tabell**
- ⬜ **/portal/trening/putte-laboratoriet**
- ⬜ **/portal/utfordringer**
- ⬜ **/portal/utfordringer/[id]**
- ⬜ **/portal/utfordringer/ny**
- ⬜ **/portal/varsler**

**P3**

- ⬜ **/portal/(fullscreen)/live/[sessionId]**
- ↪︎ **/portal/(fullscreen)/live/[sessionId]/logger**
- ⬜ **/portal/(fullscreen)/tren**
- ↪︎ **/portal/analyse**
- ⬜ **/portal/baneguide/[baneId]/hull/[nr]**
- ⬜ **/portal/booking/bekreftet**
- ⬜ **/portal/coach/melding/[id]/vedlegg**
- ✅ **/portal/mal/runder** — Liste alle registrerte runder (nyeste først) med score, til-par, SG-total og beste-merke. Bygget som `phq-runder.jsx`.
- ✅ **/portal/mal/runder/[id]** — Ren visning av én runde — score-headline, scorecard UT/INN og SG-nedbrytning. I `phq-runder.jsx`.
- ⬜ **/portal/mal/runder/ny** — Manuelt loggføre en runde (bane/dato/hull-grid med live til-par).
- ⬜ **/portal/mal/sg-hub/coach/[spillerId]/equipment** — Coach ser spillerens equipment-helsesjekk (samme visning som spiller, med spillernavn + coach-backHref).
- ⬜ **/portal/meg/abonnement**
- ⬜ **/portal/meg/abonnement/faktura/[id]**
- ⬜ **/portal/meg/abonnement/kort/ny**
- ↪︎ **/portal/meg/abonnement/oppgrader**
- ⬜ **/portal/meg/abonnement/oppgrader/flyt**
- ⬜ **/portal/meg/bookinger/reschedule/[bookingId]**
- ⬜ **/portal/meg/dokumenter**
- ⬜ **/portal/meg/foreldre**
- ⬜ **/portal/meg/help**
- ⬜ **/portal/meg/helse**
- ⬜ **/portal/meg/helse/symptom/ny**
- ⬜ **/portal/meg/innstillinger**
- ↪︎ **/portal/meg/innstillinger/eksport**
- ⬜ **/portal/meg/innstillinger/integrasjoner**
- ⬜ **/portal/meg/profil**
- ⬜ **/portal/meg/utstyrsbag**
- ↪︎ **/portal/planlegge**
- ⬜ **/portal/reach**
- ⬜ **/portal/statistikk/runder/[runId]/del**
- ↪︎ **/portal/stats**
- ↪︎ **/portal/tren/ovelser**
- ↪︎ **/portal/tren/ovelser/[id]**
- ⬜ **/portal/tren/turneringer/ny**
- ⬜ **/portal/tren/aarsplan/periode/[id]/rediger**

### Marketing — 72 ruter


**P1**

- ✅ **/stats** — Bygget som `stats.html` (spillersøk + leaderboards + PGA + SG-sammenlign i én flate).
- ✅ **/stats/leaderboards** — 5 disiplin-faner (Totalt/OTT/APP/ARG/PUTT), bygget i `stats.html`.
- ✅ **/stats/pga** — Kategori-referanse-grid, bygget i `stats.html`.
- ↪︎ **/stats/min-progresjon**
- ⬜ **/stats/pga**
- ✅ **/stats/sg-sammenlign** — Bygget som fungerende sammenlign-verktøy i `stats.html`.
- ✅ **/stats/sg-sammenlign/resultat/[id]** — Inline resultat-visning (per-akse sammenligning) i `stats.html`.
- ✅ **/stats/sg-sammenlign/start** — Profil-valg i `stats.html`.
- ✅ **/stats/sok** — Spillersøk i hero, bygget i `stats.html`.
- ⬜ **/stats/spillere**

**P2**

- ⬜ **/stats/blogg**
- ⬜ **/stats/norske**
- ⬜ **/stats/pga/drive-distance**
- ⬜ **/stats/pga/fairway-pct**
- ⬜ **/stats/pga/gir-pct**
- ⬜ **/stats/pga/putt-explorer**
- ⬜ **/stats/pga/putts-per-round**
- ⬜ **/stats/pga/scoring-avg**
- ⬜ **/stats/pga/sg-total**
- ⬜ **/stats/pga/spillere**
- ⬜ **/stats/pga/spillere/[dg_id]**
- ⬜ **/stats/regions**
- ⬜ **/stats/sammenlign-spillere**
- ⬜ **/stats/spillere/[slug]**
- ⬜ **/stats/tour/[slug]**
- ⬜ **/stats/turneringer**
- ⬜ **/stats/turneringer/[slug]**
- ⬜ **/stats/turneringer/[slug]/statistikk**
- ⬜ **/stats/uka**

**P3**

- ⬜ **/stats/2026**
- ⬜ **/stats/baner**
- ⬜ **/stats/baner/[slug]**
- ⬜ **/stats/blogg/[slug]**
- ⬜ **/stats/klubber**
- ⬜ **/stats/klubber/[slug]**
- ⬜ **/stats/quiz**
- ⬜ **/stats/regions/[slug]**
- ⬜ **/stats/verktoy**
- ⬜ **/stats/verktoy/avstand**
- ⬜ **/stats/verktoy/score-til-hcp**
- ⬜ **/stats/verktoy/sg-estimator**
- ⬜ **/stats/verktoy/tour-ekvivalent**
- ⬜ **/stats/verktoy/whs-kalkulator**
- ⬜ **/stats/wrapped/[slug]**
- ⬜ **/stats/aargang**
- ⬜ **/stats/aargang/[aar]**

**?**

- ✅ **/** — Selge plattformen — SG-konsoll-hero, to-app-split, bento-moduler, tall-band, priser, final CTA.
- ✅ **/anlegg**
- ⬜ **/anlegg/[slug]**
- ⬜ **/blogg**
- ⬜ **/blogg/[slug]**
- ✅ **/booking**
- ⬜ **/booking/[slug]**
- ⬜ **/booking/[slug]/bekreft**
- ⬜ **/booking/kvittering/[bookingId]**
- ⬜ **/cases**
- ⬜ **/coacher**
- ⬜ **/coacher/[slug]**
- ✅ **/coaching**
- ⬜ **/cookies**
- ⬜ **/faq**
- ⬜ **/jobb**
- ⬜ **/junior**
- ⬜ **/kontakt**
- ⬜ **/om-oss**
- ⬜ **/personvern**
- ✅ **/playerhq**
- ✅ **/priser**
- ⬜ **/suksess**
- ⬜ **/treningsfilosofi**
- ⬜ **/turneringer**
- ⬜ **/turneringer/[slug]**
- ⬜ **/vilkar**

### Forelder — 11 ruter


**P1**

- ✅ **/forelder/barn/[childId]** — Read-only barn-profil med fane-navigasjon (oversikt/uke/mål/økonomi) over treningsplan, runder, mål og betaling. Bygget som `forelder-barn.jsx` (Barn-komponent).
- ✅ **/forelder/okonomi** — Read-only sammendrag av barnas økonomi — abonnement-status (tier/credits/neste trekk) + utestående + siste betalinger. Bygget som `forelder-barn.jsx` (Okonomi-komponent).
- ✅ **/forelder/samtykke** — Administrer datasamtykker per barn (foto/video, datadeling, nyhetsbrev, tredjepart) + GDPR-handlinger (eksp…

**P2**

- ✅ **/forelder** — Read-only forklarende hjem — samtykke-status + narrativ ukerapport + 8-ukers SG-trend + coach-notat for ett…
- ⬜ **/forelder/barn** — Liste over alle koblede barn som store klikkbare fremgangskort (pyramide-snapshot + nøkkeltall) → detalj på…
- ⬜ **/forelder/bookinger** — Read-only innsyn i barnas bookede timer — mini ukekalender + kommende/tidligere bookinger som kort.
- ✅ **/forelder/fakturaer** — Read-only fakturahistorikk på tvers av barn med KPI (betalt hittil / neste forfall) + datert betalingsliste.
- ✅ **/forelder/innstillinger** — Konto, koblede barn (samtykke-kontekst), varseltyper og kontosikkerhet for forelder-rollen.
- ⬜ **/forelder/ukerapport** — Read-only ukesoppsummering — "Denne uka" (3 stat) + coach-kommentar + ukens høydepunkt.
- ⬜ **/forelder/varsler** — Varsel-preferanser per barn (foreløpig read-only toggles) + feed av siste varsler for barna.

**P3**

- ⬜ **/forelder/coach** — Placeholder for coach-dialog — setter forventning ("kommer Q3 2026") + CTA til support.

### Auth — 38 ruter


**P0**

- ⬜ **/dev-banekart**
- ⬜ **/intern/komponenter**
- ⬜ **/intern/komponenter/agency-kit**
- ⬜ **/intern/komponenter/daglig-brief**
- ⬜ **/intern/komponenter/forelder**
- ⬜ **/intern/komponenter/hull-analyse**
- ⬜ **/intern/komponenter/inbox-tester**
- ⬜ **/intern/komponenter/spiller-panel**
- ⬜ **/intern/komponenter/team-bookinger**

**P1**

- ⬜ **/demos/newplan/[steg]**
- ⬜ **/demos/ny-okt/[steg]**
- ⬜ **/demos/plan-bygger**
- ⬜ **/demos/plan-bygger/[steg]**
- ⬜ **/demos/trackman-import/[steg]**
- ⬜ **/meg**

**P2**

- ⬜ **/auth/check-email**
- ⬜ **/auth/onboarding/forelder**
- ⬜ **/auth/samtykke-venter**
- ↪︎ **/inviter/forelder/[token]**
- ⬜ **/onboard/coach**
- ⬜ **/onboard/klubb**

**P3**

- ✅ **/auth/bankid**
- ⬜ **/auth/forgot-password**
- ⬜ **/auth/guardian-consent/[token]**
- ⬜ **/auth/logget-ut**
- ✅ **/auth/login**
- ✅ **/auth/onboarding**
- ⬜ **/auth/reset-password**
- ✅ **/auth/signup**
- ⬜ **/design-system**
- ⬜ **/design-system-v2**
- ⬜ **/kommando**
- ⬜ **/kommando/agenter**
- ⬜ **/kommando/kalender**
- ⬜ **/kommando/oppgaver**
- ⬜ **/kommando/prosjekter**
- ⬜ **/kommando/team**
- ⬜ **/team-gfgk**
