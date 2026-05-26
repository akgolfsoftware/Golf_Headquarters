# Klikkbarhets-audit — SUMMARY

**Dato:** 2026-05-10
**Auditerte filer:** 63 av 63 HTML-wireframes
**Total klikkbare elementer kartlagt:** ~1 480

---

## Per-skjerm audit-filer

Alle filer ligger i `wireframe/audit/`:

- `coachhq-*.md` — 31 filer (CoachHQ)
- `playerhq-*.md` — 24 filer (PlayerHQ)
- `auth-*.md` — 6 filer
- `system-*.md` — 2 filer

Hver fil viser klikkbare elementer per skjerm med klassifisering (skjerm / modal / popover / state-change / inline).

---

## Total klikkbarhet per produkt

| Produkt | Filer | Klikkbare elementer | Snitt per skjerm |
|---|---|---|---|
| CoachHQ | 31 | ~951 | 31 |
| PlayerHQ | 24 | ~431 | 18 |
| Auth | 6 | ~64 | 11 |
| System | 2 | ~33 | — |
| **TOTAL** | **63** | **~1 480** | — |

---

## Modaler — komplett liste

### I tracker fra før (28 stk — uendret)

NewPlanModal, EditPlanModal, PlanApprovalModal, PlanShareModal, AIPlanGeneratorModal, TemplateSelectorModal, LiveSessionIntroModal, LiveSessionActiveModal, LiveSessionBetweenModal, LiveSessionSummaryModal, BookSessionModal, RescheduleBookingModal, FacilityDetailModal, PlanActionDetailModal, BulkApproveModal, AgentFeedbackModal, RoundDetailModal, RoundInsightModal, TrackManImportModal, ComparisonModal, DrillChallengeModal, ChallengeDetailModal, LeaderboardModal, MessageDetailModal, NotificationCenterModal, BookingConfirmationModal, PaymentModal, VideoUploadModal

### NYE — fra CoachHQ-audit (~70 stk, kan konsolideres til ~50 unike)

**Plan/agent (16):** NewPlanTemplateModal, PlanTemplateDetailModal, PlanVersionHistoryModal, NewPhaseModal, EditPlanGoalModal, ConfirmPhaseCompleteModal, ExportToPlayerModal, AgentReasoningModal, AgentModelInfoModal, PreviewPlanPublishModal, ConfirmPublishPlanModal, SendForReviewModal, PreviewPlayerViewModal, ExtendPlanModal, ConfirmEndPlanModal, ApplyTemplateModal

**Periodisering-agent (5):** DiffLineDetailModal, RequestAlternativeModal, SaveAsTemplateModal, EditDiffLinesModal, ConfirmApproveAllModal

**Approvals (2):** ConfirmApproveModal, EditAgentSuggestionModal

**Booking/Sessions (8):** NewSessionModal, EditRecurringSessionModal, EditRecurringBookingModal, SendReminderModal, ConfirmCancelModal, AddPlayerToBookingModal, BulkBookConfirmModal, NewBookingModal

**Spiller (7):** NewPlayerModal, ChangeCategoryModal, ConfirmPromotionModal, MarkInjuredModal, SendParentUpdateModal, SendParentInfoModal, AIChatModal

**Coach/Team (9):** InviteCoachModal, ConfirmRevokeInviteModal, SendMessageModal, ShareCoachProfileModal, EditSpecialtiesModal, AddCertificationModal, CertificationDetailModal, SetCoachPauseModal, RequestCoCoachModal

**Lokasjon/Fasilitet (4):** NewLocationModal, LocationDetailModal, NewFacilityModal, BookGreenfeeModal

**Tjenester (2):** NewServiceModal, ServiceDetailModal

**Grupper (4):** NewGroupModal, GroupDetailModal, PendingPlayersModal, GroupCompareModal

**E-post (2):** NewEmailTemplateModal, EmailTemplateEditModal

**Rapporter (2):** NewReportModal, ReportPreviewModal

**Sikkerhet/API (8):** ChangePasswordModal, Reset2FAModal, ConfirmLogoutSessionModal, AvatarUploadModal, CreateApiKeyModal, ConfirmRotateKeyModal, EditApiKeyScopeModal, CreateWebhookModal

**Audit/Finans (4):** AuditEventDetailModal, TripletexExportModal, BulkRemindModal, InvoiceDetailModal

**Tournaments (3):** TournamentRegistrationModal, LogisticsEditModal, UploadInvitationModal

**Tverrgående (1):** SendWeeklyBriefModal

### NYE — fra PlayerHQ-audit (51 stk)

**Tier — KRITISK PRIORITET (5):** UpgradeToProModal, UpgradeToEliteModal, CancelSubscriptionModal, DowngradeConfirmModal, PaymentMethodModal

**Live-økt (5):** ConfirmEndSessionModal, ConfirmCancelWizardModal, SaveAsTemplateModal\*, ReflectionLogModal, SessionConfirmModal

**Coach-interaksjon (7):** RequestConfirmationModal, RequestPlanChangeModal, DatetimePickerModal, RequestDetailModal, SwapCoachModal, ShareWithCoachModal, RequestCoachReviewModal

**Notater & meldinger (5):** RelatedNotesModal, LinkSessionModal, ActionableItemsModal, ShareWithParentModal, VideoPlayerModal

**Profil & innstillinger (5):** AvatarUploadModal\*, EditFieldModal, HcpOverrideModal, FacilityPickerModal, AddClubModal

**Mål & runder (6):** NewGoalModal, EditGoalModal, GoalDetailModal, TournamentDetailModal, RecordDetailModal, LogRoundModal

**Plan & økter (9):** PhaseDetailModal, PeakReadinessModal, PlanProposalDetailModal, PyramidExplainerModal, StationDetailModal, AgentInsightDetailModal, SessionDetailQuickModal, RescheduleSessionModal, StreakDetailModal

**Tester & TrackMan (3):** NewTestModal, TestAttemptDetailModal, TrackManSessionModal

**Coach-detalj (3):** SessionHistoryModal, FocusRatingDetailModal, CertificationDetailModal\*

**Baner (3):** CourseDetailModal, GolfBoxImportModal, MapFilterModal

\* = går igjen mellom PlayerHQ og CoachHQ — design én gang, gjenbruk

### NYE — fra Auth/System-audit (10 stk)

TermsModal, PrivacyModal, SkipOnboardingConfirm, Skip2FAConfirm, SSOTestResultModal, BugReportModal, AccessRequestModal, AddElevModal, ImportAssistantModal, SyncErrorDetailModal

---

## Anbefalt konsolidering — generic-komponenter

For å redusere designe-arbeidet anbefaler audit-rapportene å lage **generiske komponenter** som dekker mange spesifikke modaler:

| Generic | Erstatter | Antall reduseres |
|---|---|---|
| `ConfirmDialog` (variants: destructive/default/success) | ~15 confirm-modaler | 15 → 1 |
| `EntityDetailDrawer` (slot-API) | 12+ detail-skjermer i drawer | 12 → 1 |
| `ActionStrip` (items + primary CTA-slot) | Brukes på de fleste skjermer | inline |
| `EditFieldModal` (generic for navn/epost/telefon/dato) | 4 felt-spesifikke | 4 → 1 |
| `ShareWithModal` (parent/coach/peer-variants) | 3 share-modaler | 3 → 1 |

**Effekt:** ~131 nye modaler → **~95 unike modaler** etter konsolidering.

---

## Popovers / Dropdowns — totalt 32 stk

### CoachHQ (22)
StatusFilterPopover, RowActionsMenu, ExportMenu, SortDropdown, DateRangePicker, PlayerSelectorPopover, CoachFilterPopover, AddCompareGroupPopover, RevealKeyPopover, TriggerInfoPopover, FormatInfoPopover, StatusInfoPopover, ConfidenceTooltip, DiffStatPopover, HeatmapCellPopover, SparkTooltip, TimeSlotTooltip, TournamentMarkerPopover, MembersPopover, TemplateUsagePopover, UserMenuPopover, RowDetailPopover, PyramidQuickView

### PlayerHQ (10)
ClubPickerPopover, SearchNotesPopover, SignalInfoPopover, DayAvailabilityPopover, DataPointPopover, HoleDetailPopover, ClubStatPopover, TrajectoryDetailPopover, ShotDetailPopover, TestProtocolPopover

---

## Tier-låste features (PlayerHQ)

### Pro-låste (Free ser med lock)
- Hele Coach-fanen
- Treningsplan
- Live Session + Tapper
- Test-historikk
- TrackMan (alt)
- TrackMan-analyse
- SG-analyse på runder
- Måltrend + projeksjon
- Coach-meldinger
- "Lagre som mal" i wizard
- Agent-pipeline
- Eksport (PDF/CSV)

### Elite-låste (Pro ser med lock)
- AI-coach chat
- Video-review i live-session
- Advanced trends i TrackMan-analyse
- RequestCoachReviewModal
- Prioritert support
- 14 spillanalyse-features

**Krav:** Hver låst feature trenger lock-overlay (40% opacity + lucide `Lock` + CTA-link til UpgradeToProModal eller UpgradeToEliteModal).

---

## Form-validation-mønstre (13 typer)

Dekkes via state-katalog (`screen-deck/system/states/`):
1. Tomt felt
2. E-post-format
3. E-post-duplikat
4. Passord-styrke
5. Passord-match
6. Min-lengde
7. Numerisk-range (HCP -5 til 54)
8. 6-siffer-kode med auto-submit
9. URL-format
10. Domene-format
11. Filopplasting (XML, ≤2MB, 4 substates)
12. Vilkår-godkjent
13. Rate-limit cooldown

---

## SSO-providere som må designes

**Personlig (login + signup):** BankID (OIDC), Google, Apple

**Organisasjon (SSO-setup):** Azure AD, Okta, Google Workspace, Custom SAML 2.0

**Hull funnet:** Signup mangler SSO-knappene som login har — bør legges til for symmetri.

---

## Sub-skjermer som mangler wireframe (lenkes fra eksisterende)

12 stk (CoachHQ):
- `/admin/messages`
- `/admin/activity-log`
- `/admin/plans/archived`
- `/admin/locations/:id`
- `/admin/profile/:id` (andres profil)
- `/admin/team/:id/permissions`
- `/admin/team/:id/calendar`
- `/admin/services/:id`
- `/admin/groups/:id`
- `/admin/email-templates/:id`
- Settings sub-undersider (Konto / Notifikasjoner / Tilgang / Integrasjoner / Fakturering / Avansert)
- `/admin/analytics/sg` (drill-down)

5 stk (Auth):
- Reset-password-skjerm (token-flow)
- Onboarding steg 1, 3, 4 (kun steg 2 wireframet)
- 2FA steg 2 (recovery-koder) + steg 3 (bekreftelse)
- Coach- og Foresatt-onboarding (rolle-spesifikke varianter)
- Password-reveal-toggle (mangler på alle passord-felt)

---

## Design-prioritering — anbefalt rekkefølge

### Tier 1 — KRITISK (designes først, blokkerer mange flyter)
1. `ConfirmDialog` (generic) — 15 modaler i én
2. `UpgradeToProModal` + `UpgradeToEliteModal` — blokkerer alle Free/Pro-flyter
3. `EntityDetailDrawer` (generic) — 12 detail-skjermer i én
4. `EditFieldModal` (generic) — 4 felt-spesifikke i én
5. `ActionStrip` (komponent) — brukes overalt

### Tier 2 — HØYT (lukker mange skjermer)
- Live Session 4-modal-pakke (samlet i Fase 5)
- Booking-flyt-modaler (BookSession, Reschedule, BookingConfirmation)
- Plan-modaler (NewPlan, EditPlan, AIPlanGenerator, TemplateSelector)
- Agent-modaler (PlanActionDetail, BulkApprove, AgentFeedback, AgentReasoning)

### Tier 3 — MEDIUM (per produkt)
- CoachHQ resten av modalene (~50 stk)
- PlayerHQ resten av modalene (~30 stk)
- Auth/onboarding sub-steg + tier-modaler

### Tier 4 — LAV (kan vente)
- Tooltips og popovers (32 stk) — design som komponent-system, ikke per stk
- Eksport-modaler
- Audit-detalj-modaler

---

## Konsekvenser for tracker

**Tracker oppdateres:**
- Modal-tabell utvides fra 28 → ~95 unike modaler (etter konsolidering)
- Sub-skjerm-rader legges til (12 CoachHQ + 5 Auth)
- Tier-låste features får ekstra notat-kolonne

**Tracker oppdateres ikke:**
- Popovers/dropdowns — designes som komponent-system, ikke individuelle skjermer
- States dekkes av eksisterende state-katalog
