# AK Golf Platform — Booking — Bekreftelse

## Identitet

- **Produkt:** Booking
- **URL:** `/bekreftelse?nr=BK-2026-0512-0094`
- **Arketype:** G — Wizard / steg 5 av 5 (success)
- **Tier-gating:** Ingen
- **HTML-referanse:** `wireframe/screen-deck/booking/bekreftelse.html`
- **Audit:** `wireframe/audit/booking-bekreftelse.md`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Success-side etter betaling. Tydelig grønn CheckCircle, booking-nummer, all booking-info, knapper for "Legg til i kalender" (Google/Apple/Outlook), "Se i Min side", og en sub-CTA "Vil du bestille en til?". For anonyme kunder: ekstra CTA "Opprett konto for å se historikk →".

## Layout — UNIKT for denne skjermen

Bruker arketype-G-felles-spec. Progress-stripe: alle 5 steg merket ✓, siste pill er success-grønn.

- **Success-hero (sentrert):**
  - Lucide CheckCircle 88px i success-circle (`rgba(16,185,129,0.12)` bg, 88×88px sirkel)
  - Mono caps success-grønn: "BOOKING-NR · BK-2026-0512-0094"
  - H1 36px "Booking *bekreftet!*" (italic på "bekreftet!", primary)
  - Sub: "Vi har sendt bekreftelse til markus.ronning@gmail.com"
- **Detaljer-card:**
  - Tjeneste, dato/tid, sted, coach, total (5 rader, mono caps labels)
- **Action-knapper-grid (3-kolonne):**
  - "Legg til i kalender" (Lucide Calendar, ghost) → dropdown Google/Apple/Outlook
  - "Se i Min side →" (primary) → 19-min-side
  - "Bestill en til" (ghost) → 01-index
- **Anonym-only CTA-card (lime accent border):**
  - "Du har ikke konto. Opprett en for å se booking-historikk, klippekort og fakturaer →"
  - "Opprett konto" (primary)
- **Coach-melding-card (valgfri):**
  - Avatar Anders K + "Vil du legge til en melding til coach?" + textarea + "Send"
- **Footer-info:** "Spørsmål? E-post oss på post@akgolf.no eller ring 90 12 34 56"

## Klikkbare elementer

| Element | States |
|---|---|
| "Legg til i kalender" | default, hover, klikk → dropdown med 3 valg |
| "Se i Min side →" | default, hover, klikk → 19-min-side |
| "Bestill en til" | default, hover, klikk → 01-index |
| "Opprett konto" (anonym) | default, hover, klikk → registreringsside |
| Coach-melding "Send" | default, loading, success ("Sendt ✓") |

## Empty / loading / error

- **Loading (kalender-dropdown):** spinner mens .ics genereres
- **Error (kalender mislyktes):** "Kunne ikke generere kalenderfil. Last ned manuelt →"
- Ingen empty-state (alltid suksess)

## Ønsket output fra Claude Design

1. Lyst tema (innlogget Anders K, ingen anonym-CTA)
2. Lyst tema (anonym Markus, med anonym-CTA-card)
3. Mørkt tema
4. Hover på "Se i Min side →"
5. Kalender-dropdown åpen
6. Mobil ≤640px — full bredde, action-knapper stables vertikalt

## Ikke-mål

- Ikke designe Min side (pakke 19)
- Ikke designe e-post-bekreftelse (pakke 29 — egen mal)
- Ikke implementer ekte .ics-generering

## Når du er ferdig

Lim design-link tilbake til Claude Code.
