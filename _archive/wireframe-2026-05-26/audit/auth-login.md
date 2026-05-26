# Audit: Auth — Logg inn

**HTML:** `screen-deck/auth/login.html`
**URL:** `/login`
**Antall klikkbare elementer:** 11

## Klikkbare elementer

| Element | Type | Mål | Eksisterer i tracker? |
|---|---|---|---|
| E-post input | State-change | Inline (form-state) | OK |
| Passord input | State-change | Inline (form-state) | OK |
| "Husk meg på denne enheten" checkbox | State-change | Inline | OK |
| "Glemt passord? Reset" link | Skjerm | `/forgot-password` (auth/forgot-password.html) | OK |
| "Logg inn" CTA (primary) | Skjerm | `/admin/hub` (coachhq/hub.html) — i praksis route per rolle | OK |
| BankID-knapp (SSO) | Eksternt | bankid.no/oidc | (eksternt) |
| Google-SSO-knapp | Eksternt | accounts.google.com/oauth | (eksternt) |
| Apple-SSO-knapp | Eksternt | appleid.apple.com/auth | (eksternt) |
| "Registrer deg" link | Skjerm | `/signup` (auth/signup.html) | OK |
| "Trenger hjelp?" footer-link | Skjerm | `/portal/meg/help` eller `/help` | WIREFRAME_NEEDED |
| "Personvern" footer-link | Skjerm | `/personvern` (web/personvern.html) | WIREFRAME_NEEDED |
| "Vilkår" footer-link | Skjerm | `/vilkar` (web/vilkar.html) | WIREFRAME_NEEDED |

> Merk: 12 elementer totalt om man inkluderer både input-felt og separate footer-lenker. Mangler i nåværende wireframe: vis/skjul passord-toggle (anbefales lagt til i design).

## States som må designes

- Form-validering: feil per felt (e-post-format, tom verdi, feil passord)
- Submit-state: idle / loading (knapp = "Logger inn…") / success (redirect) / error (toast eller inline)
- Disabled-state for "Logg inn" mens felter er tomme eller validering pågår
- Rate-limit etter X mislykkede forsøk (lenker til error-states/rate-limit)
- SSO-redirect-state: spinner mens vi venter på callback fra IdP
- "Husk meg" på/av (checkbox states)
- Vis/skjul passord (mangler — bør legges til som ikon i passord-felt)
- Empty/prefilled (auto-fill fra browser, social autofill)
