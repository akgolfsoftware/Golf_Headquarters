# Custom prompt for Mini-batch 4-C - Modaler (BULK-versjon)

**Kopier ALT under linja inn i claude.ai/design som foerste melding i ny sesjon.**

Foer du sender prompten, last opp disse vedleggene:
1. `wireframe/brain/for-claude-design/branding-style-guide.html` (system-kontekst)
2. `wireframe/brain/for-claude-design/design-system-v2.md` (tekstlig backup)
3. Alle 20 .woff2-filer fra `wireframe/brain/for-claude-design/fonts/`
4. `wireframe/design-batches/batch-4-wizard-form/mini-batches/4-C.md` (mini-batch-spec)
5. Alle 6 HTML-filer listet i `4-C-vedlegg.txt`

---

# PROMPT (kopier fra og med denne linja):

Jeg har lastet opp et komplett designsystem og en mini-batch-spec (4-C.md) med 6 modaler som skal designes som arketype-D (Wizard / Form) levert i modal-form.

## Hva jeg vil

**Generer alle 6 modaler i ETT loep** -- ikke vent paa "neste" mellom hver. Lever dem som 6 paafolgende UI-kits i samme respons.

Rekkefoelge:
1. Pakke 1: NewPlanModal (4-step wizard-modal) -- duplikat fra batch 2, inkludert som arketype-referanse
2. Pakke 2: AIPlanGeneratorModal (3-step + spinner-state)
3. Pakke 3: TemplateSelectorModal (single-step velger med soek + grid)
4. Pakke 4: PlanApprovalModal (single-step review med 3 handlings-CTA)
5. Pakke 5: PaymentModal (3-step med Stripe Elements)
6. Pakke 6: BookingConfirmationModal (single-step confirmation)

For hver modal:
- Les pakken i 4-C.md
- Bruk tilhoerende HTML-wireframe (vedlegg) som visuell IA-referanse
- Generer modalen som UI-kit med korrekt designsystem -- **vis modal in-context med en dempet bakgrunn (blur 4px) som indikerer at det er en modal, ikke en hel skjerm**
- Ga rett til neste modal naar du er ferdig

Etter alle 6: lever en samlet oversikt med alle 6 thumbnails + design-links.

## Felles regler (gjelder ALLE 6 modaler)

**Designsystem:** Bruk eksakt token-navn (--brand-primary, --pyr-fys, etc) -- aldri hardkode hex.

**Stil-krav:**
- Norsk bokmaal, AE/OE/AA, **komma som desimal** (12,4 ikke 12.4), 24-timer
- **Mellomrom som tusenseparator** (1 600 kr, ikke 1.600)
- Maks 3 lime-elementer (#D1F843) per modal
- 8pt-grid for spacing (8/16/24/32/40/48/64)
- Lucide-ikoner, 1.75 stroke

**Anti-AI-regler (KRITISK):**
- ALDRI "God morgen, [Navn]" eller "Welcome back" -- bruk italic editorial-fragment
- Eksempler: *"Ny treningsplan."* / *"AI-generert plan."* / *"Bekreft booking."*
- Flat farger paa avatarer (ingen gradient)
- Ingen translateY(-3px) hover paa alt

**Modal-spesifikke regler (KRITISK):**
- Max-width: 720px standard, 560px for Payment + BookingConfirmation, 960px for TemplateSelector
- `rounded-xl` (12px) container, bakdrop `rgba(0,0,0,0.5)` med blur(4px)
- Header sticky 72-96px med tittel italic + steg-progress + lukk-X
- Footer sticky 64-96px
- Lukk-X eller "Avbryt" -> confirm-popover hvis endringer er gjort
- Mobile: full-screen modal (`rounded-none`)

**Multi-step-modal regler (pakke 1, 2, 5):**
- Dots ELLER numbers -- ALDRI lineaer progressbar
- Aktiv steg: accent. Fullfoert: primary. Ufullfoert: muted
- Klikkbar TILBAKE til fullfoerte steg, ikke fremover
- Footer: "Avbryt" venstre + "<- Tilbake" + "Neste ->" / submit-CTA hoeyre
- "Tilbake" disabled paa steg 1
- Submit-CTA bytter tekst per steg ("Send forslag ->", "Bekreft og betal kr X ->", "Bruk valgt mal ->", "Godta og start ->")

**Single-step-modal regler (pakke 3, 4, 6):**
- Ingen steg-indikator
- Footer: "Avbryt" venstre + 1-3 handlings-knapper hoeyre
- Pakke 4 (PlanApproval) har 3 CTA-er: "Be om endring ->" + "Avslaa" + "Godta og start ->"

**Submit-states:**
- idle -> validating -> submitting (CTA spinner + footer disabled) -> success (accent flash + redirect/auto-close) -> error (toast inni modal)

**Lower-is-better metrics** (puttar, score, HCP): Vis nedgang som SUCCESS-groenn, oppgang som DANGER-roed.
**Higher-is-better metrics** (SG, distanse, antall oekter): Motsatt.

**Referanse-personer:**
- CoachHQ-modaler (pakke 1, 2, 3): Anders Kristiansen som handler, Markus Roinaas Pedersen som spiller-eksempel
- PlayerHQ-modaler (pakke 4, 6): Markus Roinaas Pedersen som handler, Anders K som coach-eksempel
- Payment-modal (pakke 5): noeytral -- viser begge perspektiver

## Output per modal

For hver av de 6 modalene, lever skjermbildene som listet under "OEnsket output" i pakken (typisk 7-10 visninger per modal):
- Hvert steg / hver state (lyst tema)
- Validering-error
- Submit-loading
- Submit-success
- Moerkt tema-variant
- Mobil <=640px

## Start naa

Begynn med Pakke 1 (NewPlanModal) og fortsett uten avbrudd til alle 6 er ferdige.

Naar du er helt ferdig:
- Samlet oversikt med alle 6 thumbnails
- Liste med design-links jeg kan kopiere til tracker
- Flagg evt. caveats/avvik per modal
