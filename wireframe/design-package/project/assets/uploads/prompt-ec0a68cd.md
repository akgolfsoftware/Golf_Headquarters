# Custom prompt for Mini-batch playerhq-B - Coach-samhandling (BULK-versjon)

**Kopier ALT under linja inn i claude.ai/design som foerste melding i ny sesjon.**

Foer du sender prompten, last opp disse vedleggene:
1. `wireframe/brain/for-claude-design/branding-style-guide.html` (system-kontekst)
2. `wireframe/brain/for-claude-design/design-system-v2.md` (tekstlig backup)
3. Alle 20 .woff2-filer fra `wireframe/brain/for-claude-design/fonts/`
4. `wireframe/design-batches/redesign-arketype-e/felles-instruks.md` (anti-state-katalog-regel)
5. `wireframe/design-batches/mvp/playerhq/playerhq-B.md` (mini-batch-spec)
6. Alle HTML-filer listet i `playerhq-B-vedlegg.txt` (5 hovedskjermer + tilhoerende modaler)

---

# PROMPT (kopier fra og med denne linja):

Jeg har lastet opp et komplett designsystem, en felles-instruks for anti-state-katalog, og en mini-batch-spec (playerhq-B.md) med 5 PlayerHQ-coach-samhandling-skjermer som skal designes.

## Hva jeg vil

**Generer alle 5 skjermer i ETT loep** - ikke vent paa "neste" mellom hver. Lever dem som 5 paafolgende UI-kits i samme respons.

Rekkefoelge:
1. Pakke 1: Coach-detalj (5 tabs, profil + sertifiseringer + multi-coach drawer)
2. Pakke 2: Coaching-planer (kanban: Foreslaatt - Aktiv - Ferdig)
3. Pakke 3: Coaching-plan-detalj (5 tabs, coach-quote + foran/bak-skjema)
4. Pakke 4: Coach-notater (feed, 12 notat-cards, type-pills)
5. Pakke 5: Notater-detalj (4 tabs, notat med actionable + traad)

For hver skjerm:
- Les pakken i playerhq-B.md
- Bruk tilhoerende HTML-wireframe (vedlegg) som visuell IA-referanse
- Generer skjermen som UI-kit med korrekt designsystem
- Ga rett til neste skjerm naar du er ferdig

Etter alle 5: lever en samlet oversikt med alle 5 thumbnails + design-links.

## Anti-state-katalog (KRITISK)

Foelg felles-instruks.md eksakt:
- **EEN produksjons-skjerm per HTML-fil** - ikke captioned mini-mockups side-om-side
- Default-state rendret i full stoerrelse (minimum 1440x900 for desktop, 1024x768 for modal)
- Ingen "1 - Idle, 2 - Aktiv, 3 - Pause" varianter paa samme side
- Hvis flere states trengs (Pro vs Free-lock, tab-bytte, hover, moerkt tema, mobil): lever som SEPARATE HTML-filer med klare suffikser

## Felles regler (gjelder ALLE 5 skjermer)

**Designsystem:** Bruk eksakt token-navn (--brand-primary, --pyr-fys, etc) - aldri hardkode hex.

**Stil-krav:**
- Norsk bokmaal, AE/OE/AA, **komma som desimal** (4,9 ikke 4.9), 24-timer
- **Mellomrom som tusenseparator** (280 spillere, 1 600 kr - ikke 280. / 1.600)
- Maks 3 lime-elementer (#D1F843) synlig per skjerm
- Maks 1 italic Instrument Serif-element per skjerm - hero ELLER editorial quote, ikke begge
- 8pt-grid for spacing (8/16/24/32/40/48/64)
- Lucide-ikoner, 1.75 stroke
- Asymmetrisk layout (ikke 3x1 uniform)

**Anti-AI-regler (KRITISK):**
- ALDRI "God morgen, Markus" eller "Welcome back" - bruk italic editorial-fragment
- Eksempler: *"1 aktiv plan, Markus. 2 forslag venter."* / *"12 notater fra Anders, Markus."*
- Flat farger paa avatarer (ingen gradient)
- Ingen translateY(-3px) hover paa alt
- Bare lime gradient er tillatt: `#D1F843 -> #C2EE2F` paa progress-bar fill

**PlayerHQ-sidebar er LYS** (#FFFFFF), enkelt-lag 220px - ALDRI moerk rail som i CoachHQ. Active item: rgba(209,248,67,0.30) bg + #0A1F18 tekst.

**Referanse-personer:**
- Spiller: Markus Roinaas Pedersen (HCP 12,4, hjemmebane GFGK)
- Hovedcoach: Anders Kristiansen (NGF Trener IV, 12 aar erfaring, 280+ spillere, 4,9 snitt-fokus)
- Sub-coaches: Tom Hansen (Putt-spesialist), Sara Lien (Mental coach)
- Aktiv plan: "Sommer-toppform" 9. mai - 30. juni, peak Soerlandsaapent 12. juni

**Tier-gating (sentralt for denne mini-batchen):**
- Coach-detalj: kun synlig for Pro (ikke en fane for Free)
- Coaching-planer (list): Full Free-lock-overlay med Lucide `Lock` 48px + 3 fordeler + CTA "Oppgrader til Pro ->"
- Coaching-plan-detalj: Pro-only
- Coach-notater (feed): Full Free-lock-overlay
- Notater-detalj: Pro-only

**Notat-typer (pill-farger):**
- Tilbakemelding (primary) / Plan (accent lime) / Spoersmaal (warning amber) / Video-review (destructive subtil)

**Online-status paa coach-avatar:** Groenn prikk = online, graa = offline med "Sist sett: ..."-tekst.

## Output per skjerm

For hver av de 5 skjermene, lever:
1. Hovedskjerm i lyst tema (default state, fullbleed 1440px+)
2. Moerkt tema (samme data, separat HTML)
3. Tier-laast state hvor relevant (Free-lock-overlay separat HTML)
4. EEN ekstra state-variasjon (tab-bytte, empty, hover, eller "bak skjema") - separat HTML
5. Mobil ≤640px hvis layout endres dramatisk - separat HTML

## Start naa

Begynn med Pakke 1 (Coach-detalj) og fortsett uten avbrudd til alle 5 er ferdige.

Naar du er helt ferdig:
- Samlet oversikt med alle 5 thumbnails
- Liste med design-links jeg kan kopiere til tracker
- Flagg evt. caveats/avvik per skjerm
