# Custom prompt for Mini-batch 3-B - PlayerHQ Detail+tabs Del 1 (BULK-versjon)

**Kopier ALT under linja inn i claude.ai/design som foerste melding i ny sesjon.**

Foer du sender prompten, last opp disse vedleggene:
1. `wireframe/brain/for-claude-design/branding-style-guide.html`
2. `wireframe/brain/for-claude-design/design-system-v2.md`
3. Alle 20 .woff2-filer fra `fonts/`
4. `wireframe/design-batches/batch-3-detail-tabs/mini-batches/3-B.md`
5. Alle 5 HTML-filer listet i `3-B-vedlegg.txt`

---

# PROMPT (kopier fra og med denne linja):

Jeg har lastet opp et komplett designsystem og en mini-batch-spec (3-B.md) med 5 PlayerHQ-detail-skjermer som skal designes.

## Hva jeg vil

**Generer alle 5 skjermer i ETT loep.** Lever som 5 paafolgende UI-kits.

Rekkefoelge:
1. Pakke 1: Treningsplan (Pro-laast for Free)
2. Pakke 2: Treningsdetalj (post-oekt review)
3. Pakke 3: Test-detalj (med projeksjon)
4. Pakke 4: Maal-detalj (HCP-trend)
5. Pakke 5: TrackMan-analyse (per-koelle, tier-gated)

For hver skjerm:
- Les pakken i 3-B.md
- Bruk tilhoerende HTML-wireframe (vedlegg)
- Generer skjermen som UI-kit
- Gaa rett til neste skjerm

Etter alle 5: samlet oversikt + design-links.

## Felles regler (gjelder ALLE 5 skjermer)

**Designsystem:** Bruk eksakt token-navn -- aldri hardkode hex.

**Stil-krav:**
- Norsk bokmaal, AE/OE/AA, **komma som desimal**, 24-timer
- **Mellomrom som tusenseparator**
- Maks 3 lime-elementer (#D1F843) per skjerm
- 8pt-grid for spacing
- Lucide-ikoner, 1.75 stroke
- Asymmetrisk layout

**Anti-AI-regler (KRITISK):**
- ALDRI "God morgen, Markus" -- bruk italic editorial-fragment
- Eksempler: *"Onsdag morgen. Tre dager til peak."* / *"Sand-test paa rute."*
- Flat farger paa avatarer
- Ingen translateY(-3px) hover paa alt

**Arketype-C-konvensjoner:**
- Header med 64px avatar + H1 + 4 stat-pills + primary CTA
- Tab-strip med 2px stripe under aktiv tab
- Tab-innhold = asymmetrisk bento

**Tier-gating (kritisk for PlayerHQ):**
- Free-tier: 40 % opacity over content + sentrert lock-card + UpgradeToPro CTA
- Pro-tier: Standard tilgang. Elite-features med lock-overlay.
- Lucide Lock-ikon + dempet lime accent paa lock-card

**PlayerHQ sidebar er ETT-LAGS:** 240px lys nav-kolonne med ikoner. Avatar i toppen viser tier-pill (Free/Pro/Elite).

**Referanse-personer:**
- Spilleren selv: Markus Roinaas Pedersen
- Coach: Anders Kristiansen
- Plan: "Sommer-toppform" (peak Soerlandsaapent 12. juni)

**Lower-is-better metrics** (HCP, score, putts): Vis nedgang som SUCCESS-groenn.
**Higher-is-better metrics** (SG, distanse): Motsatt.

## Output per skjerm

For hver skjerm, lever:
1. Hovedskjerm i lyst tema (default tab)
2. Tab-bytte til en sekundaer tab
3. Drawer/modal-state hvor relevant
4. Tier-locked-state (Free hvis relevant)
5. Mobil-versjon

## Start naa

Begynn med Pakke 1 (Treningsplan) og fortsett uten avbrudd til alle 5 er ferdige.
