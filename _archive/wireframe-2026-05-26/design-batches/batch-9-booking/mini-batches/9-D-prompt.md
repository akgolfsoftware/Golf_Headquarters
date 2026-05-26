# Custom prompt for Mini-batch 9-D - Betaling + bekreftelse + min side (BULK-versjon)

**Kopier ALT under linja inn i claude.ai/design som foerste melding i ny sesjon.**

Foer du sender prompten, last opp:
1. wireframe/brain/for-claude-design/branding-style-guide.html
2. wireframe/brain/for-claude-design/design-system-v2.md
3. Alle 20 .woff2-filer
4. wireframe/design-batches/batch-9-booking/mini-batches/9-D.md
5. Alle 5 HTML-filer fra 9-D-vedlegg.txt

---

# PROMPT (kopier fra og med denne linja):

Jeg har lastet opp et komplett designsystem og en mini-batch-spec (9-D.md) med 5 booking-skjermer. Fjerde mini-batch (9-D) av 6.

## Hva jeg vil

**Generer alle 5 skjermer i ETT loep.**

Rekkefoelge:
1. Pakke 1: Betaling (Stripe Elements)
2. Pakke 2: Betaling (Vipps)
3. Pakke 3: Bekreftelse (success-side)
4. Pakke 4: Min side (kunde-portal hjem)
5. Pakke 5: Min booking-detalj

For hver skjerm: les pakken, bruk HTML-vedlegg, generer UI-kit, gaa videre.

## Felles regler

**Designsystem:** Eksakt token-navn, aldri hardkode hex.

**Stil-krav:**
- Norsk bokmaal, ae/oe/aa, komma som desimal
- Mellomrom som tusenseparator (1 800 kr)
- 8pt-grid spacing
- Lucide-ikoner 1.75 stroke
- Asymmetrisk layout

**Anti-AI-regler:**
- ALDRI "Velkommen tilbake"
- Italic editorial:
  - "Sikker *betaling*"
  - "Betal med *Vipps*"
  - "Booking *bekreftet!*"
  - "Min *side*"
  - "Tirsdag *12. mai*"
- Mono caps for kontekst: "STEG 4 AV 5 - 1 800 KR" / "BOOKING-NR - BK-2026-0512-0094"

**Booking-spesifikke regler:**
- Pakker 1, 2, 3 har progress-stripe synlig
- Pakker 4, 5 (Min side, Min booking-detalj) har IKKE progress-stripe (ikke wizard, det er kunde-portal)
- INGEN app-sidebar paa noen skjerm
- Top-nav: "AK Golf - Booking" + "Min side ->" / "Logg ut" hvis innlogget

**Stripe Elements-styling (pakke 1):**
- Iframe med Geist-font, 16px, primary border paa focus
- Card-wrapper rundt Stripe-feltene (border, padding 20px, radius 12px)
- Visa + Mastercard + Stripe-logoer i tillit-baand

**Vipps (pakke 2):**
- Vipps-orange #FF5B24 paa primary CTA
- Pulserende ring paa waiting-state (animasjon angitt med dotted accent border)
- Tidsteller (mono)

**Success-state (pakke 3):**
- Lucide CheckCircle 88px i success-circle (rgba(16,185,129,0.12) bg)
- Mono caps success-groenn for booking-nr
- Anonym vs innlogget visning er forskjellig

**Min side (pakke 4):**
- Profilbilde i sirkel ved siden av navnet i hero (per dashboard-feedback)
- KPI-strip: 4 kort, "HCP-utvikling 14,2 v" i success-groenn (LOWER IS BETTER for HCP)
- Tab-navigasjon: Kommende / Historiske / Fakturaer / Klippekort

**Konkret data:**
- Booking-nr: BK-2026-0512-0094
- Kunde: Markus Roenning
- E-post: markus.ronning@gmail.com
- Telefon: 90 12 34 56
- Coach: Anders K (PGA, Mulligan)
- Total: 1 800 kr inkl. MVA
- Visa endelser: **** 4242

## Output per skjerm

1. Hovedskjerm i lyst tema (default)
2. Hover-state paa kritiske elementer (Betal-CTA, kalender-dropdown, booking-rad)
3. Empty/loading-state
4. Mobil-versjon

## Start naa

Begynn med Pakke 1 (Betaling Stripe) og fortsett uten avbrudd.

Naar ferdig: samlet oversikt + thumbnails + design-links + caveats.
