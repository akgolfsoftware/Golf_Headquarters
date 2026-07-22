# Gjenstående skjermer (oppdatert 2026-07-23)

## Ferdig i app-produktene

| Produkt | Status | Tema |
|---|---|---|
| **PlayerHQ** | 0 GAP | Alltid lys |
| **AgencyOS** | 0 GAP ruter + B-pass lister + dype skjemaer | Mørk default, lys valgfri |
| **Forelder** (11) | V2 + **B-pass** (status, CTA, tom) | Lys |
| **Auth kjerne** | Login, signup, glemt/reset, check-email, BankID, logget-ut, samtykke, guardian | Lys |
| **Auth checkout-resume** | V2/B | Lys |
| **Offline** | V2/B | — |
| **Onboard coach/klubb** | VeiviserFlate + v2-CSS | — |
| **Inviter forelder** | V2/B (status + CTA ved feil) | Lys |

Typecheck: grønn. Tema-fasit: `docs/design-system/TEMA-LYS-MORK.md`.

---

## Gjenstår (utenfor / lav prioritet)

### Egen merkevaresite (ikke PlayerHQ/AgencyOS)
- **Marketing** (~50): forside, priser, coaching, blogg, kontakt, om oss …
- **Offentlig stats** (~40): PGA, baner, spillere, verktøy, leaderboards …

### Intern / team (egen stil, ikke spillerapp)
- **Intern komponent-lab**
- **Team WANG / GFGK junior** (~10)
- **/meg** (intern Meg-assistent for ADMIN)
- **Kommando** — mest redirect til AgencyOS allerede

### Valgfri finpuss
- Auth onboarding-wizard steg-for-steg (chrome er V2; wizard-innhold kan finpusses)
- AgencyOS Live-steg / moderering / compliance (allerede V2-komponenter)

---

## Konklusjon

**Alle skjermer i PlayerHQ, AgencyOS, Forelder og Auth (produktflyt) er redesignet og kodet.**

Det som «gjenstår» er **akgolf.no marketing + stats** og noen **interne team-sider** — egen bølge, ikke samme jobb som spiller/coach-appen.
