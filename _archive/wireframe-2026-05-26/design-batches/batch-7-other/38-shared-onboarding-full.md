# AK Golf Platform — Shared — Onboarding-flyt (full)

## Identitet

- **Produkt:** Shared / cross-cutting (PlayerHQ + CoachHQ)
- **URL:** `/onboarding` (start), `/onboarding/[step]`
- **Arketype:** G — Other (multi-step wizard, full visning)
- **Tier-gating:** Ikke relevant
- **HTML-referanse:** `wireframe/screen-deck/shared/cross-cutting/onboarding-full.html`
- **Audit:** finnes ikke ennå
- **Tilhørende modaler:** `SkipOnboardingConfirm`, `OnboardingSuccessModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Full onboarding-flyt etter første innlogging. PlayerHQ har 5 steg (velkommen, profil, golfdata, mål, koble GolfBox). CoachHQ har 4 steg (velkommen, fasiliteter, prising, første spiller). Hvert steg er en egen "skjerm" med samme wizard-shell. Forskjellig fra batch-1-onboarding-card (hint på dashboard) — dette er den faktiske flyten.

## Layout — UNIKT for denne skjermen

### Wizard-shell (felles)

- **Full-screen layout** (ingen sidebar, ingen topbar)
- **Center-column 480px bred**
- **Logo** øverst-midt
- **Progress-stepper** under (5 sirkler for PlayerHQ, 4 for CoachHQ)
- **Step-tittel** italic Instrument Serif 36px
- **Step-content** (form / valg / info)
- **Footer-knapper:** `Tilbake` (ghost) | `Hopp over` (ghost, valgfritt) | `Neste →` (primary)

### PlayerHQ 5-stegs

1. **Velkommen** — italic *"Velkommen, Markus."* + 2-linje intro + "Kom i gang →"
2. **Profil** — Avatar-upload + navn + e-post (pre-fylt) + telefon
3. **Golfdata** — HCP-input (med "Vet ikke — ta test →"-link), hjemmebane-velger, primær-kategori (junior/voksen/elite)
4. **Mål** — multi-select "Hva vil du oppnå?" (sjekkbokser med emoji-ikoner uten emoji): Forbedre HCP / Mer struktur / Konkurrere / Ha det gøy / Andre
5. **Koble GolfBox** — OAuth-knapp "Koble GolfBox →" eller "Hopp over (kan kobles senere)"

Etter steg 5: `OnboardingSuccessModal` med konfetti-animasjon + "Velkommen til AK Golf →" som tar deg til `/hjem`.

### CoachHQ 4-stegs

1. **Velkommen** — italic *"Velkommen til CoachHQ, Anders."* + 2-linje intro
2. **Fasiliteter** — Velg lokasjoner du jobber på (multi-select: Mulligan, GFGK, Bossum, WANG, Annen)
3. **Prising** — Standard time-rate + studio-rate + valuta
4. **Første spiller** — Inviter første spiller (e-post-input) eller "Hopp over"

Etter steg 4: `OnboardingSuccessModal` med direkte til `/admin/hub`.

## Klikkbare elementer

| Element | States |
|---|---|
| Progress-stepper-sirkel | active (lime), completed (checkmark), pending (muted) |
| Tilbake | default, hover, disabled (steg 1) |
| Hopp over | default, hover, klikk → `SkipOnboardingConfirm` |
| Neste → | default, hover, disabled (form ikke gyldig), loading, success |
| GolfBox OAuth | default, hover, loading, success (toast) |

## Empty / loading / error

- **Form-error per felt:** Inline rød tekst
- **OAuth-error:** Banner "Kunne ikke koble. Prøv igjen eller hopp over →"
- **Save-error på server:** Inline rød + retry

## Ønsket output fra Claude Design

1. Lyst tema, PlayerHQ steg 1 (Velkommen)
2. Lyst tema, PlayerHQ steg 3 (Golfdata) med HCP-input
3. Lyst tema, PlayerHQ steg 5 (Koble GolfBox)
4. CoachHQ steg 2 (Fasiliteter)
5. OnboardingSuccessModal med konfetti
6. Mobil ≤640px — alle steg full bredde, footer-knapper sticky bunn

## Ikke-mål

- Ikke designe `SkipOnboardingConfirm`, `OnboardingSuccessModal` (egen batch)
- Ikke designe GolfBox-OAuth-redirect-side (det skjer eksternt)
- Ikke implementere konfetti-animasjon (devs)

## Når du er ferdig

Lim design-link tilbake til Claude Code.
