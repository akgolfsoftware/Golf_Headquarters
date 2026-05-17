# AK Golf Web — Cookie-policy

## Identitet

- **Produkt:** Web
- **URL:** `/cookies`
- **Arketype:** Web — legal long-form + cookie-banner-config
- **HTML-referanse:** `wireframe/screen-deck/web/cookies.html`
- **Audit:** `wireframe/audit/web-cookies.md`

## Designsystem

Bruk `branding-style-guide.html` + `design-system-v2.md` + `web/_shared.css`.

## Spec — hva siden er for

Cookie-policy + cookie-preferanse-modul. Maa veere GDPR-paatryket. Lar bruker
endre samtykke etter at de har akseptert eller avvist forste gang.

## Layout — UNIKT

### 1. Subhero (#0A1F18 gradient, 64px)

- Eyebrow: `COOKIES`
- H1: `Hva vi *bruker* og hvorfor.`
- Sub: `Sist oppdatert: 10. mai 2026.`

### 2. Preferanse-modul (lys, 96px, narrow 720px sentrert)

Stort card med toggle per cookie-kategori:

**Strengt nodvendige (alltid pa)**
- Sub: Kreves for at siden fungerer (login-state, Stripe checkout)
- Toggle: disabled, alltid pa
- Liste: session-cookie, csrf-token, stripe-session

**Funksjonelle**
- Sub: Husker preferanser (sprak, theme)
- Toggle: on/off
- Liste: theme-preference, language

**Analyse**
- Sub: Hjelper oss forsta hvordan siden brukes (Plausible, ingen tracking)
- Toggle: on/off
- Liste: _pa_id

**Markedsforing**
- Sub: For maalrettet annonsering (Meta, Google)
- Toggle: on/off (default off)
- Liste: _fbp, _gcl_au, etc.

**Knapp-rad:**
- `Lagre preferanser` (lime primary)
- `Aksepter alle`
- `Avvis alle`

### 3. Long-form policy-tekst (lys, 96px, narrow 720px)

Standard cookie-policy-tekst:
- Hva er cookies
- Hvorfor vi bruker dem
- Hvordan administrere
- Tredjeparts cookies
- Endringer

### 4. Footer

## Klikkbare elementer

| Element | States |
|---|---|
| Toggle (per kategori) | off, on, disabled (strengt nodvendige) |
| Lagre preferanser | default, hover, active, success-toast |
| Aksepter alle | default, hover |
| Avvis alle | default, hover |
| Tabell-utvidelse | collapsed, expanded |

## Empty / loading / error

- **Lagre success:** Toast "Preferanser lagret"
- **Lagre error:** Toast "Noe gikk galt"

## Ønsket output fra Claude Design

1. Full cookies-side i lyst tema, default state (analyse pa, marketing av)
2. Etter "Aksepter alle" klikket — alle toggles pa
3. Mobil <=640px — toggle-card stables, knapp-rad blir vertikal
4. Toast "Preferanser lagret" synlig

## Ikke-mål

- Ikke designe initial cookie-banner (vises pa /index ferste besoek — egen designe)
- Ikke include detaljer per tracking-pixel

## Når du er ferdig

Lim design-link tilbake.
