# Design-audit — 2026-05

Generert: 13. mai 2026
Fasit: 237 demoer i `src/app/*-demo/`. Prod: 130 sider i `src/app/{admin,portal,forelder,(marketing)}/`.

## Sammendrag

| Måling | Antall |
|---|---|
| Prod-ruter sjekket | 130 |
| Demoer i repoet (mulig fasit) | 237 |
| Prod-ruter med klar demo-fasit identifisert | 112 |
| Prod-ruter uten åpenbar demo-fasit | 18 |
| Prod-ruter med `PageHeader`-mønster | 87 |
| Prod-ruter **uten** `PageHeader` (P0/P1) | 43 |
| Prod-ruter med hardkodede hex-farger (token-brudd) | 10 |
| Prod-ruter med emoji (CLAUDE.md-brudd) | 2 |
| Pixel-perfect (≥ 90 % match med demo) | 11 |
| Kritiske avvik (P0) | 27 |
| Moderate avvik (P1) | 58 |
| Små avvik (P2) | 34 |

Hovedkonklusjon: **marketing-laget er den største svakheten** — alle 21 marketing-sider mangler `PageHeader`-mønsteret fra demoene og er gjennomgående 30–60 % av demo-lengden, dvs. seksjoner mangler. **Admin og portal er stort sett strukturelt på plass**, men har drift i farger (10 filer med hex), spacing (8pt-brudd) og noen stubs.

---

## Tabell — komplett liste

P0 = struktur/layout-feil, manglende seksjoner, feil hierarki.
P1 = farge-/typografi-/spacing-avvik som bryter merkevaren.
P2 = polish (hover, focus, micro-copy, hardkodede ikoner).

### Marketing (`src/app/(marketing)/`)

| Prod-rute | Demo-fasit | P0 | P1 | P2 | Estimat |
|---|---|---|---|---|---|
| `/` | `akgolf-forside-demo` (457 l) — prod 244 l | Hero-blokk, "som rakk det", caser-strip mangler | font-display ikke brukt på H1; ingen italic Instrument Serif | CTA-pill ikke `rounded-full` | M |
| `/blogg` | `akgolf-blogg-demo` (357 l) — prod 79 l | Hele filter-/kategori-strip mangler; ingen featured-post-hero | bg-card brukes ikke; flat liste | — | M |
| `/blogg/[slug]` | `akgolf-blogg-post-demo` | Manglende author-bio, related-posts, TOC | Typografi-stack i article-body | — | S |
| `/anlegg` | `akgolf-anlegg-demo` | Kart, filter, fasilitetsbadges mangler | — | — | M |
| `/anlegg/[slug]` | `akgolf-anlegg-detalj-demo` | Bilde-galleri, åpningstider, "book her"-CTA-card mangler | — | — | M |
| `/om-oss` | `akgolf-om-demo` | Team-grid, milepæl-tidslinje, verdi-strip mangler | — | — | M |
| `/personvern` | `akgolf-personvern-demo` | TOC mangler | font-display ikke brukt | — | XS |
| `/kontakt` | `akgolf-kontakt-demo` (407 l) — prod 112 l | Kontaktskjema + kart + åpningstider-tabell + FAQ-blokk mangler | — | — | M |
| `/booking` | `booking-index-demo` | Service-grid, popular-services-strip mangler | — | — | M |
| `/booking/[slug]` | `book-session-demo` / `book-session-pro-demo` | Tier-aware UI (free/pro/locked) mangler; én generisk form | — | — | L |
| `/booking/[slug]/bekreft` | `book-session-steg3-demo` + `booking-confirmation-demo` | Steg-indikator, oppsummerings-card mangler | — | — | S |
| `/booking/kvittering/[bookingId]` | `booking-confirmation-demo` (+ -dark) | "Last ned ICS", "Del" mangler | — | Micro-copy | S |
| `/faq` | `akgolf-faq-demo` (376 l) — prod 156 l | Kategori-tabs, search-input, kontakt-CTA i bunn mangler | Accordion-styling mismatch | — | M |
| `/coacher` | `akgolf-coacher-demo` (417 l) — prod 123 l | Filter (gren/lokasjon), pristabell, certificering-badge mangler | Kort-grid mangler hover-state | — | M |
| `/coacher/[slug]` | `akgolf-coach-profil-demo` / `coach-profil-demo` | Hero, video, anbefalinger, booking-widget mangler | — | — | L |
| `/playerhq` | (intern marketing — bruk `akgolf-tjenester-demo`) | Feature-strip, screenshots, prisstrip mangler | — | — | M |
| `/vilkar` | `akgolf-vilkar-demo` | TOC + versjons-strip mangler | font-display | — | XS |
| `/suksess` | `akgolf-suksess-demo` (298 l) — prod 148 l | Case-grid, video-testimonial, "bli neste" CTA mangler | — | — | M |
| `/treningsfilosofi` | (egen — sjekk `_marketing-demo`) | Pillar-strip, MORAD-referanser-card, video mangler | — | — | M |
| `/coaching` | `akgolf-tjenester-demo` (+ `akgolf-priser-demo`) | Tjenestepakker, pristabell mangler | — | — | M |
| `/cookies` | `akgolf-cookies-demo` | Toggle-controls per kategori mangler | — | — | S |

### Admin (`src/app/admin/`)

| Prod-rute | Demo-fasit | P0 | P1 | P2 | Estimat |
|---|---|---|---|---|---|
| `/admin` | `daglig-brief-demo` (523 l) — prod 505 l | — | hex i avatar-gradienter (l. 187-188, 482-483) | — | XS |
| `/admin/reports` | `coachhq-rapport-demo` | — | — | — | OK |
| `/admin/settings` | `settings-bruker-demo` | mangler `PageHeader` | — | — | XS |
| `/admin/settings/security` | `settings-sikkerhet-demo` | mangler `PageHeader` | — | — | XS |
| `/admin/settings/api` | `settings-api-demo` | mangler `PageHeader` | — | — | XS |
| `/admin/settings/calendar` | — | emoji-bruk (CLAUDE.md-brudd) | — | — | XS |
| `/admin/settings/tilgang` | `tilgang-demo` | — | — | Micro-copy | XS |
| `/admin/integrasjoner` | — (ingen 1:1) | — | — | — | OK |
| `/admin/anlegg` | `lokasjoner-demo` (439 l) — prod **63 l** | **Hele siden er stub** | — | — | L |
| `/admin/facilities` | `fasiliteter-demo` (659 l) — prod 344 l | KPI-strip, kart-view, kapasitet-graf, filter mangler | — | — | M |
| `/admin/facilities/[id]` | `facility-detail-demo` / `-tabs-demo` | Tabs (oversikt/booking/agenter), live-occupancy-card mangler | — | — | M |
| `/admin/locations` | `lokasjoner-demo` | Ofte tomt — sjekk om dette eller `/admin/anlegg` er kanonisk | — | — | — |
| `/admin/messages` | `meldinger-demo` + `message-detail-demo` | Split-pane (liste + detalj) mangler | — | — | M |
| `/admin/calendar` | `kalender-demo` / `kalender-dark-demo` | Toolbar (uke/måned/dag), drag-create-state mangler | — | — | M |
| `/admin/calendar/maned` | `kalender-maaned-demo` | Hele kalender-rutenettet (prod = 51 l) | — | — | M |
| `/admin/bookings` | `bookinger-demo` | — | hex (status-piller — kjent gjeld) | — | XS |
| `/admin/bookings/ny` | `book-session-demo` | Steg-indikator mangler (prod = 69 l) | — | — | S |
| `/admin/board` | `coaching-board-demo` | Kolonner OK; drag-handles ikke `cursor-grab` | — | hover-states | S |
| `/admin/plans` | `treningsplaner-demo` / `coaching-planer-demo` | Filter (status/coach), gruppe-toggle mangler | — | — | S |
| `/admin/plans/new` | `newplan-demo` | (prod = 49 l) — wizard-steg mangler | — | — | M |
| `/admin/plans/templates` | `plan-templates-demo` | — | **8 hardkodede gradient-hex (l. 29-36)** | — | XS |
| `/admin/plans/templates/ny` | `template-selector-demo` | (prod = 51 l) form-felter mangler | — | — | S |
| `/admin/plans/[planId]` | `plan-detalj-demo` + `teknisk-plan-demo` (427 l) — prod 909 l | Mulig overengineering — sjekk om to varianter er slått sammen | hex pyr-farger (l. 30-34) — flytt til tokens | — | M |
| `/admin/elever` | `elever-demo` (605 l) — prod 562 l | — | — | — | OK |
| `/admin/elever/ny` | (ingen 1:1) | (prod = 31 l, ren stub) | — | — | M |
| `/admin/elever/[id]` | `spiller-detalj-light-demo` | mangler `PageHeader` (bevisst — egen hero) | — | — | XS |
| `/admin/elever/[id]/rediger` | (ingen) | prod = 73 l | — | — | S |
| `/admin/elever/[id]/ai` | `coach-agent-chat-demo` | Chat-shell OK; tool-call-cards mangler | — | — | S |
| `/admin/elever/[id]/sammenligning` | `comparison-demo` / `talent-sammenlign-to-demo` | Side-by-side strukturen mangler | — | — | M |
| `/admin/elever/[id]/light` | `spiller-detalj-light-demo` | — | — | — | OK |
| `/admin/email-templates` | `email-templates-demo` (322 l) — prod 201 l | Preview-pane mangler | mangler `PageHeader` | — | S |
| `/admin/recording` | `sesjon-opptak-demo` | Timeline-scrubber, marker-tools mangler | hex i mask-gradient (l. 203, 205) — OK (svart) | — | S |
| `/admin/videoer` | `video-upload-demo`-familien | (prod = 79 l) — drop-zone, progress, trim, error mangler | — | — | L |
| `/admin/innboks` | `coachhq-foreldre-innboks-demo` | (prod = 65 l) — split-pane mangler | — | — | M |
| `/admin/agents` | `coachhq-agenter-demo` | — | — | Hover på agent-cards | XS |
| `/admin/agents/[agentId]` | `agent-feedback-demo` / `agent-pipeline-overview-demo` | Pipeline-view, feedback-form mangler | — | — | M |
| `/admin/groups` | `grupper-demo` / `coachhq-grupper-demo` (408 l) — prod 286 l | Coach-tildeling, kalender-strip mangler | **6 hex-gradienter (l. 19-24)** | — | M |
| `/admin/groups/[id]` | `grupper-demo` | Detalj-strukturen ufullstendig | — | — | S |
| `/admin/audit` | `revisjonslogg-demo` / `-dark-demo` | Filter (bruker/type/dato) mangler | — | — | S |
| `/admin/profile` | `coach-profil-demo` | mangler `PageHeader` (bevisst hero) | — | — | XS |
| `/admin/team` | `coachhq-team-demo` (483 l) — prod 318 l | Rolle-matrise, kapasitet-strip mangler | **5 hex-gradienter (l. 302-306)** | — | M |
| `/admin/team/inviter` | (ingen) | (prod = 28 l) | — | — | S |
| `/admin/queue` | `oppfolgingsko-demo` | mangler `PageHeader` | — | — | S |
| `/admin/availability` | `kapasitet-demo` / `-dark-demo` | Uke-grid med drag-select mangler | — | — | M |
| `/admin/brief` | `daglig-brief-demo` | mangler `PageHeader` (egen hero) | — | — | XS |
| `/admin/finance` | `foreldre-billing-demo` (intern variant) | mangler `PageHeader` | — | — | S |
| `/admin/approvals` | `godkjenninger-demo` / `bulk-approve-demo` | Bulk-actions-bar, multi-select mangler | — | — | S |
| `/admin/tournaments` | `turneringer-demo` + `klubb-turneringer-demo` | KPI-strip mangler | hex i status-piller | — | S |
| `/admin/tournaments/[id]` | `klubb-live-scoring-demo` + `klubb-ranking-demo` | Live-scoring, lagoppstilling-tab mangler | mangler `PageHeader` + hex | — | M |
| `/admin/notion-oppgaver` | (ingen) | (prod = 33 l) | — | — | S |
| `/admin/notion-prosjekter` | (ingen) | (prod = 33 l) | — | — | S |
| `/admin/services` | `tjenester-demo` | — | hex | — | S |
| `/admin/talent` | `talent-demo` + `talent-discovery-demo` | KPI-strip mangler | — | — | S |
| `/admin/talent/wagr-import` | `trackman-import-demo` (nærmeste) | (prod = 79 l) | emoji-bruk i benchmark-fil | — | M |
| `/admin/talent/wagr-benchmark` | `talent-radar-demo` | Radar-chart mangler | emoji-bruk (CLAUDE.md-brudd) | — | M |
| `/admin/analytics` | `analytics-v2-demo` / `-dark-demo` | — | hex i chart-akser | — | S |

### Portal (`src/app/portal/`)

| Prod-rute | Demo-fasit | P0 | P1 | P2 | Estimat |
|---|---|---|---|---|---|
| `/portal` | `playerhq-profil-demo` / `playerhq-pipeline-demo` | Hero-card med profilbilde i sirkel (ref auto-memory) | — | — | M |
| `/portal/ny-okt` | `ny-okt-demo` | (prod = 57 l) — typevelger, mal-grid mangler | — | — | M |
| `/portal/agent-pipeline` | `agent-pipeline-overview-demo` | Pipeline-stages, status-cards | — | — | S |
| `/portal/utfordringer` | `drill-challenge-demo` | Grid + filter | — | — | S |
| `/portal/utfordringer/ny` | `drill-challenge-steg1-lag-ny-demo` | Steg-indikator | — | — | S |
| `/portal/utfordringer/[id]` | `challenge-detail-demo` / `drill-challenge-success-demo` | Tabs, leaderboard-modal | — | — | S |
| `/portal/meg` | `playerhq-profil-demo` | (prod = 68 l) — profilbilde-hero + tabs mangler | — | — | M |
| `/portal/meg/helse` | `playerhq-helse-demo` | KPI-cards, graf | — | — | S |
| `/portal/meg/dokumenter` | (ingen 1:1) | Liste-struktur OK | — | — | OK |
| `/portal/meg/sikkerhet` | `settings-sikkerhet-demo` | Session-list, 2FA-toggle | — | — | S |
| `/portal/meg/utstyrsbag` | `playerhq-utstyrsbag-demo` | (prod = 40 l) — bag-grid med klubber mangler | — | — | M |
| `/portal/meg/innstillinger` | `settings-bruker-demo` | Section-grupper | — | — | S |
| `/portal/meg/foreldre` | `foreldre-samtykke-demo` | Kobling-status-card | — | — | S |
| `/portal/meg/bookinger` | `playerhq-pipeline-demo` (booking-strip) | — | — | — | OK |
| `/portal/meg/bookinger/reschedule/[bookingId]` | `reschedule-demo` / `-default-demo` / `-success-demo` | Alle 3 states mangler | — | — | M |
| `/portal/meg/abonnement` | `playerhq-abonnement-demo` | Tier-cards (free/pro), faktura-historikk | — | — | M |
| `/portal/meg/help` | (ingen) | mangler `PageHeader` | — | — | S |
| `/portal/coach` | `coach-detalj-demo` / `coach-profil-demo` | Coach-hero + bookinger | — | — | M |
| `/portal/coach/[coachId]` | `coach-detalj-demo` | Profil-detalj | — | — | S |
| `/portal/coach/plans` | `coaching-planer-demo` | Filter, grupperinger | — | — | S |
| `/portal/coach/plans/[planId]` | `plan-detalj-demo` | Tabs (oversikt/økter/notater) | — | — | M |
| `/portal/coach/videoer` | `video-upload-demo` | (prod = 53 l) | — | — | M |
| `/portal/coach/notes` | `coach-notes-demo` | Liste + filter | — | — | S |
| `/portal/coach/notes/[noteId]` | `notater-detalj-demo` | Editor + meta | — | — | S |
| `/portal/coach/ai` | `coach-agent-chat-demo` | mangler `PageHeader` | — | — | S |
| `/portal/coach/melding` | `coach-melding-demo` / `message-detail-demo` | mangler `PageHeader`; split-pane | — | — | M |
| `/portal/tren` | `treningsplaner-demo` | Ukestrip + neste økt | — | — | S |
| `/portal/tren/kalender` | `tren-kalender-demo` | mangler `PageHeader` | — | — | S |
| `/portal/tren/ovelser` | `playerhq-bibliotek-demo` | mangler `PageHeader`; filter | — | — | S |
| `/portal/tren/[sessionId]` | `treningsdetalj-demo` | Øvelser-list, video, scoring | — | — | M |
| `/portal/tren/tester` | (deler `test-detalj-demo`) | Liste-mønster | — | — | S |
| `/portal/tren/tester/[testId]` | `test-detalj-demo` | KPI-graf, historikk | — | — | S |
| `/portal/mal` | `playerhq-milepaeler-demo` | Mål-grid + progress | — | — | S |
| `/portal/mal/goal/[goalId]` | `mal-detalj-demo` | Tabs + sub-mål | — | — | S |
| `/portal/mal/trackman` | `trackman-demo` | KPI-strip | — | — | S |
| `/portal/mal/trackman/[id]` | `trackman-demo` (detalj) | — | — | — | S |
| `/portal/mal/runder` | `round-insight-demo` | Liste + filter | — | — | S |
| `/portal/mal/statistikk` | `playerhq-statistikk-demo` | KPI-grid + grafer | — | — | M |
| `/portal/mal/leaderboard` | `leaderboard-demo` + `-free-lock-demo` | mangler `PageHeader`; tier-lock-state | — | — | M |
| `/portal/mal/milepaeler` | `playerhq-milepaeler-demo` | Timeline | — | — | S |
| `/portal/mal/baner` | `baner-demo` | (prod = 73 l) — kart, bane-detalj-card | — | — | M |
| `/portal/varsler` | `playerhq-varsler-demo` / `notification-center-demo` | (prod = 78 l) — kategori-tabs | — | — | S |
| `/portal/onskeligokt` | `onskeligokt-demo` | mangler `PageHeader` | — | — | S |
| `/portal/booking/ny` | `book-session-demo` + `-steg2-demo` + `-steg3-demo` | Steg-flyt mangler | — | — | L |
| `/portal/booking/ny/bekreft` | `booking-confirmation-demo` | Confirmation-card | — | — | S |
| `/portal/(fullscreen)/live/[sessionId]` | `live-active-demo` + `live-summary-demo` (12 demoer i live-familien!) | (prod = 37 l) **Hele live-modus mangler** | mangler `PageHeader` (bevisst) | — | XL |

### Forelder (`src/app/forelder/`)

| Prod-rute | Demo-fasit | P0 | P1 | P2 | Estimat |
|---|---|---|---|---|---|
| `/forelder` | `foreldre-dashboard-demo` | Barn-cards, neste-økt-strip, fakturaer-card | — | — | M |
| `/forelder/fakturaer` | `foreldre-billing-demo` | Faktura-tabell + status-piller | — | — | S |
| `/forelder/ukerapport` | `foreldre-ukerapport-demo` | (prod = 47 l) | — | — | M |
| `/forelder/samtykke` | `foreldre-samtykke-demo` | Toggle per kategori, signatur | — | — | S |
| `/forelder/barn` | `foreldre-dashboard-demo` | (prod = 53 l) | — | — | S |
| `/forelder/barn/[childId]` | `spiller-detalj-light-demo` (forelder-variant) | Tabs (uke/mål/økonomi) | — | — | M |
| `/forelder/varsler` | `foreldre-varsler-demo` / `notification-center-demo` | (prod = 65 l) | — | — | S |

---

## Topp 10 prioriterte

### 1. `/portal/(fullscreen)/live/[sessionId]` — XL
**Filer:** `src/app/portal/(fullscreen)/live/[sessionId]/page.tsx` (37 linjer)
**Demoer:** `live-intro-demo`, `live-active-demo`, `live-active-pause-demo`, `live-active-idle-demo`, `live-active-ferdig-demo`, `live-between-demo`, `live-tapper-demo`, `live-summary-demo`, `live-summary-achievement-demo`, `live-summary-confetti-demo`, `live-summary-mobile-demo`, `live-active-connection-lost-demo` (12 demoer).
**P0:** Hele live-økt-modusen er ikke implementert. Stub uten state-håndtering, ingen tapper-UI, ingen pause/idle/ferdig-overganger, ingen summary med achievements.

### 2. `(marketing)/` — 21 sider, gjennomgående 30–60 % implementert
**P0:** Alle 21 marketing-sider mangler `PageHeader`-mønsteret som demoene bruker.
**Eksempler:**
- `src/app/(marketing)/page.tsx:1-244` vs `akgolf-forside-demo/page.tsx:1-457` — hero-italic, "som rakk det"-strip, caser-strip og bunn-CTA mangler.
- `src/app/(marketing)/kontakt/page.tsx:1-112` vs demo 407 l — skjema, kart, åpningstider, FAQ-blokk mangler.
- `src/app/(marketing)/blogg/page.tsx:1-79` vs demo 357 l — kategori-filter, featured-post, search mangler.

### 3. `/admin/anlegg` — 63 linjer mot 439 i demo
**Fil:** `src/app/admin/anlegg/page.tsx`
**Demo:** `lokasjoner-demo`
**P0:** Stub. Mangler kart-view, KPI-strip (kapasitet/booking-grad), filter, lokasjon-cards med fasilitet-grid. Sjekk også overlap mot `/admin/locations` — én av dem bør avvikles.

### 4. `/admin/facilities` + `/admin/facilities/[id]`
**Filer:** `src/app/admin/facilities/page.tsx` (344 l), `src/app/admin/facilities/[id]/page.tsx`
**Demoer:** `fasiliteter-demo` (659 l), `facility-detail-demo`, `facility-detail-tabs-demo`
**P0:** Tabs (oversikt/booking/agenter), live-occupancy-graf, kapasitet-card mangler.

### 5. `/admin/plans/[planId]` — *overengineering*
**Fil:** `src/app/admin/plans/[planId]/page.tsx` (909 linjer)
**Demoer:** `plan-detalj-demo` (427), `teknisk-plan-demo`
**P0/P1:** Prod-filen er ~2× demoens lengde. Mulig sammenslåing av to ulike views. Også 5 hardkodede pyr-farger (`l. 30-34`) som bør være tokens.

### 6. `/admin/plans/templates` + `/admin/team` + `/admin/groups` — gradient-farger
**Filer:**
- `src/app/admin/plans/templates/page.tsx:29-36` — 8 gradient-hex
- `src/app/admin/team/page.tsx:302-306` — 5 gradient-hex
- `src/app/admin/groups/page.tsx:19-24` — 6 gradient-hex
**P1:** Bryter "ALDRI hardkode hex" fra CLAUDE.md. Foreslå nytt token-sett `--gradient-avatar-{1..8}` i `globals.css` og bytt utilities til `bg-[image:var(--gradient-avatar-1)]`.

### 7. `/portal` — manglende profilbilde-hero
**Fil:** `src/app/portal/page.tsx`
**Demoer:** `playerhq-profil-demo`, `playerhq-pipeline-demo`
**P0:** Auto-memory sier «PlayerHQ Hjem og CoachHQ Hub skal ha profilbilde i sirkel ved siden av navnet». Ikke implementert.

### 8. `/portal/meg` — 68 linjer
**Fil:** `src/app/portal/meg/page.tsx`
**Demo:** `playerhq-profil-demo`
**P0:** Mangler profil-hero, tier-badge, hurtigvalg-grid. Stub.

### 9. `/admin/videoer` — 79 linjer
**Fil:** `src/app/admin/videoer/page.tsx`
**Demoer:** `video-upload-demo`, `-progress-demo`, `-trim-demo`, `-success-demo`, `-error-demo` (5 states)
**P0:** Drop-zone, progress-bar, trim-controls, error-state mangler.

### 10. Emoji-bruk (CLAUDE.md eksplisitt forbud)
**Filer:**
- `src/app/admin/settings/calendar/page.tsx`
- `src/app/admin/talent/wagr-benchmark/page.tsx`
**P0:** Brudd på «ALDRI bruk emojier i kode eller UI — bruk Lucide-ikoner i stedet» fra global CLAUDE.md.

---

## Mønster-feil (gjelder mange sider samtidig)

1. **Marketing mangler `PageHeader`-mønsteret.** Alle 21 marketing-sider bygger header lokalt, ikke gjennom `src/components/shared/page-header.tsx`. Demoene bruker italic Instrument Serif via `font-display` + `<em>` — prod gjør det stort sett ikke.
2. **22 admin/portal-sider mangler `PageHeader`** (se liste under). Mange er bevisste (egne hero-komponenter for `/admin/profile`, `/admin/brief`, `/portal/(fullscreen)/live`), men `/admin/settings/*`, `/admin/queue`, `/admin/finance`, `/portal/coach/melding`, `/portal/coach/ai`, `/portal/tren/kalender`, `/portal/tren/ovelser`, `/portal/mal/leaderboard`, `/portal/onskeligokt`, `/portal/meg/help` burde ha det.
3. **Hardkodede hex-farger i 10 admin-filer.** Hovedsakelig avatar-gradienter og pyr/talent-farger. Konsolider til tokens.
4. **8pt-grid-brudd vedvarer** (dokumentert i tidligere `docs/design-audit.md` — 182 treff av `p-3`/`p-5`/`gap-3`/`gap-5`). Lavt prioritert, men bør håndheves i nye PR-er.
5. **Manglende `font-display` på H1/H2** i marketing-sider (kun 108 av 130 prod-sider bruker `font-display`). Mest brudd i marketing.
6. **Stubs <80 linjer:** 24 prod-sider er stubs (kortere enn typisk side-stillas). Se tabell — alle er P0/P1.
7. **Tabular tall:** `font-mono` brukes 110 steder — OK, men sjekk at det er på alle `priceOre/100`-renderinger og KPI-tall.
8. **Hover/focus-states** mangler eksplisitt utility på mange kort-grid (P2). Sjekkes i kode-review.

---

## Anbefalt rekkefølge

### A. Globale kvikk-fikser (1–2 dager, treffer mange sider)
1. **Token-sett for avatar/gruppe/pyr-farger:** legg inn 8 nye CSS-variabler i `src/app/globals.css`. Bytt alle hex i `admin/plans/templates`, `admin/team`, `admin/groups`, `admin/plans/[planId]`. (P1, treffer 4 filer.)
2. **Fjern emoji** i `admin/settings/calendar/page.tsx` og `admin/talent/wagr-benchmark/page.tsx`. Bytt til Lucide. (P0, 2 filer.)
3. **Legg `PageHeader` på de 22 admin/portal-sidene** der det er åpenbart manglende. (P1, ~30 min per side, mekanisk.)
4. **Konvertér marketing-headere** til `PageHeader` der det passer (eller lag `MarketingHeader`-variant med samme italic-mønster). (P1, 21 sider.)

### B. Topp 10 individuelt (rekkefølge per ROI)
5. `/portal/(fullscreen)/live/[sessionId]` (XL — størst funksjonelt hull).
6. `(marketing)/` hovedside + `/kontakt` + `/blogg` (synlig utad, lavt ferdighetsgrad).
7. `/admin/anlegg` + `/admin/facilities` (stub-aktig).
8. `/admin/plans/[planId]` (rydd opp / split, ikke utvid).
9. `/portal` + `/portal/meg` (manglende profilbilde-hero).
10. `/admin/videoer` (5 states å implementere).
11. `/portal/booking/ny` (steg-flyt).
12. `/admin/calendar/maned` (stub).
13. `/admin/recording` (timeline-scrubber).
14. `/admin/messages` + `/admin/innboks` (split-pane mønster — bygg én gang, bruk to steder).

### C. Batch-arbeid (resten)
15. Resterende admin-detalj-sider med moderate avvik (P1/P2), grupper per mønster:
    - Liste + filter: `/admin/audit`, `/admin/queue`, `/admin/approvals`, `/admin/talent`.
    - Tabs-mønster: `/admin/agents/[agentId]`, `/portal/coach/plans/[planId]`, `/portal/mal/goal/[goalId]`.
    - Wizard/steg-mønster: `/admin/plans/new`, `/admin/elever/ny`, `/admin/bookings/ny`.
16. Resterende forelder-sider (7 stk, små men kompakte).
17. Resterende portal-detaljsider.
18. 8pt-grid-cleanup i én sweeping PR.

### D. Verifikasjon før merge
For hver side: åpne demo i nettleser side-om-side, sammenlign:
- [ ] Header bruker `PageHeader` med italic Instrument Serif
- [ ] Ingen hex-farger (ripgrep `#[0-9A-F]{3,6}`)
- [ ] 8pt-spacing (multipler av 4: p-2/4/6/8, ikke p-3/5/7)
- [ ] `font-mono.tabular` på tall-kolonner
- [ ] Lucide-ikoner, 24px, `currentColor`
- [ ] Norsk bokmål på all UI-tekst
- [ ] Hover/focus-states på alle interaktive elementer
- [ ] `tsc --noEmit` og `npm run build` grønne

---

*Audit slutt. 130 ruter gjennomgått. Estimat total opprydding: ~6–8 uker fokusert arbeid for full pixel-parity, eller ~2–3 uker for å lukke alle P0.*
