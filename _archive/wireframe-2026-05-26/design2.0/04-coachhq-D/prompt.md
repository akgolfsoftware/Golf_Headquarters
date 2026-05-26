# Custom prompt for Mini-batch coachhq-D - Spesial (BULK-versjon)

**Kopier ALT under linja inn i claude.ai/design som foerste melding i ny sesjon.**

Foer du sender prompten, last opp disse vedleggene:
1. `wireframe/brain/for-claude-design/branding-style-guide.html` (system-kontekst)
2. `wireframe/brain/for-claude-design/design-system-v2.md` (tekstlig backup)
3. Alle 20 .woff2-filer fra `wireframe/brain/for-claude-design/fonts/`
4. `wireframe/design-batches/redesign-arketype-e/felles-instruks.md` (anti-state-katalog-regel)
5. `wireframe/design-batches/mvp/coachhq/coachhq-D.md` (mini-batch-spec)
6. Alle HTML-filer listet i `coachhq-D-vedlegg.txt` (2 hovedskjermer + tilhoerende modaler)

---

# PROMPT (kopier fra og med denne linja):

Jeg har lastet opp et komplett designsystem, en felles-instruks for anti-state-katalog, og en mini-batch-spec (coachhq-D.md) med 2 CoachHQ-spesial-skjermer som skal designes.

## Hva jeg vil

**Generer begge skjermer i ETT loep** - ikke vent paa "neste" mellom hver. Lever dem som 2 paafolgende UI-kits i samme respons.

Rekkefoelge:
1. Pakke 1: Talent-pipeline (kanban A1/A2/A3 med drag-drop og drawer)
2. Pakke 2: Spiller-detalj light (6 tabs, kompakt 360)

For hver skjerm:
- Les pakken i coachhq-D.md
- Bruk tilhoerende HTML-wireframe (vedlegg) som visuell IA-referanse
- Generer skjermen som UI-kit med korrekt designsystem
- Ga rett til neste skjerm naar du er ferdig

Etter alle 2: lever en samlet oversikt med thumbnails + design-links.

## Anti-state-katalog (KRITISK)

Foelg felles-instruks.md eksakt:
- **EEN produksjons-skjerm per HTML-fil** - ikke captioned mini-mockups side-om-side
- Default-state rendret i full stoerrelse (minimum 1440x900 for desktop)
- Hvis flere states trengs (empty, loading, moerkt tema, mobil, drawer-aapen, drag-state, skadet-state): lever som SEPARATE HTML-filer med klare suffikser (f.eks. `01-talent-default.html`, `01-talent-drag.html`, `02-spiller-light-skadet.html`)

## Felles regler (gjelder BEGGE skjermer)

**Designsystem:** Bruk eksakt token-navn (--brand-primary, --pyr-fys, etc) - aldri hardkode hex.

**Stil-krav:**
- Norsk bokmaal, AE/OE/AA, **komma som desimal** (12,4 ikke 12.4), 24-timer
- **Mellomrom som tusenseparator** (1 600 kr, ikke 1.600)
- Maks 3 lime-elementer (#D1F843) synlig per skjerm
- Maks 1 italic Instrument Serif-element per skjerm - reservert for hero eller editorial quote
- 8pt-grid (8/16/24/32/40/48/64)
- Lucide-ikoner, 1.75 stroke
- Asymmetrisk layout (ikke 3x1 uniform)

**Anti-AI-regler (KRITISK):**
- ALDRI "God morgen, Anders" eller "Welcome back" - bruk italic editorial-fragment
- Eksempler: *"Hvem er klar for loeft, hvem trenger en pause."*
- Flat farger paa avatarer (ingen gradient)
- Ingen translateY(-3px) hover paa alt
- Bare lime gradient tillatt: `#D1F843 -> #C2EE2F` paa progress-bar fill

**CoachHQ-sidebar er TO-LAGS:** smal moerk rail (56px, #061210) ytterst venstre + lys nav-kolonne (200px, #FAFAF7). Total bredde 256px. Active item i nav: rgba(209,248,67,0.30) bg + #0A1F18 tekst.

**Referanse-personer:**
- Hovedcoach: Anders Kristiansen (NGF Trener IV)
- Spillere som vises:
  - A1: Markus Roinaas Pedersen (Elite, +2,4), Lina Hellesund (Elite, 4,1), Nora Vik (Elite, 5,8) + promo-kandidater Anders Nedrum (5,2), Mia Berg (4,9)
  - A2: Henrik Nilsen (Pro, 8,7), Emma Solberg (Pro, 8,7), Mads Roenning (Pro, 9,4), Joachim Tangen (Pro, 14,2 - skadet)
  - A3: Anna Karlsen (Free, 16,8), Lise Sandberg (Free, 19,5)
- Foresatte (for Henrik Nilsen): Anne Nilsen, Jan Nilsen

**Lower-is-better metrics** (HCP, score): Vis nedgang som SUCCESS-groenn.
**Higher-is-better metrics** (SG, distanse, antall oekter, badges): Motsatt.

**Pyramide-farger:** FYS `#16A34A` groenn, TEK `#005840` darker primary, SLAG `#D1F843` lime, SPILL `#F4C430` gold, TURN `#5E5C57` graa.

## Output per skjerm

For hver av de 2 skjermene, lever:
1. Hovedskjerm i lyst tema (default state, fullbleed 1440px+)
2. Moerkt tema (samme data, separat HTML)
3. EEN ekstra state-variasjon (drawer-aapen, drag-state, risiko-warning, skadet-baand, tab-bytte) hvor det gir verdi - separat HTML
4. Mobil <=640px hvis layout endres dramatisk - separat HTML

## Start naa

Begynn med Pakke 1 (Talent-pipeline) og fortsett uten avbrudd til begge er ferdige.

Naar du er helt ferdig:
- Samlet oversikt med begge thumbnails
- Liste med design-links jeg kan kopiere til tracker
- Flagg evt. caveats/avvik per skjerm
