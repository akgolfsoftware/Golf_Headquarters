# Custom prompt for Mini-batch coachhq-A - Plan-management (BULK-versjon)

**Kopier ALT under linja inn i claude.ai/design som foerste melding i ny sesjon.**

Foer du sender prompten, last opp disse vedleggene:
1. `wireframe/brain/for-claude-design/branding-style-guide.html` (system-kontekst)
2. `wireframe/brain/for-claude-design/design-system-v2.md` (tekstlig backup)
3. Alle 20 .woff2-filer fra `wireframe/brain/for-claude-design/fonts/`
4. `wireframe/design-batches/redesign-arketype-e/felles-instruks.md` (anti-state-katalog-regel)
5. `wireframe/design-batches/mvp/coachhq/coachhq-A.md` (mini-batch-spec)
6. Alle HTML-filer listet i `coachhq-A-vedlegg.txt` (5 hovedskjermer + tilhoerende modaler)

---

# PROMPT (kopier fra og med denne linja):

Jeg har lastet opp et komplett designsystem, en felles-instruks for anti-state-katalog, og en mini-batch-spec (coachhq-A.md) med 5 CoachHQ-plan-management-skjermer som skal designes.

## Hva jeg vil

**Generer alle 5 skjermer i ETT loep** - ikke vent paa "neste" mellom hver. Lever dem som 5 paafolgende UI-kits i samme respons.

Rekkefoelge:
1. Pakke 1: 360-spillerprofil (7 tabs, deep-dive)
2. Pakke 2: Plan-bygger (6-step wizard)
3. Pakke 3: Plan-detalj (5 tabs, operasjonelt view)
4. Pakke 4: Plan-redigering (5 tabs, edit-mode med drawer)
5. Pakke 5: Plan-templates (mal-bibliotek som kort-grid)

For hver skjerm:
- Les pakken i coachhq-A.md
- Bruk tilhoerende HTML-wireframe (vedlegg) som visuell IA-referanse
- Generer skjermen som UI-kit med korrekt designsystem
- Ga rett til neste skjerm naar du er ferdig

Etter alle 5: lever en samlet oversikt med alle 5 thumbnails + design-links.

## Anti-state-katalog (KRITISK)

Foelg felles-instruks.md eksakt:
- **EEN produksjons-skjerm per HTML-fil** - ikke captioned mini-mockups side-om-side
- Default-state rendret i full stoerrelse (minimum 1440x900 for desktop)
- Ingen "1 - Idle, 2 - Aktiv, 3 - Pause" varianter paa samme side
- Hvis flere states trengs (empty, loading, moerkt tema, mobil, wizard-steg): lever som SEPARATE HTML-filer med klare suffikser (f.eks. `02-plan-bygger-steg-1.html`, `02-plan-bygger-steg-3.html`, `02-plan-bygger-dark.html`)
- Wizard-steg (Plan-bygger pakke 2) leveres som SEPARATE HTML-filer per steg

## Felles regler (gjelder ALLE 5 skjermer)

**Designsystem:** Bruk eksakt token-navn (--brand-primary, --pyr-fys, etc) - aldri hardkode hex.

**Stil-krav:**
- Norsk bokmaal, AE/OE/AA, **komma som desimal** (12,4 ikke 12.4), 24-timer
- **Mellomrom som tusenseparator** (1 600 kr, 6 124 m, ikke 1.600 / 6,124)
- Maks 3 lime-elementer (#D1F843) synlig per skjerm
- Maks 1 italic Instrument Serif-element per skjerm - reservert for hero eller editorial quote
- 8pt-grid for spacing (8/16/24/32/40/48/64)
- Lucide-ikoner, 1.75 stroke
- Asymmetrisk layout (ikke 3x1 uniform)

**Anti-AI-regler (KRITISK):**
- ALDRI "God morgen, Anders" eller "Welcome back" - bruk italic editorial-fragment
- Eksempler: *"Onsdag morgen. 38 spillere venter."* / *"3 plan-aksjoner i koeen."* / *"Hvem er klar for loeft, hvem trenger en pause."*
- Flat farger paa avatarer (ingen gradient)
- Ingen translateY(-3px) hover paa alt
- Bare lime gradient er tillatt: `#D1F843 -> #C2EE2F` paa progress-bar fill

**CoachHQ-sidebar er TO-LAGS:** smal moerk rail (56px, #061210) ytterst venstre + lys nav-kolonne (200px, #FAFAF7). Total bredde 256px. Active item i nav: rgba(209,248,67,0.30) bg + #0A1F18 tekst. ALDRI enkelt-lag lys sidebar (PlayerHQ-moenster).

**Referanse-personer:**
- Hovedcoach: Anders Kristiansen (NGF Trener IV)
- Spillere som vises: Markus Roinaas Pedersen (Kat A, Elite, HCP +2,4), Henrik Nilsen (Pro, 8,7), Anna Karlsen (Free, 16,8), Mads Roenning (Pro, 9,4), Lise Sandberg (Free, 19,5), Joachim Tangen (Pro, 14,2 - skadet)

**Lower-is-better metrics** (HCP, score, puttar): Vis nedgang som SUCCESS-groenn, oppgang som DANGER-roed.
**Higher-is-better metrics** (SG, distanse, antall oekter): Motsatt.

**Pyramide-farger:** FYS `#16A34A` groenn, TEK `#005840` darker primary, SLAG `#D1F843` lime, SPILL `#F4C430` gold, TURN `#5E5C57` graa.

## Output per skjerm

For hver av de 5 skjermene, lever:
1. Hovedskjerm i lyst tema (default state, fullbleed 1440px+)
2. Moerkt tema (samme data, separat HTML)
3. EEN ekstra state-variasjon (empty, hover, tab-bytte, drawer, sliders, mal-grid) hvor det gir verdi - separat HTML
4. Wizard-steg (kun for pakke 2 Plan-bygger): hvert steg som egen HTML (`02-plan-bygger-steg-{1..6}.html`)
5. Mobil <=640px hvis layout endres dramatisk - separat HTML

## Start naa

Begynn med Pakke 1 (360-spillerprofil) og fortsett uten avbrudd til alle 5 er ferdige.

Naar du er helt ferdig:
- Samlet oversikt med alle 5 thumbnails
- Liste med design-links jeg kan kopiere til tracker
- Flagg evt. caveats/avvik per skjerm
