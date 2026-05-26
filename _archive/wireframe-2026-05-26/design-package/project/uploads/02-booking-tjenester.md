# AK Golf Platform — Booking — Tjeneste-velger

## Identitet

- **Produkt:** Booking
- **URL:** `/tjenester`
- **Arketype:** G — Wizard / steg 1 av 5
- **Tier-gating:** Ingen
- **HTML-referanse:** `wireframe/screen-deck/booking/tjenester.html`
- **Audit:** `wireframe/audit/booking-tjenester.md`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Steg 1 i wizarden. Kunden ser alle 8 tjenester gruppert per kategori, kan filtrere på type/varighet/pris/anlegg, og velger én tjeneste. Etter valg går de til steg 2 (coach- eller anlegg-velger, avhengig av tjeneste). Skjermen skal være sammenlignbar — pris, varighet og hva som inngår synlig per kort.

## Layout — UNIKT for denne skjermen

Bruker arketype-G-felles-spec. Progress-stripe vises nå ("1. Tjeneste" aktiv, primary).

- **Hero (kompakt):** Mono "STEG 1 AV 5" + H1 36px "Velg *tjeneste*"
- **Sub:** "8 tjenester tilgjengelig. Filtrér for å finne det som passer."
- **Filter-bar:** 4 chips: `Type: Alle ▾`, `Varighet: Alle ▾`, `Pris: Alle ▾`, `Anlegg: Alle ▾`
- **Tjeneste-grid:** 2-kolonne, max-width 1000px, gap 16px
  - Hver card: tittel (Instrument Serif 18px), pris (Instrument Serif 18px primary), varighet-pill (mono, muted), beskrivelse 2 linjer, "Inkludert"-liste med 3 punkter (Lucide CheckCircle)
- **Footer-actions:** "← Tilbake til forside" (ghost), ingen "Fortsett" — det skjer ved kort-klikk

## Eksempel-tjenester (8)

| Tjeneste | Varighet | Pris | Anlegg |
|---|---|---|---|
| Personlig coaching | 60 min | 1 600 kr | Mulligan / Bossum / GFGK |
| Personlig coaching XL | 90 min | 2 200 kr | Mulligan / Bossum |
| TrackMan-økt selvspill | 60 min | 800 kr | Mulligan |
| TrackMan-økt med coach | 60 min | 1 800 kr | Mulligan |
| Video-analyse | 45 min | 1 200 kr | Mulligan |
| Junior-time (under 16) | 45 min | 600 kr | GFGK |
| Junior-pakke 5 timer | 5×45 min | 2 500 kr | GFGK |
| Gruppetrening (2-4 spillere) | 60 min | 800 kr/pers | Mulligan / GFGK |

## Filter-bar — UNIKT

- Type: Personlig / TrackMan / Video / Junior / Gruppe
- Varighet: 45 min / 60 min / 90 min / Pakke
- Pris: < 1 000 / 1 000–2 000 / > 2 000
- Anlegg: Mulligan / Bossum / GFGK
- Aktive filtre vises som lime accent chips

## Klikkbare elementer

| Element | States |
|---|---|
| Filter-chip | default, hover, open (dropdown), selected (lime accent), count-badge |
| Tjeneste-card | default, hover (lift + ring), klikk → `03-booking-coaches` (hvis coaching) eller `05-booking-anlegg` (hvis fasilitet) |
| "← Tilbake til forside" | default, hover (underline) |

## Empty / loading / error

- **Empty (filter gir 0):** "Ingen treff. Tilbakestill filter →"
- **Loading:** 4 grå card-skeletons
- **Error:** "Kunne ikke laste tjenester. Prøv igjen."

## Ønsket output fra Claude Design

1. Lyst tema med 8 tjenester, ingen filter
2. Mørkt tema (samme)
3. Filter aktivt: Type=Personlig + Anlegg=Mulligan (viser "Viser 2 av 8")
4. Hover-state på "Personlig coaching"-card
5. Mobil ≤640px — cards 1-kolonne, filter-bar collapser til "Filter (0) ▾"

## Ikke-mål

- Ikke designe tjeneste-detalj (klikk går rett videre i wizarden)
- Ikke designe coach-/anlegg-velger (pakker 03/05)
- Ikke designe admin-CRUD for tjenester (CoachHQ batch 2)

## Når du er ferdig

Lim design-link tilbake til Claude Code.
