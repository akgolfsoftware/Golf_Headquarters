# AK Golf Platform — Auth — Glemt passord

## Identitet

- **Produkt:** Auth (delt)
- **URL:** `/forgot-password` (steg 1) → `/reset-password?token=…` (steg 2)
- **Arketype:** D — Wizard / Form (2-step, men på to forskjellige URLer)
- **Tier-gating:** Ikke relevant
- **HTML-referanse:** `wireframe/screen-deck/auth/forgot-password.html`
- **Audit:** `wireframe/audit/auth-forgot-password.md`
- **Tilhørende skjermer:** Login (pakke 1)

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst. Samme to-spalters auth-layout som Login og Signup.

## Spec — hva skjermen er for

To-stegs flyt for å nullstille glemt passord:
- **Steg 1:** Bruker oppgir e-post → får magic-link på e-post
- **Mellomtilstand:** "Sjekk e-posten din" — bekreftelse på samme URL
- **Steg 2:** Bruker klikker link i e-post → lander på `/reset-password?token=…` → setter nytt passord → redirect til Login

## Layout — UNIKT for denne skjermen

To-spalters layout som Login. Venstre tittel italic Instrument Serif: "Glemt passord? Det skjer." — beroligende tone. Subtittel: "Vi sender deg en link som lar deg sette nytt passord."

### Steg 1 — Be om link

Form-card, max-width 480px:

1. **Tilbake-link** øverst-venstre: "← Tilbake til innlogging" (linker til `/login`)
2. **E-post-felt** — type=email, placeholder "din@epost.no"
3. **Send link →** — primary CTA, full-bredde
4. **Hjelpe-tekst under CTA:** "Mottar du ikke e-post? Sjekk spam, eller [kontakt support](mailto:hjelp@akgolf.no)"

### Mellomtilstand — "Sjekk e-posten din"

Erstatter form-card med sentrert melding:
- Stort `MailCheck`-ikon (Lucide, 64px, accent)
- Tittel: "Sjekk e-posten din"
- Tekst: "Vi har sendt en link til **din@epost.no**. Klikk linken for å sette nytt passord."
- "Send på nytt"-link (disabled i 60 sek med countdown: "Send på nytt om 47s")
- "Bruk en annen e-post →"-link

### Steg 2 — Sett nytt passord (på `/reset-password?token=…`)

Egen URL men samme layout. Form-felter:

1. **Nytt passord** — type=password, vis-toggle, styrke-indikator (samme som Signup)
2. **Bekreft nytt passord** — match-validering
3. **Lagre nytt passord →** — primary CTA
4. **Footer-tekst:** "Etter lagring blir du logget inn automatisk."

## Klikkbare elementer

| Element | States |
|---|---|
| Tilbake-link | default, hover (underline), focus |
| E-post-felt (steg 1) | default, focus, with-text, validating, valid, invalid |
| "Send link →"-CTA | default, hover, active, disabled (felt tomt), loading ("Sender …") |
| "Send på nytt"-link (mellomstilstand) | disabled m/ countdown, enabled m/ hover |
| "Bruk en annen e-post →"-link | default, hover, focus, klikk → tilbake til steg 1-form |
| Passord-felt (steg 2) | default, focus, vis/skjul, styrke-indikator |
| "Lagre nytt passord →"-CTA | default, hover, disabled (mismatch eller svakt), loading ("Lagrer …"), success (kort accent-flash før redirect) |

## Empty / loading / error / success-states

- **Steg 1 idle:** Tomt felt, CTA disabled
- **Steg 1 loading:** CTA spinner, "Sender link …"
- **Steg 1 success:** Bytter til mellomtilstand "Sjekk e-posten din"
- **Steg 1 error:** Toast: "Kunne ikke sende link. Prøv igjen." — eller silent success hvis e-post ikke finnes (av sikkerhetsgrunner — alltid vis bekreftelse)
- **Mellomtilstand:** Statisk, ingen loading
- **Steg 2 token-invalid:** Erstatt form med error-card: "Linken er utløpt eller ugyldig. [Be om ny link →]"
- **Steg 2 token-valid:** Vis form
- **Steg 2 success:** Accent-flash + "Logger deg inn …" + redirect til riktig portal

## Mobile (≤640px)

Stack: brand-strip 120px topp, form fyller resten. Mellomtilstand-ikon krymper til 48px.

## Ønsket output fra Claude Design

1. Steg 1 lyst tema, idle
2. Steg 1 lyst tema, loading (sender link)
3. Mellomtilstand lyst tema (Sjekk e-posten din, countdown 47s)
4. Steg 2 lyst tema, idle (nytt passord-felter)
5. Steg 2 lyst tema, validering (mismatch)
6. Steg 2 token-invalid (error-card)
7. Mørkt tema, mellomtilstand
8. Mobil ≤640px, steg 1

## Ikke-mål

- Ikke designe Login (pakke 1)
- Ikke designe e-post-templaten som sendes (egen design-batch for transactional e-post)
- Ikke designe innlogget redirect-skjerm

## Når du er ferdig

Lim design-link tilbake til Claude Code.
