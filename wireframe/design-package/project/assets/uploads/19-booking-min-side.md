# AK Golf Platform — Booking — Min side (oversikt)

## Identitet

- **Produkt:** Booking (kunde-portal)
- **URL:** `/min-side`
- **Arketype:** G — Kunde-portal (post-wizard)
- **Tier-gating:** Krever innlogging
- **HTML-referanse:** `wireframe/screen-deck/booking/min-side.html`
- **Audit:** `wireframe/audit/booking-min-side.md`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Min side er kundens hjem etter innlogging. Viser kommende bookinger, klippekort-saldo, fakturaer, brukt i år og HCP-utvikling. Tabs for å bytte mellom kommende/historiske/fakturaer/klippekort. Hver booking-rad er klikkbar → 20-min-booking-detalj.

## Layout — UNIKT for denne skjermen

Bruker arketype-G-felles-spec men UTEN progress-stripe (ikke wizard).

- **Hero med profilbilde:**
  - Avatar 64px sirkel venstre
  - Mono caps: "MARKUS RØNNING · MEDLEM SIDEN MARS 2025"
  - H1 "Min *side*"
- **KPI-strip (4 kort):**
  - Kommende: "5 økter"
  - Klippekort: "7 / 10"
  - Brukt i 2026: "14 800 kr"
  - HCP-utvikling: "14,2 ↓" (success-grønn, lower-is-better)
- **Tab-navigasjon:** "Kommende (5)" (primary) | "Historiske (3)" | "Fakturaer" | "Klippekort"
- **Booking-liste (Kommende):** 1-kolonne, gap 10px
  - Hver rad grid: dato-blokk venstre (80px, dag/måned), info midt, status-pill, "Detaljer →"
  - Eksempel: "12 / MAI" + "Anders K · 09:00–10:00 · Mulligan · Personlig coaching" + Bekreftet (success) + "Detaljer →"
- **Footer-info:** "Spørsmål? Kontakt oss →"

## Eksempel-bookinger (5 kommende)

| Dato | Tid | Coach | Sted | Tjeneste | Status |
|---|---|---|---|---|---|
| 12. mai | 09:00–10:00 | Anders K | Mulligan | Personlig coaching | Bekreftet |
| 19. mai | 14:00–15:00 | Sara H | GFGK | TrackMan-økt | Bekreftet |
| 26. mai | 09:00–10:00 | Anders K | Mulligan | Personlig coaching | Bekreftet |
| 2. jun | 16:00–17:00 | Tom E | Bossum | Putt-økt | Venter (avhengig av vær) |
| 9. jun | 09:00–10:00 | Anders K | Mulligan | Video-analyse | Bekreftet |

## Klikkbare elementer

| Element | States |
|---|---|
| Booking-rad | default, hover (lift + accent border), klikk → 20-min-booking-detalj |
| Tab | default, hover, active |
| KPI-card | static (ikke klikkbart) |
| "Detaljer →" | redundant med rad-klikk, samme target |

## Empty / loading / error

- **Empty Kommende:** "Du har ingen kommende bookinger. Bestill en time →" (CTA → 01-index)
- **Empty Historiske:** "Ingen historikk ennå"
- **Loading:** Skeleton 5 rader
- **Error:** "Kunne ikke laste bookinger."

## Ønsket output fra Claude Design

1. Lyst tema (Kommende-tab, 5 bookinger)
2. Lyst tema (Historiske-tab, 3 bookinger)
3. Mørkt tema
4. Empty Kommende
5. Mobil ≤640px — KPI-strip blir 2×2 grid, booking-rader full bredde

## Ikke-mål

- Ikke designe min-booking-detalj (pakke 20)
- Ikke designe fakturaer-side (pakke 21)
- Ikke designe klippekort-side (pakke 23)
- Ikke designe profil-redigering

## Når du er ferdig

Lim design-link tilbake til Claude Code.
