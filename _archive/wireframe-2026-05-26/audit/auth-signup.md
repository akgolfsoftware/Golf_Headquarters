# Audit: Auth — Registrer deg

**HTML:** `screen-deck/auth/signup.html`
**URL:** `/signup`
**Antall klikkbare elementer:** 16

## Klikkbare elementer

| Element | Type | Mål | Eksisterer i tracker? |
|---|---|---|---|
| Tier-card "Gratis" | State-change | Inline (velg tier) | OK |
| Tier-card "Pro" (default active) | State-change | Inline (velg tier) | OK |
| Tier-card "Elite" | State-change | Inline (velg tier) | OK |
| Fornavn input | State-change | Inline | OK |
| Etternavn input | State-change | Inline | OK |
| E-post input | State-change | Inline | OK |
| Passord input | State-change | Inline | OK |
| Bekreft passord input | State-change | Inline | OK |
| Rolle-opt "Spiller" (active) | State-change | Inline | OK |
| Rolle-opt "Coach" | State-change | Inline | OK |
| Rolle-opt "Foresatt" | State-change | Inline | OK |
| "vilkårene" inline link | Modal eller skjerm | `/vilkar` (web/vilkar.html) | WIREFRAME_NEEDED |
| "personvernreglene" inline link | Modal eller skjerm | `/personvern` (web/personvern.html) | WIREFRAME_NEEDED |
| Godta-vilkår checkbox | State-change | Inline (gating av submit) | OK |
| "Registrer deg" CTA | Skjerm | `/onboarding` (auth/onboarding.html) | OK |
| "Logg inn" link i footer | Skjerm | `/login` (auth/login.html) | OK |
| "Trenger hjelp?" footer-link | Skjerm | `/help` | WIREFRAME_NEEDED |
| "Personvern" footer-link | Skjerm | `/personvern` | WIREFRAME_NEEDED |
| "Vilkår" footer-link | Skjerm | `/vilkar` | WIREFRAME_NEEDED |

> Mangler: passord-toggle (vis/skjul), passord-styrke-indikator, SSO-knapper for "registrer med Google/Apple/BankID" (er på login men ikke signup — bør være konsistent).

## States som må designes

- Tier-valg: hover, active, disabled (om tier er utsolgt eller låst)
- Form-validering per felt: e-post duplikat, passord-styrke (svak/middels/sterk), passord-match
- Rolle-toggle states: idle/active/disabled (foresatt = krever ekstra steg for ParentRelation)
- Submit: idle / loading / success (redirect til onboarding) / error (e-post finnes / nettverk)
- Disabled CTA: før alle obligatoriske felter er fylt og vilkår godtatt
- Tier "Elite" potensielt locked-state (krever invitasjon eller verifisering)
- Empty-state: ingen felter utfylt → CTA disabled
