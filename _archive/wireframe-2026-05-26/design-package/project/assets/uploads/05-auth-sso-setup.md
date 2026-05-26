# AK Golf Platform — Auth — SSO-aktivering for organisasjon

## Identitet

- **Produkt:** Auth (CoachHQ admin-funksjon — krever Org-eier-rolle)
- **URL:** `/sso-setup`
- **Arketype:** D — Wizard / Form (4-step org-wizard)
- **Tier-gating:** Kun Elite-tier (org-konto med ≥5 coaches)
- **HTML-referanse:** `wireframe/screen-deck/auth/sso-setup.html`
- **Audit:** `wireframe/audit/auth-sso-setup.md`
- **Tilhørende skjermer:** Login (pakke 1) — SSO-knapper

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst. Auth-layout, men 4-step wizard tar full bredde (1200px max-width) — ikke to-spalter. Steg-indikator (numbers) øverst.

## Spec — hva skjermen er for

Aktiverer SSO (SAML 2.0 eller OIDC) for en organisasjon — typisk en golfklubb eller akademiet med ≥5 coaches/admins. Wizard guider org-eieren (Anders K.) gjennom IdP-valg, metadata-utveksling, attribute-mapping og test. Prosessen tar 15–30 minutter og krever ofte hjelp fra IT-ansvarlig på den andre siden.

## Layout — UNIKT for denne skjermen

Full-bredde wizard, max-width 1024px sentrert. Topp-strip (72px) med org-logo venstre + "AK Golf — SSO-oppsett" + "Avbryt"-link høyre.

### Steg-indikator (numbers, ikke dots)

`(1) Velg IdP — (2) Metadata — (3) Attribute mapping — (4) Test og aktiver`

Linjer mellom numrene. Aktivt nummer: accent-bakgrunn, hvit tekst. Fullført: primary-bakgrunn med ✓.

### Steg 1 — Velg identity provider

Grid 3×2 med IdP-kort (hver 200×140px):
- Okta · Microsoft Entra ID · Google Workspace · OneLogin · Auth0 · "Annet (SAML 2.0)"

Hvert kort: leverandør-logo + navn + ekspanderbar "Veiledning →" som åpner 3-stegs IT-instruksjoner i side-panel.

### Steg 2 — Metadata-utveksling

To-spalter:
- **Venstre (Send til IdP):** SP metadata
  - ACS URL (copy-on-click): `https://akgolf.no/api/auth/saml/callback`
  - Entity ID: `https://akgolf.no/saml`
  - X.509-sertifikat: "Last ned →"
  - Last ned hele metadata: `Last ned XML →`
- **Høyre (Hent fra IdP):**
  - Tekstfelt for IdP metadata-URL ELLER
  - Drag-drop område for IdP metadata XML (`Cloud Upload` ikon)

### Steg 3 — Attribute mapping

Tabell med 4 rader (våre felter venstre, IdP-attributter høyre):

| Vårt felt | IdP-attributt | Status |
|---|---|---|
| E-post | `mail` | dropdown m/ valg |
| Fornavn | `givenName` | dropdown |
| Etternavn | `surname` | dropdown |
| Coach-rolle (valgfri gruppe) | `memberOf=akgolf-coaches` | dropdown |

Hver rad har "Test mapping →"-knapp som henter eksempel-verdi fra IdP.

### Steg 4 — Test og aktiver

Tre-trinns sjekk-liste (auto-runs):
1. ✓ Metadata utvekslet
2. ⟳ Test-pålogging (bruker prompt for å logge inn med IdP — "Klikk her for å teste →")
3. ⏸ Aktiver for hele org

**Sjekkboks (påkrevd):** "Jeg bekrefter at alle eksisterende brukere har koblede SSO-kontoer ELLER kan logge inn med passord midlertidig"

CTA: `Aktiver SSO for AK Golf →` (full-bredde, accent, krever bekreftelse)

## Klikkbare elementer

| Element | States |
|---|---|
| Steg-nummer-indikator | static, klikkbar tilbake til fullførte steg |
| IdP-kort (steg 1) | default, hover (lift), valgt (accent ring) |
| "Veiledning →"-link | default, hover, klikk → side-panel åpnes |
| Copy-on-click felt (steg 2) | default, hover, klikk-to-copy, "Kopiert ✓"-toast |
| "Last ned XML →"-knapp | default, hover, focus, loading, success-flash |
| Drag-drop område | default, hover, drag-over (accent border), uploaded (filnavn + ✓) |
| Attribute-dropdown | default, open, valgt |
| "Test mapping →"-knapp per rad | default, hover, loading, success (✓ + verdi vises), error (rødt + melding) |
| Test-pålogging-link (steg 4) | default, hover, klikk → ny fane, etter retur: "✓ Test-pålogging vellykket" |
| Sjekkboks | uvalgt, valgt, focus, error |
| `Aktiver SSO →`-CTA | default, hover, disabled, loading ("Aktiverer …"), success (full-screen confirmation) |
| `Avbryt`-link | default, hover, focus, klikk → confirm-popover (alle endringer mistes) |
| `← Tilbake` / `Neste →` | standard wizard-navigasjon |

## Empty / loading / error / success-states

- **Steg 2 metadata-validering loading:** Spinner ved felt + "Validerer metadata …"
- **Steg 2 invalid metadata:** Toast + inline error: "Ugyldig SAML-metadata. Kontroller at filen ikke er endret."
- **Steg 3 mapping-test feiler:** Inline error per rad: "Attributt ikke funnet i IdP-respons"
- **Steg 4 test-pålogging feiler:** Bryter med rød boks: "Test feilet — kontakt support eller IT-ansvarlig" + log-detaljer
- **Submit final loading:** Hele wizard låses, "Aktiverer SSO …" + spinner
- **Submit final success:** Full-screen confirmation: stort `ShieldCheck`-ikon, "SSO er aktivert for AK Golf", undertekst om hva som skjer for eksisterende brukere, CTA `Til admin-panelet →`

## Mobile (≤640px)

SSO-oppsett er utvikler-/IT-orientert — ikke optimalisert for mobil. Vis melding: "SSO-oppsett krever desktop. Åpne på en større skjerm." (Men design wizard for tablet ≥768px).

## Ønsket output fra Claude Design

1. Steg 1 lyst tema (IdP-grid, Okta hover)
2. Steg 2 lyst tema (metadata-utveksling, en URL kopiert)
3. Steg 3 lyst tema (4 mapping-rader, en testet ✓)
4. Steg 4 lyst tema (3-trinns sjekk-liste, test-pålogging klar)
5. Steg 4 final success (ShieldCheck, "SSO aktivert")
6. Steg 2 error-state (invalid metadata)
7. Mørkt tema (steg 1)
8. Tablet ≥768px (steg 3 — kompresjon av tabell)

## Ikke-mål

- Ikke designe IT-veiledningene per IdP (egne PDF-er som lenkes ut)
- Ikke designe disable-SSO-flyten (egen pakke)
- Ikke designe SCIM/auto-provisioning (egen senere fase)
- Ikke optimalisere for mobil (vis blokk-melding)

## Når du er ferdig

Lim design-link tilbake til Claude Code.
