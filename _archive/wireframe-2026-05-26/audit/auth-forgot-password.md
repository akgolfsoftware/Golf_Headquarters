# Audit: Auth — Glemt passord

**HTML:** `screen-deck/auth/forgot-password.html`
**URL:** `/forgot-password`
**Antall klikkbare elementer:** 8 (begge steg vises samtidig som demo-stack)

## Klikkbare elementer

### Steg 1 — Skriv inn e-post

| Element | Type | Mål | Eksisterer i tracker? |
|---|---|---|---|
| E-post input | State-change | Inline | OK |
| "Send reset-link" CTA | State-change → success-card | Inline (samme skjerm, viser steg 2) | OK |
| "← Tilbake til logg inn" link | Skjerm | `/login` | OK |

### Steg 2 — Suksess

| Element | Type | Mål | Eksisterer i tracker? |
|---|---|---|---|
| "Send link på nytt" knapp | State-change | Inline (re-trigger send) | OK |
| "← Tilbake til logg inn" link | Skjerm | `/login` | OK |

### Footer

| Element | Type | Mål | Eksisterer i tracker? |
|---|---|---|---|
| "Trenger hjelp?" | Skjerm | `/help` | WIREFRAME_NEEDED |
| "Personvern" | Skjerm | `/personvern` | WIREFRAME_NEEDED |
| "Vilkår" | Skjerm | `/vilkar` | WIREFRAME_NEEDED |

> Implisitt skjerm 3: når brukeren klikker reset-linken i e-posten lander de på `/reset-password?token=...` — denne er ikke wireframed ennå (bør tilføyes som egen skjerm i Auth-listen).

## States som må designes

- E-post-validering: tomt felt, ugyldig format, ukjent e-post (vi viser samme suksess uansett av sikkerhetshensyn)
- Submit-state: idle / loading / success-card vist
- "Send på nytt" rate-limit (60s cooldown — disabled med countdown)
- Reset-link utløpt (linker til error-state — ny skjerm trengs)
- Reset-link allerede brukt (ny skjerm)
- Mangler: ny skjerm `/reset-password` (sett nytt passord-form med token)
