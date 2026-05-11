# Plan: Designe de 133 manglende skjermene

**Sist oppdatert:** 2026-05-11

## Mål

Designe **133 manglende skjermer** og få dem produksjons-klare for React-implementering.

## Strategi: hva vi lærte fra forrige runde

Forrige runde leverte 94 skjermer hvorav **57 (60 %) var broken** som "state-katalog" (flere mini-mockups stablet på samme HTML). Vi har:

1. **Ekstrahert default-state** fra 95 broken-skjermer (`screens-extracted/`) — produksjons-klare nå
2. **Diagnostisert root-årsak** — Claude Design tolket "design alle states" som "stable alle states på samme side"
3. **Skrevet `wireframe/design-batches/redesign-arketype-e/felles-instruks.md`** som eksplisitt forbyr state-katalog

**Nøkkel-grep for denne runden:** Felles-instruks lastes opp i HVER Claude Design-session FØR prompten. Da unngår vi state-katalog-problemet fra start.

---

## MVP-blokker (prioritert rekkefølge)

### MVP-blokk 1 — CoachHQ-kjerne (4 mini-batches, 17 skjermer)

Blokkerer mest for å få coach-flate i prod. Anders bruker dette daglig.

#### Mini-batch CoachHQ-A — Plan-management (5 skjermer)
- 360-profil — `batch-3-detail-tabs/01-coachhq-360-profil.md`
- Plan-builder — `batch-4-wizard-form/07-coachhq-plan-builder.md`
- Plan-detalj — `batch-3-detail-tabs/03-coachhq-plan-detalj.md`
- Plan-edit — `batch-3-detail-tabs/04-coachhq-plan-edit.md`
- Plan-templates — **MANGLER PROMPT — lages**

#### Mini-batch CoachHQ-B — Operative dashboards (5 skjermer)
- Daglig brief — `batch-7-other/14-coachhq-daglig-brief.md`
- Facilities — `batch-7-other/04-coachhq-facilities.md`
- Analytics-v2 — `batch-7-other/15-coachhq-analytics-v2.md`
- Audit — `batch-7-other/06-coachhq-audit.md`
- Reports — `batch-7-other/05-coachhq-reports.md`

#### Mini-batch CoachHQ-C — Kalender + lister (5 skjermer)
- Kalender — `batch-7-other/01-coachhq-kalender.md`
- Kapasitet — `batch-7-other/02-coachhq-kapasitet.md`
- Lag-snitt — `batch-3-detail-tabs/06-coachhq-lag-snitt.md`
- Meldinger — `batch-7-other/13-coachhq-meldinger.md`
- Oppfolgingsko — `batch-7-other/08-coachhq-oppfolgingsko.md`

#### Mini-batch CoachHQ-D — Spesial (2 skjermer)
- Talent — `batch-3-detail-tabs/05-coachhq-talent.md`
- Spiller-detalj (light) — `batch-3-detail-tabs/02-coachhq-spiller-detalj.md`

**Status:** 16 av 17 prompts finnes. **Lager Plan-templates-prompt.**

---

### MVP-blokk 2 — PlayerHQ-kjerne (3 mini-batches, 15 skjermer)

Spillerflaten — det andre kritiske produktet.

#### Mini-batch PlayerHQ-A — Mål-data (5 skjermer)
- Baner — `batch-2-list-filter/15-playerhq-baner.md`
- Mal-detalj — `batch-3-detail-tabs/10-playerhq-mal-detalj.md`
- Mal-leaderboard — `batch-2-list-filter/18-playerhq-mal-leaderboard.md`
- Test-detalj — `batch-3-detail-tabs/09-playerhq-test-detalj.md`
- TrackMan-analyse — `batch-3-detail-tabs/11-playerhq-trackman-analyse.md`

#### Mini-batch PlayerHQ-B — Coach-samhandling (5 skjermer)
- Coach-detalj — `batch-3-detail-tabs/12-playerhq-coach-detalj.md`
- Coaching-planer — `batch-2-list-filter/16-playerhq-coaching-planer.md`
- Coaching-detail — `batch-3-detail-tabs/13-playerhq-coaching-detail.md`
- Coach-notes — `batch-2-list-filter/17-playerhq-coach-notes.md`
- Notater-detalj — `batch-3-detail-tabs/14-playerhq-notater-detalj.md`

#### Mini-batch PlayerHQ-C — Wizards + kalender (5 skjermer)
- Ny-okt-wizard — `batch-4-wizard-form/09-playerhq-ny-okt-wizard.md`
- Onskeligokt — `batch-4-wizard-form/10-playerhq-onskeligokt.md`
- Coach-message-compose — `batch-4-wizard-form/11-playerhq-coach-message-compose.md`
- Tren-kalender — `batch-7-other/09-playerhq-tren-kalender.md`
- Treningsdetalj — `batch-3-detail-tabs/08-playerhq-treningsdetalj.md`

**Status:** Alle 15 prompts finnes. Klar for kjøring.

---

### MVP-blokk 3 — Modaler (5 mini-batches, 27 modaler)

Stort sett gjenbrukbart på tvers av produkter. Prioriter kjernen først.

#### Mini-batch Modal-A — Plan-modaler (6 modaler)
- NewPlanModal — `batch-2-list-filter/19-modal-new-plan.md`
- EditPlanModal — `batch-3-detail-tabs/...edit-plan.md`
- PlanApprovalModal — `batch-4-wizard-form/16-modal-plan-approval.md`
- PlanShareModal — eksisterende prompt
- PlanActionDetailModal — eksisterende prompt
- TemplateSelectorModal — `batch-2-list-filter/22-modal-template-selector.md`
- AIPlanGeneratorModal — `batch-4-wizard-form/14-modal-ai-plan-generator.md`

#### Mini-batch Modal-B — Live Session 2-4 (3 modaler)
- LiveActiveModal — eksisterende
- LiveBetweenModal — eksisterende
- LiveSummaryModal — eksisterende

#### Mini-batch Modal-C — Booking (4 modaler)
- BookSessionModal — **MANGLER PROMPT**
- RescheduleBookingModal — **MANGLER PROMPT**
- FacilityDetailModal — eksisterende prompt
- BookingConfirmationModal — `batch-4-wizard-form/18-modal-booking-confirmation.md`

#### Mini-batch Modal-D — Round/Stats/Agent (6 modaler)
- RoundDetailModal — eksisterende
- RoundInsightModal — eksisterende
- TrackManImportModal — **MANGLER PROMPT**
- ComparisonModal — eksisterende
- BulkApproveModal — `batch-2-list-filter/20-modal-bulk-approve.md`
- AgentFeedbackModal — **MANGLER PROMPT**

#### Mini-batch Modal-E — Social/Tier/Other (7 modaler)
- DrillChallengeModal — **MANGLER PROMPT**
- ChallengeDetailModal — **MANGLER PROMPT**
- LeaderboardModal — eksisterende
- MessageDetailModal — eksisterende
- NotificationCenterModal — **MANGLER PROMPT**
- PaymentModal — `batch-4-wizard-form/17-modal-payment.md`
- VideoUploadModal — **MANGLER PROMPT**

**Status:** 20 av 27 prompts finnes. **Lager 7 manglende prompts.**

---

### MVP-blokk 4 — Arketype-E redesign (2 mini-batches, 10 skjermer)

**Allerede planlagt** i `wireframe/design-batches/redesign-arketype-e/`. Kjør de 2 mini-batches som er klare:

- **redesign-A:** Live Session, Live Tapper, LiveIntroModal, Edge-live-empty, Klubb-live-scoring
- **redesign-B:** PlayerHQ Agent-pipeline, Shared Agent-pipeline-overview, Periodiserings-agent, Coach-agent-chat, Coachhq-agenter

Disse erstatter de 10 broken cap-title-skjermene i bundlen.

---

### Senere — etter MVP-blokker (kan bygges direkte i kode)

Disse trenger ikke samme designkvalitet — bygges som mal-baserte React-sider:

#### Web (akgolf.no) — 26 sider, 5 mini-batches
Forside finnes ✓. Mangler: anlegg, anlegg-detalj, blogg, blogg-artikkel, cases, case-detalj, FAQ, kontakt, priser, personvern/vilkår/cookies, jobb, junior, sponsorer, talent, tjeneste-detalj, for-klubber, for-bedrifter, sammenlign, newsletter, footer-mega, header-nav, 404, 500.

#### Booking-flyt — 28 sider, 6 mini-batches
Mangler hele flyten: tider-velger, pakke, tillegg, kunde-info (2x), spiller-info, sammendrag, betaling (Stripe + Vipps), bekreftelse, kalender (måned + uke), min-side, min-booking-detalj, fakturaer, faktura-detalj, klippekort, feil-betaling + 6 modaler/e-poster.

#### Tverrgående katalog-flater — 19 stk
Dokumentasjons-stil. Lager seg selv som "design-tokens"-sider og kan bygges direkte:
notif-taxonomy, modal-katalog, signal-typer, plan-aksjon-typer, datakilder-matrise, error-modal-katalog, loading-skeletons, confirm-dialogs, inline-editing, eksport-funksjoner, mobile-gestures, empty-states, toast-system, sidebar-patterns, topbar-breadcrumbs, onboarding-full, facility-manager, import-assistent, varslingssentral.

---

## Workflow per mini-batch

For HVER mini-batch kjører Anders:

### Steg 1 — Engang per Claude Design-session
1. Last opp 4 systemfiler:
   - `wireframe/brain/for-claude-design/branding-style-guide.html`
   - `wireframe/brain/for-claude-design/design-system-v2.md`
   - Alle 20 .woff2-filer fra `wireframe/brain/for-claude-design/fonts/`
   - **`wireframe/design-batches/redesign-arketype-e/felles-instruks.md`** ← KRITISK anti-state-katalog-regel
2. Bekreft: "Designsystem + felles-instruks lastet. Bekreft at du har lest."

### Steg 2 — Per skjerm (5 skjermer per session)
1. Last opp tilhørende wireframe fra `wireframe/screen-deck/{coachhq,playerhq,shared}/`
2. Kopier inn prompten fra `wireframe/design-batches/...-prompt.md`
3. Generer
4. Verifiser: `grep -c "cap-title\|data-screen-label"` på output skal være ≤ 1
5. Lim design-link tilbake

### Steg 3 — Etter alle 5 i mini-batch
- Si "ferdig" til meg
- Jeg verifiserer og oppdaterer tracker
- Jeg ekstraherer evt. state-katalog hvis noen sneket seg inn
- Vi går videre til neste mini-batch

---

## Tidsestimat

| MVP-blokk | Mini-batches | Skjermer | Anders' tid | Min tid |
|---|---|---|---|---|
| 1 — CoachHQ-kjerne | 4 | 17 | 3-4 t | 30 min (lage 1 prompt) |
| 2 — PlayerHQ-kjerne | 3 | 15 | 2-3 t | 0 (alle prompts finnes) |
| 3 — Modaler | 5 | 27 | 4-5 t | 1 t (lage 7 prompts) |
| 4 — Arketype-E redesign | 2 | 10 | 1-2 t | 0 (allerede laget) |
| **MVP-totalsum** | **14** | **69** | **10-14 t** | **1,5 t** |
| Senere — Web | 5 | 26 | 4 t | 0 |
| Senere — Booking | 6 | 28 | 5 t | 0 |
| Senere — Tverrgående | 3-4 | 19 | 3 t | 0 |
| **GRAND TOTAL** | **~30** | **142** | **22-26 t** | **1,5 t** |

Anders kan gjøre 2-3 mini-batches per dag. **MVP-blokker 1-4 ferdig på 5-7 arbeidsdager.**

---

## Min jobb før Anders kan starte (~1,5 timer)

1. **Lag manglende prompts (8 stk):**
   - 1 CoachHQ: Plan-templates
   - 7 modaler: BookSession, RescheduleBooking, TrackManImport, AgentFeedback, DrillChallenge, ChallengeDetail, NotificationCenter, VideoUpload

2. **Lag mini-batch-konfigurasjon (14 filer):**
   Per mini-batch: én MD-fil i `wireframe/design-batches/mvp-blokker/X-Y.md` som lister alle 5 prompts + opplastings-instrukser. Følger samme mønster som `batch-2/mini-batches/2-A.md`.

3. **Lag oppdatert felles-instruks**
   Hvis nødvendig — `redesign-arketype-e/felles-instruks.md` er bra utgangspunkt men kan utvides med flere lærdommer.

---

## Stop-conditions

Hvis Claude Design fortsatt leverer broken state-katalog selv med felles-instruks:
- **Plan B:** Hopp over Claude Design for de skjermene og la Claude Code generere React direkte fra wireframes + designsystem v2 (samme som `/hub-v2`-piloten)
- Sparer Anders tid, og produksjonskode er endemålet uansett

Beslutning gjøres etter første mini-batch (CoachHQ-A) — hvis 4/5 skjermer er rene, fortsetter vi. Hvis < 3/5 er rene, bytter vi til Plan B.
