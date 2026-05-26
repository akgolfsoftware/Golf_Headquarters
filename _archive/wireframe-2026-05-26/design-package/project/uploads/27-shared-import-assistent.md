# AK Golf Platform — Shared — Import-assistent

## Identitet

- **Produkt:** Shared / cross-cutting (onboarding + admin)
- **URL:** `/admin/import`
- **Arketype:** G — Other (wizard-aktig step-flyt)
- **Tier-gating:** Admin
- **HTML-referanse:** `wireframe/screen-deck/shared/cross-cutting/import-assistent.html`
- **Audit:** finnes ikke ennå
- **Tilhørende modaler:** `MappingModal`, `ImportPreviewModal`, `ImportSuccessModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Import-assistenten er guiden for å hente data inn i plattformen — fra GolfBox (medlemmer + handicap), CSV (spillerlister), iCal (kalendere), Stripe-historikk. 4-stegs-flyt: velg kilde → autentiser/last opp → map kolonner → preview + bekreft. Brukes mest under onboarding av en ny klubb.

## Layout — UNIKT for denne skjermen

### Wizard-steps (sticky øverst)

Horizontal stepper: `1. Velg kilde → 2. Last opp → 3. Map kolonner → 4. Preview + bekreft`

Aktiv steg highlightet med accent-bakgrunn på sirkel.

### Steg 1: Velg kilde

Grid 2-kolonne med kort, hver:
- Logo (GolfBox / CSV / iCal / Stripe / Trackman / Manuell)
- Navn + 1-setning ("Importer medlemmer + handicap fra GolfBox-konto")
- "Velg →" CTA

### Steg 2: Last opp / autentiser

- For GolfBox: OAuth-knapp "Logg inn med GolfBox"
- For CSV: drop-zone "Dra fil hit eller klikk for å velge" + filtype-info
- For Stripe: "Allerede koblet — last historikk"

### Steg 3: Map kolonner

Tabell:
| Kilde-kolonne | Plattform-felt |
|---|---|
| `golfbox_member_id` | (auto-mapped) `User.externalGolfboxId` |
| `medlemsnavn` | (dropdown) `User.fullName` |
| `email` | (dropdown) `User.email` |
| `hcp` | (dropdown) `User.hcp` |
| `kategori` | (manuell) — bruk dropdown for å mappe |

Auto-mapping på matchende navn, manuell for resten.

### Steg 4: Preview + bekreft

- "Importerer 38 medlemmer (12 vil bli oppdatert, 26 nye)"
- Preview-tabell med 5 første rader (rød rad hvis konflikt)
- 2 CTAs: `Importer →` (primary) eller `Tilbake` (ghost)

## KPI-strip — IKKE for denne (wizard)

## Klikkbare elementer

| Element | States |
|---|---|
| Steg-sirkel | active, completed (checkmark), pending |
| Kilde-kort | default, hover (lift), klikk → next step |
| Drop-zone | default, hover (dotted accent), drag-over (lime-bg), with-file |
| Map-dropdown | default, open, selected |
| Importer-CTA | disabled (mens map ikke ferdig), default, loading (progress-bar), success → `ImportSuccessModal` |

## Empty / loading / error

- **Loading import:** Progress-bar med "Importerer 12 av 38..."
- **Mapping-error:** Inline rød tekst på rad ("Påkrevd felt mangler")
- **Konflikt:** Rad markert med advarsel "Email finnes allerede — overstyr / hopp over"

## Ønsket output fra Claude Design

1. Lyst tema, steg 1 (Velg kilde)
2. Steg 2 (Last opp CSV med drop-zone)
3. Steg 3 (Map kolonner)
4. Steg 4 (Preview med 1 konflikt-rad)
5. Loading import (progress)
6. Mobil ≤640px — wizard-steps blir vertikal liste, kort 1-kolonne

## Ikke-mål

- Ikke designe `MappingModal`, `ImportPreviewModal`, `ImportSuccessModal` (egen batch)
- Ikke designe GolfBox-OAuth-flyten i detalj
- Ikke designe undo/rollback for importer

## Når du er ferdig

Lim design-link tilbake til Claude Code.
