# Audit: Auth — 2FA-oppsett

**HTML:** `screen-deck/auth/2fa-setup.html`
**URL:** `/auth/2fa`
**Antall klikkbare elementer:** 6

## Klikkbare elementer

| Element | Type | Mål | Eksisterer i tracker? |
|---|---|---|---|
| Manuell kode-felt (kopier på klikk) | State-change | Inline (clipboard copy) | OK |
| Verifikasjonskode-input (6 siffer) | State-change | Inline (auto-submit på 6 siffer mulig) | OK |
| "Bekreft og aktiver" CTA | Skjerm | `/admin/settings/security` (coachhq/settings-sikkerhet.html) | OK |
| "Hopp over for nå" link | Skjerm | `/admin/settings/security` | OK |
| "Trenger hjelp?" footer | Skjerm | `/help` | WIREFRAME_NEEDED |
| "Personvern" footer | Skjerm | `/personvern` | WIREFRAME_NEEDED |
| "Vilkår" footer | Skjerm | `/vilkar` | WIREFRAME_NEEDED |

> Mangler i wireframe: knapp "Kopier kode" eksplisitt, knapp "Bytt til SMS-2FA", knapp "Bruk recovery-koder i stedet". Steg-bar viser 1 av 3 men steg 2 og 3 er ikke definert (sannsynligvis: 2 = recovery-koder, 3 = bekreftelse).

## States som må designes

- Verifikasjonskode-validering: idle / 1–5 siffer / 6 siffer (auto-submit) / feil kode / kode utløpt
- "Bekreft" submit: idle / loading / success / error (feil kode, brukt kode)
- Steg-bar (3 steg): nåværende, gjort, kommende
- Manuell kode: hover for kopier, "kopiert!"-feedback
- QR-kode regenerer (om bruker mister tilgang) — bør ha "Generer ny QR"
- Skip-flow: bekreftelses-modal "Sikker på at du vil hoppe over?"
- Recovery-codes-skjerm (steg 2) — mangler
- Bekreftelses-skjerm (steg 3) — mangler
