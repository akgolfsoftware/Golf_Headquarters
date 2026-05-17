# AK Golf Platform — Auth — Signup

## Identitet

- **Produkt:** Auth (delt — Signup leder til onboarding-wizard pakke 6)
- **URL:** `/signup`
- **Arketype:** D — Wizard / Form (single form med inline-validering)
- **Tier-gating:** Free er default. Pro/Elite kjøpes etter onboarding.
- **HTML-referanse:** `wireframe/screen-deck/auth/signup.html`
- **Audit:** `wireframe/audit/auth-signup.md`
- **Tilhørende skjermer:** Login (pakke 1), Onboarding (pakke 6)

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst. Samme to-spalters layout som Login (pakke 1) for kontinuitet. Maks 3 lime per skjerm.

## Spec — hva skjermen er for

Signup oppretter ny bruker (spiller eller coach). Skjermen er kort med vilje — kun det som trengs for å lage konto. Resten (rolle, klubb, foreldre-relasjon, profilbilde) ligger i onboarding-wizard pakke 6, som starter automatisk etter Signup. Markus' foreldre vil typisk opprette konto her og koble Markus inn via foreldre-relasjon i onboarding.

## Layout — UNIKT for denne skjermen

- **To-spalter desktop (≥1024px):** Samme struktur som Login. Venstre tittel: italic Instrument Serif "Bli en del av AK Golf." Subtittel: "5 minutter. Du er i gang i kveld."
- **Form-card høyre, max-width 480px**

### Form-felter (i rekkefølge)

1. **Fornavn + Etternavn** (to felter side om side, gap-4)
2. **E-post** — type=email, real-time validering på format + tilgjengelighet ("Allerede tatt" hvis registrert)
3. **Passord** — type=password, "Vis"-toggle, **passord-styrke-indikator** under (4 segmenter: svak / ok / god / sterk — fyller med accent når sterk)
4. **Bekreft passord** — viser ✓ ikon når matcher
5. **Rolle (radio):** "Spiller" / "Coach" — to store kort med ikon (`User` / `Whistle`), default "Spiller"
6. **Sjekkboks:** "Jeg godtar [Vilkår](/terms) og [Personvernerklæring](/privacy)" — påkrevd
7. **Sjekkboks:** "Send meg nyhetsbrev (valgfritt)" — default av
8. **Opprett konto →** — primary CTA, full-bredde
9. **Footer-link:** "Har du allerede konto? Logg inn →"

## Klikkbare elementer

| Element | States |
|---|---|
| Fornavn/Etternavn-felt | default, focus, with-text, on-blur valid |
| E-post-felt | default, focus, validating (spinner i felt), valid (✓-ikon), invalid format ("Ugyldig e-post"), allerede tatt ("Bruker finnes — Logg inn?") |
| Passord-felt | default, focus, vis/skjul, styrke-indikator updates real-time |
| Passord-styrke-indikator | tom (4 grå), 1/4 (rød), 2/4 (amber), 3/4 (primary), 4/4 (accent) |
| Bekreft passord-felt | default, focus, mismatch ("Passord matcher ikke"), match (✓) |
| Rolle-radio | uvalgt, hover, valgt (accent ring) |
| Vilkår-checkbox | uvalgt, valgt, focus, error (rødt om ikke krysset ved submit) |
| "Opprett konto →"-CTA | default, hover, active, focus, disabled (validering feil), loading ("Oppretter konto …") |
| "Logg inn →"-link | default, hover, focus |

## Empty / loading / error / success-states

- **Idle:** Alle felter tomme, CTA disabled
- **Real-time validering:** E-post sjekker tilgjengelighet etter 500ms debounce
- **Submit loading:** CTA spinner + "Oppretter konto …", form disabled
- **Submit success:** Kort accent-flash, deretter redirect til `/onboarding` (pakke 6)
- **Submit error:** Toast: "Kunne ikke opprette konto. Prøv igjen." — felt beholdes
- **Server-side e-post-konflikt:** Inline error på e-post-felt: "Bruker finnes — [Logg inn?]"

## Mobile (≤640px)

Stack: brand-strip 120px topp, form fyller resten. Fornavn/Etternavn stables vertikalt. Rolle-kort fortsatt side om side (50/50).

## Ønsket output fra Claude Design

1. Lyst tema, idle (alle felter tomme, CTA disabled)
2. Lyst tema, mid-typing — passord-styrke 3/4, e-post valid (✓)
3. Lyst tema, validering-error — passord-mismatch + vilkår ikke krysset
4. Lyst tema, submit-loading
5. Lyst tema, e-post-konflikt ("Bruker finnes — Logg inn?")
6. Mørkt tema, idle
7. Mobil ≤640px, mid-typing

## Ikke-mål

- Ikke designe Onboarding (pakke 6) som starter automatisk etter Signup
- Ikke designe Login (pakke 1)
- Ikke designe e-post-bekreftelse (egen mini-flyt — "Sjekk e-posten din"-skjerm)
- Ikke designe foreldre-flyt for mindreårige (egen pakke senere)

## Når du er ferdig

Lim design-link tilbake til Claude Code.
