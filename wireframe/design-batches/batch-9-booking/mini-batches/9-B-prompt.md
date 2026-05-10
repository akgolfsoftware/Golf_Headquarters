# Custom prompt for Mini-batch 9-B - Kalender + tider + pakke (BULK-versjon)

**Kopier ALT under linja inn i claude.ai/design som foerste melding i ny sesjon.**

Foer du sender prompten, last opp disse vedleggene:
1. wireframe/brain/for-claude-design/branding-style-guide.html (system-kontekst)
2. wireframe/brain/for-claude-design/design-system-v2.md (tekstlig backup)
3. Alle 20 .woff2-filer fra wireframe/brain/for-claude-design/fonts/
4. wireframe/design-batches/batch-9-booking/mini-batches/9-B.md (mini-batch-spec)
5. Alle 5 HTML-filer listet i 9-B-vedlegg.txt

---

# PROMPT (kopier fra og med denne linja):

Jeg har lastet opp et komplett designsystem og en mini-batch-spec (9-B.md) med 5 booking-skjermer. Dette er andre mini-batch (9-B) av 6 i Booking-flyt-batchen.

## Hva jeg vil

**Generer alle 5 skjermer i ETT loep** - ikke vent paa "neste".

Rekkefoelge:
1. Pakke 1: Anlegg-detalj
2. Pakke 2: Kalender (maaned)
3. Pakke 3: Kalender (uke)
4. Pakke 4: Tids-velger
5. Pakke 5: Pakke-velger

For hver skjerm: les pakken, bruk HTML-vedlegg, generer UI-kit, gaa videre.

## Felles regler (gjelder ALLE 5 skjermer)

**Designsystem:** Eksakt token-navn, aldri hardkode hex.

**Stil-krav:**
- Norsk bokmaal, ae/oe/aa, komma som desimal, 24-timer
- Mellomrom som tusenseparator (1 600 kr)
- Maks 3 lime-elementer per skjerm
- 8pt-grid spacing
- Lucide-ikoner 1.75 stroke
- Asymmetrisk layout

**Anti-AI-regler:**
- ALDRI "Velkommen tilbake"
- Italic editorial paa noekkelord:
  - "Tirsdag *12. mai 2026*"
  - "Velg *pakke*"
  - "Mai *2026*"
- Mono caps for kontekst: "ANDERS K - MULLIGAN INDOOR - 60 MIN"

**Booking-spesifikke regler:**
- INGEN app-sidebar
- Top-nav: "AK Golf - Booking" + "Min side ->"
- Booking-progress-stripe: 1.Tjeneste, 2.Tid, 3.Info, 4.Betaling, 5.Bekreftelse
- Wizard: "<- Tilbake" + "Fortsett ->" footer

**Kalender-spesifikt:**
- Maaneds-kalender: dag-status med farge-prikker (lime/gul/roed)
- Uke-kalender: tidsblokker 06:00-22:00, 30-min slots
- Tider: 2-kolonne grid, "Valgt" markering med lime accent border 2px
- Pakke-velger: 3 cards med "SPAR 10%" / "SPAR 15%" badges

**Konkret data:**
- Maaned: mai 2026
- Uke: 19 (11.-17. mai)
- Dato: tirsdag 12. mai 2026
- Tid: 09:00-10:00
- Coach: Anders K (PGA)
- Anlegg: Mulligan Fredrikstad - sim 2
- Pris: "1 600 kr" / "7 200 kr" (5-pakke) / "13 600 kr" (10-pakke)

## Output per skjerm

1. Hovedskjerm i lyst tema (default)
2. Hover-state paa kritiske elementer
3. Empty/loading-state
4. Mobil-versjon hvis layout endres

## Start naa

Begynn med Pakke 1 (Anlegg-detalj) og fortsett uten avbrudd.

Naar ferdig: samlet oversikt + thumbnails + design-links + caveats.
