# Custom prompt for Mini-batch 3-A - CoachHQ Detail+tabs (BULK-versjon)

**Kopier ALT under linja inn i claude.ai/design som foerste melding i ny sesjon.**

Foer du sender prompten, last opp disse vedleggene:
1. `wireframe/brain/for-claude-design/branding-style-guide.html` (system-kontekst)
2. `wireframe/brain/for-claude-design/design-system-v2.md` (tekstlig backup)
3. Alle 20 .woff2-filer fra `wireframe/brain/for-claude-design/fonts/`
4. `wireframe/design-batches/batch-3-detail-tabs/mini-batches/3-A.md` (mini-batch-spec)
5. Alle 5 HTML-filer listet i `3-A-vedlegg.txt`

---

# PROMPT (kopier fra og med denne linja):

Jeg har lastet opp et komplett designsystem og en mini-batch-spec (3-A.md) med 5 CoachHQ-detail-skjermer som skal designes.

## Hva jeg vil

**Generer alle 5 skjermer i ETT loep** -- ikke vent paa "neste" mellom hver. Lever dem som 5 paafolgende UI-kits i samme respons.

Rekkefoelge:
1. Pakke 1: 360-spillerprofil (deep-dive, 7 tabs)
2. Pakke 2: Spiller-detalj (light, 6 tabs)
3. Pakke 3: Plan-detalj (5 tabs, tunge data)
4. Pakke 4: Plan-redigering (edit-mode, 5 tabs)
5. Pakke 5: Talent-pipeline (kanban, 5 tabs)

For hver skjerm:
- Les pakken i 3-A.md
- Bruk tilhoerende HTML-wireframe (vedlegg) som visuell IA-referanse
- Generer skjermen som UI-kit med korrekt designsystem
- Gaa rett til neste skjerm naar du er ferdig

Etter alle 5: lever en samlet oversikt med alle 5 thumbnails + design-links.

## Felles regler (gjelder ALLE 5 skjermer)

**Designsystem:** Bruk eksakt token-navn (--brand-primary, --pyr-fys, etc) -- aldri hardkode hex.

**Stil-krav:**
- Norsk bokmaal, AE/OE/AA, **komma som desimal** (12,4 ikke 12.4), 24-timer
- **Mellomrom som tusenseparator** (1 600 kr, ikke 1.600)
- Maks 3 lime-elementer (#D1F843) synlig per skjerm
- 8pt-grid for spacing (8/16/24/32/40/48/64)
- Lucide-ikoner, 1.75 stroke
- Asymmetrisk layout (ikke 3x1 uniform)

**Anti-AI-regler (KRITISK):**
- ALDRI "God morgen, [Navn]" eller "Welcome back" -- bruk italic editorial-fragment
- Eksempler: *"Onsdag morgen. Markus i fase 3."* / *"Talent-pipeline. To promo-kandidater venter."*
- Flat farger paa avatarer (ingen gradient)
- Ingen translateY(-3px) hover paa alt

**Arketype-C-konvensjoner (felles for alle 5):**
- Header med 64px avatar + H1 + 4 stat-pills + primary CTA
- Tab-strip med 2px stripe under aktiv tab (primary)
- Tab-innhold = asymmetrisk bento (ikke 3x1 uniform)
- Drawer-paneler aapner fra hoeyre (480-640px bred)
- Sticky bottom action-strip naar relevant

**CoachHQ sidebar er TO-LAGS:** smal moerk rail (56px, #061210) + lys nav-kolonne (200px, #FAFAF7). Active item i nav: rgba(209,248,67,0.30) bg + #0A1F18 tekst.

**Referanse-personer:**
- CoachHQ: Anders Kristiansen (hovedcoach)
- Spillere: Markus Roinaas Pedersen, Henrik Nilsen, Anna Karlsen, Mads Roenning, Joachim Tangen, Lina Hellesund, Anders Nedrum, Mia Berg

**Lower-is-better metrics** (puttar, score, HCP): Vis nedgang som SUCCESS-groenn, oppgang som DANGER-roed.
**Higher-is-better metrics** (SG, distanse, antall oekter): Motsatt.

## Output per skjerm

For hver av de 5 skjermene, lever:
1. Hovedskjerm i lyst tema (default tab)
2. Tab-bytte til en sekundaer tab
3. Drawer/modal-state paa kritiske elementer
4. Empty/loading-state hvor relevant
5. Mobil-versjon hvis layout endres dramatisk

## Start naa

Begynn med Pakke 1 (360-spillerprofil) og fortsett uten avbrudd til alle 5 er ferdige.

Naar du er helt ferdig:
- Samlet oversikt med alle 5 thumbnails
- Liste med design-links jeg kan kopiere til tracker
- Flagg evt. caveats/avvik per skjerm
