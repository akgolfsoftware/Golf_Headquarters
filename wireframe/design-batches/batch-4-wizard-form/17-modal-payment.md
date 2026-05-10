# AK Golf Platform — Modal — PaymentModal (Stripe-elements)

## Identitet

- **Produkt:** Delt (PlayerHQ + CoachHQ) — Stripe-integrasjon
- **Trigger:** Tier-oppgradering (Onboarding pakke 6, Settings-abonnement, fra tier-gating-blokker), booking-betaling (BookingConfirmationModal pakke 18), engangs-tjeneste-kjøp
- **Type:** Multi-step modal med Stripe Elements (3 steg + success)
- **Tier-gating:** Ikke relevant (modal selv styrer tier-oppgradering)
- **HTML-referanse:** `wireframe/screen-deck/shared/modals/payment.html`
- **Audit:** `wireframe/audit/payment.md`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst. Stripe Elements styles overrides for å matche våre tokens (border, font, spacing). Maks 3 lime per modal — Stripe-knapper bruker våre egne tokens, ikke Stripe-blå.

## Spec — hva modalen er for

PaymentModal håndterer all betaling i plattformen — abonnement (Pro/Elite, månedlig/årlig), booking-betaling (timebooking av fasilitet), og engangs-kjøp (Mac O'Grady knowledge base, sportsplan-pakke). 3 steg: oversikt → kort/betaling → bekreftelse. Bruker Stripe Payment Intents for sikkerhet.

## Layout — UNIKT for modal

- **Modal-container:** Sentrert, max-width 560px (smalere — fokus), `rounded-xl` (12px), bakdrop standard
- **Header (sticky, 72px):**
  - Tittel italic: «Bekreft betaling»
  - Sub: steg-progress «Steg {n} av 3»
  - Lukk-X (med confirm hvis Stripe-felt er fyllt)
- **Steg-indikator:** 3 dots

### Steg 1 — Oversikt

- **Item-card:**
  - Bilde/ikon venstre (60×60px)
  - Tittel: "AK Golf Pro — Månedsabonnement"
  - Beskrivelse (2 linjer): "Ubegrenset økter · AI-planer · Coach-meldinger"
- **Pris-tabell:**
  - Rad: "Pro månedlig" — `kr 149,00`
  - Rad: "MVA (25%)" — `kr 37,25`
  - Rad: **"Totalt"** — `kr 186,25` (Geist Bold)
- **Faktureringssyklus-velger:**
  - Toggle "Månedlig" / "Årlig" (årlig viser besparelse: "Spar 20% — kr 1788/år")
- **Rabattkode-link (collapsible):** "Har du en rabattkode? →"
  - Ekspanderer til input-felt + "Bruk →"-knapp
  - Etter brukt: ✓ "Kode 'SOMMER2026' aktivert — −20%"
- Footer: `Avbryt` + `Fortsett til betaling →`

### Steg 2 — Betaling (Stripe Elements)

- **Stripe Payment Element** (auto-renderes med våre tokens):
  - Kort-nummer-felt
  - Utløp + CVC (side om side)
  - Postnummer (auto-vises hvis krevet)
  - Apple Pay / Google Pay-knapp på topp (hvis tilgjengelig på enheten)
- **Lagre-kort-checkbox:** "Lagre dette kortet for fremtidige kjøp" (default ✓)
- **Sikkerhets-fotnote:** Lucide `Lock`-ikon (12px) + "Sikret av Stripe. Vi lagrer aldri kortdata."
- Footer: `← Tilbake` + `Betal kr 186,25 →` (CTA viser eksakt sum, primary, accent)

### Steg 3 — Bekreftelse (etter Stripe-success)

- Stort `CheckCircle`-ikon (accent, 80px)
- Tittel italic: "Betaling bekreftet"
- Subtekst: "AK Golf Pro er aktivert nå. Kvittering sendt til markus@email.no"
- **Sammendrag-card:**
  - "Pro månedlig · kr 186,25 inkl. mva"
  - "Neste fakturering: 9. juni 2026"
  - "Kortet utløper: 12/2027"
- **CTA-er:**
  - `Last ned kvittering (PDF) →` (sekundær)
  - `Til portalen →` (primary, accent — lukker modal)

## Klikkbare elementer

| Element | States |
|---|---|
| Steg-indikator-prikk | static, klikkbar tilbake (steg 2 → 1, ikke 3 → noe) |
| Item-card | static (display) |
| Faktureringssyklus-toggle | default, hover, valgt; årlig viser besparelse-badge |
| "Rabattkode →"-link | collapsed, expanded |
| Rabattkode-input + Bruk-knapp | default, focus, with-text, validating, applied (✓ + grønn), invalid (rød + "Ugyldig kode") |
| `Fortsett til betaling →`-CTA (steg 1) | default, hover, disabled (?), loading (?) → Stripe-init |
| Stripe Payment Element-felt | Stripe-styles overridden — default, focus, valid, invalid (Stripe sin egen feilmelding) |
| Apple Pay / Google Pay-knapp | default, hover, klikk → device-prompt |
| Lagre-kort-checkbox | uvalgt, valgt, focus |
| `Betal kr X →`-CTA (steg 2) | default, hover, active, disabled (Stripe-felt invalid), loading (spinner + "Behandler …"), 3DS-pending (hvis 3D-Secure utløses) |
| `Last ned kvittering`-knapp | default, hover, focus, loading, success (browser-download) |
| `Til portalen →`-CTA | default, hover, klikk → lukker modal + redirect |
| Lukk-X | default, hover, klikk → confirm hvis Stripe-felt har data |

## Empty / loading / error / success-states

- **Steg 1 idle:** Default månedlig, ingen rabattkode
- **Steg 1 rabattkode-validering:** Spinner i input
- **Steg 2 Stripe-init loading:** Skeleton i Payment Element-området
- **Steg 2 Stripe felt-validering:** Real-time fra Stripe (rødt hvis kort-nummer feil format)
- **Steg 2 betaling loading:** Hele footer disabled, CTA spinner "Behandler betaling …"
- **Steg 2 3DS-flow:** Modal viser overlay: "Bekreft i banken din … (åpner i ny fane)"
- **Steg 2 betaling decline:** Inline error: "Kortet ble avvist — [Bytt kort →]" (forblir i steg 2)
- **Steg 2 betaling error annet:** Toast: "Noe gikk galt. Prøv igjen eller kontakt support."
- **Steg 3 success:** Renders kun etter Stripe webhook bekrefter
- **Steg 3 kvittering loading:** Spinner i knapp, "Genererer PDF …"

## Mobile (≤640px)

Full-screen modal. Stripe Payment Element auto-tilpasser seg (større felter for finger-tap). Apple Pay-knapp får full bredde. Footer-knapper stables vertikalt.

## Ønsket output fra Claude Design

1. Steg 1 lyst tema (Pro månedlig, ingen rabattkode)
2. Steg 1 lyst tema, årlig valgt (besparelse-badge synlig)
3. Steg 1 lyst tema, rabattkode aktivert
4. Steg 2 lyst tema, Stripe Payment Element renders default
5. Steg 2 lyst tema, validering-error på kort
6. Steg 2 lyst tema, betaling loading (CTA spinner)
7. Steg 2 lyst tema, kort-decline error
8. Steg 3 lyst tema (success med sammendrag)
9. Mørkt tema (steg 2)
10. Mobil ≤640px (steg 2 med Apple Pay øverst)

## Ikke-mål

- Ikke designe Stripe Dashboard-integrasjon (admin-side)
- Ikke designe abonnement-cancel-flyt (egen pakke i Settings)
- Ikke designe faktura-historikk (egen pakke i Settings)
- Ikke designe refundering (egen back-office-pakke)

## Når du er ferdig

Lim design-link tilbake til Claude Code.
