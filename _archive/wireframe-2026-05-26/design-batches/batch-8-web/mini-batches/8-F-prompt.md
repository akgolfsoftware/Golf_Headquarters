# Custom prompt for Mini-batch 8-F - Web edge cases + komponenter (BULK)

**Kopier ALT under linja inn i claude.ai/design som foerste melding i ny sesjon.**

Foer du sender prompten, last opp:
1. `wireframe/brain/for-claude-design/branding-style-guide.html`
2. `wireframe/brain/for-claude-design/design-system-v2.md`
3. Alle 20 .woff2-filer
4. `wireframe/screen-deck/web/_shared.css`
5. `wireframe/design-batches/batch-8-web/mini-batches/8-F.md`
6. Alle 5 HTML-filer i `8-F-vedlegg.txt`

---

# PROMPT (kopier fra og med denne linja):

Jeg har lastet opp et komplett designsystem og en mini-batch-spec (8-F.md) med 5 pakker for akgolf.no som skal designes - 2 edge-case-sider (404, 500) + 3 komponenter (footer, nav, newsletter) som brukes paa tvers av alle 30 sider.

## Hva jeg vil

**Generer alle 5 pakker i ETT loep.** Lever som 5 paafolgende UI-kits.

Rekkefoelge:
1. Pakke 1: 404-side (sentrert hero med stor "404")
2. Pakke 2: 500-error (sentrert hero med stor "500" + error-ID)
3. Pakke 3: Mega-footer (4-kolonne komponent)
4. Pakke 4: Header / top-nav (sticky komponent + mobile drawer)
5. Pakke 5: Newsletter (4 varianter)

For hver: les 8-F.md, bruk HTML-vedlegg, generer UI-kit, ga rett til neste.

Etter alle 5: samlet oversikt med thumbnails + design-links.

## VIKTIG - WEB skiller seg fra app-batches

- 404 og 500 har samme top-nav + footer som alle andre sider
- Footer og header er KOMPONENTER, ikke sider - vis i kontekst pa en placeholder-side
- Newsletter har 4 varianter som maa vises hver for seg
- Tone:
  - **404:** Lett-humoristisk men nyttig - aldri "oops!"-cliche
  - **500:** Apologetisk men ikke panisk - "det er oss, ikke deg"
  - **Footer:** Konsekvent merkevare-uttrykk
  - **Header:** Klart hierarki, alltid synlig logg-inn + CTA
  - **Newsletter:** Lavt-friction, tydelig verdiforslag

## Felles regler

**Designsystem:** Eksakt token-navn.

**Stil:**
- Norsk bokmaal, AE/OE/AA, komma som desimal, mellomrom som tusenseparator
- Maks 2 lime-elementer per view
- 8pt-grid spacing
- Lucide-ikoner 1.5 stroke
- Inter Tight display, Inter body, JetBrains Mono tall
- Italic Instrument Serif for editorial fragments

**Anti-AI:**
- 404: italic editorial - *"Hmm. Den siden er out of bounds."* (bruk golf-metafor)
- 500: italic - *"Noe gikk galt. Vi vet det."* (apologetisk men profesjonell)
- ALDRI generiske CTA - bruk: `Tilbake til forsiden`, `Kontakt support`, `Last inn paa nytt`, `Abonner ->`

**404-spec:**
- Stor `404` Inter Tight 240px italic, lime fade fra accent til dempet gra
- 4 quick-link-cards i grid-2 (Forsiden, Tjenester, Coaches, Kontakt)
- Sok-felt valgfri (vises ved klikk pa toggle)

**500-spec:**
- Stor `500` Inter Tight 240px italic, dempet destructive rod fade (#A32D2D)
- Error-ID i mono: `ERROR-ID: ABC123 · 14:32:08`
- 3 alternativer: Last inn paa nytt + Tilbake til forsiden + Kontakt support
- Status-link til status.akgolf.no

**Mega-footer-spec:**
- Mørk #0A1F18, 4 kolonner (max-width 1200px)
- Kolonne 1 (2fr): brand + tagline italic + newsletter-mini + 4 sosiale-ikoner
- Kolonne 2: Tjenester (6 lenker)
- Kolonne 3: Selskap (7 lenker)
- Kolonne 4: Juridisk (4 lenker)
- Bunn-rad: copyright venstre + "Bygget i Fredrikstad. Med kjaerlighet." hoyre

**Header-spec:**
- Sticky hvit 64px (krymper til 56px etter scroll > 80px med skygge)
- Logo venstre, nav midt (7 lenker), CTAs hoyre ("Logg inn" text + "Kom i gang" mørkegrønn pill)
- Active page faar lime underline 2px
- Tjenester har dropdown (full-width, hover trigger, 8 tjenester i grid-4)
- Mobile burger -> drawer fra hoyre 320px

**Newsletter-spec (4 varianter):**
- A: Mini i footer (email + Abonner inline)
- B: Mid-page mørkt CTA-band (sentrert, eyebrow + H2 + form)
- C: Blogg-artikkel inline (lys-sand card, kompakt)
- D: Standalone /nyhetsbrev (full side med subhero + form med 3 felt + social proof eksempel-utgaver)

**Reelle org-detaljer (footer):**
- AK Golf Group AS · Org. 920 117 824 · Fredrikstad
- @akgolfacademy (IG), Anders Kristiansen (LinkedIn), AK Golf (YouTube), @akgolfgroup (X)

## Output per pakke

**Pakke 1 (404):**
1. Default 404-side
2. Sok-felt aktivt med tekst
3. Mobil <=640px

**Pakke 2 (500):**
1. Default 500-side
2. Mobil <=640px

**Pakke 3 (Footer):**
1. Default mørk footer
2. Email-input fokusert
3. Mobil <=640px (1-kol)
4. Tablet 768-1023px (2x2)
5. Submit success-state

**Pakke 4 (Header):**
1. Desktop default (paa /tjenester active)
2. Sticky-state (scrollet)
3. Tjenester-dropdown apen
4. Mobile burger closed
5. Mobile drawer apen
6. Hover "Kom i gang"

**Pakke 5 (Newsletter):**
1. Variant A footer mini
2. Variant B mørkt CTA-band
3. Variant C blogg inline
4. Variant D standalone full side
5. Submit success-state
6. Mobil <=640px

## Start naa

Begynn med Pakke 1 (404) og fortsett uten avbrudd.

Naar ferdig:
- Samlet oversikt med thumbnails
- Liste med design-links
- Flagg caveats per pakke
