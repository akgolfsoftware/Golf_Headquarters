# Custom prompt for Mini-batch playerhq-A - Maal-data (BULK-versjon)

**Kopier ALT under linja inn i claude.ai/design som foerste melding i ny sesjon.**

Foer du sender prompten, last opp disse vedleggene:
1. `wireframe/brain/for-claude-design/branding-style-guide.html` (system-kontekst)
2. `wireframe/brain/for-claude-design/design-system-v2.md` (tekstlig backup)
3. Alle 20 .woff2-filer fra `wireframe/brain/for-claude-design/fonts/`
4. `wireframe/design-batches/redesign-arketype-e/felles-instruks.md` (anti-state-katalog-regel)
5. `wireframe/design-batches/mvp/playerhq/playerhq-A.md` (mini-batch-spec)
6. Alle HTML-filer listet i `playerhq-A-vedlegg.txt` (5 hovedskjermer + tilhoerende modaler)

---

# PROMPT (kopier fra og med denne linja):

Jeg har lastet opp et komplett designsystem, en felles-instruks for anti-state-katalog, og en mini-batch-spec (playerhq-A.md) med 5 PlayerHQ-maal-data-skjermer som skal designes.

## Hva jeg vil

**Generer alle 5 skjermer i ETT loep** - ikke vent paa "neste" mellom hver. Lever dem som 5 paafolgende UI-kits i samme respons.

Rekkefoelge:
1. Pakke 1: Baner (kart + tabs + bane-cards)
2. Pakke 2: Maal-detalj (HCP-trend med projeksjon)
3. Pakke 3: Maal-leaderboard (rang-tabell, tier-laast for Free)
4. Pakke 4: Test-detalj (test-historikk + graf)
5. Pakke 5: TrackMan-analyse (per-koelle, KPI + trajectory)

For hver skjerm:
- Les pakken i playerhq-A.md
- Bruk tilhoerende HTML-wireframe (vedlegg) som visuell IA-referanse
- Generer skjermen som UI-kit med korrekt designsystem
- Ga rett til neste skjerm naar du er ferdig

Etter alle 5: lever en samlet oversikt med alle 5 thumbnails + design-links.

## Anti-state-katalog (KRITISK)

Foelg felles-instruks.md eksakt:
- **EEN produksjons-skjerm per HTML-fil** - ikke captioned mini-mockups side-om-side
- Default-state rendret i full stoerrelse (minimum 1440x900 for desktop, 1024x768 for modal)
- Ingen "1 - Idle, 2 - Aktiv, 3 - Pause" varianter paa samme side
- Hvis flere states trengs (Free vs Pro, empty, loading, moerkt tema): lever som SEPARATE HTML-filer med klare suffikser (f.eks. `02-mal-detalj-trend.html`, `02-mal-detalj-free-lock.html`, `02-mal-detalj-dark.html`)

## Felles regler (gjelder ALLE 5 skjermer)

**Designsystem:** Bruk eksakt token-navn (--brand-primary, --pyr-fys, etc) - aldri hardkode hex.

**Stil-krav:**
- Norsk bokmaal, AE/OE/AA, **komma som desimal** (12,4 ikke 12.4), 24-timer
- **Mellomrom som tusenseparator** (2 580 spin, 6 124 m, ikke 2.580 / 6,124)
- Maks 3 lime-elementer (#D1F843) synlig per skjerm
- Maks 1 italic Instrument Serif-element per skjerm - reservert for hero eller editorial quote
- 8pt-grid for spacing (8/16/24/32/40/48/64)
- Lucide-ikoner, 1.75 stroke
- Asymmetrisk layout (ikke 3x1 uniform)

**Anti-AI-regler (KRITISK):**
- ALDRI "God morgen, Markus" eller "Welcome back" - bruk italic editorial-fragment
- Eksempler: *"8 baner spilt, Markus."* / *"#7 av 24 i klubben, Markus."*
- Flat farger paa avatarer (ingen gradient)
- Ingen translateY(-3px) hover paa alt
- Bare lime gradient er tillatt: `#D1F843 -> #C2EE2F` paa progress-bar fill

**PlayerHQ-sidebar er LYS** (#FFFFFF), enkelt-lag 220px - ALDRI moerk rail som i CoachHQ. Active item: rgba(209,248,67,0.30) bg + #0A1F18 tekst.

**Referanse-personer:**
- Spiller: Markus Roinaas Pedersen (HCP 12,4 - eller +2,4 paa Maal-detalj, juster per skjerm)
- Hovedcoach: Anders Kristiansen
- Klubb: GFGK (Gamle Fredrikstad Golfklubb), Fredrikstad

**Lower-is-better metrics** (HCP, score, puttar, avvik): Vis nedgang som SUCCESS-groenn, oppgang som DANGER-roed.
**Higher-is-better metrics** (SG, carry, ball-speed, antall oekter, badges): Motsatt.

**Tier-gating-visualisering:**
- Free-tier lock: full-screen lock-overlay-card med Lucide `Lock` 48px, headline, 3 fordeler, CTA "Oppgrader til Pro ->"
- Pro-tier med Elite-feature: inline lock paa knapp eller seksjon, ikke full overlay

## Output per skjerm

For hver av de 5 skjermene, lever:
1. Hovedskjerm i lyst tema (default state, fullbleed 1440px+)
2. Moerkt tema (samme data, separat HTML)
3. Tier-laast state hvor relevant (Free-lock-overlay separat HTML)
4. EEN ekstra state-variasjon (empty, hover, tab-bytte) hvor det gir verdi - separat HTML
5. Mobil ≤640px hvis layout endres dramatisk - separat HTML

## Start naa

Begynn med Pakke 1 (Baner) og fortsett uten avbrudd til alle 5 er ferdige.

Naar du er helt ferdig:
- Samlet oversikt med alle 5 thumbnails
- Liste med design-links jeg kan kopiere til tracker
- Flagg evt. caveats/avvik per skjerm
