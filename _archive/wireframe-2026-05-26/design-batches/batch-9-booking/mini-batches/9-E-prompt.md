# Custom prompt for Mini-batch 9-E - Fakturaer + klippekort + feil + rabattkode (BULK-versjon)

**Kopier ALT under linja inn i claude.ai/design som foerste melding i ny sesjon.**

Foer du sender prompten, last opp:
1. wireframe/brain/for-claude-design/branding-style-guide.html
2. wireframe/brain/for-claude-design/design-system-v2.md
3. Alle 20 .woff2-filer
4. wireframe/design-batches/batch-9-booking/mini-batches/9-E.md
5. Alle 5 HTML-filer fra 9-E-vedlegg.txt

---

# PROMPT (kopier fra og med denne linja):

Jeg har lastet opp en mini-batch-spec (9-E.md) med 5 booking-skjermer. Femte mini-batch (9-E) av 6.

## Hva jeg vil

**Generer alle 5 skjermer i ETT loep.**

Rekkefoelge:
1. Pakke 1: Fakturaer (kunde-portal liste)
2. Pakke 2: Faktura-detalj (paper-stil card)
3. Pakke 3: Klippekort (progress-ring + historikk)
4. Pakke 4: Feil betaling (destructive wizard-error)
5. Pakke 5: Rabattkode-modal

For hver skjerm: les pakken, bruk HTML-vedlegg, generer UI-kit, gaa videre.

## Felles regler

**Designsystem:** Eksakt token-navn, aldri hardkode hex.

**Stil-krav:**
- Norsk bokmaal, ae/oe/aa, komma som desimal
- Mellomrom som tusenseparator (14 800 kr)
- 8pt-grid spacing
- Lucide-ikoner 1.75 stroke

**Anti-AI-regler:**
- ALDRI "Velkommen tilbake"
- Italic editorial:
  - "Mine *fakturaer*"
  - "Mine *klippekort*"
  - "Personlig *coaching*" (faktura-detalj H1)
  - "Noe gikk *galt*"
  - "Rabatt*kode*"
- Mono caps for kontekst og faktura-nr/booking-nr

**Booking-spesifikke regler:**
- Pakker 1, 2, 3 er kunde-portal - INGEN progress-stripe
- Pakke 4 er wizard-error - progress-stripe synlig MEN i destructive (roed accent)
- Pakke 5 er modal - ingen progress-stripe
- INGEN app-sidebar
- Top-nav alltid synlig

**Faktura-spesifikt (pakke 2):**
- "Paper-stil" card: lys bg, subtil shadow, padding 32px
- AK Golf-logo venstre, org.nr-info hoeyre
- Linje-tabell med riktige MVA-beregninger
- Total inkl. MVA i Instrument Serif 24px primary

**Klippekort (pakke 3):**
- Progress-ring 160px diameter, lime accent stroke 8px
- "7 / 10" sentrert (Instrument Serif 36px)
- Bruks-historikk klikkbar (lenker til min-booking-detalj)

**Feil betaling (pakke 4):**
- Lucide AlertCircle 88px i destructive-circle (rgba(231,76,60,0.12) bg)
- Progress-stripe i destructive farge, IKKE primary
- 3 retry-alternativer som er like prominent (ikke skummel hierarki)
- Hjelp-info med telefonnummer

**Rabattkode-modal (pakke 5):**
- Backdrop: rgba(10,31,23,0.6) med blur 8px
- Modal-card max 480px, padding 32px
- Geist Mono 18px paa input-feltet (uppercase auto)
- 4 states: default / filled / success / error / expired

**Konkret data:**
- Kunde: Markus Roenning
- Aktivt klippekort: 10-pakke Personlig coaching, 7/10 brukt, gyldig til 12. mars 2027
- Total brukt 2026: 14 800 kr
- Faktura-eksempel: F-2026-0094, 1 800 kr, Visa **** 4242
- Rabattkode-eksempel: VAR2026 (gyldig, 200 kr rabatt)

## Output per skjerm

1. Hovedskjerm i lyst tema (default)
2. Hover-state paa kritiske elementer
3. Empty/loading-state
4. Mobil-versjon

## Start naa

Begynn med Pakke 1 (Fakturaer) og fortsett uten avbrudd.

Naar ferdig: samlet oversikt + thumbnails + design-links + caveats.
