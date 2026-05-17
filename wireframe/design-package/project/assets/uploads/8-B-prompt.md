# Custom prompt for Mini-batch 8-B - Web tjeneste/anlegg/priser/kontakt (BULK)

**Kopier ALT under linja inn i claude.ai/design som foerste melding i ny sesjon.**

Foer du sender prompten, last opp:
1. `wireframe/brain/for-claude-design/branding-style-guide.html`
2. `wireframe/brain/for-claude-design/design-system-v2.md`
3. Alle 20 .woff2-filer
4. `wireframe/screen-deck/web/_shared.css`
5. `wireframe/design-batches/batch-8-web/mini-batches/8-B.md`
6. Alle 5 HTML-filer i `8-B-vedlegg.txt`

---

# PROMPT (kopier fra og med denne linja):

Jeg har lastet opp et komplett designsystem og en mini-batch-spec (8-B.md) med 5 web-sider for akgolf.no som skal designes.

## Hva jeg vil

**Generer alle 5 sider i ETT loep.** Lever som 5 paafolgende UI-kits.

Rekkefoelge:
1. Pakke 1: Tjeneste-detalj (1:1 coaching som referanse)
2. Pakke 2: Anlegg-liste (kart + 4 anlegg)
3. Pakke 3: Anlegg-detalj (Mulligan Indoor)
4. Pakke 4: Priser (3 tiers + 1:1 + B2B teaser)
5. Pakke 5: Kontakt (split-form info + skjema)

For hver: les 8-B.md, bruk HTML-vedlegg som IA-referanse, generer UI-kit, ga rett til neste.

Etter alle 5: samlet oversikt med thumbnails + design-links.

## VIKTIG - WEB skiller seg fra app-batches

- INGEN app-sidebar - bruk top-nav (sticky hvit 64px) + mega-footer (mørk #0A1F18)
- Disse 5 har ikke mørk landing-hero (kun anlegg-detalj har det). Resten bruker subhero #0A1F18 -> #143027
- Marketing-tone (varm, transparent, lett aa beslutte)
- Reelle priser: 1:1 = 1 600 kr/time, Pro = 299/mnd, Elite = 799/mnd, Junior = 1 200/mnd
- Reelle anlegg: Mulligan Indoor, GFGK Range, Bossum, Drobak GK
- Anders Kristiansen + Julie Solem + Markus R. P. + Sara Lien + Emil Halvorsen

## Felles regler (gjelder ALLE 5 sider)

**Designsystem:** Eksakt token-navn, aldri hardkode hex.

**Stil:**
- Norsk bokmaal, AE/OE/AA, komma som desimal, mellomrom som tusenseparator (1 600 kr)
- Maks 2 lime-elementer per view
- 8pt-grid spacing
- Lucide-ikoner 1.5 stroke
- Inter Tight display, Inter body, JetBrains Mono tall
- Italic Instrument Serif kun pa editorial sitater

**Anti-AI:**
- ALDRI "Velkommen!" - bruk italic editorial: *"Klar pris, uten triks."*
- ALDRI corporate-floskler
- ALDRI generiske CTA - bruk konkret: `Book intro ->`, `Se priser ->`
- Flat farger pa avatarer
- Ingen translateY-overload

**Pris-card-spec (priser-siden):**
- Pro skal ha lime-ring (2px) + lime `MEST POPULÆRE`-badge oeverst
- Pris i mono-font 32px, sub i Inter
- CTA pa Free/Elite = outline, pa Pro = lime pill
- Bullets med Lucide CheckCircle2 lime hvis inkludert

**Form-spec (kontakt-siden):**
- 5 felt total (ikke flere)
- Fokus-state: lime ring 2px
- Error-state: rod ring + inline rod tekst under felt
- Success: hele form erstattes med CheckCircle2-card

**Top-nav:**
Sticky hvit 64px. Logo venstre. Nav midt. CTAs hoyre. Active page faar lime underline.

**Mega-footer:**
Mørk #0A1F18, 4 kolonner (brand+nyhetsbrev / tjenester / selskap / juridisk).

## Output per side

1. Hovedside lyst tema
2. 1-2 hover-states pa CTAs
3. Mobil <=640px hvor layout endres
4. Empty/loading hvor relevant

## Start naa

Begynn med Pakke 1 (Tjeneste-detalj 1:1) og fortsett uten avbrudd til alle 5 er ferdige.

Naar du er helt ferdig:
- Samlet oversikt med thumbnails
- Liste med design-links
- Flagg caveats per side
