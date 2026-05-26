# Custom prompt for Mini-batch 4-A - Auth + Onboarding (BULK-versjon)

**Kopier ALT under linja inn i claude.ai/design som foerste melding i ny sesjon.**

Foer du sender prompten, last opp disse vedleggene:
1. `wireframe/brain/for-claude-design/branding-style-guide.html` (system-kontekst)
2. `wireframe/brain/for-claude-design/design-system-v2.md` (tekstlig backup)
3. Alle 20 .woff2-filer fra `wireframe/brain/for-claude-design/fonts/`
4. `wireframe/design-batches/batch-4-wizard-form/mini-batches/4-A.md` (mini-batch-spec)
5. Alle 6 HTML-filer listet i `4-A-vedlegg.txt`

---

# PROMPT (kopier fra og med denne linja):

Jeg har lastet opp et komplett designsystem og en mini-batch-spec (4-A.md) med 6 Auth + Onboarding-skjermer som skal designes som arketype-D (Wizard / Form).

## Hva jeg vil

**Generer alle 6 skjermer i ETT loep** -- ikke vent paa "neste" mellom hver. Lever dem som 6 paafolgende UI-kits i samme respons.

Rekkefoelge:
1. Pakke 1: Login (single form)
2. Pakke 2: Signup (single form med inline-validering)
3. Pakke 3: Glemt passord (2-step paa to URLer)
4. Pakke 4: 2FA-aktivering (3-step wizard med QR-kode + backup-koder)
5. Pakke 5: SSO-aktivering for organisasjon (4-step org-wizard, kun Elite)
6. Pakke 6: Onboarding (4-step welcome-flyt)

For hver skjerm:
- Les pakken i 4-A.md
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
- Eksempler: *"Velkommen tilbake."* / *"Sett opp 2FA. Det tar 90 sekunder."* / *"Hei, Markus."*
- Flat farger paa avatarer (ingen gradient)
- Ingen translateY(-3px) hover paa alt

**Auth-modus:** Alle 6 skjermer er auth-flow -- INGEN sidebar. Brand-panel venstre + form-card hoeyre (to-spalter desktop, stack paa mobil). Unntak: Onboarding (pakke 6) er full-skjerm wizard uten sidebar, og SSO-setup (pakke 5) er full-bredde wizard.

**Arketype-D regler (KRITISK):**
- Multi-step: dots eller numbers oeverst -- ALDRI lineaer progressbar
- Aktiv steg: accent-prikk. Fullfoert: primary. Ufullfoert: muted
- Steg-prikker er klikkbare TILBAKE til fullfoerte steg, ikke fremover
- "Avbryt"-knapp alltid synlig (sekundaer, venstre i footer)
- "Tilbake"-knapp disabled paa steg 1
- Primary CTA lengst til hoeyre, bytter tekst per steg ("Neste ->", "Send forslag ->", "Opprett konto", "Lagre")
- Inline validering per felt: real-time for e-post/passord/kort, on-blur for navn/dropdowns
- Submit-states: idle, validating, submitting (CTA spinner), success (confetti/checkmark), error (toast)

**Referanse-personer:**
- Spiller: Markus Roinaas Pedersen (PlayerHQ-eksempel paa onboarding)
- Coach: Anders Kristiansen (CoachHQ-eksempel paa SSO-setup)

## Output per skjerm

For hver av de 6 skjermene, lever skjermbildene som listet under "OEnsket output" i pakken (typisk 7-9 visninger per pakke):
- Hovedstand i lyst tema
- Validering-error
- Submit-loading
- Submit-success
- Moerkt tema-variant
- Mobil <=640px

## Start naa

Begynn med Pakke 1 (Login) og fortsett uten avbrudd til alle 6 er ferdige.

Naar du er helt ferdig:
- Samlet oversikt med alle 6 thumbnails
- Liste med design-links jeg kan kopiere til tracker
- Flagg evt. caveats/avvik per skjerm
