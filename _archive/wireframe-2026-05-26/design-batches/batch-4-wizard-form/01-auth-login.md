# AK Golf Platform — Auth — Login

## Identitet

- **Produkt:** Auth (delt på tvers av CoachHQ + PlayerHQ + Website)
- **URL:** `/login`
- **Arketype:** D — Wizard / Form (single form)
- **Tier-gating:** Ikke relevant
- **HTML-referanse:** `wireframe/screen-deck/auth/login.html`
- **Audit:** `wireframe/audit/auth-login.md`
- **Tilhørende skjermer:** Signup (pakke 2), Glemt passord (pakke 3), 2FA-setup (pakke 4)

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst. Auth-skjermer er dedikerte (ingen sidebar) — mer rolige enn app-skjermene. Eksakte token-navn — ikke hardkode hex.

## Spec — hva skjermen er for

Login er inngangen for både Markus (PlayerHQ) og Anders (CoachHQ). Samme skjema for begge — backend redirecter til riktig portal etter auth. Bruker e-post + passord, med valgfri SSO og passord-reset-link. 2FA-trinn håndteres som påfølgende skjerm hvis aktivert på kontoen.

## Layout — UNIKT for denne skjermen

- **To-spalter desktop (≥1024px):**
  - Venstre 50%: Brand-panel — italic Instrument Serif 56px tittel "Velkommen tilbake.", undertittel Geist 18px "AK Golf Platform — for spillere og coaches", subtil bakgrunn med `secondary`-token og en stor lime-prikk øverst-høyre (eneste lime-element)
  - Høyre 50%: Form-card, max-width 480px, sentrert vertikalt
- **Mobil + tablet:** Stack — brand-panel kollapser til topp-strip 120px, form fyller resten

### Form-felter (i rekkefølge)

1. **E-post** — type=email, placeholder "din@epost.no", icon `Mail` venstre
2. **Passord** — type=password, "Vis"-toggle (icon `Eye` / `EyeOff`) høyre, "Glemt passord?" link under-høyre
3. **Husk meg** — checkbox + label
4. **Logg inn →** — primary CTA, full-bredde
5. **Skille-linje** "eller" (border + senter-tekst)
6. **SSO-knapper** (3 stk, ghost-variant): "Fortsett med Google", "Fortsett med Microsoft", "Fortsett med Apple"
7. **Footer-link:** "Har du ikke konto? Opprett konto →" (linker til `/signup`)

## Klikkbare elementer

| Element | States |
|---|---|
| E-post-felt | default, focus, with-text, validating, valid (subtil sjekk), invalid (rød ramme + "Ugyldig e-post") |
| Passord-felt | default, focus, with-text, vis/skjul-toggle |
| "Vis"-toggle | default, hover, active (toggle-state) |
| "Glemt passord?"-link | default, hover (underline), focus, klikk → `/forgot-password` |
| Husk meg-checkbox | uvalgt, valgt, focus |
| "Logg inn →"-CTA | default, hover, active, focus, disabled (felt tomme), loading (spinner + "Logger inn …"), success (kort grønn flash før redirect) |
| SSO-knapp | default, hover (subtil bg-shift), focus, loading (per provider) |
| "Opprett konto →"-link | default, hover (underline), focus |

## Empty / loading / error / success-states

- **Idle:** Tomme felter, CTA disabled
- **Validering inline:** E-post valideres on-blur, viser "Ugyldig e-post" hvis feil
- **Submit loading:** CTA viser spinner, hele form disabled, SSO-knapper dimmet
- **Submit error:** Toast øverst i form (rød): "Feil e-post eller passord. Prøv igjen." — felt beholdes
- **2FA påkrevd:** Ingen toast — full redirect til `/login/2fa` (egen skjerm, ikke i denne pakken)
- **Konto låst:** Toast: "Kontoen er midlertidig låst. Prøv igjen om 15 minutter." + link til support
- **SSO-error:** Toast: "Kunne ikke logge inn med Google. Prøv igjen eller bruk e-post."

## Mobile (≤640px)

Brand-panel kollapser til 120px topp-strip med kun "AK Golf" + lime-prikk. Form fyller resten — full-bredde med 24px sidemarg.

## Ønsket output fra Claude Design

1. Lyst tema, idle-state (tomme felter)
2. Lyst tema, focus på e-post-felt
3. Lyst tema, validering-error på e-post ("Ugyldig e-post")
4. Lyst tema, submit-loading (CTA-spinner)
5. Lyst tema, submit-error (toast: "Feil e-post eller passord")
6. Mørkt tema, idle
7. Mobil ≤640px, idle

## Ikke-mål

- Ikke designe 2FA-skjermen (pakke 4)
- Ikke designe Signup (pakke 2)
- Ikke designe Glemt passord (pakke 3)
- Ikke designe SSO-callback-skjerm (kun et redirect-mellomskjerm — egen pakke senere)

## Når du er ferdig

Lim design-link tilbake til Claude Code.
