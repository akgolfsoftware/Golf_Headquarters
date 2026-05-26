# Custom prompt for Mini-batch 6-C - Tverrgaaende settings + Team (BULK-versjon)

**Kopier ALT under linja inn i claude.ai/design som foerste melding i ny sesjon.**

Foer du sender prompten, last opp disse vedleggene:
1. `wireframe/brain/for-claude-design/branding-style-guide.html` (system-kontekst)
2. `wireframe/brain/for-claude-design/design-system-v2.md` (tekstlig backup)
3. Alle 20 .woff2-filer fra `wireframe/brain/for-claude-design/fonts/`
4. `wireframe/design-batches/batch-6-settings-profile/mini-batches/6-C.md`
5. Alle HTML-filer listet i `6-C-vedlegg.txt`

---

# PROMPT (kopier fra og med denne linja):

Jeg har lastet opp et komplett designsystem og en mini-batch-spec (6-C.md) med 5 tverrgaaende settings-skjermer + utvidet CoachHQ team som skal designes.

## Hva jeg vil

**Generer alle 5 skjermer i ETT loep** - ikke vent paa "neste" mellom hver. Lever dem som 5 paafolgende UI-kits i samme respons.

Rekkefoelge:
1. Pakke 1: Shared CBAC matrise (rolle x capability)
2. Pakke 2: Shared Tilgangskontroll (bruker-tabell + audit)
3. Pakke 3: Shared Notifikasjons-taksonomi (notif-katalog)
4. Pakke 4: Shared Design-tokens viewer (live tema-bytte)
5. Pakke 5: CoachHQ Team (workload + vakt-rotasjon)

For hver skjerm:
- Les pakken i 6-C.md
- Bruk tilhoerende HTML-wireframe (vedlegg) som visuell IA-referanse
- Generer skjermen som UI-kit med korrekt designsystem
- Gaa rett til neste skjerm naar du er ferdig

Etter alle 5: lever en samlet oversikt med alle 5 thumbnails + design-links.

## Felles regler (gjelder ALLE 5 skjermer)

**Designsystem:** Eksakt token-navn - aldri hardkode hex.

**Stil-krav:**
- Norsk bokmaal, AE/OE/AA, **komma som desimal** (12,4), 24-timer
- **Mellomrom som tusenseparator** (1 600 kr)
- Maks 3 lime-elementer (#D1F843) per skjerm
- 8pt-grid for spacing
- Lucide-ikoner, 1.75 stroke
- Asymmetrisk layout

**Anti-AI-regler (KRITISK):**
- ALDRI "God morgen" eller "Welcome back"
- Italic editorial-fragment som hero: *"Tilgang. Hvem ser hva."* / *"Varsler. 28 typer. Hver med sin grunn."*
- Flat farger paa avatarer
- Ingen translateY paa alt

**Disse skjermene er INFO-TETTE:** Matriser, store tabeller, expand-rader. Bruk muted bakgrunn for sekundaer-info, accent kun paa "current" eller aktive states. Ikke fyll skjermen med farger.

**CoachHQ sidebar (admin-kontekst for alle 5):** TO-LAGS - smal moerk rail (56px, #061210) + lys nav-kolonne (200px, #FAFAF7). Active item: rgba(209,248,67,0.30) bg + #0A1F18 tekst.

**Referanse-personer:**
- Coaches: Anders Kristiansen (Hovedcoach/Admin), Sara Larsen (Hovedcoach), Tom Nilsen (Coach)
- Spillere: Markus Roinaas Pedersen, Henrik Nilsen, Anna Karlsen, Mads Roenning, Lise Sandberg, Joachim Tangen, Emma Solberg
- Foreldre: Anne Pedersen (Markus' mor), Tor Pedersen (Markus' far)
- Klubber: Gamle Fredrikstad GK (GFGK), WANG Toppidrett Fredrikstad, Bossum GK, AK Golf Academy

**Cell-states i CBAC-matrise:** x = granted (accent groen-blaa), - = ikke granted (muted grey), x* = override (med stjerne, hover viser kilde).

**Workload-fargekoder (CoachHQ Team):**
- 0-40% = muted (lite arbeid)
- 40-80% = accent (sundt nivaa)
- 80-100% = warning (overarbeidet, vurder omfordeling)

## Output per skjerm

For hver av de 5 skjermene, lever:
1. Hovedskjerm i lyst tema (default)
2. Hover-state paa kritisk element (cell, rad, tab)
3. Filter-aktiv eller expand-state hvor relevant
4. Mobil-versjon (matriser blir lister, tabeller blir kort-stack)

## Start naa

Begynn med Pakke 1 (CBAC matrise) og fortsett uten avbrudd til alle 5 er ferdige.

Naar du er helt ferdig:
- Samlet oversikt med alle 5 thumbnails
- Liste med design-links jeg kan kopiere til tracker
- Flagg evt. caveats per skjerm
