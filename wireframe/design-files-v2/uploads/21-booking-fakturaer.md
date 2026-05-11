# AK Golf Platform — Booking — Fakturaer

## Identitet

- **Produkt:** Booking (kunde-portal)
- **URL:** `/min-side/fakturaer`
- **Arketype:** G — Kunde-portal liste
- **Tier-gating:** Krever innlogging
- **HTML-referanse:** `wireframe/screen-deck/booking/fakturaer.html`
- **Audit:** `wireframe/audit/booking-fakturaer.md`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Faktura-historikk. Tabell med alle fakturaer fra Stripe + manuelle (klubb-fakturaer). Filter på år, status (Betalt / Venter / Forfalt). Sum brukt totalt. Last ned PDF + send på nytt på e-post. Forfalt status med advarsel og "Betal nå →" CTA.

## Layout — UNIKT for denne skjermen

Bruker arketype-G-felles-spec uten progress-stripe.

- **Tilbake-link:** "← Min side"
- **Hero:** Mono "MARKUS RØNNING" + H1 "Mine *fakturaer*"
- **KPI-strip (3):**
  - Betalt i 2026: "14 800 kr"
  - Venter: "0 kr"
  - Forfalt: "0 kr" (success hvis 0, destructive hvis > 0)
- **Filter-bar:** `År: 2026 ▾`, `Status: Alle ▾`
- **Faktura-tabell:**
  - Kolonner: Nr (mono), Dato, Tjeneste, Beløp, Status-pill, Aksjoner ("PDF ↓", "Send på e-post")
  - Status: Betalt (success), Venter (warning), Forfalt (destructive, pulse)

## Eksempel-fakturaer (8)

| Nr | Dato | Tjeneste | Beløp | Status |
|---|---|---|---|---|
| F-2026-0094 | 12.05.2026 | Personlig coaching | 1 800 kr | Betalt |
| F-2026-0078 | 28.04.2026 | TrackMan-økt | 800 kr | Betalt |
| F-2026-0061 | 14.04.2026 | Personlig coaching | 1 600 kr | Betalt |
| F-2026-0053 | 31.03.2026 | 5-pakke | 7 200 kr | Betalt |
| F-2026-0045 | 17.03.2026 | Personlig coaching | 1 600 kr | Betalt |
| F-2026-0032 | 03.03.2026 | Video-analyse | 1 200 kr | Betalt |
| F-2025-0298 | 18.12.2025 | Personlig coaching | 1 600 kr | Betalt |
| F-2025-0276 | 02.12.2025 | Junior-pakke | 2 500 kr | Betalt |

## Klikkbare elementer

| Element | States |
|---|---|
| Tabell-rad | default, hover, klikk → 22-faktura-detalj |
| "PDF ↓" | default, hover, loading (genererer) |
| "Send på e-post" | default, hover, success ("Sendt ✓") |
| Filter-chip | default, hover, open, selected |
| "Betal nå →" (kun forfalt) | default, hover, klikk → Stripe checkout |

## Empty / loading / error

- **Empty:** "Ingen fakturaer ennå"
- **Empty filter:** "Ingen treff. Tilbakestill →"
- **Loading:** Skeleton 8 rader
- **Error PDF:** Toast "Kunne ikke generere PDF"

## Ønsket output fra Claude Design

1. Lyst tema, 8 fakturaer alle Betalt
2. Lyst tema, 1 forfalt (destructive bånd over tabellen + "Betal nå →")
3. Mørkt tema
4. Filter aktivt: År=2025
5. Mobil ≤640px — tabell blir kort-layout per faktura

## Ikke-mål

- Ikke designe faktura-detalj (pakke 22)
- Ikke designe admin faktura-CRUD
- Ikke implementer ekte PDF-generering

## Når du er ferdig

Lim design-link tilbake til Claude Code.
