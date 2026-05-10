# Custom prompt for Mini-batch 9-A - Booking forside + velgere (BULK-versjon)

**Kopier ALT under linja inn i claude.ai/design som foerste melding i ny sesjon.**

Foer du sender prompten, last opp disse vedleggene:
1. wireframe/brain/for-claude-design/branding-style-guide.html (system-kontekst)
2. wireframe/brain/for-claude-design/design-system-v2.md (tekstlig backup)
3. Alle 20 .woff2-filer fra wireframe/brain/for-claude-design/fonts/
4. wireframe/design-batches/batch-9-booking/mini-batches/9-A.md (mini-batch-spec)
5. Alle 5 HTML-filer listet i 9-A-vedlegg.txt

---

# PROMPT (kopier fra og med denne linja):

Jeg har lastet opp et komplett designsystem og en mini-batch-spec (9-A.md) med 5 booking-skjermer som skal designes. Dette er foerste mini-batch av 6 i Booking-flyt-batchen for booking.akgolf.no.

## Hva jeg vil

**Generer alle 5 skjermer i ETT loep** - ikke vent paa "neste" mellom hver. Lever dem som 5 paafolgende UI-kits i samme respons.

Rekkefoelge:
1. Pakke 1: Booking-forside (3 kategori-cards)
2. Pakke 2: Tjeneste-velger (steg 1 av 5)
3. Pakke 3: Coach-velger (steg 2 coach-variant)
4. Pakke 4: Coach-detalj (med 7-dagers quick-book)
5. Pakke 5: Anlegg-velger (steg 2 anlegg-variant)

For hver skjerm:
- Les pakken i 9-A.md
- Bruk tilhoerende HTML-wireframe (vedlegg) som visuell IA-referanse
- Generer skjermen som UI-kit med korrekt designsystem
- Gaa rett til neste skjerm naar du er ferdig

Etter alle 5: lever en samlet oversikt med alle 5 thumbnails + design-links.

## Felles regler (gjelder ALLE 5 skjermer)

**Designsystem:** Bruk eksakt token-navn (--brand-primary, --pyr-fys, etc) - aldri hardkode hex.

**Stil-krav:**
- Norsk bokmaal med ae/oe/aa, **komma som desimal** (12,4 ikke 12.4), 24-timer
- **Mellomrom som tusenseparator** (1 600 kr, ikke 1.600)
- Maks 3 lime-elementer (#D1F843) synlig per skjerm
- 8pt-grid for spacing (8/16/24/32/40/48/64)
- Lucide-ikoner, 1.75 stroke
- Asymmetrisk layout (ikke 3x1 uniform)

**Anti-AI-regler (KRITISK):**
- ALDRI "Velkommen tilbake" eller "God morgen, [Navn]"
- Bruk italic editorial Instrument Serif paa noekkelord:
  - "Book din neste *oekt*"
  - "Velg *tjeneste*"
  - "Tirsdag *12. mai 2026*"
- Mono caps for kontekst: "STEG 2 AV 5" / "ANDERS K - MULLIGAN INDOOR - 60 MIN"
- Flat farger paa avatarer (ingen gradient)
- Ingen "translateY(-3px) hover paa alt"

**Booking-spesifikke regler:**
- INGEN app-sidebar paa noen booking-skjerm (booking har sin egen wizard-layout)
- Top-nav alltid synlig: "AK Golf - Booking" venstre + "Min side ->" hoeyre
- Booking-progress-stripe synlig fra steg 1 (ikke paa forside / pakke 1)
- 5 progress-pills: 1.Tjeneste, 2.Tid, 3.Info, 4.Betaling, 5.Bekreftelse
- Hver side har "<- Tilbake" + "Fortsett ->" eller kort-klikk = videre

**Konkret data (bruk konsekvent):**
- Eksempel-dato: tirsdag 12. mai 2026 09:00
- Anonym kunde: Markus Roenning, markus.ronning@gmail.com, 90 12 34 56
- Innlogget kunde: Anders Kristiansen (akgolfgroup@gmail.com)
- Coach: Anders K (PGA)
- Anlegg: Mulligan Fredrikstad (Stabburveien 7), Bossum GK, GFGK Range
- Pris: "1 600 kr" (mellomrom som tusenseparator)
- Booking-nr: BK-2026-0512-0094

## Output per skjerm

For hver av de 5 skjermene, lever:
1. Hovedskjerm i lyst tema (default)
2. Hover-state paa kritiske elementer (kategori-card, coach-card, kart-pin)
3. Empty/loading-state hvor relevant
4. Mobil-versjon hvis layout endres dramatisk

## Start naa

Begynn med Pakke 1 (Booking-forside) og fortsett uten avbrudd til alle 5 er ferdige.

Naar du er helt ferdig:
- Samlet oversikt med alle 5 thumbnails
- Liste med design-links jeg kan kopiere til tracker
- Flagg evt. caveats/avvik per skjerm
