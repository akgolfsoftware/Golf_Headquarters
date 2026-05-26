# Custom prompt for Mini-batch 7-E - Tverrgaaende katalog-flater 5-9

**Kopier ALT under linja inn i claude.ai/design som foerste melding i ny sesjon.**

Foer du sender prompten, last opp:
1. `wireframe/brain/for-claude-design/branding-style-guide.html`
2. `wireframe/brain/for-claude-design/design-system-v2.md`
3. Alle 20 .woff2-filer
4. `wireframe/design-batches/batch-7-other/mini-batches/7-E.md`
5. Alle 5 HTML-filer listet i `7-E-vedlegg.txt`

---

# PROMPT (kopier fra og med denne linja):

Jeg har lastet opp designsystem og mini-batch-spec (7-E.md) med 5 tverrgaaende katalog-flater.

## Hva jeg vil

**Generer alle 5 skjermer i ETT loep.** Lever som 5 UI-kits.

Rekkefoelge:
1. CBAC-matrise (rolle x capability)
2. Datakilder-matrise (kilde x konsument)
3. Signal-typer-katalog (28 typer i grid)
4. Plan-aksjon-typer (15 typer i grid)
5. Design-tokens viewer (6 tabs)

For hver: les spec (21-, 22-, 23-, 24-, 25-*.md), bruk HTML-vedlegg som IA-referanse, generer UI-kit.

Etter alle 5: samlet oversikt + design-links.

## Felles regler

**Designsystem:** Eksakt token-navn - aldri hardkode hex. PAA denne batchen er det ekstra viktig fordi pakke 5 viser tokens i live-format.

**Stil-krav:**
- Norsk bokmaal, komma som desimal, mellomrom som tusenseparator
- Maks 3 lime-elementer per skjerm
- 8pt-grid, Lucide 1.75 stroke
- Asymmetrisk layout

**Anti-AI:**
- ALDRI "God morgen [Navn]" - bruk italic editorial-fragment
- Eksempler: *"Hvem har lov til hva."* / *"Hvor data kommer fra."* / *"Hele systemet paa ett sted."*
- Flat avatarer
- Ingen translateY(-3px) hover paa alt

**Tverrgaaende katalog-flater:**
- Layout: header + filter + grid med eksempler
- Mer kompakt enn faktiske skjermer
- Hero italic editorial fragment
- Right-rail med stats om relevant

**Sidebar:** CoachHQ TO-LAGS (admin-flate). Smal moerk rail (56px) + lys nav (200px).

**Referanse-personer:** Anders K (hoved), Sara, Tom (coaches). Markus R Pedersen + Henrik, Anna, Mads, Lise, Joachim, Emma, Lina (spillere).

**Spesifikt for Pakke 5 (Design-tokens):**
- VIS faktiske tokens fra batch-1-design-system, ikke generiske eksempler
- Tema-bytter MAA fungere visuelt (samme skjerm i lyst og moerkt)
- Copy-knapper paa hver token

## Output per skjerm

1. Hovedskjerm i lyst tema
2. Hover-state paa kritiske elementer
3. Empty/loading hvor relevant
4. Mobil-versjon

## Start naa

Begynn med Pakke 1 (CBAC). Fortsett uten avbrudd.
