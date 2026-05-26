# Custom prompt for Mini-batch modal-A - Plan-modaler (BULK-versjon)

**Kopier ALT under linja inn i claude.ai/design som foerste melding i ny sesjon.**

Foer du sender prompten, last opp disse vedleggene:
1. `wireframe/brain/for-claude-design/branding-style-guide.html` (system-kontekst)
2. `wireframe/brain/for-claude-design/design-system-v2.md` (tekstlig backup)
3. Alle 20 .woff2-filer fra `wireframe/brain/for-claude-design/fonts/`
4. `wireframe/design-batches/redesign-arketype-e/felles-instruks.md` (anti-state-katalog-regel)
5. `wireframe/design-batches/mvp/modaler/modal-A.md` (mini-batch-spec)
6. Alle HTML-filer listet i `modal-A-vedlegg.txt`

---

# PROMPT (kopier fra og med denne linja):

Jeg har lastet opp et komplett designsystem, en felles-instruks for anti-state-katalog, og en mini-batch-spec (modal-A.md) med 7 plan-modaler som skal designes.

## Hva jeg vil

**Generer alle 7 modaler i ETT loep** - ikke vent paa "neste" mellom hver. Lever dem som 7 paafolgende UI-kits i samme respons.

Rekkefoelge:
1. Pakke 1: NewPlanModal (4 steg wizard)
2. Pakke 2: EditPlanModal (drawer)
3. Pakke 3: PlanApprovalModal (PlayerHQ review)
4. Pakke 4: PlanShareModal (tabs)
5. Pakke 5: PlanActionDetailModal (agent-detalj)
6. Pakke 6: TemplateSelectorModal (grid)
7. Pakke 7: AIPlanGeneratorModal (3 steg)

For hver modal:
- Les pakken i modal-A.md
- Bruk tilhoerende HTML-wireframe (vedlegg) som visuell IA-referanse
- Generer modalen som UI-kit med korrekt designsystem
- Ga rett til neste naar du er ferdig

Etter alle 7: lever en samlet oversikt med alle thumbnails + design-links.

## Anti-state-katalog (KRITISK)

Foelg felles-instruks.md eksakt:
- **EEN produksjons-modal per HTML-fil** - ikke captioned mini-mockups side-om-side
- Default-state rendret i full stoerrelse (modal-spesifikk bredde, min 1024x768 viewport rundt)
- Ingen "1 - Steg 1, 2 - Steg 2" varianter paa samme side
- Multi-step modaler leveres som SEPARATE HTML-filer per steg (f.eks. `01-newplan-steg1.html`, `01-newplan-steg2.html`, `01-newplan-steg3.html`, `01-newplan-steg4.html`)
- Flere states (loading, empty, validation, moerkt tema, mobil) som SEPARATE HTML-filer

## Felles modal-regler

- **Bakdrop:** `rgba(0,0,0,0.5)` med blur(4px), viser dempet app-innhold under (skisser app-layout i bakgrunn)
- **Container:** Sentrert, `rounded-xl` (12px), card-bg lyst / popover-bg moerkt
- **Header (sticky, 72-96px):** Italic Instrument Serif 20-28px tittel + lukk-X oeverst-hoeyre
- **Footer (sticky, 72-96px):** Sekundaer venstre, primary CTA hoeyre (accent-lime)
- **Mobile <=640px:** Full-screen (`rounded-none`), footer-knapper sticky-bunn

## Felles regler (gjelder ALLE modaler)

**Designsystem:** Bruk eksakt token-navn (--brand-primary, --pyr-fys, etc) - aldri hardkode hex.

**Stil-krav:**
- Norsk bokmaal, AE/OE/AA, **komma som desimal** (12,4 ikke 12.4), 24-timer
- **Mellomrom som tusenseparator** (1 600 kr, 2 580 spin)
- Maks 3 lime-elementer (#D1F843) synlig per modal
- Maks 1 italic Instrument Serif-element per modal - reservert for tittel
- 8pt-grid for spacing (8/16/24/32/40/48/64)
- Lucide-ikoner, 1.75 stroke
- Asymmetrisk layout der mulig

**Anti-AI-regler (KRITISK):**
- ALDRI "Welcome", "Klar til aa lage plan?" eller andre AI-fyllord
- Bruk konkret tittel: "Ny treningsplan", "Endre plan", "Anders foreslar plan"
- Flat farger paa avatarer (ingen gradient)
- Bare lime gradient er tillatt: `#D1F843 -> #C2EE2F` paa progress-bar fill

**Referanse-personer (bruk eksakt):**
- Spiller: Markus Roinaas Pedersen, HCP 12,4, Pro-tier, Kat A
- Coach: Anders Kristiansen, NGF Trener IV
- Klubb: GFGK (Gamle Fredrikstad Golfklubb)
- Plan-eksempel: "Sommer-toppform 2026", 9. mai - 30. juni, 8 uker, 32 oekter
- Mal-eksempler: "Putting Foundation", "Driver Toppform", "Mental Game 4u"

**Pyramide-farger:** FYS `#16A34A` - TEK `#005840` - SLAG `#D1F843` - SPILL `#F4C430` - TURN `#5E5C57`

**Lower-is-better metrics** (HCP, score, putt-snitt, avvik): Nedgang = success-groenn, oppgang = danger-roed.
**Higher-is-better metrics** (SG, carry, ball-speed, antall oekter): Motsatt.

**Coach vs Spiller-perspektiv:**
- CoachHQ-modaler (NewPlan, Edit, Share, AIGen, ActionDetail-coach-view): vises i CoachHQ-layout med moerk to-lags sidebar bak
- PlayerHQ-modaler (PlanApproval, ActionDetail-spiller-view): vises i PlayerHQ-layout med lys sidebar bak

## Output per modal

For hver modal, lever som angitt under "OEnsket output" i modal-A.md:
- Hovedmodal i lyst tema (default state, fullbleed viewport rundt modal)
- Moerkt tema (samme data, separat HTML)
- Multi-step: hvert steg som separat HTML
- EEN ekstra state-variasjon (loading / validation / empty / hover) der relevant
- Mobil <=640px hvis layout endres dramatisk

## Start naa

Begynn med Pakke 1 (NewPlanModal) og fortsett uten avbrudd til alle 7 er ferdige.

Naar du er helt ferdig:
- Samlet oversikt med alle thumbnails
- Liste med design-links jeg kan kopiere til tracker
- Flagg evt. caveats/avvik per modal
