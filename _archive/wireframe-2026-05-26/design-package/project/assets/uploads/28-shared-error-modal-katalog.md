# AK Golf Platform — Shared — Error-modal-katalog

## Identitet

- **Produkt:** Shared / cross-cutting (designer-referanse)
- **URL:** `/admin/design/errors`
- **Arketype:** G — Other (katalog-grid)
- **Tier-gating:** Admin + designer
- **HTML-referanse:** `wireframe/screen-deck/shared/cross-cutting/error-modal-katalog.html`
- **Audit:** finnes ikke ennå
- **Tilhørende modaler:** Alle error-modaler vises som thumbnails

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Error-modal-katalogen er designerens og dev-ens referanse for hvordan vi viser feil — alle ~12 error-mønstre i hele plattformen. Brukes for å sikre konsistens (alltid samme tone, samme retry-knapp-plassering, samme severity-fargekode) og unngå at noen lager "yet another error modal".

## Layout — UNIKT for denne skjermen

### Header
- Italic: *"Hvordan vi sier 'noe gikk galt'."*
- Subtitle: `12 error-mønstre · 4 alvorlighets-grader`

### Filter-bar
- Chip: Severity (Info / Warning / Destructive / Critical)
- Chip: Type (Network / Validation / Auth / Server / Client)

### Katalog-grid (3-kolonne)

Hvert kort:
- **Modal-thumbnail** (16:10)
- **Tittel** (Geist 14px medium): f.eks. "NetworkErrorModal"
- **Severity-pill** øverst-høyre
- **Type-pill** + **Retry-strategy** ("Auto-retry x3 / Manuell retry / Ingen")
- **Eksempel-tekst** (muted): "Kunne ikke nå serveren. Sjekk tilkobling og prøv igjen."
- **Brukt i** (kort liste): "Alle data-fetch i dashboard, plans, finance"

12 mønstre:
1. NetworkErrorModal — connection-lost
2. ValidationErrorInline — form-felt rødt
3. ValidationErrorBanner — top-of-form
4. AuthExpiredModal — session-utløpt
5. UnauthorizedModal — feil rolle/capability
6. ServerErrorModal — 500-feil
7. RateLimitedModal — for mange kall
8. ConflictModal — race condition (en annen har endret)
9. NotFoundFullPage — 404-side
10. PaymentFailedModal — Stripe-feil
11. ImportErrorPanel — i import-flow
12. AgentErrorModal — agent feilet

### Right-rail: Retning
- "Vår tone: rolig, faktisk, alltid forklare hva som skjedde og hva brukeren kan gjøre"
- "Aldri: 'Oops!' eller emojier eller vage 'Something went wrong'"
- Lenker til full skrive-guide

## KPI-strip — IKKE for denne

## Klikkbare elementer

| Element | States |
|---|---|
| Modal-card | default, hover (lift), klikk → preview-overlay |
| Filter-chip | default, hover, selected |
| Brukt i-link | klikk → vis hvor mønsteret brukes |

## Empty / loading / error (meta!)

- **Empty (filter null):** "Ingen error-mønstre matcher. Tilbakestill →"

## Ønsket output fra Claude Design

1. Lyst tema, full katalog
2. Mørkt tema, samme
3. Hover på en card
4. Filter aktivt: Severity=Critical
5. Mobil ≤640px — 1-kolonne grid

## Ikke-mål

- Ikke designe selve error-modalene (de finnes i sine respektive batches eller er etablert i batch 1-6)
- Ikke designe error-tracking-dashboard

## Når du er ferdig

Lim design-link tilbake til Claude Code.
