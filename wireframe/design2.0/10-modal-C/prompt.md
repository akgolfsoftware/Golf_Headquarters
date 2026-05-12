# Custom prompt for Mini-batch modal-C - Booking (BULK-versjon)

**Kopier ALT under linja inn i claude.ai/design som foerste melding i ny sesjon.**

Foer du sender prompten, last opp disse vedleggene:
1. `wireframe/brain/for-claude-design/branding-style-guide.html`
2. `wireframe/brain/for-claude-design/design-system-v2.md`
3. Alle 20 .woff2-filer fra `wireframe/brain/for-claude-design/fonts/`
4. `wireframe/design-batches/redesign-arketype-e/felles-instruks.md`
5. `wireframe/design-batches/mvp/modaler/modal-C.md`
6. Alle HTML-filer listet i `modal-C-vedlegg.txt`

---

# PROMPT (kopier fra og med denne linja):

Jeg har lastet opp et komplett designsystem, en felles-instruks for anti-state-katalog, og en mini-batch-spec (modal-C.md) med 4 booking-modaler som skal designes. To av dem (BookSessionModal og RescheduleBookingModal) er NYE - har ikke vaert designet foer, kun stub-spec.

## Hva jeg vil

**Generer alle 4 modaler i ETT loep** - ikke vent paa "neste" mellom hver.

Rekkefoelge:
1. Pakke 1: BookSessionModal (NY - 3 steg wizard)
2. Pakke 2: RescheduleBookingModal (NY - single + confirm)
3. Pakke 3: FacilityDetailModal (tabs)
4. Pakke 4: BookingConfirmationModal (success)

For hver modal:
- Les pakken i modal-C.md
- Bruk tilhoerende HTML-wireframe (vedlegg) som visuell IA-referanse
- Generer modalen som UI-kit med korrekt designsystem
- Multi-step: lever hvert steg som SEPARAT HTML-fil

Etter alle 4: samlet oversikt med alle thumbnails + design-links.

## Anti-state-katalog (KRITISK)

Foelg felles-instruks.md eksakt:
- **EEN produksjons-modal per HTML-fil** - ikke captioned mini-mockups
- Multi-step modaler (BookSession 3 steg) leveres som SEPARATE HTML-filer:
  - `01-book-session-steg1.html` (velg fasilitet)
  - `01-book-session-steg2.html` (velg tid)
  - `01-book-session-steg3.html` (bekreft)
- Reschedule confirm-overlay som separat HTML
- Flere states (Free vs Pro, loading, empty) som SEPARATE HTML-filer

## Felles modal-regler

- **Container:** Sentrert, max-width 560-720px (per modal), `rounded-xl`, bakdrop `rgba(0,0,0,0.5)` blur(4px)
- **Header (sticky, 72px):** Italic Instrument Serif 20-28px tittel + lukk-X
- **Footer (sticky, 72px):** Sekundaer venstre, primary accent-CTA hoeyre
- **Mobile <=640px:** Full-screen

## Felles regler (gjelder ALLE modaler)

**Designsystem:** Bruk eksakt token-navn - aldri hardkode hex.

**Stil-krav:**
- Norsk bokmaal, AE/OE/AA, **komma som desimal** (12,4)
- **Mellomrom som tusenseparator** (1 600 kr - aldri 1.600 eller 1,600)
- Maks 3 lime-elementer (#D1F843) synlig per modal
- Maks 1 italic Instrument Serif-element per modal
- 8pt-grid (8/16/24/32/40/48/64)
- Lucide-ikoner, 1.75 stroke

**Anti-AI-regler:**
- ALDRI "Klar til aa booke?" eller "Velkommen tilbake"
- Tittel-eksempler: "Book oekt", "Flytt booking", "Mulligan Studio 1", "Booking bekreftet"
- Flat farger paa avatarer, ingen gradient

**Referanse-data (bruk eksakt):**
- Spiller: Markus Roinaas Pedersen (Pro-tier)
- Coach: Anders Kristiansen (faar varsel ved reschedule)
- Fasiliteter (4 stk i listen):
  1. Mulligan Studio 1 - TrackMan 4 - 1 600 kr/t - Fredrikstad sentrum - 1,2 km
  2. Mulligan Studio 2 - TrackMan 4 - 1 600 kr/t - Fredrikstad sentrum - 1,2 km
  3. GFGK Range - Gratis for medlemmer - GFGK - 4,5 km
  4. Bossum Sim-rom - Sim - 800 kr/t - Bossum - 8,3 km
- Tids-eksempel: "Torsdag 14. mai 2026, 16:30-17:30"
- Booking-ID-format: "#BK-2026-0421"
- Betalingsmiddel: "Visa ****4242"

**Tier-gating-visualisering:**
- BookSession steg 1 Free-tier: info-banner oeverst "Du har brukt 1 av 2 bookinger denne maaneden. Oppgrader til Pro for ubegrenset ->"
- Free hard lock (2/2 brukt): full lock-overlay-card paa hele modalen med Lucide `Lock` 48px + 3 fordeler + CTA "Oppgrader til Pro ->"
- Pro-tier: ingen banner

**Mental model:**
- BookSession: "Velg hva -> hvor -> bekreft betaling" - lineaer wizard
- Reschedule: "Foer-etter-bilde + valgfri grunn"
- FacilityDetail: "Vis fasilitet rik, ikke skjemte" - tabs med rik info
- BookingConfirmation: "Bekreftet - her er detaljene + neste steg"

## Output per modal

Som angitt under "States / Output" i modal-C.md. Til sammen ca 18-22 HTML-filer.

## Start naa

Begynn med Pakke 1 (BookSessionModal) og fortsett uten avbrudd.

Naar du er ferdig:
- Samlet oversikt med thumbnails gruppert per modal
- Liste med design-links
- Flagg evt. caveats per modal (spesielt for de NYE modalene 1 og 2)
