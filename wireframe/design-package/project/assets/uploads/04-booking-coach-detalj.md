# AK Golf Platform — Booking — Coach-detalj

## Identitet

- **Produkt:** Booking
- **URL:** `/coaches/anders-k`
- **Arketype:** G — Wizard / steg 2 av 5 (detalj)
- **Tier-gating:** Ingen
- **HTML-referanse:** `wireframe/screen-deck/booking/coach-detalj.html`
- **Audit:** `wireframe/audit/booking-coach-detalj.md`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Coach-profil-side i booking-konteksten. Viser bio, sertifiseringer, spesialitet, anbefalinger fra spillere, og — viktigst — neste 7 dager med ledige tider som "quick-book"-pills. Kunden kan enten klikke en tid direkte (hopper til steg 4 sammendrag) eller "Se hele kalenderen →" (steg 3 kalender-måned).

## Layout — UNIKT for denne skjermen

Bruker arketype-G-felles-spec. Progress-stripe: "1. ✓ → 2. Coach" (primary).

- **Hero med profilbilde:**
  - Sirkel-avatar 96px (primary bg, accent tekst "AK")
  - H1 "Anders *Kristiansen*" (italic på etternavn)
  - Mono caps: "PGA-PROFESJONELL · MULLIGAN INDOOR · 12 ÅR ERFARING"
  - Tilgjengelighet-pill: grønn prikk + "Ledig denne uka"
- **Bio-card:** 3 avsnitt brødtekst, max-width 600px
- **Sertifiseringer-strip:** 4 badges (PGA Norge, TrackMan Master, Mac O'Grady-trent, Junior-spesialist)
- **Spesialitet-bullets:** 4 punkter med Lucide CheckCircle (Scoring inn 100m, Putte-mekanikk, Mental tilnærming, Junior-utvikling)
- **Anbefalinger:** 2 sitater fra spillere (italic Instrument Serif, navn under)
- **Neste 7 dager — quick-book-pills:**
  - Header: "Ledige tider neste 7 dager" + "Se hele kalenderen →"
  - 7 vertikale kolonner (en per dag): "Tirs 12. mai" header + opp til 4 tids-pills (08:00, 09:00, 10:00, 14:00)
  - Klikk på tid → hopper til `15-booking-sammendrag` med valg pre-fyllt
- **Footer-actions:** "← Andre coacher" (til 03) + "Se hele kalenderen →" (til 07)

## Klikkbare elementer

| Element | States |
|---|---|
| Tids-pill | default, hover (lift), valgt (lime accent), opptatt (muted, disabled) |
| "Se hele kalenderen →" | default, hover (underline) |
| Sertifiserings-badge | tooltip på hover (utdypende beskrivelse) |
| "← Andre coacher" | default, hover |

## Empty / loading / error

- **Empty (ingen ledige tider neste 7 dager):** "Anders K har ingen ledige tider denne uka. Se neste uke →"
- **Loading:** Skeleton 7-dagers grid
- **Error:** "Kunne ikke laste tilgjengelighet."

## Ønsket output fra Claude Design

1. Lyst tema, full coach-profil med 7-dagers grid
2. Mørkt tema
3. Tids-pill 09:00 valgt (lime ring), klar til å klikkes for sammendrag
4. Empty 7-dagers grid
5. Mobil ≤640px — 7-dagers grid blir horisontalt-scrollbar med 80px brede kolonner

## Ikke-mål

- Ikke designe full kalender (pakke 07)
- Ikke designe sammendrag (pakke 15)
- Ikke designe edit-coach-profil (CoachHQ batch 8-team)

## Når du er ferdig

Lim design-link tilbake til Claude Code.
