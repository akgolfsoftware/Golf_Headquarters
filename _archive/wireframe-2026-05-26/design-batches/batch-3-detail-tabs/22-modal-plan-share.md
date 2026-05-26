# AK Golf Platform — Modal — PlanShareModal

## Identitet

- **Type:** Modal (sentrert, 560px bred)
- **Åpnes fra:** Plan-detalj `Del`-knapp · CoachHQ kontekstmeny på plan
- **HTML-referanse:** `wireframe/screen-deck/shared/modals/plan-share.html`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva modalen er for

Del en plan med foresatte / annen coach / spiller selv via lenke eller e-post. Lenken har permissions (read-only / kommentere / edit) og evt. utløpsdato.

## Layout

### Header
- Lucide `Share2` 20px
- Tittel: `Del Sommer-toppform` (Geist 18px)
- Sub: `Markus R Pedersen · 9. mai – 30. juni 2026`
- `×`-lukk

### Body (3 seksjoner)

#### 1. Hvem skal motta?
Tabber: `Foresatte` (default) · `Annen coach` · `Spilleren selv` · `Ekstern (e-post)`

For Foresatte-tab:
- 2 forhåndskoblede foresatte som cards: Anne Nilsen (kkk@) + Jan Nilsen (jjj@) — hver med checkbox
- `+ Legg til foresatt`

#### 2. Tilgang
Radio-gruppe:
- `Kun lese` (default) — kan se plan men ikke endre
- `Kommentere` — kan legge til kommentarer på faser/økter
- `Rediger` — kan endre faser/datoer (sjelden brukt for foresatte)

#### 3. Utløpsdato (optional)
- Toggle: "Sett utløpsdato" (default av)
- Hvis på: date-picker (default = plan-slutt + 30 dager)

#### 4. Lenke-blokk
- Read-only input med `https://plat.akgolf.no/share/p47-7d2k9f`
- `Kopier lenke`-knapp (Lucide `Copy`)
- Etter kopier: success-flash "Kopiert!" + ikon endres til `Check`

### Footer
- `Avbryt` (ghost, venstre)
- `Send via e-post` (secondary, midt) — sender lenken via plattform
- `Lukk` (lime CTA, høyre)

## States

| State | Beskrivelse |
|---|---|
| Default | Foresatte-tab + Read-only |
| Loading | Skeleton |
| Send-loading | Spinner i `Send via e-post` |
| Send-success | Toast "Sendt til 2 foresatte" |
| Copy-success | Knapp endrer til "Kopiert!" 2s |
| Add-foresatt | Inline-form for navn + e-post |
| Tab-bytte | Crossfade body-content |
| Ekstern e-post | Tekstinput for å skrive inn ny e-post |

## Klikkbare elementer

| Element | States |
|---|---|
| `×`-lukk | default, hover |
| Tab (4 stk) | default, hover, active |
| Foresatt-card-checkbox | uvalgt, valgt, partial |
| `+ Legg til foresatt` | default, hover, klikk → inline-form |
| Radio (tilgang) | default, hover, selected |
| Toggle (utløpsdato) | off, on |
| Date-picker | default, open |
| `Kopier lenke` | default, hover, success-flash |
| `Send via e-post` | default, hover, loading, success |

## Eksempel-data

- **Plan:** Sommer-toppform — Markus R Pedersen
- **Foresatte:** Anne Nilsen, Jan Nilsen
- **Standard tilgang:** Kun lese
- **Lenke:** `https://plat.akgolf.no/share/p47-7d2k9f`

## Ønsket output fra Claude Design

1. Lyst tema, Foresatte-tab default
2. Mørkt tema, samme
3. Tab-bytte til Ekstern (e-post-felt)
4. Copy-success-state
5. Send-loading-state
6. Tilgang = Kommentere valgt + utløpsdato på
7. Mobil ≤640px — modal full-screen

## Ikke-mål

- Ikke designe e-post-template-editor (egen pakke)
- Ikke designe plan-detalj (pakke 03)

## Når du er ferdig

Lim design-link tilbake til Claude Code.
