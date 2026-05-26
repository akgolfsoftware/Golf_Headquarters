# Custom prompt for Mini-batch modal-B - Live Session 2-4 (BULK-versjon)

**Kopier ALT under linja inn i claude.ai/design som foerste melding i ny sesjon.**

Foer du sender prompten, last opp disse vedleggene:
1. `wireframe/brain/for-claude-design/branding-style-guide.html`
2. `wireframe/brain/for-claude-design/design-system-v2.md`
3. Alle 20 .woff2-filer fra `wireframe/brain/for-claude-design/fonts/`
4. `wireframe/design-batches/redesign-arketype-e/felles-instruks.md`
5. `wireframe/design-batches/mvp/modaler/modal-B.md`
6. Alle HTML-filer listet i `modal-B-vedlegg.txt`

---

# PROMPT (kopier fra og med denne linja):

Jeg har lastet opp et komplett designsystem, en felles-instruks for anti-state-katalog, og en mini-batch-spec (modal-B.md) med 3 Live Session-modaler som skal designes.

## Hva jeg vil

**Generer alle 3 modaler i ETT loep** - ikke vent paa "neste" mellom hver.

Rekkefoelge:
1. Pakke 1: LiveActiveModal (rep-logging counter)
2. Pakke 2: LiveBetweenModal (mellom oevelser)
3. Pakke 3: LiveSummaryModal (post-oekt summary med confetti)

For hver modal:
- Les pakken i modal-B.md
- Bruk tilhoerende HTML-wireframe (vedlegg) som visuell IA-referanse
- Generer modalen som UI-kit med korrekt designsystem
- Lever HVER STATE som SEPARAT HTML-fil (ikke state-katalog!)

Etter alle 3: samlet oversikt med alle thumbnails + design-links.

## Anti-state-katalog (KRITISK - REELT VIKTIG FOR DENNE BATCHEN)

Live Session-modalene har MANGE states (idle, aktiv, pause, ferdig, achievement, etc).
- **EEN produksjons-modal per HTML-fil** - aldri 5-7 captioned mini-mockups paa samme side
- Hver state som SEPARAT HTML-fil med klare suffikser:
  - `01-live-active-idle.html`, `01-live-active-mid-rep.html`, `01-live-active-pause.html`, `01-live-active-ferdig.html`
  - `02-live-between-default.html`, `02-live-between-pause.html`, `02-live-between-siste.html`
  - `03-live-summary-default.html`, `03-live-summary-confetti.html`, `03-live-summary-achievement.html`
- Default-state minimum 1440x900 viewport

## Felles modal-regler

- **Fullscreen-modal:** Ingen sidebar, bakgrunn `#0A1F18` (mork primary)
- **Topp-bar (56px):** Live-pill (lime pulserende) + kontekst-tekst venstre, mini-progress-bar senter, lukk-X 40x40px hoeyre
- **Counter:** JetBrains Mono 120px lime accent
- **Bunn-bar (88px):** `rounded-full` knapper, primary CTA hoeyre lime 88px, sekundaer venstre 56px
- **Anti-moenster:** Counter er ENESTE fokus paa Active. Mellom-skjermen er rik sammendrag + preview. Summary er FEIRENDE.

## Felles regler (gjelder ALLE modaler)

**Designsystem:** Bruk eksakt token-navn - aldri hardkode hex.

**Stil-krav:**
- Norsk bokmaal, AE/OE/AA, **komma som desimal** (12,4)
- **Mellomrom som tusenseparator** (1 600 kr)
- Maks 3 lime-elementer (#D1F843) synlig per state (Live-pill + counter + primary CTA = 3)
- Maks 1 italic Instrument Serif-element per state - reservert for hero/quote
- 8pt-grid (8/16/24/32/40/48/64)
- Lucide-ikoner, 1.75 stroke

**Anti-AI-regler:**
- ALDRI "Welcome back" eller "Klar for neste?"
- Hero paa Summary: italic *"6 av 6 oevelser. Bra jobba, Markus."*
- Flat farger paa avatarer, ingen gradient
- Bare lime gradient er tillatt: `#D1F843 -> #C2EE2F` paa progress-bar fill

**Referanse-personer:**
- Spiller: Markus Roinaas Pedersen (HCP 12,4)
- Coach: Anders Kristiansen (vises kun i feedback-seksjon paa Summary)
- OEkt-eksempel: "Putte-oekt onsdag" eller "TEK Driver - oekt 3 av 6"

**Pyramide-farger:** FYS `#16A34A` - TEK `#005840` - SLAG `#D1F843` - SPILL `#F4C430` - TURN `#5E5C57`

**Mental model per modal:**
- Active: "Hva er den ene handlingen?" - LOGG REP. Counter dominerer, alt annet er kontekst.
- Between: "Hva nettopp skjedde + hva kommer?" - sammendrag + preview, ikke abstrakt klar-melding.
- Summary: "Hva fullfoerte jeg?" - feiring + data + valgfri feedback til coach.

## Output per modal

Som angitt under "OEnsket output" i modal-B.md - hver state som separat HTML-fil.
Til sammen ca 14-16 HTML-filer for de 3 modalene.

## Start naa

Begynn med Pakke 1 (LiveActiveModal) og fortsett uten avbrudd.

Naar du er ferdig:
- Samlet oversikt med thumbnails gruppert per modal
- Liste med design-links
- Flagg evt. caveats
