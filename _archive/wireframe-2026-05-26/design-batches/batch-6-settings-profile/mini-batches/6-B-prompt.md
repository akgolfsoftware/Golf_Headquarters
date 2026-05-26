# Custom prompt for Mini-batch 6-B - PlayerHQ Settings + felles layout (BULK-versjon)

**Kopier ALT under linja inn i claude.ai/design som foerste melding i ny sesjon.**

Foer du sender prompten, last opp disse vedleggene:
1. `wireframe/brain/for-claude-design/branding-style-guide.html` (system-kontekst)
2. `wireframe/brain/for-claude-design/design-system-v2.md` (tekstlig backup)
3. Alle 20 .woff2-filer fra `wireframe/brain/for-claude-design/fonts/`
4. `wireframe/design-batches/batch-6-settings-profile/mini-batches/6-B.md`
5. Alle HTML-filer listet i `6-B-vedlegg.txt`

---

# PROMPT (kopier fra og med denne linja):

Jeg har lastet opp et komplett designsystem og en mini-batch-spec (6-B.md) med 5 PlayerHQ Settings-skjermer + felles innstillings-layout som skal designes.

## Hva jeg vil

**Generer alle 5 skjermer i ETT loep** - ikke vent paa "neste" mellom hver. Lever dem som 5 paafolgende UI-kits i samme respons.

Rekkefoelge:
1. Pakke 1: PlayerHQ Min profil (junior med foreldre)
2. Pakke 2: PlayerHQ Helse (skader, soevn, restitusjon)
3. Pakke 3: PlayerHQ Varsler (toggle-matrise)
4. Pakke 4: PlayerHQ Abonnement (Free/Pro/Elite)
5. Pakke 5: Shared Innstillings-layout (master template)

For hver skjerm:
- Les pakken i 6-B.md
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
- ALDRI "God morgen, [Navn]" eller "Welcome back"
- Italic editorial-fragment som hero: *"Profilen din. Synlig for coach Anders."* / *"Helse foerst. Resten kommer av seg selv."*
- Flat farger paa avatarer
- Ingen translateY paa alt

**PlayerHQ sidebar:** Enkel venstre-sidebar (240px) lyst tema paa desktop. Bunn-tab-bar paa mobil med 4-5 ikoner (Hjem, Trening, Mal, Meg).

**Spillertype-referanse:** Markus Roinaas Pedersen (junior, 17 aar, A-kategori, Pro-tier, HCP +2,4, GFGK + WANG, coach Anders K). Han har 2 foreldre: Anne (mor, full innsyn) og Tor (far, kun fakturaer).

**Read-only-default-moenster:** Alltid felter som tekst med "Endre ->"-link. Klikk aapner inline-edit eller modal.

**Tier-differensiering:**
- Free: Mange features blur'et med "Pro: ... -> Oppgrader"-banner
- Pro (Markus): Full tilgang, accent-border-pill paa "current"-card
- Elite: Premium feel, gold-accent

**Lower-is-better metrics** (HCP, smerte): Vis nedgang som SUCCESS-groenn.
**Higher-is-better metrics** (soevn, energi): Motsatt.

## Output per skjerm

For hver av de 5 skjermene, lever:
1. Hovedskjerm i lyst tema (default)
2. Inline-edit eller hover-state paa kritisk element
3. Empty/loading/tier-gate-state hvor relevant
4. Mobil-versjon (PlayerHQ er primaert mobile-first)

## Start naa

Begynn med Pakke 1 (Min profil) og fortsett uten avbrudd til alle 5 er ferdige.

Naar du er helt ferdig:
- Samlet oversikt med alle 5 thumbnails
- Liste med design-links jeg kan kopiere til tracker
- Flagg evt. caveats per skjerm
