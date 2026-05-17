# Custom prompt for Mini-batch 7-A - CoachHQ spesial-visninger

**Kopier ALT under linja inn i claude.ai/design som foerste melding i ny sesjon.**

Foer du sender prompten, last opp disse vedleggene:
1. `wireframe/brain/for-claude-design/branding-style-guide.html` (system-kontekst)
2. `wireframe/brain/for-claude-design/design-system-v2.md` (tekstlig backup)
3. Alle 20 .woff2-filer fra `wireframe/brain/for-claude-design/fonts/`
4. `wireframe/design-batches/batch-7-other/mini-batches/7-A.md` (mini-batch-spec)
5. Alle 5 HTML-filer listet i `7-A-vedlegg.txt`

---

# PROMPT (kopier fra og med denne linja):

Jeg har lastet opp et komplett designsystem og en mini-batch-spec (7-A.md) med 5 CoachHQ spesial-visninger som skal designes.

## Hva jeg vil

**Generer alle 5 skjermer i ETT loep** - ikke vent paa "neste" mellom hver. Lever dem som 5 paafolgende UI-kits i samme respons.

Rekkefoelge:
1. Pakke 1: Kalender (uke-grid med pyramide-stripes)
2. Pakke 2: Kapasitet (heatmap-grid fasilitet x tid)
3. Pakke 3: Finance (utvidet konsoll med stacked area chart)
4. Pakke 4: Facilities (master-detail med per-fasilitet-konfig)
5. Pakke 5: Reports (rapport-katalog 12 maler)

For hver skjerm:
- Les pakken-spec i parent-mappen (01- til 05-coachhq-*.md)
- Bruk tilhoerende HTML-wireframe (vedlegg) som visuell IA-referanse
- Generer skjermen som UI-kit med korrekt designsystem
- Ga rett til neste skjerm naar du er ferdig

Etter alle 5: lever en samlet oversikt med alle 5 thumbnails + design-links.

## Felles regler (gjelder ALLE 5 skjermer)

**Designsystem:** Bruk eksakt token-navn (--brand-primary, --pyr-fys, etc) - aldri hardkode hex.

**Stil-krav:**
- Norsk bokmaal, AE/OE/AA, **komma som desimal** (12,4 ikke 12.4), 24-timer
- **Mellomrom som tusenseparator** (1 600 kr, ikke 1.600)
- Maks 3 lime-elementer (#D1F843) synlig per skjerm
- 8pt-grid for spacing (8/16/24/32/40/48/64)
- Lucide-ikoner, 1.75 stroke
- Asymmetrisk layout (ikke 3x1 uniform)

**Anti-AI-regler (KRITISK):**
- ALDRI "God morgen, [Navn]" eller "Welcome back" - bruk italic editorial-fragment
- Eksempler: *"Onsdag morgen. 38 spillere venter."* / *"Hva venter paa godkjenning?"*
- Flat farger paa avatarer (ingen gradient)
- Ingen translateY(-3px) hover paa alt

**CoachHQ sidebar er TO-LAGS:** smal moerk rail (56px, #061210) + lys nav-kolonne (200px, #FAFAF7). Active item i nav: rgba(209,248,67,0.30) bg + #0A1F18 tekst.

**Referanse-personer:**
- CoachHQ: Anders Kristiansen (hovedcoach), Sara Pedersen, Tom Olsen
- Spillere som vises: Markus Roinaas Pedersen, Henrik Nilsen, Anna Karlsen, Mads Roenning, Lise Sandberg, Joachim Tangen, Emma Solberg, Lina Hellesund

**Lower-is-better metrics** (puttar, score, HCP): Vis nedgang som SUCCESS-groenn, oppgang som DANGER-roed.
**Higher-is-better metrics** (SG, distanse, antall okter, inntekt): Motsatt.

**Spesial-visninger - kalendere og grids:**
- Tidsblokker 06:00-22:00, 30-min slots
- "Naa"-linje roed horisontal paa dagens dato/klokkeslett
- Pyramide-stripe 4px venstre paa blokk hvis FYS/TEK/SLAG/SPILL/TURN
- Klikk blokk -> quick-popover med 2 aksjoner
- Klikk tom slot -> modal med pre-fylt tid

## Output per skjerm

For hver av de 5 skjermene, lever:
1. Hovedskjerm i lyst tema (default)
2. Hover-state paa kritiske elementer
3. Empty/loading-state hvor relevant
4. Mobil-versjon hvis layout endres dramatisk

## Start naa

Begynn med Pakke 1 (Kalender) og fortsett uten avbrudd til alle 5 er ferdige.

Naar du er helt ferdig:
- Samlet oversikt med alle 5 thumbnails
- Liste med design-links jeg kan kopiere til tracker
- Flagg evt. caveats/avvik per skjerm
