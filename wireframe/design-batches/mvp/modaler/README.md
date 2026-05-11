# MVP-blokk 3 - Modaler

27 modaler fordelt paa 5 mini-batches. Hver mini-batch kjoeres som EEN samlet
Claude Design-sesjon med felles vedlegg og prompt.

Modaler er fullscreen overlay over app-bakgrunnen. Modal-content er sentrert
med max-bredde (typisk 480-880px). Lukk-X oeverst-hoeyre, primary CTA nederst
(lime accent for accept/send).

Spilleren er **Markus Roinaas Pedersen** (HCP 12,4). Hovedcoach er
**Anders Kristiansen**. Hjemmebane: GFGK (Gamle Fredrikstad Golfklubb).

---

## Rekkefoelge

Anbefalt sekvens (gruppert per domene):

1. **modal-A** - Plan-modaler (7 modaler: New, Edit, Approval, Share, ActionDetail, TemplateSelector, AIGenerator)
2. **modal-B** - Live Session 2-4 (3 modaler: Active, Between, Summary)
3. **modal-C** - Booking (4 modaler: BookSession, Reschedule, FacilityDetail, BookingConfirmation)
4. **modal-D** - Round/Stats/Agent (6 modaler: RoundDetail, RoundInsight, TrackManImport, Comparison, BulkApprove, AgentFeedback)
5. **modal-E** - Social/Tier/Other (7 modaler: DrillChallenge, ChallengeDetail, Leaderboard, MessageDetail, NotificationCenter, Payment, VideoUpload)

A og B kan kjoeres parallelt. C-D-E kan kjoeres i hvilken som helst rekkefoelge
etter at A og B er ferdige.

---

## Innhold per mini-batch

### modal-A - Plan-modaler (7 modaler)

| # | Modal | Produkt | Trigger |
|---|---|---|---|
| 1 | NewPlanModal | CoachHQ | + Ny plan paa /admin/plans |
| 2 | EditPlanModal | CoachHQ | Endre-knapp paa plan-detalj |
| 3 | PlanApprovalModal | PlayerHQ | Varsel "Anders foreslo en plan" |
| 4 | PlanShareModal | CoachHQ | Del-knapp paa plan-detalj |
| 5 | PlanActionDetailModal | CoachHQ + PlayerHQ | Detaljer i Approvals-list |
| 6 | TemplateSelectorModal | CoachHQ | Bruk mal i NewPlanModal steg 2 |
| 7 | AIPlanGeneratorModal | CoachHQ | AI-generer i NewPlanModal steg 2 |

**Filer:** `modal-A.md`, `modal-A-prompt.md`, `modal-A-vedlegg.txt`

### modal-B - Live Session 2-4 (3 modaler)

| # | Modal | Produkt | Trigger |
|---|---|---|---|
| 1 | LiveActiveModal | CoachHQ + PlayerHQ | Live-oekt aktiv state |
| 2 | LiveBetweenModal | CoachHQ + PlayerHQ | Mellom oevelser |
| 3 | LiveSummaryModal | CoachHQ + PlayerHQ | Etter live-oekt ferdig |

**Filer:** `modal-B.md`, `modal-B-prompt.md`, `modal-B-vedlegg.txt`

### modal-C - Booking (4 modaler)

| # | Modal | Produkt | Trigger |
|---|---|---|---|
| 1 | BookSessionModal | PlayerHQ | Book oekt-CTA i PlayerHQ |
| 2 | RescheduleBookingModal | PlayerHQ + CoachHQ | Omplanlegg booking |
| 3 | FacilityDetailModal | PlayerHQ | Klikk fasilitet paa kart |
| 4 | BookingConfirmationModal | PlayerHQ | Etter booking lagret |

**Filer:** `modal-C.md`, `modal-C-prompt.md`, `modal-C-vedlegg.txt`

### modal-D - Round/Stats/Agent (6 modaler)

| # | Modal | Produkt | Trigger |
|---|---|---|---|
| 1 | RoundDetailModal | PlayerHQ | Klikk runde i runde-liste |
| 2 | RoundInsightModal | PlayerHQ | Innsikt-CTA paa runde |
| 3 | TrackManImportModal | PlayerHQ | Importer fra TrackMan |
| 4 | ComparisonModal | PlayerHQ | Sammenlign-CTA |
| 5 | BulkApproveModal | CoachHQ | Velg flere i Approvals |
| 6 | AgentFeedbackModal | CoachHQ | Send agent-feedback |

**Filer:** `modal-D.md`, `modal-D-prompt.md`, `modal-D-vedlegg.txt`

### modal-E - Social/Tier/Other (7 modaler)

| # | Modal | Produkt | Trigger |
|---|---|---|---|
| 1 | DrillChallengeModal | PlayerHQ | Lag/bli med challenge |
| 2 | ChallengeDetailModal | PlayerHQ | Klikk challenge |
| 3 | LeaderboardModal | PlayerHQ | Vis full leaderboard |
| 4 | MessageDetailModal | PlayerHQ + CoachHQ | Klikk melding |
| 5 | NotificationCenterModal | PlayerHQ + CoachHQ | Bjelle-ikon |
| 6 | PaymentModal | PlayerHQ | Oppgrader-CTA |
| 7 | VideoUploadModal | PlayerHQ | Last opp swing-video |

**Filer:** `modal-E.md`, `modal-E-prompt.md`, `modal-E-vedlegg.txt`

---

## Slik kjoerer du EEN mini-batch

1. **Aapne ny Claude Design-sesjon** (claude.ai/design)
2. **Last opp vedleggene** listet i `modal-{X}-vedlegg.txt`:
   - branding-style-guide.html + design-system-v2.md + alle 20 .woff2-fonts
   - felles-instruks.md (anti-state-katalog-regel)
   - modal-{X}.md (selve mini-batch-spec)
   - Modal-HTML-filer fra `wireframe/screen-deck/shared/modals/`
3. **Lim inn prompt** fra `modal-{X}-prompt.md` (alt fra og med "# PROMPT"-linja)
4. **Vent** mens Claude Design genererer alle modaler i ett loep
5. **Lim design-links** tilbake til Claude Code naar ferdig

---

## Anti-state-katalog (kritisk!)

Foelg `wireframe/design-batches/redesign-arketype-e/felles-instruks.md` eksakt:

- EEN produksjons-modal per HTML-fil - ikke captioned mini-mockups
- Default-state rendret i full stoerrelse (modal-spesifikk bredde, min 1024x768 viewport rundt)
- Flere states (steg, empty, loading, moerkt tema, mobil) som SEPARATE HTML-filer
- Multi-step modaler leveres som SEPARATE HTML-filer per steg

---

## Felles modal-regler

- **Bakdrop:** `rgba(0,0,0,0.5)` med blur(4px). Viser dempet app-innhold under.
- **Container:** Sentrert, `rounded-xl` (12px), card-bg lyst / popover-bg moerkt
- **Header (sticky):** Tittel italic Instrument Serif 20-28px + lukk-X oeverst-hoeyre
- **Body:** Scrollbar ved behov, max 70vh hoeyde
- **Footer (sticky):** Sekundaer-knapp venstre (Avbryt), primary-CTA hoeyre (accent-lime)
- **Anti-moenster:** ALDRI state-katalog ("1 - Idle, 2 - Aktiv"). ALDRI plan-info paa oekt-modal. ALDRI Lorem ipsum.
- **Konkret innhold:** Markus Roinaas Pedersen, Anders Kristiansen, 12,4, "Putte-oekt", "Sommer-toppform", GFGK
- **Norsk bokmaal,** komma som desimal (12,4), mellomrom som tusenseparator (1 600 kr)
- **Mobile:** Modaler blir full-screen paa <=640px (`rounded-none`, hele viewport)

---

## Etter alle 5 mini-batches

27 produksjons-modaler er ferdigdesignet og klare for React-komponenter.
Sammen med MVP-blokk 1 (CoachHQ-kjerne) + MVP-blokk 2 (PlayerHQ-kjerne)
utgjoer dette komplett MVP for AK Golf Platform.
