# AK Golf Platform — Booking — Email (24t påminnelse)

## Identitet

- **Produkt:** Booking (e-post-mal)
- **Sendes:** Cron 24 timer før hver kommende booking
- **Arketype:** Transactional HTML email
- **Tier-gating:** Kunden kan slå av i samtykker (12-kunde-eksisterende)
- **HTML-referanse:** `wireframe/screen-deck/booking/modals/email-paminnelse.html`
- **Audit:** `wireframe/audit/booking-email-paminnelse.md`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst — samme e-post-tilpasning som pakke 29 (HTML-table, inline styles, fallback-fonter).

## Spec — hva e-posten er for

24-timers påminnelse. Holdning: vennlig, ikke pågående. Skal redusere no-show. Inneholder all praktisk info kunden trenger for å møte opp: tid, adresse + Google-Maps-lenke, hva man skal ta med, parkering, kontakt-info hvis noe endrer seg. Avbestillings-knapp synlig (men ikke fremhevet — vi vil ikke pushe avlysning).

## Layout — UNIKT for denne malen

- **HTML-table-layout, max 600px, sentrert** (samme som 29)
- **Topp-band:**
  - AK Golf-logo
  - Lucide Clock SVG inline 64px i accent-tint
  - H1: "I morgen kl. 09:00" (Geist 28px bold)
  - Sub: "Påminnelse om økten din med Anders K"
- **Detaljer-card (samme stil som 29):**
  - Tjeneste, dato/tid, sted (med Google-Maps-lenke), coach
- **Praktisk info-card:**
  - "Hva ta med:"
    - 2-3 bullets (egne køller, golfsko, vannflaske)
  - "Parkering:" tekst om parkering
  - "Adresse-lenke:" Google Maps embed (statisk bilde + lenke til Google Maps)
- **CTA:** "Se booking-detaljer" (primary) + "Avbestill →" (ghost lite, ikke fremhevet)
- **Vær-info-bånd (valgfri, vises hvis utendørs anlegg):**
  - "Værmelding for i morgen: 18°C, sol" (eller "regn" — koble mot yr.no)
- **Bunntekst:** Samme som 29 (org.nr, avmeld-lenke)

## Konkret innhold

```
Subject: Påminnelse: I morgen kl. 09:00 hos Anders K på Mulligan

Hei Markus,

Klart til økten i morgen?

[Detaljer-card]
Tirsdag 12. mai 2026 kl. 09:00 - 10:00
Mulligan Fredrikstad
Stabburveien 7, 1617 Fredrikstad → [Åpne i Google Maps]
Anders Kristiansen (PGA)

[Praktisk info]
Hva ta med:
- Egne køller (eller leie hos oss for 100 kr)
- Golfsko (eller bruk innesko)
- Vannflaske

Parkering: Gratis foran inngangen.

[CTA: Se booking-detaljer]   [Avbestill →]

[Vær-bånd]
Værmelding i morgen: 18°C, lett skydekke

Vi sees i morgen!
- Anders K

[Bunntekst]
```

## Fonter

Samme fallback-stack som pakke 29.

## Klikkbare elementer

| Element | Lenke |
|---|---|
| "Åpne i Google Maps" | `https://www.google.com/maps/dir/?api=1&destination=Mulligan+Fredrikstad` |
| "Se booking-detaljer" | `https://booking.akgolf.no/min-side/booking/BK-...` |
| "Avbestill →" | `https://booking.akgolf.no/min-side/booking/BK-.../avbestill` |
| Vær-bånd | (ikke klikkbart, info-only) |

## Ønsket output fra Claude Design

1. Desktop-rendering, default (sol-værmelding)
2. Desktop-rendering med regn-værmelding (annen ikon)
3. Mobil-rendering
4. Mørk-modus
5. HTML-kode-output (inline styles, table-layout)

## Ikke-mål

- Ikke designe bekreftelses-e-post (pakke 29)
- Ikke implementer ekte yr.no-integrasjon
- Ikke designe SMS-versjon (separat kanal, ikke i denne batchen)

## Når du er ferdig

Lim design-link + HTML-fil tilbake til Claude Code.
