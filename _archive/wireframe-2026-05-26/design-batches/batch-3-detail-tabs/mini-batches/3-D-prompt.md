# Custom prompt for Mini-batch 3-D - 8 Modaler (BULK-versjon)

**Kopier ALT under linja inn i claude.ai/design som foerste melding i ny sesjon.**

Foer du sender prompten, last opp disse vedleggene:
1. `wireframe/brain/for-claude-design/branding-style-guide.html`
2. `wireframe/brain/for-claude-design/design-system-v2.md`
3. Alle 20 .woff2-filer fra `fonts/`
4. `wireframe/design-batches/batch-3-detail-tabs/mini-batches/3-D.md`
5. Alle 8 HTML-filer listet i `3-D-vedlegg.txt`

---

# PROMPT (kopier fra og med denne linja):

Jeg har lastet opp et komplett designsystem og en mini-batch-spec (3-D.md) med 8 modaler som skal designes. Alle aapner fra detail-skjermer i batch-3.

## Hva jeg vil

**Generer alle 8 modaler i ETT loep.** Lever som 8 paafolgende UI-kits.

Rekkefoelge:
1. Pakke 1: EditPlanModal (drawer 640px, edit plan-meta)
2. Pakke 2: PlanActionDetailModal (sentrert 720px, agent-anbefaling)
3. Pakke 3: RoundDetailModal (sentrert 880px, hull-for-hull)
4. Pakke 4: RoundInsightModal (sentrert 640px, agent-insight)
5. Pakke 5: ComparisonModal (full-drawer 920px, sammenligning)
6. Pakke 6: MessageDetailModal (drawer 560px, chat-traad)
7. Pakke 7: PlanShareModal (sentrert 560px, share-flow)
8. Pakke 8: FacilityDetailModal (sentrert 720px, fasilitet-info med hero)

For hver modal:
- Les pakken i 3-D.md
- Bruk tilhoerende HTML-wireframe (vedlegg) som visuell IA-referanse
- Generer modalen som UI-kit med korrekt designsystem

Etter alle 8: samlet oversikt + design-links.

## Felles regler (gjelder ALLE 8 modaler)

**Designsystem:** Eksakte token-navn -- aldri hardkode hex.

**Stil-krav:**
- Norsk bokmaal, AE/OE/AA, **komma som desimal**, 24-timer
- **Mellomrom som tusenseparator**
- Maks 3 lime-elementer per modal
- 8pt-grid for spacing
- Lucide-ikoner, 1.75 stroke
- Asymmetrisk layout

**Anti-AI-regler (KRITISK):**
- ALDRI generic "Bekreft handling" - vaer spesifikk
- Eksempler: *"Sand-test forbedret 12 %."* / *"87 % konfidens. Basert paa 412 lignende cases."*
- Flat farger paa avatarer
- Ingen translateY(-3px) hover paa alt

**Modal-konvensjoner:**
- Backdrop bg-black/40 + klikk = lukk (med dirty-form-warning)
- Header med Lucide-ikon + tittel (Geist 18-20px) + `X`-lukk hoeyre
- Body padding 24px, max 3 vertikale seksjoner foer scroll
- Sticky footer med 1-3 knapper, primary CTA hoeyre
- Animation: fade-in 200ms backdrop + slide-up 250ms modal

**Mobil:**
- Alle modaler blir bottom-sheet 90vh paa <=640px
- Footer alltid sticky
- Body scrollable

**Severity-pills (for PlanActionDetailModal):**
- Urgent: destructive bg + pulserende prikk
- Warning: amber bg
- Info: muted bg

**Diff-visualisering (for PlanActionDetailModal):**
- Foer: roed strek-gjennom
- Etter: groenn highlight

**Chat-meldinger (for MessageDetailModal):**
- Coach venstre, default bg, 80 % bredde
- Spiller hoeyre, lime bg, 80 % bredde
- Lest-status: v (sent) / vv (lest)

## Output per modal

For hver modal, lever:
1. Lyst tema, default state
2. Moerkt tema
3. State-variant (loading / error / success / lock)
4. Mobil-versjon (bottom-sheet)

## Start naa

Begynn med Pakke 1 (EditPlanModal) og fortsett uten avbrudd til alle 8 er ferdige.

Naar du er helt ferdig:
- Samlet oversikt med alle 8 thumbnails
- Liste med design-links
- Flagg evt. caveats
