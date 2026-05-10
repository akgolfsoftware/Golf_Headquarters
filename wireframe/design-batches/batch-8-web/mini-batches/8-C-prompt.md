# Custom prompt for Mini-batch 8-C - Web blogg/cases/B2B-klubb (BULK)

**Kopier ALT under linja inn i claude.ai/design som foerste melding i ny sesjon.**

Foer du sender prompten, last opp:
1. `wireframe/brain/for-claude-design/branding-style-guide.html`
2. `wireframe/brain/for-claude-design/design-system-v2.md`
3. Alle 20 .woff2-filer
4. `wireframe/screen-deck/web/_shared.css`
5. `wireframe/design-batches/batch-8-web/mini-batches/8-C.md`
6. Alle 5 HTML-filer i `8-C-vedlegg.txt`

---

# PROMPT (kopier fra og med denne linja):

Jeg har lastet opp et komplett designsystem og en mini-batch-spec (8-C.md) med 5 web-sider for akgolf.no som skal designes.

## Hva jeg vil

**Generer alle 5 sider i ETT loep.** Lever som 5 paafolgende UI-kits.

Rekkefoelge:
1. Pakke 1: Blogg-liste (magazine-grid 12 artikler)
2. Pakke 2: Blogg-artikkel (long-form editorial)
3. Pakke 3: Cases (suksesshistorier-grid)
4. Pakke 4: Case-detalj Markus R. P. (STAR-format)
5. Pakke 5: For klubber (B2B-pitch mørk hero)

For hver: les 8-C.md, bruk HTML-vedlegg, generer UI-kit, ga rett til neste.

Etter alle 5: samlet oversikt med thumbnails + design-links.

## VIKTIG - WEB skiller seg fra app-batches

- Web-sider er OFFENTLIGE markedsforingssider, IKKE app-skjermer
- INGEN app-sidebar - bruk top-nav (sticky hvit 64px) + mega-footer (mørk #0A1F18)
- Pakke 1-2 = subhero (blogg). Pakke 3 = subhero (cases). Pakke 4 = mørk hero (case-detalj). Pakke 5 = mørk hero (B2B-klubb)
- Editorial-tone for blogg, faglig social-proof for cases, formelt-konkret for B2B-klubb

## Felles regler

**Designsystem:** Eksakt token-navn, ALDRI hardkode hex.

**Stil:**
- Norsk bokmaal, AE/OE/AA, komma som desimal, mellomrom som tusenseparator
- Maks 2 lime-elementer per view
- 8pt-grid spacing
- Lucide-ikoner 1.5 stroke
- Inter Tight display, Inter body, JetBrains Mono tall
- Italic Instrument Serif for editorial sitater og long-form block-quotes

**Anti-AI (KRITISK):**
- ALDRI "Velkommen!" - bruk italic editorial: *"Tanker fra baneside."*, *"Det er spillerne som teller."*
- ALDRI corporate-floskler
- ALDRI generiske CTA - bruk: `Les artikkel ->`, `Book mote ->`, `Les hele historien ->`
- Flat farger pa avatarer
- Ingen translateY-overload

**Reading-progress-bar (blogg-artikkel):**
3px sticky toppen. Lime fyll vokser fra 0% til 100% med scroll.

**Block-quote-style (artikkel-body + cases-sitater):**
Instrument Serif italic 24-32px. Venstre-border 3px lime. Padding 24px. Forfatter-cite mindre, ikke italic.

**HCP-graf (case-detalj):**
Line chart 14 mnd. Lime line + dots. X-aksen mnd, Y-aksen HCP. Annotations pa nokkel-momenter (forste TrackMan, forste NGF-poeng).

**Metric-pills (cases):**
Mono store tall. `HCP: 14 -> +0.4` med delta-tall i lime hvis success. CheckCircle2 hvis ja, dot hvis ikke.

**Top-nav + mega-footer:** samme som hele batch 8.

**Reelle personer (gjelder hele batch):**
- Anders Kristiansen (Head Coach, Founder)
- Julie Solem, Markus R. P., Sara Lien, Emil Halvorsen (coaches)
- Spillere i cases: Markus R. P., Lina Hellesund, Mads Roenning, Tor Erik Kjelby, Hanne Solberg, Per Bossum, Emma Solberg, Anna Karlsen, Joachim Tangen

## Output per side

1. Hovedside lyst tema (default for web)
2. Hover-states pa CTAs
3. Mobil <=640px hvor layout endres
4. Empty/loading hvor relevant
5. Variant for case-detalj (Tor Erik)

## Start naa

Begynn med Pakke 1 (Blogg-liste) og fortsett uten avbrudd.

Naar ferdig:
- Samlet oversikt med thumbnails
- Liste med design-links
- Flagg caveats per side
