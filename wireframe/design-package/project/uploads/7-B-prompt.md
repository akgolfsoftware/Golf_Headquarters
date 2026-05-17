# Custom prompt for Mini-batch 7-B - Audit / Locations / Oppfolgingsko / PlayerHQ kalender + baner

**Kopier ALT under linja inn i claude.ai/design som foerste melding i ny sesjon.**

Foer du sender prompten, last opp disse vedleggene:
1. `wireframe/brain/for-claude-design/branding-style-guide.html`
2. `wireframe/brain/for-claude-design/design-system-v2.md`
3. Alle 20 .woff2-filer fra `wireframe/brain/for-claude-design/fonts/`
4. `wireframe/design-batches/batch-7-other/mini-batches/7-B.md`
5. Alle 5 HTML-filer listet i `7-B-vedlegg.txt`

---

# PROMPT (kopier fra og med denne linja):

Jeg har lastet opp et komplett designsystem og en mini-batch-spec (7-B.md) med 5 spesial-visninger som skal designes. Mix av CoachHQ og PlayerHQ.

## Hva jeg vil

**Generer alle 5 skjermer i ETT loep** - ikke vent paa "neste". Lever som 5 paafolgende UI-kits.

Rekkefoelge:
1. Pakke 1: CoachHQ Audit (revisjonslogg, vertikal timeline)
2. Pakke 2: CoachHQ Locations (master-detail med kart)
3. Pakke 3: CoachHQ Oppfolgings-ko (board, 4 kolonner)
4. Pakke 4: PlayerHQ Treningskalender (uke-grid)
5. Pakke 5: PlayerHQ Baner (kart + liste + favoritter)

For hver skjerm: les pakken-spec (06-, 07-, 08-, 09-, 10-*.md), bruk HTML-vedlegg som IA-referanse, generer som UI-kit, ga rett til neste.

Etter alle 5: samlet oversikt med 5 thumbnails + design-links.

## Felles regler (gjelder ALLE 5 skjermer)

**Designsystem:** Eksakt token-navn (--brand-primary, --pyr-fys, etc) - aldri hardkode hex.

**Stil-krav:**
- Norsk bokmaal, AE/OE/AA, **komma som desimal** (12,4), 24-timer
- **Mellomrom som tusenseparator** (1 600 kr)
- Maks 3 lime-elementer per skjerm
- 8pt-grid for spacing
- Lucide-ikoner, 1.75 stroke
- Asymmetrisk layout

**Anti-AI-regler (KRITISK):**
- ALDRI "God morgen, [Navn]" - bruk italic editorial-fragment
- Eksempler: *"Alt som har skjedd."* / *"Hvor man boker tid."* / *"Hva venter paa deg?"*
- Flat farger paa avatarer
- Ingen translateY(-3px) hover paa alt

**Sidebar:**
- CoachHQ TO-LAGS: smal moerk rail (56px, #061210) + lys nav (200px, #FAFAF7). Active: rgba(209,248,67,0.30) bg + #0A1F18 tekst
- PlayerHQ desktop: venstre sidebar 240px lys; mobil: bottom-tab-bar (Hjem/Tren/Maal/Meg)

**Referanse-personer:**
- CoachHQ: Anders Kristiansen (hovedcoach), Sara, Tom
- PlayerHQ: Markus Roinaas Pedersen (Elite, HCP +2,4)
- Andre spillere: Henrik Nilsen, Anna Karlsen, Mads Roenning, Lise Sandberg, Joachim Tangen, Emma Solberg, Lina Hellesund

**Lower-is-better metrics** (puttar, score, HCP): nedgang = SUCCESS-groenn
**Higher-is-better** (volum, streak, antall baner): oppgang = SUCCESS-groenn

## Output per skjerm

1. Hovedskjerm i lyst tema
2. Hover-state paa kritiske elementer
3. Empty/loading hvor relevant
4. Mobil-versjon hvis layout endres dramatisk

## Start naa

Begynn med Pakke 1 (Audit) og fortsett uten avbrudd til alle 5 er ferdige.

Etter ferdig: samlet oversikt + design-links + caveats per skjerm.
