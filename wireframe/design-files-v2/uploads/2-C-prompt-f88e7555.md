# Custom prompt for Mini-batch 2-C - PlayerHQ kjerne

**Kopier ALT under linja inn i claude.ai/design som foerste melding i ny sesjon.**

Foer du sender prompten, last opp disse vedleggene:
1. `wireframe/brain/for-claude-design/branding-style-guide.html` (system-kontekst)
2. `wireframe/brain/for-claude-design/design-system-v2.md` (tekstlig backup)
3. Alle 20 .woff2-filer fra `wireframe/brain/for-claude-design/fonts/`
4. `wireframe/design-batches/batch-2-list-filter/mini-batches/2-C.md` (selve mini-batch-spec)
5. Alle HTML-filer listet i `2-C-vedlegg.txt` (7 stk)

---

# PROMPT (kopier fra og med denne linja):

Jeg har lastet opp et komplett designsystem (branding-style-guide.html + design-system-v2.md + 20 fonter) og en mini-batch-spec (2-C.md) med 5 skjermer som skal designes.

## Hva jeg vil

Generer alle 5 skjermer i denne mini-batchen, EN OM GANGEN.

For hver skjerm:
1. Les pakken i 2-C.md (Pakke 1, Pakke 2, ..., Pakke 5)
2. Bruk tilhoerende HTML-wireframe (lastet opp som vedlegg) som visuell IA-referanse
3. Generer skjermen som et UI-kit med korrekt designsystem
4. Vis meg resultatet og VENT paa "neste" foer du gaar videre

## Felles regler (gjelder ALLE skjermer)

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
- Eksempler: *"Onsdag, Markus. To dager siden sist."* / *"38 spillere venter."*
- Flat farger paa avatarer (ingen gradient)
- Ingen translateY(-3px) hover paa alt

**Referanse-personer:**
- PlayerHQ: Markus Roinaas Pedersen (HCP 12,4, U18, WANG)
- CoachHQ: Anders Kristiansen (hovedcoach), spillere som Henrik Nilsen, Anna Karlsen, Mads Roenning, Lise Sandberg

**Tier-gating (PlayerHQ):**
- Free ser Pro-features med 40% opacity + lucide Lock + "Oppgrader til Pro"-CTA
- Pro ser Elite-features samme stil

**Lower-is-better metrics** (puttar, score, HCP): Vis nedgang som SUCCESS-groenn, oppgang som DANGER-roed.
**Higher-is-better metrics** (SG, distanse, antall okter): Motsatt.

## Output per skjerm

For hver skjerm, lever:
1. Hovedskjerm i lyst tema (default)
2. Hover-states paa kritiske elementer
3. Empty/loading-state hvor relevant
4. Mobil-versjon hvis layout endres dramatisk

## Start naa

Begynn med Pakke 1: Ovelser (grid-bibliotek)

Vis meg resultatet, og vent paa "neste" foer du gaar til Pakke 2.

---

**Naar alle 5 skjermer er ferdige:**
- Lag en samlet oversikt med alle 5 thumbnails
- List ut alle design-links jeg kan kopiere til tracker
- Flagg evt. caveats/avvik per skjerm
