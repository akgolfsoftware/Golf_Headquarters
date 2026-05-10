# Audit: Auth — Onboarding (steg 2 av 4)

**HTML:** `screen-deck/auth/onboarding.html`
**URL:** `/onboarding`
**Antall klikkbare elementer:** 13

## Klikkbare elementer

| Element | Type | Mål | Eksisterer i tracker? |
|---|---|---|---|
| HCP number-input | State-change | Inline | OK |
| Opt-card "Ukentlig" (active) | State-change | Inline (velg frekvens) | OK |
| Opt-card "Månedlig" | State-change | Inline | OK |
| Opt-card "Sjeldnere" | State-change | Inline | OK |
| Opt-card "Senke HCP" (active) | State-change | Inline (velg mål) | OK |
| Opt-card "Konkurrere" | State-change | Inline | OK |
| Opt-card "Mosjon" | State-change | Inline | OK |
| Hjemmeanlegg-select (5 alternativer) | State-change | Inline (dropdown) | OK |
| "← Forrige" knapp | Skjerm | `/onboarding?step=1` (ikke wireframed) | WIREFRAME_NEEDED |
| "Ferdig →" CTA (primary) | Skjerm | `/portal/hjem` (playerhq/hjem.html) | OK |
| "Hopp over onboarding" link | Skjerm | `/portal/hjem` | OK |
| "Trenger hjelp?" footer | Skjerm | `/help` | WIREFRAME_NEEDED |
| "Personvern" footer | Skjerm | `/personvern` | WIREFRAME_NEEDED |
| "Vilkår" footer | Skjerm | `/vilkar` | WIREFRAME_NEEDED |

> Steg-bar viser 4 steg, men kun steg 2 er wireframed. Ifølge tracker er full onboarding listet under cross-cutting (`shared/cross-cutting/onboarding-full.html` — WIREFRAME_NEEDED). Stegene må defineres: 1 = velkomst/intro?, 2 = "Om deg" (denne), 3 = ?, 4 = ?

## States som må designes

- Steg-bar: 4 steg med done/current/upcoming
- Opt-card: idle / hover / active / disabled
- HCP-validering: tall mellom -5 og 54 (jf. error-states inline)
- Submit "Ferdig" på siste steg: idle / loading / success → redirect
- "Forrige" på første steg: disabled eller skjult
- Skip-flow: bekreftelses-modal? Eller direkte redirect?
- Coach- og Foresatt-rolle: må ha andre onboarding-spørsmål (denne er Spiller-orientert)
- Mangler steg 1, 3, 4 — må wireframes som del av onboarding-full
