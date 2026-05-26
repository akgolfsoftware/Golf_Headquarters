# AK Golf Platform — Booking — Kalender (måned)

## Identitet

- **Produkt:** Booking
- **URL:** `/kalender`
- **Arketype:** G — Wizard / steg 3 av 5 (måned)
- **Tier-gating:** Ingen
- **HTML-referanse:** `wireframe/screen-deck/booking/kalender-maned.html`
- **Audit:** `wireframe/audit/booking-kalender-maned.md`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Steg 3a — måneds-kalender for valgt coach + tjeneste. Hver dag viser ledig-status med visuell indikator (mange ledige = lime accent, få = gul, ingen = muted). Klikk på dag → steg 3b (tids-velger). Toggle til uke-view for mer detaljert oversikt.

## Layout — UNIKT for denne skjermen

Bruker arketype-G-felles-spec. Progress-stripe: "1. ✓ → 2. ✓ → 3. Velg dag" (primary).

- **Hero (kompakt):** Mono "ANDERS K. · PERSONLIG COACHING · 60 MIN" + H1 "Mai *2026*" (italic på år)
- **Top-höyre actions:** "‹ April", "Juni ›", "Uke-visning"
- **Kalender-grid:**
  - 7 kolonner header (Man, Tir, Ons, Tor, Fre, Lør, Søn) — mono caps muted
  - 5–6 uke-rader, hver dag-celle:
    - Dato-tall stort (Instrument Serif 18px)
    - Antall ledige tider liten (mono caps "12 LEDIGE")
    - Status-prikk nede (lime = >5, gul = 1–4, rød = 0)
    - Stengt/helligdag = muted bg + ikke klikkbar
  - Dagens dato har lime accent border
  - Valgt dato har lime accent fill
- **Footer-actions:** "← Bytt coach" (til 03) + ingen "Fortsett" (dag-klikk = videre)

## Eksempel-måned

Mai 2026 — alle ukedager åpne, lørdag/søndag fullt unntatt 11. og 12.
- 12. mai (tirsdag): valgt eksempel, 8 ledige tider
- 17. mai (søndag): nasjonaldag, stengt

## Klikkbare elementer

| Element | States |
|---|---|
| Dag-celle | default, hover (lift + accent border), valgt (lime fill), disabled (stengt/fortid) |
| "‹ April" / "Juni ›" | default, hover (underline), disabled (utenfor 2026) |
| "Uke-visning" | default, hover, klikk → `08-booking-kalender-uke` |
| "← Bytt coach" | default, hover |

## Empty / loading / error

- **Empty (måneden er fortid):** Auto-naviger til neste måned med ledige tider
- **Loading:** Skeleton-grid med pulserende celler
- **Error:** "Kunne ikke laste kalender. Prøv igjen."

## Ønsket output fra Claude Design

1. Lyst tema, mai 2026 default, 12. mai valgt (lime fill)
2. Mørkt tema
3. Hover-state på 13. mai (lift)
4. Loading-state (skeleton)
5. Mobil ≤640px — kalender 100% bredde, dato-celler 14% bredde, antall-tekst skjules (kun status-prikk)

## Ikke-mål

- Ikke designe uke-view (pakke 08)
- Ikke designe tids-velger (pakke 09)
- Ikke designe admin-kalender (CoachHQ batch 2-bookings)

## Når du er ferdig

Lim design-link tilbake til Claude Code.
