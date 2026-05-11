# Custom prompt for Mini-batch 8-E - Web sammenlign/FAQ/legal (BULK)

**Kopier ALT under linja inn i claude.ai/design som foerste melding i ny sesjon.**

Foer du sender prompten, last opp:
1. `wireframe/brain/for-claude-design/branding-style-guide.html`
2. `wireframe/brain/for-claude-design/design-system-v2.md`
3. Alle 20 .woff2-filer
4. `wireframe/screen-deck/web/_shared.css`
5. `wireframe/design-batches/batch-8-web/mini-batches/8-E.md`
6. Alle 5 HTML-filer i `8-E-vedlegg.txt`

---

# PROMPT (kopier fra og med denne linja):

Jeg har lastet opp et komplett designsystem og en mini-batch-spec (8-E.md) med 5 web-sider for akgolf.no som skal designes.

## Hva jeg vil

**Generer alle 5 sider i ETT loep.** Lever som 5 paafolgende UI-kits.

Rekkefoelge:
1. Pakke 1: Sammenlign tjenester (wizard + tabell)
2. Pakke 2: FAQ (kategorisert + sok)
3. Pakke 3: Personvern (GDPR long-form + TOC)
4. Pakke 4: Vilkar (juridisk long-form + TOC)
5. Pakke 5: Cookies (policy + preferanse-modul)

For hver: les 8-E.md, bruk HTML-vedlegg, generer UI-kit, ga rett til neste.

Etter alle 5: samlet oversikt med thumbnails + design-links.

## VIKTIG - WEB skiller seg fra app-batches

- INGEN app-sidebar - bruk top-nav (sticky hvit 64px) + mega-footer (mørk #0A1F18)
- Alle 5 har subhero (kort 64-80px), ingen mørk landing-hero
- Tone: hjelpsomt, ryddig, tillitsbyggende. ALDRI advokat-koden, ALDRI condescending

## Felles regler

**Designsystem:** Eksakt token-navn.

**Stil:**
- Norsk bokmaal, AE/OE/AA, komma som desimal, mellomrom som tusenseparator
- Maks 2 lime-elementer per view
- 8pt-grid spacing
- Lucide-ikoner 1.5 stroke
- Inter Tight display, Inter body, JetBrains Mono tall

**Anti-AI:**
- ALDRI "Velkommen!" - bruk editorial: *"Spillereglene. For begge."*, *"Vi har svaret. Sannsynligvis."*
- ALDRI advokat-koden eller corporate-tunge ord
- ALDRI generiske CTA - bruk: `Send foresporsel ->`, `Lagre preferanser`

**TOC-spec (personvern + vilkar):**
Sticky venstre 280px. Ankerlenker. Aktiv seksjon = lime venstre-border 3px + bold tekst.
Mobil: TOC blir collapsible accordion toppen.

**Wizard-spec (sammenlign):**
3 stegs i en card. Hver steg: 4 valg som radio-pills. Selected = lime bg + lime tekst. Etter steg 3: anbefalt-card vises med "Vi anbefaler: {tjeneste}" + CTA.

**Sammenlign-tabell (sammenlign):**
8 kolonner x ~12 rader. Sticky kolonne-header. CheckCircle2 lime hvis included, dempet gra dot hvis ikke. Hover pa rad: subtle bg-shift.

**Cookie-toggle (cookies):**
Custom toggle 40x24 px. Off = gra bg + sirkel venstre. On = lime bg + sirkel hoyre. Disabled = enda mer dempet, ingen interaksjon.

**FAQ-accordion (FAQ-side):**
Sporsmal-rad har chevron hoyre. Collapsed: chevron ned. Expanded: chevron opp + svar fades inn fra hoyde 0.

**Top-nav + mega-footer:** samme som hele batch 8.

**Reelle org-detaljer:**
- AK Golf Group AS, org. 920 117 824
- Storgata 12, 1607 Fredrikstad
- +47 482 35 700, hei@akgolf.no, personvern@akgolf.no
- Sist oppdatert: 10. mai 2026

## Output per side

1. Hovedside lyst tema
2. Variant-state der relevant (FAQ expanded, wizard fullfort, cookies aksepter alle)
3. Mobil <=640px hvor layout endres
4. Hover/focus pa kritiske elementer

## Start naa

Begynn med Pakke 1 (Sammenlign) og fortsett uten avbrudd.

Naar ferdig:
- Samlet oversikt med thumbnails
- Liste med design-links
- Flagg caveats per side
