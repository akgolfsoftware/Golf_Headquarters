# Custom prompt for Mini-batch 7-D - Spiller-detalj + tverrgaaende start

**Kopier ALT under linja inn i claude.ai/design som foerste melding i ny sesjon.**

Foer du sender prompten, last opp:
1. `wireframe/brain/for-claude-design/branding-style-guide.html`
2. `wireframe/brain/for-claude-design/design-system-v2.md`
3. Alle 20 .woff2-filer
4. `wireframe/design-batches/batch-7-other/mini-batches/7-D.md`
5. Alle 5 HTML-filer listet i `7-D-vedlegg.txt`

---

# PROMPT (kopier fra og med denne linja):

Jeg har lastet opp designsystem og mini-batch-spec (7-D.md) med 5 skjermer. Mix av spesial-visninger og tverrgaaende katalog-flater.

## Hva jeg vil

**Generer alle 5 skjermer i ETT loep.** Lever som 5 UI-kits.

Rekkefoelge:
1. CoachHQ Spiller-detalj (light, sidebar/popover variant)
2. Shared Varslingssentral (kronologisk feed)
3. Shared Agent-pipeline overview (sankey-flow-diagram)
4. Shared Periodiserings-agent dyp-dykk (beslutningstre)
5. Shared Modal-katalog (3-kolonne grid med thumbnails)

For hver: les spec (16-, 17-, 18-, 19-, 20-*.md), bruk HTML-vedlegg som IA-referanse, generer UI-kit.

Etter alle 5: samlet oversikt + design-links.

## Felles regler

**Designsystem:** Eksakt token-navn.

**Stil-krav:**
- Norsk bokmaal, komma som desimal, mellomrom som tusenseparator
- Maks 3 lime-elementer per skjerm
- 8pt-grid, Lucide 1.75 stroke
- Asymmetrisk layout

**Anti-AI:**
- ALDRI "God morgen [Navn]" - bruk italic editorial-fragment
- Eksempler: *"Alle modaler paa ett sted."* / *"Alt som har skjedd."* / *"Periodiserings-agent."*
- Flat avatarer
- Ingen translateY(-3px) hover paa alt

**Tverrgaaende katalog-flater (pakke 3, 4, 5):**
- Layout: header + filter (om relevant) + grid med eksempler
- Mer kompakt enn faktiske skjermer
- Hero italic editorial fragment

**Sidebar:**
- CoachHQ TO-LAGS: smal moerk rail (56px) + lys nav (200px)
- Tverrgaaende admin-flater bruker CoachHQ-sidebar

**Referanse-personer:**
- CoachHQ: Anders K (hoved), Sara, Tom
- Spillere: Markus Roinaas Pedersen, Henrik, Anna, Mads, Lise, Joachim, Emma, Lina

## Output per skjerm

1. Hovedskjerm i lyst tema
2. Hover-state paa kritiske elementer
3. Empty/loading hvor relevant
4. Mobil-versjon

## Start naa

Begynn med Pakke 1 (Spiller-detalj light). Fortsett uten avbrudd.
