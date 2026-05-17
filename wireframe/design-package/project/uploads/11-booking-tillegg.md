# AK Golf Platform — Booking — Tilleggstjenester

## Identitet

- **Produkt:** Booking
- **URL:** `/tillegg`
- **Arketype:** G — Wizard / steg 3.6 (mellomsteg, valgfritt)
- **Tier-gating:** Ingen
- **HTML-referanse:** `wireframe/screen-deck/booking/tillegg.html`
- **Audit:** `wireframe/audit/booking-tillegg.md`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Upsell-skjerm. Etter valgt tjeneste/tid kan kunden legge til ekstra produkter — video-analyse (+400 kr), TrackMan-data-eksport (+200 kr), oppfølgings-rapport (+300 kr). Alle valgfrie. Default er ingen valgt. Tydelig pris-oppsummering nederst som oppdateres live.

## Layout — UNIKT for denne skjermen

Bruker arketype-G-felles-spec. Progress-stripe: "3. Tid ✓ → 3.6 Tillegg" (primary).

- **Hero:** Mono "PERSONLIG COACHING · 1 600 KR" + H1 "Vil du legge til *noe?*"
- **Sub:** "Disse tilleggene gjør økten mer verdifull. Alle er valgfrie."
- **Tillegg-liste:** 1-kolonne, gap 12px
  - Hver rad: ikon (Lucide Video / Activity / FileText) venstre, navn + beskrivelse midt, pris + checkbox/toggle höyre
  - Valgt rad: lime accent venstre-stripe + accent bg
- **Live pris-oppsummering (sticky-bunn på desktop, bunn på mobil):**
  - "Tjeneste: 1 600 kr"
  - "Tillegg: + 400 kr" (vises kun hvis valgt)
  - "Total: 2 000 kr" (Instrument Serif 24px primary)
- **Footer-actions:** "← Tilbake" + "Fortsett →" (primary)

## Eksempel-tillegg (4)

| Tillegg | Beskrivelse | Pris |
|---|---|---|
| Video-analyse | Coach analyserer swingvideo og sender PDF-rapport innen 48 timer | + 400 kr |
| TrackMan-data | Eksport av alle slag-data (CSV) etter økten | + 200 kr |
| Skriftlig oppfølging | Coach sender skriftlig anbefaling for hva du skal trene på | + 300 kr |
| Foto-pakke | 5 profesjonelle bilder fra økten | + 250 kr |

## Klikkbare elementer

| Element | States |
|---|---|
| Tillegg-rad | default, hover (lift + accent border), valgt (lime venstre-stripe + bg-shift) |
| Checkbox/toggle | uvalgt, valgt (lime fill), disabled |
| "Fortsett →" | default, hover, active |

## Empty / loading / error

- Ingen empty-state (alltid 4 valg)
- **Loading:** Skeleton 4 rader
- **Error:** "Kunne ikke laste tilleggstjenester."

## Ønsket output fra Claude Design

1. Lyst tema, 0 valgt (default), total 1 600 kr
2. Lyst tema, 2 valgt (Video + Skriftlig), total 2 300 kr
3. Mørkt tema
4. Hover på Video-analyse-rad
5. Mobil ≤640px — pris-oppsummering full bredde sticky-bunn, "Fortsett →" inni

## Ikke-mål

- Ikke designe sammendrag (pakke 15)
- Ikke designe pakke-velger (pakke 10)
- Ikke designe admin tillegg-CRUD

## Når du er ferdig

Lim design-link tilbake til Claude Code.
