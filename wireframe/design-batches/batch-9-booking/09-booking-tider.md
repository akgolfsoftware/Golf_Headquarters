# AK Golf Platform — Booking — Tids-velger

## Identitet

- **Produkt:** Booking
- **URL:** `/tider?dato=2026-05-12`
- **Arketype:** G — Wizard / steg 3 av 5 (tider for valgt dag)
- **Tier-gating:** Ingen
- **HTML-referanse:** `wireframe/screen-deck/booking/tider.html`
- **Audit:** `wireframe/audit/booking-tider.md`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Når kunden har klikket en dag i måneds-kalenderen, lander de her — alle ledige tider for valgt dag i en oversiktlig 2-kolonne grid. Hver tid viser klokkeslett, anlegg/sim, og pris. Klikk → steg 4 (sammendrag, eller pakke-velger først hvis tjenesten støtter klippekort).

## Layout — UNIKT for denne skjermen

Bruker arketype-G-felles-spec. Progress-stripe: "3. Velg tid" (primary).

- **Tilbake-link:** "← Annen dag" (til 07-kalender-måned)
- **Hero:** Mono "ANDERS K. · MULLIGAN INDOOR · 60 MIN" + H1 "Tirsdag *12. mai 2026*" (italic på dato)
- **Sub:** "8 ledige tider denne dagen. Velg tidspunkt under."
- **Tids-grid:** 2-kolonne, gap 12px
  - Hver card: klokkeslett "08:00 – 09:00" (Instrument Serif 18px), anlegg "Mulligan · sim 1" (mono caps muted), pris "1 600 kr" (Instrument Serif 16px primary, höyrejustert)
  - Valgt tid: lime accent border 2px + "Valgt ✓" sub-tekst i lime
- **Tid-grupperinger:**
  - Morgen (06:00–11:00) — header mono caps
  - Ettermiddag (12:00–17:00)
  - Kveld (18:00–22:00)
- **Footer-actions:** "← Annen dag" + "Fortsett →" (kun hvis tid valgt, primary)

## Eksempel-tider for 12. mai (8 stk)

| Tid | Anlegg/Sim | Pris |
|---|---|---|
| 08:00 – 09:00 | Mulligan · sim 1 | 1 600 kr |
| 09:00 – 10:00 | Mulligan · sim 2 | 1 600 kr (valgt) |
| 10:00 – 11:00 | Mulligan · sim 1 | 1 600 kr |
| 14:00 – 15:00 | Mulligan · sim 3 | 1 600 kr |
| 15:00 – 16:00 | Mulligan · sim 1 | 1 600 kr |
| 16:00 – 17:00 | Mulligan · sim 2 | 1 600 kr |
| 17:00 – 18:00 | Mulligan · sim 1 | 1 600 kr |
| 18:00 – 19:00 | Mulligan · sim 4 | 1 800 kr (kveldstid) |

## Klikkbare elementer

| Element | States |
|---|---|
| Tids-card | default, hover (lift + ring), valgt (accent border + check), disabled (gå-tilstand om tatt) |
| "← Annen dag" | default, hover |
| "Fortsett →" CTA | disabled (ingen valgt), default, hover, active, loading |

## Empty / loading / error

- **Empty (alle tider tatt midt i flyten):** "Beklager, alle tider denne dagen er nå opptatt. Velg en annen dag →"
- **Loading:** Skeleton-grid 8 cards
- **Error (race condition):** Toast "Tiden ble booket av en annen. Velg en annen tid."

## Ønsket output fra Claude Design

1. Lyst tema, 8 tider, 09:00 valgt
2. Mørkt tema
3. Hover på 14:00-card
4. Empty (alt tatt)
5. Mobil ≤640px — 1-kolonne, "Fortsett →" sticky-bunn

## Ikke-mål

- Ikke designe måneds-/uke-kalender (pakker 07/08)
- Ikke designe sammendrag (pakke 15)
- Ikke designe pakke-velger (pakke 10)

## Når du er ferdig

Lim design-link tilbake til Claude Code.
