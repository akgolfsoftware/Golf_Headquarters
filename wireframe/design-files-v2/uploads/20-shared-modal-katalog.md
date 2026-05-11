# AK Golf Platform — Shared — Modal-katalog

## Identitet

- **Produkt:** Shared / cross-cutting (intern designer-referanse)
- **URL:** `/admin/design/modals`
- **Arketype:** G — Other (katalog-grid med eksempler)
- **Tier-gating:** Admin + designer
- **HTML-referanse:** `wireframe/screen-deck/shared/cross-cutting/modal-katalog.html`
- **Audit:** finnes ikke ennå
- **Tilhørende modaler:** Alle modaler vises som thumbnails

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Modal-katalogen er designerens og utviklerens referanse — alle ~40 modaler i hele plattformen vist som thumbnails med navn, bruks-kontekst, og kodespor. Brukes for å unngå duplisering ("har vi allerede en modal for dette?") og for å sikre konsistens.

## Layout — UNIKT for denne skjermen

### Header
- Italic: *"Alle modaler på ett sted."*
- Subtitle: `42 modaler · 6 kategorier · sortert alfabetisk`

### Filter-bar
- Søk: "Søk modal-navn"
- Chip: Kategori (Form / Confirm / Info / Wizard / Picker / Detail)
- Chip: Produkt (Both / CoachHQ / PlayerHQ / Web / Booking)
- Sort: A-Å / Mest brukt / Sist endret

### Modal-grid (3-kolonne)

Hvert kort:
- **Modal-thumbnail** (16:10 ratio, lyst-tema-snapshot)
- **Tittel** (Geist 14px medium): `NewPlanModal`
- **Kategori-pill** + **Produkt-pill** øverst-høyre
- **Bruks-kontekst** (muted 12px): "Åpnes fra `/admin/plans` + `/admin/elever/:id` (CTA: + Ny plan)"
- **Footer**: Sist endret · Antall steder den brukes
- **Hover**: Lift + ring + "Åpne preview →"

42 modaler dekkes (ikke uttømmende eksempler):
- AvatarUploadModal
- BookSessionModal
- BulkApproveModal
- BulkBlockModal
- CancelSubscriptionModal
- ChangeCategoryModal
- ChangePasswordModal
- ConfirmDeleteModal
- DeloadDetailModal
- ExportFinanceModal
- ImportGolfBoxModal
- LogRoundModal
- NewBookingModal
- NewPlanModal
- NewServiceModal
- PlanActionDetailModal
- PriceMatrixModal
- RescheduleBookingModal
- ScheduleReportModal
- TemplateSelectorModal
- ... (etc)

### Right-rail: Stats
- Mest brukte modaler (top 5)
- Sist lagt til
- "Tomme spor": modaler som er definert i kode men ikke brukes (advarsel)

## KPI-strip — IKKE for denne

## Klikkbare elementer

| Element | States |
|---|---|
| Modal-card | default, hover (lift), klikk → preview-overlay (full-size mockup) |
| Filter-chip | default, hover, selected (count-badge) |
| Søkefelt | default, focus, with-text |
| Sort-dropdown | default, open |

## Empty / loading / error

- **Empty (filter null treff):** "Ingen modaler matcher filteret. Tilbakestill →"
- **Loading:** Skeleton-grid

## Ønsket output fra Claude Design

1. Lyst tema, full katalog 42 modaler
2. Mørkt tema, samme
3. Hover på en card med "Åpne preview →"
4. Filter aktivt: Kategori=Form
5. Mobil ≤640px — 1-kolonne grid, filter blir bottom-sheet

## Ikke-mål

- Ikke designe alle modalene fra scratch (de finnes i sine egne batches)
- Ikke designe live preview-rendering (statiske thumbnails er ok)

## Når du er ferdig

Lim design-link tilbake til Claude Code.
