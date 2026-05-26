# Custom prompt for Mini-batch 6-D - CoachHQ verktoey + 3 modaler (BULK-versjon)

**Kopier ALT under linja inn i claude.ai/design som foerste melding i ny sesjon.**

Foer du sender prompten, last opp disse vedleggene:
1. `wireframe/brain/for-claude-design/branding-style-guide.html` (system-kontekst)
2. `wireframe/brain/for-claude-design/design-system-v2.md` (tekstlig backup)
3. Alle 20 .woff2-filer fra `wireframe/brain/for-claude-design/fonts/`
4. `wireframe/design-batches/batch-6-settings-profile/mini-batches/6-D.md`
5. Alle HTML-filer listet i `6-D-vedlegg.txt`

---

# PROMPT (kopier fra og med denne linja):

Jeg har lastet opp et komplett designsystem og en mini-batch-spec (6-D.md) med 4 CoachHQ-verktoey-skjermer + 3 sentrale modaler som skal designes.

## Hva jeg vil

**Generer alle 7 enheter i ETT loep** - ikke vent paa "neste" mellom hver. Lever dem som 7 paafolgende UI-kits i samme respons.

Rekkefoelge:
1. Pakke 1: CoachHQ Grupper (utvidet med drag-drop + sub-grupper)
2. Pakke 2: CoachHQ E-post-maler (template-editor)
3. Pakke 3: CoachHQ Agent-konfig (5 agenter + sliders)
4. Pakke 4: CoachHQ Teknisk plan (intern roadmap)
5. Pakke 5: Modal AvatarUploadModal (drop-zone + crop)
6. Pakke 6: Modal ChangePasswordModal (live styrke-validering)
7. Pakke 7: Modal CancelSubscriptionModal (3-stegs retention-flow)

For hver enhet:
- Les pakken i 6-D.md
- Bruk tilhoerende HTML-wireframe (vedlegg) som visuell IA-referanse hvor det finnes
- Generer skjermen/modalen som UI-kit med korrekt designsystem
- Gaa rett til neste naar du er ferdig

Etter alle 7: lever en samlet oversikt med alle 7 thumbnails + design-links.

## Felles regler (gjelder ALLE 7 enheter)

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
- Italic editorial-fragment som hero: *"Grupper. Treningen som lever sammen."* / *"Agentene jobber i bakgrunnen. Du tar avgjoerelsene."*
- Modaler trenger IKKE hero-fragment - de har konkret tittel
- Flat farger paa avatarer
- Ingen translateY paa alt

**CoachHQ sidebar (skjerm-pakker 1-4):** TO-LAGS - smal moerk rail (56px) + lys nav-kolonne (200px). Active item: rgba(209,248,67,0.30) bg + #0A1F18 tekst.

**Modal-konvensjoner (pakker 5-7):**
- Centrert, max-bredde 480-560px (specifisert per modal)
- Header: tittel + close-X (hoeyre)
- Body: form eller wizard-steg
- Footer (action-bar): Avbryt (ghost, venstre) | Primary (hoeyre)
- Backdrop: black/40 med blur-sm
- Mobil: bottom-sheet (full bredde, slide-up fra bunn med rounded-t-2xl)

**Referanse-personer:**
- Coaches: Anders Kristiansen (Hovedcoach), Sara Larsen, Tom Nilsen
- Spillere: Markus Roinaas Pedersen, Emma Solberg, Joachim Tangen, Lina Hellesund
- Foreldre: Anne Pedersen, Tor Pedersen
- Klubber: Gamle Fredrikstad GK (GFGK), WANG Toppidrett Fredrikstad, Bossum GK

**Wizard-steg (CancelSubscriptionModal):** Progress-bar oeverst (3 segments), step-tittel under, body, action-bar bunn med "Tilbake" + "Neste/Bekreft".

**Tier-differensiering:**
- Free: Locked-overlay paa avanserte features (blur + Pro-badge)
- Pro: Full tilgang
- Elite: Premium-stil (subtil gold-accent paa stedstoer)

**Lower-is-better metrics** (HCP, smerte, feilrate): SUCCESS-groenn paa nedgang.
**Higher-is-better metrics** (sesjoner, akseptert-rate): Motsatt.

## Output per enhet

For hver av de 7 enhetene, lever:
1. Hovedskjerm/modal i lyst tema (default)
2. Inline-edit eller hover-state paa kritisk element
3. Empty/loading/error/success-state hvor relevant
4. Mobil-versjon (modaler blir bottom-sheets)

## Start naa

Begynn med Pakke 1 (Grupper) og fortsett uten avbrudd til alle 7 er ferdige.

Naar du er helt ferdig:
- Samlet oversikt med alle 7 thumbnails
- Liste med design-links jeg kan kopiere til tracker
- Flagg evt. caveats per enhet (spesielt naar HTML-wireframe ikke finnes for de 3 modalene - bruk din beste tolkning)
