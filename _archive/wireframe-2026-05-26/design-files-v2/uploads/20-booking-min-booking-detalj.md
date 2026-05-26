# AK Golf Platform — Booking — Min booking-detalj

## Identitet

- **Produkt:** Booking (kunde-portal)
- **URL:** `/min-side/booking/BK-2026-0512-0094`
- **Arketype:** G — Kunde-portal (post-wizard)
- **Tier-gating:** Krever innlogging
- **HTML-referanse:** `wireframe/screen-deck/booking/min-booking-detalj.html`
- **Audit:** `wireframe/audit/booking-min-booking-detalj.md`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Per-booking-side. Viser alle detaljer (tjeneste, dato/tid, coach, sted, spiller, total betalt, faktura-link, betalingsmetode) + handlinger: Endre tid (åpner 27-modal), Avbestill (åpner 26-modal), Last ned faktura, Send melding til coach. For historiske bookinger: "Bestill en til" + "Skriv anmeldelse".

## Layout — UNIKT for denne skjermen

Bruker arketype-G-felles-spec uten progress-stripe.

- **Tilbake-link:** "← Min side"
- **Hero:**
  - Mono caps: "BOOKING-NR · BK-2026-0512-0094"
  - H1 "Tirsdag *12. mai*" (italic på dato)
  - Status-pill: Bekreftet (success) / Venter (warning) / Avlyst (muted) / Fullført (muted)
- **Detaljer-card:** 6 rader (Tjeneste, Tid, Coach, Sted, Spiller, Tillegg)
- **Pris-card:** Linjer + total + "Last ned faktura (PDF) →" link
- **Handlings-knapper-grid (3-kolonne):**
  - "Endre tid" (ghost) → 27-modal-endre-booking
  - "Avbestill" (ghost destructive-tekst) → 26-modal-avbestill
  - "Send melding" (ghost) → modal med textarea + send
- **Coach-card:** Avatar Anders K + bio-snutt + "Se profil →"
- **Avbestillings-info:** Lucide Info + "Fri avbestilling fram til 11. mai 09:00 (24 t før)"
- **Footer-info:** "Spørsmål? post@akgolf.no"

## Klikkbare elementer

| Element | States |
|---|---|
| "Endre tid" | default, hover, klikk → 27-modal-endre-booking |
| "Avbestill" | default, hover (destructive tekst), klikk → 26-modal-avbestill |
| "Send melding" | default, hover, klikk → modal |
| "Last ned faktura (PDF) →" | default, hover, loading (genererer), klikk → fil-nedlasting |
| "Se profil →" (coach) | klikk → 04-coach-detalj (read-only variant) |
| "← Min side" | default, hover |

## Empty / loading / error

- **Loading:** Skeleton hele card-strukturen
- **Error (booking finnes ikke):** "Booking ikke funnet. Tilbake til Min side →"
- **Disabled handlinger:** Hvis < 24t før økten, vises "Avbestill" som disabled med tooltip "Avbestilling stengt"

## Ønsket output fra Claude Design

1. Lyst tema, kommende booking (Bekreftet, alle handlinger åpne)
2. Lyst tema, historisk booking (Fullført, "Bestill en til" + "Skriv anmeldelse")
3. Mørkt tema
4. Booking < 24t fram (Avbestill disabled)
5. Mobil ≤640px — full bredde, handlings-knapper stables vertikalt

## Ikke-mål

- Ikke designe Endre-modal (pakke 27)
- Ikke designe Avbestill-modal (pakke 26)
- Ikke designe faktura-detalj (pakke 22)
- Ikke designe anmeldelses-flow

## Når du er ferdig

Lim design-link tilbake til Claude Code.
