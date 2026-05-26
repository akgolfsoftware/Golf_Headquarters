# AK Golf Platform — Booking — Spiller-info

## Identitet

- **Produkt:** Booking
- **URL:** `/spiller`
- **Arketype:** G — Wizard / steg 3.7 (mellomsteg)
- **Tier-gating:** Ingen
- **HTML-referanse:** `wireframe/screen-deck/booking/spiller-info.html`
- **Audit:** `wireframe/audit/booking-spiller-info.md`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Hvem skal faktisk spille denne timen? Default: kontakt-personen selv. Men foreldre booker ofte for barn, og bedrifter booker for ansatte. 3 valg: "Meg selv" / "Mitt barn (under 18)" / "Annen person". For barn og annen person: ekstra felt (navn, fødselsdato, eventuell HCP).

## Layout — UNIKT for denne skjermen

Bruker arketype-G-felles-spec. Progress-stripe: "3. Info ✓ → 3.7 Spiller" (primary).

- **Hero:** Mono "STEG 3 AV 5" + H1 "Hvem skal *spille?*"
- **Sub:** "Bookingen og fakturaen står på deg — men coachen trenger å vite hvem som faktisk kommer."
- **Radio-grid:** 3 cards i 3-kolonne
  - "Meg selv" (default valgt) — Lucide User-ikon
  - "Mitt barn" — Lucide Baby-ikon
  - "Annen person" — Lucide UserPlus-ikon
- **Konditionelle felt under (vises kun ved barn/annen):**
  - Navn (krav)
  - Fødselsdato (kun barn — for junior-tier-validering)
  - Forhold (kun annen — "Mitt barn / Min partner / Kollega / Annen")
  - HCP (valgfritt) — for å hjelpe coach forberede
- **Footer-actions:** "← Tilbake" + "Fortsett →" (primary)

## Konkret data

- Default: "Meg selv" valgt for Anders K
- Eksempel barn: "Markus Rønning" (junior, født 2009-04-12, HCP 14,2)

## Klikkbare elementer

| Element | States |
|---|---|
| Radio-card | default, hover (lift), valgt (accent border + radio-prikk lime) |
| Konditionelle felt | hidden, vises (slide-down 200ms), default, focus, filled |
| "Fortsett →" | disabled (krav uoppfylt), default, hover |

## Empty / loading / error

- Ingen empty-state (alltid 3 valg)
- **Error:** Per-felt validering (barn-alder må være under 18, ellers blokker booking)

## Ønsket output fra Claude Design

1. Lyst tema, "Meg selv" valgt (default)
2. Lyst tema, "Mitt barn" valgt + felt fyllt for Markus
3. Mørkt tema
4. Hover på "Annen person"-card
5. Mobil ≤640px — 3 cards stables vertikalt

## Ikke-mål

- Ikke designe sammendrag (pakke 15)
- Ikke designe foreldre-portal (annen batch)
- Ikke designe HCP-import fra GolfBox

## Når du er ferdig

Lim design-link tilbake til Claude Code.
