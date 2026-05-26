# AK Golf Platform — Booking — LoginPopupModal

## Identitet

- **Produkt:** Booking (modal)
- **Åpnes fra:** Top-nav "Min side →" eller 13-kunde-ny ("Logg inn →")
- **Arketype:** Modal — auth
- **Tier-gating:** Ingen (det er auth-modalen)
- **HTML-referanse:** `wireframe/screen-deck/booking/modals/login-popup.html`
- **Audit:** `wireframe/audit/booking-modal-login-popup.md`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva modalen er for

Lett login-modal. Tre måter å logge inn på: (1) Magic link via e-post (default, passordløs), (2) Google OAuth, (3) Vipps Login. Etter sendt magic link: "Sjekk e-posten din"-state. Modal kan lukkes uten å logge inn — bruker fortsetter som anonym.

## Layout — UNIKT for denne modalen

- **Modal-overlay:** rgba(10,31,23,0.6) backdrop
- **Modal-card:** Max 440px, padding 32px
- **Header:**
  - AK Golf-logo (kompakt, 32×32px)
  - H2 "Logg *inn*" (italic på "inn")
  - Sub: "Vi sender en lenke til e-posten din."
  - Lukk-X
- **E-post-felt:** Stor input + "Send lenke →" CTA (primary, full bredde)
- **Skille-linje:** "eller"
- **OAuth-knapper-grid (2-kolonne):**
  - "Google" (med Google-G-logo)
  - "Vipps" (Vipps-orange `#FF5B24`)
- **Footer:** "Har du ikke konto? Den opprettes automatisk når du fortsetter →"
- **Personvern:** "Vi sporer kun det som er nødvendig. Les vår personvernerklæring →"

### State 2 — Magic link sendt

- Lucide Mail 64px i primary-tint
- H2 "Sjekk *e-posten din*"
- Sub: "Vi sendte en lenke til markus.ronning@gmail.com. Klikk for å logge inn."
- Mono caps: "LENKEN VARER I 15 MIN"
- "Send på nytt" link (disabled i 60 sek)
- "Bytt e-post" ghost-knapp

## Klikkbare elementer

| Element | States |
|---|---|
| E-post-felt | default, focus, filled, error (ugyldig format) |
| "Send lenke →" | default, hover, active, loading, disabled (tomt) |
| Google-knapp | default, hover, loading (redirect), error |
| Vipps-knapp | default, hover, loading |
| "Send på nytt" | disabled (60s), default, hover |
| Lukk-X | default, hover |

## Empty / loading / error

- **Loading:** "Send lenke →" spinner + "Sender..."
- **Error (e-post ikke funnet):** "Vi sender lenke uansett — den oppretter konto hvis den ikke finnes" (info, ikke error)
- **OAuth-error:** Inline "Google-login mislyktes. Prøv e-post i stedet."

## Ønsket output fra Claude Design

1. Default state (tre login-metoder)
2. State 2 — magic link sendt
3. Loading state
4. Error på e-post-felt
5. Mørkt tema
6. Mobil ≤640px — modal full bredde

## Ikke-mål

- Ikke designe sign-up flow utenfor booking
- Ikke implementer ekte Supabase Auth
- Ikke designe glemt-passord (vi bruker magic link)

## Når du er ferdig

Lim design-link tilbake til Claude Code.
