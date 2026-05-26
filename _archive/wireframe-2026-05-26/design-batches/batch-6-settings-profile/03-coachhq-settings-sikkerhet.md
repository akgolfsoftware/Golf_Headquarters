# AK Golf Platform — CoachHQ — Sikkerhet

## Identitet

- **Produkt:** CoachHQ
- **URL:** `/admin/settings/sikkerhet`
- **Arketype:** F — Settings + profile (sikkerhets-variant)
- **Tier-gating:** Ikke relevant
- **HTML-referanse:** `wireframe/screen-deck/coachhq/settings-sikkerhet.html`
- **Audit:** `wireframe/audit/coachhq-settings-sikkerhet.md`
- **Tilhørende modaler:** `ChangePasswordModal`, `Setup2FAModal`, `RevokeSessionModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Sikkerhets-skjermen viser status på passord, to-faktor, aktive sesjoner og siste innloggings-aktivitet. Anders bruker denne når han mistenker at noen andre har logget inn, eller når han skal sette opp 2FA første gang. Skjermen er bevisst informasjons-tett — tillit kommer fra at man **ser** hva som skjer.

## Layout — UNIKT for denne skjermen

Bruker arketype-F-felles-spec med settings-sub-nav.

### Seksjon: Sikkerhets-status (kort-grid 2x2)

Hvert kort har et ikon, status-pill, og kort tekst:

1. **Passord** — `Lock`-ikon, status "Sterkt", "Endret 14. mars 2026 (58 dager siden)"
2. **To-faktor** — `Shield`-ikon, status "Aktiv (SMS)", "Anbefales: app-basert"
3. **Aktive sesjoner** — `Monitor`-ikon, status "3 enheter", "Siste innlogging: i dag 08:14"
4. **Siste sikkerhetshendelse** — `AlertCircle`-ikon, status "Ingen", "Kontoen virker trygg"

### Seksjon: Passord
| Felt | Default | Edit-mønster |
|---|---|---|
| Passord | "••••••••" | "Endre →" → `ChangePasswordModal` |
| Sist endret | "14. mars 2026" | Read-only |
| Foreslått neste endring | "Innen 15. september 2026" | Read-only |

### Seksjon: To-faktor (2FA)
- Currently aktiv: "SMS til +47 412 34 567"
- Knapp: "Bytt til app-basert (Authenticator)" → `Setup2FAModal`
- Knapp: "Slå av 2FA" (destructive, krever passord-bekreftelse)
- Backup-koder: "8 av 10 igjen — Generer nye →" (link)

### Seksjon: Aktive sesjoner (tabell)

| Enhet | Lokasjon | Sist aktiv | Aksjon |
|---|---|---|---|
| MacBook Pro M4 (Safari) — denne enheten | Fredrikstad, NO | Nå | "Denne" (badge) |
| iPhone 16 Pro (Safari) | Fredrikstad, NO | for 2 timer siden | "Logg ut →" |
| iPad Pro (Chrome) | Oslo, NO | for 3 dager siden | "Logg ut →" |

- "Logg ut alle andre enheter" — destructive-knapp under tabellen → `RevokeSessionModal`

### Seksjon: Innloggingshistorikk (siste 10)

Tabell med kolonner: Tidspunkt | Enhet | IP | Status (Vellykket / Mislykket / 2FA-feil)

Eksempel-rader:
- "10. mai 08:14" | "MacBook Pro" | "85.165.x.x" | Vellykket
- "10. mai 06:02" | "iPhone 16" | "85.165.x.x" | Vellykket
- "9. mai 22:11" | "iPad Pro" | "172.20.x.x" | Vellykket
- "5. mai 14:30" | "Ukjent (Windows)" | "194.10.x.x" | **Mislykket (feil passord)** — destructive-tekst

Lenke under: "Se all historikk →" (åpner audit-log)

### Farezone

- "Slett alle backup-koder" — destructive
- "Slett konto" — destructive (lenker til `/admin/settings/bruker`)

## Klikkbare elementer

UNIKT:

| Element | States |
|---|---|
| "Endre"-link passord | default, hover, klikk → `ChangePasswordModal` |
| "Bytt til app-basert" | default, hover, klikk → `Setup2FAModal` (QR-kode) |
| "Slå av 2FA" | default, hover (mørkere destructive), klikk → confirm-modal |
| "Generer nye backup-koder" | default, hover, klikk → modal med 10 koder, copy/download |
| "Logg ut" per sesjon | default, hover, klikk → toast "Sesjon logget ut" + rad fjernes |
| "Logg ut alle andre" | default, hover (destructive), klikk → `RevokeSessionModal` |
| Mislykket innlogging-rad | default, hover (destructive-tint bg), klikk → detalj-popover med IP/lokasjon |

## Empty / loading / error

Felles arketype-F + UNIKT:
- **2FA av:** Banner øverst "2FA er ikke aktivt. Anbefalt for coach-konti →" (warning)
- **Backup-koder brukt opp:** Rød inline "0 av 10 igjen — Generer nye nå"
- **Mistenkelig aktivitet:** Banner øverst i destructive "Vi oppdaget mislykket innlogging fra ukjent enhet 5. mai. Sjekk historikk →"

## Ønsket output fra Claude Design

1. Lyst tema, alt aktivt og trygt (default)
2. Mørkt tema
3. Mistenkelig-aktivitet-banner synlig
4. Hover på "Logg ut alle andre"
5. Innloggingshistorikk med 1 mislykket rad uthevet
6. Mobil ≤640px — kort-grid 1 kolonne, tabell blir kort-stack

## Ikke-mål

- Ikke designe `ChangePasswordModal`, `Setup2FAModal`, `RevokeSessionModal` (egen pakke 21)
- Ikke designe full audit-log (egen sub-skjerm i batch-7)
- Ikke designe SSO/SAML-konfig (Pro-feature, framtidig)

## Når du er ferdig

Lim design-link tilbake til Claude Code.
