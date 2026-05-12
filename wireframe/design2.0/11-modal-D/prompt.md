# Custom prompt for Mini-batch modal-D - Round / Stats / Agent (BULK-versjon)

**Kopier ALT under linja inn i claude.ai/design som foerste melding i ny sesjon.**

Foer du sender prompten, last opp disse vedleggene:
1. `wireframe/brain/for-claude-design/branding-style-guide.html`
2. `wireframe/brain/for-claude-design/design-system-v2.md`
3. Alle 20 .woff2-filer fra `wireframe/brain/for-claude-design/fonts/`
4. `wireframe/design-batches/redesign-arketype-e/felles-instruks.md`
5. `wireframe/design-batches/mvp/modaler/modal-D.md`
6. Alle HTML-filer listet i `modal-D-vedlegg.txt`

---

# PROMPT (kopier fra og med denne linja):

Jeg har lastet opp et komplett designsystem, en felles-instruks for anti-state-katalog, og en mini-batch-spec (modal-D.md) med 6 modaler for runde-data, statistikk og agent-handlinger. To av dem (TrackManImportModal og AgentFeedbackModal) er NYE.

## Hva jeg vil

**Generer alle 6 modaler i ETT loep** - ikke vent paa "neste" mellom hver.

Rekkefoelge:
1. Pakke 1: RoundDetailModal (tabs)
2. Pakke 2: RoundInsightModal (agent-analyse)
3. Pakke 3: TrackManImportModal (NY - 3 steg)
4. Pakke 4: ComparisonModal (side-by-side)
5. Pakke 5: BulkApproveModal (confirm med liste)
6. Pakke 6: AgentFeedbackModal (NY - form)

For hver modal:
- Les pakken i modal-D.md
- Bruk tilhoerende HTML-wireframe (vedlegg) som visuell IA-referanse
- Generer modalen som UI-kit med korrekt designsystem
- Multi-step: lever hvert steg som SEPARAT HTML-fil

Etter alle 6: samlet oversikt med alle thumbnails + design-links.

## Anti-state-katalog (KRITISK)

Foelg felles-instruks.md eksakt:
- **EEN produksjons-modal per HTML-fil** - ikke captioned mini-mockups
- TrackManImport (3 steg) leveres som SEPARATE HTML-filer per steg
- Tabs/states (loading, empty, success, moerkt tema) som SEPARATE HTML-filer

## Felles modal-regler

- **Container:** Sentrert, max-width 560-880px (per modal), `rounded-xl`, bakdrop blur(4px)
- **Header (sticky, 72px):** Italic Instrument Serif tittel + lukk-X
- **Footer (sticky, 72px):** Sekundaer venstre, primary accent-CTA hoeyre
- **Mobile <=640px:** Full-screen

## Felles regler

**Designsystem:** Bruk eksakt token-navn - aldri hardkode hex.

**Stil-krav:**
- Norsk bokmaal, AE/OE/AA, **komma som desimal** (12,4)
- **Mellomrom som tusenseparator** (2 580 spin, 6 124 m)
- Maks 3 lime-elementer (#D1F843) synlig per modal
- Maks 1 italic Instrument Serif-element per modal
- 8pt-grid (8/16/24/32/40/48/64)
- Lucide-ikoner, 1.75 stroke

**Anti-AI-regler:**
- ALDRI "Great round!" eller "Sjekk ut din score"
- Bruk konkret tittel: "Borre - 1. mai 2026", "Innsikt fra runden", "Importer TrackMan-data"
- Flat farger paa avatarer

**Referanse-data:**
- Spiller: Markus Roinaas Pedersen (HCP 12,4)
- Coach: Anders Kristiansen
- Bane-eksempler: Borre Golfklubb (par 71, beste 74), GFGK, Bossum
- Runde-eksempel: Borre 1. mai 2026 - 74 (-1) - 18 hull - 28 putts - 11/14 FIR - 13/18 GIR
- Andre runde: GFGK 8. mai 2026 - 76 (+5)
- TrackMan: 14 koeller (Driver, 3-wood, 5-wood, 4-iron til Lob-wedge, Putter)

**Pyramide-farger:** FYS `#16A34A` - TEK `#005840` - SLAG `#D1F843` - SPILL `#F4C430` - TURN `#5E5C57`

**Lower-is-better metrics** (score, putts, HCP, avvik): Nedgang = success-groenn, oppgang = danger-roed.
**Higher-is-better metrics** (SG, carry, ball-speed, FIR%, GIR%): Motsatt.

**Diff-kolonne i ComparisonModal:**
Fargekoding er KRITISK - lower-is-better forbedring = success-groenn UANSETT tegnet (negativt tall paa score er bra). Vis tegnet eksplisitt (+/-) sammen med farge.

**Mental model:**
- RoundDetail: "Vis runde rik, ikke skjemte"
- RoundInsight: "3 seksjoner: bra / forbedring / anbefaling"
- TrackManImport: "Velg metode -> last opp -> verifiser"
- Comparison: "Side-by-side med tydelig diff"
- BulkApprove: "Confirm med liste + valgfri merknad"
- AgentFeedback: "Rask radio + valgfri tekst"

## Output per modal

Som angitt under "OEnsket output" i modal-D.md. Til sammen ca 30-35 HTML-filer.

## Start naa

Begynn med Pakke 1 (RoundDetailModal) og fortsett uten avbrudd.

Naar du er ferdig:
- Samlet oversikt med thumbnails gruppert per modal
- Liste med design-links
- Flagg caveats per modal (spesielt for de NYE 3 og 6)
