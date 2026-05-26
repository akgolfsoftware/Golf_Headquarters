# AK Golf Platform — Booking — Email (bekreftelse)

## Identitet

- **Produkt:** Booking (e-post-mal)
- **Sendes:** Umiddelbart etter vellykket betaling (steg 5 → bekreftelse)
- **Arketype:** Transactional HTML email
- **Tier-gating:** Ingen
- **HTML-referanse:** `wireframe/screen-deck/booking/modals/email-bekreftelse.html`
- **Audit:** `wireframe/audit/booking-email-bekreftelse.md`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst — MEN tilpass for e-post: HTML-table-layout, inline-styles, ingen webfonter (fallback-stack), ingen JS.

## Spec — hva e-posten er for

Transactional bekreftelses-mail rett etter booking. Skal: (1) bekrefte at bookingen gikk gjennom, (2) gi alle praktiske detaljer (tid, sted, coach), (3) gjøre det enkelt å legge i kalender, (4) lenke til "Min side" og "Avbestill", (5) bygge tillit/profesjonalitet. Skal funke i Outlook 2007+, Gmail, Apple Mail, mobilen.

## Layout — UNIKT for denne malen

- **HTML-table-layout, max 600px bredde, sentrert**
- **Outer wrapper:** bg `#F1EEE5` (off-white), padding 24px
- **Inner card:** bg `#FFFFFF`, border-radius 16px, padding 32px (på desktop) / 16px (mobil)
- **Topp-band:**
  - AK Golf-logo (PNG, 120×40px, sentrert)
  - Lucide CheckCircle (rendret som SVG inline) i success-circle 64px
  - H1: "Booking bekreftet!" (Geist 28px bold, color `#005840`)
  - Sub: "Vi gleder oss til å se deg." (Geist 16px muted)
- **Booking-detaljer-card:**
  - Border 1px `#E5E3DD`, padding 24px, border-radius 12px
  - Tabell med 5 rader (Tjeneste, Dato, Tid, Sted, Coach), labels mono caps muted
  - Total betalt: stort tall (Geist 24px primary)
- **CTA-knapper-rad (table-celler):**
  - "Legg til i kalender" (ghost, lenke til `.ics`-fil)
  - "Se i Min side" (primary, button rendret som `<a>`)
- **Avbestillings-info:** Lite avsnitt + "Avbestill →" lenke
- **Hva nå?-seksjon:**
  - 3 punkter: "Møt opp 10 min før", "Ta med egne kølller", "Ring oss om noe endrer seg"
- **Bunntekst (small, muted):**
  - AK Golf Group AS · Stabburveien 7, 1617 Fredrikstad · org.nr 932 456 789
  - "Du mottok denne e-posten fordi du booket en time. [Avmeld nyhetsbrev →]"

## Konkret innhold

```
Subject: Booking bekreftet · BK-2026-0512-0094 · Anders K · 12. mai 09:00

Hei Markus,

Takk for at du valgte oss! Vi gleder oss til å se deg tirsdag 12. mai.

[Booking-detaljer-card]
Booking-nr: BK-2026-0512-0094
Tjeneste: Personlig coaching (60 min)
Dato: Tirsdag 12. mai 2026
Tid: 09:00 - 10:00
Sted: Mulligan Fredrikstad, Stabburveien 7
Coach: Anders Kristiansen (PGA)
Total betalt: 1 800 kr inkl. MVA

[CTA: Legg til i kalender] [CTA: Se i Min side]

Møt opp 10 minutter før så vi kan komme i gang i tide.
Spørsmål? E-post post@akgolf.no eller ring 90 12 34 56.

Vi sees!
- Anders K og teamet på AK Golf
```

## Fonter (e-post-fallback-stack)

```
font-family: 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI',
             Helvetica, Arial, sans-serif;
font-family-mono: 'Geist Mono', 'SF Mono', Consolas, 'Courier New', monospace;
```

Geist lastes IKKE inn — fallback håndterer.

## Klikkbare elementer

| Element | Lenke |
|---|---|
| "Legg til i kalender" | `.ics`-fil-nedlasting |
| "Se i Min side" | `https://booking.akgolf.no/min-side/booking/BK-...` |
| "Avbestill →" | `https://booking.akgolf.no/min-side/booking/BK-.../avbestill` |
| "Avmeld nyhetsbrev" | `https://booking.akgolf.no/avmeld?token=...` |
| AK Golf-logo | `https://akgolf.no` |

## Ønsket output fra Claude Design

1. **Desktop-rendering** av e-posten i bred preview (Gmail-stil)
2. **Mørk-modus**-versjon (Apple Mail dark mode) — bruk media query `@media (prefers-color-scheme: dark)`
3. **Mobil-rendering** — single-column, padding 16px, knapper full bredde
4. **Outlook 2007-rendering** — verifiser at bullet-proof buttons (table-button-pattern) fungerer
5. **HTML-kode-output** — leveranse skal inkludere komplett HTML-fil med inline styles

## Ikke-mål

- Ikke designe påminnelse-e-post (pakke 30)
- Ikke designe avbestillings-e-post (egen mal, ikke i denne batchen)
- Ikke implementer Resend/Postmark-integrasjon

## Når du er ferdig

Lim design-link + HTML-fil tilbake til Claude Code.
