# AK Golf Platform — Booking — Kunde (ny, registrering)

## Identitet

- **Produkt:** Booking
- **URL:** `/info`
- **Arketype:** G — Wizard / steg 3 av 5 (info-ny)
- **Tier-gating:** Ingen
- **HTML-referanse:** `wireframe/screen-deck/booking/kunde-ny.html`
- **Audit:** `wireframe/audit/booking-kunde-ny.md`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Anonyme kunder lander her i steg 3. Skjema med 5 felt + 3 samtykker. Etter "Fortsett →" oppretter vi konto i Supabase med magic-link (uten passord). Logg inn-knapp øverst hvis kunden glemte at de hadde konto.

## Layout — UNIKT for denne skjermen

Bruker arketype-G-felles-spec. Progress-stripe: "3. Info" (primary).

- **Hero:** Mono "STEG 3 AV 5" + H1 "Din *info*"
- **"Har du konto?"-bånd over skjema:** "Allerede kunde? Logg inn →" (åpner 28-modal-login-popup)
- **Skjema-card:** Max-width 500px, 5 felt:
  - Fornavn (krav)
  - Etternavn (krav)
  - E-post (krav, valider format)
  - Telefon (krav, format `XXX XX XXX`)
  - Postnummer (valgfritt — for distanse-beregning)
- **Samtykker:** Samme 3 som 12 (men ingen er pre-haket)
- **Footer-actions:** "← Tilbake" + "Fortsett →" (primary, disabled til alle krav er fylt)

## Felt-spec

| Felt | Type | Validering | Placeholder |
|---|---|---|---|
| Fornavn | tekst | min 1 tegn | "Markus" |
| Etternavn | tekst | min 1 tegn | "Rønning" |
| E-post | email | regex + DNS-sjekk async | "navn@domene.no" |
| Telefon | tel | 8 sifre, norsk | "90 12 34 56" |
| Postnummer | tekst | 4 sifre, valgfritt | "1617" |

## Klikkbare elementer

| Element | States |
|---|---|
| Input-felt | default, focus (accent ring), filled, error (destructive border + ikon + tekst), success (success-prikk) |
| Checkbox samtykke | uhaket, haket, disabled |
| "Logg inn →" | klikk → 28-modal-login-popup |
| "Fortsett →" | disabled (krav uoppfylt), default, hover, loading (oppretter konto) |

## Empty / loading / error

- **Loading:** "Fortsett →" knapp viser spinner + "Oppretter konto..."
- **Error (e-post finnes):** Inline error "Denne e-posten har konto. Logg inn →"
- **Error (validering):** Per-felt destructive border + tekst under

## Ønsket output fra Claude Design

1. Lyst tema, tomt skjema (default)
2. Lyst tema, fyllt + ett felt med error (telefon "abc" → "Ugyldig nummer")
3. Mørkt tema
4. Loading-state (oppretter konto)
5. Mobil ≤640px — full bredde, "Fortsett →" sticky-bunn

## Ikke-mål

- Ikke designe spiller-info (pakke 14)
- Ikke designe modal-login (pakke 28)
- Ikke designe full sign-up-flow utenfor booking

## Når du er ferdig

Lim design-link tilbake til Claude Code.
