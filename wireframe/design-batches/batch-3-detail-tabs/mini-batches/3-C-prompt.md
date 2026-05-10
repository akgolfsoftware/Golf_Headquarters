# Custom prompt for Mini-batch 3-C - PlayerHQ Detail+tabs Del 2 + CoachHQ Lag (BULK-versjon)

**Kopier ALT under linja inn i claude.ai/design som foerste melding i ny sesjon.**

Foer du sender prompten, last opp disse vedleggene:
1. `wireframe/brain/for-claude-design/branding-style-guide.html`
2. `wireframe/brain/for-claude-design/design-system-v2.md`
3. Alle 20 .woff2-filer fra `fonts/`
4. `wireframe/design-batches/batch-3-detail-tabs/mini-batches/3-C.md`
5. Alle 5 HTML-filer listet i `3-C-vedlegg.txt`

---

# PROMPT (kopier fra og med denne linja):

Jeg har lastet opp et komplett designsystem og en mini-batch-spec (3-C.md) med 5 detail-skjermer som skal designes -- 4 PlayerHQ + 1 CoachHQ.

## Hva jeg vil

**Generer alle 5 skjermer i ETT loep.** Lever som 5 paafolgende UI-kits.

Rekkefoelge:
1. Pakke 1: Coach-detalj (5 tabs, multi-coach mulig)
2. Pakke 2: Coaching-plan-detalj (spiller-side med coach-quote)
3. Pakke 3: Notat-detalj (4 tabs med kommentar-traad)
4. Pakke 4: Send melding til coach (compose, 3 tabs)
5. Pakke 5: Lag-sammenligning (CoachHQ matrise, 5 tabs)

For hver skjerm:
- Les pakken i 3-C.md
- Bruk tilhoerende HTML-wireframe (vedlegg)
- Generer skjermen som UI-kit

Etter alle 5: samlet oversikt + design-links.

## Felles regler (gjelder ALLE 5 skjermer)

**Designsystem:** Eksakte token-navn -- aldri hardkode hex.

**Stil-krav:**
- Norsk bokmaal, AE/OE/AA, **komma som desimal**, 24-timer
- **Mellomrom som tusenseparator**
- Maks 3 lime-elementer per skjerm
- 8pt-grid for spacing
- Lucide-ikoner, 1.75 stroke
- Asymmetrisk layout

**Anti-AI-regler (KRITISK):**
- ALDRI "God morgen, Markus" -- bruk italic editorial-fragment
- Eksempler: *"Anders skrev for 12 minutter siden."* / *"Q2 2026. Hvem leverer."*
- Coach-quote i italic Instrument Serif med accent venstre-border
- Flat farger paa avatarer

**Arketype-C-konvensjoner:**
- Header med 64px avatar + H1 + 3-4 stat-pills + primary CTA
- Tab-strip med 2px stripe under aktiv
- Tab-innhold = asymmetrisk bento

**Sidebar-konvensjoner:**
- PlayerHQ (pakke 1-4): ETT-LAGS, 240px lys nav-kolonne, avatar + tier-pill i toppen
- CoachHQ (pakke 5): TO-LAGS, 56px moerk rail + 200px lys nav-kolonne

**Tier (PlayerHQ):**
- Pro for alle 4 PlayerHQ-skjermene
- Free ser overhodet ikke coach-fanen (pakke 1-3)

**Referanse-personer:**
- Spilleren: Markus Roinaas Pedersen
- Coach: Anders Kristiansen (online, hovedcoach)
- Sub-coaches: Tom Hansen (Putt), Sara Lien (Mental)
- For lag-snitt: Grupper Elite, A-lag, WANG, GFGK Jr, Akademi

**Coach-quote-konvensjon:**
- Italic Instrument Serif med lime accent venstre-border 2px
- Eks: *"Markus, vi har tre uker til Soerlandsaapent."*

**Lower-is-better metrics:** Vis nedgang som SUCCESS-groenn.
**Higher-is-better metrics:** Motsatt.

## Output per skjerm

For hver skjerm, lever:
1. Hovedskjerm i lyst tema (default tab)
2. Tab-bytte til en sekundaer tab
3. Drawer/modal-state hvor relevant
4. Empty/loading/error-state
5. Mobil-versjon

## Start naa

Begynn med Pakke 1 (Coach-detalj) og fortsett uten avbrudd til alle 5 er ferdige.
