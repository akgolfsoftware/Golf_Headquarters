# AK Golf Platform — Shared — Notifikasjons-taksonomi

## Identitet

- **Produkt:** Shared / cross-cutting (intern referanse + admin)
- **URL:** `/admin/notifikasjoner/taksonomi`
- **Arketype:** F — Settings + profile (taxonomy-viewer + edit)
- **Tier-gating:** Admin-only
- **HTML-referanse:** `wireframe/screen-deck/shared/cross-cutting/notifikasjons-taxonomy.html`
- **Audit:** finnes ikke ennå
- **Tilhørende modaler:** `EditNotifTypeModal`, `PreviewNotifModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Notifikasjons-taksonomi er **katalogen** over alle varslings-typer plattformen kan sende. Hver type har: id, kategori, default-kanaler, template-tekst per kanal, locale-varianter, og hvilken role/audience den treffer. Skjermen brukes både som dokumentasjon (når dev/coach lurer på "hvilke varsler finnes?") og som admin-flate (Anders kan endre default-kanaler eller tekst).

## Layout — UNIKT for denne skjermen

Bruker arketype-F-felles-spec. Tabell-layout med expand-rader.

### Filter-bar

- Søk: "Søk notif-id eller tekst"
- Chip: Kategori (Booking / Plan / Health / Billing / System / Marketing)
- Chip: Audience (Coach / Spiller / Forelder / Admin / Klubb)
- Chip: Default-kanal (Push / E-post / SMS / In-app)
- Chip: Status (Aktiv / Deprecated / Draft)
- Sort: ID / Kategori / Volum siste 30d
- CTA: `+ Ny notif-type` (kun admin)

### Tabell (eksempel-rader, ~28 typer totalt)

| ID | Kategori | Audience | Default kanaler | Volum 30d | Status | Aksjoner |
|---|---|---|---|---|---|---|
| `booking.confirmed` | Booking | Spiller, Forelder | Push, E-post | 1 240 | Aktiv | "..." |
| `booking.cancelled` | Booking | Spiller, Coach | Push, E-post, SMS | 84 | Aktiv | "..." |
| `booking.reminder.24h` | Booking | Spiller | Push | 1 180 | Aktiv | "..." |
| `plan.published` | Plan | Spiller | Push, E-post | 47 | Aktiv | "..." |
| `plan.action.urgent` | Plan | Coach | Push, SMS | 23 | Aktiv | "..." |
| `health.injury.logged` | Health | Coach | Push | 14 | Aktiv | "..." |
| `billing.invoice.sent` | Billing | Spiller, Forelder | E-post | 47 | Aktiv | "..." |
| `billing.payment.failed` | Billing | Spiller, Forelder, Admin | Push, E-post, SMS | 3 | Aktiv | "..." |
| `system.security.suspicious` | System | Bruker selv, Admin | Push, E-post | 1 | Aktiv | "..." |
| `marketing.newsletter.monthly` | Marketing | Spiller (opt-in) | E-post | 380 | Aktiv | "..." |
| `agent.recommendation.deload` | Plan | Coach | Push | 12 | Aktiv | "..." |
| `agent.recommendation.escalation` | Plan | Coach | Push, SMS | 4 | Aktiv | "..." |
| `tournament.signup.open` | Booking | Spiller | Push, E-post | (nytt) | Draft | "..." |
| `legacy.email.welcome` | System | Spiller | E-post | – | Deprecated | "..." |

### Expand-rad (klikk på rad)

Viser detaljer:
- **Templates per kanal:**
  - Push (180 tegn): "Hei {firstName}, bookingen din 11. mai 14:00 er bekreftet ↗"
  - E-post: subject + body (preview-knapp)
  - SMS: ren tekst
- **Locale-varianter:** Norsk bokmål (default) / English / (Nynorsk planlagt)
- **Variabler tilgjengelig:** `{firstName}`, `{date}`, `{coachName}`, `{facility}`
- **Trigger:** "Når Stripe webhook `invoice.payment_succeeded` mottatt"
- **Throttling:** "Maks 1 per time per bruker"
- **Audit:** "Endret 8. apr av Anders K — endret e-post-subject"

### Side-panel: Statistikk (siste 30d)

Lite kart med:
- Totalt sendt: 4 248
- Snitt åpningsrate (e-post): 62%
- Snitt klikkrate (push): 18%
- Topp 5 mest sendte typer: liste

## Klikkbare elementer

UNIKT:

| Element | States |
|---|---|
| Notif-rad | default, hover (subtil bg), klikk → expand inline |
| "..."-meny | [Rediger] [Forhåndsvis] [Send test til meg] [Deprecate] |
| Forhåndsvis | default, hover, klikk → `PreviewNotifModal` (mock-data + render per kanal) |
| Send test | default, klikk → toast "Test sendt til anders@akgolf.no" |
| Deprecate | default, klikk → confirm "Marker som deprecated? Fjernes i neste release" |
| Status-pill Draft/Aktiv/Deprecated | unike farger (muted/accent/destructive ghost) |

## Empty / loading / error

Felles arketype-F + UNIKT:
- **Loading:** Skeleton-tabell (10 rader)
- **Empty (filter):** "Ingen notif-typer matcher filteret. Tilbakestill →"
- **Volum=0 (advarsel):** Notif-typer som ikke er sendt på 30+ dager markeres med warning-badge "Dead?"

## Ønsket output fra Claude Design

1. Lyst tema, 14 rader synlig, ingen filter
2. Mørkt tema
3. Expand-rad åpen på `booking.confirmed` med template-preview
4. Filter aktivt: kun "Marketing"-kategori
5. Forhåndsvis-modal åpen (push-preview-rendering)
6. Mobil ≤640px — tabell stables til kort, expand vises som modal i stedet for inline

## Ikke-mål

- Ikke designe `EditNotifTypeModal`, `PreviewNotifModal` (egen batch)
- Ikke designe i18n-redigerings-flyt (egen prosjekt)
- Ikke designe webhook-trigger-konfig (det er kode)

## Når du er ferdig

Lim design-link tilbake til Claude Code.
