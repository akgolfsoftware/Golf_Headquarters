# AK Golf Platform — Shared — Notifikasjons-taksonomi

## Identitet

- **Produkt:** Shared / cross-cutting (admin + designer-referanse)
- **URL:** `/admin/notif/taxonomy`
- **Arketype:** G — Other (taksonomi-tabell + per-type-konfig)
- **Tier-gating:** Admin
- **HTML-referanse:** `wireframe/screen-deck/shared/cross-cutting/notifikasjons-taxonomy.html`
- **Audit:** finnes ikke ennå
- **Tilhørende modaler:** `NotifTypeDetailModal`, `EditDefaultsModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Notifikasjons-taksonomien er den fullstendige listen over alle varsel-typer plattformen kan sende — klassifisert per kategori (System / Plan / Booking / Agent / Beskjed / Fakturering), per kanal (in-app / e-post / push / SMS), og per default-tier (Free får færre, Elite får alle). Anders bruker denne for å konfigurere globale defaults; brukere overstyrer i sin egen `/meg/notif`.

## Layout — UNIKT for denne skjermen

### Header
- Italic: *"Hva vi varsler om — og hvordan."*
- Subtitle: `34 varsel-typer · 4 kanaler · 6 kategorier`

### Filter-bar
- Søk: "Søk varsel-type"
- Chip: Kategori (System / Plan / Booking / Agent / Beskjed / Fakturering)
- Chip: Kanal (In-app / E-post / Push / SMS)

### Hovedtabell

Kolonner:
| Kolonne | Innhold |
|---|---|
| Varsel-navn | Mono: `plan.aksjon.created` |
| Kategori | Pill |
| Eksempel-tekst | Muted: "Periodiserings-agent har en ny anbefaling for Markus R" |
| In-app default | Toggle (på / av) |
| E-post default | Toggle |
| Push default | Toggle |
| SMS default | Toggle (kun for kritiske) |
| Free | Inkludert? (checkmark eller —) |
| Pro | Inkludert? |
| Elite | Inkludert? |
| Endre → | "Endre →"-link → `EditDefaultsModal` |

34 typer, gruppert med sticky kategori-headers.

### Right-rail: Stats
- "Mest aktive type siste 7d: `agent.recommendation.created` (47)"
- "Brukerne som har overstyrt mest: 12 av 16 (har skrudd av minst 1 type)"
- "Sendings-volum siste 24t: 1 247 (842 in-app, 312 e-post, 78 push, 15 SMS)"

## KPI-strip (4 kort)

1. Aktive varsel-typer: 34
2. Sendt siste 24t: 1 247
3. Click-through-rate: 38%
4. Brukere med overstyrt-prefs: 12 av 16

## Klikkbare elementer

| Element | States |
|---|---|
| Tabell-rad | hover (bg-shift), klikk → `NotifTypeDetailModal` |
| Toggle | på / av (med loading + revert ved error) |
| Kategori-header | sticky, klikk → collapse/expand kategori |
| Endre → | klikk → `EditDefaultsModal` |

## Empty / loading / error

- **Empty (filter null):** "Ingen varsel-typer matcher. Tilbakestill →"
- **Loading:** Skeleton-rader
- **Toggle-error:** Inline rød + revert

## Ønsket output fra Claude Design

1. Lyst tema, full tabell 34 typer (alle kategorier expanded)
2. Mørkt tema, samme
3. Kategori "Agent" expanded, andre collapsed
4. Hover på en rad
5. Mobil ≤640px — tabell scrollbar horisontalt, sticky første kolonne

## Ikke-mål

- Ikke designe `NotifTypeDetailModal`, `EditDefaultsModal` (egen batch)
- Ikke designe per-bruker-prefs (det er i settings, batch 6)
- Ikke implementere SMS-provider-konfig

## Når du er ferdig

Lim design-link tilbake til Claude Code.
