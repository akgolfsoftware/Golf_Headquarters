# AK Golf Platform — Design Tracker

**Sist oppdatert:** 2026-05-10 (Fase B fullført)

## ✓ Fase B status — alle wireframes ferdige

| Kategori | Status etter Fase B |
|---|---|
| CoachHQ-skjermer | 42 av 42 WIREFRAME (var 31 — la til 11) |
| PlayerHQ-skjermer | 30 av 30 WIREFRAME (var 24 — la til 6) |
| Auth + System | 8 av 8 WIREFRAME |
| Tverrgående hovedflater | 25 av 25 WIREFRAME (var 0) |
| Modaler | 28 av 28 WIREFRAME (var 0) |
| State-katalog | 12 av 12 WIREFRAME (var 2) |
| Web (akgolf.no) | 30 av 30 WIREFRAME (var 0) |
| Booking-flyt | 24 hovedsider + 6 modaler/e-poster = 30 av 30 WIREFRAME (var 0) |
| **TOTAL HTML-wireframes** | **203 av 203 WIREFRAME** ✓ |

Alle skjermer er klare som visuelle referanser i claude.ai/design.
Sjekk live-deck: åpne `wireframe/screen-deck/index.html` i nettleser.

---

## Original tracker

Dette er sannhetskilden for hvor hver designe-enhet er i pipelinen.
**Statusverdier:**

- `WIREFRAME_NEEDED` — ingen HTML-wireframe ennå (må lages i Fase B)
- `WIREFRAME` — HTML-fil eksisterer i `wireframe/screen-deck/`
- `SPEC_NEEDED` — funksjonell spec mangler (må gjøre spec-sesjon før wireframe)
- `IN_DESIGN` — aktiv i claude.ai/design
- `REVIEW` — venter på godkjenning fra Anders
- `APPROVED` — godkjent, klar for kode
- `IN_CODE` — kode under bygging
- `LIVE` — deployed

---

## Sammendrag

| Kategori | Totalt | WIREFRAME | WIREFRAME_NEEDED | SPEC_NEEDED | APPROVED |
|---|---|---|---|---|---|
| CoachHQ-skjermer | 37 | 31 | 6 | 5 | 0 |
| PlayerHQ-skjermer | 22 | 24* | 0 | 1 | 0 |
| Auth + System | 8 | 8 | 0 | 0 | 0 |
| Tverrgående hovedflater | 25 | 0 | 25 | 0 | 0 |
| Modaler | 28 | 0 | 28 | 0 | 0 |
| State-katalog | 12 | 2 | 10 | 0 | 0 |
| Web (akgolf.no) | 30 | 0 | 30 | 0 | 0 |
| Booking-flyt | 30 | 0 | 30 | 0 | 0 |
| **TOTAL** | **192** | **65** | **129** | **6** | **0** |

\* Noen PlayerHQ-skjermer i deck er bonus-varianter (live-tapper, agent-pipeline) som ikke er separate i inventory.

> **MERK ETTER AUDIT (2026-05-10):** Klikkbarhets-audit av alle 63 HTML-skjermer avdekket
> **~131 nye modaler** utover de 28 listet under §5. Etter konsolidering (generic-komponenter)
> blir det **~95 unike modaler totalt**. Komplett liste i [`audit/SUMMARY.md`](audit/SUMMARY.md).
>
> Modal-tabellen i §5 forblir kjernebatchen som designes først (Tier 1+2). Utvidet katalog
> rulles inn i Fase B2 batchvis.

---

## 1. CoachHQ — 37 skjermer

| # | Skjerm | URL | Arketype | HTML-fil | Status | Design-link | Godkjent | Notater |
|---|---|---|---|---|---|---|---|---|
| 1 | Hub Dashboard | /admin/hub | A | coachhq/hub.html | WIREFRAME | — | — | — |
| 2 | Daglig Brief | /admin/brief | A | — | SPEC_NEEDED | — | — | Personaliseringsmotor uspes |
| 3 | Treningsplaner (liste) | /admin/plans | B | coachhq/plans.html | WIREFRAME | — | — | Kanban-variant |
| 4 | Plan-detalj | /admin/plans/:id | C | coachhq/plan-detalj.html | WIREFRAME | — | — | IP — hand-crafted |
| 5 | Ny plan-wizard (plan-builder) | /admin/plans/new | D | coachhq/plan-builder.html | WIREFRAME | — | — | 6 steg |
| 6 | Plan-edit | /admin/plans/:id/edit | C | coachhq/plan-edit.html | WIREFRAME | — | — | — |
| 7 | Plan-maler | /admin/plans/templates | B | coachhq/plan-templates.html | WIREFRAME | — | — | — |
| 8 | Periodiserings-agent | /admin/agents/periodisering | E | coachhq/periodisering-agent.html | WIREFRAME | — | — | Diff-view IP |
| 9 | Kalender | /admin/calendar | G | — | WIREFRAME_NEEDED | — | — | Måneds/uke-view |
| 10 | Kapasitet | /admin/capacity | G | — | WIREFRAME_NEEDED | — | — | Hovedview ok i spec |
| 11 | Økter | /admin/sessions | B | coachhq/sessions.html | WIREFRAME | — | — | — |
| 12 | Elever (spillerliste) | /admin/elever | B | coachhq/elever.html | WIREFRAME | — | — | 38 spillere |
| 13 | 360-profil | /admin/elever/:id | C | coachhq/360-profil.html | WIREFRAME | — | — | IP |
| 14 | Spiller-detalj (light) | /admin/elever/:id/light | C | coachhq/spiller-detalj.html | WIREFRAME | — | — | Hurtigvisning |
| 15 | Coaching Board | /admin/board | G | — | WIREFRAME_NEEDED | — | — | Kanban-flyt |
| 16 | Godkjenninger | /admin/approvals | B | coachhq/approvals.html | WIREFRAME | — | — | Agent-inbox |
| 17 | Oppfølgingskø | /admin/queue | B | — | SPEC_NEEDED | — | — | Konsept uspes |
| 18 | Talent | /admin/talent | C | coachhq/talent.html | WIREFRAME | — | — | A1-A5 |
| 19 | Lag-snitt | /admin/lag-snitt | C | coachhq/lag-snitt.html | WIREFRAME | — | — | Sammenligning |
| 20 | Analytics | /admin/analytics | A | coachhq/analytics.html | WIREFRAME | — | — | — |
| 21 | Analytics v2 | /admin/analytics/v2 | A | coachhq/analytics-v2.html | WIREFRAME | — | — | Stallen samlet |
| 22 | Rapporter | /admin/reports | B | coachhq/reports.html | WIREFRAME | — | — | — |
| 23 | Turneringer | /admin/tournaments | B | coachhq/tournaments.html | WIREFRAME | — | — | Kalender + lanes |
| 24 | Bookinger | /admin/bookings | B | coachhq/bookings.html | WIREFRAME | — | — | Uke-kalender |
| 25 | Tilgjengelighet | /admin/availability | F | — | WIREFRAME_NEEDED | — | — | Coach-kalender-styring |
| 26 | Tjenester | /admin/services | B | coachhq/services.html | WIREFRAME | — | — | — |
| 27 | Økonomi | /admin/finance | A | coachhq/finance.html | WIREFRAME | — | — | — |
| 28 | Fasiliteter | /admin/facilities | A | coachhq/facilities.html | WIREFRAME | — | — | Live status |
| 29 | Lokasjoner | /admin/locations | B | coachhq/locations.html | WIREFRAME | — | — | Anlegg + kart |
| 30 | Team | /admin/team | B | coachhq/team.html | WIREFRAME | — | — | 4 coaches |
| 31 | Grupper | /admin/groups | B | coachhq/groups.html | WIREFRAME | — | — | 6 grupper |
| 32 | Meldinger | /admin/messages | B | — | WIREFRAME_NEEDED | — | — | Liste + compose |
| 33 | E-postmaler | /admin/email-templates | B | coachhq/email-templates.html | WIREFRAME | — | — | 18 maler |
| 34 | Agenter (admin) | /admin/agents | G | — | WIREFRAME_NEEDED | — | — | Agent-pipeline-visning |
| 35 | Teknisk Plan | /admin/teknisk-plan | C | — | WIREFRAME_NEEDED | — | — | Sub-skjermer mangler |
| 36 | Coach-profil | /admin/profile | F | coachhq/coach-profil.html | WIREFRAME | — | — | Anders' egen |
| 37 | Bruker-innstillinger | /admin/settings | F | coachhq/settings-bruker.html | WIREFRAME | — | — | Profil |
| 38 | Sikkerhet | /admin/settings/security | F | coachhq/settings-sikkerhet.html | WIREFRAME | — | — | 2FA |
| 39 | API-nøkler | /admin/settings/api | F | coachhq/settings-api.html | WIREFRAME | — | — | Webhooks |
| 40 | Revisjonslogg (Audit) | /admin/audit | B | coachhq/audit.html | WIREFRAME | — | — | Timeline |
| 41 | Sesjon-opptak | /admin/recording | E | — | SPEC_NEEDED | — | — | Deepgram pipeline |
| 42 | Coach-agent chat | /admin/elever/:id/ai | E | — | SPEC_NEEDED | — | — | AI chat i 360-profil |

---

## 2. PlayerHQ — 24 skjermer

| # | Skjerm | URL | Arketype | HTML-fil | Status | Design-link | Godkjent | Notater |
|---|---|---|---|---|---|---|---|---|
| 1 | Hjem-dashboard | /portal/hjem | A | playerhq/hjem.html | WIREFRAME | — | — | Markus |
| 2 | Mål-oversikt | /portal/mal | A | playerhq/mal-oversikt.html | WIREFRAME | — | — | — |
| 3 | Treningsplan | /portal/tren/plan | C | playerhq/treningsplan.html | WIREFRAME | — | — | IP |
| 4 | Ny økt-wizard | /portal/sessions/new | D | playerhq/ny-okt-wizard.html | WIREFRAME | — | — | 6 steg IP |
| 5 | Øvelser | /portal/tren/ovelser | B | playerhq/ovelser.html | WIREFRAME | — | — | Bibliotek |
| 6 | Tester | /portal/tren/tester | B | playerhq/tester.html | WIREFRAME | — | — | NGF + egne |
| 7 | Test-detalj | /portal/tren/tester/:id | C | playerhq/test-detalj.html | WIREFRAME | — | — | Last vs best IP |
| 8 | Treningsdetalj | /portal/sessions/:id | C | playerhq/treningsdetalj.html | WIREFRAME | — | — | Post-økt |
| 9 | Live Session | /portal/live/:id | E | playerhq/live-session.html | WIREFRAME | — | — | Tap-mode |
| 10 | Live Tapper | /portal/live/:id/tapper | E | playerhq/live-tapper.html | WIREFRAME | — | — | Range-mode |
| 11 | Mål-detalj | /portal/mal/:id | C | playerhq/mal-detalj.html | WIREFRAME | — | — | HCP-trend IP |
| 12 | Runder | /portal/mal/runder | B | playerhq/runder.html | WIREFRAME | — | — | 14 runder |
| 13 | TrackMan | /portal/mal/trackman | B | playerhq/trackman.html | WIREFRAME | — | — | Stat-card-grid |
| 14 | TrackMan-analyse | /portal/mal/trackman/analyse | C | playerhq/trackman-analyse.html | WIREFRAME | — | — | Trender IP |
| 15 | Baner | /portal/mal/baner | B | playerhq/baner.html | WIREFRAME | — | — | 8 spilte + nye |
| 16 | Coach-detalj | /portal/coach | C | playerhq/coach-detalj.html | WIREFRAME | — | — | Anders K. |
| 17 | Coaching-planer | /portal/coach/plans | B | playerhq/coaching-planer.html | WIREFRAME | — | — | Kanban |
| 18 | Coaching-detail | /portal/coach/plans/:id | C | playerhq/coaching-detail.html | WIREFRAME | — | — | Plan fra spiller-side |
| 19 | Coach-notater | /portal/coach/notes | B | playerhq/coach-notes.html | WIREFRAME | — | — | Notat-feed |
| 20 | Notat-detalj | /portal/coach/notes/:id | C | playerhq/notater-detalj.html | WIREFRAME | — | — | Åpen tråd |
| 21 | Be om økt (ønskelig økt) | /portal/coach/request | D | playerhq/onskeligokt.html | WIREFRAME | — | — | Forespørsel |
| 22 | Meg-profil | /portal/meg | F | playerhq/meg-profil.html | WIREFRAME | — | — | — |
| 23 | Abonnement | /portal/meg/sub | F | playerhq/meg-abonnement.html | WIREFRAME | — | — | Pro · 299 kr |
| 24 | Agent-pipeline (visning) | /portal/agents | E | playerhq/agent-pipeline.html | WIREFRAME | — | — | Signal→Skill→Agent |
| 25 | Kalender (tren) | /portal/tren/kalender | G | — | WIREFRAME_NEEDED | — | — | Måneds/uke-view |
| 26 | Helse-innstillinger | /portal/meg/helse | F | — | WIREFRAME_NEEDED | — | — | Integrasjoner |
| 27 | Notif-innstillinger | /portal/meg/notif | F | — | WIREFRAME_NEEDED | — | — | Toggles uklare i spec |
| 28 | Hjelp & Support | /portal/meg/help | G | — | WIREFRAME_NEEDED | — | — | Topics + detail |
| 29 | Leaderboard | /portal/mal/leaderboard | B | — | SPEC_NEEDED | — | — | Live-feed delvis |
| 30 | Send melding (compose) | /portal/coach/message | D | — | WIREFRAME_NEEDED | — | — | Compose + history |

---

## 3. Auth + System — 8 skjermer

| # | Skjerm | URL | Arketype | HTML-fil | Status | Design-link | Godkjent | Notater |
|---|---|---|---|---|---|---|---|---|
| 1 | Logg inn | /login | D | auth/login.html | WIREFRAME | — | — | — |
| 2 | Registrer | /signup | D | auth/signup.html | WIREFRAME | — | — | — |
| 3 | Glemt passord | /forgot-password | D | auth/forgot-password.html | WIREFRAME | — | — | Reset-flow |
| 4 | 2FA-setup | /auth/2fa | D | auth/2fa-setup.html | WIREFRAME | — | — | Authenticator |
| 5 | SSO-setup | /auth/sso | D | auth/sso-setup.html | WIREFRAME | — | — | SAML for org |
| 6 | Onboarding | /onboarding | D | auth/onboarding.html | WIREFRAME | — | — | 4-step welcome |
| 7 | Loading-states | (system) | G | system/loading-states.html | WIREFRAME | — | — | Skeleton-katalog |
| 8 | Error-states | (system) | G | system/error-states.html | WIREFRAME | — | — | 8+ error-typer |

---

## 4. Tverrgående hovedflater — 25 stk

Alle disse må wireframes i Fase B3 (`screen-deck/shared/cross-cutting/`).

| # | Flate | Type | Status | HTML-fil | Notater |
|---|---|---|---|---|---|
| 1 | Agent-pipeline-overview (admin) | E | WIREFRAME_NEEDED | shared/cross-cutting/agent-pipeline-overview.html | 15 signaler, 6 skills, 5 agenter |
| 2 | Periodiserings-agent UI | E | WIREFRAME_NEEDED | shared/cross-cutting/periodiserings-agent.html | 4 lag, JSON-struktur |
| 3 | Notifikasjons-taxonomy | G | WIREFRAME_NEEDED | shared/cross-cutting/notifikasjons-taxonomy.html | 6 typer, 10+ maler |
| 4 | Modal-katalog (oversikt) | G | WIREFRAME_NEEDED | shared/cross-cutting/modal-katalog.html | 25+ modal-varianter listet |
| 5 | Innstillings-flater (layout) | F | WIREFRAME_NEEDED | shared/cross-cutting/innstillings-layout.html | Generic settings-shell |
| 6 | Onboarding-flow (komplett 4-step) | D | WIREFRAME_NEEDED | shared/cross-cutting/onboarding-full.html | Welcome wizard |
| 7 | Facility Manager dashboard | A | WIREFRAME_NEEDED | shared/cross-cutting/facility-manager.html | 5-view dashboard |
| 8 | CBAC-matrise | G | WIREFRAME_NEEDED | shared/cross-cutting/cbac-matrise.html | 6 roller × 43 capabilities |
| 9 | Datakilder-matrise | G | WIREFRAME_NEEDED | shared/cross-cutting/datakilder-matrise.html | API endpoints per skjerm |
| 10 | Signal-typer-display | G | WIREFRAME_NEEDED | shared/cross-cutting/signal-typer.html | 15 signaler |
| 11 | Plan-aksjon-typer | G | WIREFRAME_NEEDED | shared/cross-cutting/plan-aksjon-typer.html | 10 action types |
| 12 | Designsystem-tokens (visning) | G | WIREFRAME_NEEDED | shared/cross-cutting/design-tokens.html | Colors, spacing, radius |
| 13 | Tilgangskontroll-UI | G | WIREFRAME_NEEDED | shared/cross-cutting/tilgangskontroll.html | CBAC-håndtering |
| 14 | Varslingssentral / Inbox | B | WIREFRAME_NEEDED | shared/cross-cutting/varslingssentral.html | Liste + detalj |
| 15 | Import-assistenter | D | WIREFRAME_NEEDED | shared/cross-cutting/import-assistent.html | Wizards |
| 16 | Error-modal-katalog | G | WIREFRAME_NEEDED | shared/cross-cutting/error-modal-katalog.html | 8+ error-states |
| 17 | Loading-skeleton-katalog | G | WIREFRAME_NEEDED | shared/cross-cutting/loading-skeletons.html | Skeleton-bibliotek |
| 18 | Bekreftelses-dialog-katalog | G | WIREFRAME_NEEDED | shared/cross-cutting/confirm-dialogs.html | 5+ confirm-typer |
| 19 | Inline-editing-mønstre | G | WIREFRAME_NEEDED | shared/cross-cutting/inline-editing.html | Edit-states |
| 20 | Eksport-funksjoner | G | WIREFRAME_NEEDED | shared/cross-cutting/eksport-funksjoner.html | CSV/JSON/PDF |
| 21 | Mobile gesture-bibliotek | G | WIREFRAME_NEEDED | shared/cross-cutting/mobile-gestures.html | Swipe, long-press |
| 22 | Empty-state-katalog | G | WIREFRAME_NEEDED | shared/cross-cutting/empty-states.html | Per arketype |
| 23 | Toast / Notification-system | G | WIREFRAME_NEEDED | shared/cross-cutting/toast-system.html | Success/error/info |
| 24 | Sidebar-mønstre (PlayerHQ vs CoachHQ) | G | WIREFRAME_NEEDED | shared/cross-cutting/sidebar-patterns.html | Begge varianter |
| 25 | Topbar / breadcrumbs | G | WIREFRAME_NEEDED | shared/cross-cutting/topbar-breadcrumbs.html | Header-mønstre |

---

## 5. Modaler — 28 stk

Alle wireframes i Fase B2 (`screen-deck/shared/modals/`).

| # | Modal | Tilhører skjerm | Status | HTML-fil | Notater |
|---|---|---|---|---|---|
| 1 | NewPlanModal | CoachHQ Plans | WIREFRAME_NEEDED | shared/modals/new-plan.html | 4-step wizard |
| 2 | EditPlanModal | CoachHQ Plan-detalj | WIREFRAME_NEEDED | shared/modals/edit-plan.html | — |
| 3 | PlanApprovalModal | PlayerHQ Coaching-detail | WIREFRAME_NEEDED | shared/modals/plan-approval.html | Spiller godkjenner |
| 4 | PlanShareModal | CoachHQ Plan-detalj | WIREFRAME_NEEDED | shared/modals/plan-share.html | Del med gruppe |
| 5 | AIPlanGeneratorModal | CoachHQ Plans | WIREFRAME_NEEDED | shared/modals/ai-plan-generator.html | AI-basert plan |
| 6 | TemplateSelectorModal | CoachHQ Plans | WIREFRAME_NEEDED | shared/modals/template-selector.html | Velg mal |
| 7 | LiveSessionIntroModal | PlayerHQ Live | WIREFRAME_NEEDED | shared/modals/live-intro.html | Screen 1 — fullscreen |
| 8 | LiveSessionActiveModal | PlayerHQ Live | WIREFRAME_NEEDED | shared/modals/live-active.html | Screen 2 — rep-logging |
| 9 | LiveSessionBetweenModal | PlayerHQ Live | WIREFRAME_NEEDED | shared/modals/live-between.html | Screen 3 — between-exercise |
| 10 | LiveSessionSummaryModal | PlayerHQ Live | WIREFRAME_NEEDED | shared/modals/live-summary.html | Screen 4 — oppsummering |
| 11 | BookSessionModal | PlayerHQ / Booking | WIREFRAME_NEEDED | shared/modals/book-session.html | Velg dato/tid/fasilitet |
| 12 | RescheduleBookingModal | CoachHQ Bookings | WIREFRAME_NEEDED | shared/modals/reschedule-booking.html | Flytt booking |
| 13 | FacilityDetailModal | CoachHQ Fasiliteter | WIREFRAME_NEEDED | shared/modals/facility-detail.html | Side-panel |
| 14 | PlanActionDetailModal | CoachHQ Approvals | WIREFRAME_NEEDED | shared/modals/plan-action-detail.html | Agent-anbefaling |
| 15 | BulkApproveModal | CoachHQ Approvals | WIREFRAME_NEEDED | shared/modals/bulk-approve.html | Multi-godkjenning |
| 16 | AgentFeedbackModal | CoachHQ Approvals | WIREFRAME_NEEDED | shared/modals/agent-feedback.html | Coach gir feedback |
| 17 | RoundDetailModal | PlayerHQ Runder | WIREFRAME_NEEDED | shared/modals/round-detail.html | Scorecard + SG |
| 18 | RoundInsightModal | PlayerHQ Runder | WIREFRAME_NEEDED | shared/modals/round-insight.html | AI insight post-runde |
| 19 | TrackManImportModal | PlayerHQ TrackMan | WIREFRAME_NEEDED | shared/modals/trackman-import.html | CSV / OCR |
| 20 | ComparisonModal | PlayerHQ Stats | WIREFRAME_NEEDED | shared/modals/comparison.html | Egne vs peer |
| 21 | DrillChallengeModal | PlayerHQ Øvelser | WIREFRAME_NEEDED | shared/modals/drill-challenge.html | Lag eller bli med |
| 22 | ChallengeDetailModal | PlayerHQ Øvelser | WIREFRAME_NEEDED | shared/modals/challenge-detail.html | Leaderboard |
| 23 | LeaderboardModal | PlayerHQ Mål | WIREFRAME_NEEDED | shared/modals/leaderboard.html | Friends/club/global |
| 24 | MessageDetailModal | CoachHQ Meldinger | WIREFRAME_NEEDED | shared/modals/message-detail.html | Tråd-utvidelse |
| 25 | NotificationCenterModal | Tverrgående | WIREFRAME_NEEDED | shared/modals/notification-center.html | Inbox |
| 26 | BookingConfirmationModal | Booking | WIREFRAME_NEEDED | shared/modals/booking-confirmation.html | Endelig bekreftelse |
| 27 | PaymentModal | PlayerHQ Abonnement | WIREFRAME_NEEDED | shared/modals/payment.html | Tier-oppgradering |
| 28 | VideoUploadModal | PlayerHQ Live | WIREFRAME_NEEDED | shared/modals/video-upload.html | Swing-video |

---

## 6. State-katalog — 12 mønstre

| # | State | Status | HTML-fil | Notater |
|---|---|---|---|---|
| 1 | Loading-states (eksisterer) | WIREFRAME | system/loading-states.html | Skeleton-katalog |
| 2 | Error-states (eksisterer) | WIREFRAME | system/error-states.html | 8+ varianter |
| 3 | Empty: Dashboard | WIREFRAME_NEEDED | system/states/empty-dashboard.html | Ingen data |
| 4 | Empty: List | WIREFRAME_NEEDED | system/states/empty-list.html | Tom liste |
| 5 | Empty: Detail | WIREFRAME_NEEDED | system/states/empty-detail.html | Ikke valgt / ny |
| 6 | Empty: Settings | WIREFRAME_NEEDED | system/states/empty-settings.html | Ikke konfigurert |
| 7 | Success-toast | WIREFRAME_NEEDED | system/states/success-toast.html | Bekreftelse |
| 8 | Confirm-dialog (delete-variant) | WIREFRAME_NEEDED | system/states/confirm-delete.html | Destruktiv |
| 9 | Confirm-dialog (save-variant) | WIREFRAME_NEEDED | system/states/confirm-save.html | Lagre uten tap |
| 10 | Inline-edit-states (alle 4) | WIREFRAME_NEEDED | system/states/inline-edit.html | Default/active/saving/error |
| 11 | Disabled-button-state | WIREFRAME_NEEDED | system/states/disabled-button.html | Per knapp-variant |
| 12 | Tier-locked-state | WIREFRAME_NEEDED | system/states/tier-locked.html | Pro/Elite-låst feature |

---

## 7. Web (akgolf.no) — ~30 stk

Genereres i Fase B5. Estimert struktur basert på typisk SaaS-website + AK Golf-domene.

| # | Side | URL | Arketype | Status | HTML-fil | Notater |
|---|---|---|---|---|---|---|
| 1 | Hjemmeside (hero) | / | Marketing | WIREFRAME_NEEDED | web/index.html | Hero + value prop |
| 2 | Om AK Golf | /om | Marketing | WIREFRAME_NEEDED | web/om.html | Historie, team |
| 3 | Coaches | /coaches | Marketing | WIREFRAME_NEEDED | web/coaches.html | Liste over coaches |
| 4 | Coach-profil (offentlig) | /coaches/:slug | Marketing | WIREFRAME_NEEDED | web/coach-profil.html | Public profil |
| 5 | Tjenester (oversikt) | /tjenester | Marketing | WIREFRAME_NEEDED | web/tjenester.html | Pakker |
| 6 | Tjeneste-detalj | /tjenester/:slug | Marketing | WIREFRAME_NEEDED | web/tjeneste-detalj.html | Innhold + CTA |
| 7 | Klubber / Anlegg | /anlegg | Marketing | WIREFRAME_NEEDED | web/anlegg.html | Lokasjoner |
| 8 | Anlegg-detalj | /anlegg/:slug | Marketing | WIREFRAME_NEEDED | web/anlegg-detalj.html | Per fasilitet |
| 9 | Priser | /priser | Marketing | WIREFRAME_NEEDED | web/priser.html | Tier-sammenligning |
| 10 | Kontakt | /kontakt | Marketing | WIREFRAME_NEEDED | web/kontakt.html | Skjema + info |
| 11 | Blogg / Insights | /blogg | Marketing | WIREFRAME_NEEDED | web/blogg.html | Artikkelliste |
| 12 | Blogg-artikkel | /blogg/:slug | Marketing | WIREFRAME_NEEDED | web/blogg-artikkel.html | Long-form |
| 13 | Suksesshistorier (cases) | /cases | Marketing | WIREFRAME_NEEDED | web/cases.html | Case-liste |
| 14 | Case-detalj | /cases/:slug | Marketing | WIREFRAME_NEEDED | web/case-detalj.html | STAR-format |
| 15 | For klubber (B2B) | /for-klubber | Marketing | WIREFRAME_NEEDED | web/for-klubber.html | B2B-pitch |
| 16 | For bedrifter (B2B) | /for-bedrifter | Marketing | WIREFRAME_NEEDED | web/for-bedrifter.html | Bedriftsavtaler |
| 17 | For talenter | /talent | Marketing | WIREFRAME_NEEDED | web/talent.html | Talentprogram |
| 18 | Junior-program | /junior | Marketing | WIREFRAME_NEEDED | web/junior.html | GFGK / WANG |
| 19 | Sponsorer | /sponsorer | Marketing | WIREFRAME_NEEDED | web/sponsorer.html | Partnere |
| 20 | Karriere / Jobb | /jobb | Marketing | WIREFRAME_NEEDED | web/jobb.html | Stillinger |
| 21 | Sammenlign tjenester | /sammenlign | Marketing | WIREFRAME_NEEDED | web/sammenlign.html | Tabell |
| 22 | FAQ | /faq | Marketing | WIREFRAME_NEEDED | web/faq.html | Spørsmål |
| 23 | Personvern | /personvern | Legal | WIREFRAME_NEEDED | web/personvern.html | GDPR |
| 24 | Vilkår | /vilkar | Legal | WIREFRAME_NEEDED | web/vilkar.html | Brukervilkår |
| 25 | Cookie-policy | /cookies | Legal | WIREFRAME_NEEDED | web/cookies.html | Cookie-info |
| 26 | 404-side | /404 | Marketing | WIREFRAME_NEEDED | web/404.html | Friendly not-found |
| 27 | 500-side | /500 | Marketing | WIREFRAME_NEEDED | web/500.html | Server-error |
| 28 | Footer-mega | (komponent) | Marketing | WIREFRAME_NEEDED | web/footer-mega.html | Mega-footer |
| 29 | Header / Nav (offentlig) | (komponent) | Marketing | WIREFRAME_NEEDED | web/header-nav.html | Public nav |
| 30 | Newsletter-signup | (komponent) | Marketing | WIREFRAME_NEEDED | web/newsletter.html | Inline + modal |

---

## 8. Booking-flyt (booking.akgolf.no) — ~30 stk

Genereres i Fase B6.

| # | Side / Modal | URL | Arketype | Status | HTML-fil | Notater |
|---|---|---|---|---|---|---|
| 1 | Booking-forside | / | A | WIREFRAME_NEEDED | booking/index.html | Velg tjeneste-kategori |
| 2 | Tjeneste-velger | /tjenester | B | WIREFRAME_NEEDED | booking/tjenester.html | Filter + liste |
| 3 | Coach-velger | /coaches | B | WIREFRAME_NEEDED | booking/coaches.html | Liste m. tilgjengelighet |
| 4 | Coach-detalj (booking) | /coaches/:slug | C | WIREFRAME_NEEDED | booking/coach-detalj.html | Profil + ledige tider |
| 5 | Anlegg-velger | /anlegg | B | WIREFRAME_NEEDED | booking/anlegg.html | Per geografi |
| 6 | Anlegg-detalj (booking) | /anlegg/:slug | C | WIREFRAME_NEEDED | booking/anlegg-detalj.html | Fasiliteter |
| 7 | Kalender (måneds-view) | /book/:id/kalender | G | WIREFRAME_NEEDED | booking/kalender-maned.html | Måned |
| 8 | Kalender (uke-view) | /book/:id/uke | G | WIREFRAME_NEEDED | booking/kalender-uke.html | Uke |
| 9 | Tids-velger | /book/:id/tider | D | WIREFRAME_NEEDED | booking/tider.html | Slots per dag |
| 10 | Pakke-velger | /book/:id/pakke | D | WIREFRAME_NEEDED | booking/pakke.html | Antall økter, type |
| 11 | Tilleggstjenester | /book/:id/tillegg | D | WIREFRAME_NEEDED | booking/tillegg.html | Add-ons |
| 12 | Kunde-info (eksisterende) | /book/:id/kunde | D | WIREFRAME_NEEDED | booking/kunde-eksisterende.html | Logget inn |
| 13 | Kunde-info (ny) | /book/:id/ny-kunde | D | WIREFRAME_NEEDED | booking/kunde-ny.html | Registrering |
| 14 | Spiller-detaljer | /book/:id/spiller | D | WIREFRAME_NEEDED | booking/spiller-info.html | Hvem skal spille |
| 15 | Sammendrag | /book/:id/sammendrag | C | WIREFRAME_NEEDED | booking/sammendrag.html | Pre-betaling |
| 16 | Rabatt-kode | (modal) | D | WIREFRAME_NEEDED | booking/modals/rabattkode.html | Modal |
| 17 | Betaling (Stripe) | /book/:id/betaling | D | WIREFRAME_NEEDED | booking/betaling.html | Stripe-elements |
| 18 | Betaling — Vipps | (alternativ) | D | WIREFRAME_NEEDED | booking/betaling-vipps.html | Vipps-flyt |
| 19 | Bekreftelse | /book/:id/bekreftelse | A | WIREFRAME_NEEDED | booking/bekreftelse.html | Success |
| 20 | E-post-mal: bekreftelse | (e-post) | Marketing | WIREFRAME_NEEDED | booking/email-bekreftelse.html | HTML-mail |
| 21 | E-post-mal: påminnelse | (e-post) | Marketing | WIREFRAME_NEEDED | booking/email-paminnelse.html | 24t før |
| 22 | Min booking-oversikt | /min-side/bookinger | B | WIREFRAME_NEEDED | booking/min-side.html | Innlogget |
| 23 | Min booking-detalj | /min-side/bookinger/:id | C | WIREFRAME_NEEDED | booking/min-booking-detalj.html | Per booking |
| 24 | Avbestill | (modal) | D | WIREFRAME_NEEDED | booking/modals/avbestill.html | Cancel |
| 25 | Endre booking | (modal) | D | WIREFRAME_NEEDED | booking/modals/endre-booking.html | Reschedule |
| 26 | Faktura-historikk | /min-side/fakturaer | B | WIREFRAME_NEEDED | booking/fakturaer.html | Liste |
| 27 | Faktura-detalj | /min-side/fakturaer/:id | C | WIREFRAME_NEEDED | booking/faktura-detalj.html | Linjer |
| 28 | Klippekort | /min-side/klippekort | A | WIREFRAME_NEEDED | booking/klippekort.html | Saldo + bruk |
| 29 | Login-pop (booking) | (modal) | D | WIREFRAME_NEEDED | booking/modals/login-popup.html | Inline auth |
| 30 | Booking — failed payment | /book/:id/feil | G | WIREFRAME_NEEDED | booking/feil-betaling.html | Error-state |

---

## Workflow-regler

1. **Aldri start kode på en enhet med status `WIREFRAME_NEEDED` eller `SPEC_NEEDED`.** Vent til minst `WIREFRAME`.
2. **Aldri marker som `APPROVED` uten at Anders eksplisitt har sagt godkjent.**
3. **Status oppdateres per enhet, ikke i bulk.** Etter hver godkjenning, oppdater raden.
4. **Legg design-link i kolonnen når Anders limer den fra claude.ai/design.**
5. **Notater-kolonnen brukes for spesielle hensyn** (f.eks. tier-gating, IP-status, kjente caveats).

---

**Pipeline-summary (oppdateres automatisk når statuser endres):**

```
WIREFRAME_NEEDED:  129 enheter (67%)
WIREFRAME:          65 enheter (34%)
SPEC_NEEDED:         6 enheter (3%)
IN_DESIGN:           0
REVIEW:              0
APPROVED:            0
IN_CODE:             0
LIVE:                0
```
