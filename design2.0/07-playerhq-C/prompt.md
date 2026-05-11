# Custom prompt for Mini-batch playerhq-C - Wizards + kalender (BULK-versjon)

**Kopier ALT under linja inn i claude.ai/design som foerste melding i ny sesjon.**

Foer du sender prompten, last opp disse vedleggene:
1. `wireframe/brain/for-claude-design/branding-style-guide.html` (system-kontekst)
2. `wireframe/brain/for-claude-design/design-system-v2.md` (tekstlig backup)
3. Alle 20 .woff2-filer fra `wireframe/brain/for-claude-design/fonts/`
4. `wireframe/design-batches/redesign-arketype-e/felles-instruks.md` (anti-state-katalog-regel)
5. `wireframe/design-batches/mvp/playerhq/playerhq-C.md` (mini-batch-spec)
6. Alle HTML-filer listet i `playerhq-C-vedlegg.txt` (5 hovedskjermer + tilhoerende modaler)

---

# PROMPT (kopier fra og med denne linja):

Jeg har lastet opp et komplett designsystem, en felles-instruks for anti-state-katalog, og en mini-batch-spec (playerhq-C.md) med 5 PlayerHQ-wizard/kalender-skjermer som skal designes.

## Hva jeg vil

**Generer alle 5 skjermer i ETT loep** - ikke vent paa "neste" mellom hver. Lever dem som 5 paafolgende UI-kits i samme respons.

Rekkefoelge:
1. Pakke 1: Ny-oekt-wizard (6 steg, dots-indikator)
2. Pakke 2: OEnskeligOekt (single form, 5 seksjoner)
3. Pakke 3: Coach-melding compose (rik form med vedlegg)
4. Pakke 4: Tren-kalender (uke-view, event-blokker)
5. Pakke 5: Treningsdetalj (4 tabs, post-oekt review + refleksjon)

For hver skjerm:
- Les pakken i playerhq-C.md
- Bruk tilhoerende HTML-wireframe (vedlegg) som visuell IA-referanse
- Generer skjermen som UI-kit med korrekt designsystem
- Ga rett til neste skjerm naar du er ferdig

Etter alle 5: lever en samlet oversikt med alle thumbnails + design-links.

## Anti-state-katalog (KRITISK)

Foelg felles-instruks.md eksakt:
- **EEN produksjons-skjerm per HTML-fil** - ikke captioned mini-mockups side-om-side
- Default-state rendret i full stoerrelse (minimum 1440x900 for desktop)
- Ingen "1 - Idle, 2 - Aktiv, 3 - Pause" varianter paa samme side
- **For Ny-oekt-wizard:** hvert av de 6 stegene leveres som SEPARAT HTML-fil med suffiks (eks `01-ny-okt-steg-1.html`, `01-ny-okt-steg-2.html`, ... `01-ny-okt-tier-blokk.html`)
- Andre states (Pro vs Free-lock, empty, hover, moerkt tema, mobil): ogsaa SEPARATE HTML-filer

## Felles regler (gjelder ALLE 5 skjermer)

**Designsystem:** Bruk eksakt token-navn (--brand-primary, --pyr-fys, etc) - aldri hardkode hex.

**Stil-krav:**
- Norsk bokmaal, AE/OE/AA, **komma som desimal** (12,4 ikke 12.4), 24-timer
- **Mellomrom som tusenseparator** (8 t 30 m, 1 600 kr - ikke 8.30 / 1.600)
- Maks 3 lime-elementer (#D1F843) synlig per skjerm
- Maks 1 italic Instrument Serif-element per skjerm - hero ELLER editorial quote, ikke begge
- 8pt-grid for spacing (8/16/24/32/40/48/64)
- Lucide-ikoner, 1.75 stroke
- Asymmetrisk layout (ikke 3x1 uniform)

**Anti-AI-regler (KRITISK):**
- ALDRI "God morgen, Markus" eller "Welcome back" - bruk italic editorial-fragment
- Eksempler: *"Be om oekt med Anders"* / *"6 oekter denne uka, Markus."*
- Flat farger paa avatarer (ingen gradient)
- Ingen translateY(-3px) hover paa alt
- Bare lime gradient er tillatt: `#D1F843 -> #C2EE2F` paa progress-bar fill

**PlayerHQ-sidebar er LYS** (#FFFFFF), enkelt-lag 220px - ALDRI moerk rail som i CoachHQ. Active item: rgba(209,248,67,0.30) bg + #0A1F18 tekst.

**Wizard-indikator (KRITISK forskjell fra CoachHQ):** PlayerHQ bruker DOTS (●—●—●—○—○—○), ikke numbers. Mer "lekent" enn CoachHQ.

**Referanse-personer:**
- Spiller: Markus Roinaas Pedersen (HCP 12,4, hjemmebane GFGK, basert i Fredrikstad)
- Hovedcoach: Anders Kristiansen (svarer typisk innen 4 timer paa hverdager)
- Fasiliteter: Mulligan Studio 1-4 (hans vanlige), GFGK Range, Bossum
- Aktiv plan: "Sommer-toppform" 9. mai - 30. juni, peak Soerlandsaapent 12. juni

**Pyramide-farger (kalender + plan-rad):**
- FYS groenn `#16A34A` / TEK darker primary `#005840` / SLAG lime accent `#D1F843` / SPILL gold `#F4C430` / TURN graa `#5E5C57`

**Event-farger (Tren-kalender):**
- Coaching=lime accent + pyramide-stripe / Selvtrening=border-only dashed + stripe / Gruppe=primary fylt Users-ikon / Runde=gold Flag-ikon / Turnering=secondary full bredde / Fysio=muted Heart-ikon

**Status-prikk paa kalender-blokk:** Planlagt=accent / Gjennomfoert=success-groenn / Hoppet over=destructive / Forsinket=gold

**Tier-gating-kvoter:**
- Ny-oekt-wizard: Free=3/mnd, Pro+=ubegrenset
- OEnskeligOekt: Free=1/mnd, Pro=4/mnd, Elite=ubegrenset
- Coach-melding: Free=5/mnd, Pro+=ubegrenset
- Tren-kalender maaned-view + iCal: Pro+ only
- Treningsdetalj: Pro-only (Free har ikke saa rik post-oekt review)

## Output per skjerm

For hver av de 5 skjermene, lever:
1. Hovedskjerm i lyst tema (default state, fullbleed 1440px+)
   - Ny-oekt-wizard: ALLE 6 STEG som separate HTML-filer
2. Moerkt tema (samme data, separat HTML - bare ett steg for wizard, f.eks. steg 3)
3. Tier-laast state hvor relevant (Free-blokk-melding eller maaned-view-gate - separat HTML)
4. EEN ekstra state-variasjon (empty, hover, success, eller submit-loading - separat HTML)
5. Mobil ≤640px hvis layout endres dramatisk - separat HTML

## Start naa

Begynn med Pakke 1 (Ny-oekt-wizard) og fortsett uten avbrudd til alle 5 er ferdige.

Naar du er helt ferdig:
- Samlet oversikt med alle thumbnails
- Liste med design-links jeg kan kopiere til tracker
- Flagg evt. caveats/avvik per skjerm
