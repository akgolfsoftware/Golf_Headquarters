# AK Golf Platform — Booking — Pakke-velger

## Identitet

- **Produkt:** Booking
- **URL:** `/pakke`
- **Arketype:** G — Wizard / steg 3.5 (mellomsteg, valgfritt)
- **Tier-gating:** Ingen
- **HTML-referanse:** `wireframe/screen-deck/booking/pakke.html`
- **Audit:** `wireframe/audit/booking-pakke.md`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Når kunden har valgt tid for en tjeneste som støtter klippekort (personlig coaching), spør vi: "Vil du kjøpe enkelt-time eller pakke?" Pakken gir rabatt og kan brukes på fremtidige timer. Default er "Enkelt time" (bare denne ene timen). 5-pakke = 10 % rabatt, 10-pakke = 15 % rabatt. Allerede-eide klippekort vises som alternativ for innloggede kunder.

## Layout — UNIKT for denne skjermen

Bruker arketype-G-felles-spec. Progress-stripe: "3. Tid ✓ → 3.5 Pakke" (primary).

- **Hero:** Mono "PERSONLIG COACHING · TIRSDAG 12. MAI 09:00" + H1 "Velg *pakke*"
- **Sub:** "Spar penger ved å kjøpe flere timer på en gang. Klippekortet er gyldig i 12 måneder."
- **Pakke-grid:** 3-kolonne, gap 16px
  - Card 1 — Enkelt time (default valgt): "1 time", pris "1 600 kr", ingen rabatt
  - Card 2 — 5-pakke: "5 timer", pris "7 200 kr" (1 440 kr/time), badge "SPAR 10 %" (lime accent)
  - Card 3 — 10-pakke (anbefalt): "10 timer", pris "13 600 kr" (1 360 kr/time), badge "SPAR 15 %" + lime accent border + "ANBEFALT" pill
- **Klippekort-seksjon (kun innlogget):** "Bruk eksisterende klippekort" + Card med "Anders K · 7/10 igjen · gyldig til mars 2027" + "Bruk 1 klipp" CTA
- **Info-bånd:** Lucide Info + "Klippekort kan brukes på alle coacher og fasiliteter. Gyldig 12 måneder fra kjøp."
- **Footer-actions:** "← Velg annen tid" + "Fortsett →" (primary)

## Klikkbare elementer

| Element | States |
|---|---|
| Pakke-card | default, hover (lift), valgt (accent border 2px + check) |
| Klippekort-card (innlogget) | default, hover, valgt (accent border) |
| "Fortsett →" | default, hover, active, loading |
| "← Velg annen tid" | default, hover |

## Empty / loading / error

- **Empty (klippekort tomt for innlogget):** "Du har ikke aktive klippekort"
- **Loading:** Skeleton 3 cards
- **Error:** "Kunne ikke laste pakker."

## Ønsket output fra Claude Design

1. Lyst tema (anonym), 3 pakker, "Enkelt time" default valgt
2. Mørkt tema
3. Innlogget med klippekort (4 kort: 3 pakker + 1 klippekort)
4. 10-pakke valgt (accent border på den)
5. Mobil ≤640px — pakker stables vertikalt

## Ikke-mål

- Ikke designe tillegg-side (pakke 11)
- Ikke designe klippekort-portal (pakke 23)
- Ikke designe admin pakke-CRUD (CoachHQ batch 2-services)

## Når du er ferdig

Lim design-link tilbake til Claude Code.
