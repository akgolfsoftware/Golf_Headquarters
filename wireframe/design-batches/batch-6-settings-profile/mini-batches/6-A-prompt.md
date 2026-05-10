# Custom prompt for Mini-batch 6-A - CoachHQ Settings (BULK-versjon)

**Kopier ALT under linja inn i claude.ai/design som foerste melding i ny sesjon.**

Foer du sender prompten, last opp disse vedleggene:
1. `wireframe/brain/for-claude-design/branding-style-guide.html` (system-kontekst)
2. `wireframe/brain/for-claude-design/design-system-v2.md` (tekstlig backup)
3. Alle 20 .woff2-filer fra `wireframe/brain/for-claude-design/fonts/`
4. `wireframe/design-batches/batch-6-settings-profile/mini-batches/6-A.md` (mini-batch-spec)
5. Alle HTML-filer listet i `6-A-vedlegg.txt`

---

# PROMPT (kopier fra og med denne linja):

Jeg har lastet opp et komplett designsystem og en mini-batch-spec (6-A.md) med 5 CoachHQ Settings-skjermer som skal designes.

## Hva jeg vil

**Generer alle 5 skjermer i ETT loep** - ikke vent paa "neste" mellom hver. Lever dem som 5 paafolgende UI-kits i samme respons.

Rekkefoelge:
1. Pakke 1: Coach-profil
2. Pakke 2: Bruker-innstillinger
3. Pakke 3: Sikkerhet (2FA + sesjoner)
4. Pakke 4: API + integrasjoner
5. Pakke 5: Tilgjengelighet (coach-kalender)

For hver skjerm:
- Les pakken i 6-A.md
- Bruk tilhoerende HTML-wireframe (vedlegg) som visuell IA-referanse
- Generer skjermen som UI-kit med korrekt designsystem
- Gaa rett til neste skjerm naar du er ferdig

Etter alle 5: lever en samlet oversikt med alle 5 thumbnails + design-links.

## Felles regler (gjelder ALLE 5 skjermer)

**Designsystem:** Bruk eksakt token-navn (--brand-primary, --pyr-fys, etc) - aldri hardkode hex.

**Stil-krav:**
- Norsk bokmaal, AE/OE/AA, **komma som desimal** (12,4 ikke 12.4), 24-timer
- **Mellomrom som tusenseparator** (1 600 kr, ikke 1.600)
- Maks 3 lime-elementer (#D1F843) synlig per skjerm
- 8pt-grid for spacing (8/16/24/32/40/48/64)
- Lucide-ikoner, 1.75 stroke
- Asymmetrisk layout (ikke 3x1 uniform)

**Anti-AI-regler (KRITISK):**
- ALDRI "God morgen, [Navn]" eller "Welcome back" - bruk italic editorial-fragment
- Eksempler hero-tekst: *"Profilen din. Slik den ser ut for spillerne."* / *"Sikkerhet foerst. Alltid."*
- Flat farger paa avatarer (ingen gradient)
- Ingen translateY(-3px) hover paa alt

**CoachHQ sidebar er TO-LAGS:** smal moerk rail (56px, #061210) + lys nav-kolonne (200px, #FAFAF7). Active item i nav: rgba(209,248,67,0.30) bg + #0A1F18 tekst.

**Settings-sub-nav (2. niva, INNE i form-area):** Vertikal liste til venstre i form-area. Active item har 4px venstre-border accent + bg accent/10 + tekst foreground (medium weight).

**Referanse-personer:**
- CoachHQ: Anders Kristiansen (hovedcoach), Sara Larsen (coach), Tom Nilsen (coach)
- Spillere: Markus Roinaas Pedersen, Henrik Nilsen, Anna Karlsen, Mads Roenning, Lise Sandberg, Joachim Tangen

**Read-only-default-moenster:** Felter vises som tekst med "Endre ->"-link. Klikk aapner inline-edit eller modal. ALDRI vis edit-mode som default.

**Save-bar bunn:** Vises kun naar form er dirty. Sticky med `Avbryt` (ghost) | `Lagre endringer` (primary).

**Farezone nederst:** Egen seksjon med border-destructive/30 + bg-destructive/5. Headern "Farlig sone".

## Output per skjerm

For hver av de 5 skjermene, lever:
1. Hovedskjerm i lyst tema (default, read-only)
2. Inline-edit eller hover-state paa kritisk element
3. Empty/loading/error-state hvor relevant
4. Mobil-versjon hvis layout endres dramatisk

## Start naa

Begynn med Pakke 1 (Coach-profil) og fortsett uten avbrudd til alle 5 er ferdige.

Naar du er helt ferdig:
- Samlet oversikt med alle 5 thumbnails
- Liste med design-links jeg kan kopiere til tracker
- Flagg evt. caveats/avvik per skjerm
