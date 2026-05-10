# AK Golf Platform — Shared — Innstillings-layout (felles)

## Identitet

- **Produkt:** Shared / cross-cutting (felles arketype-shell)
- **URL:** `/admin/settings/*` (CoachHQ), `/meg/*` (PlayerHQ)
- **Arketype:** G — Other (felles settings-skjerm-shell)
- **Tier-gating:** Ikke relevant
- **HTML-referanse:** `wireframe/screen-deck/shared/cross-cutting/innstillings-layout.html`
- **Audit:** finnes ikke ennå
- **Tilhørende modaler:** Brukes på tvers

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Innstillings-layout er den felles 3-kolonne-shellen som alle settings-skjermer bruker (både CoachHQ og PlayerHQ). Definert i batch 6 som arketype F — denne katalogen viser **shellet i isolasjon** uten innhold, så designere kan se rammen klart. Også viser hvilke skjermer som bruker hvilken variant.

## Layout — UNIKT for denne skjermen

### Header
- Italic: *"Hvor man styrer tingene."*
- Subtitle: `1 felles shell · 4 innholds-varianter · brukt i 19 settings-skjermer`

### Hovedseksjon: 4 layout-varianter

Vertikalt stablet, hvert med live preview:

#### Variant A: 3-kolonne (default)
- Sidebar (produkt-spesifikt) + sub-nav (vertikal liste sticky) + form-area
- Brukt i: alle CoachHQ settings + PlayerHQ /meg/*

#### Variant B: 2-kolonne (kompakt)
- Sidebar + form-area direkte (ingen sub-nav, brukes når kun 1 sub-side)
- Brukt i: enkelte tier-gated settings

#### Variant C: Tab-bar mobil
- Topp tab-bar (horizontal scroll) + form-area full bredde
- Brukt i: alle mobile settings

#### Variant D: Wizard-shell
- Full-screen, sentrert content, progress-stepper
- Brukt i: onboarding, import-flyten

### Spec-tabell

| Variant | Sub-nav | Form-bredde | Brukt i |
|---|---|---|---|
| A | Vertikal sticky (200px) | flex-1 | Alle settings |
| B | Ingen | 720px | Enkelte tier-gated |
| C | Topp horisontal scroll | full | Alle settings (mobil) |
| D | Stepper øverst | 480px | Onboarding, import |

### Right-rail: Read-only-felter

Visuell oppsummering av "Endre →"-mønsteret (fra batch 6):
- Default: read-only verdi + "Endre →"-link høyre
- Klikk: åpner inline-edit eller modal
- Save: per-felt eller via save-bar bunn

## Klikkbare elementer

| Element | States |
|---|---|
| Variant-card | hover (lift), klikk → expand til full screenshot |
| Sub-nav-item | default, hover, active (accent-bg + border-left) |
| "Endre →"-link | default, hover, klikk → demo |

## Empty / loading / error

- N/A (statisk shell-katalog)

## Ønsket output fra Claude Design

1. Lyst tema, full katalog 4 varianter
2. Mørkt tema, samme
3. Variant A med en sub-nav-item active
4. Variant C (mobil) med horisontal tab-bar
5. Mobil ≤640px — varianter stables 1-kolonne

## Ikke-mål

- Ikke designe selve settings-skjermene (de er i batch 6)
- Ikke implementere routing for settings

## Når du er ferdig

Lim design-link tilbake til Claude Code.
