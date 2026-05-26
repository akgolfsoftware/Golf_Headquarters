# Custom prompt for Mini-batch 8-A - Web foreside og kjerne (BULK-versjon)

**Kopier ALT under linja inn i claude.ai/design som foerste melding i ny sesjon.**

Foer du sender prompten, last opp disse vedleggene:
1. `wireframe/brain/for-claude-design/branding-style-guide.html` (system-kontekst)
2. `wireframe/brain/for-claude-design/design-system-v2.md` (tekstlig backup)
3. Alle 20 .woff2-filer fra `wireframe/brain/for-claude-design/fonts/`
4. `wireframe/screen-deck/web/_shared.css` (web-spesifikke styles)
5. `wireframe/design-batches/batch-8-web/mini-batches/8-A.md` (mini-batch-spec)
6. Alle 5 HTML-filer listet i `8-A-vedlegg.txt`

---

# PROMPT (kopier fra og med denne linja):

Jeg har lastet opp et komplett designsystem og en mini-batch-spec (8-A.md) med 5 web-sider for akgolf.no som skal designes.

## Hva jeg vil

**Generer alle 5 sider i ETT loep** - ikke vent paa "neste" mellom hver. Lever dem som 5 paafolgende UI-kits i samme respons.

Rekkefoelge:
1. Pakke 1: Hjemmeside (mørk hero "Tren smartere. Spill bedre.")
2. Pakke 2: Om AK Golf (Anders' historie + tidslinje)
3. Pakke 3: Coach-liste (5 coaches)
4. Pakke 4: Coach-profil Anders (long-form public profil)
5. Pakke 5: Tjeneste-oversikt (8 tjenester grid)

For hver side:
- Les pakken i 8-A.md
- Bruk tilhoerende HTML-wireframe (vedlegg) som visuell IA-referanse
- Generer siden som UI-kit med korrekt designsystem
- Ga rett til neste side naar du er ferdig

Etter alle 5: lever en samlet oversikt med alle 5 thumbnails + design-links.

## VIKTIG - WEB skiller seg fra app-batches

- Web-sider er OFFENTLIGE markedsforingssider, IKKE app-skjermer
- INGEN app-sidebar - bruk top-nav (sticky hvit 64px) + mega-footer (mørk #0A1F18)
- Mørk landing hero #0A0A0A som signature
- Marketing-tone (varm, konkret, aldri corporate-floskler)
- Anders K som CEO, faktiske coach-navn (Julie Solem, Markus R. P., Emil Halvorsen, Sara Lien)
- Faktiske klubber: Bossum, Fredrikstad GK (GFGK), Mulligan Indoor, Drobak GK
- Reelle priser: 1:1 = 1 600 kr/time, Pro = 299/mnd, Elite = 799/mnd, Junior = 1 200/mnd
- Partnere: TrackMan, Mizuno, Sbanken, WANG Toppidrett

## Felles regler (gjelder ALLE 5 sider)

**Designsystem:** Bruk eksakt token-navn (--brand-primary, --accent etc) - aldri hardkode hex.

**Stil-krav:**
- Norsk bokmaal, AE/OE/AA, **komma som desimal** (12,4 ikke 12.4), 24-timer
- **Mellomrom som tusenseparator** (1 600 kr, ikke 1.600)
- Maks 2 lime-elementer (#D1F843) synlig per view
- 8pt-grid for spacing (8/16/24/32/40/48/64)
- Lucide-ikoner, 1.5 stroke
- Asymmetrisk layout (ikke 3x1 uniform)

**Typografi (web-spesifikk):**
- Inter Tight for h1/h2/h3 (display)
- Inter for body
- JetBrains Mono for tall, datoer, eyebrows
- Italic Instrument Serif kun pa editorial sitater

**Anti-AI-regler (KRITISK):**
- ALDRI "Velkommen!" eller "Hei kjaere kunde" - bruk italic editorial-fragment
- Eksempler: *"Onsdag morgen. 38 spillere venter."* / *"Det starter med en samtale."*
- ALDRI corporate-floskler: synergi, best in class, world-class, neste generasjon
- ALDRI generiske CTA: "Lær mer" - bruk konkret: `Book intro ->`, `Se priser ->`
- Flat farger paa avatarer (ingen gradient)
- Ingen translateY(-3px) hover paa alt

**Hero-struktur:**
- Mørk hero #0A0A0A med dempet golf-bane-monster i 5% opacity (eller flat)
- Eyebrow: mono lime SMALL CAPS
- Title: Inter Tight 84px med italic lime paa keyword
- Sub: rgba(255,255,255,0.7), max 600px sentrert
- CTAs: lime pill primary + outline white secondary

**Top-nav:**
Sticky hvit 64px. Logo venstre. Nav midt: Om - Tjenester - Coaches - Anlegg - Priser - Blogg - Kontakt. Hoyre: "Logg inn" + "Kom i gang" (mørkegrønn pill).

**Mega-footer:**
Mørk #0A1F18, 4 kolonner. Kolonne 1: brand + tagline + nyhetsbrev-mini + sosiale. Kolonne 2: Tjenester. Kolonne 3: Selskap. Kolonne 4: Juridisk. Bunn-rad: `(C) 2026 AK Golf Group AS · Org. 920 117 824 · Fredrikstad`.

**Referanse-personer (gjelder hele batch 8):**
- Anders Kristiansen (CEO, Head Coach)
- Julie Solem (junior-spesialist)
- Markus R. Pedersen (talent-coach + spillertalent)
- Sara Lien (TrackMan-analytiker)
- Emil Halvorsen (voksen-spesialist)
- Spillere som vises: Markus R. P., Lina Hellesund, Mads Roenning, Tor Erik Kjelby, Emma Solberg, Joachim Tangen

## Output per side

For hver av de 5 sidene, lever:
1. Hovedside i lyst tema (default for web)
2. Hover-state paa 1-2 kritiske CTA-er
3. Mobil <=640px hvor layout endres dramatisk
4. Empty/loading-state hvor relevant

## Start naa

Begynn med Pakke 1 (Hjemmeside) og fortsett uten avbrudd til alle 5 er ferdige.

Naar du er helt ferdig:
- Samlet oversikt med alle 5 thumbnails
- Liste med design-links jeg kan kopiere til tracker
- Flagg evt. caveats/avvik per side
