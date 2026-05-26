# Custom prompt for Mini-batch 8-D - Web bedrift/talent/junior/sponsorer/jobb (BULK)

**Kopier ALT under linja inn i claude.ai/design som foerste melding i ny sesjon.**

Foer du sender prompten, last opp:
1. `wireframe/brain/for-claude-design/branding-style-guide.html`
2. `wireframe/brain/for-claude-design/design-system-v2.md`
3. Alle 20 .woff2-filer
4. `wireframe/screen-deck/web/_shared.css`
5. `wireframe/design-batches/batch-8-web/mini-batches/8-D.md`
6. Alle 5 HTML-filer i `8-D-vedlegg.txt`

---

# PROMPT (kopier fra og med denne linja):

Jeg har lastet opp et komplett designsystem og en mini-batch-spec (8-D.md) med 5 web-sider for akgolf.no som skal designes.

## Hva jeg vil

**Generer alle 5 sider i ETT loep.** Lever som 5 paafolgende UI-kits.

Rekkefoelge:
1. Pakke 1: For bedrifter (B2B mørk hero)
2. Pakke 2: Talent-program (selektivt mørk hero)
3. Pakke 3: Junior Academy (foreldre-pitch mørk hero)
4. Pakke 4: Sponsorer / partnere (subhero + logo-cards)
5. Pakke 5: Karriere (subhero + stillingsannonser)

For hver: les 8-D.md, bruk HTML-vedlegg, generer UI-kit, ga rett til neste.

Etter alle 5: samlet oversikt med thumbnails + design-links.

## VIKTIG - WEB skiller seg fra app-batches

- INGEN app-sidebar - bruk top-nav (sticky hvit 64px) + mega-footer (mørk #0A1F18)
- Pakke 1-3 = mørk hero #0A0A0A. Pakke 4-5 = subhero #0A1F18 -> #143027
- Tone-of-voice varierer per side:
  - **Bedrift:** profesjonelt, ROI-fokusert, ikke for casual
  - **Talent:** selektivt prestisje, "invite-only", ikke selger seg ut
  - **Junior:** trygt, faglig, kommuniserer til FORELDRE ikke barn
  - **Sponsorer:** takknemlig + autoritet
  - **Jobb:** ambisiost + ekte, ikke corporate-recruitment

## Felles regler

**Designsystem:** Eksakt token-navn.

**Stil:**
- Norsk bokmaal, AE/OE/AA, komma som desimal, mellomrom som tusenseparator (1 200 kr)
- Maks 2 lime-elementer per view
- 8pt-grid spacing
- Lucide-ikoner 1.5 stroke
- Inter Tight display, Inter body, JetBrains Mono tall

**Anti-AI:**
- ALDRI "Velkommen!" - bruk italic editorial: *"De beste. Vi finner dem."*, *"Goey golf. Skikkelig coaching."*
- ALDRI corporate-floskler
- ALDRI generiske CTA - bruk: `Soek seleksjon ->`, `Meld pa ->`, `Snakk med oss ->`, `Send apen soknad ->`
- Flat farger pa avatarer

**Hero-struktur (pakke 1-3):**
Mørk #0A0A0A. Eyebrow mono lime SMALL CAPS. Title Inter Tight 84px med italic lime keyword. Specs-rad mono SMALL CAPS. CTAs lime + outline white.

**Talent-spillere (pakke 2):**
8 ekte talent-spillere med foto + alder + HCP. Markus R. P. (22, +0.4), Lina Hellesund (17, 4.1), Mads Roenning (19, +1) + 5 til (kan vaere placeholder-navn).

**Junior-aldersgrupper (pakke 3):**
4 grupper: Mini 7-9 (Sara, Bossum), Junior 10-12 (Sara, Bossum+Mulligan), Talent jr 13-15 (Julie, Drobak+Mulligan), Senior jr 16-17 (Julie, Drobak+Mulligan). Tabell-format med dag/tid.

**Partnere (pakke 4):**
- TrackMan (tech, siden 2022) - Mizuno (utstyr, 2023) - Sbanken (bank, 2024) - WANG Toppidrett (skole, 2018)
- Klubber: GFGK, Bossum, Drobak GK, Mulligan Indoor
- Stotte: Skarpnord Invest, Mulligan Cafe, Olympiatoppen Sor-Norge

**Stillinger (pakke 5):**
4 ekte stillinger - Coach junior 50% (Drobak, aug), Full-stack utvikler (Fredrikstad/remote, asap), Driftansvarlig Mulligan (Fredrikstad, juni), Salgsansvarlig B2B (hybrid, asap).

**Top-nav + mega-footer:** samme som hele batch 8.

## Output per side

1. Hovedside lyst tema
2. Hover-states pa CTAs
3. Mobil <=640px hvor layout endres
4. Empty/loading hvor relevant (jobb: empty ingen apne)

## Start naa

Begynn med Pakke 1 (For bedrifter) og fortsett uten avbrudd.

Naar ferdig:
- Samlet oversikt med thumbnails
- Liste med design-links
- Flagg caveats per side
