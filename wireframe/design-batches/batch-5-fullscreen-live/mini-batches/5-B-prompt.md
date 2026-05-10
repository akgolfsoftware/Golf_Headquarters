# Custom prompt for Mini-batch 5-B - Tverrgaaende fullscreen + Live Session 4-modal-pakke (BULK-versjon)

**Kopier ALT under linja inn i claude.ai/design som foerste melding i ny sesjon.**

Foer du sender prompten, last opp disse vedleggene:
1. `wireframe/brain/for-claude-design/branding-style-guide.html` (system-kontekst)
2. `wireframe/brain/for-claude-design/design-system-v2.md` (tekstlig backup)
3. Alle 20 .woff2-filer fra `wireframe/brain/for-claude-design/fonts/`
4. `wireframe/design-batches/batch-5-fullscreen-live/mini-batches/5-B.md` (mini-batch-spec)
5. Alle 6 HTML-filer listet i `5-B-vedlegg.txt`

---

# PROMPT (kopier fra og med denne linja):

Jeg har lastet opp et komplett designsystem og en mini-batch-spec (5-B.md) med 6 fullscreen / live-enheter som skal designes. To av dem er tverrgaaende skjermer, fire er en sammenhengende Live Session-modal-flyt.

## Hva jeg vil

**Generer alle 6 enheter i ETT loep** - ikke vent paa "neste" mellom hver. Lever dem som 6 paafolgende UI-kits i samme respons.

Rekkefoelge:
1. Pakke 1: Agent Pipeline Overview (tverrgaaende full-system kart)
2. Pakke 2: Periodiserings-Agent (4-lags decision-stack)
3. Pakke 3: LiveIntroModal (Screen 1 -- foer start)
4. Pakke 4: LiveActiveModal (Screen 2 -- rep-logging)
5. Pakke 5: LiveBetweenModal (Screen 3 -- mellom oevelser)
6. Pakke 6: LiveSummaryModal (Screen 4 -- oppsummering)

For hver enhet:
- Les pakken i 5-B.md
- Bruk tilhoerende HTML-wireframe (vedlegg) som visuell IA-referanse
- Generer enheten som UI-kit med korrekt designsystem
- Ga rett til neste enhet naar du er ferdig

Etter alle 6: lever en samlet oversikt med alle 6 thumbnails + design-links.

## KRITISK -- Live Session-modal-flyten (pakke 3-6) MAA henge sammen

Pakke 3, 4, 5, 6 er **fire modaler i en sammenhengende flyt**. Spilleren ser dem i rekkefoelge:

LiveIntroModal -> LiveActiveModal -> LiveBetweenModal -> LiveActiveModal (neste oevelse) -> LiveBetweenModal -> ... -> LiveSummaryModal

Alle 4 modaler MAA:
- Bruke samme bakgrunns-grunntone (#0A1F18) -- LiveBetween har breathing-effekt, LiveSummary har konfetti-grain, men grunntonen er identisk
- Bruke samme typografi-skala (counter JetBrains Mono 120px, italic Instrument Serif for hero-tekst)
- Bruke samme primary-CTA-stil (88px lime, rounded-full)
- Bruke samme topp-bar-struktur (56px, venstre kontekst-label + hoeyre Lukk-X)
- Vise mini-progress-bar paa LiveActive og LiveBetween for kontinuitet

Flyten skal foeles som EN sammenhengende opplevelse, ikke 4 separate skjermer.

## KRITISK -- Fullscreen-regel (gjelder ALLE 6 enheter)

Disse er **arketype E -- Fullscreen / Live**:

- **INGEN sidebar.** Sidebar er skjult helt.
- **INGEN top-nav-bar med logo og menyer.** Kun en minimal 56px topp-bar.
- **Moerk bakgrunn:** #0A1F18 default
- **Store tap-targets:** Primaer CTA i bunn-bar er 88px hoey, full bredde minus 32px padding, rounded-full
- **Lukk/Avslutt alltid topp-hoeyre** som 40x40px sirkel med X-ikon
- **Live-counter sentrert** med JetBrains Mono store tall (120px for rep-counter)

Hvis du genererer en skjerm med sidebar eller standard navigation, har du gjort feil.

## Felles regler (gjelder ALLE 6 enheter)

**Designsystem:** Bruk eksakt token-navn -- aldri hardkode hex.

**Stil-krav:**
- Norsk bokmaal, AE/OE/AA, **komma som desimal** (12,4 ikke 12.4), 24-timer
- **Mellomrom som tusenseparator** (1 600 kr, ikke 1.600)
- Maks 3 lime-elementer (#D1F843) synlig per skjerm
- 8pt-grid for spacing (8/16/24/32/40/48/64)
- Lucide-ikoner, 1.75 stroke
- JetBrains Mono for ALL tall-typografi

**Anti-AI-regler (KRITISK):**
- ALDRI "God morgen, [Navn]" eller "Welcome back" -- bruk italic editorial-fragment ("Klar?", "Bra jobba, Markus", "Oekt fullfoert")
- Flat farger paa avatarer (ingen gradient)
- Ingen translateY(-3px) hover paa alt
- INGEN emojier i UI -- bruk Lucide-ikoner. Eneste tillatte unntak: 💡 i agent-tip-kort hvis det blir for tomt uten

**Pyramide-fargekoding (konsistent):**
- FYS = #16A34A
- TEK = #005840
- SLAG = #D1F843
- SPILL = #F4C430
- TURN = #5E5C57

**Counter- og typografi-skala:**
- Rep-teller (LiveActive): JetBrains Mono 120px lime
- Pust-nedtelling (LiveBetween): JetBrains Mono 96px (lime ved <=10 sek)
- Hero-tid (LiveSummary): JetBrains Mono 64px lime
- Hero-tekst (italic editorial): Instrument Serif 40px italic
- Kontekst-label topp-bar: Geist 12px uppercase letterspacing 0.08em

**Pipeline-spesifikt (pakke 1 og 2):**
- Signal-noder: 24px sirkler (pakke 1) / N/A (pakke 2)
- Skill-noder: 240x80px kort
- Agent-noder: 96x96px sirkler med lime border + glow ved aktiv
- Linjer: 2px stroke #2B4F42, animert dash naar data flyter

**Decision-stack-spesifikt (pakke 2):**
- 4 lag stacked vertikalt med 2px linje-konnektor mellom
- Hvert lag har header (L1 MAAL Geist Mono 12px uppercase) + tittel italic Instrument Serif 18px + chevron-toggle
- L2 pyramide-mini-chart: horisontal stacked bar 64px hoey
- L3 volum-bar-chart: 8 vertikale bars
- L4 tidslinje: horisontal med segment-bg (oppbygning/peak/deload)

**Referanse-personer:**
- Coach: Anders Kristiansen
- Spiller (gjennomgaaende i Live-flyten): Markus Roinaas Pedersen
- Andre spillere som kan vises: Henrik Nilsen, Anna Karlsen, Emma Solberg

**Lower-is-better metrics** (puttar, score, HCP): Vis nedgang som SUCCESS-groenn, oppgang som DANGER-roed.
**Higher-is-better metrics** (SG, distanse, antall reps): Motsatt.

## Output per enhet

For hver av de 6 enhetene, lever:
1. Hovedskjerm i moerkt tema (default for fullscreen)
2. Hover/active-state paa kritiske elementer (counter-tap, agent-node-klikk, decision-stack-toggle)
3. Empty/loading/pause-state hvor relevant
4. Tier-gate-state hvor relevant
5. Mobil-versjon (mobile-first by design)

For Live-modalene (3-6) ekstra: vis dem som en sammenhengende flyt-strip (intro -> active -> between -> summary side ved side i ende-oversikten).

## Start naa

Begynn med Pakke 1 (Agent Pipeline Overview) og fortsett uten avbrudd til alle 6 er ferdige.

Naar du er helt ferdig:
- Samlet oversikt med alle 6 thumbnails
- Spesielt: vis Live-modalene 3-6 i flyt-rekkefoelge
- Liste med design-links jeg kan kopiere til tracker
- Flagg evt. caveats/avvik per enhet
