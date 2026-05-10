# Custom prompt for Mini-batch 4-B - Wizards i app (BULK-versjon)

**Kopier ALT under linja inn i claude.ai/design som foerste melding i ny sesjon.**

Foer du sender prompten, last opp disse vedleggene:
1. `wireframe/brain/for-claude-design/branding-style-guide.html` (system-kontekst)
2. `wireframe/brain/for-claude-design/design-system-v2.md` (tekstlig backup)
3. Alle 20 .woff2-filer fra `wireframe/brain/for-claude-design/fonts/`
4. `wireframe/design-batches/batch-4-wizard-form/mini-batches/4-B.md` (mini-batch-spec)
5. Alle 6 HTML-filer listet i `4-B-vedlegg.txt`

---

# PROMPT (kopier fra og med denne linja):

Jeg har lastet opp et komplett designsystem og en mini-batch-spec (4-B.md) med 6 in-app wizard-skjermer som skal designes som arketype-D (Wizard / Form).

## Hva jeg vil

**Generer alle 6 skjermer i ETT loep** -- ikke vent paa "neste" mellom hver. Lever dem som 6 paafolgende UI-kits i samme respons.

Rekkefoelge:
1. Pakke 1: CoachHQ Plan-bygger (6-step plan-wizard)
2. Pakke 2: CoachHQ Periodisering-agent (single agent-form med live preview)
3. Pakke 3: PlayerHQ Ny oekt-wizard (6-step)
4. Pakke 4: PlayerHQ OnskeligOkt -- Be om oekt (single form)
5. Pakke 5: PlayerHQ Coach-melding compose (single send-form)
6. Pakke 6: CoachHQ Import-assistent (3-step)

For hver skjerm:
- Les pakken i 4-B.md
- Bruk tilhoerende HTML-wireframe (vedlegg) som visuell IA-referanse
- Generer skjermen som UI-kit med korrekt designsystem
- Ga rett til neste skjerm naar du er ferdig

Etter alle 6: lever en samlet oversikt med alle 6 thumbnails + design-links.

## Felles regler (gjelder ALLE 6 skjermer)

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
- Eksempler: *"Bygg planen. 6 steg."* / *"Ny oekt for Markus -- 60 minutter."*
- Flat farger paa avatarer (ingen gradient)
- Ingen translateY(-3px) hover paa alt

**Sidebar:**
- **CoachHQ (pakke 1, 2, 6):** TO-LAGS sidebar -- smal moerk rail (56px, #061210) + lys nav-kolonne (200px, #FAFAF7). Active item i nav: rgba(209,248,67,0.30) bg + #0A1F18 tekst.
- **PlayerHQ (pakke 3, 4, 5):** EN-LAGS lys sidebar (200px, #FAFAF7).

**Arketype-D regler (KRITISK):**
- Multi-step (pakke 1, 3, 6): dots eller numbers oeverst -- ALDRI lineaer progressbar
- Aktiv steg: accent-prikk. Fullfoert: primary. Ufullfoert: muted
- Klikkbar steg-prikk TILBAKE til fullfoerte steg, ikke fremover
- "Avbryt" alltid synlig (sekundaer venstre i footer)
- "Tilbake" disabled paa steg 1
- Primary CTA hoeyre, bytter tekst per steg
- Single form (pakke 2, 4, 5): seksjoner med visuelle skiller, sticky footer-CTA
- Inline validering per felt
- Submit-states: idle / validating / submitting / success / error

**Lower-is-better metrics** (puttar, score, HCP): Vis nedgang som SUCCESS-groenn, oppgang som DANGER-roed.
**Higher-is-better metrics** (SG, distanse, antall oekter): Motsatt.

**Referanse-personer:**
- CoachHQ: Anders Kristiansen (hovedcoach)
- Spillere som vises: Markus Roinaas Pedersen, Henrik Nilsen, Anna Karlsen, Mads Roenning, Lise Sandberg, Joachim Tangen
- PlayerHQ: Markus Roinaas Pedersen som hoved-eksempel

## Output per skjerm

For hver av de 6 skjermene, lever skjermbildene som listet under "OEnsket output" i pakken (typisk 7-10 visninger per pakke):
- Hovedstand i lyst tema
- Validering-error
- Submit-loading
- Submit-success
- Moerkt tema-variant
- Mobil <=640px

## Start naa

Begynn med Pakke 1 (Plan-bygger) og fortsett uten avbrudd til alle 6 er ferdige.

Naar du er helt ferdig:
- Samlet oversikt med alle 6 thumbnails
- Liste med design-links jeg kan kopiere til tracker
- Flagg evt. caveats/avvik per skjerm
