# Custom prompt for Mini-batch 9-C - Kunde-info + sammendrag (BULK-versjon)

**Kopier ALT under linja inn i claude.ai/design som foerste melding i ny sesjon.**

Foer du sender prompten, last opp disse vedleggene:
1. wireframe/brain/for-claude-design/branding-style-guide.html
2. wireframe/brain/for-claude-design/design-system-v2.md
3. Alle 20 .woff2-filer fra wireframe/brain/for-claude-design/fonts/
4. wireframe/design-batches/batch-9-booking/mini-batches/9-C.md
5. Alle 5 HTML-filer listet i 9-C-vedlegg.txt

---

# PROMPT (kopier fra og med denne linja):

Jeg har lastet opp et komplett designsystem og en mini-batch-spec (9-C.md) med 5 booking-skjermer. Tredje mini-batch (9-C) av 6 i Booking-flyt-batchen.

## Hva jeg vil

**Generer alle 5 skjermer i ETT loep.**

Rekkefoelge:
1. Pakke 1: Tilleggstjenester
2. Pakke 2: Kunde (eksisterende, innlogget)
3. Pakke 3: Kunde (ny, registrering)
4. Pakke 4: Spiller-info
5. Pakke 5: Sammendrag (pre-betaling)

For hver skjerm: les pakken, bruk HTML-vedlegg, generer UI-kit, gaa videre.

## Felles regler

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
- Italic editorial:
  - "Vil du legge til *noe?*"
  - "Bekreft din *booking*"
  - "Hvem skal *spille?*"
- Mono caps for kontekst

**Booking-spesifikke regler:**
- INGEN app-sidebar
- Top-nav: "AK Golf - Booking" + "Min side ->"
- Progress-stripe synlig
- Wizard: "<- Tilbake" + "Fortsett ->"

**Forskjell mellom innlogget og anonym (kritisk for pakke 2 vs pakke 3):**
- Pakke 2 (innlogget): kun Anders K, pre-fylt info, samtykker pre-haket
- Pakke 3 (anonym): tomt skjema med 5 felt for Markus Roenning, samtykker uhaket
- Begge kan ha "Logg inn ->"-link til 28-modal-login-popup

**Pris-format med MVA (sammendrag-pakke 5):**
- Sum eks. MVA: 1 440 kr
- MVA 25%: + 360 kr
- Total inkl. MVA: 1 800 kr (stor, Instrument Serif 28px primary)
- Rabattkode: "- 200 kr" i lime accent

**Konkret data:**
- Innlogget: Anders Kristiansen, akgolfgroup@gmail.com, 90 12 34 56
- Anonym: Markus Roenning, markus.ronning@gmail.com
- Spiller: Meg selv eller "Mitt barn" (Markus Roenning, foedt 2009-04-12, HCP 14,2)
- Booking: 12. mai 2026 09:00-10:00, Anders K, Mulligan Fredrikstad - sim 2
- Tillegg: Video-analyse + 400 kr
- Total: 1 800 kr inkl. MVA

## Output per skjerm

1. Hovedskjerm i lyst tema
2. Hover-state paa kritiske elementer
3. Empty/loading-state
4. Mobil-versjon

## Start naa

Begynn med Pakke 1 (Tilleggstjenester) og fortsett uten avbrudd.

Naar ferdig: samlet oversikt + thumbnails + design-links + caveats.
