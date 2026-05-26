# Custom prompt for Mini-batch coachhq-B - Operative dashboards (BULK-versjon)

**Kopier ALT under linja inn i claude.ai/design som foerste melding i ny sesjon.**

Foer du sender prompten, last opp disse vedleggene:
1. `wireframe/brain/for-claude-design/branding-style-guide.html` (system-kontekst)
2. `wireframe/brain/for-claude-design/design-system-v2.md` (tekstlig backup)
3. Alle 20 .woff2-filer fra `wireframe/brain/for-claude-design/fonts/`
4. `wireframe/design-batches/redesign-arketype-e/felles-instruks.md` (anti-state-katalog-regel)
5. `wireframe/design-batches/mvp/coachhq/coachhq-B.md` (mini-batch-spec)
6. Alle HTML-filer listet i `coachhq-B-vedlegg.txt` (5 hovedskjermer + tilhoerende modaler)

---

# PROMPT (kopier fra og med denne linja):

Jeg har lastet opp et komplett designsystem, en felles-instruks for anti-state-katalog, og en mini-batch-spec (coachhq-B.md) med 5 CoachHQ-operative-dashboard-skjermer som skal designes.

## Hva jeg vil

**Generer alle 5 skjermer i ETT loep** - ikke vent paa "neste" mellom hver. Lever dem som 5 paafolgende UI-kits i samme respons.

Rekkefoelge:
1. Pakke 1: Daglig brief (sekvensielt narrativ, morgen-rapport)
2. Pakke 2: Fasiliteter (master-detail 30/70 konfig)
3. Pakke 3: Analytics V2 (multi-pane 4 kvadranter)
4. Pakke 4: Revisjonslogg (vertikal timeline)
5. Pakke 5: Rapporter (mal-katalog + right-rail)

For hver skjerm:
- Les pakken i coachhq-B.md
- Bruk tilhoerende HTML-wireframe (vedlegg) som visuell IA-referanse
- Generer skjermen som UI-kit med korrekt designsystem
- Ga rett til neste skjerm naar du er ferdig

Etter alle 5: lever en samlet oversikt med alle 5 thumbnails + design-links.

## Anti-state-katalog (KRITISK)

Foelg felles-instruks.md eksakt:
- **EEN produksjons-skjerm per HTML-fil** - ikke captioned mini-mockups side-om-side
- Default-state rendret i full stoerrelse (minimum 1440x900 for desktop)
- Hvis flere states trengs (empty, loading, moerkt tema, mobil, print): lever som SEPARATE HTML-filer med klare suffikser (f.eks. `01-daglig-brief-default.html`, `01-daglig-brief-print.html`, `01-daglig-brief-dark.html`)

## Felles regler (gjelder ALLE 5 skjermer)

**Designsystem:** Bruk eksakt token-navn (--brand-primary, --pyr-fys, etc) - aldri hardkode hex.

**Stil-krav:**
- Norsk bokmaal, AE/OE/AA, **komma som desimal** (12,4 ikke 12.4), 24-timer
- **Mellomrom som tusenseparator** (142 800 kr, 1 247 events, ikke 142.800 / 1,247)
- Maks 3 lime-elementer (#D1F843) synlig per skjerm
- Maks 1 italic Instrument Serif-element per skjerm - reservert for hero
- 8pt-grid (8/16/24/32/40/48/64)
- Lucide-ikoner, 1.75 stroke
- Asymmetrisk layout (ikke 3x1 uniform)

**Anti-AI-regler (KRITISK):**
- ALDRI "God morgen, Anders" eller "Welcome back" - bruk italic editorial-fragment
- Eksempler: *"Onsdag 11. mai. 6 oekter paa timeplanen."* / *"Hva trenger du aa rapportere?"*
- Flat farger paa avatarer (ingen gradient)
- Ingen translateY(-3px) hover paa alt
- Bare lime gradient tillatt: `#D1F843 -> #C2EE2F` paa progress-bar fill

**CoachHQ-sidebar er TO-LAGS:** smal moerk rail (56px, #061210) ytterst venstre + lys nav-kolonne (200px, #FAFAF7). Total bredde 256px. Active item i nav: rgba(209,248,67,0.30) bg + #0A1F18 tekst.

**Referanse-personer:**
- Hovedcoach: Anders Kristiansen (NGF Trener IV)
- Spillere som vises: Markus Roinaas Pedersen, Henrik Nilsen, Anna Karlsen, Mads Roenning, Lise Sandberg, Joachim Tangen

**Lower-is-better metrics** (HCP, score, puttar): Vis nedgang som SUCCESS-groenn.
**Higher-is-better metrics** (SG, distanse, antall oekter, inntekt, belegg): Motsatt.

**Pyramide-farger:** FYS `#16A34A` groenn, TEK `#005840` darker primary, SLAG `#D1F843` lime, SPILL `#F4C430` gold, TURN `#5E5C57` graa.

## Output per skjerm

For hver av de 5 skjermene, lever:
1. Hovedskjerm i lyst tema (default state, fullbleed 1440px+)
2. Moerkt tema (samme data, separat HTML)
3. EEN ekstra state-variasjon (empty, hover, compare-overlay, expanded-diff, loading) hvor det gir verdi - separat HTML
4. Mobil <=640px hvis layout endres dramatisk - separat HTML
5. Print-variant for Daglig brief (pakke 1) - separat HTML

## Start naa

Begynn med Pakke 1 (Daglig brief) og fortsett uten avbrudd til alle 5 er ferdige.

Naar du er helt ferdig:
- Samlet oversikt med alle 5 thumbnails
- Liste med design-links jeg kan kopiere til tracker
- Flagg evt. caveats/avvik per skjerm
