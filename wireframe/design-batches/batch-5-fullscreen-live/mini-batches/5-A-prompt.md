# Custom prompt for Mini-batch 5-A - PlayerHQ Live + CoachHQ fullscreen (BULK-versjon)

**Kopier ALT under linja inn i claude.ai/design som foerste melding i ny sesjon.**

Foer du sender prompten, last opp disse vedleggene:
1. `wireframe/brain/for-claude-design/branding-style-guide.html` (system-kontekst)
2. `wireframe/brain/for-claude-design/design-system-v2.md` (tekstlig backup)
3. Alle 20 .woff2-filer fra `wireframe/brain/for-claude-design/fonts/`
4. `wireframe/design-batches/batch-5-fullscreen-live/mini-batches/5-A.md` (mini-batch-spec)
5. Alle 6 HTML-filer listet i `5-A-vedlegg.txt`

---

# PROMPT (kopier fra og med denne linja):

Jeg har lastet opp et komplett designsystem og en mini-batch-spec (5-A.md) med 6 fullscreen / live-skjermer som skal designes.

## Hva jeg vil

**Generer alle 6 skjermer i ETT loep** - ikke vent paa "neste" mellom hver. Lever dem som 6 paafolgende UI-kits i samme respons.

Rekkefoelge:
1. Pakke 1: Live Session (PlayerHQ tap-mode)
2. Pakke 2: Live Tapper (PlayerHQ range-mode)
3. Pakke 3: Agent Pipeline (PlayerHQ visualisering)
4. Pakke 4: Coach Agent Chat (CoachHQ AI-chat)
5. Pakke 5: Sesjon Opptak (CoachHQ Deepgram)
6. Pakke 6: Coaching Board (CoachHQ kanban-fullscreen)

For hver skjerm:
- Les pakken i 5-A.md
- Bruk tilhoerende HTML-wireframe (vedlegg) som visuell IA-referanse
- Generer skjermen som UI-kit med korrekt designsystem
- Ga rett til neste skjerm naar du er ferdig

Etter alle 6: lever en samlet oversikt med alle 6 thumbnails + design-links.

## KRITISK -- Fullscreen-regel (gjelder ALLE 6 skjermer)

Disse skjermene er **arketype E -- Fullscreen / Live**. Det betyr:

- **INGEN sidebar.** Sidebar er skjult helt. Dette er ikke en list-skjerm med navigation.
- **INGEN top-nav-bar med logo og menyer.** Kun en minimal 56px topp-bar med kontekst-label venstre + Lukk-X hoeyre.
- **Moerk bakgrunn:** #0A1F18 default, #000000 for Live Tapper, #0F1F1A for Coach Agent Chat
- **Store tap-targets:** Primaer CTA i bunn-bar er 88px hoey, full bredde minus 32px padding, rounded-full
- **Lukk/Avslutt alltid topp-hoeyre** som 40x40px sirkel med X-ikon
- **Live-counter sentrert** med JetBrains Mono store tall (120px for rep-counter, 144px for range)

Hvis du genererer en skjerm med sidebar eller standard navigation, har du gjort feil. Sjekk arketype-E-spec foerst.

## Felles regler (gjelder ALLE 6 skjermer)

**Designsystem:** Bruk eksakt token-navn (--brand-primary, --pyr-fys, etc) - aldri hardkode hex.

**Stil-krav:**
- Norsk bokmaal, AE/OE/AA, **komma som desimal** (12,4 ikke 12.4), 24-timer
- **Mellomrom som tusenseparator** (1 600 kr, ikke 1.600)
- Maks 3 lime-elementer (#D1F843) synlig per skjerm -- live-counter er ofte den ene
- 8pt-grid for spacing (8/16/24/32/40/48/64)
- Lucide-ikoner, 1.75 stroke
- JetBrains Mono for ALL tall-typografi (counter, klokke, tidsstempel)

**Anti-AI-regler (KRITISK):**
- ALDRI "God morgen, [Navn]" eller "Welcome back" -- bruk italic editorial-fragment eller direkte funksjons-tekst ("Klar?", "OEkt fullfoert", "Live")
- Eksempler topp-tekster: *"Bra jobba, Markus"* / *"Klar?"* / *"OEkt 12 av 18"*
- Flat farger paa avatarer (ingen gradient)
- Ingen translateY(-3px) hover paa alt -- bruk subtil ring eller -1px lift
- INGEN emojier i UI -- bruk Lucide-ikoner. Eneste unntak: 💡 i agent-tip-kort hvis det blir for tomt uten

**Pyramide-fargekoding (konsistent paa tvers av alle skjermer):**
- FYS = #16A34A (groenn)
- TEK = #005840 (darker primary)
- SLAG = #D1F843 (lime accent)
- SPILL = #F4C430 (gold)
- TURN = #5E5C57 (graa)

**Counter-typografi:**
- Rep-teller: JetBrains Mono 120px, weight 500, tabular-nums, lime accent
- Range-teller: JetBrains Mono 144px (stoerre)
- Klokke/nedtelling: JetBrains Mono 64px

**Referanse-personer:**
- CoachHQ: Anders Kristiansen (hovedcoach)
- Spillere som vises: Markus Roinaas Pedersen, Henrik Nilsen, Anna Karlsen, Mads Roenning, Lise Sandberg, Joachim Tangen, Emma Solberg

**Lower-is-better metrics** (puttar, score, HCP): Vis nedgang som SUCCESS-groenn, oppgang som DANGER-roed.
**Higher-is-better metrics** (SG, distanse, antall reps): Motsatt.

## Output per skjerm

For hver av de 6 skjermene, lever:
1. Hovedskjerm i moerkt tema (default for fullscreen)
2. Hover/active-state paa kritiske elementer (counter-tap, kort-drag, agent-node)
3. Empty/loading/pause-state hvor relevant
4. Tier-gate-state hvor relevant (Free-bruker)
5. Mobil-versjon (mobile-first by design -- desktop er ofte sentrert 480px container)

## Start naa

Begynn med Pakke 1 (Live Session) og fortsett uten avbrudd til alle 6 er ferdige.

Naar du er helt ferdig:
- Samlet oversikt med alle 6 thumbnails
- Liste med design-links jeg kan kopiere til tracker
- Flagg evt. caveats/avvik per skjerm
