# Custom prompt for Mini-batch modal-E - Social / Tier / Other (BULK-versjon)

**Kopier ALT under linja inn i claude.ai/design som foerste melding i ny sesjon.**

Foer du sender prompten, last opp disse vedleggene:
1. `wireframe/brain/for-claude-design/branding-style-guide.html`
2. `wireframe/brain/for-claude-design/design-system-v2.md`
3. Alle 20 .woff2-filer fra `wireframe/brain/for-claude-design/fonts/`
4. `wireframe/design-batches/redesign-arketype-e/felles-instruks.md`
5. `wireframe/design-batches/mvp/modaler/modal-E.md`
6. Alle HTML-filer listet i `modal-E-vedlegg.txt`

---

# PROMPT (kopier fra og med denne linja):

Jeg har lastet opp et komplett designsystem, en felles-instruks for anti-state-katalog, og en mini-batch-spec (modal-E.md) med 7 modaler for social, tier og other. 4 av 7 er NYE (DrillChallenge, ChallengeDetail, NotificationCenter, VideoUpload).

## Hva jeg vil

**Generer alle 7 modaler i ETT loep** - ikke vent paa "neste" mellom hver.

Rekkefoelge:
1. Pakke 1: DrillChallengeModal (NY - 2 steg)
2. Pakke 2: ChallengeDetailModal (NY - leaderboard)
3. Pakke 3: LeaderboardModal (filter + tabell)
4. Pakke 4: MessageDetailModal (thread)
5. Pakke 5: NotificationCenterModal (NY - drawer)
6. Pakke 6: PaymentModal (2 steg)
7. Pakke 7: VideoUploadModal (NY - drag-drop)

For hver modal:
- Les pakken i modal-E.md
- Bruk tilhoerende HTML-wireframe (vedlegg) som visuell IA-referanse
- Generer modalen som UI-kit med korrekt designsystem
- Multi-step: lever hvert steg som SEPARAT HTML-fil

Etter alle 7: samlet oversikt med alle thumbnails + design-links.

## Anti-state-katalog (KRITISK)

Foelg felles-instruks.md eksakt:
- **EEN produksjons-modal per HTML-fil** - ikke captioned mini-mockups
- Multi-step modaler leveres som SEPARATE HTML-filer per steg
- Flere states (Free vs Pro, loading, empty, error, success, moerkt tema) som SEPARATE HTML-filer

## Felles modal-regler

- **Container:** Sentrert, max-width 480-880px (per modal), `rounded-xl`, bakdrop blur(4px)
- NotificationCenter er DRAWER (hoeyrejustert 480px, full hoeyde)
- **Header (sticky):** Italic Instrument Serif tittel + lukk-X
- **Footer (sticky):** Sekundaer venstre, primary accent-CTA hoeyre
- **Mobile <=640px:** Full-screen

## Felles regler

**Designsystem:** Bruk eksakt token-navn - aldri hardkode hex.

**Stil-krav:**
- Norsk bokmaal, AE/OE/AA, **komma som desimal** (12,4)
- **Mellomrom som tusenseparator** (1 600 kr, 3 000 kr)
- Maks 3 lime-elementer (#D1F843) synlig per modal
- Maks 1 italic Instrument Serif-element per modal
- 8pt-grid (8/16/24/32/40/48/64)
- Lucide-ikoner, 1.75 stroke

**Anti-AI-regler:**
- ALDRI "Awesome!" eller "Sjekk ut Pro!"
- Tittel-eksempler: "Drill-challenge", "10 putts fra 3m", "Klubb-leaderboard", "Anders Kristiansen", "Varsler", "Oppgrader til Pro", "Last opp swing-video"
- Flat farger paa avatarer, ingen gradient

**Referanse-data:**
- Spiller: Markus Roinaas Pedersen (HCP 12,4, Pro-tier)
- Coach: Anders Kristiansen
- Andre spillere: Henrik Nilsen, Anna Karlsen, Mads Roenning, Lise Sandberg, Joachim Tangen, Emma Solberg
- Drill-eksempler: "10 putts fra 3m", "Bunker-up&down", "150m approach-konsistens"
- Pro-pris: 300 kr/mnd, 3 000 kr/aar (spar 600 kr)
- Kort-format: Visa, MasterCard
- Koeller (14 stk): Driver, 3-wood, 5-wood, 4-iron til Lob-wedge, Putter

**Pyramide-farger:** FYS `#16A34A` - TEK `#005840` - SLAG `#D1F843` - SPILL `#F4C430` - TURN `#5E5C57`

**Lower-is-better metrics** (HCP, score, antall putts): Nedgang = success-groenn.
**Higher-is-better metrics** (rang, score paa "antall innholdt"): Motsatt.

**Tier-gating-visualisering:**
- LeaderboardModal Free-tier: full lock-overlay-card med Lucide `Lock` 48px + 3 fordeler + "Oppgrader til Pro for full leaderboard ->"
- PaymentModal: skal vaere SUCCESS-paths (positive copy om Pro)
- Andre modaler tier-relaterte: bruk subtle banner "Pro-funksjon" istedenfor full lock hvis modal allerede er aapen

**Mental model per modal:**
- DrillChallenge: "Lag eller bli med - velg drill - inviter venner"
- ChallengeDetail: "Hvor staar jeg? Hvor lang tid igjen?"
- Leaderboard: "Hvor er jeg paa listen?"
- MessageDetail: "Thread + skriv svar"
- NotificationCenter: "Hva er nytt - filter etter type"
- Payment: "Velg plan - kort-info - bekreft"
- VideoUpload: "Drag-drop - tag - send til Anders"

## Output per modal

Som angitt under "OEnsket output" i modal-E.md. Til sammen ca 40-45 HTML-filer.

## Start naa

Begynn med Pakke 1 (DrillChallengeModal) og fortsett uten avbrudd.

Naar du er ferdig:
- Samlet oversikt med thumbnails gruppert per modal
- Liste med design-links
- Flagg caveats per modal (spesielt for de NYE 1, 2, 5, 7)
