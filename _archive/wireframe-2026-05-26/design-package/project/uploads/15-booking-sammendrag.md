# AK Golf Platform — Booking — Sammendrag (pre-betaling)

## Identitet

- **Produkt:** Booking
- **URL:** `/sammendrag`
- **Arketype:** G — Wizard / steg 4 av 5 (bekreft før betaling)
- **Tier-gating:** Ingen
- **HTML-referanse:** `wireframe/screen-deck/booking/sammendrag.html`
- **Audit:** `wireframe/audit/booking-sammendrag.md`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Pre-betaling sammendrag. Kunden ser ALLE valg samlet: tjeneste, coach, anlegg, dato, tid, pakke, tillegg, spiller, kontakt-info. Hver seksjon har "Endre"-link som hopper tilbake til riktig steg uten å miste data. Pris-oppsummering med MVA-spec. Rabattkode-link nederst. CTA "Gå til betaling →".

## Layout — UNIKT for denne skjermen

Bruker arketype-G-felles-spec. Progress-stripe: "4. Bekreft" (primary).

- **Hero:** Mono "STEG 4 AV 5" + H1 "Bekreft din *booking*"
- **Sub:** "Sjekk detaljene under. Klikk 'Endre' hvis noe er feil."
- **Sammendrag-card 1 — Tjeneste:**
  - "Tjeneste" label + "Personlig coaching · 60 min" + "Endre" link höyre
- **Sammendrag-card 2 — Tid + sted:**
  - "Tirsdag 12. mai 2026 · 09:00–10:00" + "Mulligan Fredrikstad · sim 2"
- **Sammendrag-card 3 — Coach:** "Anders Kristiansen (PGA)"
- **Sammendrag-card 4 — Spiller:** "Meg selv (Anders K)"
- **Sammendrag-card 5 — Tillegg:** "Video-analyse + 400 kr" (kun hvis valgt)
- **Pris-card:**
  - Linje 1: "Personlig coaching" — "1 600 kr"
  - Linje 2: "Video-analyse" — "+ 400 kr"
  - Linje 3 (valgfri): "Rabattkode VAR2026" — "− 200 kr" (lime accent)
  - Sum eks. MVA: "1 440 kr"
  - MVA 25 %: "+ 360 kr"
  - **Total inkl. MVA**: "1 800 kr" (Instrument Serif 28px primary)
- **Rabattkode-link:** "Har du en rabattkode? →" (åpner 25-modal-rabattkode)
- **Avbestillings-info:** Lucide Info-ikon + "Fri avbestilling fram til 24 timer før økten."
- **Footer-actions:** "← Tilbake" + "Gå til betaling →" (primary, large)

## Klikkbare elementer

| Element | States |
|---|---|
| "Endre" per seksjon | default, hover (underline), klikk → riktig steg med data bevart |
| "Har du en rabattkode? →" | klikk → 25-modal-rabattkode |
| "Gå til betaling →" CTA | default, hover, active, loading |

## Empty / loading / error

- **Loading:** "Gå til betaling →" viser spinner mens ordre opprettes
- **Error (sjeldent — booking utgått):** "Tiden ble booket av en annen mens du ventet. Velg ny tid →"

## Ønsket output fra Claude Design

1. Lyst tema, fullt sammendrag (alle felt fyllt, ingen rabatt)
2. Lyst tema, samme + rabattkode applisert (linje 3 + lime)
3. Mørkt tema
4. Hover på "Endre" på Tjeneste-card
5. Mobil ≤640px — full bredde, "Gå til betaling →" sticky-bunn

## Ikke-mål

- Ikke designe rabattkode-modal (pakke 25)
- Ikke designe Stripe-betaling (pakke 16)
- Ikke designe avbestillings-flow (pakke 26)

## Når du er ferdig

Lim design-link tilbake til Claude Code.
